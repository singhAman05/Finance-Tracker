-- ============================================================
--  clients.sql
--  Root user table. All other tables reference this via client_id.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE clients (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Auth / identity
  email         TEXT          NOT NULL UNIQUE,
  full_name     TEXT          NOT NULL,

  -- Optional profile enrichment
  profession    TEXT,
  avatar_url    TEXT,

  -- Onboarding gate — set to TRUE once user finishes setup wizard
  profile_completed BOOLEAN   NOT NULL DEFAULT false,

  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Automatically keep updated_at current
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Fast lookup by email (used during auth)
CREATE UNIQUE INDEX idx_clients_email ON clients(email);

ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
