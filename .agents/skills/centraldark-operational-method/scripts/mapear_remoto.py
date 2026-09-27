#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
mapear_remoto.py — Fase 0 da absorcao: mapeia origin/main (ref local, sem rede)
e cruza com INVENTARIO.json da PASTA TRANCADA.

Gerado REMOTE_MAP.json (nomes normalizados do remoto) e atualiza cada item do
INVENTARIO com: existe_no_remoto + dono_canonico_remoto.

NAO EXTRAI. NAO ESCREVE NO REPO. READ-ONLY + JSON local.
"""
import json
import os
import re
import subprocess

HOME = os.path.expanduser("~")
PASTA = os.path.join(HOME, "OneDrive", "Área de Trabalho", "🔒PASTA TRANCADA APELO CHEFE🔒")
INVENTARIO = os.path.join(PASTA, "INVENTARIO.json")
REMOTE_MAP = os.path.join(PASTA, "REMOTE_MAP.json")
REPO = r"E:\CentralDark\Pivete\CentralDark"


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def main():
    # 1) mapeia remoto via ls-tree (ref local, sem fetch)
    res = subprocess.run(
        ["git", "-C", REPO, "ls-tree", "-r", "--name-only", "origin/main"],
        capture_output=True, text=True, timeout=60,
    )
    remote_nomes = set()
    remote_paths = []
    for line in res.stdout.splitlines():
        remote_paths.append(line)
        remote_nomes.add(norm(os.path.basename(line)))

    with open(REMOTE_MAP, "w", encoding="utf-8") as f:
        json.dump({"total": len(remote_nomes), "nomes": sorted(remote_nomes),
                   "paths_total": len(remote_paths)}, f, ensure_ascii=False, indent=2)

    # 2) cruza com inventario
    inv = json.load(open(INVENTARIO, encoding="utf-8"))
    for it in inv["itens"]:
        n = norm(it["nome"])
        if n in remote_nomes:
            it["existe_no_remoto"] = True
            it["dono_canonico"] = "JA_EXISTE_REMOTO"
            it["acao_sugerida"] = "NO_CHANGE_SE_JA_EXISTIR"
        else:
            it["existe_no_remoto"] = False
            # mantem UNKNOWN / VERIFICAR_GAP
            if it.get("dono_canonico") == "UNKNOWN":
                it["acao_sugerida"] = "VERIFICAR_GAP_ANTES_DE_ABSORVER"

    # estatisticas
    ja = sum(1 for i in inv["itens"] if i.get("existe_no_remoto"))
    inv["estatisticas"]["ja_existentes_no_remoto"] = ja
    inv["estatisticas"]["novos_apos_remoto"] = len(inv["itens"]) - ja
    inv["boot_evidence"].append("REMOTO_MAP_GERADO")
    inv["boot_evidence"].append("CRUZAMENTO_REMOTO_FEITO")

    with open(INVENTARIO, "w", encoding="utf-8") as f:
        json.dump(inv, f, ensure_ascii=False, indent=2)

    print(json.dumps({
        "remote_total_paths": len(remote_paths),
        "remote_nomes_unicos": len(remote_nomes),
        "itens_pasta": len(inv["itens"]),
        "ja_existentes_no_remoto": ja,
        "novos_apos_remoto": len(inv["itens"]) - ja,
        "remote_map": REMOTE_MAP,
        "inventario_atualizado": INVENTARIO,
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
