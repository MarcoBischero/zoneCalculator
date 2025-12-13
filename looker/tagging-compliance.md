# Tagging Compliance Dashboard

**Dashboard Name:** Zone Calculator PRO - Tagging Compliance  
**Purpose:** Monitor GCP resource tagging compliance and identify untagged resources  
**Looker Studio URL:** *(To be created)*

## Overview

This Looker Studio dashboard tracks tagging compliance across all GCP resources that incur costs. It helps ensure proper cost allocation, governance, and accountability by monitoring the presence of required labels/tags on cloud resources.

**Key Compliance Requirement:** All billable resources must have a `cost-center` tag.

## Data Source

Single BigQuery view from the `finops_analytics` dataset:

| View Name | Purpose | Refresh Rate |
|-----------|---------|--------------|
| `tagging_compliance` | Resource tagging metrics by service | 4 hours |

### BigQuery Connection Settings
- **Project ID:** gen-lang-client-0322370238
- **Dataset:** finops_analytics
- **Table/View:** tagging_compliance
- **Location:** EU
- **Cache Duration:** 4 hours
- **Auto-refresh:** Every 12 hours

### Compliance Logic
Resources are considered **compliant** if they have the `cost-center` label. The view analyzes the last 30 days of billing data to identify:
- Total resources per service
- Count of tagged vs untagged resources
- Cost associated with untagged resources
- Overall compliance percentage

## Dashboard Layout

```
┌─────────────────┬─────────────────┬─────────────────┐
│ ✅ Overall     │ ⚠️  Untagged    │ 💸 Cost at      │
│ Compliance %    │ Resources       │ Risk (Untagged) │
│ XX.X%           │ XXX             │ €X.XX           │
└─────────────────┴─────────────────┴─────────────────┘

┌───────────────────────────────────────────────────────┐
│ 📊 Compliance by Service (Tagged vs Untagged)        │
│ [Horizontal Stacked Bar Chart]                        │
└───────────────────────────────────────────────────────┘

┌───────────────────────┬───────────────────────────────┐
│ 🎯 Compliance Gauge   │ Reserved for Future Use       │
│ [Semi-Circle Gauge]   │ (e.g., 30-day trend)          │
└───────────────────────┴───────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│ 📋 Non-Compliant Services Detail                      │
│ [Data Table - Only services with untagged resources]  │
└───────────────────────────────────────────────────────┘
```

## Component Specifications

### 1. Scorecard: Overall Compliance %
**Data Source:** `tagging_compliance`

- **Metric:** `AVG(compliance_percentage)`
- **Aggregation:** Average across all services
- **Display Name:** "Overall Compliance"
- **Number Format:** Percentage (1 decimal) - e.g., "94.5%"
- **Font Size:** 32px
- **Alignment:** Center
- **Conditional Formatting:**
  - ≥ 95%: Background `#0F9D58` (Green)
  - 80-94%: Background `#F4B400` (Yellow)
  - 60-79%: Background `#FF6B00` (Orange)
  - < 60%: Background `#DB4437` (Red)
- **Target:** Achieve and maintain ≥ 95% compliance

### 2. Scorecard: Untagged Resources
**Data Source:** `tagging_compliance`

- **Metric:** `SUM(non_compliant_resources)`
- **Display Name:** "Untagged Resources"
- **Number Format:** Number (no decimals)
- **Font Size:** 32px
- **Alignment:** Center
- **Background Color:** `#2A2A2A`
- **Text Color:** 
  - If value > 10: `#DB4437` (Red) with ⚠️ icon
  - If value 1-10: `#F4B400` (Yellow)
  - If value = 0: `#0F9D58` (Green) with ✅ icon
- **Target:** Reduce to 0

### 3. Scorecard: Cost at Risk
**Data Source:** `tagging_compliance`

- **Metric:** `SUM(non_compliant_cost)`
- **Display Name:** "Cost at Risk (Untagged)"
- **Number Format:** Currency (EUR, 2 decimals)
- **Font Size:** 32px
- **Alignment:** Center
- **Background Color:** `#2A2A2A`
- **Text Color:** `#FF6B00` (Orange) - highlights financial impact
- **Description:** Total cost from resources missing required tags
- **Target:** €0.00

### 4. Horizontal Stacked Bar Chart: Compliance by Service
**Data Source:** `tagging_compliance`

**Configuration:**
- **Chart Type:** Horizontal stacked bar chart
- **Dimension:** `service_name` (Y-axis)
- **Metrics:**
  1. `compliant_resources` - Tagged (Green)
  2. `non_compliant_resources` - Untagged (Red)
- **Stacking:** 100% stacked (shows proportion)
- **Sort By:** `total_resources` descending (largest services first)
- **Bar Height:** 30px per service
- **Max Services:** Top 10 (or all if < 10)

**Styling:**
- **Tagged Color:** `#0F9D58` (Green)
- **Untagged Color:** `#DB4437` (Red)
- **Bar Labels:** Show count inside bars if space permits
- **Y-Axis Labels:** Service names, left-aligned
- **X-Axis:** Hidden (percentages shown in tooltip)
- **Grid Lines:** None
- **Border:** `1px solid #3A3A3A`

**Tooltip:**
```
Service: [service_name]
Tagged: [compliant_resources] ([compliance_percentage]%)
Untagged: [non_compliant_resources]
Total: [total_resources]
```

### 5. Gauge Chart: Compliance Status
**Data Source:** `tagging_compliance`

**Configuration:**
- **Chart Type:** Semi-circular gauge
- **Metric:** `AVG(compliance_percentage)`
- **Range:** 0 to 100
- **Arc Type:** Semi-circle (180°)
- **Color Segments:**
  - 0-60%: `#DB4437` (Red) - "Critical"
  - 60-80%: `#FF6B00` (Orange) - "Needs Work"
  - 80-95%: `#F4B400` (Yellow) - "Good"
  - 95-100%: `#0F9D58` (Green) - "Excellent"
- **Needle:**
  - Color: `#FFFFFF` (White)
  - Width: 3px
- **Center Value:** Show compliance % in center (large text)
- **Label:** "Compliance Status"
- **Background:** `#2A2A2A`

### 6. Data Table: Non-Compliant Services Detail
**Data Source:** `tagging_compliance`

**Filter:** `compliance_percentage < 100` (only show services with issues)

**Columns:**

1. **Service**
   - Field: `service_name`
   - Width: 30%
   - Text Align: Left
   - Font Weight: Bold

2. **Total Resources**
   - Field: `total_resources`
   - Width: 15%
   - Format: Number (no decimals)
   - Text Align: Center

3. **Tagged**
   - Field: `compliant_resources`
   - Width: 12%
   - Format: Number
   - Text Align: Center
   - Color: `#0F9D58` (Green)

4. **Untagged**
   - Field: `non_compliant_resources`
   - Width: 12%
   - Format: Number
   - Text Align: Center
   - **Conditional Formatting:**
     - > 10: Bold, `#DB4437` (Red)
     - 1-10: `#FF6B00` (Orange)

5. **Compliance %**
   - Field: `compliance_percentage`
   - Width: 15%
   - Format: Percentage (1 decimal)
   - Text Align: Center
   - **Conditional Formatting:**
     - < 50%: Background `#DB4437`, White text
     - 50-79%: Background `#FF6B00`, White text
     - 80-94%: Background `#F4B400`, Black text

6. **Cost at Risk (EUR)**
   - Field: `non_compliant_cost`
   - Width: 16%
   - Format: Currency (EUR, 2 decimals)
   - Text Align: Right
   - Font Weight: Bold if > €1.00

**Table Settings:**
- **Sort:** `non_compliant_cost` descending (highest cost impact first)
- **Row Limit:** 20
- **Row Styling:** Alternate rows (`#2A2A2A` / `#1E1E1E`)
- **Header:**
  - Background: `#1A73E8`
  - Text: White, Bold, 12px
  - Sticky: Yes (stays at top when scrolling)
- **Empty State Message:** "🎉 Perfect Compliance! All resources are properly tagged."

## Styling & Theme

### Global Theme
**Match FinOps Cost Monitoring dashboard for consistency:**

- **Color Scheme:** Dark mode
- **Background:** `#1E1E1E`
- **Card Background:** `#2A2A2A`
- **Card Border:** `1px solid #3A3A3A`
- **Border Radius:** 8px
- **Card Shadow:** `0 2px 4px rgba(0,0,0,0.3)`
- **Spacing:** 16px gaps

### Typography
- **Primary Font:** Google Sans
- **Fallback:** Roboto, Arial, sans-serif
- **Primary Text:** `#FFFFFF`
- **Secondary Text:** `#B0B0B0`
- **Header Size:** 24px, Bold
- **Body Size:** 14px

### Semantic Colors
- **Success/Compliant:** `#0F9D58` (Green)
- **Warning/Needs Attention:** `#F4B400` (Yellow)
- **Alert/Moderate Issue:** `#FF6B00` (Orange)
- **Danger/Critical:** `#DB4437` (Red)
- **Accent:** `#1A73E8` (Google Blue)

## Filters & Interactivity

### Date Range Filter
- **Type:** Date range selector
- **Default:** Last 30 days
- **Visible:** Yes, top right
- **Note:** Tagging compliance view already filters to last 30 days, but filter allows narrowing further

### Service Filter
- **Type:** Multi-select dropdown
- **Source:** `service_name` dimension
- **Default:** All services
- **Visible:** Yes, next to date range
- **Use Case:** Focus on specific services or resource types

## Setup Instructions

### Step 1: Create New Report
1. Go to [Looker Studio](https://lookerstudio.google.com)
2. Click **"Create"** → **"Report"**
3. Select **"Blank Report"**

### Step 2: Connect BigQuery Data Source
1. Click **"Add data"** → **"BigQuery"**
2. Authorize GCP access if prompted
3. Navigate to:
   - **Project:** gen-lang-client-0322370238
   - **Dataset:** finops_analytics
   - **Table:** tagging_compliance
4. Click **"ADD"**
5. Rename data source: "BQ - Tagging Compliance"

### Step 3: Set Page Layout
1. **File** → **"Page settings"**
2. Set canvas size: **1600 x 900** (widescreen)
3. **Theme & Layout:**
   - Background: `#1E1E1E`
   - Grid: 16px
   - Snap to grid: Enabled

### Step 4: Build Dashboard Components
Follow the specifications above to add components in this order:
1. Three scorecards (top row)
2. Stacked bar chart (full width)
3. Gauge chart (bottom left)
4. Data table (full width, bottom)

### Step 5: Apply Filters
1. Add **Date Range** control (top right)
2. Add **Service** dropdown filter (next to date)
3. Ensure filters apply to all components

### Step 6: Configure Dashboard Settings
1. **Name:** "Zone Calculator PRO - Tagging Compliance"
2. **Data freshness:** 4 hours cache
3. **Share:** Anyone with link can view
4. **View mode:** Enable viewer interactions

## Verification Checklist

- [ ] BigQuery data source connected successfully
- [ ] Overall compliance % scorecard shows weighted average
- [ ] Untagged resources count is accurate
- [ ] Cost at risk shows sum of untagged resource costs
- [ ] Stacked bar chart displays all services with billing data
- [ ] Gauge chart color segments match compliance thresholds
- [ ] Data table filters to show only non-compliant services (< 100%)
- [ ] Table sorted by cost at risk (descending)
- [ ] Conditional formatting applied correctly
- [ ] Dark theme consistent across all components
- [ ] Filters work and affect all visualizations
- [ ] Dashboard loads in < 5 seconds

## Interpreting the Dashboard

### Compliance Targets
| Metric | Target | Action Required |
|--------|--------|-----------------|
| Overall Compliance | ≥ 95% | Excellent - maintain |
| Overall Compliance | 80-94% | Good - address outliers |
| Overall Compliance | 60-79% | Needs improvement plan |
| Overall Compliance | < 60% | Critical - immediate action |

### Action Items Based on Data

**If Untagged Resources > 10:**
1. Review non-compliant services table
2. Identify resource types missing tags
3. Use gcloud commands to add tags (see below)
4. Update Terraform configurations to prevent future drift

**If Cost at Risk > €2.00:**
1. Prioritize by cost impact (use table sort)
2. Tag high-cost services first
3. Set reminder to review weekly until resolved

**If Compliance < 95%:**
1. Create tagging remediation plan
2. Schedule weekly compliance reviews
3. Consider automated tagging via Terraform

## Remediation Guide

### Manually Tag Resources

**Cloud Run Service:**
```bash
gcloud run services update zone-calculator-pro \
  --update-labels=cost-center=finops,environment=production \
  --region=europe-west1
```

**Cloud SQL Instance:**
```bash
gcloud sql instances patch INSTANCE_NAME \
  --labels=cost-center=finops,environment=production
```

**BigQuery Dataset:**
```bash
bq update --set_label cost-center:finops \
  gen-lang-client-0322370238:finops_analytics
```

### Enforce Tagging via Terraform
Update `infra/*.tf` files to include labels on all resources:

```hcl
resource "google_cloud_run_service" "app" {
  # ... other config ...
  
  metadata {
    labels = {
      environment = "production"
      cost-center = "finops"
      application = "zone-calculator-pro"
      managed-by  = "terraform"
    }
  }
}
```

## Maintenance

### Weekly Tasks
- Review dashboard for new untagged resources
- Tag any newly created resources
- Track compliance % trend

### Monthly Tasks
- Audit tagging policy effectiveness
- Review which services frequently lack tags
- Update Terraform templates if needed
- Generate compliance report for stakeholders

### Quarterly Tasks
- Evaluate if `cost-center` tag is sufficient or if additional tags needed
- Review cost allocation accuracy
- Update tagging requirements based on organizational needs

## Troubleshooting

### "No data in compliance table"
**Possible Causes:**
- 100% compliance (all resources tagged) - Good news!
- BigQuery view not returning data
- Billing export not configured

**Fix:**
1. Check raw data: `SELECT * FROM finops_analytics.tagging_compliance`
2. If 100% compliant, table shows "Perfect Compliance" message
3. If no data, verify billing export is enabled

### Compliance % seems wrong
**Check:**
- Currency unit (should be EUR)
- Date range (default is last 30 days)
- Whether view logic matches your tagging requirements

**Fix:**
- Review `infra/bigquery.tf` - tagging_compliance view query
- Verify tag key is `cost-center` (case-sensitive in some systems)

### Charts not showing all services
**Cause:** Visualization limits or filter applied

**Fix:**
- Check if service filter is set to "All"
- For bar chart, increase max services shown
- For table, increase row limit if needed

---

**Created:** 2025-12-13  
**Last Updated:** 2025-12-13  
**Owned by:** FinOps + DevOps Team  
**Slack Channel:** #finops (for compliance alerts)  
**Looker Studio URL:** *(To be added after creation)*  
