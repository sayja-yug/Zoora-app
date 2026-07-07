-- ============================================================
-- Migration 003: Row-Level Security Policies
-- Depends on: 002_create_tables.sql
-- ============================================================
--
-- HOW THIS WORKS (without Supabase magic):
-- The Node.js backend sets two Postgres session variables at the
-- start of every transaction:
--
--   SET LOCAL app.user_id   = '<uuid>';
--   SET LOCAL app.user_role = 'founder' | 'investor' | 'service';
--   SET LOCAL app.startup_id = '<uuid>';   -- founders only
--
-- RLS policies read these via current_setting('app.user_role', true).
-- The 'true' flag means "return null if not set" (safe default = deny).
-- The service role bypasses RLS on scores/score_history.
-- ============================================================

-- Enable RLS on tables that need it
ALTER TABLE startups         ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics          ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents        ENABLE ROW LEVEL SECURITY;
ALTER TABLE metric_values    ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores           ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_history    ENABLE ROW LEVEL SECURITY;

-- Helper: is the current session a service role?
CREATE OR REPLACE FUNCTION is_service()
RETURNS BOOLEAN LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN current_setting('app.user_role', true) = 'service';
END;
$$;

-- Helper: is the current session an investor?
CREATE OR REPLACE FUNCTION is_investor()
RETURNS BOOLEAN LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN current_setting('app.user_role', true) = 'investor';
END;
$$;

-- Helper: is the current session a founder, and does this row
-- belong to their startup?
CREATE OR REPLACE FUNCTION is_own_startup(row_startup_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN current_setting('app.user_role', true) = 'founder'
    AND current_setting('app.startup_id', true)::UUID = row_startup_id;
END;
$$;

-- ─── startups ────────────────────────────────────────────────────────────────
-- Investors: read all startups (for leaderboard)
-- Founders: read only their own startup
-- Service: full access
CREATE POLICY startups_read ON startups FOR SELECT
  USING (
    is_service()
    OR is_investor()
    OR is_own_startup(id)
  );

CREATE POLICY startups_write_founder ON startups FOR UPDATE
  USING (is_own_startup(id));

CREATE POLICY startups_service_all ON startups FOR ALL
  USING (is_service());

-- ─── metrics ─────────────────────────────────────────────────────────────────
-- Everyone can read the metrics master config (it's not sensitive)
-- Only service can modify (should be done via migration, never at runtime)
CREATE POLICY metrics_read_all ON metrics FOR SELECT
  USING (
    is_service()
    OR is_investor()
    OR current_setting('app.user_role', true) = 'founder'
  );

CREATE POLICY metrics_service_write ON metrics FOR ALL
  USING (is_service());

-- ─── documents ───────────────────────────────────────────────────────────────
-- Founders: read/write only their own startup's documents
-- Investors: NO access to raw documents (privacy boundary)
-- Service: full access
CREATE POLICY documents_founder_own ON documents FOR ALL
  USING (is_own_startup(startup_id))
  WITH CHECK (is_own_startup(startup_id));

CREATE POLICY documents_service_all ON documents FOR ALL
  USING (is_service());

-- ─── metric_values ───────────────────────────────────────────────────────────
-- Founders: read/write only their own startup's metric_values
-- Investors: NO access to raw metric values (only aggregated scores)
-- Service: full access
CREATE POLICY metric_values_founder_own ON metric_values FOR ALL
  USING (is_own_startup(startup_id))
  WITH CHECK (is_own_startup(startup_id));

CREATE POLICY metric_values_service_all ON metric_values FOR ALL
  USING (is_service());

-- ─── scores ──────────────────────────────────────────────────────────────────
-- Investors and founders: read-only
-- Service: full access (scoring engine writes here)
CREATE POLICY scores_read ON scores FOR SELECT
  USING (
    is_service()
    OR is_investor()
    OR is_own_startup(startup_id)
  );

CREATE POLICY scores_service_write ON scores FOR ALL
  USING (is_service());

-- ─── score_history ───────────────────────────────────────────────────────────
-- Same as scores
CREATE POLICY score_history_read ON score_history FOR SELECT
  USING (
    is_service()
    OR is_investor()
    OR is_own_startup(startup_id)
  );

CREATE POLICY score_history_service_write ON score_history FOR ALL
  USING (is_service());
