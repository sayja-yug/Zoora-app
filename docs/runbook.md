# Zoora Operations Runbook

## Quick Reference

| Problem | Section |
|---|---|
| A score looks wrong | [§1 Score Looks Wrong](#1-score-looks-wrong) |
| Re-trigger scoring for one startup | [§2 Manual Re-scoring](#2-manual-re-scoring) |
| Document stuck at parse_status = failed | [§3 Stuck Documents](#3-stuck-documents) |
| Roll back a bad extraction | [§4 Roll Back Bad Extraction](#4-roll-back-bad-extraction) |
| n8n alert: document failed for >2h | [§5 Document Failure Alert](#5-document-failure-alert) |

---

## 1. Score Looks Wrong

A founder or investor disputes a category score.

### Step 1: Identify which metric is driving the bad score

```sql
-- Find all metric_values for this startup, ordered by impact on score
SELECT
  m.slug, m.name, m.category, m.weight,
  mv.score, mv.confidence_tag, mv.llm_rationale, mv.model_confidence,
  mv.source_document_id, mv.updated_at
FROM metric_values mv
JOIN metrics m ON m.id = mv.metric_id
WHERE mv.startup_id = '<startup_uuid>'
  AND m.category = '<disputed_category>'
ORDER BY m.weight DESC;
```

### Step 2: Check the audit trail for LLM-inferred rows

```sql
-- See the exact rationale Claude used
SELECT
  m.slug, mv.score, mv.llm_rationale,
  mv.model_confidence, mv.llm_prompt_version,
  d.file_url, d.doc_type, d.parsed_at,
  mv.updated_at
FROM metric_values mv
JOIN metrics m ON m.id = mv.metric_id
LEFT JOIN documents d ON d.id = mv.source_document_id
WHERE mv.startup_id = '<startup_uuid>'
  AND mv.confidence_tag = 'llm_inferred'
ORDER BY m.category, m.weight DESC;
```

### Step 3: Review the source document

1. Get the document's `file_url` from the query above.
2. Generate a download URL:
   ```bash
   curl -H "x-service-api-key: $SERVICE_API_KEY" \
        http://localhost:3000/api/documents/<document_id>/download-url
   ```
3. Download and read the actual document. Compare Claude's rationale to
   what you see. Did Claude mis-score? Is the rubric ambiguous?

### Step 4: Decide

- **Score is correct but founder disagrees:** Explain the rubric.
- **Claude mis-scored:** Delete the row and re-run extraction (see §4).
- **Rubric is unclear:** Update `metrics.extraction_prompt` for that metric,
  then re-run extraction for all affected startups.

---

## 2. Manual Re-scoring

To re-run Workflow C for a single startup without waiting for the cron:

### Via n8n UI

1. Open n8n → **Workflow C — Scoring Aggregator**
2. Click **Execute Workflow**
3. In the input parameters, set:
   ```json
   { "startup_id": "your-startup-uuid", "triggered_by": "manual" }
   ```
4. Click **Run Now**

### Via API (curl)

```bash
# POST to n8n's workflow webhook if you set one up, or use the internal API
# Better: call Workflow A with a dummy metric to trigger re-scoring
curl -X POST http://localhost:5678/webhook/intake/metric \
  -H "Content-Type: application/json" \
  -d '{
    "startup_id": "your-startup-uuid",
    "metric_id": "any-valid-metric-uuid",
    "value": "unchanged-value"
  }'
```

### Via Postgres (direct score recompute trigger)

For emergencies when n8n is unavailable, you can manually compute and
insert scores by running the scoring engine directly:

```bash
cd zoora/scoring
npm test  # verify the engine still works
# Then call the backend /api/scores endpoint directly with computed values
```

---

## 3. Stuck Documents

### Find all documents stuck at pending or failed

```sql
-- Documents pending for more than 30 minutes
SELECT id, startup_id, doc_type, file_url, uploaded_at, parse_error
FROM documents
WHERE parse_status = 'pending'
  AND uploaded_at < NOW() - INTERVAL '30 minutes'
ORDER BY uploaded_at;

-- All failed documents
SELECT id, startup_id, doc_type, parse_error, parsed_at
FROM documents
WHERE parse_status = 'failed'
ORDER BY parsed_at DESC NULLS LAST;
```

### Reset a document to pending and re-trigger Workflow B

```sql
-- Reset parse status
UPDATE documents
SET parse_status = 'pending', parse_error = NULL, parsed_at = NULL, parsed_text = NULL
WHERE id = '<document_uuid>';
```

Then trigger Workflow B manually in n8n with:
```json
{ "document_id": "the-document-uuid", "startup_id": "startup-uuid", "doc_type": "pitch_deck" }
```

### Common causes of parse failures

| Error message | Fix |
|---|---|
| `No binary data received` | File was never uploaded to MinIO; ask founder to re-upload |
| `Failed to parse file: Invalid PDF` | Corrupt PDF; ask founder for a different export |
| `Claude API error (rate_limit)` | Retry in 60 seconds; Workflow B has retry logic built in |
| `Failed to parse Claude JSON` | Claude returned non-JSON; check the prompt for truncation |
| `Timeout` | File is too large (>50MB); compress and re-upload |

---

## 4. Roll Back a Bad Extraction

If a Claude extraction produced obviously wrong scores for a startup:

### Step 1: Delete the bad metric_values

```sql
-- Find all llm_inferred rows from this document
SELECT id, metric_id FROM metric_values
WHERE source_document_id = '<document_uuid>'
  AND confidence_tag = 'llm_inferred';

-- Delete them
DELETE FROM metric_values
WHERE source_document_id = '<document_uuid>'
  AND confidence_tag = 'llm_inferred';
```

### Step 2: Mark the document as pending again

```sql
UPDATE documents
SET parse_status = 'pending', parse_error = NULL, parsed_text = NULL, parsed_at = NULL
WHERE id = '<document_uuid>';
```

### Step 3: (Optional) Fix the rubric

If the problem is in the prompt, update `extraction_prompt` in the metrics
table before re-running:

```sql
UPDATE metrics
SET extraction_prompt = 'Your corrected rubric here...'
WHERE slug = 'metric_slug_name';
```

### Step 4: Re-trigger Workflow B

Via n8n UI: run Workflow B with `{ document_id, startup_id, doc_type }`.

### Step 5: Verify

Check that new `metric_values` rows appear with correct scores and
`llm_rationale` makes sense. Then trigger Workflow C to recompute the
category scores.

---

## 5. Document Failure Alert

If n8n sends you a Slack/email alert that a document has been in
`parse_status = failed` for >2 hours:

1. **Check the parse_error** (see §3 for the SQL query).
2. **Is it a transient error?** (rate limit, timeout) → reset to pending, retry.
3. **Is it a file format issue?** → contact the founder for a re-upload.
4. **Is it a Claude issue?** → check Anthropic status page at status.anthropic.com.
5. **Multiple documents failing?** → check if n8n is running (`docker ps`) and
   if the backend API is healthy (`curl http://localhost:3000/health`).

### Silence a false alarm

If the failure is expected (e.g. you're intentionally not processing
a document yet):

```sql
UPDATE documents
SET parse_status = 'failed',
    parse_error = 'Intentionally deferred — pending manual review'
WHERE id = '<document_uuid>';
```

---

## Useful SQL Snippets

```sql
-- Leaderboard snapshot
SELECT s.name, s.profile_completeness_pct,
       sc.category, sc.weighted_score, sc.confidence_breakdown_json
FROM startups s JOIN scores sc ON sc.startup_id = s.id
ORDER BY s.name, sc.category;

-- Score history for one startup
SELECT category, weighted_score, computed_at, triggered_by
FROM score_history
WHERE startup_id = '<uuid>'
ORDER BY computed_at DESC LIMIT 50;

-- Find all self-reported metrics for a startup (no document backing)
SELECT m.name, mv.score, mv.value, mv.updated_at
FROM metric_values mv JOIN metrics m ON m.id = mv.metric_id
WHERE mv.startup_id = '<uuid>'
  AND mv.confidence_tag = 'self_reported'
ORDER BY m.weight DESC;
```
