# FinOps Dashboard Setup Guide

We have programmatically defined the data layer for your FinOps dashboards using Terraform. This ensures that the underlying logic for Cost Control and Tagging Compliance is version-controlled and consistent.

## 1. Programmatic Cloud Monitoring Dashboard
We have deployed a **native Cloud Monitoring Dashboard** for Cost Control.
- **Link**: [Go to Cloud Monitoring Dashboards](https://console.cloud.google.com/monitoring/dashboards)
- **Features**: Real-time spending, forecast, and budget compliance status.

## 2. Looker Studio Integration (Advanced Analytics)
For the full interactive experience requested, connect Looker Studio to our pre-defined BigQuery Views.

### Prerequisites
- Terraform has created the `finops_analytics` dataset and the following views:
  - `monthly_cost_by_service`
  - `daily_cost_summary`
  - `tagging_compliance`
  - `budget_tracking`

### Step-by-Step Connection
1. **Open Looker Studio**: [https://lookerstudio.google.com/](https://lookerstudio.google.com/)
2. **Create/Blank Report**.
3. **Select Data Source**: Choose **BigQuery**.
4. **Navigate**: `[Your Project] > finops_analytics`.
5. **Add Views**:
   - **Cost Control Page**: Add `monthly_cost_by_service` and `daily_cost_summary`.
     - *Chart Suggestion*: Time series bar chart of `total_cost` by `service_name`.
   - **Compliance Page**: Add `tagging_compliance`.
     - *Chart Suggestion*: Pie chart of `compliant_resources` vs `non_compliant_resources` (Mandatory Tag: `cost-center`).
     - *Table*: List `service_name` with `compliance_percentage` (descending order).

### Why this approach?
- **Logic as Code**: The complex SQL logic (e.g., what counts as "compliant") is stored in `infra/bigquery.tf`, not hidden in the visualization tool.
- **Performance**: BigQuery handles the heavy lifting.
- **Security**: You control access via IAM on the dataset.
