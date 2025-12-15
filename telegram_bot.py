#!/usr/bin/env python3
"""
Telegram Bot Enhanced per ZoneCalculatorPRO
Bot con supporto webhook e task scheduling avanzato  
"""

import os
import json
import logging
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    filters,
    ContextTypes,
)

# Carica variabili d'ambiente
load_dotenv('.env.telegram')

# Configurazione
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
ALLOWED_USERNAME = os.getenv('TELEGRAM_ALLOWED_USERNAME', 'MarcoBischero')
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Directory task
TASKS_DIR = Path('.telegram_tasks')
TASKS_DIR.mkdir(exist_ok=True)

# Setup logging
os.makedirs('telegram_bot_logs', exist_ok=True)

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=getattr(logging, LOG_LEVEL),
    handlers=[
        logging.FileHandler(f'telegram_bot_logs/bot_{datetime.now().strftime("%Y-%m-%d")}.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

chat_logger = logging.getLogger('chat')
chat_logger.setLevel(logging.INFO)
chat_handler = logging.FileHandler(f'telegram_bot_logs/chat_{datetime.now().strftime("%Y-%m-%d")}.log')
chat_handler.setFormatter(logging.Formatter('%(asctime)s - %(message)s'))
chat_logger.addHandler(chat_handler)


def is_authorized(update: Update) -> bool:
    """Verifica se l'utente è autorizzato"""
    username = update.effective_user.username
    return username == ALLOWED_USERNAME


def get_pending_tasks() -> list:
    """Recupera task pendenti"""
    tasks = []
    for task_file in TASKS_DIR.glob("*.json"):
        try:
            with open(task_file) as f:
                task = json.load(f)
                if task.get('status') == 'pending':
                    tasks.append(task)
        except Exception as e:
            logger.error(f"Errore lettura task: {e}")
    return sorted(tasks, key=lambda x: x.get('created_at', ''))


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler /start"""
    if not is_authorized(update):
        await update.message.reply_text("⛔ Accesso negato", parse_mode='Markdown')
        return

    welcome = (
        "🤖 *ZoneCalculator Bot v2.0*\\n\\n"
        f"Ciao @{update.effective_user.username}! 👋\\n\\n"
        "*Nuove funzionalità:*\\n"
        "• Task immediate e programmate\\n"
        "• Gestione code di lavoro\\n"
        "• Notifiche real-time\\n\\n"
        "*Comandi:*\\n"
        "• `/help` - Guida completa\\n"
        "• `/task now <descrizione>` - Esegui ora\\n"
        "• `/task HH:MM <desc>` - Programma\\n"
        "• `/list` - Vedi task pendenti\\n"
        "• `/status` - Stato sistema\\n"
    )
    
    await update.message.reply_text(welcome, parse_mode='Markdown')
    chat_logger.info(f"@{update.effective_user.username} avviato bot v2.0")


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler /help"""
    if not is_authorized(update):
        await update.message.reply_text("⛔ Accesso negato")
        return

    help_text = (
        "📚 *Guida Bot Avanzata*\\n\\n"
        "*Task Immediate:*\\n"
        "• `/task now Fix login bug` → Lavoro subito\\n\\n"
        "*Task Programmate:*\\n"
        "• `/task 14:30 Deploy production` → Oggi 14:30\\n"
        "• `/task tomorrow 09:00 Morning check` → Domani\\n"
        "• `/task friday Update docs` → Venerdì\\n\\n"
        "*Gestione:*\\n"
        "• `/list` - Lista task pendenti\\n"
        "• `/cancel task_id` - Cancella task\\n"
        "• `/status` - Stato sistema\\n\\n"
        "*Messaggi liberi:*\\n"
        "Qualsiasi messaggio viene loggato come istruzione!\\n"
    )
    
    await update.message.reply_text(help_text, parse_mode='Markdown')


async def status_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler /status"""
    if not is_authorized(update):
        await update.message.reply_text("⛔ Accesso negato")
        return

    tasks = get_pending_tasks()
    
    status = (
        "📊 *Stato Sistema*\\n\\n"
        "🟢 Bot: *Attivo (v2.0)*\\n"
        "🟢 Webhook: *Configurato*\\n"
        f"📋 Task pendenti: *{len(tasks)}*\\n"
        f"📅 {datetime.now().strftime('%d/%m/%Y %H:%M')}\\n"
    )
    
    await update.message.reply_text(status, parse_mode='Markdown')
    chat_logger.info(f"Status richiesto: {len(tasks)} task pendenti")


async def list_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler /list - mostra task pendenti"""
    if not is_authorized(update):
        await update.message.reply_text("⛔ Accesso negato")
        return

    tasks = get_pending_tasks()
    
    if not tasks:
        await update.message.reply_text("📭 *Nessuna task pendente*", parse_mode='Markdown')
        return
    
    response = f"📋 *Task Pendenti ({len(tasks)}):*\\n\\n"
    
    for task in tasks[:10]:  # Massimo 10
        task_id = task['id'].split('_')[-1]  # Abbreviated
        desc = task['description'][:50]  # Troncato
        task_type = task['type']
        
        icon = "⚡" if task_type == "immediate" else "⏰"
        
        response += f"{icon} `{task_id}`: {desc}\\n"
        
        if task.get('scheduled_time'):
            sched = datetime.fromisoformat(task['scheduled_time'])
            response += f"   🕐 {sched.strftime('%d/%m %H:%M')}\\n"
        response += "\\n"
    
    await update.message.reply_text(response, parse_mode='Markdown')


async def cancel_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler /cancel - cancella task"""
    if not is_authorized(update):
        await update.message.reply_text("⛔ Accesso negato")
        return

    if not context.args:
        await update.message.reply_text(
            "⚠️ Uso: `/cancel task_id`\\n"
            "Usa `/list` per vedere gli ID",
            parse_mode='Markdown'
        )
        return
    
    task_id_partial = context.args[0]
    
    # Trova task con ID parziale
    deleted = False
    for task_file in TASKS_DIR.glob(f"*{task_id_partial}*.json"):
        task_file.unlink()
        deleted = True
        logger.info(f"Task cancellata: {task_file.name}")
        break
    
    if deleted:
        await update.message.reply_text("✅ *Task cancellata!*", parse_mode='Markdown')
    else:
        await update.message.reply_text("❌ Task non trovata", parse_mode='Markdown')


async def task_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler /task - versione semplificata (webhook processerà il parsing completo)"""
    if not is_authorized(update):
        await update.message.reply_text("⛔ Accesso negato")
        return

    if not context.args:
        await update.message.reply_text(
            "⚠️ *Formato:*\\n"
            "`/task now <descrizione>`\\n"
            "`/task HH:MM <descrizione>`\\n"
            "`/task tomorrow HH:MM <desc>`",
            parse_mode='Markdown'
        )
        return

    # Risposta generica - il webhook processerà i dettagli
    description = ' '.join(context.args)
    chat_logger.info(f"TASK da @{update.effective_user.username}: {description}")
    
    response = "✅ *Task ricevuta!*\\n\\nIl webhook la processerà automaticamente. 🚀"
    await update.message.reply_text(response, parse_mode='Markdown')


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler messaggi generici"""
    if not is_authorized(update):
        await update.message.reply_text("⛔ Accesso negato")
        return

    user_message = update.message.text
    username = update.effective_user.username
    
    chat_logger.info(f"MESSAGGIO da @{username}: {user_message}")
    
    response = (
        "✅ *Ricevuto!*\\n\\n"
        f"📩 _{user_message[:100]}_\\n\\n"
        "Messaggio registrato e processato! 💪"
    )
    
    await update.message.reply_text(response, parse_mode='Markdown')


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handler errori"""
    logger.error(f"Errore: {context.error}", exc_info=context.error)
    
    if update and update.effective_message:
        await update.effective_message.reply_text(
            "⚠️ Errore temporaneo. Riprova!"
        )


def main():
    """Funzione principale"""
    if not TELEGRAM_BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN mancante!")
        return

    logger.info("🚀 Avvio Telegram Bot v2.0...")
    logger.info(f"👤 Utente: @{ALLOWED_USERNAME}")
    logger.info(f"📁 Tasks dir: {TASKS_DIR.absolute()}")
    
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Handler
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("status", status_command))
    application.add_handler(CommandHandler("list", list_command))
    application.add_handler(CommandHandler("cancel", cancel_command))
    application.add_handler(CommandHandler("task", task_command))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    application.add_error_handler(error_handler)

    logger.info("✅ Bot v2.0 pronto!")
    print("\n🤖 Telegram Bot v2.0 avviato!")
    print(f"👤 Utente: @{ALLOWED_USERNAME}")
    print("📝 Log: telegram_bot_logs/")
    print("⏰ Task: .telegram_tasks/")
    print("\n⌨️  Ctrl+C per fermare\n")
    
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main()
