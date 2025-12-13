# FinOps Cost Monitoring Dashboard

**Dashboard Name:** Zone Calculator PRO - FinOps Cost Monitoring  
**Purpose:** Real-time monitoring of GCP costs against budget with detailed breakdowns  
**Looker Studio URL:** *(To be created)*

## Overview

This Looker Studio dashboard provides comprehensive cost monitoring for the Zone Calculator PRO project, tracking spending against a monthly budget of €10 EUR. It visualizes daily costs, service-level breakdowns, and budget compliance in real-time.

## Data Sources

All data comes from BigQuery views in the `finops_analytics` dataset:

| View Name | Purpose | Refresh Rate |
|-----------|---------|--------------|
| `budget_tracking` | Current month budget vs actual | 4 hours |
| `daily_cost_summary` | Daily cost breakdowns by service/SKU | 4 hours |
| `monthly_cost_by_service` | Monthly aggregated costs | 4 hours |

### BigQuery Connection Settings
- **Project ID:** gen-lang-client-0322370238
- **Dataset:** finops_analytics
- **Location:** EU
- **Cache Duration:** 4 hours (for cost efficiency)
- **Auto-refresh:** Every 12 hours

## Dashboard Layout

```
┌─────────────────┬─────────────────┬─────────────────┐
│ 💰 Current     │ 💵 Budget      │ 📊 Budget       │
│ Month Spend     │ Remaining       │ Usage %         │
│ €X.XX           │ €Y.YY           │ Z%              │
└─────────────────┴─────────────────┴─────────────────┘

┌───────────────────────────────────────────────────────┐
│ 📈 Daily Cost Trend (Last 30 Days)                   │
│ [Line Chart with Reference Line]                      │
└───────────────────────────────────────────────────────┘

┌───────────────────────┬───────────────────────────────┐
│ 🥧 Cost by Service    │ 🎯 Budget Status Gauge       │
│ [Donut Chart]         │ [Gauge Chart]                 │
└───────────────────────┴───────────────────────────────┘

┌───────────────────────────────────────────────────────┐
│ 📋 Top 10 Cost Drivers                                │
│ [Data Table with Conditional Formatting]              │
└───────────────────────────────────────────────────────┘
```

## Component Specifications

### 1. Scorecard: Current Month Spend
**Data Source:** `budget_tracking`

- **Metric:** `actual_cost`
- **Display Name:** "Current Month Spend"
- **Number Format:** Currency (EUR, 2 decimals)
- **Font Size:** 32px
- **Alignment:** Center
- **Background Color:** `#2A2A2A`
- **Text Color:** `#FFFFFF`

### 2. Scorecard: Budget Remaining
**Data Source:** `budget_tracking`

- **Metric:** `remaining_budget`
- **Display Name:** "Budget Remaining"
- **Number Format:** Currency (EUR, 2 decimals)
- **Conditional Formatting:**
  - Value < 1.00: Background `#DB4437` (Red)
  - Value 1.00-2.99: Background `#FF6B00` (Orange)
  - Value ≥ 3.00: Background `#0F9D58` (Green)
- **Font Size:** 32px
- **Alignment:** Center

### 3. Scorecard: Budget Usage %
**Data Source:** `budget_tracking`

- **Metric:** `budget_percentage`
- **Display Name:** "Budget Usage"
- **Number Format:** Percentage (1 decimal)
- **Conditional Formatting:**
  - ≥ 90%: Text `#DB4437` (Red), Bold
  - 75-89%: Text `#FF6B00` (Orange)
  - 50-74%: Text `#F4B400` (Yellow)
  - < 50%: Text `#0F9D58` (Green)
- **Font Size:** 32px

### 4. Time Series Chart: Daily Costs
**Data Source:** `daily_cost_summary`

**Configuration:**
- **Chart Type:** Line chart with data points
- **X-Axis (Dimension):** `usage_date`
  - Format: "MMM DD" (e.g., Dec 13)
  - Date Range: Last 30 days
- **Y-Axis (Metric):** `SUM(total_cost)`
  - Label: "Cost (EUR)"
  - Format: Currency (EUR, 2 decimals)
  - Scale: Linear
- **Line Style:**
  - Color: `#1A73E8` (Google Blue)
  - Width: 3px
  - Data Points: Visible, 6px radius
- **Reference Line:**
  - Value: 0.33 (Daily budget target: 10 / 30)
  - Label: "Daily Budget Target"
  - Style: Dashed, Red (`#DB4437`)
  - Width: 2px
- **Grid Lines:** Yes, light gray
- **Tooltip:** Show date, exact cost, % of daily budget

**Calculated Field:**
```sql
-- % of Daily Budget
(total_cost / 0.33) * 100
```

### 5. Donut Chart: Cost by Service
**Data Source:** `monthly_cost_by_service`

**Configuration:**
- **Chart Type:** Donut (pie with center hole)
- **Dimension:** `service_name`
- **Metric:** `SUM(total_cost)`  
- **Filter:** Current month only
- **Slice Count:** 5 (Top 5 services, rest grouped as "Other")
- **Hole Size:** 40%
- **Colors:** Use Looker default color palette
- **Slice Labels:** 
  - Position: Outside
  - Format: Percentage of total
- **Legend:**
  - Position: Bottom
  - Layout: Horizontal
- **Tooltip:** Service name + exact cost (EUR)

### 6. Gauge Chart: Budget Status
**Data Source:** `budget_tracking`

**Configuration:**
- **Chart Type:** Gauge (semi-circular)
- **Metric:** `budget_percentage`
- **Range:** 0 to 110
- **Color Segments:**
  - 0-50%: `#0F9D58` (Green) - "Healthy"
  - 50-75%: `#F4B400` (Yellow) - "Moderate"
  - 75-90%: `#FF6B00` (Orange) - "High"
  - 90-100%: `#DB4437` (Red) - "Critical"
  - 100-110%: `#A50E0E` (Dark Red) - "Over Budget"
- **Needle Color:** `#FFFFFF` (White)
- **Label:** "Budget Status"
- **Show Value:** Yes, center of gauge

### 7. Data Table: Top Cost Drivers
**Data Source:** `daily_cost_summary`

**Columns:**
1. **Service**
   - Field: `service_name`
   - Width: 25%
   - Text Align: Left

2. **SKU**
   - Field: `sku_description`
   - Width: 40%
   - Text Align: Left
   - Max Characters: Show full description

3. **Cost (EUR)**
   - Field: `SUM(total_cost)`
   - Width: 15%
   - Format: Currency (EUR, 2 decimals)
   - Text Align: Right

4. **% of Budget**
   - Calculated Field: `(total_cost / 10) * 100`
   - Width: 20%
   - Format: Percentage (1 decimal)
   - Text Align: Right
   - **Conditional Formatting:**
     - ≥ 20%: Background `#DB4437`, White text, Bold
     - 10-19%: Background `#FF6B00`, White text
     - < 10%: Default

**Table Settings:**
- **Filter:** Current month (`usage_date` >= CURRENT_MONTH_START)
- **Sort:** Cost (EUR) descending
- **Row Limit:** 10
- **Row Styling:** Alternate row colors (`#2A2A2A` / `#1E1E1E`)
- **Header:** Sticky, bold, `#1A73E8` background
- **Pagination:** Hidden (only 10 rows)

## Styling & Theme

### Global Theme
- **Color Scheme:** Dark mode
- **Background:** `#1E1E1E` (Dark gray)
- **Card Background:** `#2A2A2A`
- **Card Border:** `1px solid #3A3A3A`
- **Border Radius:** 8px
- **Card Shadow:** `0 2px 4px rgba(0,0,0,0.3)`
- **Spacing:** 16px gaps between components

### Typography
- **Primary Font:** Google Sans
- **Fallback:** Roboto, Arial, sans-serif
- **Primary Text:** `#FFFFFF`
- **Secondary Text:** `#B0B0B0`
- **Header Size:** 24px, Bold
- **Body Size:** 14px

### Color Palette
- **Primary:** `#1A73E8` (Google Blue)
- **Success:** `#0F9D58` (Green)
- **Warning:** `#F4B400` (Yellow)
- **Alert:** `#FF6B00` (Orange)
- **Danger:** `#DB4437` (Red)
- **Critical:** `#A50E0E` (Dark Red)

## Filters & Interactivity

### Date Range Filter
- **Type:** Date range selector
- **Default:** Last 30 days
- **Visible:** Yes, top right corner
- **Affects:** All time-based charts

### Service Filter (Optional)
- **Type:** Multi-select dropdown
- **Source:** `service_name` dimension
- **Default:** All services selected
- **Visible:** Yes, next to date range

## Setup Instructions

### Step 1: Create New Report
1. Navigate to [Looker Studio](https://lookerstudio.google.com)
2. Click **"Create"** → **"Report"**
3. When prompted to add data, click **"Create new data source"**

### Step 2: Connect BigQuery - Data Source 1
1. Select **"BigQuery"** connector
2. Authorize Google Cloud access
3. Select:
   - **Project:** gen-lang-client-0322370238
   - **Dataset:** finops_analytics
   - **Table:** budget_tracking
4. Click **"CONNECT"**
5. Rename data source to: "BQ - Budget Tracking"
6. Click **

"ADD TO REPORT"**

### Step 3: Add Additional Data Sources
Repeat Step 2 for:
- **Data Source 2:** `daily_cost_summary` → "BQ - Daily Costs"
- **Data Source 3:** `monthly_cost_by_service` → "BQ - Monthly Costs"

### Step 4: Build Dashboard
1. Set page size to **1600 x 900** (widescreen)
2. Apply dark theme: **Theme & Layout** → Background color `#1E1E1E`
3. Add components in order (scorecards → charts → table)
4. Follow specifications above for each component
5. Adjust spacing and alignment

### Step 5: Configure Settings
1. **Page Settings:**
   - Cache Duration: 4 hours
   - Enable viewer interactions
   - Enable data credentials
2. **Share Settings:**
   - Name: "Zone Calculator PRO - FinOps Cost Monitoring"
   - Anyone with link can view

## Verification Checklist

- [ ] All 3 BigQuery data sources connected
- [ ] 3 scorecards display correct current values
- [ ] Time series chart shows last 30 days with daily budget line
- [ ] Donut chart shows top 5 services from current month
- [ ] Gauge chart correctly color-codes budget percentage
- [ ] Data table shows top 10 cost drivers with proper sorting
- [ ] Conditional formatting works (test with different budget values)
- [ ] Dark theme applied consistently
- [ ] Date range filter affects all time-based components
- [ ] Dashboard loads in < 5 seconds

## Maintenance

### Weekly Tasks
- Review dashboard for cost anomalies
- Check for unexpected service spikes
- Verify data is updating (check "last updated" timestamp)

### Monthly Tasks
- Review budget vs actual variance
- Update budget amount if needed (requires Terraform change)
- Archive current month's data for historical analysis

## Troubleshooting

### "No data available"
- **Cause:** Billing export not enabled or data hasn't populated yet
- **Fix:** Enable BigQuery billing export in GCP Console, wait 24-48 hours

### "Error loading data"
- **Cause:** BigQuery views not created or permissions issue
- **Fix:** Run `terraform apply` in `/infra` directory

### Charts show wrong time period
- **Cause:** Date filter not applied correctly
- **Fix:** Check date dimension field matches `usage_date`

### Costs seem too low/high
- **Cause:** Data might be partial or currency conversion issue
- **Fix:** Verify currency is EUR, check BigQuery raw data

---

**Created:** 2025-12-13  
**Last Updated:** 2025-12-13  
**Owner:** FinOps Team  
**Looker Studio URL:** *(To be added after creation)*
