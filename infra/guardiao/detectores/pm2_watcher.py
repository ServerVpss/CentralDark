"""
Vigia PM2 — roda `pm2 jlist` a cada 30s e detecta anomalias.

Publica eventos na fila pra o Analista despachar.
"""
import json
import logging
import shutil
import subprocess
import time

from detectores.anomaly_engine import JanelaDeslizante
from fila.event_queue import publicar

log = logging.getLogger("guardiao.pm2")

INTERVALO_S = 30
JANELA_RESTART_S = 300  # 5min
RESTART_THRESHOLD = 3


def _pm2_jlist() -> list[dict]:
    if not shutil.which("pm2"):
        return []
    try:
        out = subprocess.check_output(
            ["pm2", "jlist"], stderr=subprocess.DEVNULL, timeout=10
        )
        return json.loads(out.decode("utf-8") or "[]")
    except (subprocess.SubprocessError, json.JSONDecodeError, OSError) as e:
        log.warning("pm2 jlist falhou: %s", e)
        return []


def loop_pm2(whitelist: list[str]) -> None:
    log.info("Vigia PM2 iniciado (whitelist=%s)", whitelist)
    janela_restart = JanelaDeslizante(janela_s=JANELA_RESTART_S)
    estado_anterior: dict[str, dict] = {}

    while True:
        try:
            apps = _pm2_jlist()
            for app in apps:
                nome = app.get("name", "?")
                if nome in whitelist:
                    continue
                pm2_env = app.get("pm2_env", {})
                status = pm2_env.get("status", "unknown")
                restart_time = pm2_env.get("restart_time", 0)
                unstable = pm2_env.get("unstable_restarts", 0)
                mem = app.get("monit", {}).get("memory", 0)

                anterior = estado_anterior.get(nome, {})
                restart_anterior = anterior.get("restart_time", restart_time)

                # restart loop
                if restart_time > restart_anterior:
                    total = janela_restart.registrar(f"pm2.{nome}")
                    if total >= RESTART_THRESHOLD:
                        publicar(
                            source="pm2",
                            severity="erro",
                            key=f"pm2.restart_loop.{nome}",
                            title=f"PM2 em restart loop: {nome}",
                            body=f"{total} restarts nos últimos {JANELA_RESTART_S // 60}min. Status atual: {status}.",
                            dedup_window_s=300,
                            payload={"app": nome, "restarts_janela": total, "status": status},
                        )

                # status errored / stopped
                if status == "errored" and anterior.get("status") != "errored":
                    publicar(
                        source="pm2",
                        severity="critico",
                        key=f"pm2.errored.{nome}",
                        title=f"PM2 errored: {nome}",
                        body=f"Processo entrou em estado `errored`. Memória: {mem // (1024*1024)}MB. Restarts instáveis: {unstable}.",
                        dedup_window_s=60,
                        payload={"app": nome, "status": status, "unstable": unstable},
                    )
                elif status == "stopped" and anterior.get("status") not in ("stopped", None):
                    publicar(
                        source="pm2",
                        severity="aviso",
                        key=f"pm2.stopped.{nome}",
                        title=f"PM2 parou: {nome}",
                        body=f"Processo passou para `stopped` (não está na whitelist).",
                        dedup_window_s=600,
                        payload={"app": nome},
                    )

                estado_anterior[nome] = {
                    "restart_time": restart_time,
                    "status": status,
                    "memory": mem,
                }
        except Exception:
            log.exception("Erro no loop PM2")
        time.sleep(INTERVALO_S)
