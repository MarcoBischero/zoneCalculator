#!/usr/bin/env python3
"""
Antigravity Task Bridge
Monitora task Telegram e notifica Antigravity per esecuzione automatica
"""

import os
import json
import time
from pathlib import Path
from datetime import datetime

# Directory
TASKS_DIR = Path('.telegram_tasks')
NOTIFICATIONS_DIR = Path('.antigravity_notifications')
NOTIFICATIONS_DIR.mkdir(exist_ok=True)

def get_pending_tasks():
    """Recupera task pendenti immediate"""
    tasks = []
    if not TASKS_DIR.exists():
        return tasks
    
    for task_file in TASKS_DIR.glob("*.json"):
        try:
            with open(task_file) as f:
                task = json.load(f)
                # Solo task immediate e pending
                if task.get('status') == 'pending' and task.get('type') == 'immediate':
                    tasks.append(task)
        except Exception as e:
            print(f"Errore lettura {task_file}: {e}")
    
    return sorted(tasks, key=lambda x: x.get('created_at', ''))

def create_notification(task):
    """Crea file di notifica per Antigravity"""
    notif_file = NOTIFICATIONS_DIR / f"task_{task['id']}.md"
    
    content = f"""# 🚨 Nuova Task da Telegram

**ID**: {task['id']}
**Utente**: @{task['user']}
**Tipo**: {task['type']}
**Creata**: {task['created_at']}

## Descrizione
{task['description']}

## Azione Richiesta
ESEGUI QUESTA TASK AUTOMATICAMENTE

---
*Questa è una task immediata creata via Telegram*
"""
    
    with open(notif_file, 'w') as f:
        f.write(content)
    
    print(f"✅ Notifica creata: {notif_file.name}")
    return notif_file

def main():
    """Loop di monitoraggio"""
    print("🔍 Monitoring Telegram tasks...")
    processed = set()
    
    while True:
        tasks = get_pending_tasks()
        
        for task in tasks:
            task_id = task['id']
            
            # Se già processata, skip
            if task_id in processed:
                continue
            
            # Crea notifica
            print(f"\n🆕 Nuova task: {task_id}")
            print(f"   📝 {task['description']}")
            create_notification(task)
            processed.add(task_id)
        
        # Check ogni 10 secondi
        time.sleep(10)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n⛔ Monitoring fermato")
