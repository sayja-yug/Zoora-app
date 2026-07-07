-- db/init/00_create_n8n_db.sql
-- Runs once via docker-entrypoint-initdb.d to create the n8n database
-- (n8n needs its own DB separate from zoora)

CREATE DATABASE n8n;
