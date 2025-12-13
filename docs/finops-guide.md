# FinOps Guide - Zone Calculator PRO

Guida completa al sistema di Financial Operations configurato per il progetto GCP.

## 📋 Configurazione Attuale

### Budget
- **Limite Mensile:** 10 EUR
- **Alert Configurati:**
  - 50% (5 EUR) - Primo avviso
  - 75% (7.5 EUR) - Attenzione
  - 90% (9 EUR) - Vicino al limite
  - 100% (10 EUR) - Budget raggiunto
  - 110% (forecasted) - Proiezione di superamento

### Cloud Run
- **Max Istanze:** 1 (no auto-scaling)
- **Min Istanze:** 0 (scale-to-zero quando non in uso)
- **Memoria:** 256Mi
- **CPU:** 1000m (1 vCPU)
- **Concurrency:** 100 richieste/istanza
- **Timeout:** 30 secondi

### Cloud SQL
- **Tier:** db-f1-micro (~7-8 EUR/mese)
- **Backup:** DISABILITATI (risparmio ~30%)
- **Disk:** 10GB SSD con autoresize limitato a 10GB
- **Replica:** Nessuna
- **High Availability:** Disabilitata (ZONAL)

## 🚨 Limitazioni della Configurazione Low-Cost

> **IMPORTANTE:** Questa configurazione è ottimizzata per costi minimi, non per produzione ad alto traffico.

### Limitazioni Cloud Run
- ⚠️ **Zero High Availability:** Solo 1 istanza = downtime durante i deploy
- ⚠️ **Picchi di Traffico:** Richieste > 100 concurrent causeranno timeout
- ⚠️ **Cold Start:** Con scale-to-zero, prima richiesta può richiedere 3-5 secondi

### Limitazioni Cloud SQL
- 🔴 **ZERO BACKUP AUTOMATICI:** Rischio perdita dati in caso di failure
- 🔴 **Point-in-time Recovery:** NON disponibile
- ⚠️ **Performance:** db-f1-micro condivide CPU, possibili rallentamenti

## 📊 Dashboard e Monitoring

### GCP Console - Billing Dashboard
1. Vai a: https://console.cloud.google.com/billing
2. Seleziona il tuo billing account
3. **Reports:** Visualizza costi giornalieri e mensili
4. **Budgets & alerts:** Verifica budget "Zone Calculator Pro"

### Budget Alert Settings
1. Vai a: https://console.cloud.google.com/billing/budgets
2. Cerca "Zone Calculator Pro - Monthly Budget"
3. Verifica:
   - ✅ Budget: 10 EUR
   - ✅ Email notifications attive
   - ✅ Alert su Pub/Sub topic `budget-alerts`

### Cloud Run Monitoring
1. Vai a: https://console.cloud.google.com/run
2. Seleziona `zone-calculator-pro`
3. Tab **METRICS:**
   - Request count (dovrebbe essere basso)
   - Instance count (max 1)
   - CPU utilization
   - Memory utilization

### Cloud SQL Monitoring
1. Vai a: https://console.cloud.google.com/sql/instances
2. Seleziona il tuo instance
3. Tab **MONITORING:**
   - CPU utilization
   - Disk usage (CRITICO: limite 10GB)
   - Connections

## 🛠️ Script di Monitoring

### Cost Monitor (Bash)
```bash
# Check rapido dello stato dei costi
cd /Users/marco/Downloads/zoneCalculatorPRO
./scripts/cost-monitor.sh

# Dry run (senza chiamate API reali)
./scripts/cost-monitor.sh --dry-run
```

Questo script mostra:
- Billing account collegato
- Budget configurati
- Servizi Cloud Run attivi
- Istanze Cloud SQL attive

### Cost Report (Node.js)
```bash
# Genera report dettagliato con raccomandazioni
node scripts/cost-report.js

# Test mode (usa dati mock)
node scripts/cost-report.js --test-mode
```

Report generato in: `cost-reports/cost-report-YYYY-MM-DD.md`

### Scheduling Automatico
Aggiungi al crontab per esecuzione settimanale:

```bash
# Apri crontab
crontab -e

# Aggiungi questa linea (ogni lunedì alle 9:00)
0 9 * * 1 cd /Users/marco/Downloads/zoneCalculatorPRO && ./scripts/cost-monitor.sh > /tmp/cost-monitor.log 2>&1
```

## 📧 Come Interpretare le Email di Alert

### Email a 50% del Budget (5 EUR)
**Stato:** 🟢 OK  
**Azione:** Nessuna azione richiesta, solo informativo

### Email a 75% del Budget (7.5 EUR)
**Stato:** 🟡 ATTENZIONE  
**Azioni:**
1. Esegui `node scripts/cost-report.js` per analisi dettagliata
2. Verifica Cloud SQL disk usage
3. Controlla Cloud Run request count per picchi anomali

### Email a 90% del Budget (9 EUR)
**Stato:** 🟠 ALLERTA  
**Azioni IMMEDIATE:**
1. Controlla traffico Cloud Run per attacchi/spam
2. Verifica database non stia crescendo inaspettatamente
3. Considera di disabilitare temporaneamente servizi non essenziali

### Email a 100% del Budget (10 EUR)
**Stato:** 🔴 CRITICO  
**Azioni URGENTI:**
1. **STOP DEPLOY:** Non fare nuovi deploy fino a fine mese
2. Review completo di tutti i servizi attivi
3. Considera di aumentare il budget o shutdown fino a prossimo mese

## 💡 Best Practices per Contenere i Costi

### Database Optimization
```sql
-- Pulisci dati vecchi periodicamente
DELETE FROM sessioni WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Ottimizza tabelle per ridurre spazio
OPTIMIZE TABLE pasti;
OPTIMIZE TABLE utenti;
```

### Implementa Caching
```typescript
// Nel codice Next.js, usa caching aggressivo
export const revalidate = 3600; // 1 ora

// Per API routes
export const dynamic = 'force-static';
```

### Monitora Query Slow
Abilita slow query log in Cloud SQL per identificare query inefficienti.

### CDN per Asset Statici
Considera Cloudflare (free tier) per servire asset statici invece che da Cloud Run.

## 🚨 Procedure di Emergenza

### Scenario: Budget Superato Mid-Month

**Step 1: Stop Costs Immediato**
```bash
# Scala Cloud Run a zero istanze
gcloud run services update zone-calculator-pro \
  --no-traffic \
  --region europe-west1 \
  --project gen-lang-client-0322370238
```

**Step 2: Analisi Root Cause**
```bash
# Check logs per traffico anomalo
gcloud logging read "resource.type=cloud_run_revision" \
  --limit 100 \
  --project gen-lang-client-0322370238
```

**Step 3: Recovery**
- Se attacco/spam: implementa rate limiting più aggressivo
- Se crescita legittima: aumenta budget o ottimizza ulteriormente

### Scenario: Cloud SQL Disk Pieno

Cloud SQL ha limite 10GB, se si riempie:

```bash
# Connettiti al database
gcloud sql connect INSTANCE_NAME --user=zoneuser

# Identifica tabelle grandi
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES 
WHERE table_schema = "zonecalculator"
ORDER BY (data_length + index_length) DESC;

# Pulisci dati se necessario
```

## 📈 Deployment Instructions con FinOps

### First Time Setup

```bash
cd /Users/marco/Downloads/zoneCalculatorPRO/infra

# Crea file terraform.tfvars
cat > terraform.tfvars << EOF
project_id         = "gen-lang-client-0322370238"
region             = "europe-west1"
db_password        = "YOUR_SECURE_PASSWORD"
billing_account_id = "YOUR-BILLING-ACCOUNT-ID"
budget_amount      = 10
alert_email        = "your-email@example.com"
EOF

# Inizializza Terraform
terraform init

# Verifica piano (SENZA APPLICARE)
terraform plan

# Se tutto OK, applica
terraform apply
```

### Verificare Configurazione Post-Deploy

```bash
# Test notifiche email
gcloud alpha monitoring channels test YOUR_CHANNEL_ID

# Verifica budget
gcloud alpha billing budgets list --billing-account=YOUR_BILLING_ACCOUNT

# Check Cloud Run config
gcloud run services describe zone-calculator-pro \
  --region europe-west1 \
  --format="yaml(metadata.annotations)"
```

## 🔗 Link Utili

- [GCP Billing Console](https://console.cloud.google.com/billing)
- [GCP Cost Management](https://console.cloud.google.com/billing/reports)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Cloud SQL Pricing](https://cloud.google.com/sql/pricing)
- [GCP Pricing Calculator](https://cloud.google.com/products/calculator)

## 📞 Support

In caso di problemi con i costi:
1. Esegui script di monitoring
2. Controlla dashboard GCP
3. Review dei log per anomalie
4. Considera di disabilitare servizi temporaneamente

---

**Ultimo aggiornamento:** 2025-12-13  
**Versione:** 1.0
