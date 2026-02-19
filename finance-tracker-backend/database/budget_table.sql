CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  client_id UUID NOT NULL
    REFERENCES clients(id) ON DELETE CASCADE,

  category_id UUID NOT NULL
    REFERENCES categories(id) ON DELETE CASCADE,

  name VARCHAR(255),

  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),

  period_type VARCHAR(20) NOT NULL
    CHECK (period_type IN ('weekly','monthly','quarterly','yearly','custom')),

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  is_active BOOLEAN DEFAULT true,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (end_date > start_date),

  UNIQUE(client_id, category_id, start_date, end_date)
);

CREATE INDEX idx_budgets_client
ON budgets(client_id);

CREATE INDEX idx_budgets_category
ON budgets(client_id, category_id);

CREATE INDEX idx_transactions_budget_lookup
ON transactions(client_id, category_id, type, date);
