# Telegram Advanced Integration - Setup Guide

Guida completa per configurare webhook e task scheduling.

## 🚀 Quick Start

### 1. Installa Dipendenze

```bash
pip3.11 install -r requirements-webhook.txt
```

### 2. Avvia il Webhook Server

```bash
python3.11 telegram_webhook_server.py
```

Il server partirà su `http://localhost:8000`

### 3. Setup Tunnel (ngrok)

In un altro terminale:

```bash
# Installa ngrok se non lo hai
brew install ngrok

# Avvia tunnel
ngrok http 8000
```

Copia l'URL HTTPS che ngrok ti da (es: `https://abc123.ngrok.io`)

### 4. Configura Webhook Telegram

```bash
curl -X POST "https://api.telegram.org/bot<TUO_TOKEN>/setWebhook" \
  -d "url=https://abc123.ngrok.io/webhook"
```

Sostituisci `<TUO_TOKEN>` con il tuo token bot.

### 5. Avvia Task Scheduler

In un altro terminale:

```bash
python3.11 task_scheduler.py
```

### 6. Testa su Telegram!

Ora quando scrivi su Telegram:
- Il messaggio arriva al webhook in tempo reale
- Viene creata la task
- Lo scheduler la eseguirà al momento giusto

## 📋 Comandi Disponibili

### Task Immediate
```
/task now Fix bug sulla login
```
→ Creata task immediata, scheduler la esegue subito

### Task Programmate

```
/task 14:30 Deploy in production
```
→ Eseguita oggi alle 14:30

```
/task tomorrow 09:00 Morning checks
```
→ Eseguita domani alle 09:00

```
/task friday Update documentation
```
→ Eseguita venerdì prossimo alle 09:00

### Gestione Task

```
/list
```
→ Mostra tutte le task pendenti

```
/cancel task_123456
```
→ Cancella la task con quell'ID

```
/status
```
→ Stato del sistema

## 🔧 Architettura

```
Tu su Telegram
    ↓
Telegram Server
    ↓ (webhook)
FastAPI Server (localhost:8000)
    ↓ (crea .json)
Directory .telegram_tasks/
    ↓ (monitora)
Task Scheduler
    ↓ (esegue al momento giusto)
Antigravity lavora!
```

## 📁 Struttura File

```
zoneCalculatorPRO/
├── telegram_bot.py              # Bot v2.0 (polling)
├── telegram_webhook_server.py   # Server webhook
├── task_scheduler.py            # Scheduler
├── .telegram_tasks/             # Task queue (JSON)
│   ├── task_20231214_001.json
│   └── task_20231214_002.json
└── telegram_bot_logs/           # Log
    ├── bot_2023-12-14.log
    ├── chat_2023-12-14.log
    └── scheduler.log
```

## 🔐 Sicurezza

- ✅ Token in `.env.telegram` (escluso da Git)
- ✅ Solo utente autorizzato può creare task
- ✅ Directory `.telegram_tasks/` esclusa da Git
- ✅ Webhook con autenticazione

## 🐛 Troubleshooting

### Webhook non riceve messaggi

1. Verifica ngrok sia attivo:
   ```bash
   curl https://your-ngrok-url.ngrok.io/
   ```

2. Verifica webhook configurato:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```

3. Controlla log del server:
   ```bash
   tail -f telegram_bot_logs/bot_*.log
   ```

### Task non vengono eseguite

1. Verifica scheduler sia attivo
2. Controlla file in `.telegram_tasks/`:
   ```bash
   ls -la .telegram_tasks/
   ```

3. Verifica formato orario nel JSON
4. Controlla log scheduler:
   ```bash
   tail -f telegram_bot_logs/scheduler.log
   ```

## 🚀 Deployment Production (Cloud Run)

### 1. Crea Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements-telegram.txt requirements-webhook.txt ./
RUN pip install -r requirements-telegram.txt -r requirements-webhook.txt

COPY telegram_webhook_server.py task_scheduler.py .env.telegram ./

EXPOSE 8000

CMD ["uvicorn", "telegram_webhook_server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Deploy su Cloud Run

```bash
gcloud run deploy telegram-webhook \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

### 3. Configura Webhook

Usa l'URL di Cloud Run al posto di ngrok.

## 📊 Monitoraggio

### Health Check

```bash
curl http://localhost:8000/
```

### Lista Task API

```bash
curl http://localhost:8000/tasks
```

### Cancella Task API

```bash
curl -X DELETE http://localhost:8000/tasks/task_123456
```

## 💡 Tips

- **Test locale**: Usa ngrok prima di production
- **Log monitoring**: Controlla i log per debugging
- **Task cleanup**: Cancella task vecchie periodicamente
- **Backup**: Salva `.telegram_tasks/` se importante

## next Steps

1. ✅ Sistema funziona in locale
2. 🔄 Test completo workflow
3. 🌐 Deploy su Cloud Run (opzionale)
4. 🤖 Integrazione con Antigravity API (next level!)
