#!/usr/bin/env python3
# Monitor de latencia ChatGPT - versao corrigida 25/06/2026
# Mudancas:
#   1) Troca de "neke" (reiniciava todos os processos) por restart cirurgico
#      do processo "elite-http-gateway" - nao derruba bots/mcp/crm.
#   2) Cooldown de 5 minutos entre restarts (evita loop em degradacao prolongada).
import asyncio
import httpx
import os
import subprocess
import time
from dotenv import load_dotenv

load_dotenv('/root/CentralDark/apps/modulos/elite-gateway/config/.env')
MAX_LATENCY = int(os.getenv("MAX_LATENCY_SECONDS", "15"))
CHECK_INTERVAL = int(os.getenv("HEALTH_CHECK_INTERVAL", "45"))
COOLDOWN_SECONDS = int(os.getenv("RESTART_COOLDOWN_SECONDS", "300"))  # 5 min
TARGET_PROCESS = os.getenv("ZENTINEL_TARGET_PROCESS", "elite-http-gateway")

_last_restart = 0.0

async def check_chatgpt_latency():
    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get("https://chatgpt.com", follow_redirects=True)
            latency = time.time() - start
            return latency, r.status_code
    except Exception as e:
        return 999, str(e)

def restart_target():
    global _last_restart
    now = time.time()
    if now - _last_restart < COOLDOWN_SECONDS:
        restantes = int(COOLDOWN_SECONDS - (now - _last_restart))
        print(f"[ZENTINEL] Cooldown ativo, faltam {restantes}s. Restart suprimido.")
        return
    print(f"[ZENTINEL] Reiniciando processo {TARGET_PROCESS} (cirurgico)...")
    subprocess.run(["pm2", "restart", TARGET_PROCESS], capture_output=True)
    _last_restart = now

async def main():
    print(f"[ZENTINEL] Monitoramento ativo. Checagem a cada {CHECK_INTERVAL}s. Cooldown {COOLDOWN_SECONDS}s. Alvo: {TARGET_PROCESS}.")
    while True:
        latency, status = await check_chatgpt_latency()
        print(f"[ZENTINEL] Latencia: {latency:.2f}s | Status: {status}")
        if latency > MAX_LATENCY:
            print("[ZENTINEL] Latencia critica detectada!")
            restart_target()
        await asyncio.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    asyncio.run(main())
