# Setup FinOps su GCP - README

> ⚠️ **NOTA COMPATIBILITÀ TERRAFORM**: Il progetto usa Terraform v0.12.8, una versione vecchia. Alcune risorse come `google_artifact_registry_repository` richiedono Terraform v1.x e Google Provider v4+. 

## Opzioni di deployment

### Opzione A: Upgrade Terraform (Consigliato)

```bash
# Installa Terraform versione recente
brew upgrade terraform

# Verifica versione (dovrebbe essere >= 1.0)
terraform version

# Poi esegui normalmente
cd infra
terraform init
terraform plan
```

### Opzione B: Setup Manuale Budget (Senza Terraform)

Se non vuoi aggiornare Terraform, puoi configurare il budget manualmente:

#### 1. Configurare Budget via GCP Console

1. Vai a: https://console.cloud.google.com/billing/budgets
2. Clicca **"Create Budget"**
3. Configura:
   - **Nome:** Zone Calculator Pro - Monthly Budget
   - **Projects:** Seleziona `gen-lang-client-0322370238`
   - **Amount:** 10 EUR
   - **Threshold rules:**
     - 50% del budget
     - 75% del budget  
     - 90% del budget
     - 100% del budget
   - **Email notifications:** Inserisci la tua email

#### 2. Configurare Alert Email

1. Vai a: https://console.cloud.google.com/monitoring/alerting/notifications
2. Clicca **"Add New"**
3. Tipo: **Email**
4. Inserisci la tua email
5. Salva

#### 3. Ottimizzare Cloud Run (Manuale)

```bash
# Limita Cloud Run a 1 istanza massima
gcloud run services update zone-calculator-pro \
  --max-instances=1 \
  --min-instances=0 \
  --cpu-throttling \
  --memory=256Mi \
  --cpu=1 \
  --concurrency=100 \
  --timeout=30s \
  --region=europe-west1 \
  --project=gen-lang-client-0322370238
```

#### 4. Ottimizzare Cloud SQL (Manuale)

> ⚠️ **ATTENZIONE:** Disabilitare i backup comporta rischio perdita dati

```bash
# Disabilita backup per ridurre costi
gcloud sql instances patch INSTANCE_NAME \
  --no-backup \
  --project=gen-lang-client-0322370238
```

## Script di Monitoring

Gli script funzionano indipendentemente da Terraform:

```bash
# Installa gcloud CLI se necessario
# Vedi: https://cloud.google.com/sdk/docs/install

# Test report costi (non richiede gcloud)
node scripts/cost-report.js --test-mode

# Monitoring reale (richiede gcloud configurato)
./scripts/cost-monitor.sh
```

## File Creati

### Terraform (per deployment automatizzato)
- `infra/budget.tf` - Configurazione budget e alert
- `infra/variables.tf` - Variabili configurabili
- `infra/terraform.tfvars.example` - Template configurazione
- `infra/main.tf` - Modificato con ottimizzazioni costi

### Scripts
- `scripts/cost-monitor.sh` - Script bash per check quotidiano costi
- `scripts/cost-report.js` - Report dettagliato settimanale

### Documentazione
- `docs/finops-guide.md` - Guida completa FinOps con procedure emergenza

## Prossimi Passi

1. **Decidi approccio:**
   - Opzione A: Upgrade Terraform → deployment automatizzato
   - Opzione B: Setup manuale via console GCP

2. **Configura monitoring:**
   ```bash
   # Test script
   ./scripts/cost-monitor.sh --dry-run
   node scripts/cost-report.js --test-mode
   ```

3. **Schedula report settimanale:**
   ```bash
   # Aggiungi a crontab
   0 9 * * 1 cd /path/to/project && node scripts/cost-report.js
   ```

4. **Leggi la guida completa:**
   ```bash
   open docs/finops-guide.md
   ```

## Stima Costi con Configurazione Minimal

| Servizio | Costo Mensile Stimato |
|----------|----------------------|
| Cloud SQL (db-f1-micro, no backup) | 7-8 EUR |
| Cloud Run (minimal usage, 1 instance max) | 1-2 EUR |
| Networking & Storage | 0.5 EUR |
| **TOTALE** | **8.5-10.5 EUR** |

⚠️ **Margine Ridotto:** Con questa configurazione sei al limite del budget. Monitora attentamente!

## Support

- **Guida FinOps:** `docs/finops-guide.md`
- **GCP Billing Console:** https://console.cloud.google.com/billing
- **Script di Monitoring:** `scripts/cost-monitor.sh --dry-run`
