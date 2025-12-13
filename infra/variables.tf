variable "project_id" {
  description = "The GCP Project ID"
  type        = string
}

variable "region" {
  description = "Region for resources"
  type        = string
  default     = "europe-west1"
}

variable "service_name" {
  description = "Cloud Run Service Name"
  type        = string
  default     = "zone-calculator-pro"
}

variable "db_password" {
  description = "Password for the database user"
  type        = string
}


# FinOps Variables
variable "billing_account_id" {
  description = "GCP Billing Account ID (format: XXXXXX-XXXXXX-XXXXXX)"
  type        = string
}

variable "budget_amount" {
  description = "Monthly budget in EUR"
  type        = number
  default     = 10
}

variable "alert_email" {
  description = "Email address for budget alerts"
  type        = string
}

variable "max_cloud_run_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 1
}

variable "cloud_run_memory" {
  description = "Memory limit for Cloud Run (e.g., 256Mi, 512Mi)"
  type        = string
  default     = "256Mi"
}

variable "cloud_run_cpu" {
  description = "CPU limit for Cloud Run (e.g., 1000m = 1 CPU)"
  type        = string
  default     = "1000m"
}

variable "enable_sql_backups" {
  description = "Enable Cloud SQL automated backups (increases costs)"
  type        = bool
  default     = false
}
