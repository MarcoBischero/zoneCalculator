-- BigQuery Views Creation Script for FinOps Analytics
-- Project: gen-lang-client-0322370238
-- Dataset: finops_analytics
-- 
-- INSTRUCTIONS:
-- 1. Go to https://console.cloud.google.com/bigquery
-- 2. Select project: gen-lang-client-0322370238
-- 3. Run each CREATE VIEW statement below one by one

-- ==============================================================================
-- VIEW 1: daily_cost_summary
-- Purpose: Daily cost breakdowns by service and SKU
-- ==============================================================================

CREATE OR REPLACE VIEW `gen-lang-client-0322370238.finops_analytics.daily_cost_summary` AS
SELECT
  DATE(usage_start_time) as usage_date,
  service.description as service_name,
  sku.description as sku_description,
  project.id as project_id,
  project.name as project_name,
  ARRAY_TO_STRING(project.labels, ', ') as project_labels,
  SUM(cost) as total_cost,
  currency as currency
FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
GROUP BY usage_date, service_name, sku_description, project_id, project_name, project_labels, currency
ORDER BY usage_date DESC, total_cost DESC;

-- ==============================================================================
-- VIEW 2: monthly_cost_by_service
-- Purpose: Monthly aggregated costs by service
-- ==============================================================================

CREATE OR REPLACE VIEW `gen-lang-client-0322370238.finops_analytics.monthly_cost_by_service` AS
SELECT
  FORMAT_DATE('%Y-%m', DATE(usage_start_time)) as month,
  service.description as service_name,
  SUM(cost) as total_cost,
  currency
FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH))
GROUP BY month, service_name, currency
ORDER BY month DESC, total_cost DESC;

-- ==============================================================================
-- VIEW 3: budget_tracking
-- Purpose: Budget vs actual spend tracking with status indicators
-- Budget Amount: €10/month
-- ==============================================================================

CREATE OR REPLACE VIEW `gen-lang-client-0322370238.finops_analytics.budget_tracking` AS
WITH monthly_costs AS (
  SELECT
    FORMAT_DATE('%Y-%m', DATE(usage_start_time)) as month,
    SUM(cost) as actual_cost
  FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
  WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_TRUNC(CURRENT_DATE(), MONTH))
  GROUP BY month
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

-- ==============================================================================
-- VIEW 4: tagging_compliance
-- Purpose: Track resource tagging compliance (cost-center tag required)
-- ==============================================================================

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
GROUP BY service_name
ORDER BY total_cost DESC;

-- ==============================================================================
-- VERIFICATION QUERIES
-- Run these to verify the views were created successfully
-- ==============================================================================

-- Check if all 4 views exist
SELECT table_name, table_type
FROM `gen-lang-client-0322370238.finops_analytics.INFORMATION_SCHEMA.TABLES`
WHERE table_type = 'VIEW'
ORDER BY table_name;

-- Test daily_cost_summary (should return data if billing export has data)
SELECT * FROM `gen-lang-client-0322370238.finops_analytics.daily_cost_summary` LIMIT 5;

-- Test monthly_cost_by_service
SELECT * FROM `gen-lang-client-0322370238.finops_analytics.monthly_cost_by_service` LIMIT 5;

-- Test budget_tracking
SELECT * FROM `gen-lang-client-0322370238.finops_analytics.budget_tracking` LIMIT 5;

-- Test tagging_compliance
SELECT * FROM `gen-lang-client-0322370238.finops_analytics.tagging_compliance` LIMIT 5;

-- ==============================================================================
-- NOTES:
-- ==============================================================================
-- 
-- 1. If queries return "no data" but views are created successfully:
--    - This is NORMAL if billing export hasn't been enabled yet
--    - Enable billing export: https://console.cloud.google.com/billing/export
--    - Data will populate within 24-48 hours after enabling
--
-- 2. The views query the `billing_export.gcp_billing_export_v1_*` wildcard table
--    - This assumes billing export is configured to export to the billing_export dataset
--    - If you see errors about missing tables, check your billing export configuration
--
-- 3. Budget amount is hardcoded to €10 in the budget_tracking view
--    - To change: update line 75 (budget_amount: 10)
--
-- 4. Tagging compliance checks for 'cost-center' label
--    - To check different labels, modify line 110
--
-- ==============================================================================
