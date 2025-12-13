# Quick Start - Looker Studio Dashboards

## 🚀 Setup Rapido (15 minuti)

### Step 1: Deploy Infrastruttura (5 min)

```bash
cd /Users/marco/Downloads/zoneCalculatorPRO/infra

# Verifica configurazione
terraform validate

# Crea file con le tue variabili
cp terraform.tfvars.example terraform.tfvars

# EDITA terraform.tfvars con:
# - billing_account_id (trova su https://console.cloud.google.com/billing)
# - alert_email (la tua email)
# - db_password (password sicura)

# Applica configurazione
terraform plan   # Preview
terraform apply  # Conferma con 'yes'
```

Questo crea:
- ✅ BigQuery datasets per billing data
- ✅ Views pre-configurate per analytics
- ✅ Budget alerts a 10 EUR
- ✅ Tagging su tutte le risorse

### Step 2: Attiva Billing Export (2 min)

```bash
# Vai su GCP Console
open "https://console.cloud.google.com/billing/01C6D7-2B5F7E-3AA8AA/export"

# Nel pannello:
# 1. Click "EDIT SETTINGS"
# 2. Enable "Detailed usage cost"
# 3. Project: gen-lang-client-0322370238
# 4. Dataset: billing_export
# 5. Click "SAVE"
```

⚠️ **Nota:** I dati impiegano 24-48h per apparire

### Step 3: Crea Dashboard FinOps (4 min)

```bash
# Apri Looker Studio
open "https://lookerstudio.google.com"
```

**Nel browser:**
1. Click **"Create"** → **"Report"**
2. Click **"BigQuery"** connector
3. Seleziona:
   - Project: `gen-lang-client-0322370238`
   - Dataset: `finops_analytics`
   - Table: `budget_tracking`
4. Click **"ADD"** → **"ADD TO REPORT"**

**Aggiungi componenti:**

| Tipo | Config | Posizione |
|------|--------|-----------|
| **Scorecard** | Metric: `actual_cost`<br>Label: "Spesa Corrente" | Top-left |
| **Scorecard** | Metric: `remaining_budget`<br>Label: "Budget Residuo" | Top-center |
| **Scorecard** | Metric: `budget_percentage`<br>Label: "Utilizzo %" | Top-right |
| **Time Series** | Data source: `daily_cost_summary`<br>Date: `usage_date`<br>Metric: `total_cost` | Center |
| **Pie Chart** | Data source: `monthly_cost_by_service`<br>Dimension: `service_name`<br>Metric: `total_cost` | Bottom-left |
| **Table** | Data source: `daily_cost_summary`<br>Columns: service, SKU, cost | Bottom-right |

**Applica tema:**
- Tema: **Dark**
- Colori: Google Blue (#1A73E8)

### Step 4: Crea Dashboard Tagging Compliance (4 min)

```bash
# Looker Studio (stesso browser)
# Click "Create" → "Report"
```

**Setup:**
1. Connector: **BigQuery**
2. Dataset: `finops_analytics`
3. Table: `tagging_compliance`
4. Click **"ADD TO REPORT"**

**Aggiungi componenti:**

| Tipo | Metric/Dimension | Label |
|------|-----------------|-------|
| **Scorecard** | `AVG(compliance_percentage)` | "Compliance %" |
| **Scorecard** | `SUM(untagged_resources)` | "Risorse Non Tagged" |
| **Scorecard** | `SUM(untagged_cost)` | "Costo a Rischio" |
| **Bar Chart** | Dimension: `service_name`<br>Metrics: `tagged_resources`, `untagged_resources` | "Per Servizio" |
| **Table** | Columns: service, total, tagged, untagged, compliance%, cost | "Dettaglio" |

---

## 📊 Screenshot Dashboard

### Dashboard 1: FinOps Cost Monitoring

![FinOps Dashboard](/Users/marco/.gemini/antigravity/brain/0614f04e-624b-4116-aff7-f3e5e8ca707b/finops_dashboard_mockup_1765594572981.png)

**Componenti:**
- 🟢 Spesa corrente vs Budget
- 📈 Trend giornaliero ultimi 30 giorni  
- 🥧 Breakdown costi per servizio
- 🎯 Gauge status budget
- 📋 Top cost drivers

### Dashboard 2: Tagging Compliance

![Tagging Dashboard](/Users/marco/.gemini/antigravity/brain/0614f04e-624b-4116-aff7-f3e5e8ca707b/tagging_compliance_dashboard_1765594599100.png)

**Componenti:**
- 🏷️ Compliance % globale
- ⚠️ Risorse non tagged
- 💰 Costo a rischio
- 📊 Compliance per servizio
- 📋 Servizi non compliant

---

## ✅ Checklist Post-Setup

- [ ] Terraform apply completato senza errori
- [ ] Billing export abilitato su GCP Console
- [ ] Dashboard FinOps creata e funzionante
- [ ] Dashboard Tagging creata e funzionante
- [ ] Email alert configurata
- [ ] Scheduled report settimanali attivi

---

## 🔧 Troubleshooting

### "No data in dashboards"
**Causa:** Billing export ancora non popolato  
**Soluzione:** Aspetta 24-48h. Nel frattempo puoi costruire il layout.

### "Permission denied on BigQuery"
**Causa:** Account non ha accesso  
**Soluzione:**
```bash
gcloud projects add-iam-policy-binding gen-lang-client-0322370238 \
  --member="user:YOUR_EMAIL" \
  --role="roles/bigquery.dataViewer"
```

### "Terraform apply fails on budget resource"
**Causa:** Billing account ID non corretto  
**Soluzione:** Verifica ID su https://console.cloud.google.com/billing

---

## 📅 Manutenzione

### Giornaliera
- ✅ Check rapido dashboard FinOps

### Settimanale  
- ✅ Review email alert ricevute
- ✅ Verifica tagging compliance
- ✅ Tag nuove risorse non compliant

### Mensile
- ✅ Analisi trend costi
- ✅ Ottimizzazione risorse costose
- ✅ Review budget vs actual

---

## 🔗 Link Utili

- [GCP Billing](https://console.cloud.google.com/billing)
- [BigQuery Console](https://console.cloud.google.com/bigquery)
- [Looker Studio](https://lookerstudio.google.com)
- [Dashboard FinOps](#) ← Bookmarkare dopo creazione
- [Dashboard Tagging](#) ← Bookmarkare dopo creazione
