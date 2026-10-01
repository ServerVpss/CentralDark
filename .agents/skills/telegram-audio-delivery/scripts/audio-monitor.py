#!/usr/bin/env python3
"""
Hermes Telegram Audio Delivery Monitor
Monitora falhas de entrega de áudio no Telegram e toca bip de alerta.
"""

import os
import sys
import time
import json
import logging
from pathlib import Path
from datetime import datetime

# Configurações
HERMES_HOME = Path.home() / "AppData/Local/hermes"
AUDIO_CACHE = HERMES_HOME / "cache/audio"
LOG_FILE = HERMES_HOME / "logs/audio-monitor.log"
STATE_FILE = HERMES_HOME / "cache/audio-monitor-state.json"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


class AudioDeliveryMonitor:
    def __init__(self):
        self.state = self._load_state()
    
    def _load_state(self) -> dict:
        if STATE_FILE.exists():
            try:
                with open(STATE_FILE, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {"last_errors": [], "error_count": 0, "last_check": ""}
    
    def _save_state(self):
        with open(STATE_FILE, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def play_alert(self, error_type: str = "generic"):
        """Toca bip sonoro + popup visual."""
        configs = {
            "voice_forbidden": (1000, 500, 2),
            "gateway_error": (1200, 400, 2),
            "file_not_found": (1500, 200, 3),
            "generic": (800, 300, 1),
        }
        freq, dur, reps = configs.get(error_type, configs["generic"])
        
        import winsound
        for i in range(reps):
            winsound.Beep(freq, dur)
            if i < reps - 1:
                time.sleep(0.1)
        
        logger.warning(f"🔔 ALERTA SONORO: {error_type}")
        
        try:
            import ctypes
            ctypes.windll.user32.MessageBoxW(
                0,
                f"Hermes Audio Alert\n\nErro: {error_type}",
                "⚠️ ALERTA DE ENTREGA DE ÁUDIO",
                0x4000
            )
        except:
            pass
    
    def scan_audio_cache(self) -> list:
        if not AUDIO_CACHE.exists():
            return []
        files = []
        for f in AUDIO_CACHE.glob("*.ogg"):
            files.append({
                "path": str(f),
                "name": f.name,
                "size": f.stat().st_size,
            })
        return files
    
    def check_gateway_status(self) -> dict:
        try:
            import psutil
            for proc in psutil.process_iter(['name', 'pid']):
                if 'hermes' in proc.info.get('name', '').lower():
                    return {"running": True, "pid": proc.info['pid']}
        except:
            pass
        return {"running": False}
    
    def check_recent_errors(self) -> list:
        log_file = HERMES_HOME / "logs/gateway.log"
        if not log_file.exists():
            return []
        
        errors = []
        try:
            with open(log_file, 'r', encoding='utf-8', errors='ignore') as f:
                lines = f.readlines()
                for line in reversed(lines[-200:]):
                    if 'send_voice' in line.lower() or 'voice_messages_forbidden' in line.lower():
                        errors.append(line.strip())
                        if len(errors) >= 10:
                            break
        except:
            pass
        return errors
    
    def analyze_error(self, error_msg: str) -> str:
        error_upper = error_msg.upper()
        if "VOICE_MESSAGES_FORBIDDEN" in error_upper:
            return "voice_forbidden"
        elif "FILE_NOT_FOUND" in error_upper or "NO_SUCH_FILE" in error_upper:
            return "file_not_found"
        elif "CONFLICT" in error_upper or "TERMINATED" in error_upper:
            return "gateway_error"
        else:
            return "generic"
    
    def run_once(self):
        """Executa verificação única."""
        logger.info("🔍 Verificação única de entrega de áudio...")
        
        gateway = self.check_gateway_status()
        if not gateway.get("running"):
            logger.warning("⚠️ GATEWAY NÃO ESTÁ RODANDO")
            self.play_alert("gateway_error")
            return False
        
        errors = self.check_recent_errors()
        if errors:
            for err in errors[:3]:
                error_type = self.analyze_error(err)
                logger.error(f"❌ ERRO DETECTADO: {err[:200]}")
                self.play_alert(error_type)
            return True
        
        audio_files = self.scan_audio_cache()
        logger.info(f"✅ Verificação concluída: {len(audio_files)} áudios no cache, gateway OK")
        return True
    
    def run_loop(self, interval: int = 30):
        """Loop contínuo de monitoramento."""
        logger.info("🔍 Iniciando monitor contínuo...")
        while True:
            try:
                self.run_once()
                self.state["last_check"] = datetime.now().isoformat()
                self._save_state()
                time.sleep(interval)
            except KeyboardInterrupt:
                logger.info("⏹️ Monitor parado")
                break
            except Exception as e:
                logger.error(f"Erro no loop: {e}")
                time.sleep(5)


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Hermes Telegram Audio Monitor")
    parser.add_argument("--once", "-o", action="store_true", help="Verificar uma vez")
    parser.add_argument("--loop", "-l", action="store_true", help="Loop contínuo")
    parser.add_argument("--interval", "-i", type=int, default=30, help="Intervalo em segundos")
    args = parser.parse_args()
    
    monitor = AudioDeliveryMonitor()
    
    if args.loop:
        monitor.run_loop(interval=args.interval)
    else:
        monitor.run_once()


if __name__ == "__main__":
    main()
