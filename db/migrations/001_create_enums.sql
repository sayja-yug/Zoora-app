-- ============================================================
-- Migration 001: Create all Postgres ENUMs
-- Run order: first (no dependencies)
-- ============================================================

-- Category of a metric (matches the 6 scorecard pillars)
CREATE TYPE metric_category AS ENUM (
  'tech',    -- Technology & R&D
  'certs',   -- Certifications & Compliance
  'market',  -- Market Traction
  'future',  -- Future Readiness
  'team',    -- Team & Leadership
  'risk'     -- Risk Deductions
);

-- How a metric value is collected
CREATE TYPE metric_type AS ENUM (
  'numeric',      -- Founder enters a number directly
  'document',     -- Value is extracted / verified from an uploaded file
  'qualitative'   -- Free text or LLM-extracted narrative, scored 0-10
);

-- How confident we are in a given metric_value
CREATE TYPE confidence_tag AS ENUM (
  'verified_doc',  -- Backed by a parsed & validated document
  'llm_inferred',  -- Scored by Claude from a document excerpt
  'self_reported'  -- Founder typed it in directly, unverified
);

-- Document parsing lifecycle
CREATE TYPE parse_status AS ENUM (
  'pending',  -- Uploaded, not yet processed
  'parsed',   -- Successfully extracted text
  'failed'    -- Extraction failed (error stored separately)
);

-- User roles in the system
CREATE TYPE user_role AS ENUM (
  'founder',   -- Can submit their own startup's data
  'investor',  -- Read-only view of scores and metadata
  'service'    -- Internal service account (scoring engine, n8n)
);

-- Model confidence from Claude extraction
CREATE TYPE model_confidence_level AS ENUM ('high', 'medium', 'low');
