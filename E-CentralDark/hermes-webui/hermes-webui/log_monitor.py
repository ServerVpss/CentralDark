#!/usr/bin/env python3
"""
Hermes WebUI Log Monitor & Auto-Responder
Monitora server.log em tempo real, detecta falha de login (401)
e notifica + auto-resolve reiniciando o servidor com a senha correta.
"""

import os
import re
import sys
import time
import subprocess
from pathlib import Path

LOG_FILE = Path("/c/Users/danda/hermes-webui/server.log")
ENV_FILE = Path("/c/Users/danda/hermes-webui/.env")
PASSWORD = "@Segredo1994"
PORT = "8789"
HOST = "0.0.0.0"

# Regex para detectar falha de login
LOGIN_FAILURE_PATTERN = re.compile(
    r'\{.*?"method":\s*"POST".*?"path":\s*"/api/auth/login".*?"status":\s*401.*?"remote":\s*"(?P<ip>[^"]+)".*?\}'
)

# Regex para detectar servidor subindo
SERVER_UP_PATTERN = re.compile(r" Herme[s]? Web UI listening on http://(?P<host>[^:]+):(?P<port>\d+)")

# Regex para detectar erro de porta ocupada
PORT_CONFLICT_PATTERN = re.compile(r"FATAL:\s*Another server is already responding on (?P<host>[^:]+):(?P<port>\d+)")


def log(msg):
    """Registra no próprio log do monitor."""
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    print(f"[{timestamp}] {msg}", flush=True)


def notify_user(message):
    """Notifica o usuário via Telegram (simulado — substituir pela chamada real se necessário)."""
    log(f"NOTIFICACAO: {message}")
    # Aqui iria a chamada para o Telegram via API do Hermes
    # Ex: requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", json={"chat_id": CHAT_ID, "text": message})
    print(f"\n>>> NOTIFICAÇÃO AO USUÁRIO: {message}\n", flush=True)


def restart_server():
    """Reinicia o servidor com a senha configurada."""
    log("Iniciando reinicialização do servidor...")

    # 1. Matar processo antigo se existir
    log("Verificando processo antigo...")
    try:
        result = subprocess.run(["taskkill", "/IM", "python.exe", "/FI", "WINDOWTITLE eq server.py", "/F"],
                                capture_output=True, text=True, timeout=10)
        log(f"taskkill: {result.returncode}")
    except Exception as e:
        log(f"Erro ao matar processo: {e}")

    time.sleep(2)

    # 2. Verificar se a porta liberou
    log("Verificando se a porta liberou...")
    try:
        result = subprocess.run(["netstat", "-ano"], capture_output=True, text=True, timeout=10)
        if f":{PORT}" in result.stdout and "LISTENING" in result.stdout:
            log(f"Porta {PORT} ainda ocupada — tentando matar por PID...")
            # Tenta matar pelo PID da porta
            for line in result.stdout.splitlines():
                if f":{PORT}" in line and "LISTENING" in line:
                    pid = line.split()[-1]
                    log(f"PID detectado: {pid}")
                    subprocess.run(["taskkill", "/PID", pid, "/F"], capture_output=True, timeout=10)
                    time.sleep(2)
                    break
    except Exception as e:
        log(f"Erro ao verificar porta: {e}")

    # 3. Subir novo servidor
    log(f"Subindo servidor na porta {PORT} com senha configurada...")
    try:
        env = os.environ.copy()
        env["HERMES_WEBUI_PASSWORD"] = PASSWORD
        env["HERMES_WEBUI_PORT"] = PORT
        env["HERMES_WEBUI_HOST"] = HOST

        proc = subprocess.Popen(
            ["python3", "server.py"],
            cwd="/c/Users/danda/hermes-webui",
            env=env,
            stdout=open("/c/Users/danda/hermes-webui/server.log", "a"),
            stderr=subprocess.STDOUT,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
        )
        log(f"Processo subido com PID {proc.pid}")
        return True
    except Exception as e:
        log(f"Erro ao subir servidor: {e}")
        return False


def monitor():
    """Loop principal de monitoramento."""
    log("=== HERMES WEBBUI LOG MONITOR INICIADO ===")
    log(f"Log file: {LOG_FILE}")
    log(f"Password: {'*' * len(PASSWORD)}")
    log(f"Port: {PORT}, Host: {HOST}")

    if not LOG_FILE.exists():
        log(f"WARNING: Log file {LOG_FILE} não existe. Criando...")
        LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
        LOG_FILE.touch()

    # Posição atual do arquivo
    try:
        with open(LOG_FILE, "r") as f:
            f.seek(0, 2)  # vai até o final
            position = f.tell()
    except Exception as e:
        log(f"Erro ao abrir log: {e}")
        position = 0

    log(f"Posição inicial: {position} bytes")

    consecutive_failures = 0
    max_consecutive_before_restart = 3
    restart_cooldown = 30  # segundos
    last_restart = 0

    while True:
        try:
            with open(LOG_FILE, "r") as f:
                f.seek(position)
                new_lines = f.readlines()
                position = f.tell()

                for line in new_lines:
                    line = line.strip()
                    if not line:
                        continue

                    # Detectar falha de login
                    match = LOGIN_FAILURE_PATTERN.search(line)
                    if match:
                        ip = match.group("ip")
                        consecutive_failures += 1
                        log(f"FAIL DETECTADA: Login falhou de {ip} (contagem: {consecutive_failures}/{max_consecutive_before_restart})")
                        notify_user(f"⚠️ FALHA DE LOGIN detectada — IP: {ip} — Senha incorreta. Monitorando mais tentativas...")

                        if consecutive_failures >= max_consecutive_before_restart:
                            notify_user(f"🚨 LIMIAR atingido ({consecutive_failures} falhas). Reiniciando servidor com senha correta...")
                            log("Reiniciando servidor automaticamente...")
                            if restart_server():
                                notify_user("✅ Servidor reiniciado com senha correta. Tente 로그ar novamente.")
                                consecutive_failures = 0
                                last_restart = time.time()
                            else:
                                notify_user("❌ Falha ao reiniciar servidor automaticamente.")

                    # Detectar servidor subindo
                    up_match = SERVER_UP_PATTERN.search(line)
                    if up_match:
                        host = up_match.group("host")
                        port = up_match.group("port")
                        log(f"SERVIDOR UP: {host}:{port}")
                        notify_user(f"✅ Servidor Hermes WebUI UP — {host}:{port}")
                        consecutive_failures = 0

                    # Detectar conflito de porta
                    conflict_match = PORT_CONFLICT_PATTERN.search(line)
                    if conflict_match:
                        host = conflict_match.group("host")
                        port = conflict_match.group("port")
                        log(f"CONFLITO DE PORTA: {host}:{port} ocupada")
                        notify_user(f"🔴 CONFLITO DE PORTA: {host}:{port} já ocupada. Servidor não subiu.")
                        # Tenta matar o processo na porta e subir de novo
                        log("Tentando resolver conflito de porta...")
                        try:
                            result = subprocess.run(["netstat", "-ano"], capture_output=True, text=True, timeout=10)
                            for line2 in result.stdout.splitlines():
                                if f":{port}" in line2 and "LISTENING" in line2:
                                    pid = line2.split()[-1]
                                    log(f"Matando PID {pid} na porta {port}...")
                                    subprocess.run(["taskkill", "/PID", pid, "/F"], capture_output=True, timeout=10)
                                    time.sleep(2)
                                    break
                            if restart_server():
                                notify_user("✅ Conflito resolvido e servidor reiniciado.")
                        except Exception as e:
                            log(f"Erro ao resolver conflito: {e}")

        except Exception as e:
            log(f"Erro no loop de monitoramento: {e}")
            time.sleep(5)

        time.sleep(2)


if __name__ == "__main__":
    monitor()
