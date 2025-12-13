# programmatic dashboard definition for Cost Control

resource "google_monitoring_dashboard" "cost_control_dashboard" {
  dashboard_json = <<EOF
{
  "displayName": "FinOps: Cost Control & Billing",
  "gridLayout": {
    "columns": "2",
    "widgets": [
      {
        "title": "Estimated Month-to-Date Cost",
        "scorecard": {
          "timeSeriesQuery": {
            "timeSeriesQueryLanguage": "SELECT fetch billing.googleapis.com/billing/total_cost | group_by [], sum(value.total_cost) | within 1h"
          },
          "sparkChartView": "SPARK_CHART_VIEW_SPARK_LINE"
        }
      },
      {
        "title": "Forecasted Month End Cost",
        "scorecard": {
          "timeSeriesQuery": {
            "timeSeriesQueryLanguage": "SELECT fetch billing.googleapis.com/billing/total_cost | group_by [], sum(value.total_cost) | prediction 30d"
          },
          "sparkChartView": "SPARK_CHART_VIEW_SPARK_BAR"
        }
      },
      {
        "title": "Daily Cost Trend (Last 30 Days)",
        "xyChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesQueryLanguage": "SELECT fetch billing.googleapis.com/billing/total_cost | group_by [resource.service_name], sum(value.total_cost) | align sum(1d) | within 30d"
              },
              "plotType": "STACKED_BAR",
              "legendTemplate": "$${resource.labels.service_name}"
            }
          ],
          "timeshiftDuration": "0s",
          "yAxis": {
            "label": "Cost",
            "scale": "LINEAR"
          }
        }
      },
      {
        "title": "Cost by Service (Top 5)",
        "pieChart": {
          "dataSets": [
            {
              "timeSeriesQuery": {
                "timeSeriesQueryLanguage": "SELECT fetch billing.googleapis.com/billing/total_cost | group_by [resource.service_name], sum(value.total_cost) | within 30d | top 5"
              }
            }
          ]
        }
      },
      {
         "title": "Budget Compliance",
         "text": {
           "content": "Budget Target: ${var.budget_amount} EUR\nAlerts configured at: 50%, 75%, 90%, 100%, 110%",
           "format": "MARKDOWN"
         }
      },
      {
          "title": "Link to Looker Studio (Detailed Analytics)",
          "text": {
              "content": "[Open Looker Studio](https://lookerstudio.google.com/)\nUse the BigQuery views in dataset: `finops_analytics`",
              "format": "MARKDOWN"
          }
      }
    ]
  }
}
EOF
}
