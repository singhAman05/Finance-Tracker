CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  client_id UUID NOT NULL
    REFERENCES clients(id) ON DELETE CASCADE,

  account_id UUID
    REFERENCES accounts(id) ON DELETE SET NULL,

  system_category_id UUID NOT NULL
    REFERENCES system_categories(id) ON DELETE RESTRICT,

  name VARCHAR(255) NOT NULL,

  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),

  is_recurring BOOLEAN DEFAULT false,

  recurrence_type VARCHAR(20)
    CHECK (recurrence_type IN ('weekly','monthly','quarterly','yearly')),

  recurrence_interval INT DEFAULT 1 CHECK (recurrence_interval > 0),

  start_date DATE NOT NULL,
  end_date DATE,

  reminder_days_before INT DEFAULT 0 CHECK (reminder_days_before >= 0),

  status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active','paused','cancelled')),

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
