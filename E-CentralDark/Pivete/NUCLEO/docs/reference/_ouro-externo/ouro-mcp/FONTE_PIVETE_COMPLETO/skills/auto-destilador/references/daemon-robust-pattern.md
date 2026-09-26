# Padrão Daemon Robusto — Auto-Destilador Imortal

## Problema Original
Auto-Destilador rodava como processo background em terminal session → quando terminal fechava, processo morria silenciosamente sem crash, sem log, sem erro.

**Causa Raiz**: Processo background dependia da sessão terminal pai. Quando usuário fechava terminal/sessão, processo órfão morria silenciosamente (sem SIGTERM visível, sem crash log, sem erro visível).

## Solução Definitiva: Padrão Daemon Robusto

### 1. Signal Handlers Obrigatórios
```python
import signal
import sys

def _signal_handler(self, sig, frame):
    logger.info(f"Signal {sig} recebido, shutting down gracefully...")
    self.running = False
    self.shutdown()

signal.signal(signal.SIGTERM, self._signal_handler)
signal.signal(signal.SIGINT, self._signal_handler)
if hasattr(signal, 'SIGHUP'):
    signal.signal(signal.SIGHUP, self._signal_handler)
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

# Inicialização
server = HTTPServer(('localhost', 8788), HealthCheckHandler)
server.watcher_active = False
server.pending_files = {}
server.start_time = time.time()
threading.Thread(target=server.serve_forever, daemon=True).start()
```

### 3. Auto-Restart Observer Watchdog
```python
def _main_loop(self):
    last_health_check = time.time()
    while self.running:
        time.sleep(1)
        
        # Health check a cada 30s
        if time.time() - last_health_check > 30:
            self._health_check()
            last_health_check = time.time()
        
        # Observer watchdog - restart se morrer
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
    logger.info("Observer restarted")
```

### 2. PID File Management
```python
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

# No cleanup/atexit:
atexit.register(self._cleanup)

def _cleanup(self):
    self._remove_pid_file()
    if self.observer:
        self.observer.stop()
        self.observer.join(timeout=5)
```

### 4. Logging Persistente
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

### 3. Auto-Restart Observer Watchdog
```python
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
    logger.info("Observer restarted")
```

### 5. Graceful Shutdown
```python
def shutdown(self):
    logger.info("Shutting down...")
    self.running = False
    if self.observer:
        self.observer.stop()
        self.observer.join(timeout=10)
    if self.health_server:
        self.health_server.shutdown()
    self._remove_pid_file()
    logger.info("Shutdown complete")
```

### 4. Graceful Shutdown + Signal Handlers
```python
signal.signal(signal.SIGTERM, self._signal_handler)
signal.signal(signal.SIGINT, self._signal_handler)
if hasattr(signal, 'SIGHUP'):
    signal.signal(signal.SIGHUP, self._signal_handler)

def _signal_handler(self, sig, frame):
    logger.info(f"Signal {sig} recebido, shutting down gracefully...")
    self.running = False
    self.shutdown()
```

### 6. Graceful Shutdown + atexit
```python
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

---

## Princípio: DAEMON NÃO MORRE COM TERMINAL

> Processo background não deve depender de sessão terminal.
> Signal handlers + PID file + Health check + Auto-restart = IMORTAL.

---

## Regra Geral: DAEMON ROBUSTO = PADRÃO OBRIGATÓRIO

> Todo processo de longa duração deve implementar:
> 1. Signal handlers (SIGTERM, SIGINT, SIGHUP)
> 2. Health check endpoint
> 3. Auto-restart watchdog
> 4. PID file management
> 5. Persistent logging
> 6. Graceful shutdown

---

## Referência: Debugging Transcript 2026-08-23

Ver `references/debugging-transcript-20260823.md` para sessão completa com todos bugs, fixes e decisões de arquitetura que levaram a este padrão.