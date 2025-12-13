# Looker Studio Dashboard Setup - FinOps & Tagging Compliance

## Prerequisites

1. **Enable BigQuery Billing Export**
   - Go to: https://console.cloud.google.com/billing
   - Select your billing account
   - Click "Billing export" in left menu
   - Enable "BigQuery export"
   - Select dataset: `billing_export` (will be created by Terraform)
   - Wait 24-48h for first data to appear

2. **Deploy Terraform BigQuery Configuration**
   ```bash
   cd infra
   terraform apply
   ```
   This creates:
   - `billing_export` dataset for raw billing data
   - `finops_analytics` dataset with pre-built views
   - Analytical views for dashboards

## Dashboard 1: FinOps Cost Monitoring

### Quick Setup (Recommended)

1. **Open Looker Studio**
   - Go to: https://lookerstudio.google.com
   - Click "Create" → "Data Source"

2. **Connect BigQuery**
   - Select "BigQuery"
   - Project: `gen-lang-client-0322370238`
   - Dataset: `finops_analytics`
   - Table: `daily_cost_summary`
   - Click "CONNECT"

3. **Create Dashboard**
   - Click "CREATE REPORT"
   - Use template below or customize

### Dashboard Components

#### **Scorecard 1: Current Month Spend**
- Data Source: `budget_tracking` view
- Metric: `actual_cost`
- Filter: Current month
- Comparison: vs budget (10 EUR)
- Color coding:
  - Green: < 50% budget
  - Yellow: 50-75%
  - Orange: 75-90%
  - Red: > 90%

#### **Scorecard 2: Budget Remaining**
- Metric: `remaining_budget`
- Show negative values in red

#### **Scorecard 3: Budget Usage %**
- Metric: `budget_percentage`
- Add gauge visualization

#### **Time Series Chart: Daily Costs (Last 30 Days)**
- Dimension: `usage_date`
- Metric: `total_cost`
- Add trend line
- Add reference line at daily budget (10 EUR / 30 = 0.33 EUR)

#### **Pie Chart: Cost by Service**
- Data Source: `monthly_cost_by_service`
- Dimension: `service_name`
- Metric: `total_cost`
- Show top 5 services

#### **Table: Top Cost Drivers**
- Data Source: `daily_cost_summary`
- Columns:
  - Service Name
  - SKU Description
  - Total Cost
  - % of Budget
- Sort by Total Cost descending
- Limit to 10 rows

#### **Stacked Bar Chart: Monthly Trend**
- Dimension: `month`
- Metric: `total_cost`
- Breakdown: `service_name`
- Last 6 months

#### **Gauge: Budget Status**
- Data Source: `budget_tracking`
- Metric: `budget_percentage`
- Min: 0, Max: 110
- Color ranges:
  - 0-50%: Green
  - 50-75%: Yellow
  - 75-90%: Orange
  - 90-100%: Red
  - 100-110%: Dark Red

### Color Scheme (Professional)
- Primary: `#1A73E8` (Google Blue)
- Success: `#0F9D58` (Green)
- Warning: `#F4B400` (Yellow)
- Danger: `#DB4437` (Red)
- Background: `#F8F9FA`

---

## Dashboard 2: Tagging Compliance

### Quick Setup

1. **Create New Data Source**
   - BigQuery → `finops_analytics.tagging_compliance`
   - Click "CONNECT" → "CREATE REPORT"

### Dashboard Components

#### **Scorecard: Overall Compliance %**
- Metric: `AVG(compliance_percentage)`
- Large font, center aligned
- Color coding:
  - Green: > 95%
  - Yellow: 80-95%
  - Orange: 60-80%
  - Red: < 60%

#### **Scorecard: Untagged Resources**
- Metric: `SUM(untagged_resources)`
- Show trending (vs last month)

#### **Scorecard: Cost at Risk (Untagged)**
- Metric: `SUM(untagged_cost)`
- Format as currency (EUR)

#### **Bar Chart: Compliance by Service**
- Dimension: `service_name`
- Metrics:
  - `tagged_resources` (Green)
  - `untagged_resources` (Red)
- Stacked horizontal bars
- Sort by total resources descending

#### **Table: Non-Compliant Services Detail**
- Columns:
  - Service Name
  - Total Resources
  - Tagged
  - Untagged
  - Compliance %
  - Untagged Cost
- Filter: `compliance_percentage < 100`
- Sort by Untagged Cost descending

#### **Gauge Chart: Compliance Status**
- Metric: Overall compliance percentage
- Segments:
  - Red: 0-60%
  - Orange: 60-80%
  - Yellow: 80-95%
  - Green: 95-100%

### Recommended Filters

Add date range filter:
- Default: Last 30 days
- Allow user to change

Add service filter:
- Multi-select dropdown
- Show all services

---

## Alternative: Import Pre-configured Dashboards

I've created JSON templates for both dashboards. To import:

1. **Download Templates**
   - `looker/finops-dashboard.txt` (Looker doesn't support JSON import directly)
   - `looker/tagging-compliance-dashboard.txt`

2. **Manual Recreation**
   - Use the component descriptions above
   - Follow Looker Studio UI to add each component
   - Takes ~15-20 minutes per dashboard

---

## Scheduling & Alerts

### Email Reports
1. In Looker Studio dashboard
2. Click "Share" → "Schedule email delivery"
3. Configure:
   - Recipients: Your email
   - Frequency: Weekly (Monday 9 AM)
   - Include PDF

### Slack Webhooks (Optional)
1. Create Slack webhook URL
2. Use Google Apps Script to send alerts when:
   - Budget > 90%
   - Tagging compliance < 80%

---

## Best Practices

### Tagging Strategy

All GCP resources should have these labels:
- `environment`: production | staging | dev
- `application`: zone-calculator-pro
- `managed-by`: terraform | manual
- `cost-center`: team or department
- `owner`: email address

### Update Labels on Existing Resources

```bash
# Label Cloud Run service
gcloud run services update zone-calculator-pro \
  --update-labels=environment=production,application=zone-calculator-pro,cost-center=finops,managed-by=terraform \
  --region=europe-west1

# Label Cloud SQL instance
gcloud sql instances patch INSTANCE_NAME \
  --labels=environment=production,application=zone-calculator-pro,cost-center=finops,managed-by=terraform
```

### Terraform Enforcement

All resources in `infra/*.tf` files now include labels block:
```hcl
labels = {
  environment  = "production"
  application  = "zone-calculator-pro"
  managed-by   = "terraform"
  cost-center  = "finops"
}
```

---

## Troubleshooting

### No Data in Dashboards?

1. **Check BigQuery Export**
   - Billing export can take 24-48h to populate
   - Check if tables exist: https://console.cloud.google.com/bigquery

2. **Run Test Query**
   ```sql
   SELECT COUNT(*) 
   FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
   WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY))
   ```

3. **Check Permissions**
   - Ensure you have `bigquery.dataViewer` role
   - Grant Looker Studio access to BigQuery

### Dashboard Shows Errors?

- Refresh data source connection
- Check BigQuery view queries are valid
- Ensure billing export is enabled

---

## Sample Queries

Test these in BigQuery console before using in Looker:

```sql
-- Current month spend
SELECT SUM(cost) as total 
FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_TRUNC(CURRENT_DATE(), MONTH));

-- Top 5 services this month
SELECT 
  service.description,
  SUM(cost) as cost
FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_TRUNC(CURRENT_DATE(), MONTH))
GROUP BY service.description
ORDER BY cost DESC
LIMIT 5;
```

---

## Maintenance

### Weekly Tasks
- Review FinOps dashboard for cost spikes
- Check tagging compliance %
- Follow up on untagged resources

### Monthly Tasks
- Review budget vs actual spend
- Identify cost optimization opportunities
- Update tags on new resources

### Quarterly Tasks
- Review tagging strategy effectiveness
- Update budget if needed
- Optimize BigQuery storage costs
