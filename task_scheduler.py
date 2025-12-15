#!/usr/bin/env python3
"""
Task Scheduler
Monitora e esegue task programmate
"""

import os
import json
import time
import logging
from datetime import datetime
from pathlib import Path
from typing import List

import schedule
from dotenv import load_dotenv

# Carica configurazione
load_dotenv('.env.telegram')

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO,
    handlers=[
        logging.FileHandler('telegram_bot_logs/scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Directory task
TASKS_DIR = Path('.telegram_tasks')
TASKS_DIR.mkdir(exist_ok=True)


class TaskScheduler:
    """Scheduler per task programmate"""
    
    def __init__(self):
        self.tasks_dir = TASKS_DIR
        logger.info(f"📁 Monitorando: {self.tasks_dir.absolute()}")
    
    def get_pending_tasks(self) -> List[dict]:
        """Recupera task pendenti"""
        tasks = []
        for task_file in self.tasks_dir.glob("*.json"):
            try:
                with open(task_file) as f:
                    task = json.load(f)
                    if task.get('status') == 'pending':
                        tasks.append(task)
            except Exception as e:
                logger.error(f"Errore lettura {task_file}: {e}")
        return tasks
    
    def should_execute(self, task: dict) -> bool:
        """Verifica se una task deve essere eseguita"""
        if task.get('type') == 'immediate':
            # Task immediate vanno eseguite subito
            return True
        
        scheduled_time_str = task.get('scheduled_time')
        if not scheduled_time_str:
            return False
        
        try:
            scheduled_time = datetime.fromisoformat(scheduled_time_str)
            now = datetime.now()
            
            # Esegui se il tempo è arrivato (con tolleranza di 1 minuto)
            return now >= scheduled_time
        except Exception as e:
            logger.error(f"Errore parsing tempo: {e}")
            return False
    
    def execute_task(self, task: dict):
        """Esegue una task"""
        task_id = task.get('id')
        description = task.get('description')
        
        logger.info(f"⚡ Esecuzione task: {task_id}")
        logger.info(f"📝 Descrizione: {description}")
        
        # TODO: Qui integrerai la chiamata ad Antigravity
        # Per ora logghiamo solo
        
        # Marca task come completata
        task['status'] = 'completed'
        task['completed_at'] = datetime.now().isoformat()
        
        task_file = self.tasks_dir / f"{task_id}.json"
        with open(task_file, 'w') as f:
            json.dump(task, f, indent=2)
        
        logger.info(f"✅ Task completata: {task_id}")
    
    def check_and_execute(self):
        """Controlla e esegue task pendenti"""
        tasks = self.get_pending_tasks()
        
        if not tasks:
            return
        
        logger.info(f"🔍 Trovate {len(tasks)} task pendenti")
        
        for task in tasks:
            if self.should_execute(task):
                self.execute_task(task)
    
    def run(self):
        """Avvia lo scheduler"""
        logger.info("🚀 Task Scheduler avviato!")
        logger.info("⏰ Controllo task ogni minuto...")
        
        # Schedula controllo ogni minuto
        schedule.every(1).minutes.do(self.check_and_execute)
        
        # Loop principale
        while True:
            schedule.run_pending()
            time.sleep(30)  # Check ogni 30 secondi se ci sono jobs da eseguire


def main():
    """Funzione principale"""
    scheduler = TaskScheduler()
    
    try:
        scheduler.run()
    except KeyboardInterrupt:
        logger.info("\n⛔ Scheduler fermato dall'utente")
    except Exception as e:
        logger.error(f"❌ Errore scheduler: {e}")


if __name__ == '__main__':
    main()
