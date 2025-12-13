# Dashboard Configuration - Reference Sheet

## Dashboard 1: FinOps Cost Monitoring

### Data Source
- **Connector:** BigQuery
- **Project ID:** gen-lang-client-0322370238
- **Dataset:** finops_analytics
- **Primary Table:** budget_tracking

### Layout Grid (Responsive)
```
+------------------+------------------+------------------+
| Scorecard 1      | Scorecard 2      | Scorecard 3      |
| Current Spend    | Budget Remaining | Budget Usage %   |
+------------------+------------------+------------------+
| Time Series Chart - Daily Costs (Full Width)          |
|                                                       |
+-------------------------+---------------------------+
| Pie Chart               | Gauge Chart               |
| Cost by Service         | Budget Status             |
+-------------------------+---------------------------+
| Data Table - Top Cost Drivers (Full Width)           |
+-------------------------------------------------------+
```

### Component Specifications

#### Scorecard 1: Current Month Spend
- **Data Source:** budget_tracking
- **Metric:** actual_cost
- **Label:** "Current Month Spend"
- **Format:** Currency (EUR, 2 decimals)
- **Comparison Type:** None
- **Style:** Large number, centered

#### Scorecard 2: Budget Remaining
- **Metric:** remaining_budget
- **Label:** "Budget Remaining"
- **Format:** Currency (EUR, 2 decimals)
- **Conditional Formatting:**
  - < 1 EUR: Red background
  - 1-2 EUR: Orange background
  - > 2 EUR: Green background

#### Scorecard 3: Budget Usage
- **Metric:** budget_percentage
- **Label:** "Budget Usage"
- **Format:** Percentage (1 decimal)
- **Compact Numbers:** On
- **Conditional Formatting:**
  - > 90%: Red
  - 75-90%: Orange
  - 50-75%: Yellow
  - < 50%: Green

#### Time Series Chart: Daily Costs
- **Data Source:** daily_cost_summary
- **Date Range Dimension:** usage_date
- **Metric:** total_cost
- **Date Range:** Last 30 days
- **Chart Type:** Line chart with points
- **Line Color:** #1A73E8 (Google Blue)
- **Line Width:** 3px
- **Reference Line:** 
  - Value: 0.33 (10 EUR / 30 days)
  - Label: "Daily Budget Target"
  - Color: Red, Dashed
- **X-Axis:** Date (format: MMM DD)
- **Y-Axis:** Cost (EUR)
- **Grid Lines:** Yes
- **Tooltip:** Show date, cost, % of daily budget

#### Pie Chart: Cost by Service
- **Data Source:** monthly_cost_by_service
- **Dimension:** service_name
- **Metric:** total_cost
- **Chart Type:** Donut chart
- **Hole Size:** 40%
- **Slice Count:** 5 (show top 5, rest as "Other")
- **Colors:** Use Google's standard palette
- **Labels:** Outside, show percentage
- **Legend:** Bottom, horizontal

#### Gauge Chart: Budget Status
- **Metric:** budget_percentage
- **Min Value:** 0
- **Max Value:** 110
- **Color Ranges:**
  - 0-50%: #0F9D58 (Green)
  - 50-75%: #F4B400 (Yellow)
  - 75-90%: #FF6B00 (Orange)
  - 90-100%: #DB4437 (Red)
  - 100-110%: #A50E0E (Dark Red)
- **Label:** "Budget Status"

#### Data Table: Top Cost Drivers
- **Data Source:** daily_cost_summary
- **Columns:**
  1. service_name (rename: "Service")
  2. sku_description (rename: "SKU")
  3. total_cost (rename: "Cost", format: EUR)
  4. Calculated Field: (total_cost / 10) * 100 (rename: "% of Budget")
- **Sort:** total_cost descending
- **Row Limit:** 10
- **Row Highlighting:** Alternate rows
- **Conditional Formatting:**
  - % of Budget > 20%: Red text, bold

### Theme & Style
- **Theme:** Dark
- **Background:** #1E1E1E
- **Card Background:** #2A2A2A with border
- **Text Color:** #FFFFFF primary, #B0B0B0 secondary
- **Font:** Google Sans
- **Border Radius:** 8px
- **Shadow:** Subtle

---

## Dashboard 2: Tagging Compliance

### Data Source
- **Connector:** BigQuery
- **Project ID:** gen-lang-client-0322370238
- **Dataset:** finops_analytics
- **Primary Table:** tagging_compliance

### Layout Grid
```
+------------------+------------------+------------------+
| Scorecard 1      | Scorecard 2      | Scorecard 3      |
| Compliance %     | Untagged Res.    | Cost at Risk     |
+------------------+------------------+------------------+
| Stacked Bar Chart - Compliance by Service             |
|                                                       |
+-------------------------+---------------------------+
| Gauge Chart             | Sparkline/Trend           |
| Compliance Status       | (Future: 30-day trend)    |
+-------------------------+---------------------------+
| Data Table - Non-Compliant Services (Full Width)     |
+-------------------------------------------------------+
```

### Component Specifications

#### Scorecard 1: Overall Compliance
- **Metric:** AVG(compliance_percentage)
- **Label:** "Overall Compliance"
- **Format:** Percentage (1 decimal)
- **Conditional Formatting:**
  - > 95%: Green
  - 80-95%: Yellow
  - 60-80%: Orange
  - < 60%: Red

#### Scorecard 2: Untagged Resources
- **Metric:** SUM(untagged_resources)
- **Label:** "Untagged Resources"
- **Format:** Number (no decimals)
- **Icon:** Warning icon if > 10

#### Scorecard 3: Cost at Risk
- **Metric:** SUM(untagged_cost)
- **Label:** "Cost at Risk (Untagged)"
- **Format:** Currency (EUR, 2 decimals)

#### Stacked Bar Chart: Compliance by Service
- **Dimension:** service_name
- **Metrics:** 
  1. tagged_resources (Green, label: "Tagged")
  2. untagged_resources (Red, label: "Untagged")
- **Chart Type:** Horizontal stacked bar
- **Orientation:** Horizontal
- **Sort:** By total_resources descending
- **Bar Height:** 30px
- **Labels:** Show count inside bars
- **Colors:**
  - Tagged: #0F9D58 (Green)
  - Untagged: #DB4437 (Red)

#### Gauge Chart: Compliance Status
- **Metric:** AVG(compliance_percentage)
- **Type:** Semi-circular gauge
- **Min:** 0
- **Max:** 100
- **Ranges:**
  - 0-60%: Red
  - 60-80%: Orange
  - 80-95%: Yellow
  - 95-100%: Green
- **Label:** "Compliance"
- **Needle Color:** Black

#### Data Table: Non-Compliant Services
- **Filter:** compliance_percentage < 100
- **Columns:**
  1. service_name → "Service"
  2. total_resources → "Total Resources"
  3. tagged_resources → "Tagged"
  4. untagged_resources → "Untagged" (Red text)
  5. compliance_percentage → "Compliance %" (format: %)
  6. untagged_cost → "Cost at Risk" (format: EUR)
- **Sort:** untagged_cost descending
- **Row Limit:** 20
- **Conditional Formatting:**
  - Compliance % < 50%: Red row background
  - Compliance % 50-80%: Orange text
  - Untagged > 10: Bold

### Theme
- **Theme:** Dark (same as FinOps)
- **Accent Color:** Orange/Red for alerts
- **Primary:** Green for compliant items

---

## Data Source Setup (BigQuery)

### Authentication
- Use your Google account logged into GCP
- Ensure you have BigQuery Data Viewer role

### Data Freshness
- **Cache Duration:** 4 hours (for cost efficiency)
- **Auto-refresh:** Every 12 hours
- Note: Billing data updates once per day

### Calculated Fields (If Needed)

#### For FinOps Dashboard:
```sql
-- Daily Budget Target
10 / 30

-- Percentage of Budget (for table)
(total_cost / 10) * 100
```

#### For Tagging Dashboard:
```sql
-- Compliance Status Text
CASE
  WHEN AVG(compliance_percentage) >= 95 THEN "Excellent"
  WHEN AVG(compliance_percentage) >= 80 THEN "Good"
  WHEN AVG(compliance_percentage) >= 60 THEN "Needs Work"
  ELSE "Critical"
END
```

---

## Sharing & Permissions

### Dashboard 1: FinOps
- **Name:** "Zone Calculator PRO - FinOps Cost Monitoring"
- **Share With:**
  - Your email: Owner
  - Team members: Viewer
- **Link Sharing:** Anyone with link can view
- **Embed:** Disabled (contains sensitive cost data)

### Dashboard 2: Tagging
- **Name:** "Zone Calculator PRO - Tagging Compliance"
- **Share With:**
  - Your email: Owner
  - DevOps team: Can edit
  - Other stakeholders: Viewer
- **Link Sharing:** Anyone with link can view
- **Embed:** Enabled (for internal wiki)

---

## Scheduled Emails

### FinOps Dashboard
- **Recipients:** Your email
- **Frequency:** Weekly (Monday 9:00 AM)
- **Format:** PDF attachment
- **Subject:** "Weekly FinOps Report - Zone Calculator PRO"
- **Include:** Full dashboard

### Tagging Dashboard
- **Recipients:** DevOps team
- **Frequency:** Bi-weekly (Tuesday 10:00 AM)
- **Format:** Link only
- **Condition:** Only send if compliance < 90%

---

## Notes for Live Creation

1. **Start Simple:** Create layout first, then add data
2. **Test Queries:** Run BigQuery queries in console first
3. **Dummy Data:** If billing data not ready, use mock data source
4. **Styling Last:** Get functionality working, then make it pretty
5. **Mobile:** Test responsive design on mobile view
6. **Performance:** Keep under 10 components per dashboard for speed

---

## Quick Reference Commands

```sql
-- Test if billing data exists
SELECT COUNT(*) as row_count
FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY));

-- Test budget_tracking view
SELECT * FROM `gen-lang-client-0322370238.finops_analytics.budget_tracking`
LIMIT 10;

-- Test tagging_compliance view
SELECT * FROM `gen-lang-client-0322370238.finops_analytics.tagging_compliance`
ORDER BY total_cost DESC
LIMIT 10;
```
