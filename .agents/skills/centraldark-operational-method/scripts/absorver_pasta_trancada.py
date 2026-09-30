#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
absorver_pasta_trancada.py — Fase 1 (READ-ONLY): inventariar ZIPs da PASTA TRANCADA.

PROPOSITO (autorizado por SEGREDO/CHEFE: "se tem certeza, so fazer"):
  Inventariar a PASTA TRANCADA (mineracao) SEM extrair, SEM tocar no repo
  CentralDark, SEM copiar nada. Apenas:
    - listar os arquivos (ZIPs e outros) da pasta;
    - medir sha256 de cada;
    - medir tamanho/mtime;
    - checar, para cada item, se ja existe equivalente NO REPO CENTRALDARK
      local (por nome normalizado) -> marca DONO_CANONICO_UNKNOWN se nao achar;
    - gerar INVENTARIO.json (na propria pasta ou em saida configuravel).

NAO EXTRAI. NAO MOVE. NAO ESCREVE NO REPO. Fase 2 (extracao/absorcao) exige
  novo comando explicito + Writer unico + prova de gap.

FORA DE ESCOPO (noremoto): nao consulta origin/remoto. Trabalha com o clone
local CentralDark montado em E:/CentralDark/Pivete/CentralDark.

USO:
  uv run python absorver_pasta_trancada.py
"""

import datetime
import hashlib
import json
import os
import re

HOME = os.path.expanduser("~")
# Pasta Trancada conforme screenshot: Area de Trabalho do usuario
PASTA_TRANCADA = os.path.join(
    HOME, "OneDrive", "Área de Trabalho", "🔒PASTA TRANCADA APELO CHEFE🔒"
)
# fallback caso o path exato com cadeado nao bata
if not os.path.isdir(PASTA_TRANCADA):
    PASTA_TRANCADA = os.path.join(
        HOME, "Desktop", "🔒PASTA TRANCADA APELO CHEFE🔒"
    )

CASA_ROOT = r"E:\CentralDark\Pivete"
CLONE_CANONICO = os.path.join(CASA_ROOT, "CentralDark")

# Conceitos que ja existem no repo (para marcar NO_CHANGE / REUSE_BEFORE_CREATE)
# Varredura leve: nomes normalizados de arquivos no clone local.
REPO_FILE_INDEX = set()


def norm_name(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def sha256_of(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def index_repo_files(root):
    """Indexa nomes de arquivos do clone local via git ls-files (rapido, sem walk)."""
    import subprocess
    out = set()
    try:
        res = subprocess.run(
            ["git", "-C", root, "ls-files"],
            capture_output=True, text=True, timeout=30,
        )
        if res.returncode == 0:
            for line in res.stdout.splitlines():
                out.add(norm_name(os.path.basename(line)))
    except Exception:
        pass
    return out


def main():
    out = {
        "pasta_trancada": PASTA_TRANCADA,
        "pasta_existe": os.path.isdir(PASTA_TRANCADA),
        "modo": "READ_ONLY_INVENTARIO",
        "repo_clone": CLONE_CANONICO,
        "repo_existe": os.path.isdir(CLONE_CANONICO),
        "itens": [],
        "estatisticas": {},
        "boot_evidence": [],
    }

    if not out["pasta_existe"]:
        out["boot_evidence"].append("PASTA_TRANCADA_AUSENTE_NO_DISCO_LOCAL")
        print(json.dumps(out, ensure_ascii=False, indent=2))
        return

    out["boot_evidence"].append("PASTA_TRANCADA_LIDA")

    if out["repo_existe"]:
        repo_idx = index_repo_files(CLONE_CANONICO)
        out["boot_evidence"].append("REPO_INDEXADO_PARA_REUSE_CHECK")
    else:
        repo_idx = set()
        out["boot_evidence"].append("REPO_AUSENTE_REUSE_NAO_CHECAGEM")

    itens = []
    for fn in sorted(os.listdir(PASTA_TRANCADA)):
        full = os.path.join(PASTA_TRANCADA, fn)
        if not os.path.isfile(full):
            continue
        st = os.stat(full)
        entry = {
            "nome": fn,
            "tamanho_bytes": st.st_size,
            "mtime": datetime.datetime.fromtimestamp(st.st_mtime).isoformat(timespec="seconds"),
            "sha256": sha256_of(full),
            "ext": os.path.splitext(fn)[1].lower(),
            "existe_no_repo_local": norm_name(fn) in repo_idx,
            "dono_canonico": "UNKNOWN" if norm_name(fn) not in repo_idx else "JA_EXISTE_LOCAL",
            "acao_sugerida": "NO_CHANGE_SE_JA_EXISTIR" if norm_name(fn) in repo_idx else "VERIFICAR_GAP_ANTES_DE_ABSORVER",
        }
        itens.append(entry)

    out["itens"] = itens
    out["estatisticas"] = {
        "total_itens": len(itens),
        "zips": sum(1 for i in itens if i["ext"] == ".zip"),
        "ja_existentes_no_repo": sum(1 for i in itens if i["existe_no_repo_local"]),
        "novos_para_verificar": sum(1 for i in itens if not i["existe_no_repo_local"]),
    }
    out["boot_evidence"].append("INVENTARIO_GERADO_SEM_EXTRACAO")

    # Grava INVENTARIO.json na propria pasta (escrita local e reversivel)
    out_path = os.path.join(PASTA_TRANCADA, "INVENTARIO.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    out["inventario_salvo_em"] = out_path
    out["boot_evidence"].append("INVENTARIO_JSON_GRAVADO_LOCAL")

    print(json.dumps(out, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
