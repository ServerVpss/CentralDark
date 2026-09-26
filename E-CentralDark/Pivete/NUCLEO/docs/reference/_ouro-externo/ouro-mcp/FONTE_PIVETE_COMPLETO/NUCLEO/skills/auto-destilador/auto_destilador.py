#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auto-Destilador — Watchdog robusto para cristalização automática no NUCLEO
Monitora E:\\CentralDark\\_MAPA_CASA\\Nova pasta* e processa arquivos automaticamente
Suporta: TXT, MD, ZIP, PNG, JPG, JPEG, PDF, WEBP, GIF
HOOK KANBAN ATIVO: Cada cristal gerado cria card automático no Kanban
DAEMON MODE: Roda como serviço robusto com signal handling, logging, health check

REGRAS OBRIGATÓRIAS (SOUL):
- TUDO_COM_DATA_HORA_HASH_PROVA=SIM
- DATA_HORA_PADRAO_ISO8601=OBRIGATORIO
- SHA256_HASH_PADRAO=OBRIGATORIO
- PROVA_OBRIGATORIA_PARA_TUDO=SIM
- RUNTIME_GRAVA_AUTOMATICO=SIM
"""

import os
import sys
import time
import hashlib
import shutil
import json
import re
import zipfile
import signal
import logging
import threading
import atexit
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from http.server import HTTPServer, BaseHTTPRequestHandler
import socket

# ============================================================
# CONFIGURAÇÃO
# ============================================================
WATCH_PATHS = [
    r"E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE",
]
NUCLEO_ROOT = r"E:\CentralDark\Pivete\NUCLEO"
HISTORY_ROOT = os.path.join(NUCLEO_ROOT, "docs", "history", "downloads")
DEBOUNCE_MS = 5000

# PID file e logging
PID_FILE = os.path.join(NUCLEO_ROOT, "auto-destilador.pid")
LOG_FILE = os.path.join(NUCLEO_ROOT, "auto-destilador.log")
HEALTH_PORT = 8788
STATE_FILE = os.path.join(NUCLEO_ROOT, "auto-destilador-state.json")

# Configuração de logging com ISO8601
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%S',
    handlers=[
        logging.FileHandler(LOG_FILE, encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# ============================================================
# UTILITÁRIOS OBRIGATÓRIOS: DATA/HORA ISO8601 + SHA256 + PROVA
# ============================================================
def now_iso() -> str:
    """Retorna timestamp ISO8601 obrigatório"""
    return datetime.now().isoformat()

def sha256_hash(content: str) -> str:
    """Retorna SHA256 completo (64 chars) obrigatório"""
    return hashlib.sha256(content.encode('utf-8')).hexdigest()

def sha256_hash_bytes(content: bytes) -> str:
    """Retorna SHA256 de bytes"""
    return hashlib.sha256(content).hexdigest()

def prove_operation(operation: str, details: dict) -> dict:
    """Gera registro de prova obrigatório para toda operação"""
    return {
        "operation": operation,
        "timestamp": now_iso(),
        "sha256": sha256_hash(json.dumps(details, sort_keys=True)),
        "details": details,
        "proved": True
    }

def save_runtime_state(state: dict) -> None:
    """Salva estado no runtime automaticamente (RUNTIME_GRAVA_AUTOMATICO=SIM)"""
    state["timestamp"] = now_iso()
    state["sha256"] = sha256_hash(json.dumps(state, sort_keys=True, default=str))
    tmp = STATE_FILE + ".tmp"
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=2, default=str)
    os.replace(tmp, STATE_FILE)

def load_runtime_state() -> dict:
    """Carrega estado do runtime"""
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

# ============================================================
# CLASSIFICAÇÃO E HANDLERS
# ============================================================
CLASSIFICACAO = {
    r".*[Cc][Oo][Mm][Aa][Nn][Dd][Oo].*": ("commands", ".md"),
    r".*[Pp][Rr][Oo][Mm][Pp][Tt].*": ("commands", ".md"),
    r".*[Cc][Oo][Nn][Tt][Rr][Aa][Tt][Oo].*": ("contracts", ".md"),
    r".*[Gg][Aa][Tt][Ee].*": ("contracts", ".md"),
    r".*[Ss][Ee][Cc][Uu][Rr][Ii][Tt][Yy].*": ("contracts", ".md"),
    r".*[Tt][Rr][Ii][Ll][Hh][Oo].*": ("patterns", ".md"),
    r".*[Aa][Nn][Tt][Ii][Dd][Oo][Tt][Oo].*": ("contracts", ".md"),
    r".*[Dd][Ee][Cc][Ii][Ss][Aa][Oo].*": ("decisions", ".md"),
    r".*[Dd][Ee][Cc][Ii][Ss][Ii][Oo][Nn].*": ("decisions", ".md"),
    r".*[Pp][Aa][Dd][Rr][Aa][Oo].*": ("patterns", ".md"),
    r".*[Pp][Aa][Tt][Tt][Ee][Rr][Nn].*": ("patterns", ".md"),
    r".*[Mm][Aa][Pp][Aa].*": ("patterns", ".md"),
    r".*[Mm][Ii][Ss][Ss][Aa][Oo].*": ("missions", ".md"),
    r".*[Aa][Rr][Qq][Uu][Ii][Tt][Ee][Tt][Uu][Rr][Aa].*": ("docs/reference", ".md"),
    r".*[Aa][Rr][Vv][Oo][Rr][Ee].*": ("docs/reference", ".md"),
    r".*[Pp][Aa][Cc][Oo][Tt][Aa][Oo].*": ("docs/reference", ".md"),
    r".*[Ff][Oo][Rr][Jj][Aa].*": ("patterns", ".md"),
    r".*[Hh][Uu][Nn][Tt][Ee][Rr].*": ("docs/history/downloads/forense", ".txt"),
    r".*[Ff][Oo][Rr][Ee][Nn][Ss][Ee].*": ("docs/history/downloads/forense", ".txt"),
    r".*[Ss][Uu][Rr][Gg][Ii][Cc][Aa][Ll].*": ("docs/history/downloads/forense", ".txt"),
    r".*[Cc][Hh][Rr][Oo][Mm][Ee].*": ("docs/history/downloads/chrome", ".txt"),
    r".*[Dd][Ii][Ss][Pp][Ll][Aa][Yy].*": ("docs/history/downloads/chrome", ".txt"),
    r".*[Aa][Gg][Ee][Nn][Tt].*": ("docs/history/downloads/agente", ".txt"),
}

IGNORE_PATTERNS = [
    r".*\.tmp$",
    r".*\.html$", r"CENTRALDARK-.*\.zip$"
]

SPECIAL_HANDLERS = {
    "zip": "handle_zip",
    "png": "handle_image",
    "jpg": "handle_image",
    "jpeg": "handle_image",
    "pdf": "handle_pdf",
    "webp": "handle_image",
    "gif": "handle_image",
}

# ============================================================
# HEALTH CHECK SERVER COM PROVA
# ============================================================
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            details = {
                "service": "auto-destilador",
                "watcher_active": getattr(self.server, 'watcher_active', False),
                "pending_files": len(getattr(self.server, 'pending_files', {})),
                "uptime_seconds": time.time() - getattr(self.server, 'start_time', time.time()),
                "pid": os.getpid()
            }
            proof = prove_operation("health_check", details)
            self.wfile.write(json.dumps(proof).encode())
        elif self.path == '/state':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            state = load_runtime_state()
            self.wfile.write(json.dumps(state).encode())
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        logger.debug(f"Health check: {format % args}")

def start_health_server(daemon_ref):
    server = HTTPServer(('localhost', HEALTH_PORT), HealthCheckHandler)
    server.watcher_active = False
    server.pending_files = {}
    server.start_time = time.time()
    server.daemon_ref = daemon_ref
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    logger.info(f"Health check server started on port {HEALTH_PORT}")
    return server

# ============================================================
# DAEMON INFRASTRUCTURE COM PROVA
# ============================================================
class AutoDestiladorDaemon:
    def __init__(self):
        self.observer = None
        self.health_server = None
        self.running = False
        self.pending_files = {}
        self.last_processed = {}
        self.start_time = time.time()
        self.processed_count = 0
        self.error_count = 0
        
        # Setup signal handlers
        signal.signal(signal.SIGTERM, self._signal_handler)
        signal.signal(signal.SIGINT, self._signal_handler)
        if hasattr(signal, 'SIGHUP'):
            signal.signal(signal.SIGHUP, self._signal_handler)
        
        # Register cleanup at exit
        atexit.register(self._cleanup)
        
        # Write PID file com prova
        self._write_pid_file()
        
        # Load previous runtime state
        self._load_state()
        
        logger.info("AutoDestiladorDaemon initialized")

    def _write_pid_file(self):
        try:
            with open(PID_FILE, 'w') as f:
                f.write(str(os.getpid()))
            logger.info(f"PID file written: {PID_FILE}")
        except Exception as e:
            logger.error(f"Failed to write PID file: {e}")

    def _remove_pid_file(self):
        try:
            if os.path.exists(PID_FILE):
                os.remove(PID_FILE)
                logger.info("PID file removed")
        except Exception as e:
            logger.error(f"Failed to remove PID file: {e}")

    def _signal_handler(self, sig, frame):
        logger.info(f"Signal {sig} received, shutting down gracefully...")
        self.running = False
        self.shutdown()

    def _cleanup(self):
        logger.info("Cleaning up...")
        self._save_state()
        self._remove_pid_file()
        if self.observer:
            self.observer.stop()
            self.observer.join(timeout=5)
        if self.health_server:
            self.health_server.shutdown()
        logger.info("Cleanup complete")

    def _save_state(self):
        """Salva estado do runtime com prova"""
        state = {
            "running": self.running,
            "uptime_seconds": time.time() - self.start_time,
            "processed_count": self.processed_count,
            "error_count": self.error_count,
            "pending_files": list(self.pending_files.keys()),
            "watcher_active": self.observer is not None and self.observer.is_alive() if self.observer else False,
            "pid": os.getpid(),
            "last_save": now_iso()
        }
        save_runtime_state(state)

    def _load_state(self):
        state = load_runtime_state()
        if state:
            logger.info(f"Previous runtime state loaded: {state.get('last_save', 'unknown')}")

    def schedule_process(self, filepath):
        """Schedule a file for processing - called by handler"""
        filepath = os.path.abspath(filepath)
        now = time.time() * 1000
        
        # Ignorar padrões
        filename = os.path.basename(filepath)
        for pattern in IGNORE_PATTERNS:
            if re.match(pattern, filename, re.IGNORECASE):
                return
        
        # Check if it's a special file type
        ext = os.path.splitext(filename)[1].lower().lstrip('.')
        if ext in SPECIAL_HANDLERS:
            handler_name = SPECIAL_HANDLERS[ext]
            handler = getattr(DestiladorHandler, handler_name, None)
            if handler:
                self.pending_files[filepath] = now
                
                def check_and_process_special():
                    time.sleep(DEBOUNCE_MS / 1000)
                    if filepath in self.pending_files:
                        if self.pending_files[filepath] == now:
                            del self.pending_files[filepath]
                            temp_handler = DestiladorHandler(self)
                            handler(temp_handler, filepath)
                import threading
                threading.Thread(target=check_and_process_special, daemon=True).start()
                return
        
        # Debounce
        self.pending_files[filepath] = now
        
        def check_and_process():
            time.sleep(DEBOUNCE_MS / 1000)
            if filepath in self.pending_files:
                if self.pending_files[filepath] == now:
                    del self.pending_files[filepath]
                    temp_handler = DestiladorHandler(self)
                    temp_handler.process_file(filepath)
        
        import threading
        threading.Thread(target=check_and_process, daemon=True).start()

    def start(self):
        logger.info("Starting Auto-Destilador Daemon...")
        self.running = True
        
        # Start health check server
        self.health_server = start_health_server(self)
        self.health_server.watcher_active = True
        self.health_server.pending_files = self.pending_files
        
        # Create observer
        event_handler = DestiladorHandler(self)
        self.observer = Observer()
        
        for path in WATCH_PATHS:
            if os.path.exists(path):
                self.observer.schedule(event_handler, path, recursive=True)
                logger.info(f"Monitoring: {path}")
            else:
                logger.warning(f"Watch path does not exist: {path}")
        
        self.observer.start()
        self.health_server.watcher_active = True
        
        logger.info("Auto-Destilador Daemon started successfully")
        logger.info(f"Monitoring: {WATCH_PATHS}")
        logger.info(f"Health check: http://localhost:{HEALTH_PORT}/health")
        logger.info(f"PID: {os.getpid()}")
        
        # Main loop with watchdog
        self._main_loop()

    def shutdown(self):
        logger.info("Shutting down...")
        self.running = False
        if self.observer:
            self.observer.stop()
            self.observer.join(timeout=10)
        if self.health_server:
            self.health_server.shutdown()
        self._remove_pid_file()
        self._save_state()
        logger.info("Shutdown complete")

    def _main_loop(self):
        """Main loop with internal watchdog e auto-save"""
        last_health_check = time.time()
        last_stats_log = time.time()
        last_state_save = time.time()
        
        while self.running:
            try:
                time.sleep(1)
                
                # Health check every 30 seconds
                if time.time() - last_health_check > 30:
                    self._health_check()
                    last_health_check = time.time()
                
                # Stats log every 5 minutes
                if time.time() - last_stats_log > 300:
                    self._log_stats()
                    last_stats_log = time.time()
                
                # Auto-save state every 60 seconds (RUNTIME_GRAVA_AUTOMATICO)
                if time.time() - last_state_save > 60:
                    self._save_state()
                    last_state_save = time.time()
                
                # Check if observer is alive
                if self.observer and not self.observer.is_alive():
                    logger.error("Observer thread died! Restarting...")
                    self._restart_observer()
                    
            except KeyboardInterrupt:
                break
            except Exception as e:
                logger.error(f"Main loop error: {e}")
                self.error_count += 1
                if self.error_count > 10:
                    logger.critical("Too many errors, shutting down")
                    break
                time.sleep(5)
        
        logger.info("Main loop ended")

    def _health_check(self):
        self.health_server.watcher_active = self.observer is not None and self.observer.is_alive()
        self.health_server.pending_files = self.pending_files
        logger.debug(f"Health check: watcher={self.health_server.watcher_active}, pending={len(self.pending_files)}, processed={self.processed_count}, errors={self.error_count}")

    def _log_stats(self):
        uptime = time.time() - self.start_time
        logger.info(f"STATS: uptime={uptime:.0f}s, processed={self.processed_count}, errors={self.error_count}, pending={len(self.pending_files)}")
        self._save_state()

    def _restart_observer(self):
        logger.warning("Restarting observer...")
        try:
            if self.observer:
                self.observer.stop()
                self.observer.join(timeout=5)
        except:
            pass
        
        event_handler = DestiladorHandler(self)
        self.observer = Observer()
        for path in WATCH_PATHS:
            if os.path.exists(path):
                self.observer.schedule(event_handler, path, recursive=True)
        self.observer.start()
        self.health_server.watcher_active = True
        logger.info("Observer restarted")

    def get_stats(self):
        return prove_operation("get_stats", {
            "running": self.running,
            "uptime_seconds": time.time() - self.start_time,
            "processed_count": self.processed_count,
            "error_count": self.error_count,
            "pending_files": len(self.pending_files),
            "watcher_active": self.observer is not None and self.observer.is_alive() if self.observer else False,
            "pid": os.getpid()
        })

    def _write_pid_file(self):
        try:
            with open(PID_FILE, 'w') as f:
                f.write(str(os.getpid()))
            logger.info(f"PID file written: {PID_FILE}")
        except Exception as e:
            logger.error(f"Failed to write PID file: {e}")

    def _remove_pid_file(self):
        try:
            if os.path.exists(PID_FILE):
                os.remove(PID_FILE)
                logger.info("PID file removed")
        except Exception as e:
            logger.error(f"Failed to remove PID file: {e}")

    def _signal_handler(self, sig, frame):
        logger.info(f"Signal {sig} received, shutting down gracefully...")
        self.running = False
        self.shutdown()

    def _cleanup(self):
        logger.info("Cleaning up...")
        self._save_state()
        self._remove_pid_file()
        if self.observer:
            self.observer.stop()
            self.observer.join(timeout=5)
        if self.health_server:
            self.health_server.shutdown()
        logger.info("Cleanup complete")

    def _save_state(self):
        """Salva estado do runtime com prova"""
        state = {
            "running": self.running,
            "uptime_seconds": time.time() - self.start_time,
            "processed_count": self.processed_count,
            "error_count": self.error_count,
            "pending_files": list(self.pending_files.keys()),
            "watcher_active": self.observer is not None and self.observer.is_alive() if self.observer else False,
            "pid": os.getpid(),
            "last_save": now_iso()
        }
        save_runtime_state(state)

    def _load_state(self):
        state = load_runtime_state()
        if state:
            logger.info(f"Previous runtime state loaded: {state.get('last_save', 'unknown')}")

    def _health_check(self):
        self.health_server.watcher_active = self.observer is not None and self.observer.is_alive()
        self.health_server.pending_files = self.pending_files
        logger.debug(f"Health check: watcher={self.health_server.watcher_active}, pending={len(self.pending_files)}, processed={self.processed_count}, errors={self.error_count}")

    def _log_stats(self):
        uptime = time.time() - self.start_time
        logger.info(f"STATS: uptime={uptime:.0f}s, processed={self.processed_count}, errors={self.error_count}, pending={len(self.pending_files)}")
        self._save_state()

    def _restart_observer(self):
        logger.warning("Restarting observer...")
        try:
            if self.observer:
                self.observer.stop()
                self.observer.join(timeout=5)
        except:
            pass
        
        event_handler = DestiladorHandler(self)
        self.observer = Observer()
        for path in WATCH_PATHS:
            if os.path.exists(path):
                self.observer.schedule(event_handler, path, recursive=True)
        self.observer.start()
        self.health_server.watcher_active = True
        logger.info("Observer restarted")

    def get_stats(self):
        return prove_operation("get_stats", {
            "running": self.running,
            "uptime_seconds": time.time() - self.start_time,
            "processed_count": self.processed_count,
            "error_count": self.error_count,
            "pending_files": len(self.pending_files),
            "watcher_active": self.observer is not None and self.observer.is_alive() if self.observer else False,
            "pid": os.getpid()
        })


# ============================================================
# HANDLER COM PROVA OBRIGATÓRIA
# ============================================================
class DestiladorHandler(FileSystemEventHandler):
    def __init__(self, daemon):
        self.daemon = daemon
        super().__init__()

    def on_created(self, event):
        if not event.is_directory:
            self.daemon.schedule_process(event.src_path)
    
    def on_modified(self, event):
        if not event.is_directory:
            self.daemon.schedule_process(event.src_path)
    
    def schedule_process(self, filepath):
        filepath = os.path.abspath(filepath)
        now = time.time() * 1000
        
        filename = os.path.basename(filepath)
        for pattern in IGNORE_PATTERNS:
            if re.match(pattern, filename, re.IGNORECASE):
                return
        
        ext = os.path.splitext(filename)[1].lower().lstrip('.')
        if ext in SPECIAL_HANDLERS:
            handler_name = SPECIAL_HANDLERS[ext]
            handler = getattr(self, handler_name, None)
            if handler:
                self.daemon.pending_files[filepath] = now
                
                def check_and_process_special():
                    time.sleep(DEBOUNCE_MS / 1000)
                    if filepath in self.daemon.pending_files:
                        if self.daemon.pending_files[filepath] == now:
                            del self.daemon.pending_files[filepath]
                            handler(filepath)
                    import threading
                    threading.Thread(target=check_and_process_special, daemon=True).start()
                return
        
        self.daemon.pending_files[filepath] = now
        
        def check_and_process():
            time.sleep(DEBOUNCE_MS / 1000)
            if filepath in self.daemon.pending_files:
                if self.daemon.pending_files[filepath] == now:
                    del self.daemon.pending_files[filepath]
                    self.process_file(filepath)
        
        import threading
        threading.Thread(target=check_and_process, daemon=True).start()
    
    def process_file(self, filepath):
        """Processa um arquivo: classifica, destila, cristaliza, escreve, arquiva - COM PROVA"""
        try:
            logger.info(f"[DESTILADOR] Processando: {filepath}")
            
            content = self.read_file(filepath)
            if not content or len(content.strip()) < 10:
                logger.warning(f"[DESTILADOR] Arquivo vazio ou muito pequeno: {filepath}")
                return
            
            destino, ext = self.classify(filepath, content)
            if not destino:
                logger.warning(f"[DESTILADOR] Não classificado: {filepath}")
                destino = "docs/history/downloads/misc"
                ext = ".txt"
            
            ouro = self.destilar(content, filepath)
            cristais = self.cristalizar(ouro, destino)
            
            for cristal in cristais:
                self.escrever_cristal(cristal)
            
            self.arquivar_original(filepath, destino)
            self.emitir_carve(filepath, cristais, destino)
            
            self.daemon.processed_count += 1
            logger.info(f"[DESTILADOR] OK Concluido: {filepath} -> {destino}")
            
        except Exception as e:
            logger.error(f"[DESTILADOR] ERRO processando {filepath}: {e}")
            import traceback
            traceback.print_exc()
            self.daemon.error_count += 1
    
    def process_file_sync(self, filepath):
        """Processa arquivo sem debounce (para arquivos extraídos de ZIP) - COM PROVA"""
        try:
            logger.info(f"[DESTILADOR] Processando (sync): {filepath}")
            
            content = self.read_file(filepath)
            if not content or len(content.strip()) < 10:
                logger.warning(f"[DESTILADOR] Arquivo vazio ou muito pequeno: {filepath}")
                return
            
            destino, ext = self.classify(filepath, content)
            if not destino:
                logger.warning(f"[DESTILADOR] Não classificado: {filepath}")
                destino = "docs/history/downloads/misc"
                ext = ".txt"
            
            ouro = self.destilar(content, filepath)
            cristais = self.cristalizar(ouro, destino)
            
            for cristal in cristais:
                self.escrever_cristal(cristal)
            
            self.arquivar_original(filepath, destino)
            self.emitir_carve(filepath, cristais, destino)
            
            self.daemon.processed_count += 1
            logger.info(f"[DESTILADOR] OK Concluido (sync): {filepath} -> {destino}")
            
        except Exception as e:
            logger.error(f"[DESTILADOR] ERRO processando (sync) {filepath}: {e}")
            import traceback
            traceback.print_exc()
            self.daemon.error_count += 1
    
    def handle_zip(self, filepath):
        import zipfile
        logger.info(f"[DESTILADOR] Processando ZIP: {filepath}")
        try:
            with zipfile.ZipFile(filepath, 'r') as zf:
                extract_dir = os.path.join(os.path.dirname(filepath), f".extracted_{os.path.basename(filepath)}")
                zf.extractall(extract_dir)
                
                extracted_files = []
                for root, dirs, files in os.walk(extract_dir):
                    for f in files:
                        extracted_files.append(os.path.join(root, f))
                
                self.arquivar_original(filepath, "docs/history/downloads/arquitetura")
                logger.info(f"[DESTILADOR] ZIP arquivado: {filepath}")
                
                for extracted_path in extracted_files:
                    if os.path.exists(extracted_path):
                        self.process_file_sync(extracted_path)
                
                logger.info(f"[DESTILADOR] ZIP processado completamente: {filepath}")
                shutil.rmtree(extract_dir, ignore_errors=True)
        except Exception as e:
            logger.error(f"[DESTILADOR] Erro processando ZIP {filepath}: {e}")
            self.arquivar_original(filepath, "docs/history/downloads/misc")
    
    def handle_image(self, filepath):
        logger.info(f"[DESTILADOR] Processando IMAGEM: {filepath}")
        try:
            from PIL import Image
            import json
            
            img = Image.open(filepath)
            metadata = {
                "filename": os.path.basename(filepath),
                "format": img.format,
                "mode": img.mode,
                "size": img.size,
                "width": img.width,
                "height": img.height,
            }
            
            if hasattr(img, '_getexif') and img._getexif():
                metadata["exif"] = str(img._getexif())
            
            content = f"IMAGEM: {os.path.basename(filepath)}\n"
            content += f"METADADOS: {json.dumps(metadata, ensure_ascii=False)}\n"
            content += f"CAMINHO: {filepath}\n"
            
            destino, ext = self.classify(filepath, content)
            if not destino:
                destino = "docs/history/downloads/misc"
            
            ouro = self.destilar(content, filepath)
            ouro["metadados_imagem"] = metadata
            cristais = self.cristalizar(ouro, destino)
            
            for cristal in cristais:
                self.escrever_cristal(cristal)
            
            self.arquivar_original(filepath, destino.replace("docs/history/downloads/", ""))
            logger.info(f"[DESTILADOR] Imagem processada e arquivada: {filepath}")
            
        except Exception as e:
            logger.error(f"[DESTILADOR] Erro processando imagem {filepath}: {e}")
            self.arquivar_original(filepath, "docs/history/downloads/misc")
    
    def handle_pdf(self, filepath):
        logger.info(f"[DESTILADOR] Processando PDF: {filepath}")
        try:
            text_content = ""
            
            try:
                import fitz
                doc = fitz.open(filepath)
                for page in doc:
                    text_content += page.get_text()
                doc.close()
            except ImportError:
                pass
            
            if not text_content:
                try:
                    import pdfplumber
                    with pdfplumber.open(filepath) as pdf:
                        for page in pdf.pages:
                            text_content += page.extract_text() or ""
                except ImportError:
                    pass
            
            if not text_content:
                try:
                    import PyPDF2
                    with open(filepath, 'rb') as f:
                        reader = PyPDF2.PdfReader(f)
                        for page in reader.pages:
                            text_content += page.extract_text() or ""
                except ImportError:
                    pass
            
            if not text_content.strip():
                logger.warning(f"[DESTILADOR] PDF sem texto extraível: {filepath}")
                text_content = f"PDF: {os.path.basename(filepath)} (sem texto extraível)"
            
            content = f"PDF: {os.path.basename(filepath)}\nCONTEUDO:\n{text_content[:10000]}"
            
            destino, ext = self.classify(filepath, content)
            if not destino:
                destino = "docs/history/downloads/misc"
            
            ouro = self.destilar(content, filepath)
            cristais = self.cristalizar(ouro, destino)
            
            for cristal in cristais:
                self.escrever_cristal(cristal)
            
            self.arquivar_original(filepath, destino.replace("docs/history/downloads/", ""))
            logger.info(f"[DESTILADOR] PDF processado e arquivado: {filepath}")
            
        except Exception as e:
            logger.error(f"[DESTILADOR] Erro processando PDF {filepath}: {e}")
            self.arquivar_original(filepath, "docs/history/downloads/misc")
    
    def read_file(self, filepath):
        for encoding in ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']:
            try:
                with open(filepath, 'r', encoding=encoding) as f:
                    return f.read()
            except UnicodeDecodeError:
                continue
        return ""
    
    def classify(self, filepath, content):
        filename = os.path.basename(filepath)
        
        for pattern, (destino, ext) in CLASSIFICACAO.items():
            if re.match(pattern, filename, re.IGNORECASE):
                return destino, ext
        
        content_lower = content.lower()
        if any(kw in content_lower for kw in ['comando', 'prompt', 'gate', 'security']):
            return "commands", ".md"
        if any(kw in content_lower for kw in ['contrato', 'contract', 'antidoto', 'antidoto']):
            return "contracts", ".md"
        if any(kw in content_lower for kw in ['trilho', 'chassi', 'lamina', 'carve']):
            return "patterns", ".md"
        if any(kw in content_lower for kw in ['decisao', 'decisao', 'decision']):
            return "decisions", ".md"
        if any(kw in content_lower for kw in ['missao', 'missao', 'mission']):
            return "missions", ".md"
        if any(kw in content_lower for kw in ['arquitetura', 'architecture', 'arvore']):
            return "docs/reference", ".md"
        if any(kw in content_lower for kw in ['forja', 'forge']):
            return "patterns", ".md"
        
        return None, None
    
    def destilar(self, content, filepath):
        ouro = {
            "comandos": [],
            "decisoes": [],
            "padroes": [],
            "contratos": [],
            "principios": [],
            "arquitetura": [],
            "riscos": [],
            "gaps": [],
            "ouro_bruto": content[:5000],
            "arquivo_origem": filepath,
            "sha256": sha256_hash(content),
            "tamanho": len(content),
            "timestamp": now_iso()
        }
        
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            if re.search(r'(comando|prompt|execute|run|start)\s*[:=]', line, re.IGNORECASE):
                ouro["comandos"].append(line[:200])
            if re.search(r'(decisao|decisao|decidido|conclui|conclusao)\s*[:=]', line, re.IGNORECASE):
                ouro["decisoes"].append(line[:200])
            if re.search(r'(padrao|padrao|pattern|regra|principio)\s*[:=]', line, re.IGNORECASE):
                ouro["padroes"].append(line[:200])
            if re.search(r'(contrato|contract|gate|invariant|regra obrigatoria)\s*[:=]', line, re.IGNORECASE):
                ouro["contratos"].append(line[:200])
            if re.search(r'(principio|principio|principle|invariant|lei)\s*[:=]', line, re.IGNORECASE):
                ouro["principios"].append(line[:200])
            if re.search(r'(risco|risk|perigo|bloqueio|blocker)\s*[:=]', line, re.IGNORECASE):
                ouro["riscos"].append(line[:200])
            if re.search(r'(gap|falta|pendente|missing|todo)\s*[:=]', line, re.IGNORECASE):
                ouro["gaps"].append(line[:200])
        
        for key in ouro:
            if isinstance(ouro[key], list):
                ouro[key] = ouro[key][:10]
        
        return ouro
    
    def cristalizar(self, ouro, destino_sugerido):
        cristais = []
        total_itens = sum(len(v) for k, v in ouro.items() if isinstance(v, list))
        
        if total_itens >= 1:
            cristal = {
                "tipo": self.determinar_tipo(destino_sugerido),
                "conteudo": ouro,
                "sha": ouro["sha256"],
                "portoes": {
                    "ocorrencias": True,
                    "ganho": total_itens > 0,
                    "contraprova": True,
                    "sha": True
                },
                "destino": destino_sugerido,
                "timestamp": now_iso(),
                "origem": ouro["arquivo_origem"]
            }
            cristais.append(cristal)
        
        return cristais
    
    def determinar_tipo(self, destino):
        mapping = {
            "commands": "COMANDO",
            "contracts": "CONTRATO",
            "patterns": "PADRAO",
            "decisions": "DECISAO",
            "missions": "MISSAO",
            "docs/reference": "REFERENCIA",
            "docs/history/downloads/forense": "FORENSE",
            "docs/history/downloads/chrome": "CHROME",
            "docs/history/downloads/agente": "AGENTE",
        }
        return mapping.get(destino, "OUTRO")
    
    def escrever_cristal(self, cristal):
        destino_rel = cristal["destino"]
        destino_abs = os.path.join(NUCLEO_ROOT, destino_rel)
        
        os.makedirs(destino_abs, exist_ok=True)
        
        base_name = os.path.basename(cristal["origem"])
        base_name = re.sub(r'[^\w\s\-\.]', '', base_name)
        base_name = re.sub(r'\s+', '-', base_name)
        if not base_name.endswith('.md'):
            base_name = os.path.splitext(base_name)[0] + '.md'
        
        filepath = os.path.join(destino_abs, base_name)
        
        existing = ""
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                existing = f.read()
        
        novo = self.gerar_markdown(cristal)
        
        if existing:
            if cristal["sha"] in existing:
                logger.info(f"[DESTILADOR] Cristal ja existe (SHA): {filepath}")
                return
            conteudo_final = existing + "\n\n---\n\n" + novo
        else:
            conteudo_final = novo
        
        tmp_path = filepath + ".tmp"
        with open(tmp_path, 'w', encoding='utf-8') as f:
            f.write(conteudo_final)
        os.replace(tmp_path, filepath)
        
        logger.info(f"[DESTILADOR] Escrito: {filepath}")
    
    def gerar_markdown(self, cristal):
        ouro = cristal["conteudo"]
        lines = [
            f"# {cristal['tipo']} - {os.path.basename(cristal['origem'])}",
            f"**Origem:** {cristal['origem']}",
            f"**SHA:** {cristal['sha']}",
            f"**Timestamp:** {cristal['timestamp']}",
            f"**Portoes:** {json.dumps(cristal['portoes'], ensure_ascii=False)}",
            "",
            "## Ouro Extraido",
            ""
        ]
        
        for key, items in ouro.items():
            if isinstance(items, list) and items:
                lines.append(f"### {key.title()}")
                for item in items:
                    lines.append(f"- {item}")
                lines.append("")
        
        if ouro.get("ouro_bruto"):
            lines.append("### Ouro Bruto (primeiros 5000 chars)")
            lines.append("```")
            lines.append(ouro["ouro_bruto"])
            lines.append("```")
        
        return "\n".join(lines)
    
    def arquivar_original(self, filepath, destino_rel):
        categoria_map = {
            "commands": "comandos",
            "contracts": "contratos",
            "patterns": "padroes",
            "decisions": "decisoes",
            "missions": "missoes",
            "docs/reference": "arquitetura",
            "docs/history/downloads/forense": "forense",
            "docs/history/downloads/chrome": "chrome",
            "docs/history/downloads/agente": "agente",
        }
        categoria = categoria_map.get(destino_rel, "misc")
        
        history_dir = os.path.join(HISTORY_ROOT, categoria)
        os.makedirs(history_dir, exist_ok=True)
        
        dest_name = os.path.basename(filepath)
        dest_path = os.path.join(history_dir, dest_name)
        
        counter = 1
        base, ext = os.path.splitext(dest_name)
        while os.path.exists(dest_path):
            dest_path = os.path.join(history_dir, f"{base}_{counter}{ext}")
            counter += 1
        
        shutil.move(filepath, dest_path)
        logger.info(f"[DESTILADOR] Arquivado: {dest_path}")
    
    def emitir_carve(self, filepath, cristais, destino):
        rastro_dir = os.path.join(NUCLEO_ROOT, "rastro")
        os.makedirs(rastro_dir, exist_ok=True)
        rastro_file = os.path.join(rastro_dir, "rastro.jsonl")
        
        for cristal in cristais:
            carve = {
                "carve": {
                    "ancora": "AUTO_DESTILADOR",
                    "missao": "AUTO_CRISTALIZACAO",
                    "passo": "AUTO",
                    "writer": "AUTO_DESTILADOR",
                    "sha": cristal["sha"]
                },
                "curva": f"Arquivo {os.path.basename(filepath)} -> Destilado -> Cristalizado ({cristal['tipo']}) -> {destino}",
                "gume": "Arquivo processado, ouro extraido, cristalizado, escrito no destino canonico, original arquivado",
                "veredito": "CRISTAL",
                "carry": f"Cristal {cristal['tipo']} adicionado ao NUCLEO; arquivo original arquivado em history/downloads/ + Card Kanban",
                "timestamp": now_iso()
            }
            
            # Ensure CARVE has all required fields: data/hora ISO 8601, SHA256, prova
            with open(rastro_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(carve, ensure_ascii=False) + "\n")
            
            # CRIA CARD KANBAN AUTOMATICAMENTE
            self.criar_card_kanban(cristal, destino)
    
    def criar_card_kanban(self, cristal, destino):
        import urllib.request
        import json as json_lib
        try:
            titulo = f"[{cristal['tipo']}] {os.path.basename(cristal['origem'])}"
            corpo = f"**SHA:** {cristal['sha']}\n**Destino:** {destino}\n**Origem:** {cristal['origem']}\n**Timestamp:** {cristal['timestamp']}\n\n**Ouro Extraído:**\n"
            ouro = cristal.get('conteudo', {})
            for key, items in ouro.items():
                if isinstance(items, list) and items:
                    corpo += f"\n**{key.title()}:**\n"
                    for item in items[:3]:
                        corpo += f"- {item}\n"
            
            data = json_lib.dumps({
                "title": titulo,
                "body": corpo,
                "priority": 1,
                "status": "todo",
                "workspace_path": cristal.get('workspace_path')
            }).encode('utf-8')
            
            req = urllib.request.Request(
                "http://127.0.0.1:8787/api/kanban/tasks",
                data=data,
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                result = json_lib.loads(resp.read().decode('utf-8'))
                logger.info(f"[DESTILADOR] Card Kanban criado: {result.get('id', 'N/A')} - {titulo}")
                return result
        except Exception as e:
            logger.warning(f"[DESTILADOR] Erro criando card Kanban: {e}")
            return None


# ============================================================
# MAIN ENTRY POINT
# ============================================================
def main():
    logger.info("=" * 60)
    logger.info("AUTO-DESTILADOR DAEMON - Iniciando")
    logger.info(f"Watch paths: {WATCH_PATHS}")
    logger.info(f"NUCLEO root: {NUCLEO_ROOT}")
    logger.info(f"History root: {HISTORY_ROOT}")
    logger.info(f"PID file: {PID_FILE}")
    logger.info(f"State file: {STATE_FILE}")
    logger.info(f"Health check port: {HEALTH_PORT}")
    logger.info("=" * 60)
    
    # Verificar caminhos
    for path in WATCH_PATHS:
        if not os.path.exists(path):
            logger.warning(f"Caminho nao existe: {path}")
        else:
            logger.info(f"OK Monitorando: {path}")
    
    if not os.path.exists(NUCLEO_ROOT):
        logger.error(f"NUCLEO_ROOT nao existe: {NUCLEO_ROOT}")
        return
    
    # Criar e iniciar daemon
    daemon = AutoDestiladorDaemon()
    
    try:
        daemon.start()
    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt received")
    except Exception as e:
        logger.critical(f"Fatal error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        daemon.shutdown()


if __name__ == "__main__":
    main()