terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

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
  sensitive   = true
}

# 1. Artifact Registry
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "zone-calculator-repo"
  description   = "Docker repository for Zone Calculator"
  format        = "DOCKER"
}

# 2. Cloud SQL (MySQL)
# CAUTION: Tier db-f1-micro is deprecated in some newer regions but valid for testing.
# For prod, consider db-custom-1-3840 or similar.
resource "google_sql_database_instance" "master" {
  name             = "zone-calc-db-instance-${random_id.db_suffix.hex}"
  database_version = "MYSQL_8_0"
  region           = var.region
  deletion_protection = false # For demo ease, set true for prod

  settings {
    tier = "db-f1-micro"
    availability_type = "ZONAL"
    
    ip_configuration {
      ipv4_enabled    = true # Public IP for GitHub Actions direct access (secure via Auth Proxy preferred)
      # authorized_networks could be added here
    }
  }
}

resource "random_id" "db_suffix" {
  byte_length = 4
}

resource "google_sql_database" "database" {
  name     = "zonecalculator"
  instance = google_sql_database_instance.master.name
}

resource "google_sql_user" "users" {
  name     = "zoneuser"
  instance = google_sql_database_instance.master.name
  password = var.db_password
}

# 3. Cloud Run Service
resource "google_cloud_run_service" "default" {
  name     = var.service_name
  location = var.region

  template {
    spec {
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/${var.service_name}:latest"
        
        env {
          name  = "DATABASE_URL"
          value = "mysql://zoneuser:${var.db_password}@${google_sql_database_instance.master.public_ip_address}/zonecalculator"
        }
        
        env {
          name = "NEXTAUTH_URL"
          value = "TODO_AFTER_DEPLOY" # Needs the URL of this service, circular dep if not careful
        }
         
        env {
          name = "NEXTAUTH_SECRET"
          value = "production_secret_here_change_me"
        }
      }
    }
    
    metadata {
      annotations = {
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.master.connection_name
        "run.googleapis.com/client-name"        = "terraform"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  
  autogenerate_revision_name = true
}

# Allow public access
data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"
    members = [
      "allUsers",
    ]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location    = google_cloud_run_service.default.location
  project     = google_cloud_run_service.default.project
  service     = google_cloud_run_service.default.name
  policy_data = data.google_iam_policy.noauth.policy_data
}

output "service_url" {
  value = google_cloud_run_service.default.status[0].url
}

output "db_instance_connection_name" {
  value = google_sql_database_instance.master.connection_name
}
