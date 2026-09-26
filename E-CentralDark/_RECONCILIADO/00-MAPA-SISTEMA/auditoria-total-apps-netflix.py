#!/usr/bin/env python3
import os
import sys
import json
import time
import hashlib
import datetime
import subprocess
from pathlib import Path

RED = "\033[38;5;196m"
WHITE = "\033[97m"
GRAY = "\033[90m"
YELLOW = "\033[33m"
GREEN = "\033[32m"
BLUE = "\033[36m"
RESET = "\033[0m"
BOLD = "\033[1m"

BASE = Path(os.environ["BASE"])
SNAP = Path(os.environ["SNAP"])
SHA = os.environ["SHA"]
PRIMARY = Path("/root/CentralDark/apps")
REPO_APPS = SNAP / "apps"

REPORT = BASE / "RELATORIO-TOTAL-APPS-NETFLIX.md"
SUMMARY = BASE / "RESUMO-GERAL.tsv"
MIGRATION = BASE / "PLANO-MIGRACAO-FINAL.md"
PM2_FILE = BASE / "PM2-SNAPSHOT.txt"
APPS_FOUND = BASE / "APPS-ENCONTRADAS.txt"

EXCLUDE_DIRS = {
    ".git", "node_modules", ".cache", ".npm", ".pm2", ".grok",
    "tmp", "temp", "__pycache__"
}

SOFT_EXCLUDE_DIRS = {
    "logs", "sessions"
}

SENSITIVE_EXT = (".pem", ".key", ".p12", ".pfx")
SENSITIVE_NAMES = {"id_rsa", "id_ed25519", "authorized_keys"}

def now():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

def sh(cmd):
    return subprocess.run(
        cmd,
        shell=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
    ).stdout.strip()

def print_flush(text=""):
    print(text, flush=True)

def banner():
    print_flush(f"{RED}{BOLD}")
    print_flush("███╗   ██╗███████╗████████╗███████╗██╗     ██╗██╗  ██╗")
    print_flush("████╗  ██║██╔════╝╚══██╔══╝██╔════╝██║     ██║╚██╗██╔╝")
    print_flush("██╔██╗ ██║█████╗     ██║   █████╗  ██║     ██║ ╚███╔╝ ")
    print_flush("██║╚██╗██║██╔══╝     ██║   ██╔══╝  ██║     ██║ ██╔██╗ ")
    print_flush("██║ ╚████║███████╗   ██║   ██║     ███████╗██║██╔╝ ██╗")
    print_flush("╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝     ╚══════╝╚═╝╚═╝  ╚═╝")
    print_flush(f"{RESET}")
    print_flush(f"{WHITE}{BOLD}AUDITORIA TOTAL DE APPS — VPS + REPO{RESET}")
    print_flush(f"{GRAY}Modo leitura. Não move, não copia para destino e não apaga nada.{RESET}")
    print_flush()

def step(n, total, text):
    pct = int((n / total) * 100)
    print_flush(f"{RED}{BOLD}[{n}/{total}] {text} — {pct}%{RESET}")

def du(path):
    if not path.exists():
        return "0"
    return sh(f"du -sh {str(path)!r} 2>/dev/null | awk '{{print $1}}'") or "?"

def human(n):
    try:
        n = float(n)
    except Exception:
        return str(n)
    for u in ["B", "KB", "MB", "GB", "TB"]:
        if n < 1024:
            return f"{n:.1f}{u}"
        n /= 1024
    return f"{n:.1f}PB"

def fmt_time(t):
    if not t:
        return "-"
    try:
        return datetime.datetime.fromtimestamp(int(t)).strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return "-"

def is_sensitive(path):
    name = path.name.lower()
    return (
        name.startswith(".env")
        or name in SENSITIVE_NAMES
        or name.endswith(SENSITIVE_EXT)
    )

def sha256(path):
    h = hashlib.sha256()
    try:
        with path.open("rb") as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                h.update(chunk)
        return h.hexdigest()
    except Exception as e:
        return f"<erro:{type(e).__name__}>"

def find_apps_dirs():
    found = []
    root = Path("/root")

    for p in root.rglob("apps"):
        if not p.is_dir():
            continue

        try:
            rel_parts = p.relative_to(root).parts
        except Exception:
            continue

        if len(rel_parts) > 3:
            continue

        if any(part in EXCLUDE_DIRS for part in p.parts):
            continue

        found.append(p)

    found = sorted(set(found), key=lambda x: str(x))
    APPS_FOUND.write_text("\n".join(str(x) for x in found) + "\n", encoding="utf-8")
    return found

def inventory(base, label):
    data = {}
    skipped_heavy = 0
    skipped_soft = 0
    files_seen = 0
    last_print = time.time()

    if not base.exists():
        return data, {"files_seen": 0, "skipped_heavy": 0, "skipped_soft": 0}

    for cur, dirs, files in os.walk(base):
        original_dirs = list(dirs)

        dirs[:] = [
            d for d in dirs
            if d not in EXCLUDE_DIRS
        ]

        skipped_heavy += len(original_dirs) - len(dirs)

        rootp = Path(cur)

        if any(part in SOFT_EXCLUDE_DIRS for part in rootp.parts):
            skipped_soft += 1
            continue

        for name in files:
            p = rootp / name
            files_seen += 1

            try:
                rel = str(p.relative_to(base))
                st = p.stat()
            except Exception:
                continue

            sensitive = is_sensitive(p)

            data[rel] = {
                "size": st.st_size,
                "mtime": int(st.st_mtime),
                "sha": sha256(p),
                "sensitive": sensitive,
            }

            if files_seen % 250 == 0 or time.time() - last_print > 2:
                print_flush(f"{GRAY}  {label}: {files_seen} arquivos lidos...{RESET}")
                last_print = time.time()

    return data, {
        "files_seen": files_seen,
        "skipped_heavy": skipped_heavy,
        "skipped_soft": skipped_soft,
    }

def compare(left_label, left_path, left_data, right_label, right_path, right_data):
    lk = set(left_data)
    rk = set(right_data)

    only_left = sorted(lk - rk)
    only_right = sorted(rk - lk)

    same = []
    different = []
    sensitive_common = []

    for rel in sorted(lk & rk):
        a = left_data[rel]
        b = right_data[rel]

        if a["sha"] == b["sha"]:
            same.append(rel)
        else:
            newer = left_label if a["mtime"] > b["mtime"] else right_label
            different.append((rel, newer, a, b))

        if a["sensitive"] or b["sensitive"]:
            sensitive_common.append(rel)

    slug = (
        f"{left_label}_VS_{right_label}"
        .replace("/", "_")
        .replace(" ", "_")
        .replace(":", "_")
    )
    detail = BASE / f"diff__{slug}.tsv"

    rows = ["status\tarquivo\tmais_novo\tsize_left\tmtime_left\tsize_right\tmtime_right\tsensivel"]
    for rel in only_left:
        a = left_data[rel]
        rows.append(f"SO_{left_label}\t{rel}\t{left_label}\t{a['size']}\t{a['mtime']}\t-\t-\t{a['sensitive']}")
    for rel in only_right:
        b = right_data[rel]
        rows.append(f"SO_{right_label}\t{rel}\t{right_label}\t-\t-\t{b['size']}\t{b['mtime']}\t{b['sensitive']}")
    for rel, newer, a, b in different:
        rows.append(f"DIFERENTE\t{rel}\t{newer}\t{a['size']}\t{a['mtime']}\t{b['size']}\t{b['mtime']}\t{a['sensitive'] or b['sensitive']}")
    for rel in same:
        a = left_data[rel]
        b = right_data[rel]
        rows.append(f"IGUAL\t{rel}\tIGUAL\t{a['size']}\t{a['mtime']}\t{b['size']}\t{b['mtime']}\t{a['sensitive'] or b['sensitive']}")

    detail.write_text("\n".join(rows) + "\n", encoding="utf-8")

    return {
        "left_label": left_label,
        "right_label": right_label,
        "left_path": left_path,
        "right_path": right_path,
        "only_left": only_left,
        "only_right": only_right,
        "different": different,
        "same": same,
        "sensitive_common": sensitive_common,
        "detail": detail,
    }

def first_level_apps(base):
    if not base.exists():
        return {}
    return {p.name: p for p in sorted(base.iterdir()) if p.is_dir()}

def classify_app(name):
    low = name.lower()
    if "crm" in low:
        return "BLOQUEADO_CRM"
    if "wuz" in low or "whatsapp" in low:
        return "BLOQUEADO_WHATSAPP_WUZAPI"
    if "bot" in low or "telegram" in low:
        return "CANDIDATO_IMPORTANTE"
    if "mcp" in low or "install" in low or "gateway" in low:
        return "SERVICO_EXISTENTE"
    if "clone-deck" in low:
        return "POSSIVEL_DUPLICIDADE_REPO"
    return "AVALIAR"

def app_size_and_files(path):
    if not path or not path.exists():
        return "0", 0
    files = sh(f"find {str(path)!r} -type f ! -path '*/node_modules/*' ! -path '*/.git/*' 2>/dev/null | wc -l")
    try:
        files = int(files.strip())
    except Exception:
        files = 0
    return du(path), files

def pm2_snapshot():
    txt = sh("pm2 ls --no-color 2>/dev/null")
    PM2_FILE.write_text(txt + "\n", encoding="utf-8")
    return txt

def main():
    banner()
    total_steps = 9

    step(1, total_steps, "Coletando estado PM2")
    pm2txt = pm2_snapshot()
    print_flush(f"{GREEN}PM2 snapshot salvo.{RESET}")
    print_flush()

    step(2, total_steps, "Procurando pastas chamadas apps até 3 níveis")
    apps_dirs = find_apps_dirs()
    for p in apps_dirs:
        mark = "⭐ PRINCIPAL" if p == PRIMARY else ""
        print_flush(f"{WHITE}- {p}{RESET} {YELLOW}{mark}{RESET}")
    print_flush()

    step(3, total_steps, "Inventariando pasta principal /root/CentralDark/apps")
    primary_data, primary_meta = inventory(PRIMARY, "PRIMARY")
    print_flush(f"{GREEN}Principal: {len(primary_data)} arquivos · {du(PRIMARY)}{RESET}")
    print_flush()

    step(4, total_steps, "Inventariando apps candidatas da VPS")
    inventories = {
        str(PRIMARY): {
            "label": "PRIMARY",
            "path": PRIMARY,
            "data": primary_data,
            "meta": primary_meta,
            "size": du(PRIMARY),
        }
    }

    for idx, path in enumerate(apps_dirs, 1):
        if path == PRIMARY:
            continue
        label = str(path).replace("/root/", "").replace("/", "_")
        print_flush(f"{BLUE}Lendo candidata {idx}/{len(apps_dirs)}: {path}{RESET}")
        data, meta = inventory(path, label)
        inventories[str(path)] = {
            "label": label,
            "path": path,
            "data": data,
            "meta": meta,
            "size": du(path),
        }
        print_flush(f"{GREEN}  OK: {len(data)} arquivos · {du(path)}{RESET}")
    print_flush()

    step(5, total_steps, "Inventariando snapshot do repositório")
    repo_data = {}
    repo_meta = {}
    if REPO_APPS.exists():
        repo_data, repo_meta = inventory(REPO_APPS, "REPO_APPS")
        print_flush(f"{GREEN}Repo apps: {len(repo_data)} arquivos · {du(REPO_APPS)} · SHA {SHA}{RESET}")
    else:
        print_flush(f"{YELLOW}Snapshot do repo não contém apps/.{RESET}")

    inventories["REPO_APPS"] = {
        "label": "REPO_APPS",
        "path": REPO_APPS,
        "data": repo_data,
        "meta": repo_meta,
        "size": du(REPO_APPS),
    }
    print_flush()

    step(6, total_steps, "Comparando tudo contra a principal")
    comparisons = []

    for key, inv in inventories.items():
        if inv["label"] == "PRIMARY":
            continue

        print_flush(f"{WHITE}Comparando {inv['path']} -> {PRIMARY}{RESET}")
        cmp = compare(
            inv["label"],
            inv["path"],
            inv["data"],
            "PRIMARY",
            PRIMARY,
            primary_data,
        )
        comparisons.append(cmp)
        print_flush(
            f"  só origem={len(cmp['only_left'])} · só principal={len(cmp['only_right'])} · "
            f"diferentes={len(cmp['different'])} · iguais={len(cmp['same'])}"
        )
    print_flush()

    step(7, total_steps, "Gerando plano app por app")
    bases = [PRIMARY] + [p for p in apps_dirs if p != PRIMARY]
    if REPO_APPS.exists():
        bases.append(REPO_APPS)

    app_map = {}
    for base in bases:
        for name, path in first_level_apps(base).items():
            app_map.setdefault(name, {})[str(base)] = path

    migration_rows = []
    for name in sorted(app_map):
        entry = app_map[name]
        primary_path = entry.get(str(PRIMARY))
        repo_path = entry.get(str(REPO_APPS))
        classification = classify_app(name)

        for base, path in sorted(entry.items()):
            size, files = app_size_and_files(path)
            exists_primary = "sim" if primary_path else "não"
            exists_repo = "sim" if repo_path else "não"

            if base == str(PRIMARY):
                rec = "JÁ ESTÁ NA PRINCIPAL."
            elif classification.startswith("BLOQUEADO"):
                rec = "NÃO MIGRAR SEM CONFIRMAÇÃO."
            elif primary_path:
                rec = "COMPARAR COM A EXISTENTE NA PRINCIPAL."
            elif exists_repo == "sim":
                rec = "JÁ EXISTE NO REPO; VALIDAR DEPLOY ANTES DE COPIAR DA VPS."
            elif classification == "CANDIDATO_IMPORTANTE":
                rec = "CANDIDATO FORTE A MIGRAR, APÓS DRY-RUN APP POR APP."
            else:
                rec = "AVALIAR USO ANTES DE MIGRAR."

            migration_rows.append({
                "app": name,
                "base": base,
                "path": str(path),
                "size": size,
                "files": files,
                "exists_primary": exists_primary,
                "exists_repo": exists_repo,
                "class": classification,
                "recommendation": rec,
            })

    step(8, total_steps, "Escrevendo relatórios finais")

    summary_rows = ["origem\ttamanho\tarquivos\tso_origem\tso_principal\tdiferentes\tiguais\tdetalhe"]
    for cmp in comparisons:
        left_key = str(cmp["left_path"])
        inv = inventories.get(left_key)
        files = len(inv["data"]) if inv else 0
        size = inv["size"] if inv else "?"
        summary_rows.append(
            f"{cmp['left_path']}\t{size}\t{files}\t{len(cmp['only_left'])}\t"
            f"{len(cmp['only_right'])}\t{len(cmp['different'])}\t{len(cmp['same'])}\t{cmp['detail']}"
        )
    SUMMARY.write_text("\n".join(summary_rows) + "\n", encoding="utf-8")

    mig_lines = []
    mig_lines.append("# 🎬 PLANO FINAL NETFLIX — Migração de apps")
    mig_lines.append("")
    mig_lines.append(f"- Data: `{now()}`")
    mig_lines.append(f"- Principal: `{PRIMARY}`")
    mig_lines.append(f"- Repo apps snapshot: `{REPO_APPS}`")
    mig_lines.append(f"- SHA repo usado: `{SHA}`")
    mig_lines.append("")
    mig_lines.append("## Regra")
    mig_lines.append("")
    mig_lines.append("Nada foi movido, copiado ou apagado. Este é só o plano final de leitura.")
    mig_lines.append("")
    mig_lines.append("## Tabela app por app")
    mig_lines.append("")
    mig_lines.append("| App | Origem | Tamanho | Arquivos | Na principal? | No repo? | Classe | Recomendação |")
    mig_lines.append("|---|---|---:|---:|---:|---:|---|---|")
    for r in migration_rows:
        mig_lines.append(
            f"| `{r['app']}` | `{r['base']}` | `{r['size']}` | {r['files']} | "
            f"{r['exists_primary']} | {r['exists_repo']} | `{r['class']}` | {r['recommendation']} |"
        )
    mig_lines.append("")
    mig_lines.append("## Ordem recomendada")
    mig_lines.append("")
    mig_lines.append("1. Começar por apps candidatos importantes que não existem na principal.")
    mig_lines.append("2. Rodar dry-run app por app antes de copiar qualquer coisa.")
    mig_lines.append("3. Não mexer em CRM, WhatsApp, WuzAPI, Docker, Caddy, banco real ou domínio sem confirmação.")
    mig_lines.append("4. Depois de copiar um app, validar PM2/HTTP/build.")
    mig_lines.append("5. Só arquivar/apagar antigas depois de validação e confirmação.")
    MIGRATION.write_text("\n".join(mig_lines) + "\n", encoding="utf-8")

    report_lines = []
    report_lines.append("# 🎬 RELATÓRIO TOTAL NETFLIX — Apps VPS + Repo")
    report_lines.append("")
    report_lines.append(f"- Data: `{now()}`")
    report_lines.append(f"- Diretório do relatório: `{BASE}`")
    report_lines.append(f"- Principal: `{PRIMARY}`")
    report_lines.append(f"- Repo SHA: `{SHA}`")
    report_lines.append("")
    report_lines.append("## 1. Pastas apps encontradas")
    report_lines.append("")
    for p in apps_dirs:
        mark = " — PRINCIPAL" if p == PRIMARY else ""
        report_lines.append(f"- `{p}`{mark} — `{du(p)}`")
    report_lines.append("")
    report_lines.append("## 2. Resumo das comparações contra a principal")
    report_lines.append("")
    report_lines.append("| Origem | Tamanho | Arquivos | Só origem | Só principal | Diferentes | Iguais | TSV |")
    report_lines.append("|---|---:|---:|---:|---:|---:|---:|---|")
    for cmp in comparisons:
        left_key = str(cmp["left_path"])
        inv = inventories.get(left_key)
        files = len(inv["data"]) if inv else 0
        size = inv["size"] if inv else "?"
        report_lines.append(
            f"| `{cmp['left_path']}` | `{size}` | {files} | {len(cmp['only_left'])} | "
            f"{len(cmp['only_right'])} | {len(cmp['different'])} | {len(cmp['same'])} | `{cmp['detail'].name}` |"
        )
    report_lines.append("")
    report_lines.append("## 3. Principais achados")
    report_lines.append("")
    for cmp in comparisons:
        report_lines.append(f"### {cmp['left_path']} → {PRIMARY}")
        report_lines.append("")
        report_lines.append(f"- Só na origem: `{len(cmp['only_left'])}`")
        report_lines.append(f"- Diferentes: `{len(cmp['different'])}`")
        report_lines.append(f"- Iguais: `{len(cmp['same'])}`")
        report_lines.append("")
        report_lines.append("#### Primeiros arquivos só na origem")
        report_lines.append("")
        for rel in cmp["only_left"][:80]:
            item = inventories[str(cmp["left_path"])]["data"].get(rel, {})
            tag = " ⚠️ sensível" if item.get("sensitive") else ""
            report_lines.append(f"- `{rel}` — {human(item.get('size', 0))} — {fmt_time(item.get('mtime', 0))}{tag}")
        if len(cmp["only_left"]) > 80:
            report_lines.append("- ... lista cortada; veja TSV completo.")
        report_lines.append("")
        report_lines.append("#### Arquivos diferentes")
        report_lines.append("")
        for rel, newer, a, b in cmp["different"][:80]:
            report_lines.append(f"- `{rel}`")
            report_lines.append(f"  - Mais novo: `{newer}`")
            report_lines.append(f"  - Origem: {human(a['size'])} — {fmt_time(a['mtime'])}")
            report_lines.append(f"  - Principal: {human(b['size'])} — {fmt_time(b['mtime'])}")
        if len(cmp["different"]) > 80:
            report_lines.append("- ... lista cortada; veja TSV completo.")
        report_lines.append("")
    report_lines.append("## 4. Estado PM2")
    report_lines.append("")
    report_lines.append("```txt")
    report_lines.append(pm2txt)
    report_lines.append("```")
    report_lines.append("")
    report_lines.append("## 5. Arquivos gerados")
    report_lines.append("")
    report_lines.append(f"- Resumo geral: `{SUMMARY}`")
    report_lines.append(f"- Plano final: `{MIGRATION}`")
    report_lines.append(f"- PM2 snapshot: `{PM2_FILE}`")
    report_lines.append(f"- Apps encontradas: `{APPS_FOUND}`")
    report_lines.append("")
    report_lines.append("## 6. Próximo passo")
    report_lines.append("")
    report_lines.append("Gerar dry-run de migração somente para os apps aprovados no plano final.")
    REPORT.write_text("\n".join(report_lines) + "\n", encoding="utf-8")

    step(9, total_steps, "Concluído")
    print_flush(f"{GREEN}✅ Relatório total:{RESET} {REPORT}")
    print_flush(f"{GREEN}✅ Plano final:{RESET} {MIGRATION}")
    print_flush(f"{GREEN}✅ Resumo TSV:{RESET} {SUMMARY}")
    print_flush()
    print_flush(f"{WHITE}{BOLD}Abrir relatório:{RESET}")
    print_flush(f"cat {str(REPORT)!r}")
    print_flush()
    print_flush(f"{WHITE}{BOLD}Abrir plano final:{RESET}")
    print_flush(f"cat {str(MIGRATION)!r}")

if __name__ == "__main__":
    main()
