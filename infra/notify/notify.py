"""
notify — módulo Python universal de notificação CentralDark.

Usa só stdlib (urllib + json) — zero pip install.
Lê config de /etc/centraldark/notify.env.

Uso:
    from notify import notify
    notify("elite-mapper", "sucesso", "Varredura ok", "21.3GB em 8.3s",
           metadata={"duracao_s": 8.3})
"""
from __future__ import annotations

import json
import os
import time
from typing import Any
from urllib import request as urlrequest
from urllib.error import URLError, HTTPError

CONF_PATH = "/etc/centraldark/notify.env"
QUEUE_DIR = "/var/log/centraldark"
QUEUE_FILE = os.path.join(QUEUE_DIR, "notify-pending.log")
MAX_TENTATIVAS = 3
TIPOS_OK = {"info", "sucesso", "aviso", "erro", "critico"}


def _ler_conf() -> dict[str, str]:
    if not os.path.isfile(CONF_PATH):
        raise RuntimeError(f"config ausente: {CONF_PATH}")
    cfg: dict[str, str] = {}
    with open(CONF_PATH, "r", encoding="utf-8") as f:
        for linha in f:
            linha = linha.strip()
            if not linha or linha.startswith("#"):
                continue
            if "=" not in linha:
                continue
            k, v = linha.split("=", 1)
            cfg[k.strip()] = v.strip().strip('"').strip("'")
    for chave in ("NOTIFY_URL", "NOTIFY_API_KEY"):
        if not cfg.get(chave):
            raise RuntimeError(f"{chave} faltando em {CONF_PATH}")
    return cfg


def _enfileirar(payload: dict[str, Any]) -> None:
    os.makedirs(QUEUE_DIR, exist_ok=True)
    ts = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    with open(QUEUE_FILE, "a", encoding="utf-8") as f:
        f.write(f"[{ts}] FALHOU: {json.dumps(payload, ensure_ascii=False)}\n")


def notify(
    origem: str,
    tipo: str,
    titulo: str,
    mensagem: str,
    metadata: dict[str, Any] | None = None,
    chat_id: int | None = None,
    timeout: float = 10.0,
) -> dict[str, Any]:
    """Envia uma notificação. Retorna o JSON da resposta (ou levanta exceção)."""
    if tipo not in TIPOS_OK:
        raise ValueError(f"tipo inválido: {tipo} (use {sorted(TIPOS_OK)})")
    if not origem or not titulo or not mensagem:
        raise ValueError("origem, titulo e mensagem são obrigatórios")

    cfg = _ler_conf()
    payload: dict[str, Any] = {
        "origem": origem[:64],
        "tipo": tipo,
        "titulo": titulo[:200],
        "mensagem": mensagem[:3500],
        "metadata": metadata or {},
    }
    if chat_id is not None:
        payload["chat_id"] = int(chat_id)

    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urlrequest.Request(
        cfg["NOTIFY_URL"],
        data=body,
        method="POST",
        headers={
            "X-Notify-Key": cfg["NOTIFY_API_KEY"],
            "Content-Type": "application/json",
        },
    )

    ultimo_erro: Exception | None = None
    for i in range(1, MAX_TENTATIVAS + 1):
        try:
            with urlrequest.urlopen(req, timeout=timeout) as resp:
                data = resp.read().decode("utf-8")
                return json.loads(data)
        except (HTTPError, URLError, TimeoutError) as e:
            ultimo_erro = e
            time.sleep(i * 2)

    _enfileirar(payload)
    raise RuntimeError(f"notify falhou após {MAX_TENTATIVAS} tentativas: {ultimo_erro}")
