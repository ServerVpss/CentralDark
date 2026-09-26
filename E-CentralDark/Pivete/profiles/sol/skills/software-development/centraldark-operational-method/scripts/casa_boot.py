#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
casa_boot.py — TEMPLATE de harness de boot LOCAL para reconciliar um
perfil HERMES com a SOUL canônica da CentralDark, SEM copiar.

ORIGEM: extraído da missão de reconciliação do perfil pivete
(2026-08-24). Reutilizável para qualquer profile (sol, pivete, etc).

PROPOSITO:
  Amarrar o boot do perfil a um reload/reconcile do canônico LOCAL, sem
  colar o corpo da SOUL-SOL dentro do perfil.

NAO COPIA: o script apenas:
  - localiza o SOUL-SOL canônico local (clone CentralDark);
  - mede mtime/sha256;
  - verifica PRESENCA DE CONCEITO de governanca no perfil (no linha literal);
  - imprime status: OK | DRIFT | UNKNOWN;
  - nunca edita o canônico; nunca copia o canônico para dentro do perfil.

POR QUE CONCEITO E NAO LINHA LITERAL:
  O perfil reescreve os invariantes com linguagem propria
  (ex: SINGLE_WRITER_PER_SCOPE=ENFORCED em vez de ONE_WRITER_PER_SCOPE=true).
  Comparar linha-a-linha marca DRIFT FALSO. Checar CONCEITO ausente e sim.

USO (python pode nao estar no PATH; usar uv):
  uv run python casa_boot.py

FORA DE ESCOPO (noremoto): nao toca origin/remoto. Trabalha com o estado
local do clone CentralDark montado em CASA_ROOT.
"""

import datetime
import hashlib
import json
import os
import re

# ---- Caminhos (locais, noremoto) — ajustar por profile/maquina ----------
HOME = os.path.expanduser("~")
PROFILE_DIR = os.path.join(HOME, "AppData", "Local", "hermes", "profiles", "pivete")
PROFILE_SOUL = os.path.join(PROFILE_DIR, "SOUL.md")

CASA_ROOT = r"E:\CentralDark\Pivete"
CLONE_CANONICO = os.path.join(CASA_ROOT, "CentralDark")
CANONICAL_SOUL = os.path.join(
    CLONE_CANONICO, "docs", "CONSCIENCIA", "01-IDENTIDADE-E-REGRAS", "SOUL-SOL.md"
)

# Conceitos de governanca que o perfil PRECISA refletir. Nao exigimos a linha
# literal do canonico (isso seria copiar); exigimos que o CONCEITO esteja
# presente em linguagem propria do perfil.
GOV_CONCEPTS = {
    "AUTORIDADE_HUMANA": [
        "segredo/chefe", "autoridade final", "autoridade_human", "authority_final",
    ],
    "SOL_COORDENA": [
        "coordena", "orquestr", "coordenador",
    ],
    "PIVETE_EXECUTA": [
        "pivete/hermes", "executor", "corpo_operacional", "mordomo",
    ],
    "WRITER_UNICO": [
        "single_writer", "one_writer", "writer_unico", "um_writer", "1_writer",
    ],
    "UNKNOWN_NAO_PASS": [
        "unknown", "nao_pass", "ne_pass", "is_not_pass", "not_pass",
    ],
    "MENOS_E_MAIS": [
        "menos_e_mais", "menos é mais", "menos e mais",
    ],
    "SUBORDINACAO_CANONICA": [
        "canonical_soul", "canonico", "subordinado", "centraldark",
    ],
}


def norm(s):
    return re.sub(r"\s+", "", s).lower()


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def mtime_iso(path):
    ts = os.path.getmtime(path)
    return datetime.datetime.fromtimestamp(ts).isoformat(timespec="seconds")


def read_lines(path):
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        return f.read().splitlines()


def concept_present(needles, haystack_norm):
    return any(n in haystack_norm for n in needles)


def main():
    out = {
        "profile_dir": PROFILE_DIR,
        "canonical_soul": CANONICAL_SOUL,
        "profile_soul": PROFILE_SOUL,
        "canonical_present": os.path.isfile(CANONICAL_SOUL),
        "profile_present": os.path.isfile(PROFILE_SOUL),
        "status": "UNKNOWN",
        "governance_missing": [],
        "boot_evidence": [],
    }

    if not out["canonical_present"]:
        out["boot_evidence"].append("CANONICAL_SOUL_AUSENTE_NO_DISCO_LOCAL")
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return

    if not out["profile_present"]:
        out["boot_evidence"].append("PROFILE_SOUL_AUSENTE")
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return

    out["canonical_sha256"] = sha256_of(CANONICAL_SOUL)
    out["canonical_mtime"] = mtime_iso(CANONICAL_SOUL)
    out["profile_mtime"] = mtime_iso(PROFILE_SOUL)
    out["boot_evidence"].append("CANONICAL_SOUL_LIDO")
    out["boot_evidence"].append("PROFILE_SOUL_LIDO")

    prof_norm = norm("\n".join(read_lines(PROFILE_SOUL)))

    missing = []
    for concept, needles in GOV_CONCEPTS.items():
        if not concept_present(needles, prof_norm):
            missing.append(concept)
    out["governance_missing"] = missing

    if not missing:
        out["status"] = "OK"
        out["boot_evidence"].append("PERFIL_REFLETE_GOVERNANCA_CANONICA")
    else:
        out["status"] = "DRIFT"
        out["boot_evidence"].append("PERFIL_OMITE_CONCEITO_CANONICO: " + ",".join(missing))

    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
