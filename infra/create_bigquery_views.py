#!/usr/bin/env python3
"""
BigQuery Views Creation Script
Creates the 4 FinOps analytics views in BigQuery
"""

import json
import sys
from google.cloud import bigquery
from google.oauth2 import service_account

# Project and dataset configuration
PROJECT_ID = "gen-lang-client-0322370238"
DATASET_ID = "finops_analytics"

# View definitions
VIEWS = {
    "daily_cost_summary": """
        SELECT
            DATE(usage_start_time) as usage_date,
            service.description as service_name,
            sku.description as sku_description,
            project.id as project_id,
            project.name as project_name,
            ARRAY_TO_STRING(project.labels, ', ') as project_labels,
            SUM(cost) as total_cost,
            currency as currency
        FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
        WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY))
        GROUP BY usage_date, service_name, sku_description, project_id, project_name, project_labels, currency
        ORDER BY usage_date DESC, total_cost DESC
    """,
    
    "monthly_cost_by_service": """
        SELECT
            FORMAT_DATE('%Y-%m', DATE(usage_start_time)) as month,
            service.description as service_name,
            SUM(cost) as total_cost,
            currency
        FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
        WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH))
        GROUP BY month, service_name, currency
        ORDER BY month DESC, total_cost DESC
    """,
    
    "budget_tracking": """
        WITH monthly_costs AS (
            SELECT
                FORMAT_DATE('%Y-%m', DATE(usage_start_time)) as month,
                SUM(cost) as actual_cost
            FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
            WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_TRUNC(CURRENT_DATE(), MONTH))
            GROUP BY month
        )
        SELECT
            month,
            actual_cost,
            10 as budget_amount,
            ROUND((actual_cost / 10) * 100, 2) as budget_percentage,
            10 - actual_cost as remaining_budget,
            CASE
                WHEN actual_cost >= 10 THEN 'Over Budget'
                WHEN actual_cost >= 10 * 0.9 THEN 'Critical (90%+)'
                WHEN actual_cost >= 10 * 0.75 THEN 'High (75%+)'
                WHEN actual_cost >= 10 * 0.5 THEN 'Medium (50%+)'
                ELSE 'Low (<50%)'
            END as status
        FROM monthly_costs
        ORDER BY month DESC
    """,
    
    "tagging_compliance": """
        WITH resource_tags AS (
            SELECT
                project.id as project_id,
                service.description as service_name,
                labels,
                cost
            FROM `gen-lang-client-0322370238.billing_export.gcp_billing_export_v1_*`
            WHERE _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
                AND cost > 0
        )
        SELECT
            service_name,
            COUNT(*) as total_resources,
            COUNTIF(EXISTS(SELECT 1 FROM UNNEST(labels) WHERE key = 'cost-center')) as compliant_resources,
            COUNTIF(NOT EXISTS(SELECT 1 FROM UNNEST(labels) WHERE key = 'cost-center')) as non_compliant_resources,
            ROUND(SAFE_DIVIDE(COUNTIF(EXISTS(SELECT 1 FROM UNNEST(labels) WHERE key = 'cost-center')), COUNT(*)) * 100, 2) as compliance_percentage,
            SUM(cost) as total_cost,
            SUM(IF(NOT EXISTS(SELECT 1 FROM UNNEST(labels) WHERE key = 'cost-center'), cost, 0)) as non_compliant_cost
        FROM resource_tags
        GROUP BY service_name
        ORDER BY total_cost DESC
    """
}

def create_views():
    """Create all BigQuery views"""
    try:
        # Load service account credentials
        with open('gcp-key.json', 'r') as f:
            key_data = json.load(f)
        
        credentials = service_account.Credentials.from_service_account_info(key_data)
        client = bigquery.Client(credentials=credentials, project=PROJECT_ID)
        
        print(f"✓ Authenticated with service account: {key_data.get('client_email')}")
        print(f"✓ Project: {PROJECT_ID}")
        print(f"✓ Dataset: {DATASET_ID}\n")
        
        # Create each view
        for view_name, query in VIEWS.items():
            view_id = f"{PROJECT_ID}.{DATASET_ID}.{view_name}"
            
            try:
                view = bigquery.Table(view_id)
                view.view_query = query.strip()
                
                # Create or replace the view
                view = client.create_table(view, exists_ok=True)
                print(f"✓ Created view: {view_name}")
                
            except Exception as e:
                print(f"✗ Error creating view {view_name}: {str(e)}")
                return False
        
        print(f"\n✓ Successfully created all {len(VIEWS)} views!")
        
        # Verify views exist
        print("\nVerifying views...")
        dataset_ref = client.dataset(DATASET_ID)
        tables = list(client.list_tables(dataset_ref))
        
        view_count = sum(1 for table in tables if table.table_type == 'VIEW')
        print(f"✓ Found {view_count} views in {DATASET_ID} dataset")
        
        return True
        
    except FileNotFoundError:
        print("✗ Error: gcp-key.json not found")
        print("Please ensure the service account key file exists in the current directory")
        return False
    except json.JSONDecodeError:
        print("✗ Error: gcp-key.json is not valid JSON")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    success = create_views()
    sys.exit(0 if success else 1)
