# Zoora Database — README

## Tables at a Glance

| Table | Role | Who writes? |
|---|---|---|
| `users` | Auth credentials + role + startup assignment | Backend auth routes |
| `startups` | One row per startup | Backend (admin creates); founders update profile fields |
| `metrics` | Master config of 100 metrics — never modified at runtime | Migration files only |
| `metric_values` | **Source of truth** — one row per (startup, metric) | Founders (self_reported) or n8n/Claude (llm_inferred/verified_doc) |
| `documents` | Uploaded files + parse lifecycle | Founders upload; n8n parsing pipeline writes `parsed_text` + `parse_status` |
| `scores` | Derived cache of category scores — **service role only** | Scoring engine (Workflow C) |
| `score_history` | Append-only audit log of every score computation | Scoring engine (Workflow C) |

## Running Migrations

### Prerequisites
- Docker + Docker Compose installed
- Copy `.env.example` to `.env` and fill in all values

### 1. Start Postgres

```bash
docker-compose up -d postgres
```

Wait ~10 seconds for Postgres to initialize, then:

### 2. Run all migrations in order

```bash
# From the zoora/ root directory
for f in db/migrations/*.sql; do
  echo "▶ Running $f"
  docker-compose exec -T postgres \
    psql -U zoora_admin -d zoora -f /dev/stdin < "$f"
done
```

On Windows (PowerShell):
```powershell
Get-ChildItem db\migrations\*.sql | Sort-Object Name | ForEach-Object {
  Write-Host "Running $($_.Name)"
  Get-Content $_.FullName | docker-compose exec -T postgres psql -U zoora_admin -d zoora
}
```

### 3. Verify the seed

```bash
docker-compose exec postgres psql -U zoora_admin -d zoora \
  -c "SELECT category, COUNT(*) FROM metrics GROUP BY category ORDER BY category;"
```

Expected output:
```
 category | count
----------+-------
 certs    |    15
 future   |    15
 market   |    20
 risk     |    15
 team     |    15
 tech     |    20
(6 rows)
```

## Re-running Migrations (Reset)

To drop everything and start fresh:

```bash
docker-compose exec postgres psql -U zoora_admin -d zoora \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
# Then re-run all migrations
```

## Row-Level Security Notes

All tables (except `users`) have RLS enabled. The backend sets these
session variables at the start of every transaction:

```sql
SET LOCAL app.user_id    = '<uuid>';
SET LOCAL app.user_role  = 'founder' | 'investor' | 'service';
SET LOCAL app.startup_id = '<uuid>';  -- founders only
```

The service role (used by the scoring engine and n8n) bypasses all
founder/investor restrictions. It authenticates via the `SERVICE_API_KEY`
header in the backend API, which never reaches the frontend.

## Category Weights (used by scoring engine)

| Category | Weight | Rationale |
|---|---|---|
| market | 28% | Traction is the primary signal of product-market fit |
| tech | 22% | Core IP and technical depth |
| team | 15% | Execution capability |
| future | 15% | Long-term optionality |
| certs | 10% | Compliance reduces investor risk |
| risk | 10% | Risk deductions cap the total |

These weights live in `scoring/scoring-engine.ts` and can be adjusted
without a database migration.
