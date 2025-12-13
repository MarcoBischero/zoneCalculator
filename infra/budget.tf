# FinOps: Budget and Billing Alerts Configuration

# Notification Channel for Email Alerts
resource "google_monitoring_notification_channel" "email" {
  display_name = "FinOps Budget Alert Email"
  type         = "email"
  
  labels = {
    email_address = var.alert_email
  }
  
  enabled = true
}

# Pub/Sub Topic for Budget Alerts (for future automation)
resource "google_pubsub_topic" "budget_alerts" {
  name = "budget-alerts"
  
  labels = {
    environment = "production"
    managed-by  = "terraform"
    purpose     = "finops-alerts"
  }
}

# Budget Configuration with Multiple Alert Thresholds
resource "google_billing_budget" "zone_calc_budget" {
  billing_account = var.billing_account_id
  display_name    = "Zone Calculator Pro - Monthly Budget"
  
  budget_filter {
    projects = ["projects/${var.project_id}"]
    
    # Filter only current and forecasted costs
    credit_types_treatment = "INCLUDE_ALL_CREDITS"
  }
  
  amount {
    specified_amount {
      currency_code = "EUR"
      units         = tostring(var.budget_amount)
    }
  }
  
  # Alert at 50% of budget (5 EUR)
  threshold_rules {
    threshold_percent = 0.5
    spend_basis       = "CURRENT_SPEND"
  }
  
  # Alert at 75% of budget (7.5 EUR)
  threshold_rules {
    threshold_percent = 0.75
    spend_basis       = "CURRENT_SPEND"
  }
  
  # Alert at 90% of budget (9 EUR)
  threshold_rules {
    threshold_percent = 0.9
    spend_basis       = "CURRENT_SPEND"
  }
  
  # Alert at 100% of budget (10 EUR)
  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "CURRENT_SPEND"
  }
  
  # Alert at 110% (forecasted overspend)
  threshold_rules {
    threshold_percent = 1.1
    spend_basis       = "FORECASTED_SPEND"
  }
  
  all_updates_rule {
    # Send email notifications
    monitoring_notification_channels = [
      google_monitoring_notification_channel.email.id
    ]
    
    # Publish to Pub/Sub for potential automation
    pubsub_topic = google_pubsub_topic.budget_alerts.id
    
    # Disable email for specific threshold updates (reduce noise)
    disable_default_iam_recipients = false
  }
}

# Output budget information
output "budget_name" {
  description = "Name of the created budget"
  value       = google_billing_budget.zone_calc_budget.display_name
}

output "budget_alert_email" {
  description = "Email configured for budget alerts"
  value       = var.alert_email
}

output "pubsub_topic_budget_alerts" {
  description = "Pub/Sub topic for budget alerts"
  value       = google_pubsub_topic.budget_alerts.name
}
