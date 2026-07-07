# Zoora — n8n Endpoint Reference

## Overview

All n8n workflows call the Zoora backend API at `$env.ZOORA_API_URL` using `$env.SERVICE_API_KEY` in the `x-service-api-key` header. No JWT is used for workflow-to-API communication.

Set these environment variables in your n8n container:
- `ZOORA_API_URL` = `http://backend:3000`
- `SERVICE_API_KEY` = your `SERVICE_API_KEY` from `.env`
- `ANTHROPIC_API_KEY` = your Claude API key
- `WORKFLOW_C_ID` = the n8n internal ID of Workflow C (set after importing)

---

## Endpoints

### `POST /api/metric-values/upsert`

**Used by:** Workflow A (direct intake), Workflow B (LLM extraction)

**Auth:** `x-service-api-key` header

**Request body:**
```json
{
  "startup_id":         "uuid",
  "metric_id":          "uuid",
  "value":              "string (all values stored as text)",
  "score":              7.5,
  "confidence_tag":     "self_reported | llm_inferred | verified_doc",
  "source_document_id": "uuid (optional, for llm_inferred rows)",
  "llm_rationale":      "string (optional, Claude's reasoning)",
  "model_confidence":   "high | medium | low (optional)",
  "llm_prompt_version": "string (optional, hash of prompt used)"
}
```

**Response `200`:**
```json
{
  "metric_value": { "id": "uuid", "startup_id": "...", "score": 7.5, ... }
}
```

**Errors:**
- `400` — validation failure (missing fields, wrong type, out of range)
- `403` — startup_id doesn't match caller's permissions

---

### `GET /api/metric-values/:startupId`

**Used by:** Workflow B (to get all metrics for building the Claude prompt)

**Auth:** `x-service-api-key`

**Response `200`:**
```json
{
  "metric_values": [{ "metric_id": "...", "score": 6, "confidence_tag": "self_reported", ... }],
  "all_metrics": [{ "id": "...", "slug": "trl_level", "category": "tech", "type": "numeric", "weight": 8, ... }]
}
```

---

### `POST /api/documents`

**Used by:** Founders via frontend (JWT), Workflow B (service key)

**Auth:** JWT (founders) or `x-service-api-key`

**Request body:**
```json
{
  "startup_id":    "uuid",
  "doc_type":      "pitch_deck | loi | financial_audit | iso_cert | ...",
  "filename":      "deck-v3.pdf",
  "content_type":  "application/pdf"
}
```

**Response `201`:**
```json
{
  "document": { "id": "uuid", "parse_status": "pending", ... },
  "upload_url": "https://minio.../presigned-url",
  "object_key": "startup-id/pitch_deck/1720000000_deck.pdf"
}
```

The caller uploads the file directly to `upload_url` (PUT request, no API involvement).

---

### `PATCH /api/documents/:id/parse-result`

**Used by:** Workflow B (after parsing succeeds or fails)

**Auth:** `x-service-api-key`

**Request body:**
```json
{
  "parse_status": "parsed | failed",
  "parsed_text":  "full extracted text (for parsed)",
  "parse_error":  "error message (for failed)"
}
```

**Response `200`:** updated document row.

---

### `GET /api/documents/:id/download-url`

**Used by:** Workflow B (to fetch the file for parsing)

**Auth:** `x-service-api-key`

**Response `200`:**
```json
{ "download_url": "https://minio.../presigned-download-url", "object_key": "..." }
```

---

### `GET /api/startups/:id/scoring-data`

**Used by:** Workflow C (scoring engine input)

**Auth:** `x-service-api-key`

**Response `200`:**
```json
{
  "startup_id": "uuid",
  "metric_values": [{ "metric_id": "...", "score": 7, "confidence_tag": "...", "category": "tech", "weight": 8 }],
  "all_metrics": [{ "id": "...", "category": "tech", "weight": 8, "max_score": 10 }]
}
```

---

### `GET /api/startups`

**Used by:** Workflow D (to get all startup IDs for re-scoring), frontend leaderboard

**Auth:** `x-service-api-key` or investor JWT

**Response `200`:**
```json
{
  "startups": [{
    "id": "uuid", "name": "Acme AI", "stage": "seed", "sector": "fintech",
    "profile_completeness_pct": 42,
    "total_weighted_score": 6.74,
    "last_scored_at": "2025-01-15T03:00:00Z",
    "category_scores": {
      "tech": { "weighted_score": 7.2, "confidence_breakdown": { "verified_doc": 0.6, ... }, ... }
    }
  }]
}
```

---

### `POST /api/scores`

**Used by:** Workflow C only.

**Auth:** `x-service-api-key`

**Request body:**
```json
{
  "profile_completeness_pct": 58.5,
  "scores": [{
    "startup_id":    "uuid",
    "category":      "tech",
    "raw_score":     6.8,
    "weighted_score": 7.1,
    "populated_metrics": 14,
    "total_metrics": 20,
    "confidence_breakdown": { "verified_doc": 0.5, "llm_inferred": 0.3, "self_reported": 0.2 },
    "triggered_by":  "workflow_a"
  }]
}
```

**Response `200`:**
```json
{ "scores": [...], "history_appended": 6 }
```

Writes to both `scores` (upsert) and `score_history` (append-only) in a single transaction.

---

## Workflow Trigger Summary

| Workflow | Trigger | What it does |
|---|---|---|
| A | `POST /intake/metric` webhook | Validates + upserts one metric_value → triggers C |
| B | `POST /intake/document` webhook | Parses file + Claude extraction → triggers C |
| C | Execute Workflow trigger from A or B | Runs scoring engine → writes scores/history |
| D | Monthly cron (1st, 03:00) | Loops all startups → triggers C for each |
