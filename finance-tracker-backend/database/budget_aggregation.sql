DROP FUNCTION IF EXISTS get_budget_summary(UUID);


CREATE OR REPLACE FUNCTION get_budget_summary(p_client_id UUID)
RETURNS TABLE (
  budget_id UUID,
  category_id UUID,
  category_name VARCHAR,
  category_color VARCHAR,
  budget_name VARCHAR,
  period_type VARCHAR,
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
AS $$
  SELECT
    b.id AS budget_id,
    b.category_id,

    c.name AS category_name,
    c.color AS category_color,

    b.name AS budget_name,
    b.period_type,

    b.amount AS budget_amount,

    COALESCE(SUM(t.amount), 0) AS total_spent,

    b.amount - COALESCE(SUM(t.amount), 0) AS remaining,

    CASE
      WHEN b.amount = 0 THEN 0
      ELSE ROUND((COALESCE(SUM(t.amount), 0) / b.amount) * 100, 2)
    END AS percentage_used,

    CASE
      WHEN COALESCE(SUM(t.amount), 0) > b.amount THEN TRUE
      ELSE FALSE
    END AS is_over_budget,

    b.is_active,
    b.start_date,
    b.end_date

  FROM budgets b

  LEFT JOIN system_categories c 
    ON b.category_id = c.id

  LEFT JOIN transactions t
    ON t.client_id = b.client_id
    AND t.category_id = b.category_id
    AND t.type = 'expense'
    AND t.date >= b.start_date
    AND t.date <= b.end_date
    AND (
      b.is_active = TRUE 
      OR 
      (b.is_active = FALSE AND t.created_at <= b.updated_at)
    )

  WHERE b.client_id = p_client_id

  GROUP BY 
    b.id,
    b.category_id,
    c.name,
    c.color,
    b.name,
    b.period_type,
    b.amount,
    b.is_active,
    b.start_date,
    b.end_date;
$$;