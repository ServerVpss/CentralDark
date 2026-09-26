#!/usr/bin/env python3
"""
CentralDark Omni Router — diagnosticaa rápida do estado do Hermes.
Mostra: variáveis lidas, health simulado, e causa raiz do configured: false.
"""
import os
import sys

os.environ.setdefault("HERMES_BASE_URL", "http://127.0.0.1:8645")
os.environ.setdefault("CENTRALDARK_DEFAULT_ENGINE", "hermes")
os.environ.setdefault("CENTRALDARK_ROUTER_TOKEN", "")

sys.path.insert(0, r"e:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts")

# Importar com as vars já injetadas
from centraldark_omni_router import DEFAULT_ENGINE, HERMES_BASE_URL, ROUTER_TOKEN

print("=== Diagnóstico Omni Router ===")
print(f"DEFAULT_ENGINE                  = {DEFAULT_ENGINE!r}")
print(f"HERMES_BASE_URL (module)        = {HERMES_BASE_URL!r}")
print(f"HERMES_AUTH_TOKEN               = {os.getenv('HERMES_AUTH_TOKEN', 'NOT SET')!r}")
print(f"CENTRALDARK_DEFAULT_ENGINE      = {os.getenv('CENTRALDARK_DEFAULT_ENGINE', 'NOT SET')!r}")
print(f"CENTRALDARK_ROUTER_TOKEN        = {ROUTER_TOKEN!r}")
print()

# Simular o health endpoint
hermes_url = os.getenv("HERMES_BASE_URL", "").rstrip("/")
print(f"health() lê HERMES_BASE_URL    = {hermes_url!r}")
print(f"health() -> hermes.configured  = {bool(hermes_url)}")

# Verificar conectividade
import requests
try:
    r = requests.get("http://127.0.0.1:8645/health", timeout=5)
    print(f"\nHermes Proxy (:8645) reachable  = True (status {r.status_code})")
except Exception as e:
    print(f"\nHermes Proxy (:8645) reachable  = False ({e})")

print()
print("=== CAUSA RAIZ ===")
print("O processo em execução (PID 33736) foi iniciado sem injeção de HERMES_BASE_URL.")
print("O health endpoint mostra configured: false porque os.getenv('HERMES_BASE_URL')")
print("retorna '' no contexto do processo atual (sem o launcher injetando as vars).")
print()
print("CORREÇÃO: reiniciar com o launcher que injeta as envs:")
print("  E:\\CentralDark\\Pivete\\CentralDark\\scripts\\launch_omni_router.py")
