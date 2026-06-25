"""
Vigia Docker — usa CLI `docker` (sem SDK pra evitar dependência extra).

Faz `docker ps` + `docker stats --no-stream` a cada 30s e checa eventos.
Detecta: container morto/OOM, CPU/MEM sustentados acima do limite.
"""
import json
import logging
import shutil
import subprocess
import time

from detectores.anomaly_engine import JanelaDeslizante
from fila.event_queue import publicar

log = logging.getLogger("guardiao.docker")

INTERVALO_S = 30
JANELA_SAMPLES_S = 180  # 3 amostras = ~90s
CPU_LIMITE_PCT = 90.0
MEM_LIMITE_PCT = 85.0
SAMPLES_NECESSARIAS = 3


def _docker_disponivel() -> bool:
    return shutil.which("docker") is not None


def _docker_ps() -> list[dict]:
    try:
        out = subprocess.check_output(
            ["docker", "ps", "-a", "--format", "{{json .}}"],
            stderr=subprocess.DEVNULL,
            timeout=10,
        )
        return [json.loads(l) for l in out.decode().splitlines() if l.strip()]
    except (subprocess.SubprocessError, json.JSONDecodeError, OSError) as e:
        log.warning("docker ps falhou: %s", e)
        return []


def _docker_stats() -> list[dict]:
    try:
        out = subprocess.check_output(
            ["docker", "stats", "--no-stream", "--format", "{{json .}}"],
            stderr=subprocess.DEVNULL,
            timeout=15,
        )
        return [json.loads(l) for l in out.decode().splitlines() if l.strip()]
    except (subprocess.SubprocessError, json.JSONDecodeError, OSError) as e:
        log.warning("docker stats falhou: %s", e)
        return []


def _parse_pct(s: str) -> float:
    try:
        return float(s.rstrip("%").strip())
    except (ValueError, AttributeError):
        return 0.0


def loop_docker(whitelist: list[str]) -> None:
    if not _docker_disponivel():
        log.info("Docker não está instalado — vigia desativado")
        return
    log.info("Vigia Docker iniciado (whitelist=%s)", whitelist)
    cpu_janela = JanelaDeslizante(janela_s=JANELA_SAMPLES_S)
    mem_janela = JanelaDeslizante(janela_s=JANELA_SAMPLES_S)
    estado_anterior: dict[str, str] = {}

    while True:
        try:
            containers = _docker_ps()
            for c in containers:
                nome = c.get("Names", "?")
                if nome in whitelist:
                    continue
                status = c.get("State", "")
                anterior = estado_anterior.get(nome)

                if status == "exited" and anterior not in ("exited", None):
                    # checa se foi OOM
                    oom = "oom" in (c.get("Status", "") or "").lower()
                    publicar(
                        source="docker",
                        severity="critico",
                        key=f"docker.died.{nome}",
                        title=f"Container morreu: {nome}" + (" (OOM)" if oom else ""),
                        body=f"Status: {c.get('Status', '?')}. Imagem: {c.get('Image', '?')}.",
                        dedup_window_s=60,
                        payload={"container": nome, "oom": oom, "image": c.get("Image")},
                    )
                estado_anterior[nome] = status

            stats = _docker_stats()
            for s in stats:
                nome = s.get("Name", "?")
                if nome in whitelist:
                    continue
                cpu = _parse_pct(s.get("CPUPerc", "0%"))
                mem = _parse_pct(s.get("MemPerc", "0%"))

                if cpu > CPU_LIMITE_PCT:
                    n = cpu_janela.registrar(f"docker.cpu.{nome}", cpu)
                    if n >= SAMPLES_NECESSARIAS:
                        publicar(
                            source="docker",
                            severity="aviso",
                            key=f"docker.cpu_alto.{nome}",
                            title=f"CPU alto: {nome}",
                            body=f"{cpu:.1f}% sustentado por {n} amostras (>{CPU_LIMITE_PCT}%).",
                            dedup_window_s=600,
                            payload={"container": nome, "cpu_pct": cpu, "samples": n},
                        )

                if mem > MEM_LIMITE_PCT:
                    n = mem_janela.registrar(f"docker.mem.{nome}", mem)
                    if n >= SAMPLES_NECESSARIAS:
                        publicar(
                            source="docker",
                            severity="aviso",
                            key=f"docker.mem_alto.{nome}",
                            title=f"Memória alta: {nome}",
                            body=f"{mem:.1f}% sustentado por {n} amostras (>{MEM_LIMITE_PCT}%).",
                            dedup_window_s=600,
                            payload={"container": nome, "mem_pct": mem, "samples": n},
                        )
        except Exception:
            log.exception("Erro no loop Docker")
        time.sleep(INTERVALO_S)
