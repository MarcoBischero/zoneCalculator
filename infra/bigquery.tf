# BigQuery Billing Export Configuration
# Required for Looker Studio FinOps dashboards

# Dataset for billing data
resource "google_bigquery_dataset" "billing_export" {
  dataset_id    = "billing_export"
  friendly_name = "GCP Billing Export Data"
  description   = "Dataset containing exported billing data for FinOps analysis"
  location      = "EU"  # or "US" based on your preference
  
  # Data retention for cost optimization
  default_table_expiration_ms = 7776000000  # 90 days
  
  labels = {
    environment  = "production"
    purpose      = "finops"
    managed-by   = "terraform"
  }
}

# Dataset for custom views and analytics
resource "google_bigquery_dataset" "finops_analytics" {
  dataset_id    = "finops_analytics"
  friendly_name = "FinOps Analytics Views"
  description   = "Custom views and queries for FinOps dashboards"
  location      = "EU"
  
  labels = {
    environment  = "production"
    purpose      = "finops"
    managed-by   = "terraform"
  }
}

# View for daily cost summary
resource "google_bigquery_table" "daily_cost_summary" {
  dataset_id = google_bigquery_dataset.finops_analytics.dataset_id
  table_id   = "daily_cost_summary"
  
  view {
    query = <<-SQL
      SELECT
        DATE(usage_start_time) as usage_date,
        service.description as service_name,
        sku.description as sku_description,
        project.id as project_id,
        project.name as project_name,
        ARRAY_TO_STRING(project.labels, ', ') as project_labels,
        SUM(cost) as total_cost,
        currency as currency
      FROM `${var.project_id}.billing_export.gcp_billing_export_v1_*`
      WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
      GROUP BY usage_date, service_name, sku_description, project_id, project_name, project_labels, currency
      ORDER BY usage_date DESC, total_cost DESC
    SQL
    
    use_legacy_sql = false
  }
  
  labels = {
    purpose    = "finops"
    managed-by = "terraform"
  }
}

# View for monthly cost by service
resource "google_bigquery_table" "monthly_cost_by_service" {
  dataset_id = google_bigquery_dataset.finops_analytics.dataset_id
  table_id   = "monthly_cost_by_service"
  
  view {
    query = <<-SQL
      SELECT
        FORMAT_DATE('%Y-%m', DATE(usage_start_time)) as month,
        service.description as service_name,
        SUM(cost) as total_cost,
        currency
      FROM `${var.project_id}.billing_export.gcp_billing_export_v1_*`
      WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH))
      GROUP BY month, service_name, currency
      ORDER BY month DESC, total_cost DESC
    SQL
    
    use_legacy_sql = false
  }
}

# View for budget tracking
resource "google_bigquery_table" "budget_tracking" {
  dataset_id = google_bigquery_dataset.finops_analytics.dataset_id
  table_id   = "budget_tracking"
  
  view {
    query = <<-SQL
      WITH monthly_costs AS (
        SELECT
          FORMAT_DATE('%Y-%m', DATE(usage_start_time)) as month,
          SUM(cost) as actual_cost
        FROM `${var.project_id}.billing_export.gcp_billing_export_v1_*`
        WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_TRUNC(CURRENT_DATE(), MONTH))
        GROUP BY month
      )
      SELECT
        month,
        actual_cost,
        ${var.budget_amount} as budget_amount,
        ROUND((actual_cost / ${var.budget_amount}) * 100, 2) as budget_percentage,
        ${var.budget_amount} - actual_cost as remaining_budget,
        CASE
          WHEN actual_cost >= ${var.budget_amount} THEN 'Over Budget'
          WHEN actual_cost >= ${var.budget_amount} * 0.9 THEN 'Critical (90%+)'
          WHEN actual_cost >= ${var.budget_amount} * 0.75 THEN 'High (75%+)'
          WHEN actual_cost >= ${var.budget_amount} * 0.5 THEN 'Medium (50%+)'
          ELSE 'Low (<50%)'
        END as status
      FROM monthly_costs
      ORDER BY month DESC
    SQL
    
    use_legacy_sql = false
  }
}

# View for tagging compliance
resource "google_bigquery_table" "tagging_compliance" {
  dataset_id = google_bigquery_dataset.finops_analytics.dataset_id
  table_id   = "tagging_compliance"
  
  view {
    query = <<-SQL
        FROM `${var.project_id}.billing_export.gcp_billing_export_v1_*`
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
      ORDER BY total_cost DESC
    SQL
    
    use_legacy_sql = false
  }
}

# Output BigQuery dataset info
output "bigquery_billing_dataset" {
  description = "BigQuery billing export dataset ID"
  value       = google_bigquery_dataset.billing_export.dataset_id
}

output "bigquery_analytics_dataset" {
  description = "BigQuery finops analytics dataset ID"
  value       = google_bigquery_dataset.finops_analytics.dataset_id
}
