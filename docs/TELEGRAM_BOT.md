# Telegram Bot - Guida Utilizzo

Bot Telegram per gestire il progetto ZoneCalculatorPRO da remoto.

## 🚀 Installazione e Avvio

### 1. Installa Dipendenze

```bash
pip install -r requirements-telegram.txt
```

### 2. Avvia il Bot

```bash
python telegram_bot.py
```

Il bot rimarrà in ascolto finché non lo fermi con `Ctrl+C`.

## 📱 Uso su Telegram

### Trova il Bot
Cerca il tuo bot su Telegram usando il nome che gli hai dato su @BotFather.

### Comandi Disponibili

- **`/start`** - Avvia il bot e verifica l'accesso
- **`/help`** - Mostra la lista dei comandi
- **`/status`** - Controlla lo stato del sistema
- **`/task <descrizione>`** - Registra una nuova task

### Esempi d'Uso

```
/start
```
Ti dà il benvenuto e verifica che tu sia autorizzato.

```
/task Implementare cache Redis per le query
```
Registra una task specifica nei log.

```
Controlla se ci sono errori in produzione
```
Invia un'istruzione generica - verrà registrata nei log.

## 🔒 Sicurezza

- **Accesso Limitato**: Solo l'utente `@MarcoBischero` può usare il bot
- **Token Protetto**: Il token è in `.env.telegram` (escluso da Git)
- **Log Privati**: Le conversazioni sono salvate in `telegram_bot_logs/`

## 📝 Log

Tutte le conversazioni e le task vengono salvate in:
```
telegram_bot_logs/
├── bot_YYYY-MM-DD.log      # Log generali del bot
└── chat_YYYY-MM-DD.log     # Conversazioni e task
```

## 🔧 Esecuzione in Background

### Opzione 1: Screen (consigliato per Mac)

```bash
# Crea una sessione screen
screen -S telegram_bot

# Avvia il bot
python telegram_bot.py

# Disconnetti con: Ctrl+A poi D

# Riconnetti quando vuoi
screen -r telegram_bot
```

### Opzione 2: tmux

```bash
# Crea sessione tmux
tmux new -s telegram_bot

# Avvia il bot
python telegram_bot.py

# Disconnetti con: Ctrl+B poi D

# Riconnetti
tmux attach -t telegram_bot
```

### Opzione 3: nohup (semplice)

```bash
nohup python telegram_bot.py > bot_output.log 2>&1 &
```

## ❓ Troubleshooting

### Bot non si avvia
```
❌ Errore: TELEGRAM_BOT_TOKEN mancante
```
**Soluzione**: Verifica che `.env.telegram` esista e contenga il token.

### Bot non risponde
1. Controlla che il bot sia in esecuzione
2. Verifica di essere l'utente autorizzato (`@MarcoBischero`)
3. Prova con `/start`

### Accesso negato
```
⛔ Accesso negato
```
**Soluzione**: Solo `@MarcoBischero` può usare questo bot. Modifica `TELEGRAM_ALLOWED_USERNAME` in `.env.telegram` se necessario.

## 🛑 Fermare il Bot

Se in primo piano:
```
Ctrl+C
```

Se in background (screen/tmux):
1. Riconnetti alla sessione
2. Premi `Ctrl+C`

## 📊 Workflow Tipico

1. **Sei fuori casa** → Apri Telegram
2. **Scrivi al bot** → `/task Aggiungi validazione email`
3. **Il bot conferma** → Task registrata nei log
4. **Torni al PC** → Controlli i log e lavori sulla task

## 🔄 Aggiornamenti

Per aggiornare il bot:
1. Ferma il bot (`Ctrl+C`)
2. Modifica `telegram_bot.py`
3. Riavvia: `python telegram_bot.py`
