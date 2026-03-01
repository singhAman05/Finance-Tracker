-- ============================================================
--  transactions.sql
--  Core financial event log. Every debit / credit lives here.
--
--  Foreign keys:
--    client_id   → clients(id)          [who owns it]
--    account_id  → accounts(id)         [which account was debited/credited]
--    category_id → system_categories(id)[what kind of transaction]
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE transactions (
  id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Owner
  client_id         UUID          NOT NULL
    REFERENCES clients(id) ON DELETE CASCADE,

  -- Source / destination account (SET NULL keeps history if account is deleted)
  account_id        UUID          NOT NULL
    REFERENCES accounts(id) ON DELETE SET NULL,

  -- Category from the global taxonomy
  category_id       UUID          NOT NULL
    REFERENCES system_categories(id) ON DELETE RESTRICT,

  -- Positive value always; 'type' decides direction
  amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),

  -- 'income' → money in, 'expense' → money out
  type              TEXT          NOT NULL
    CHECK (type IN ('income', 'expense')),

  -- Calendar date of the transaction (not the insert timestamp)
  date              DATE          NOT NULL,

  description       TEXT,

  -- Recurring transaction metadata
  is_recurring      BOOLEAN       NOT NULL DEFAULT false,
  recurrence_rule   TEXT,             -- e.g. 'FREQ=MONTHLY;INTERVAL=1' (iCal RRULE)

  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────

-- Used by every dashboard / report query — client + date range
CREATE INDEX idx_transactions_client_date
  ON transactions(client_id, date DESC);

-- Powers the monthly stats cards (income vs expense totals per month)
CREATE INDEX idx_transactions_client_type_date
  ON transactions(client_id, type, date DESC);

-- Used by budget progress queries (spending per category per period)
CREATE INDEX idx_transactions_client_category_date
  ON transactions(client_id, category_id, date);

-- Quick per-account history lookup
CREATE INDEX idx_transactions_account
  ON transactions(account_id, date DESC);

ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
