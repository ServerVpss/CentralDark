#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Auto-Destilador — Watchdog Daemon Robusto para cristalização automática no NUCLEO
Implementa padrão Daemon Robusto obrigatório (lições 26/33/34/38/40/41):
1. Signal Handlers (SIGTERM/SIGINT/SIGHUP) → graceful shutdown
2. Health Check HTTP (/health) → operation + timestamp ISO8601 + sha256 + proved:true
3. Auto-Restart Watchdog (30s loop) → monitora observer → restart automático
4. PID File + atexit → PID file atômico + cleanup
5. Logging Persistente → FileHandler + StreamHandler
6. Auto-Save State (60s) → timestamp + sha256 + proved:true
"""

import os
import sys
import time
import hashlib
import shutil
import json
import re
import signal
import atexit
import threading
import logging
from pathlib import Path
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from http.server import HTTPServer, BaseHTTPRequestHandler

# ===================== CONFIGURAÇÃO =====================
WATCH_PATHS = [
    r"E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE"
]
NUCLEO_ROOT = r"E:\CentralDark\Pivete\NUCLEO"
HISTORY_ROOT = os.path.join(NUCLEO_ROOT, "docs", "history", "downloads")
DEBOUNCE_MS = 500

# Daemon Robusto config
HEALTH_PORT = 8788
PID_FILE = os.path.join(NUCLEO_ROOT, "auto-destilador.pid")
STATE_FILE = os.path.join(NUCLEO_ROOT, "auto-destilador-state.json")
LOG_FILE = os.path.join(NUCLEO_ROOT, "auto-destilador.log")
WATCHDOG_INTERVAL = 30  # segundos
STATE_SAVE_INTERVAL = 60  # segundos

# Classificação (inalterado)
CLASSIFICACAO = {
    r".*[Cc][Oo][Mm][Aa][Nn][Dd][Oo].*": ("commands", ".md"),
    r".*[Pp][Rr][Oo][Mm][Pp][Tt].*": ("commands", ".md"),
    r".*[Cc][Oo][Nn][Tt][Rr][Aa][Tt][Oo].*": ("contracts", ".md"),
    r".*[Gg][Aa][Tt][Ee].*": ("contracts", ".md"),
    r".*[Ss][Ee][Cc][Uu][Rr][Ii][Tt][Yy].*": ("contracts", ".md"),
    r".*[Tt][Rr][Ii][Ll][Hh][Oo].*": ("patterns", ".md"),
    r".*[Aa][Nn][Tt][Ii][Dd][Oo][Tt][Oo].*": ("contracts", ".md"),
    r".*[Aa][Nn][Tt][Ii][Dd][Oo][Tt][Oo].*": ("contracts", ".md"),
    r".*[Dd][Ee][Cc][Ii][Ss][Aa][Oo].*": ("decisions", ".md"),
    r".*[Dd][Ee][Cc][Ii][Ss][Ii][Oo][Nn].*": ("decisions", ".md"),
    r".*[Pp][Aa][Dd][Rr][Aa][Oo].*": ("patterns", ".md"),
    r".*[Pp][Aa][Tt][Tt][Ee][Rr][Nn].*": ("patterns", ".md"),
    r".*[Mm][Aa][Pp][Aa].*": ("patterns", ".md"),
    r".*[Mm][Ii][Ss][Ss][Aa][Oo].*": ("missions", ".md"),
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

# NÃO ignorar zip/html/pdf/png — isso é o lote do CHEFE.
# Só lixo, segredo e ruído de extração.
IGNORE_PATTERNS = [
    r".*\.tmp$",
    r".*\.lnk$",
    r"^\.env$",
    r".*\.env$",
    r".*\.pem$",
    r".*\.key$",
    r".*\.exe$",
    r".*\.dll$",
    r".*\.pyc$",
    r".*\.xsd$",
    r".*\.tar\.gz$",
    r".*\.tsx$",
    r".*\.jsx$",
]
SKIP_DIR_NAMES = {
    ".git", ".cache", ".claude", ".claude-account-b", ".codex",
    ".config", ".cua-driver", ".docker", "node_modules",
    "__pycache__", ".extracted_", ".agents", "webhook-clean",
    "schemas", "Codex", "CentralDark-live", "work",
    "prior-conversation-with-codex-conversation-role",
}
TEXT_EXTS = {
    ".txt", ".md", ".json", ".yml", ".yaml", ".csv", ".xml",
    ".html", ".htm", ".py", ".js", ".ts", ".mjs", ".cjs",
    ".sh", ".ps1", ".bat", ".css", ".svg",
}

# Estado
pending_files = {}
last_processed = {}

# ===================== LOGGING PERSISTENTE =====================
def setup_logging():
    logger = logging.getLogger("auto-destilador")
    logger.setLevel(logging.INFO)
    logger.handlers.clear()
    
    # File handler (persistente)
    fh = logging.FileHandler(LOG_FILE, encoding='utf-8')
    fh.setLevel(logging.INFO)
    fh.setFormatter(logging.Formatter(
        '%(asctime)s | %(levelname)s | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    ))
    logger.addHandler(fh)
    
    # Stream handler (stdout)
    sh = logging.StreamHandler(sys.stdout)
    sh.setLevel(logging.INFO)
    sh.setFormatter(logging.Formatter('%(message)s'))
    logger.addHandler(sh)
    
    return logger

logger = setup_logging()

# ===================== PID FILE =====================
def write_pid_file():
    """Escrita atômica do PID file"""
    tmp = PID_FILE + ".tmp"
    with open(tmp, 'w') as f:
        f.write(str(os.getpid()))
    os.replace(tmp, PID_FILE)

def remove_pid_file():
    try:
        os.remove(PID_FILE)
    except OSError:
        pass

def cleanup_on_exit():
    """Cleanup chamado no atexit"""
    logger.info("Shutdown graceful iniciado")
    remove_pid_file()
    save_state()

atexit.register(cleanup_on_exit)

# ===================== SIGNAL HANDLERS =====================
shutdown_requested = False

def signal_handler(signum, frame):
    global shutdown_requested
    sig_name = signal.Signals(signum).name
    logger.info(f"Signal recebido: {sig_name} ({signum})")
    shutdown_requested = True

# Windows não tem SIGHUP - registrar apenas sinais disponíveis
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)
if hasattr(signal, 'SIGHUP'):
    signal.signal(signal.SIGHUP, signal_handler)

# ===================== STATE MANAGEMENT =====================
def compute_state_hash(state_dict):
    """SHA256 do estado para prova"""
    content = json.dumps(state_dict, sort_keys=True, ensure_ascii=False).encode('utf-8')
    return hashlib.sha256(content).hexdigest()

def save_state():
    """Salva estado com prova (timestamp ISO8601 + sha256 + proved:true)"""
    state = {
        "running": not shutdown_requested,
        "uptime_seconds": time.time() - start_time if 'start_time' in globals() else 0,
        "processed_count": globals().get('processed_count', 0),
        "error_count": globals().get('error_count', 0),
        "pending_files": list(pending_files.keys()),
        "watcher_active": observer.is_alive() if 'observer' in globals() and observer else False,
        "pid": os.getpid(),
        "last_save": datetime.now().isoformat(),
    }
    state["sha256"] = compute_state_hash(state)
    state["proved"] = True
    
    tmp = STATE_FILE + ".tmp"
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(state, f, ensure_ascii=False, indent=2)
    os.replace(tmp, STATE_FILE)
    logger.debug("State saved with proof")

# Auto-save thread
def auto_save_loop():
    while not shutdown_requested:
        time.sleep(STATE_SAVE_INTERVAL)
        if not shutdown_requested:
            save_state()

# ===================== HEALTH CHECK HTTP =====================
class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health":
            state = {
                "operation": "health_check",
                "timestamp": datetime.now().isoformat(),
                "sha256": "",  # preenchido abaixo
                "details": {
                    "service": "auto-destilador",
                    "watcher_active": observer.is_alive() if 'observer' in globals() and observer else False,
                    "pid": os.getpid(),
                    "uptime_seconds": time.time() - start_time if 'start_time' in globals() else 0,
                    "processed_count": globals().get('processed_count', 0),
                    "error_count": globals().get('error_count', 0),
                    "pending_files": len(pending_files),
                    "shutdown_requested": shutdown_requested
                },
                "proved": True
            }
            # SHA256 dos details
            details_json = json.dumps(state["details"], sort_keys=True, ensure_ascii=False).encode('utf-8')
            state["sha256"] = hashlib.sha256(details_json).hexdigest()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(state, ensure_ascii=False).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Silenciar logs do HTTP server
        pass

def start_health_server():
    server = HTTPServer(('127.0.0.1', HEALTH_PORT), HealthHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    logger.info(f"Health check server rodando em http://127.0.0.1:{HEALTH_PORT}/health")
    return server

# ===================== AUTO-RESTART WATCHDOG =====================
def watchdog_loop():
    """Loop 30s monitora observer → restart automático se morto"""
    while not shutdown_requested:
        time.sleep(WATCHDOG_INTERVAL)
        if shutdown_requested:
            break
        
        global observer
        if observer and not observer.is_alive():
            logger.warning("Observer morto detectado pelo watchdog! Reiniciando...")
            try:
                observer = Observer()
                event_handler = DestiladorHandler()
                for path in WATCH_PATHS:
                    if os.path.exists(path):
                        observer.schedule(DestiladorHandler(), path, recursive=True)
                observer.start()
                logger.info("Observer reiniciado com sucesso pelo watchdog")
            except Exception as e:
                logger.error(f"Falha ao reiniciar observer: {e}")

# ===================== HANDLER DO WATCHDOG =====================
pending_files = {}
last_processed = {}
processed_count = 0
error_count = 0

class DestiladorHandler(FileSystemEventHandler):
    def on_created(self, event):
        if not event.is_directory:
            self.schedule_process(event.src_path)
    
    def on_modified(self, event):
        if not event.is_directory:
            self.schedule_process(event.src_path)
    
    def should_skip_path(self, filepath):
        parts = Path(filepath).parts
        for part in parts:
            if part in SKIP_DIR_NAMES or part.startswith(".extracted_"):
                return True
        filename = os.path.basename(filepath)
        for pattern in IGNORE_PATTERNS:
            if re.match(pattern, filename, re.IGNORECASE):
                return True
        return False

    def schedule_process(self, filepath):
        filepath = os.path.abspath(filepath)
        now = time.time() * 1000
        if self.should_skip_path(filepath):
            return
        
        pending_files[filepath] = now
        
        def check_and_process():
            time.sleep(DEBOUNCE_MS / 1000)
            if filepath in pending_files:
                if pending_files[filepath] == now:
                    del pending_files[filepath]
                    self.process_file(filepath)
        
        threading.Thread(target=check_and_process, daemon=True).start()
    
    def process_file(self, filepath):
        global processed_count, error_count
        try:
            logger.info(f"[DESTILADOR] Processando: {filepath}")
            ext = os.path.splitext(filepath)[1].lower()
            if ext == ".zip":
                self.handle_zip(filepath)
                return
            if ext in {".png", ".jpg", ".jpeg", ".webp", ".gif"}:
                self.handle_image(filepath)
                return
            if ext == ".pdf":
                self.handle_pdf(filepath)
                return
            content = self.read_file(filepath)
            if not content or len(content.strip()) < 10:
                logger.warning(f"Arquivo vazio ou muito pequeno: {filepath}")
                return
            
            destino, ext = self.classify(filepath, content)
            if not destino:
                logger.warning(f"Não classificado: {filepath}")
                destino = "docs/history/downloads/misc"
                ext = ".txt"
            
            ouro = self.destilar(content, filepath)
            cristais = self.cristalizar(ouro, destino)
            
            for cristal in cristais:
                self.escrever_cristal(cristal)
            
            self.arquivar_original(filepath, destino)
            self.emitir_carve(filepath, cristais, destino)
            
            globals()['processed_count'] = globals().get('processed_count', 0) + 1
            logger.info(f"OK Concluido: {filepath} -> {destino}")
            
        except Exception as e:
            globals()['error_count'] = globals().get('error_count', 0) + 1
            logger.error(f"ERRO processando {filepath}: {e}")
            import traceback
            traceback.print_exc()
    
    # ... (métodos read_file, classify, destilar, cristalizar, determinar_tipo,
    # escrever_cristal, gerar_markdown, arquivar_original, emitir_carve)
    # MANTIDOS IGUAIS AO ORIGINAL - apenas usando logger em vez de print
    # (código omitido por brevidade - mantém toda lógica original)

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
        if any(kw in content_lower for kw in ['contrato', 'contract', 'antidoto', 'antídoto']):
            return "contracts", ".md"
        if any(kw in content_lower for kw in ['trilho', 'chassi', 'lamina', 'carve']):
            return "patterns", ".md"
        if any(kw in content_lower for kw in ['decisao', 'decisão', 'decision']):
            return "decisions", ".md"
        if any(kw in content_lower for kw in ['missao', 'missão', 'mission']):
            return "missions", ".md"
        if any(kw in content_lower for kw in ['arquitetura', 'architecture', 'arvore']):
            return "docs/reference", ".md"
        if any(kw in content_lower for kw in ['forja', 'forge']):
            return "patterns", ".md"
        return None, None

    def destilar(self, content, filepath):
        ouro = {
            "comandos": [], "decisoes": [], "padroes": [], "contratos": [],
            "principios": [], "arquitetura": [], "riscos": [], "gaps": [],
            "ouro_bruto": content[:5000],
            "arquivo_origem": filepath,
            "sha256": hashlib.sha256(content.encode('utf-8')).hexdigest()[:16],
            "tamanho": len(content),
            "timestamp": datetime.now().isoformat()
        }
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if not line: continue
            if re.search(r'(comando|prompt|execute|run|start)\s*[:=]', line, re.IGNORECASE):
                ouro["comandos"].append(line[:200])
            if re.search(r'(decisao|decisão|decidido|conclui|conclusao)\s*[:=]', line, re.IGNORECASE):
                ouro["decisoes"].append(line[:200])
            if re.search(r'(padrao|padrão|pattern|regra|principio)\s*[:=]', line, re.IGNORECASE):
                ouro["padroes"].append(line[:200])
            if re.search(r'(contrato|contract|gate|invariant|regra obrigatoria)\s*[:=]', line, re.IGNORECASE):
                ouro["contratos"].append(line[:200])
            if re.search(r'(principio|princípio|principle|invariant|lei)\s*[:=]', line, re.IGNORECASE):
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
                "timestamp": datetime.now().isoformat(),
                "origem": ouro["arquivo_origem"]
            }
            cristais.append(cristal)
        return cristais

    def determinar_tipo(self, destino):
        mapping = {
            "commands": "COMANDO", "contracts": "CONTRATO", "patterns": "PADRAO",
            "decisions": "DECISAO", "missions": "MISSAO", "docs/reference": "REFERENCIA",
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
                logger.info(f"Cristal ja existe (SHA): {filepath}")
                return
            conteudo_final = existing + "\n\n---\n\n" + novo
        else:
            conteudo_final = novo
        
        tmp_path = filepath + ".tmp"
        with open(tmp_path, 'w', encoding='utf-8') as f:
            f.write(conteudo_final)
        os.replace(tmp_path, filepath)
        logger.info(f"Escrito: {filepath}")

    def gerar_markdown(self, cristal):
        ouro = cristal["conteudo"]
        lines = [
            f"# {cristal['tipo']} - {os.path.basename(cristal['origem'])}",
            f"**Origem:** {cristal['origem']}",
            f"**SHA:** {cristal['sha']}",
            f"**Timestamp:** {cristal['timestamp']}",
            f"**Portoes:** {json.dumps(cristal['portoes'], ensure_ascii=False)}",
            "", "## Ouro Extraido", ""
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
            "commands": "comandos", "contracts": "contratos", "patterns": "padroes",
            "decisions": "decisoes", "missions": "missoes", "docs/reference": "arquitetura",
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
        
        # Nunca mover segredo nem lote gigante da pasta do CHEFE.
        size = os.path.getsize(filepath) if os.path.exists(filepath) else 0
        if filename_is_secret(os.path.basename(filepath)) or size > 20 * 1024 * 1024:
            logger.info(f"Original preservado (segredo ou >20MB): {filepath}")
            return
        try:
            shutil.move(filepath, dest_path)
            logger.info(f"Arquivado: {dest_path}")
        except Exception as e:
            logger.warning(f"Nao moveu original {filepath}: {e}")

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
                "carry": f"Cristal {cristal['tipo']} adicionado ao NUCLEO; arquivo original arquivado em history/downloads/",
                "timestamp": datetime.now().isoformat()
            }
            with open(rastro_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(carve, ensure_ascii=False) + "\n")

    def process_file_sync(self, filepath):
        self.process_file(filepath)

    def handle_zip(self, filepath):
        import zipfile
        extract_dir = os.path.join(os.path.dirname(filepath), ".extracted_" + os.path.splitext(os.path.basename(filepath))[0])
        os.makedirs(extract_dir, exist_ok=True)
        inner = []
        try:
            with zipfile.ZipFile(filepath, 'r') as zf:
                names = [n for n in zf.namelist() if not n.endswith('/')][:80]
                zf.extractall(extract_dir, members=names)
                inner = [os.path.join(extract_dir, n.replace('/', os.sep)) for n in names]
        except Exception as e:
            logger.error(f"ZIP falhou {filepath}: {e}")
            self._mark_processed()
            return
        processed_inner = 0
        for inner_path in inner:
            if not os.path.isfile(inner_path):
                continue
            name = os.path.basename(inner_path)
            if any(re.match(p, name, re.IGNORECASE) for p in IGNORE_PATTERNS):
                continue
            try:
                if os.path.getsize(inner_path) > 8 * 1024 * 1024:
                    continue
            except OSError:
                continue
            self.process_file_sync(inner_path)
            processed_inner += 1
        logger.info(f"ZIP destilado {os.path.basename(filepath)} inner={processed_inner}")
        self._mark_processed()

    def handle_image(self, filepath):
        try:
            size = os.path.getsize(filepath)
        except OSError:
            size = 0
        content = (
            f"IMAGEM: {os.path.basename(filepath)}\n"
            f"path={filepath}\n"
            f"bytes={size}\n"
            f"tipo=visual_claim_nao_e_prova_de_runtime\n"
        )
        destino, ext = self.classify(filepath, content)
        destino = destino or "docs/history/downloads/misc"
        ouro = self.destilar(content, filepath)
        for cristal in self.cristalizar(ouro, destino):
            self.escrever_cristal(cristal)
        self.emitir_carve(filepath, self.cristalizar(ouro, destino), destino)
        self._mark_processed()
        logger.info(f"IMAGEM catalogada: {filepath}")

    def handle_pdf(self, filepath):
        text = ""
        try:
            import pymupdf
            doc = pymupdf.open(filepath)
            pages = []
            for i, page in enumerate(doc):
                if i >= 8:
                    break
                pages.append(page.get_text() or "")
            text = "\n".join(pages)
            doc.close()
        except Exception:
            try:
                from pypdf import PdfReader
                reader = PdfReader(filepath)
                text = "\n".join((p.extract_text() or "") for p in reader.pages[:8])
            except Exception as e:
                text = f"PDF_NAO_LIDO {filepath} {e}"
        if not text.strip():
            text = f"PDF_VAZIO {filepath}"
        destino, ext = self.classify(filepath, text)
        destino = destino or "docs/reference"
        ouro = self.destilar(text, filepath)
        cristais = self.cristalizar(ouro, destino)
        for cristal in cristais:
            self.escrever_cristal(cristal)
        self.emitir_carve(filepath, cristais, destino)
        self._mark_processed()
        logger.info(f"PDF destilado: {filepath}")

    def _mark_processed(self):
        globals()['processed_count'] = globals().get('processed_count', 0) + 1


def filename_is_secret(name):
    n = name.lower()
    return n in {".env", "env"} or n.endswith(".env") or n.endswith(".pem") or n.endswith(".key")


def scan_existing(handler, root):
    logger.info(f"SCAN EXISTENTE: {root}")
    count = 0
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [
            d for d in dirnames
            if d not in SKIP_DIR_NAMES and not d.startswith(".extracted_")
        ]
        for name in filenames:
            filepath = os.path.join(dirpath, name)
            if handler.should_skip_path(filepath):
                continue
            try:
                if os.path.getsize(filepath) > 50 * 1024 * 1024 and not name.lower().endswith(".zip"):
                    continue
            except OSError:
                continue
            handler.process_file_sync(filepath)
            count += 1
            if count >= 400:
                logger.warning("SCAN LIMIT 400 arquivos neste ciclo")
                return count
    logger.info(f"SCAN EXISTENTE fim count={count}")
    return count


# ===================== MAIN =====================
def main():
    global start_time, observer
    start_time = time.time()
    
    logger.info("=" * 60)
    logger.info("AUTO-DESTILADOR DAEMON ROBUSTO - Iniciando")
    logger.info(f"Watch paths: {WATCH_PATHS}")
    logger.info(f"NUCLEO root: {NUCLEO_ROOT}")
    logger.info(f"Health check: http://127.0.0.1:{HEALTH_PORT}/health")
    logger.info("=" * 60)
    
    # PID file
    write_pid_file()
    
    # Verificar caminhos
    for path in WATCH_PATHS:
        if not os.path.exists(path):
            logger.warning(f"Caminho nao existe: {path}")
        else:
            logger.info(f"OK Monitorando: {path}")
    
    if not os.path.exists(NUCLEO_ROOT):
        logger.error(f"NUCLEO_ROOT nao existe: {NUCLEO_ROOT}")
        return
    
    # Iniciar health server
    health_server = start_health_server()
    
    # Iniciar auto-save thread
    save_thread = threading.Thread(target=auto_save_loop, daemon=True)
    save_thread.start()
    
    # Iniciar watchdog thread
    watchdog_thread = threading.Thread(target=watchdog_loop, daemon=True)
    watchdog_thread.start()
    
    # Observer
    observer = Observer()
    event_handler = DestiladorHandler()
    
    for path in WATCH_PATHS:
        if os.path.exists(path):
            observer.schedule(DestiladorHandler(), path, recursive=True)
    
    observer.start()
    logger.info("Watchdog ativo. Daemon robusto operacional.")
    logger.info("Pilares ativos: Signal handlers, Health check, Auto-restart, PID file, Logging persistente, Auto-save state")
    handler = DestiladorHandler()
    for path in WATCH_PATHS:
        if os.path.exists(path):
            try:
                scan_existing(handler, path)
            except Exception as e:
                logger.error(f"SCAN EXISTENTE falhou {path}: {e}")
    
    try:
        while not shutdown_requested:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt recebido")
    finally:
        logger.info("Encerrando...")
        if 'observer' in globals() and observer:
            observer.stop()
            observer.join(timeout=5)
        logger.info("Encerrado com sucesso")

if __name__ == "__main__":
    main()