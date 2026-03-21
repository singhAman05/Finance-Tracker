-- ============================================================
--  system_categories.sql
--  Global, seeded categories available to all clients.
--  These are NOT owned by any client — they are app-level data.
--  Bills, budgets, and transactions all reference this table.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE system_categories (
  id          UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),

  name        VARCHAR(100)  NOT NULL UNIQUE,

  -- 'income' or 'expense' — drives how the UI and reports group them
  type        TEXT          NOT NULL CHECK (type IN ('income', 'expense')),

  -- Hex color for UI badges / charts (e.g. '#F97316')
  color       VARCHAR(20),

  -- Lucide / icon name string (e.g. 'ShoppingCart', 'Briefcase')
  icon        VARCHAR(100),

  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── Seed data ────────────────────────────────────────────────
-- Income categories
INSERT INTO system_categories (name, type, color, icon) VALUES
  ('Salary',        'income',  '#22C55E', 'Briefcase'),
  ('Freelance',     'income',  '#84CC16', 'Laptop'),
  ('Business',      'income',  '#10B981', 'Building2'),
  ('Investments',   'income',  '#06B6D4', 'TrendingUp'),
  ('Rental',        'income',  '#8B5CF6', 'Home'),
  ('Gifts',         'income',  '#F472B6', 'Gift'),
  ('Other Income',  'income',  '#94A3B8', 'CircleDollarSign');

-- Expense categories
INSERT INTO system_categories (name, type, color, icon) VALUES
  ('Food & Dining',   'expense', '#F97316', 'UtensilsCrossed'),
  ('Transport',       'expense', '#EAB308', 'Car'),
  ('Shopping',        'expense', '#EC4899', 'ShoppingBag'),
  ('Bills & Utilities','expense','#3B82F6', 'Zap'),
  ('Healthcare',      'expense', '#EF4444', 'HeartPulse'),
  ('Entertainment',   'expense', '#A855F7', 'Clapperboard'),
  ('Education',       'expense', '#14B8A6', 'GraduationCap'),
  ('Travel',          'expense', '#F59E0B', 'Plane'),
  ('Subscriptions',   'expense', '#6366F1', 'RefreshCw'),
  ('Groceries',       'expense', '#84CC16', 'ShoppingCart'),
  ('Home & Rent',     'expense', '#FB923C', 'House'),
  ('Personal Care',   'expense', '#E879F9', 'Sparkles'),
  ('Other Expense',   'expense', '#94A3B8', 'MoreHorizontal');

-- Index used by budget and transaction joins
CREATE INDEX idx_system_categories_type ON system_categories(type);
