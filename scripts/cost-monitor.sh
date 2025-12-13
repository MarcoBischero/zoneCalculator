#!/bin/bash
# FinOps Cost Monitoring Script
# Usage: ./cost-monitor.sh [--dry-run]

set -e

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-gen-lang-client-0322370238}"
BUDGET_AMOUNT="${BUDGET_EUR:-10}"
DATE=$(date +%Y-%m-%d)
OUTPUT_DIR="./cost-reports"
DRY_RUN=false

# Parse arguments
if [[ "$1" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 Running in DRY RUN mode"
fi

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}❌ gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install${NC}"
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo -e "${YELLOW}⚠️  jq not found. Installing via brew...${NC}"
  brew install jq
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💰 FinOps Cost Monitor - Zone Calculator PRO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📅 Date: ${DATE}"
echo "🎯 Project: ${PROJECT_ID}"
echo "💵 Budget: ${BUDGET_AMOUNT} EUR/month"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo "ℹ️  This is a dry run - no actual GCP API calls will be made"
  echo ""
  echo "Example commands that would be executed:"
  echo "  gcloud billing projects describe ${PROJECT_ID}"
  echo "  gcloud alpha billing budgets list --billing-account=XXXXXX"
  echo "  gcloud compute instances list --project=${PROJECT_ID}"
  echo ""
  exit 0
fi

# Create output directory
mkdir -p "${OUTPUT_DIR}"

# Get billing account
echo "🔍 Fetching billing account..."
BILLING_ACCOUNT=$(gcloud billing projects describe "${PROJECT_ID}" \
  --format="value(billingAccountName)" 2>/dev/null | sed 's/billingAccounts\///')

if [ -z "$BILLING_ACCOUNT" ]; then
  echo -e "${RED}❌ No billing account found for project ${PROJECT_ID}${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Billing Account: ${BILLING_ACCOUNT}${NC}"
echo ""

# Get current month costs
echo "📊 Fetching current month costs..."
START_DATE=$(date -u -v1d +%Y-%m-%d)  # First day of current month
END_DATE=$(date -u +%Y-%m-%d)         # Today

# Note: This requires BigQuery export to be set up
# For now, we'll show a placeholder message
echo -e "${YELLOW}ℹ️  To get detailed cost data, enable BigQuery export:${NC}"
echo "   https://console.cloud.google.com/billing/${BILLING_ACCOUNT}/export"
echo ""

# List current budgets
echo "📋 Current Budgets:"
gcloud alpha billing budgets list \
  --billing-account="${BILLING_ACCOUNT}" \
  --filter="displayName:'Zone Calculator'" \
  --format="table(displayName,amount.specifiedAmount.units,budgetFilter.projects)" 2>/dev/null || \
  echo -e "${YELLOW}⚠️  No budgets configured yet${NC}"
echo ""

# List Cloud Run services
echo "☁️  Cloud Run Services:"
gcloud run services list \
  --project="${PROJECT_ID}" \
  --platform=managed \
  --format="table(metadata.name,status.url,metadata.labels.cost-center)" 2>/dev/null || \
  echo -e "${YELLOW}⚠️  No Cloud Run services found${NC}"
echo ""

# List Cloud SQL instances
echo "🗄️  Cloud SQL Instances:"
gcloud sql instances list \
  --project="${PROJECT_ID}" \
  --format="table(name,databaseVersion,settings.tier,state)" 2>/dev/null || \
  echo -e "${YELLOW}⚠️  No Cloud SQL instances found${NC}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Cost monitoring check complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Next steps:"
echo "  1. Enable BigQuery billing export for detailed cost tracking"
echo "  2. Set up budget alerts via: terraform apply -var-file=terraform.tfvars"
echo "  3. Schedule this script to run daily via cron"
echo ""
