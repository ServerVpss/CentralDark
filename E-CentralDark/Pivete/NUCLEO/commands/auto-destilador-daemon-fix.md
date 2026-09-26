# COMANDO - auto-destilador-daemon-fix.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\references\auto-destilador-daemon-fix.md
**SHA:** a92cab41df8ab62b
**Timestamp:** 2026-08-28T02:57:24.067165
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- echo "COMANDO: teste" > "/e/CentralDark/_MAPA_CASA/Nova pasta/TESTE.txt"
- > Signal handlers + PID file + Health check + Auto-restart = IMORTAL.

### Ouro Bruto (primeiros 5000 chars)
```
# Auto-Destilador Daemon Fix — Correção Definitiva (2026-08-23)

## Problema Original
Auto-Destilador rodava em `background=true` no terminal tool → terminal fechava → processo morria silenciosamente sem crash, sem log, sem erro. Último CARVE às 02:15:31, processo morreu quando terminal foi fechado.

## Causa Raiz
Processo `background=true` no terminal tool **não sobrevive** ao fechamento da sessão terminal. O processo fica órfão e morre junto com a sessão pai.

## Solução Definitiva: Padrão Daemon Robusto (Imortal)

### 1. Signal Handlers Obrigatórios
```python
import signal

def signal_handler(sig, frame):
    logger.info(f"Signal {sig} received, shutting down gracefully...")
    observer.stop()
    observer.join()
    sys.exit(0)

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGHUP, signal_handler)  # Para terminais que fecham
```

### 2. Health Check HTTP Endpoint
```python
from http.server import HTTPServer, BaseHTTPRequestHandler

class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = json.dumps({
                "status": "healthy",
                "service": "auto-destilador",
                "timestamp": datetime.now().isoformat(),
                "watcher_active": self.server.watcher_active,
                "pending_files": len(self.server.pending_files),
                "uptime_seconds": time.time() - self.server.start_time
            })
            self.wfile.write(response.encode())
        else:
            self.send_response(404)
            self.end_headers()

# Iniciar servidor
server = HTTPServer(('localhost', 8788), HealthCheckHandler)
server.watcher_active = False
server.pending_files = {}
server.start_time = time.time()
threading.Thread(target=server.serve_forever, daemon=True).start()
```

### 3. Auto-Restart Observer Watchdog (30s)
```python
def _main_loop(self):
    last_health_check = time.time()
    while self.running:
        time.sleep(1)
        
        # Health check every 30 seconds
        if time.time() - last_health_check > 30:
            self._health_check()
            last_health_check = time.time()
        
        # Check if observer is alive
        if self.observer and not self.observer.is_alive():
            logger.error("Observer thread died! Restarting...")
            self._restart_observer()

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
```

### 4. PID File Management + atexit Cleanup
```python
PID_FILE = os.path.join(NUCLEO_ROOT, "auto-destilador.pid")

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

# No shutdown()
def _cleanup(self):
    self._remove_pid_file()
    if self.observer:
        self.observer.stop()
        self.observer.join(timeout=5)
    if self.health_server:
        self.health_server.shutdown()
```

### 3. Logging Persistente (Arquivo + Stdout)
```python
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE, encoding='utf-8'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)
```

### 5. Auto-Restart Observer Watchdog (30s)
Já mostrado acima no `_main_loop()` e `_restart_observer()`.

### 6. PID File Management + atexit Cleanup
```python
def _write_pid_file(self):
    try:
        with open(PID_FILE, 'w') as f:
            f.write(str(os.getpid()))
        logger.info(f"PID file written: {PID_FILE}")
    except Exception as e:
        logger.error(f"Failed to write PID file: {e}")

def _cleanup(self):
    logger.info("Cleaning up...")
    self._remove_pid_file()
    if self.observer:
        self.observer.stop()
        self.observer.join(timeout=5)
    if self.health_server:
        self.health_server.shutdown()
    logger.info("Cleanup complete")

atexit.register(self._cleanup)
```

###
```