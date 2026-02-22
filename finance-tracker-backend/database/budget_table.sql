CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE budget_period_type AS ENUM (
  'weekly',
  'monthly',
  'quarterly',
  'yearly',
  'custom'
);

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  client_id UUID NOT NULL
    REFERENCES clients(id) ON DELETE CASCADE,

  category_id UUID NOT NULL
    REFERENCES system_categories(id) ON DELETE CASCADE,

  name VARCHAR(255),

  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),

  period_type budget_period_type NOT NULL,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,

  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CHECK (end_date > start_date)
);

ALTER TABLE budgets
ADD CONSTRAINT no_overlapping_category_budgets
EXCLUDE USING gist (
  client_id WITH =,
  category_id WITH =,
  daterange(start_date, end_date, '[]') WITH &&
);

CREATE INDEX idx_budgets_client
ON budgets(client_id);

CREATE INDEX idx_budgets_client_category
ON budgets(client_id, category_id);

CREATE INDEX idx_budgets_date_range
ON budgets(client_id, start_date, end_date);

CREATE INDEX idx_transactions_budget_lookup
ON transactions(client_id, category_id, date);
