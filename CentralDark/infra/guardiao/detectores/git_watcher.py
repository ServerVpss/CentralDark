"""
Vigia Git — detecta novos commits no repo CentralDark e publica evento.

Poll leve (a cada 15s) comparando HEAD atual com o último visto. Cada commit
novo vira um evento na fila pra o Analista decidir se notifica o Pivete.
"""
import logging
import subprocess
import time

from fila.event_queue import publicar

log = logging.getLogger("guardiao.git")

INTERVALO_S = 15
REPO_PATH = "/root/CentralDark"


def _git(args: list[str]) -> str:
    try:
        out = subprocess.check_output(
            ["git", "-C", REPO_PATH] + args, stderr=subprocess.DEVNULL, timeout=10
        )
        return out.decode("utf-8").strip()
    except (subprocess.SubprocessError, OSError):
        return ""


def _head() -> str:
    return _git(["rev-parse", "HEAD"])


def loop_git() -> None:
    log.info("Vigia Git iniciado (intervalo=%ss)", INTERVALO_S)
    ultimo = _head()
    while True:
        try:
            atual = _head()
            if atual and atual != ultimo:
                if not ultimo:
                    ultimo = atual
                else:
                    rango = f"{ultimo}..{atual}"
                    saida = _git(["log", rango, "--format=%H|%an|%s", "--reverse"])
                    commits = [l for l in saida.split("\n") if l]
                    for linha in commits:
                        partes = linha.split("|", 2)
                        if len(partes) != 3:
                            continue
                        h, autor, msg = partes
                        stat = _git(["show", "--stat", "--format=", h])
                        n_arquivos = len([l for l in stat.split("\n") if "|" in l])
                        publicar(
                            source="git",
                            severity="aviso",
                            key=f"git.commit.{h[:10]}",
                            title=f"Commit novo: {msg[:60]}",
                            body=f"{autor} commitou `{h[:10]}` — {n_arquivos} arquivo(s) alterado(s).\n\n{msg}",
                            dedup_window_s=60,
                            payload={"hash": h, "autor": autor, "mensagem": msg, "arquivos": n_arquivos},
                        )
                    ultimo = atual
        except Exception:
            log.exception("Erro no loop Git")
        time.sleep(INTERVALO_S)
