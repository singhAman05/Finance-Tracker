-- =============================================================================
-- Finance Tracker — Complete Database Schema
-- Single migration file for a clean Supabase project.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Shared utility trigger function
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =============================================================================
-- 1. CLIENTS
-- =============================================================================
CREATE TABLE clients (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  email             TEXT        UNIQUE,
  phone             TEXT        UNIQUE,
  full_name         TEXT        NOT NULL DEFAULT '',
  profession        TEXT,
  avatar_url        TEXT,
  profile_complete  BOOLEAN     NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT clients_contact_check CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE UNIQUE INDEX idx_clients_email ON clients (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX idx_clients_phone ON clients (phone) WHERE phone IS NOT NULL;

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY clients_self_select ON clients FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY clients_self_update ON clients FOR UPDATE USING (auth.uid()::text = id::text);

-- =============================================================================
-- 2. CLIENT_SETTINGS
-- =============================================================================
CREATE TABLE client_settings (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id         UUID        NOT NULL UNIQUE REFERENCES clients (id) ON DELETE CASCADE,
  currency          TEXT        NOT NULL DEFAULT 'INR'
                              CHECK (currency IN ('INR','USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','SGD','AED','SAR')),
  date_format       TEXT        NOT NULL DEFAULT 'DD/MM/YYYY'
                              CHECK (date_format IN ('DD/MM/YYYY','MM/DD/YYYY','YYYY-MM-DD','DD-MM-YYYY','DD.MM.YYYY')),
  notify_bills      BOOLEAN     NOT NULL DEFAULT true,
  notify_budgets    BOOLEAN     NOT NULL DEFAULT true,
  notify_recurring  BOOLEAN     NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_client_settings_updated_at
  BEFORE UPDATE ON client_settings
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

ALTER TABLE client_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY settings_owner ON client_settings
  USING (client_id = (SELECT id FROM clients WHERE id::text = auth.uid()::text));

-- =============================================================================
-- 3. SYSTEM_CATEGORIES
-- =============================================================================
CREATE TABLE system_categories (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        VARCHAR(100)  NOT NULL UNIQUE,
  type        TEXT          NOT NULL CHECK (type IN ('income','expense')),
  color       VARCHAR(20),
  icon        VARCHAR(100),
  sort_order  SMALLINT      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_syscat_type ON system_categories (type);

ALTER TABLE system_categories DISABLE ROW LEVEL SECURITY;

INSERT INTO system_categories (name, type, color, icon, sort_order) VALUES
  ('Salary',        'income',  '#22C55E', 'Briefcase',        1),
  ('Freelance',     'income',  '#84CC16', 'Laptop',           2),
  ('Business',      'income',  '#10B981', 'Building2',        3),
  ('Investments',   'income',  '#06B6D4', 'TrendingUp',       4),
  ('Rental',        'income',  '#8B5CF6', 'Home',             5),
  ('Gifts',         'income',  '#F472B6', 'Gift',             6),
  ('Other Income',  'income',  '#94A3B8', 'CircleDollarSign', 7),
  ('Food & Dining',     'expense', '#F97316', 'UtensilsCrossed', 10),
  ('Transport',         'expense', '#EAB308', 'Car',             11),
  ('Shopping',          'expense', '#EC4899', 'ShoppingBag',     12),
  ('Bills & Utilities', 'expense', '#3B82F6', 'Zap',             13),
  ('Healthcare',        'expense', '#EF4444', 'HeartPulse',      14),
  ('Entertainment',     'expense', '#A855F7', 'Clapperboard',    15),
  ('Education',         'expense', '#14B8A6', 'GraduationCap',   16),
  ('Travel',            'expense', '#F59E0B', 'Plane',           17),
  ('Subscriptions',     'expense', '#6366F1', 'RefreshCw',       18),
  ('Groceries',         'expense', '#84CC16', 'ShoppingCart',    19),
  ('Home & Rent',       'expense', '#FB923C', 'House',           20),
  ('Personal Care',     'expense', '#E879F9', 'Sparkles',        21),
  ('Other Expense',     'expense', '#94A3B8', 'MoreHorizontal',  22);

-- =============================================================================
-- 4. ACCOUNTS
-- =============================================================================
CREATE TABLE accounts (
  id                      UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id               UUID          NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  account_holder_name     TEXT          NOT NULL,
  bank_name               TEXT          NOT NULL,
  account_type            TEXT          NOT NULL CHECK (account_type IN ('savings','current','digital_wallet','loan','credit_card','cash','investment')),
  account_number_last4    CHAR(4)       CHECK (account_number_last4 ~ '^\d{4}$'),
  balance                 NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  currency                TEXT          NOT NULL DEFAULT 'INR'
                                      CHECK (currency IN ('INR','USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','SGD','AED','SAR')),
  status                  TEXT          NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  is_recurring            BOOLEAN       NOT NULL DEFAULT false,
  recurring_amount        NUMERIC(15,2) CHECK (recurring_amount IS NULL OR recurring_amount > 0),
  recurring_type          TEXT          CHECK (recurring_type IN ('income','expense')),
  recurring_category_id   UUID          REFERENCES system_categories (id) ON DELETE SET NULL,
  recurring_day_of_month  SMALLINT      DEFAULT 1 CHECK (recurring_day_of_month BETWEEN 1 AND 28),
  recurring_frequency     TEXT          DEFAULT 'monthly' CHECK (recurring_frequency IN ('weekly','monthly','quarterly','yearly')),
  recurring_description   TEXT,
  recurring_last_posted   DATE,
  CONSTRAINT recurring_fields_consistent CHECK (
    (is_recurring = false)
    OR
    (is_recurring = true AND recurring_amount IS NOT NULL AND recurring_type IS NOT NULL AND recurring_category_id IS NOT NULL)
  ),
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accounts_client_id ON accounts (client_id);
CREATE INDEX idx_accounts_recurring ON accounts (client_id, is_recurring) WHERE is_recurring = true;
CREATE INDEX idx_accounts_client_active ON accounts (client_id, status) WHERE status = 'active';

CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY accounts_owner ON accounts
  USING (client_id = (SELECT id FROM clients WHERE id::text = auth.uid()::text));

-- =============================================================================
-- 5. ATOMIC BALANCE RPC
-- =============================================================================
CREATE OR REPLACE FUNCTION adjust_account_balance(
  p_account_id UUID,
  p_amount NUMERIC
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE accounts
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE id = p_account_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account % not found', p_account_id;
  END IF;
END;
$$;

-- =============================================================================
-- 6. TRANSACTIONS
-- =============================================================================
CREATE TABLE transactions (
  id               UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id        UUID          NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  account_id       UUID          NOT NULL REFERENCES accounts (id) ON DELETE RESTRICT,
  category_id      UUID          NOT NULL REFERENCES system_categories (id) ON DELETE RESTRICT,
  amount           NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  type             TEXT          NOT NULL CHECK (type IN ('income','expense')),
  date             DATE          NOT NULL DEFAULT CURRENT_DATE,
  description      TEXT,
  is_recurring     BOOLEAN       NOT NULL DEFAULT false,
  recurrence_rule  TEXT          CHECK (recurrence_rule IN ('weekly','bi-weekly','monthly','quarterly','yearly')),
  bill_instance_id UUID,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tx_client_date ON transactions (client_id, date DESC);
CREATE INDEX idx_tx_budget_lookup ON transactions (client_id, category_id, date) WHERE type = 'expense';
CREATE INDEX idx_tx_account_date ON transactions (account_id, date DESC);
CREATE INDEX idx_tx_client_type_date ON transactions (client_id, type, date DESC);
CREATE INDEX idx_tx_description_trgm ON transactions USING GIN (description gin_trgm_ops) WHERE description IS NOT NULL;

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tx_owner ON transactions
  USING (client_id = (SELECT id FROM clients WHERE id::text = auth.uid()::text));

-- =============================================================================
-- 7. BILLS
-- =============================================================================
CREATE TABLE bills (
  id                    UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id             UUID          NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  account_id            UUID          REFERENCES accounts (id) ON DELETE SET NULL,
  system_category_id    UUID          NOT NULL REFERENCES system_categories (id) ON DELETE RESTRICT,
  name                  VARCHAR(255)  NOT NULL CHECK (length(trim(name)) > 0),
  amount                NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  is_recurring          BOOLEAN       NOT NULL DEFAULT false,
  recurrence_type       TEXT          CHECK (recurrence_type IN ('weekly','monthly','quarterly','yearly')),
  recurrence_interval   SMALLINT      DEFAULT 1 CHECK (recurrence_interval > 0),
  start_date            DATE          NOT NULL,
  end_date              DATE          CHECK (end_date IS NULL OR end_date > start_date),
  reminder_days_before  SMALLINT      NOT NULL DEFAULT 0 CHECK (reminder_days_before >= 0),
  status                TEXT          NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')),
  notes                 TEXT,
  CONSTRAINT bill_recurring_type_check CHECK (
    (is_recurring = false) OR (is_recurring = true AND recurrence_type IS NOT NULL)
  ),
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bills_client_id ON bills (client_id);
CREATE INDEX idx_bills_client_active ON bills (client_id, status) WHERE status = 'active';

CREATE TRIGGER trg_bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY bills_owner ON bills
  USING (client_id = (SELECT id FROM clients WHERE id::text = auth.uid()::text));

-- =============================================================================
-- 8. BILL INSTANCES
-- =============================================================================
CREATE TABLE bill_instances (
  id              UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  bill_id         UUID          NOT NULL REFERENCES bills (id) ON DELETE CASCADE,
  client_id       UUID          NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  due_date        DATE          NOT NULL,
  amount          NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
  status          TEXT          NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','paid','overdue','skipped')),
  paid_at         TIMESTAMPTZ,
  transaction_id  UUID          REFERENCES transactions (id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT bill_instances_unique_due UNIQUE (bill_id, due_date),
  CONSTRAINT bill_paid_at_check CHECK ((status != 'paid') OR (status = 'paid' AND paid_at IS NOT NULL))
);

CREATE INDEX idx_bill_inst_client_due ON bill_instances (client_id, due_date ASC);
CREATE INDEX idx_bill_inst_unpaid ON bill_instances (client_id, due_date ASC) WHERE status IN ('upcoming','overdue');
CREATE INDEX idx_bill_inst_bill_due ON bill_instances (bill_id, due_date DESC);
CREATE INDEX idx_bill_inst_paid_at ON bill_instances (client_id, paid_at) WHERE status = 'paid';

ALTER TABLE bill_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY bill_inst_owner ON bill_instances
  USING (client_id = (SELECT id FROM clients WHERE id::text = auth.uid()::text));

ALTER TABLE transactions
  ADD CONSTRAINT fk_tx_bill_instance
  FOREIGN KEY (bill_instance_id) REFERENCES bill_instances (id) ON DELETE SET NULL;

CREATE INDEX idx_tx_bill_instance ON transactions (bill_instance_id) WHERE bill_instance_id IS NOT NULL;

-- =============================================================================
-- 9. BUDGETS
-- =============================================================================
CREATE TYPE budget_period AS ENUM ('weekly','monthly','quarterly','yearly','custom');

CREATE TABLE budgets (
  id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id     UUID          NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  category_id   UUID          NOT NULL REFERENCES system_categories (id) ON DELETE CASCADE,
  name          VARCHAR(255),
  amount        NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  period_type   budget_period NOT NULL,
  start_date    DATE          NOT NULL,
  end_date      DATE          NOT NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT true,
  notes         TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT budget_dates_check CHECK (end_date > start_date),
  CONSTRAINT no_overlapping_budgets EXCLUDE USING gist (
    client_id WITH =,
    category_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
  )
);

CREATE INDEX idx_budgets_client ON budgets (client_id);
CREATE INDEX idx_budgets_client_active ON budgets (client_id, is_active) WHERE is_active = true;
CREATE INDEX idx_budgets_client_category ON budgets (client_id, category_id);
CREATE INDEX idx_budgets_date_range ON budgets (client_id, start_date, end_date);

CREATE TRIGGER trg_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE OR REPLACE FUNCTION fn_expire_stale_budgets()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE budgets
  SET is_active = false,
      updated_at = NOW()
  WHERE is_active = true
    AND end_date < CURRENT_DATE;
END;
$$;

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY budgets_owner ON budgets
  USING (client_id = (SELECT id FROM clients WHERE id::text = auth.uid()::text));

-- =============================================================================
-- 10. BUDGET SUMMARY RPC
-- =============================================================================
DROP FUNCTION IF EXISTS get_budget_summary(UUID);

CREATE OR REPLACE FUNCTION get_budget_summary(p_client_id UUID)
RETURNS TABLE (
  budget_id UUID,
  category_id UUID,
  category_name VARCHAR,
  category_color VARCHAR,
  budget_name VARCHAR,
  period_type TEXT,
  budget_amount NUMERIC,
  total_spent NUMERIC,
  remaining NUMERIC,
  percentage_used NUMERIC,
  is_over_budget BOOLEAN,
  is_active BOOLEAN,
  start_date DATE,
  end_date DATE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    b.id,
    b.category_id,
    c.name,
    c.color,
    b.name,
    b.period_type::TEXT,
    b.amount,
    COALESCE(SUM(t.amount), 0) AS total_spent,
    b.amount - COALESCE(SUM(t.amount), 0) AS remaining,
    CASE WHEN b.amount = 0 THEN 0 ELSE ROUND((COALESCE(SUM(t.amount), 0) / b.amount) * 100, 2) END,
    COALESCE(SUM(t.amount), 0) > b.amount AS is_over_budget,
    b.is_active,
    b.start_date,
    b.end_date
  FROM budgets b
  JOIN system_categories c ON c.id = b.category_id
  LEFT JOIN transactions t
    ON t.client_id = b.client_id
    AND t.category_id = b.category_id
    AND t.type = 'expense'
    AND t.date >= b.start_date
    AND t.date <= b.end_date
    AND (b.is_active = true OR t.created_at <= b.updated_at)
  WHERE b.client_id = p_client_id
  GROUP BY b.id, b.category_id, c.name, c.color, b.name, b.period_type, b.amount, b.is_active, b.start_date, b.end_date
  ORDER BY b.is_active DESC, b.start_date DESC;
$$;

-- =============================================================================
-- 11. MONTHLY SUMMARY VIEW
-- =============================================================================
CREATE OR REPLACE VIEW v_monthly_summary AS
SELECT
  t.client_id,
  DATE_TRUNC('month', t.date)::DATE AS month_start,
  TO_CHAR(DATE_TRUNC('month', t.date), 'Mon YYYY') AS month_label,
  SUM(t.amount) FILTER (WHERE t.type = 'income') AS total_income,
  SUM(t.amount) FILTER (WHERE t.type = 'expense') AS total_expense,
  SUM(t.amount) FILTER (WHERE t.type = 'income')
    - COALESCE(SUM(t.amount) FILTER (WHERE t.type = 'expense'), 0) AS net_cash_flow,
  COUNT(*) AS transaction_count
FROM transactions t
GROUP BY t.client_id, DATE_TRUNC('month', t.date)
ORDER BY month_start;

-- =============================================================================
-- 12. FINANCIAL HEALTH RPC
-- =============================================================================
CREATE OR REPLACE FUNCTION get_financial_health(p_client_id UUID)
RETURNS TABLE (
  current_income NUMERIC,
  current_expense NUMERIC,
  prev_income NUMERIC,
  prev_expense NUMERIC,
  total_balance NUMERIC
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  WITH this_month AS (
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) AS income,
      COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS expense
    FROM transactions
    WHERE client_id = p_client_id
      AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE)
  ),
  prev_month AS (
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0) AS income,
      COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS expense
    FROM transactions
    WHERE client_id = p_client_id
      AND DATE_TRUNC('month', date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  ),
  balances AS (
    SELECT COALESCE(SUM(balance), 0) AS total_balance
    FROM accounts
    WHERE client_id = p_client_id AND status = 'active'
  )
  SELECT t.income, t.expense, p.income, p.expense, b.total_balance
  FROM this_month t, prev_month p, balances b;
$$;

-- =============================================================================
-- 13. AUDIT LOG
-- =============================================================================
CREATE TABLE audit_log (
  id          BIGSERIAL   PRIMARY KEY,
  client_id   UUID        REFERENCES clients (id) ON DELETE SET NULL,
  table_name  TEXT        NOT NULL,
  operation   TEXT        NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  row_id      UUID,
  old_data    JSONB,
  new_data    JSONB,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_client_time ON audit_log (client_id, changed_at DESC);
CREATE INDEX idx_audit_table_op ON audit_log (table_name, operation, changed_at DESC);

CREATE OR REPLACE FUNCTION fn_audit_trigger()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_client_id UUID;
BEGIN
  BEGIN
    IF TG_OP = 'DELETE' THEN
      v_client_id := OLD.client_id;
    ELSE
      v_client_id := NEW.client_id;
    END IF;
  EXCEPTION WHEN undefined_column THEN
    v_client_id := NULL;
  END;

  INSERT INTO audit_log (client_id, table_name, operation, row_id, old_data, new_data)
  VALUES (
    v_client_id,
    TG_TABLE_NAME,
    TG_OP,
    CASE TG_OP WHEN 'DELETE' THEN OLD.id ELSE NEW.id END,
    CASE TG_OP WHEN 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE TG_OP WHEN 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );

  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_transactions
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_accounts
  AFTER INSERT OR UPDATE OR DELETE ON accounts
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_bill_instances
  AFTER INSERT OR UPDATE OR DELETE ON bill_instances
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

CREATE TRIGGER audit_budgets
  AFTER INSERT OR UPDATE OR DELETE ON budgets
  FOR EACH ROW EXECUTE FUNCTION fn_audit_trigger();

ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 14. OWNERSHIP GUARD
-- =============================================================================
CREATE OR REPLACE FUNCTION verify_client_owns_account(
  p_client_id UUID,
  p_account_id UUID
)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1
    FROM accounts
    WHERE id = p_account_id
      AND client_id = p_client_id
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION fn_check_tx_account_owner()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT verify_client_owns_account(NEW.client_id, NEW.account_id) THEN
    RAISE EXCEPTION 'Account % does not belong to client %', NEW.account_id, NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tx_account_owner
  BEFORE INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION fn_check_tx_account_owner();

-- =============================================================================
-- 15. CLEAR HISTORY RPC
-- =============================================================================
CREATE OR REPLACE FUNCTION clear_client_history(p_client_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_tx_count INT;
  v_bill_count INT;
  v_instance_count INT;
  r RECORD;
BEGIN
  FOR r IN
    SELECT account_id, type, SUM(amount) AS total
    FROM transactions
    WHERE client_id = p_client_id
    GROUP BY account_id, type
  LOOP
    PERFORM adjust_account_balance(
      r.account_id,
      CASE r.type WHEN 'income' THEN -r.total ELSE r.total END
    );
  END LOOP;

  DELETE FROM transactions WHERE client_id = p_client_id;
  GET DIAGNOSTICS v_tx_count = ROW_COUNT;

  DELETE FROM bill_instances WHERE client_id = p_client_id;
  GET DIAGNOSTICS v_instance_count = ROW_COUNT;

  DELETE FROM bills WHERE client_id = p_client_id;
  GET DIAGNOSTICS v_bill_count = ROW_COUNT;

  RETURN jsonb_build_object(
    'transactions', v_tx_count,
    'bills', v_bill_count,
    'bill_instances', v_instance_count
  );
END;
$$;
