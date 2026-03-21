-- ============================================================
--  accounts.sql
--  One client can have many accounts.
--  Referenced by: transactions, bills
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE accounts (
  id                      UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Owner — cascade delete removes all accounts when client is deleted
  client_id               UUID          NOT NULL
    REFERENCES clients(id) ON DELETE CASCADE,

  account_holder_name     TEXT          NOT NULL,
  bank_name               TEXT          NOT NULL,

  account_type            TEXT          NOT NULL
    CHECK (account_type IN (
      'savings',
      'current',
      'digital_wallet',
      'loan',
      'credit_card',
      'cash',
      'investment'
    )),

  -- Only the last 4 digits are stored for security
  account_number_last4    CHAR(4),

  -- Running balance kept in sync by the transaction service
  balance                 NUMERIC(12,2) NOT NULL DEFAULT 0.00,

  currency                TEXT          NOT NULL DEFAULT 'INR',

  status                  TEXT          NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive')),

  -- ── Recurring Credit / Debit Config ──────────────────────
  -- When is_recurring = true, the system auto-posts a transaction
  -- to this account on recurring_day_of_month every recurring_frequency.
  -- Example: salary of ₹50,000 credited on the 1st of every month.

  is_recurring            BOOLEAN       NOT NULL DEFAULT false,

  recurring_amount        NUMERIC(12,2)
    CHECK (recurring_amount IS NULL OR recurring_amount > 0),

  recurring_type          TEXT
    CHECK (recurring_type IN ('income', 'expense')),

  recurring_category_id   UUID
    REFERENCES system_categories(id) ON DELETE SET NULL,

  -- Which day of the month to post (1–28 to safely handle all months)
  recurring_day_of_month  INT           DEFAULT 1
    CHECK (recurring_day_of_month BETWEEN 1 AND 28),

  recurring_frequency     TEXT          DEFAULT 'monthly'
    CHECK (recurring_frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),

  recurring_description   TEXT,

  -- Set after each successful auto-post; used to prevent double-posting
  recurring_last_posted   DATE,

  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────
-- Used on every transaction / bill query that joins back to accounts
CREATE INDEX idx_accounts_client ON accounts(client_id);

-- Quickly fetch only active accounts for a client
CREATE INDEX idx_accounts_client_status ON accounts(client_id, status);

-- Used by the recurring processor to quickly find due accounts
CREATE INDEX idx_accounts_recurring ON accounts(client_id, is_recurring)
  WHERE is_recurring = true;

ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;


