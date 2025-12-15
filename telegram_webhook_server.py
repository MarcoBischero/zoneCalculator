#!/usr/bin/env python3
"""
Telegram Webhook Server
Server FastAPI per ricevere messaggi Telegram in tempo reale
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, List
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
import httpx

# Carica configurazione
load_dotenv('.env.telegram')

# Configurazione
TELEGRAM_BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN')
ALLOWED_USERNAME = os.getenv('TELEGRAM_ALLOWED_USERNAME', 'MarcoBischero')
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', 'your-secret-here')

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Directory per task
TASKS_DIR = Path('.telegram_tasks')
TASKS_DIR.mkdir(exist_ok=True)

# FastAPI app
app = FastAPI(title="Telegram Webhook Server", version="1.0.0")


# Models
class TelegramUser(BaseModel):
    id: int
    username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None


class TelegramChat(BaseModel):
    id: int
    type: str


class TelegramMessage(BaseModel):
    message_id: int
    from_user: TelegramUser = Field(alias='from')
    chat: TelegramChat
    text: Optional[str] = None
    date: int

    class Config:
        populate_by_name = True


class CallbackQuery(BaseModel):
    id: str
    from_user: TelegramUser = Field(alias='from')
    data: str
    message: Optional[TelegramMessage] = None

    class Config:
        populate_by_name = True


class TelegramUpdate(BaseModel):
    update_id: int
    message: Optional[TelegramMessage] = None
    callback_query: Optional[CallbackQuery] = None


class Task(BaseModel):
    id: str
    user: str
    description: str
    scheduled_time: Optional[str] = None
    status: str = "pending"
    created_at: str
    priority: str = "normal"
    type: str = "immediate"


# Utility functions
def generate_task_id() -> str:
    """Genera ID unico per task"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"task_{timestamp}"


def parse_time_command(text: str) -> tuple[str, Optional[datetime]]:
    """
    Parse comandi task con tempo
    
    Formati supportati:
    - "/task now Fix bug" -> immediato
    - "/task 14:30 Deploy" -> oggi alle 14:30
    - "/task tomorrow 09:00 Check logs" -> domani alle 09:00
    - "/task friday Update docs" -> venerdì prossimo
    """
    parts = text.split(maxsplit=2)
    
    if len(parts) < 3:
        return None, None
    
    # Rimuovi "/task"
    time_part = parts[1].lower()
    description = parts[2] if len(parts) > 2 else ""
    
    # Task immediato
    if time_part == "now":
        return description, None
    
    # Task con orario (HH:MM)
    if ":" in time_part:
        try:
            hour, minute = map(int, time_part.split(":"))
            scheduled = datetime.now().replace(hour=hour, minute=minute, second=0, microsecond=0)
            
            # Se l'orario è già passato oggi, schedula per domani
            if scheduled < datetime.now():
                scheduled += timedelta(days=1)
            
            return description, scheduled
        except ValueError:
            return description, None
    
    # Task "tomorrow"
    if time_part == "tomorrow":
        # Cerca orario nel resto del testo
        desc_parts = description.split(maxsplit=1)
        if len(desc_parts) > 1 and ":" in desc_parts[0]:
            try:
                hour, minute = map(int, desc_parts[0].split(":"))
                scheduled = datetime.now() + timedelta(days=1)
                scheduled = scheduled.replace(hour=hour, minute=minute, second=0, microsecond=0)
                return desc_parts[1], scheduled
            except ValueError:
                pass
        
        # Default: domani stesso orario
        scheduled = datetime.now() + timedelta(days=1)
        return description, scheduled
    
    # Giorni settimana
    days = {
        'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3,
        'friday': 4, 'saturday': 5, 'sunday': 6,
        'lunedi': 0, 'martedi': 1, 'mercoledi': 2, 'giovedi': 3,
        'venerdi': 4, 'sabato': 5, 'domenica': 6
    }
    
    if time_part in days:
        target_day = days[time_part]
        today = datetime.now().weekday()
        days_ahead = (target_day - today) % 7
        if days_ahead == 0:
            days_ahead = 7
        
        scheduled = datetime.now() + timedelta(days=days_ahead)
        scheduled = scheduled.replace(hour=9, minute=0, second=0, microsecond=0)
        return description, scheduled
    
    return description, None


def create_task(user: str, description: str, scheduled_time: Optional[datetime] = None) -> Task:
    """Crea una nuova task"""
    task = Task(
        id=generate_task_id(),
        user=user,
        description=description,
        scheduled_time=scheduled_time.isoformat() if scheduled_time else None,
        created_at=datetime.now().isoformat(),
        type="scheduled" if scheduled_time else "immediate",
        status="pending"
    )
    
    # Salva su disco
    task_file = TASKS_DIR / f"{task.id}.json"
    with open(task_file, 'w') as f:
        json.dump(task.dict(), f, indent=2)
    
    logger.info(f"Task creata: {task.id} - {description}")
    return task


def get_pending_tasks() -> List[Task]:
    """Recupera tutte le task pendenti"""
    tasks = []
    for task_file in TASKS_DIR.glob("*.json"):
        try:
            with open(task_file) as f:
                task_data = json.load(f)
                tasks.append(Task(**task_data))
        except Exception as e:
            logger.error(f"Errore lettura task {task_file}: {e}")
    
    return [t for t in tasks if t.status == "pending"]


def delete_task(task_id: str) -> bool:
    """Elimina una task"""
    task_file = TASKS_DIR / f"{task_id}.json"
    if task_file.exists():
        task_file.unlink()
        logger.info(f"Task eliminata: {task_id}")
        return True
    return False


async def send_telegram_message(chat_id: int, text: str, parse_mode: str = "Markdown", reply_markup: dict = None):
    """Invia messaggio su Telegram con opzionale inline keyboard"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode
    }
    
    if reply_markup:
        payload["reply_markup"] = reply_markup
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            logger.info(f"Messaggio inviato a chat_id {chat_id}")
        except Exception as e:
            logger.error(f"Errore invio messaggio: {e}")


async def answer_callback_query(callback_query_id: str, text: str = None):
    """Risponde a una callback query"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/answerCallbackQuery"
    payload = {"callback_query_id": callback_query_id}
    if text:
        payload["text"] = text
    
    async with httpx.AsyncClient() as client:
        try:
            await client.post(url, json=payload)
        except Exception as e:
            logger.error(f"Errore answer callback: {e}")


def create_quick_menu_keyboard():
    """Crea la keyboard del Quick Actions Menu"""
    return {
        "inline_keyboard": [
            [
                {"text": "📝 Nuova Task", "callback_data": "menu_new_task"},
                {"text": "📋 Le Mie Task", "callback_data": "menu_my_tasks"}
            ],
            [
                {"text": "📊 Dashboard", "callback_data": "menu_dashboard"},
                {"text": "⚙️ Impostazioni", "callback_data": "menu_settings"}
            ],
            [
                {"text": "📚 Templates", "callback_data": "menu_templates"},
                {"text": "📈 Analytics", "callback_data": "menu_analytics"}
            ],
            [
                {"text": "❓ Aiuto", "callback_data": "menu_help"}
            ]
        ]
    }


def create_task_type_keyboard():
    """Keyboard per scegliere tipo task"""
    return {
        "inline_keyboard": [
            [{"text": "⚡ Immediata", "callback_data": "tasktype_immediate"}],
            [{"text": "⏰ Programmata", "callback_data": "tasktype_scheduled"}],
            [{"text": "🔁 Ricorrente", "callback_data": "tasktype_recurring"}],
            [{"text": "« Indietro", "callback_data": "menu_main"}]
        ]
    }


async def process_telegram_message(message: TelegramMessage):
    """Processa messaggio Telegram"""
    username = message.from_user.username
    text = message.text or ""
    chat_id = message.chat.id
    
    # Verifica autenticazione
    if username != ALLOWED_USERNAME:
        logger.warning(f"Messaggio da utente non autorizzato: @{username}")
        await send_telegram_message(chat_id, "⛔ Accesso negato")
        return
    
    logger.info(f"Messaggio da @{username}: {text}")
    
    # Comando /start
    if text.startswith("/start"):
        welcome = (
            "🤖 *ZoneCalculator Bot v2.0 (Webhook)*\\n\\n"
            f"Ciao @{username}! 👋\\n\\n"
            "*Webhook attivo* - risposte in tempo reale!\\n\\n"
            "*Comandi:*\\n"
            "• `/help` - Guida\\n"
            "• `/status` - Stato sistema\\n"
            "• `/task now <desc>` - Task immediata\\n"
            "• `/task HH:MM <desc>` - Task programmata\\n"
            "• `/list` - Task pendenti\\n"
        )
        await send_telegram_message(chat_id, welcome)
    
    # Comando /help
    elif text.startswith("/help"):
        help_text = (
            "📚 *Guida Comandi*\\n\\n"
            "*Quick Access:*\\n"
            "• `/menu` - Menu azioni rapide\\n\\n"
            "*Task:*\\n"
            "• `/task now Fix bug` → Immediata\\n"
            "• `/task 14:30 Deploy` → Oggi 14:30\\n"
            "• `/task tomorrow 09:00 Check` → Domani\\n\\n"
            "*Gestione:*\\n"
            "• `/list` - Vedi task\\n"
            "• `/status` - Stato sistema\\n"
        )
        await send_telegram_message(chat_id, help_text)
    
    # Comando /menu - Quick Actions
    elif text.startswith("/menu"):
        menu_text = (
            "⚡ *Quick Actions Menu*\\n\\n"
            "Scegli un'azione:"
        )
        keyboard = create_quick_menu_keyboard()
        await send_telegram_message(chat_id, menu_text, reply_markup=keyboard)
    
    # Comando /status
    elif text.startswith("/status"):
        tasks = get_pending_tasks()
        status = (
            "📊 *Stato Sistema*\\n\\n"
            "🟢 Webhook: *Attivo*\\n"
            f"📋 Task pendenti: *{len(tasks)}*\\n"
            f"📅 {datetime.now().strftime('%d/%m/%Y %H:%M')}\\n"
        )
        await send_telegram_message(chat_id, status)
    
    # Comando /list
    elif text.startswith("/list"):
        tasks = get_pending_tasks()
        
        if not tasks:
            await send_telegram_message(chat_id, "📭 *Nessuna task pendente*")
        else:
            response = f"📋 *Task Pendenti ({len(tasks)}):*\\n\\n"
            for task in tasks[:10]:
                task_id = task.id.split('_')[-1]
                desc = task.description[:50]
                icon = "⚡" if task.type == "immediate" else "⏰"
                response += f"{icon} `{task_id}`: {desc}\\n"
                if task.scheduled_time:
                    sched = datetime.fromisoformat(task.scheduled_time)
                    response += f"   🕐 {sched.strftime('%d/%m %H:%M')}\\n"
                response += "\\n"
            
            await send_telegram_message(chat_id, response)
        
        logger.info(f"Task pendenti: {len(tasks)}")
        for task in tasks:
            logger.info(f"  - {task.id}: {task.description}")
    
    # Comandi task
    elif text.startswith("/task"):
        description, scheduled_time = parse_time_command(text)
        
        if description:
            task = create_task(username, description, scheduled_time)
            
            if scheduled_time:
                response = (
                    "✅ *Task Programmata!*\\n\\n"
                    f"📝 {description}\\n"
                    f"⏰ {scheduled_time.strftime('%d/%m/%Y %H:%M')}\\n\\n"
                    f"ID: `{task.id.split('_')[-1]}`"
                )
                logger.info(f"Task programmata per {scheduled_time.strftime('%d/%m/%Y %H:%M')}")
            else:
                response = (
                    "✅ *Task Immediata Creata!*\\n\\n"
                    f"📝 {description}\\n\\n"
                    f"ID: `{task.id.split('_')[-1]}`\\n"
                    "Scheduler la processerà! 🚀"
                )
                logger.info(f"Task immediata creata: {task.id}")
            
            await send_telegram_message(chat_id, response)
        else:
            await send_telegram_message(chat_id, "⚠️ Formato: `/task now <desc>` o `/task HH:MM <desc>`")
    
    # Messaggio generico
    else:
        response = (
            "✅ *Messaggio ricevuto!*\\n\\n"
            f"📩 _{text[:100]}_\\n\\n"
            "Loggato con successo! 💪"
        )
        await send_telegram_message(chat_id, response)



# API Endpoints
@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "active",
        "service": "Telegram Webhook Server",
        "version": "1.0.0"
    }


@app.get("/tasks")
async def list_tasks():
    """Lista task pendenti"""
    tasks = get_pending_tasks()
    return {
        "count": len(tasks),
        "tasks": [t.dict() for t in tasks]
    }


@app.delete("/tasks/{task_id}")
async def cancel_task(task_id: str):
    """Cancella una task"""
    success = delete_task(task_id)
    if success:
        return {"status": "deleted", "task_id": task_id}
    else:
        raise HTTPException(status_code=404, detail="Task non trovata")


async def process_callback_query(callback: CallbackQuery):
    """Processa click sui pulsanti inline"""
    username = callback.from_user.username
    callback_data = callback.data
    chat_id = callback.message.chat.id if callback.message else callback.from_user.id
    
    # Verifica autenticazione
    if username != ALLOWED_USERNAME:
        await answer_callback_query(callback.id, "⛔ Accesso negato")
        return
    
    logger.info(f"Callback da @{username}: {callback_data}")
    
    # Answer callback (rimuove "loading" dal pulsante)
    await answer_callback_query(callback.id)
    
    # Menu principale
    if callback_data == "menu_main":
        menu_text = (
            "⚡ *Quick Actions Menu*\\\\n\\\\n"
            "Scegli un'azione:"
        )
        keyboard = create_quick_menu_keyboard()
        await send_telegram_message(chat_id, menu_text, reply_markup=keyboard)
    
    # Nuova Task
    elif callback_data == "menu_new_task":
        task_text = (
            "📝 *Crea Nuova Task*\\\\n\\\\n"
            "Che tipo di task vuoi creare?"
        )
        keyboard = create_task_type_keyboard()
        await send_telegram_message(chat_id, task_text, reply_markup=keyboard)
    
    # Le Mie Task
    elif callback_data == "menu_my_tasks":
        tasks = get_pending_tasks()
        if not tasks:
            await send_telegram_message(chat_id, "📭 *Nessuna task pendente*")
        else:
            response = f"📋 *Task Pendenti ({len(tasks)}):*\\\\n\\\\n"
            for task in tasks[:10]:
                task_id = task.id.split('_')[-1]
                desc = task.description[:50]
                icon = "⚡" if task.type == "immediate" else "⏰"
                response += f"{icon} `{task_id}`: {desc}\\\\n"
                if task.scheduled_time:
                    sched = datetime.fromisoformat(task.scheduled_time)
                    response += f"   🕐 {sched.strftime('%d/%m %H:%M')}\\\\n"
                response += "\\\\n"
            await send_telegram_message(chat_id, response)
    
    # Dashboard
    elif callback_data == "menu_dashboard":
        tasks = get_pending_tasks()
        dashboard = (
            "📊 *Dashboard*\\\\n\\\\n"
            f"📋 Task pendenti: *{len(tasks)}*\\\\n"
            f"📅 Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}\\\\n\\\\n"
            "🟢 Sistema operativo"
        )
        await send_telegram_message(chat_id, dashboard)
    
    # Analytics
    elif callback_data == "menu_analytics":
        # TODO: implementare analytics reali
        analytics = (
            "📈 *Analytics*\\\\n\\\\n"
            "📊 Statistiche prossimamente disponibili!\\\\n\\\\n"
            "_Feature in sviluppo..._"
        )
        await send_telegram_message(chat_id, analytics)
    
    # Templates
    elif callback_data == "menu_templates":
        templates = (
            "📚 *Templates*\\\\n\\\\n"
            "Template task prossimamente disponibili!\\\\n\\\\n"
            "_Feature in sviluppo..._"
        )
        await send_telegram_message(chat_id, templates)
    
    # Settings
    elif callback_data == "menu_settings":
        settings = (
            "⚙️ *Impostazioni*\\\\n\\\\n"
            "Configurazioni prossimamente disponibili!\\\\n\\\\n"
            "_Feature in sviluppo..._"
        )
        await send_telegram_message(chat_id, settings)
    
    # Help
    elif callback_data == "menu_help":
        help_text = (
            "❓ *Aiuto*\\\\n\\\\n"
            "📱 Usa i pulsanti per navigare\\\\n"
            "⚡ Quick Actions per accesso rapido\\\\n"
            "📝 Crea task con facilità\\\\n\\\\n"
            "Comando: `/menu` per aprire questo menu"
        )
        await send_telegram_message(chat_id, help_text)
    
    # Task Type - Immediata
    elif callback_data == "tasktype_immediate":
        await send_telegram_message(
            chat_id,
            "⚡ *Task Immediata*\\\\n\\\\nInvia la descrizione della task:"
        )
    
    # Task Type - Programmata
    elif callback_data == "tasktype_scheduled":
        await send_telegram_message(
            chat_id,
            "⏰ *Task Programmata*\\\\n\\\\nUsa il formato:\\\\n`/task HH:MM descrizione`"
        )
    
    # Task Type - Ricorrente
    elif callback_data == "tasktype_recurring":
        await send_telegram_message(
            chat_id,
            "🔁 *Task Ricorrente*\\\\n\\\\n_Feature in sviluppo..._\\\\n\\\\nProssimamente potrai creare task ricorrenti!"
        )


@app.post("/webhook")
async def telegram_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Endpoint webhook per Telegram
    Riceve updates in tempo reale
    """
    try:
        # Parse update
        data = await request.json()
        update = TelegramUpdate(**data)
        
        # Processa messaggio in background
        if update.message:
            background_tasks.add_task(process_telegram_message, update.message)
        
        # Processa callback query
        if update.callback_query:
            background_tasks.add_task(process_callback_query, update.callback_query)
        
        return {"status": "ok"}
    
    except Exception as e:
        logger.error(f"Errore processing webhook: {e}")
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    
    logger.info("🚀 Avvio Webhook Server...")
    logger.info(f"📋 Utente autorizzato: @{ALLOWED_USERNAME}")
    logger.info(f"📁 Task directory: {TASKS_DIR.absolute()}")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
