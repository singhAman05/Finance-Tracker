-- ============================================================
--  client_settings.sql
--  Stores user preferences like currency, date format, and notifications.
-- ============================================================

CREATE TABLE client_settings (
  id                      UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id               UUID          NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  
  -- Preferences
  currency                TEXT          NOT NULL DEFAULT 'INR',
  date_format             TEXT          NOT NULL DEFAULT 'DD/MM/YYYY',
  
  -- Notifications
  notify_bills            BOOLEAN       NOT NULL DEFAULT true,
  notify_budgets          BOOLEAN       NOT NULL DEFAULT true,
  notify_recurring        BOOLEAN       NOT NULL DEFAULT true,

  created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Automatically keep updated_at current
CREATE TRIGGER set_client_settings_updated_at
  BEFORE UPDATE ON client_settings
  FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- Fast lookup by client_id
CREATE INDEX idx_client_settings_client_id ON client_settings(client_id);

ALTER TABLE client_settings DISABLE ROW LEVEL SECURITY;
