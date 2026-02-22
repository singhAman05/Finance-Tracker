CREATE TABLE bill_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  bill_id UUID NOT NULL
    REFERENCES bills(id) ON DELETE CASCADE,

  client_id UUID NOT NULL
    REFERENCES clients(id) ON DELETE CASCADE,

  due_date DATE NOT NULL,

  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),

  status VARCHAR(20) DEFAULT 'upcoming'
    CHECK (status IN ('upcoming','paid','overdue','skipped')),

  paid_at TIMESTAMPTZ,

  transaction_id UUID
    REFERENCES transactions(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
