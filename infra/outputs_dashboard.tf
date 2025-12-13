
output "dashboard_id" {
  description = "ID of the Cloud Monitoring Dashboard"
  value       = google_monitoring_dashboard.cost_control_dashboard.id
}

output "dashboard_link" {
    description = "Deep link to the dashboard"
    value = "https://console.cloud.google.com/monitoring/dashboards/resource/${google_monitoring_dashboard.cost_control_dashboard.id}"
}
