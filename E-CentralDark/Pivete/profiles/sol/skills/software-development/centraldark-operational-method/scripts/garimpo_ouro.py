#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
garimpo_ouro.py — Fase 2 ampla: varre paths, hash de cada arquivo,
cruza contra origin/main (remoto, ref local) + casa local, marca NOVO/DUPLICADO.

READ-ONLY: nao move, nao apaga, nao comprime. So mede + classifica.
Gera GARIMPO.json na saida.

NAO usa os.walk em E:\ cru (timeout). So nos paths explicitos do CHEFE.
Pitfall ja validado: os.walk no clone CentralDark estoura 180s (.cache.zip 1.5GB,
node_modules, BACKUPS) -> usar git ls-files / git ls-tree -r origin/main.
"""
import hashlib
import json
import os
import re
import subprocess

HOME = os.path.expanduser("~")
# Configure PATHS para o alvo da varredura. Nao varra E:\ cru (timeout).
PATHS = [
    os.path.join(HOME, "OneDrive", "Área de Trabalho", "🔒PASTA TRANCADA APELO CHEFE🔒"),
    os.path.join(HOME, "OneDrive", "Área de Trabalho", "CentralDark-Arvores"),
    os.path.join(HOME, "OneDrive", "Área de Trabalho", "CentralDark-Cleanup-ProofDriven-20260824-114754"),
    r"C:\Users\Administrador",
    r"C:\tmp",
    r"C:\temp",
    r"E:\Users",
]
CASA_LOCAL = r"E:\CentralDark\Pivete\CentralDark"
REPO = CASA_LOCAL
OUT = os.path.join(HOME, "OneDrive", "Área de Trabalho", "GARIMPO.json")


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def sha256_of(path, limit=50 * 1024 * 1024):
    h = hashlib.sha256()
    try:
        with open(path, "rb") as f:
            while True:
                chunk = f.read(65536)
                if not chunk:
                    break
                h.update(chunk)
    except Exception:
        return None
    return h.hexdigest()


def build_repo_index(root, use_ls_tree=False, ref="origin/main"):
    out = set()
    try:
        if use_ls_tree:
            res = subprocess.run(["git", "-C", root, "ls-tree", "-r", ref],
                                 capture_output=True, text=True, timeout=60)
            for line in res.stdout.splitlines():
                out.add(norm(os.path.basename(line.split()[-1])))
        else:
            res = subprocess.run(["git", "-C", root, "ls-files"],
                                 capture_output=True, text=True, timeout=60)
            for line in res.stdout.splitlines():
                out.add(norm(os.path.basename(line)))
    except Exception:
        pass
    return out


def main():
    remoto = build_repo_index(REPO, use_ls_tree=True, ref="origin/main")
    casa = build_repo_index(REPO, use_ls_tree=False)
    itens = []
    for base in PATHS:
        if not os.path.isdir(base):
            continue
        for dp, _, fns in os.walk(base):
            if ".git" in dp or "node_modules" in dp:
                continue
            for fn in fns:
                full = os.path.join(dp, fn)
                try:
                    st = os.stat(full)
                except Exception:
                    continue
                sha = sha256_of(full)
                n = norm(fn)
                if n in remoto or n in casa:
                    cls = "DUPLICADO"
                elif sha is None:
                    cls = "INCONCLUSIVO"
                else:
                    cls = "NOVO"
                itens.append({
                    "path": full,
                    "rel": os.path.relpath(full, base),
                    "tamanho": st.st_size,
                    "sha256": sha,
                    "nome_norm": n,
                    "classe": cls,
                    "no_remoto": n in remoto,
                    "na_casa": n in casa,
                })
    resumo = {
        "total": len(itens),
        "NOVO": sum(1 for i in itens if i["classe"] == "NOVO"),
        "DUPLICADO": sum(1 for i in itens if i["classe"] == "DUPLICADO"),
        "INCONCLUSIVO": sum(1 for i in itens if i["classe"] == "INCONCLUSIVO"),
    }
    out = {"paths_varridos": PATHS, "remoto_nomes": len(remoto),
           "casa_nomes": len(casa), "resumo": resumo, "itens": itens}
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(json.dumps({"arquivos": len(itens), "resumo": resumo,
                      "garimpo_salvo": OUT}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
