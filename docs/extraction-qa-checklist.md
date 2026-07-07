# Zoora — Claude Extraction QA Checklist

Use this checklist whenever you want to spot-check the quality of Claude's
metric extractions. Run it before any investor demo and whenever the model
or prompt changes.

---

## When to Run This

- Before first investor presentation
- After adding or changing any `extraction_prompt` in the metrics table
- Whenever Claude's model version is updated
- When a founder disputes a score

---

## Setup

1. Identify 5–10 representative uploaded documents (mix of pitch decks,
   LOIs, certifications, and financial audits).
2. Run them through Workflow B manually via the n8n UI.
3. Open the `metric_values` table filtered by `startup_id` and
   `confidence_tag = 'llm_inferred'` for the relevant startup.
4. For each document below, manually read it and score the relevant metrics
   yourself — then compare against Claude's output.

---

## Document QA Template

Copy this block for each document you're evaluating.

```
DOCUMENT: <filename or doc_type>
STARTUP:  <startup name>
DATE EVALUATED: <today's date>
EVALUATOR: <your name>

| Metric Slug              | Your Score | Claude Score | Claude Confidence | Rationale Quality | Verdict    |
|--------------------------|-----------|--------------|------------------|-------------------|------------|
| tech_differentiation     |           |              |                  |                   | ✓/Drift/? |
| founder_technical_depth  |           |              |                  |                   |           |
| market_timing            |           |              |                  |                   |           |
| competitive_moat_clarity |           |              |                  |                   |           |
| gtm_realism              |           |              |                  |                   |           |
| hype_substance_gap       |           |              |                  |                   |           |
| team_cohesion            |           |              |                  |                   |           |
| product_vision           |           |              |                  |                   |           |
| regulatory_compliance_risk|          |              |                  |                   |           |
| traction_storytelling    |           |              |                  |                   |           |

NOTES:
_____________________________________________

OVERALL VERDICT (pass / minor drift / major drift):
```

---

## Scoring the Verdict Column

| Verdict | Meaning |
|---|---|
| `✓ Match` | Claude's score within ±1.5 of yours, rationale cites real text |
| `Drift` | Claude's score off by >1.5, or rationale is vague/hallucinated |
| `?` | You're unsure; flag for second human review |

---

## What Counts as Good Rationale Quality?

Rate 1–5:

| Score | Meaning |
|---|---|
| 5 | Cites a specific sentence/number from the document that directly justifies the score |
| 4 | References the right section but slightly imprecise |
| 3 | Correct general area but vague |
| 2 | Tangentially related; not strong justification |
| 1 | Hallucinated or factually wrong |

**Flag anything rated ≤2 for rubric review.**

---

## Common Failure Modes to Watch For

### 1. Anchor drift
Claude anchors on the highest-scoring paragraph and ignores contradictory
evidence elsewhere. Fix: add "Consider the full document, not just
the most optimistic section" to the extraction prompt.

### 2. Confidence inflation
Claude returns `model_confidence: "high"` even for scores where the
document barely mentions the topic. Check: if `model_confidence = high`
but the document has <2 sentences on the topic, flag it.

### 3. Length bias
Longer pitch decks score higher simply because there's more content.
Fix: ensure rubrics say "score based on quality, not quantity of claims."

### 4. Self-referential scoring
Claude repeats the startup's own claims as rationale without critically
evaluating them. Good rationale should assess the claim, not just quote it.

### 5. Missing metric
Claude returns a valid JSON but omits a metric slug entirely. Check:
after every extraction run, confirm all expected metric slugs appear in
`metric_values` for the startup. Missing entries will default to 0 in
the scoring engine.

---

## Rubric Calibration Exercises

Run these 2× per year to re-calibrate:

1. **Blind scoring:** Have 2 team members independently score the same
   document on 5 qualitative metrics, then compare to Claude's output.
   If human disagreement > Claude disagreement, the rubric is ambiguous.

2. **Extreme example test:** Feed Claude a document that is clearly a
   10 (e.g. a Series A company with strong traction) and one that is
   clearly a 2 (pre-revenue, no tech). Check that Claude produces
   scores ≥8 and ≤3 respectively.

3. **Adversarial test:** Feed a document with false but plausible claims.
   Confirm that Claude does NOT verify external claims — it should score
   based on what's in the document, not reality.

---

## Thresholds for Action

| Finding | Action |
|---|---|
| Drift rate ≥20% on any single metric | Rewrite that metric's `extraction_prompt` rubric |
| Average rationale quality ≤3 across a doc type | Add a doc-type-specific prefix to the prompt |
| `model_confidence = high` with rationale score ≤2 | Add "only use high confidence if you found specific data" to prompt |
| Claude omits ≥3 metric slugs consistently | Debug the JSON parsing node; check for prompt truncation |

---

## Logging Your QA Results

Store completed QA checklists in `docs/qa-logs/YYYY-MM-DD.md`.
Include the n8n execution ID so you can trace back to the exact
workflow run if needed.
