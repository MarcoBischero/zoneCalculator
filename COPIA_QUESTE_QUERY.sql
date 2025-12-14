-- ===================================================================
-- COPIA E INCOLLA QUESTE 4 QUERY UNA PER VOLTA NELLA CONSOLE BIGQUERY
-- ===================================================================

-- QUERY 1/4: daily_cost_summary
-- Copia tutto da CREATE fino al ; finale
CREATE OR REPLACE VIEW `gen-lang-client-0322370238.finops_analytics.daily_cost_summary` AS
SELECT
  DATE(usage_start_time) as usage_date,
  service.description as service_name,
  sku.description as sku_description,
  project.id as project_id,
  project.name as project_name,
  (SELECT STRING_AGG(CONCAT(key, ':', value), ', ') FROM UNNEST(project.labels)) as project_labels,
  SUM(cost) as total_cost,
  currency as currency
FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
GROUP BY 1, 2, 3, 4, 5, 6, 8
ORDER BY 1 DESC, 7 DESC;

-- ===================================================================

-- QUERY 2/4: monthly_cost_by_service
CREATE OR REPLACE VIEW `gen-lang-client-0322370238.finops_analytics.monthly_cost_by_service` AS
SELECT
  FORMAT_DATE('%Y-%m', DATE(usage_start_time)) as month,
  service.description as service_name,
  SUM(cost) as total_cost,
  currency
FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH))
GROUP BY 1, 2, 4
ORDER BY 1 DESC, 3 DESC;

-- ===================================================================

-- QUERY 3/4: budget_tracking
CREATE OR REPLACE VIEW `gen-lang-client-0322370238.finops_analytics.budget_tracking` AS
WITH monthly_costs AS (
  SELECT
    FORMAT_DATE('%Y-%m', DATE(usage_start_time)) as month,
    SUM(cost) as actual_cost
  FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
  WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_TRUNC(CURRENT_DATE(), MONTH))
  GROUP BY 1
)
SELECT
  month,
  actual_cost,
  10 as budget_amount,
  ROUND((actual_cost / 10) * 100, 2) as budget_percentage,
  10 - actual_cost as remaining_budget,
  CASE
    WHEN actual_cost >= 10 THEN 'Over Budget'
    WHEN actual_cost >= 10 * 0.9 THEN 'Critical (90%+)'
    WHEN actual_cost >= 10 * 0.75 THEN 'High (75%+)'
    WHEN actual_cost >= 10 * 0.5 THEN 'Medium (50%+)'
    ELSE 'Low (<50%)'
  END as status
FROM monthly_costs
ORDER BY month DESC;

-- ===================================================================

-- QUERY 4/4: tagging_compliance
CREATE OR REPLACE VIEW `gen-lang-client-0322370238.finops_analytics.tagging_compliance` AS
WITH resource_tags AS (
  SELECT
    project.id as project_id,
    service.description as service_name,
    labels,
    cost
  FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
  WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
    AND cost > 0
)
SELECT
  service_name,
  COUNT(*) as total_resources,
  COUNTIF(EXISTS(SELECT 1 FROM UNNEST(labels) WHERE key = 'cost-center')) as compliant_resources,
  COUNTIF(NOT EXISTS(SELECT 1 FROM UNNEST(labels) WHERE key = 'cost-center')) as non_compliant_resources,
  ROUND(SAFE_DIVIDE(COUNTIF(EXISTS(SELECT 1 FROM UNNEST(labels) WHERE key = 'cost-center')), COUNT(*)) * 100, 2) as compliance_percentage,
  SUM(cost) as total_cost,
  SUM(IF(NOT EXISTS(SELECT 1 FROM UNNEST(labels) WHERE key = 'cost-center'), cost, 0)) as non_compliant_cost
FROM resource_tags
GROUP BY 1
ORDER BY 6 DESC;

-- ===================================================================
-- DONE! Dopo aver eseguito tutte e 4 le views, verifica con:
SELECT table_name FROM `gen-lang-client-0322370238.finops_analytics.INFORMATION_SCHEMA.TABLES` WHERE table_type = 'VIEW';
-- ===================================================================
