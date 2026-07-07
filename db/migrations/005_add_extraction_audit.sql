-- ============================================================
-- Migration 005: Add LLM extraction audit columns to metric_values
-- Depends on: 002_create_tables.sql, 001_create_enums.sql
-- ============================================================
-- These columns are already included in migration 002 as of the
-- final schema design. This file exists as an explicit migration
-- so the Phase 4 build step is self-documenting and re-runnable
-- on existing databases that were created before Phase 4.

-- Add columns only if they don't already exist (idempotent)

ALTER TABLE metric_values
  ADD COLUMN IF NOT EXISTS llm_rationale      TEXT,
  ADD COLUMN IF NOT EXISTS model_confidence   model_confidence_level,
  ADD COLUMN IF NOT EXISTS llm_prompt_version TEXT;

-- Add parse_error to documents if missing (also idempotent)
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS parse_error TEXT,
  ADD COLUMN IF NOT EXISTS parsed_at   TIMESTAMPTZ;

-- Index to quickly find all metric_values that were llm_inferred
-- (useful for audit queries and the dispute-resolution flow)
CREATE INDEX IF NOT EXISTS idx_mv_llm_inferred
  ON metric_values(startup_id, confidence_tag)
  WHERE confidence_tag = 'llm_inferred';

-- Index to find all metric_values for a given source document
CREATE INDEX IF NOT EXISTS idx_mv_source_doc
  ON metric_values(source_document_id)
  WHERE source_document_id IS NOT NULL;

COMMENT ON COLUMN metric_values.llm_rationale IS
  'One-sentence rationale from Claude citing what in the source document supports the score. Never discard.';

COMMENT ON COLUMN metric_values.model_confidence IS
  'Self-reported Claude confidence: high/medium/low. Used to flag scores that warrant human review.';

COMMENT ON COLUMN metric_values.llm_prompt_version IS
  'SHA-1 hash of the extraction_prompt used. Enables rubric drift detection over time.';
