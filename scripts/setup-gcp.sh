#!/bin/bash

# Exit on error
set -e

echo "🚀 GCP CI/CD Setup Helper"
echo "This script will create a Service Account and generate the JSON key for GitHub Actions."
echo "You must have the 'gcloud' CLI installed and be logged in ('gcloud auth login')."
echo ""

# 1. Get Project ID
read -p "Enter your GCP Project ID: " PROJECT_ID
if [ -z "$PROJECT_ID" ]; then
  echo "Error: Project ID is required."
  exit 1
fi

echo "✅ Setting project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# 2. Enable APIs
echo "🔄 Enabling necessary APIs (Cloud Run, Artifact Registry, Cloud SQL)..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  compute.googleapis.com \
  iam.googleapis.com \
  cloudbuild.googleapis.com

# 3. Create Service Account
SA_NAME="github-actions-deployer"
echo "👤 Creating Service Account: $SA_NAME..."
gcloud iam service-accounts create $SA_NAME \
  --display-name="GitHub Actions Deployer" || echo "Service account might already exist, continuing..."

SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

# 4. Assign Roles
echo "🛡️ Assigning IAM Roles..."
ROLES=(
  "roles/run.admin"
  "roles/storage.admin"
  "roles/artifactregistry.admin"
  "roles/iam.serviceAccountUser"
  "roles/cloudsql.admin"
)

for ROLE in "${ROLES[@]}"; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" > /dev/null
  echo "   - Assigned $ROLE"
done

# 5. Generate Key
KEY_FILE="gcp-key.json"
echo "Vk Generating Key File ($KEY_FILE)..."
gcloud iam service-accounts keys create $KEY_FILE \
  --iam-account=$SA_EMAIL

echo ""
echo "🎉 SUCCESS!"
echo "----------------------------------------------------------------"
echo "1. GCP_PROJECT_ID: $PROJECT_ID"
echo "2. GCP_SA_KEY: (Content of $KEY_FILE)"
echo ""
echo "👉 Copy the content of '$KEY_FILE' and paste it into GitHub Secret 'GCP_SA_KEY'."
echo "👉 Add '$PROJECT_ID' as GitHub Secret 'GCP_PROJECT_ID'."
echo "----------------------------------------------------------------"
echo "⚠️  WARNING: Keep $KEY_FILE safe or delete it after adding to GitHub!"
