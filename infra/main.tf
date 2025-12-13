# Terraform 1.x+ Configuration
# Modern, secure configuration for GCP

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}



# 1. Artifact Registry
resource "google_artifact_registry_repository" "repo" {
  location      = var.region
  repository_id = "zone-calculator-repo"
  description   = "Docker repository for Zone Calculator"
  format        = "DOCKER"
}

# 2. Cloud SQL (MySQL)
# FinOps: Minimal configuration for cost reduction
# WARNING: Backups disabled - manual backups recommended
resource "google_sql_database_instance" "master" {
  name                = "zone-calc-db-instance-${random_id.db_suffix.hex}"
  database_version    = "MYSQL_8_0"
  region              = var.region
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    
    disk_autoresize       = true
    disk_autoresize_limit = 10
    disk_size             = 10
    disk_type             = "PD_SSD"
    
    # FinOps: Backup configuration
    backup_configuration {
      enabled            = var.enable_sql_backups
      binary_log_enabled = false
    }
    
    # Maintenance window
    maintenance_window {
      day          = 7
      hour         = 3
      update_track = "stable"
    }
    
    ip_configuration {
      ipv4_enabled = true
    }
    
    # Instance labels (inside settings for SQL)
    user_labels = {
      environment  = "production"
      application  = "zone-calculator-pro"
      managed-by   = "terraform"
      cost-center  = "finops"
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
    metadata {
      annotations = {
        # FinOps: Aggressive cost minimization
        "autoscaling.knative.dev/maxScale"        = tostring(var.max_cloud_run_instances)
        "autoscaling.knative.dev/minScale"        = "0"
        "run.googleapis.com/cpu-throttling"       = "true"
        "run.googleapis.com/startup-cpu-boost"    = "false"
        "run.googleapis.com/cpu-allocation"       = "only-during-request-processing"
        "run.googleapis.com/cloudsql-instances"   = google_sql_database_instance.master.connection_name
        "run.googleapis.com/client-name"          = "terraform"
      }
      
      labels = {
        environment  = "production"
        application  = "zone-calculator-pro"
        managed-by   = "terraform"
        cost-center  = "finops"
      }
    }
    
    spec {
      container_concurrency = 100
      timeout_seconds       = 30
      
      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.repo.repository_id}/${var.service_name}:latest"
        
        resources {
          limits = {
            cpu    = var.cloud_run_cpu
            memory = var.cloud_run_memory
          }
        }
        
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
