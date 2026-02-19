CREATE OR REPLACE FUNCTION get_budget_summary(p_client_id UUID)
RETURNS TABLE (
  budget_id UUID,
  category_id UUID,
  budget_amount NUMERIC,
  total_spent NUMERIC,
  remaining NUMERIC,
  percentage_used NUMERIC,
  is_over_budget BOOLEAN
)
LANGUAGE sql
AS $$
  SELECT
    b.id AS budget_id,
    b.category_id,
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
    END AS is_over_budget

  FROM budgets b
  LEFT JOIN transactions t
    ON t.client_id = b.client_id
    AND t.category_id = b.category_id
    AND t.type = 'expense'
    AND t.date BETWEEN b.start_date AND b.end_date

  WHERE
    b.client_id = p_client_id
    AND b.is_active = TRUE

  GROUP BY b.id, b.category_id, b.amount;
$$;
