#!/usr/bin/env python3
"""
Hermes Telegram Audio Delivery Monitor
Monitora falhas de entrega de áudio no Telegram e toca bip de alerta.
"""

import os
import sys
import time
import asyncio
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

# Configurações
HERMES_HOME = Path.home() / "AppData/Local/hermes"
AUDIO_CACHE = HERMES_HOME / "cache/audio"
LOG_FILE = HERMES_HOME / "logs/audio-monitor.log"
STATE_FILE = HERMES_HOME / "cache/audio-monitor-state.json"

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class AudioDeliveryMonitor:
    """Monitora entrega de áudio no Telegram e alerta sobre falhas."""
    
    def __init__(self):
        self.state = self._load_state()
        self.last_check = 0
        self.alert_cooldown = 300  # 5 minutos entre alertas
        
    def _load_state(self) -> dict:
        """Carrega estado salvo."""
        if STATE_FILE.exists():
            try:
                import json
                with open(STATE_FILE, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {
            "last_error": None,
            "error_count": 0,
            "last_alert_time": 0,
            "files_pending": [],
            "files_delivered": []
        }
    
    def _save_state(self):
        """Salva estado."""
        import json
        with open(STATE_FILE, 'w') as f:
            json.dump(self.state, f, indent=2)
    
    def play_alert_sound(self, error_type: str = "GENERIC"):
        """Toca bip de alerta quando há falha de entrega."""
        try:
            import winsound
            import ctypes
            
            # Beep patterns
            patterns = {
                "VOICE_FORBIDDEN": (1000, 500, 2),  # 1kHz, 500ms, 2x
                "FILE_NOT_FOUND": (1500, 300, 3),
                "GENERIC": (800, 400, 1),
                "DELIVERY_FAILED": (1200, 500, 2),
            }
            
            freq, duration, repeats = patterns.get(error_type, patterns["GENERIC"])
            
            for _ in range(repeats):
                winsound.Beep(freq, duration)
                time.sleep(0.1)
            
            logger.warning(f"🔔 ALERTA SONORO: {error_type}")
            
            # Also try Windows message box as backup
            try:
                ctypes.windll.user32.MessageBoxW(
                    0,
                    f"Hermes Audio Monitor\n\nErro: {error_type}\n\nVerifique o Telegram e o gateway.",
                    "⚠️ ALERTA DE ENTREGA DE ÁUDIO",
                    0x4000  # MB_ICONWARNING
                )
            except:
                pass
                
        except ImportError:
            logger.warning(f"🔔 ALERTA (sem som): {error_type}")
        except Exception as e:
            logger.error(f"Falha ao tocar alerta: {e}")
    
    def scan_audio_cache(self) -> list:
        """Escaneia cache de áudio em busca de arquivos pending."""
        if not AUDIO_CACHE.exists():
            return []
        
        files = []
        for f in AUDIO_CACHE.glob("*.ogg"):
            files.append({
                "path": str(f),
                "name": f.name,
                "size": f.stat().st_size,
                "modified": f.stat().st_mtime,
                "created": f.stat().st_ctime
            })
        return files
    
    def check_gateway_status(self) -> dict:
        """Verifica status do gateway Hermes."""
        import subprocess
        
        try:
            result = subprocess.run(
                ["hermes", "gateway", "status"],
                capture_output=True,
                text=True,
                timeout=10
            )
            return {
                "running": result.returncode == 0,
                "output": result.stdout,
                "error": result.stderr
            }
        except Exception as e:
            return {
                "running": False,
                "error": str(e)
            }
    
    def check_telegram_config(self) -> dict:
        """Verifica configuração do Telegram."""
        import subprocess
        
        try:
            result = subprocess.run(
                ["powershell", "-Command", 
                 "Get-Content '$env:USERPROFILE\\AppData\\Local\\hermes\\.env' | Select-String 'TELEGRAM'"],
                capture_output=True,
                text=True,
                timeout=5
            )
            return {
                "configured": "TELEGRAM_BOT_TOKEN" in result.stdout,
                "output": result.stdout
            }
        except Exception as e:
            return {
                "configured": False,
                "error": str(e)
            }
    
    def analyze_error(self, error_msg: str) -> str:
        """Analisa tipo de erro e retorna categoria."""
        error_upper = error_msg.upper()
        
        if "VOICE_MESSAGES_FORBIDDEN" in error_upper:
            return "VOICE_FORBIDDEN"
        elif "FILE_NOT_FOUND" in error_upper or "NO_SUCH_FILE" in error_upper:
            return "FILE_NOT_FOUND"
        elif "CONFLICT" in error_upper or "TERMINATED" in error_upper:
            return "GATEWAY_CONFLICT"
        elif "TIMEOUT" in error_upper:
            return "GATEWAY_TIMEOUT"
        elif "NETWORK" in error_upper or "BAD GATEWAY" in error_upper:
            return "NETWORK_ERROR"
        else:
            return "GENERIC"
    
    def monitor_loop(self, interval: int = 30):
        """Loop principal de monitoramento."""
        logger.info("🔍 Iniciando monitor de entrega de áudio Hermes...")
        logger.info(f"📁 Cache de áudio: {AUDIO_CACHE}")
        logger.info(f"📋 Configuração: {self.check_telegram_config()}")
        
        while True:
            try:
                # Verifica status do gateway
                gateway_status = self.check_gateway_status()
                
                # Se gateway não está rodando, alerta
                if not gateway_status.get("running", False):
                    logger.warning("⚠️ GATEWAY NÃO ESTÁ RODANDO")
                    self.play_alert_sound("GENERIC")
                
                # Escaneia áudio cache
                audio_files = self.scan_audio_cache()
                
                # Verifica logs por erros recentes
                log_file = HERMES_HOME / "logs/gateway.log"
                if log_file.exists():
                    try:
                        with open(log_file, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                            # Busca erros recentes relacionados a áudio
                            error_keywords = [
                                "Voice_messages_forbidden",
                                "Failed to send Telegram voice/audio",
                                "send_voice fallback",
                                "Delivering.*MEDIA.*failed"
                            ]
                            
                            for line in content.split('\n'):
                                if any(kw in line for kw in error_keywords):
                                    if line not in self.state.get("last_errors", []):
                                        if len(self.state.get("last_errors", [])) >= 100:
                                            self.state["last_errors"] = self.state["last_errors"][-99:]
                                        self.state.setdefault("last_errors", []).append(line)
                                        
                                        error_type = self.analyze_error(line)
                                        logger.error(f"❌ ERRO DETECTADO: {line[:200]}")
                                        self.play_alert_sound(error_type)
                    except Exception as e:
                        logger.error(f"Falha ao ler log: {e}")
                
                # Atualiza estado
                self.state["gateway_status"] = gateway_status
                self.state["last_check"] = datetime.now().isoformat()
                self._save_state()
                
                time.sleep(interval)
                
            except KeyboardInterrupt:
                logger.info("⏹️ Monitor parado pelo usuário")
                break
            except Exception as e:
                logger.error(f"Erro no loop de monitor: {e}")
                time.sleep(5)


def main():
    """Ponto de entrada."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Hermes Telegram Audio Delivery Monitor")
    parser.add_argument("--interval", "-i", type=int, default=30, help="Intervalo de verificação em segundos")
    parser.add_argument("--once", "-o", action="store_true", help="Verificar uma vez e sair")
    parser.add_argument("--scan", "-s", action="store_true", help="Apenas escanear cache de áudio")
    parser.add_argument("--status", "-t", action="store_true", help="Ver status do gateway")
    
    args = parser.parse_args()
    
    monitor = AudioDeliveryMonitor()
    
    if args.status:
        status = monitor.check_gateway_status()
        print(f"Gateway rodando: {status.get('running', False)}")
        if status.get('error'):
            print(f"Erro: {status['error'][:200]}")
        return
    
    if args.scan:
        files = monitor.scan_audio_cache()
        print(f"Áudios encontrados: {len(files)}")
        for f in files:
            print(f"  - {f['name']} ({f['size']} bytes)")
        return
    
    if args.once:
        logger.info("Verificação única...")
        monitor.monitor_loop(interval=1)
        return
    
    monitor.monitor_loop(interval=args.interval)


if __name__ == "__main__":
    main()
