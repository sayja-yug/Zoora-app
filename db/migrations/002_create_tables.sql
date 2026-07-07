-- ============================================================
-- Migration 002: Create all tables
-- Depends on: 001_create_enums.sql
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── users ──────────────────────────────────────────────────────────────────
-- Stores auth credentials for founders and investors.
-- Founders have exactly one startup_id; investors have NULL.
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  role           user_role NOT NULL DEFAULT 'founder',
  startup_id     UUID,               -- only set for founder role
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── startups ───────────────────────────────────────────────────────────────
-- One row per startup. profile_completeness_pct is recomputed by the
-- scoring engine every time Workflow C runs — do not update manually.
CREATE TABLE startups (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                     TEXT NOT NULL,
  stage                    TEXT NOT NULL,   -- e.g. 'pre-seed', 'seed', 'series-a'
  sector                   TEXT NOT NULL,   -- e.g. 'fintech', 'healthtech', 'saas'
  website                  TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  profile_completeness_pct NUMERIC(5,2) NOT NULL DEFAULT 0
    CHECK (profile_completeness_pct >= 0 AND profile_completeness_pct <= 100)
);

-- Add FK from users to startups (after startups exists)
ALTER TABLE users
  ADD CONSTRAINT fk_users_startup
  FOREIGN KEY (startup_id) REFERENCES startups(id) ON DELETE SET NULL;

-- ─── metrics ────────────────────────────────────────────────────────────────
-- Master config table. Never edited by founders or investors — only by
-- admins during schema migrations. ~100 rows, seeded in migration 004.
CREATE TABLE metrics (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,  -- machine-readable key, e.g. 'trl_level'
  category          metric_category NOT NULL,
  name              TEXT NOT NULL,
  description       TEXT,
  type              metric_type NOT NULL,
  weight            NUMERIC(6,2) NOT NULL CHECK (weight > 0),
  max_score         NUMERIC(5,2) NOT NULL DEFAULT 10
                    CHECK (max_score > 0 AND max_score <= 10),
  -- For qualitative metrics: rubric passed to Claude. Null for numeric/document.
  extraction_prompt TEXT,
  -- Optional: valid range for numeric metrics (null = no restriction)
  valid_min         NUMERIC,
  valid_max         NUMERIC,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_metrics_category ON metrics(category);
CREATE INDEX idx_metrics_type ON metrics(type);

-- ─── documents ──────────────────────────────────────────────────────────────
-- Uploaded files (pitch decks, LOIs, certifications, etc.)
-- parse_status tracks the async processing lifecycle.
CREATE TABLE documents (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id   UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  file_url     TEXT NOT NULL,     -- MinIO/S3 object key
  doc_type     TEXT NOT NULL,     -- e.g. 'pitch_deck', 'loi', 'iso_cert', 'financial_audit'
  uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by  UUID REFERENCES users(id),
  parsed_text  TEXT,              -- full extracted text from OCR/PDF parse
  parse_status parse_status NOT NULL DEFAULT 'pending',
  parse_error  TEXT,              -- error message if parse_status = 'failed'
  parsed_at    TIMESTAMPTZ        -- when parsing completed (success or failure)
);

CREATE INDEX idx_documents_startup_id ON documents(startup_id);
CREATE INDEX idx_documents_parse_status ON documents(parse_status);

-- ─── metric_values ──────────────────────────────────────────────────────────
-- SOURCE OF TRUTH. One row per (startup, metric). Updated by founders
-- directly (self_reported), or by the Claude extraction pipeline (llm_inferred),
-- or by document verification (verified_doc).
-- The scoring engine READS this table — it never writes to scores directly.
CREATE TABLE metric_values (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id         UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  metric_id          UUID NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  -- Raw value as stored (numeric values stored as text for flexibility)
  value              TEXT,
  -- Normalized score 0-10, computed at insert time
  score              NUMERIC(5,2) NOT NULL
                     CHECK (score >= 0 AND score <= 10),
  confidence_tag     confidence_tag NOT NULL DEFAULT 'self_reported',
  source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  -- LLM extraction audit trail (populated only for llm_inferred rows)
  llm_rationale      TEXT,
  model_confidence   model_confidence_level,
  llm_prompt_version TEXT,  -- version hash of the extraction prompt used
  -- Metadata
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by         UUID REFERENCES users(id),
  UNIQUE (startup_id, metric_id)  -- one current value per startup per metric
);

CREATE INDEX idx_metric_values_startup_id ON metric_values(startup_id);
CREATE INDEX idx_metric_values_metric_id ON metric_values(metric_id);
CREATE INDEX idx_metric_values_confidence ON metric_values(confidence_tag);

-- ─── scores ─────────────────────────────────────────────────────────────────
-- Derived CACHE. Written ONLY by the scoring engine (Workflow C / service role).
-- One row per (startup, category). Upserted on every scoring run.
-- No other process should INSERT or UPDATE this table.
CREATE TABLE scores (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id               UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  category                 metric_category NOT NULL,
  raw_score                NUMERIC(5,2) NOT NULL,      -- simple average of populated metric scores
  weighted_score           NUMERIC(5,2) NOT NULL,      -- weight-normalized score 0-10
  populated_metrics        INTEGER NOT NULL DEFAULT 0, -- how many metrics have a value
  total_metrics            INTEGER NOT NULL DEFAULT 0, -- total metrics in this category
  confidence_breakdown_json JSONB NOT NULL DEFAULT '{}',
  -- Example: {"verified_doc": 0.6, "llm_inferred": 0.3, "self_reported": 0.1}
  computed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (startup_id, category)
);

CREATE INDEX idx_scores_startup_id ON scores(startup_id);

-- Prevent any non-service connection from writing to scores.
-- The backend enforces this at the API level; this trigger is belt-and-suspenders.
-- It checks for a session variable set by the backend service role only.
CREATE OR REPLACE FUNCTION enforce_scores_service_write()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF current_setting('app.user_role', true) NOT IN ('service', '') THEN
    RAISE EXCEPTION 'Only the scoring service may write to the scores table. '
                    'Current role: %', current_setting('app.user_role', true);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_scores_service_only
  BEFORE INSERT OR UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION enforce_scores_service_write();

-- ─── score_history ──────────────────────────────────────────────────────────
-- Append-only audit log. Every time scores are recomputed, a new row is
-- inserted here. Never updated or deleted — this is the source for trend charts.
CREATE TABLE score_history (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id               UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  category                 metric_category NOT NULL,
  raw_score                NUMERIC(5,2) NOT NULL,
  weighted_score           NUMERIC(5,2) NOT NULL,
  populated_metrics        INTEGER NOT NULL DEFAULT 0,
  total_metrics            INTEGER NOT NULL DEFAULT 0,
  confidence_breakdown_json JSONB NOT NULL DEFAULT '{}',
  computed_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  triggered_by             TEXT  -- 'workflow_a', 'workflow_b', 'workflow_d_cron', etc.
);

CREATE INDEX idx_score_history_startup_id ON score_history(startup_id);
CREATE INDEX idx_score_history_computed_at ON score_history(computed_at DESC);

-- ─── Utility: updated_at auto-update trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_metric_values_updated_at
  BEFORE UPDATE ON metric_values
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
