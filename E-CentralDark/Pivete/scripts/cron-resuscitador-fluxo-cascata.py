#!/usr/bin/env python3
"""
CRON DE RESSSUSCITACAO - FLUXO EM CASCATA
Monitora todos os crons/fluxos filhos e ressuscita se travar.

Funciona como fallback: se o agente principal trava (output limit, erro, etc),
o cron reassume o trabalho. Cascata: cada fluxo que falha alimenta o proximo.

Usage: hermes cron create com este script
Ou: rodar manualmente para teste
"""

import json
import os
import subprocess
import sys
import time
from datetime import datetime

# Configuracao
HERMES_HOME = os.environ.get("HERMES_HOME", "E:/CentralDark/Pivete")
LOG_FILE = f"{HERMES_HOME}/scripts/cron-resuscitador.log"
CRON_NAMES_TO_MONITOR = [
    "dependabot-monitor",
    "screenpipe-monitor", 
    "Monitor Hermex/Casa em tempo real",
    "System Breathing - Memory Flush & Zombie Reaper",
    "Cadeia Free Tier Watchdog",
    "Hermes WebUI Watchdog",
]

def log(msg):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def get_crons():
    """Lista todos os crons ativos"""
    try:
        result = subprocess.run(
            ["hermes", "cron", "list"],
            capture_output=True,
            text=True,
            cwd=HERMES_HOME,
            timeout=30
        )
        if result.returncode == 0:
            return result.stdout
        else:
            log(f"ERRO ao listar crons: {result.stderr}")
            return None
    except Exception as e:
        log(f"EXCEÇÃO ao listar crons: {e}")
        return None

def analyze_crons(cron_output):
    """Analisa output do cron list e identifica falhas"""
    if not cron_output:
        return []
    
    problems = []
    lines = cron_output.split("\n")
    
    for i, line in enumerate(lines):
        if "error:" in line.lower() or "failed" in line.lower():
            # Tenta extrair nome e erro
            name_match = None
            for j in range(max(0, i-5), i):
                if "Name:" in lines[j]:
                    name_match = lines[j].split("Name:")[1].strip()
                    break
            
            problem = {
                "line": line.strip(),
                "context": "\n".join(lines[max(0,i-3):i+1]),
                "name": name_match
            }
            problems.append(problem)
            log(f"PROBLEMA DETECTADO: {name_match or 'DESCONHECIDO'} -> {line.strip()}")
    
    return problems

def resuscitate_failed_cron(cron_name):
    """Tenta reanimar um cron que falhou"""
    log(f"Tentando ressuscitar: {cron_name}")
    
    # Se for script, tenta rodar manualmente primeiro
    if cron_name == "System Breathing - Memory Flush & Zombie Reaper":
        script_path = f"{HERMES_HOME}/scripts/system-breathing.py"
        if os.path.exists(script_path):
            log(f"Script encontrado: {script_path}")
            try:
                result = subprocess.run(
                    ["python", script_path],
                    capture_output=True,
                    text=True,
                    cwd=HERMES_HOME,
                    timeout=60
                )
                if result.returncode == 0:
                    log("SUCESSO: System Breathing reanimado")
                    return True
                else:
                    log(f"FALHA: {result.stderr[:200]}")
                    return False
            except Exception as e:
                log(f"EXCEÇÃO: {e}")
                return False
        else:
            log(f"Script NAO ENCONTRADO: {script_path}")
            return False
    
    # Para outros, logamos que precisa de intervencao manual ou ajuste de credencial
    if "402" in cron_name or "credits" in cron_name.lower():
        log("PROBLEMA CONHECIDO: Crédito OpenRouter insuficiente (HTTP 402)")
        log("SOLUÇÃO: Adicionar créditos em https://openrouter.ai/settings/credits")
        return False
    
    log(f"Cron {cron_name} precisa de investigacao manual")
    return False

def main():
    log("=" * 60)
    log("CRON DE RESSSUSCITACAO INICIADO")
    log("Monitorando fluxos filhos...")
    log("=" * 60)
    
    # 1. Listar crons
    cron_output = get_crons()
    if not cron_output:
        log("FALHA CRITICA: Nao foi possivel listar crons")
        return 1
    
    log("CRONS LISTADOS COM SUCESSO")
    
    # 2. Analisar problemas
    problems = analyze_crons(cron_output)
    
    if not problems:
        log("NENHUM PROBLEMA DETECTADO - Todos os fluxos operacionais")
        return 0
    
    # 3. Tentar ressuscitar
    log(f"\nTotal de problemas: {len(problems)}")
    log("Iniciando tentativa de ressuscitacao...")
    
    success_count = 0
    fail_count = 0
    
    for problem in problems:
        name = problem.get("name") or "DESCONHECIDO"
        if resuscitate_failed_cron(name):
            success_count += 1
        else:
            fail_count += 1
    
    # 4. Resumo
    log("\n" + "=" * 60)
    log("RESUMO DA RESSSUSCITACAO")
    log(f"  Total problemas: {len(problems)}")
    log(f"  Ressucitados: {success_count}")
    log(f"  Nao ressucitados: {fail_count}")
    log("=" * 60)
    
    # 5. Se ainda tem falhas, reportar
    if fail_count > 0:
        log("\nFLUXO EM CASCATA: Falhas persistem, proximo agente reassume...")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
