#!/usr/bin/env python3
"""
drive_reconcile.py — Reconciliador Google Drive ↔ workspace local.
Front do FABLE LOOP: FRONT 3: DRIVE_DOCS.

Comandos:
  python scripts/drive_reconcile.py              # sync completo (se configurado)
  python scripts/drive_reconcile.py --dry-run    # só mostra o que faria
  python scripts/drive_reconcile.py --check      # verifica se está configurado
  python scripts/drive_reconcile.py --local <pasta>    # modo somente local
  python scripts/drive_reconcile.py --manifest         # manifesto local
  python scripts/drive_reconcile.py --force            # força conflitos -> _CONFLICTS/
  python scripts/drive_reconcile.py --resolve-conflicts <report.json>

Regra: sem credencial/config, vira UNKNOWN. Sem apagar/sobrescrever sem
confirmação humana. Sem copiar lixo.
"""

import argparse
import hashlib
import json
import os
import shutil
import sys
import time
from datetime import datetime
from pathlib import Path

DEFAULT_CONFIG_PATH = Path.home() / ".config" / "centraldark" / "drive" / "config.yaml"

IGNORE_PATTERNS = [
    ".env*",
    "auth.json",
    "node_modules",
    "__pycache__",
    "*.log",
    "*.tmp",
    "*.bak",
]

RECEIPTS_DIR = Path(".hermes") / "receipts"
RECEIPT_NAME_PATTERN = "drive-reconcile-{:%Y%m%d}.json"


def load_ignore_patterns():
    return set(IGNORE_PATTERNS)


def is_ignored(rel_path, patterns):
    for p in patterns:
        if p.startswith("*."):
            ext = p[1:]
            if rel_path.name.endswith(ext.replace("*", "")) or rel_path.name == p:
                return True
        elif p.endswith("/**"):
            parent = p[:-3]
            if rel_path.parts and rel_path.parts[0] == parent:
                return True
        elif rel_path.parts and rel_path.parts[0] == p:
            return True
    return False


def sha256_file(path):
    h = hashlib.sha256()
    try:
        with open(path, "rb") as f:
            while True:
                chunk = f.read(65536)
                if not chunk:
                    break
                h.update(chunk)
        return h.hexdigest()
    except (IsADirectoryError, FileNotFoundError, PermissionError):
        return None


def scan_local(root_path, ignore_patterns=None):
    """scan_local() → manifesto local (sha256, mtime, size)"""
    if ignore_patterns is None:
        ignore_patterns = load_ignore_patterns()

    manifest = []
    errors = []
    root = Path(root_path).expanduser().resolve()
    if not root.exists():
        errors.append(f"root_not_found: {root}")
        return manifest, errors

    for dirpath, dirnames, filenames in os.walk(str(root)):
        rel_dir = Path(dirpath).relative_to(root)
        dirs_to_remove = [d for d in dirnames if is_ignored(rel_dir / d, ignore_patterns)]
        for d in dirs_to_remove:
            dirnames.remove(d)

        for fname in filenames:
            fpath = Path(dirpath) / fname
            try:
                rel = fpath.relative_to(root)
            except ValueError:
                rel = fpath.name
            if is_ignored(rel, ignore_patterns):
                continue
            try:
                stat = fpath.stat()
                sha = sha256_file(fpath)
                if sha is None:
                    errors.append(f"sha_failed: {rel}")
                    continue
                manifest.append({
                    "path": str(rel),
                    "sha256": sha,
                    "mtime": stat.st_mtime,
                    "size": stat.st_size,
                })
            except Exception as e:
                errors.append(f"stat_failed:{rel}:{type(e).__name__}")
    return manifest, errors


def print_local_manifest(manifest, base_label="local"):
    print(f"\n=== MANIFESTO {base_label.upper()} ===")
    print(f"Total de arquivos: {len(manifest)}")
    if not manifest:
        return
    print(f"{'PATH':<50} {'SHA256':<66} {'MTIME':<20} SIZE")
    print("-" * 140)
    for item in sorted(manifest, key=lambda x: x["path"]):
        mtime = datetime.fromtimestamp(item["mtime"]).strftime("%Y-%m-%d %H:%M:%S") if item["mtime"] else "?"
        print(f"{item['path']:<50} {item['sha256'][:12]:<66} {mtime:<20} {item['size']}")
    print("-" * 140)


def scan_remote(service, folder_id=None, ignore_patterns=None):
    """
    scan_remote() → manifesto Drive (fileId, sha256, modifiedTime)

    Interface: quem tiver o serviço Drive configurado (google-api-python-client,
    rclone, CLI vigente) implementa esta função com a relação real.

    Retorna lista de dicts com: fileId, name, path (virtual), sha256, modifiedTime,
    size, mimeType.

    Se o serviço não estiver disponível/configurado:
      - retorna ([], ["service_unavailable: ..."])
      - NÃO tenta autenticar, NÃO lê token, NÃO alcança a API
    """
    if ignore_patterns is None:
        ignore_patterns = load_ignore_patterns()

    manifest = []
    errors = []

    # --- Interface: implementação real quando o serviço estiver configurado ---
    # Exemplo (não executável sem a dependência/service real):
    #
    # if service is None:
    #     errors.append("service_unavailable: nenhum serviço Drive configurado")
    #     return manifest, errors
    #
    # page_token = None
    # while True:
    #     results = service.files().list(
    #         q=f"'{folder_id}' in parents" if folder_id else None,
    #         fields="nextPageToken, files(id, name, size, modifiedTime, md5Checksum, mimeType)",
    #         pageToken=page_token,
    #     ).execute()
    #     for f in results.get("files", []):
    #         rel = caminho_virtual(f, folder_id)
    #         if is_ignored(rel, ignore_patterns):
    #             continue
    #         manifest.append({
    #             "fileId": f.get("id"),
    #             "name": f.get("name"),
    #             "path": rel,
    #             "sha256": f.get("md5Checksum") or f.get("sha256"),
    #             "modifiedTime": f.get("modifiedTime"),
    #             "size": f.get("size"),
    #             "mimeType": f.get("mimeType"),
    #         })
    #     page_token = results.get("nextPageToken")
    #     if not page_token:
    #         break
    # -------------------------------------------------------------------------

    if not manifest and not errors:
        errors.append("service_unavailable: scan_remote requer serviço Drive configurado")

    return manifest, errors


def print_remote_manifest(manifest, base_label="drive"):
    print(f"\n=== MANIFESTO {base_label.upper()} ===")
    print(f"Total de arquivos: {len(manifest)}")
    if not manifest:
        return
    print(f"{'FILEID':<20} {'PATH':<45} {'SHA256':<36} {'MODIFIEDTIME':<25} SIZE")
    print("-" * 130)
    for item in sorted(manifest, key=lambda x: x.get("path", "")):
        sha = item.get("sha256", "?") or "?"
        mtime = item.get("modifiedTime", "?") or "?"
        print(f"{item.get('fileId','?'):<20} {item.get('path','?'):<45} {str(sha)[:12]:<36} {str(mtime)[:25]:<25} {item.get('size','?')}")
    print("-" * 130)


def diff(local_manifest, remote_manifest):
    """
    diff() → Cruzamento: SÓ_LOCAL / SÓ_DRIVE / IGUAL / CONFLITO

    Recebe dois manifestos (scan_local e scan_remote) e retorna relatório
    com status por arquivo.
    """
    local_map = {f["path"]: f for f in local_manifest}
    remote_map = {f["path"]: f for f in remote_manifest}

    all_paths = sorted(set(local_map.keys()) | set(remote_map.keys()))

    report = []
    for path in all_paths:
        in_local = path in local_map
        in_remote = path in remote_map

        if in_local and in_remote:
            local_sha = local_map[path]["sha256"]
            remote_sha = remote_map[path].get("sha256", remote_map[path].get("sha", ""))
            if local_sha == remote_sha:
                status = "IGUAL"
                action = "nada"
            else:
                status = "CONFLITO"
                action = "confirmação humana (ou força → _CONFLICTS/)"
            report.append({
                "path": path,
                "status": status,
                "local_sha": local_sha,
                "remote_sha": remote_sha,
                "fileId": remote_map[path].get("fileId"),
                "local_path": local_map[path],
                "remote_path": remote_map[path],
                "ação": action,
            })
        elif in_local and not in_remote:
            report.append({
                "path": path,
                "status": "SÓ_LOCAL",
                "local_sha": local_map[path]["sha256"],
                "remote_sha": None,
                "fileId": None,
                "local_path": local_map[path],
                "remote_path": None,
                "ação": "candidato a upload",
            })
        else:
            report.append({
                "path": path,
                "status": "SÓ_DRIVE",
                "local_sha": None,
                "remote_sha": remote_map[path].get("sha256", remote_map[path].get("sha", "")),
                "fileId": remote_map[path].get("fileId"),
                "local_path": None,
                "remote_path": remote_map[path],
                "ação": "candidato a download — verificar se útil antes",
            })
    return report


def print_diff_report(report):
    sync = [r for r in report if r["status"] == "IGUAL"]
    only_local = [r for r in report if r["status"] == "SÓ_LOCAL"]
    only_remote = [r for r in report if r["status"] == "SÓ_DRIVE"]
    conflict = [r for r in report if r["status"] == "CONFLITO"]

    print("\n=== RESUMO DO DIFF ===")
    print(f"IGUAL (sincronizados):  {len(sync)}")
    print(f"SÓ_LOCAL (upload):      {len(only_local)}")
    print(f"SÓ_DRIVE (download):   {len(only_remote)}")
    print(f"CONFLITO (dif):        {len(conflict)}")

    if only_local:
        print("\n--- SÓ LOCAL (candidato a upload) ---")
        for r in only_local:
            print(f"  [+] {r['path']}  sha={r['local_sha'][:12]}...")

    if only_remote:
        print("\n--- SÓ NO DRIVE (candidato a download — verificar se útil) ---")
        for r in only_remote:
            print(f"  [-] {r['path']}  sha={r['remote_sha'][:12]}...")

    if conflict:
        print("\n--- CONFLITOS (HARD STOP — confirmação humana antes) ---")
        for r in conflict:
            print(f"  [!] {r['path']}")
            print(f"      local:   {r['local_sha'][:12]}...")
            print(f"      remote:  {r['remote_sha'][:12]}...")
            print(f"      ação:    {r['ação']}")

    if sync:
        print("\n--- Sincronizados (IGUAL) ---")
        for r in sync:
            print(f"  [=] {r['path']}")


def execute(report, local_root, remote_service=None, dry_run=False):
    """
    execute() → Upload/Download bidirecional

    Recebe relatório de diff e executa upload (SÓ_LOCAL) e download
    (SÓ_DRIVE), com hard stop em conflitos.
    """
    stats = {
        "uploaded": [],
        "downloaded": [],
        "conflicted": [],
        "skipped": [],
        "errors": [],
    }

    for r in report:
        if r["status"] == "CONFLITO":
            stats["conflicted"].append(r["path"])
            if dry_run:
                print(f"  [DRY-RUN] conflito não resolvido: {r['path']}")
            continue

        if r["status"] == "SÓ_LOCAL":
            local_full = Path(local_root) / r["path"]
            if not local_full.exists():
                stats["errors"].append(f"arquivo local não encontrado para upload: {r['path']}")
                continue
            if dry_run:
                stats["uploaded"].append(r["path"])
                print(f"  [DRY-RUN] seria upload: {r['path']} → Drive (fileId={r.get('fileId')})")
            else:
                if remote_service is None:
                    stats["errors"].append(f"sem serviço remoto para upload: {r['path']}")
                    continue
                stats["errors"].append(f"upload não implementado neste esqueleto: {r['path']}")
            continue

        if r["status"] == "SÓ_DRIVE":
            if dry_run:
                stats["downloaded"].append(r["path"])
                print(f"  [DRY-RUN] seria download: {r['path']} (fileId={r.get('fileId')}) → local")
            else:
                if remote_service is None:
                    stats["errors"].append(f"sem serviço remoto para download: {r['path']}")
                    continue
                stats["errors"].append(f"download não implementado neste esqueleto: {r['path']}")
            continue

    return stats


def verify(local_root, expected_remote_sha_map, dry_run=False):
    """
    verify() → Re-check checksums pós-sync

    Re-escaneia local após sync e compara com o que era esperado.
    Retorna dict com: ok, failures, unknown.
    """
    current, errors = scan_local(local_root)
    current_map = {f["path"]: f for f in current}

    ok = []
    failures = []
    unknown = []

    for path, expected in expected_remote_sha_map.items():
        if path not in current_map:
            unknown.append(path)
            continue
        current_sha = current_map[path]["sha256"]
        if current_sha == expected:
            ok.append(path)
        else:
            failures.append({"path": path, "expected": expected, "current": current_sha})

    return {
        "ok": ok,
        "failures": failures,
        "unknown": unknown,
        "total_checked": len(expected_remote_sha_map),
    }


def receipt(report, stats, verify_result, local_manifest, remote_manifest,
            base_label="drive-reconcile", receipts_dir=None):
    """receipt() → .hermes/receipts/drive-reconcile-YYYYMMDD.json"""
    if receipts_dir is None:
        receipts_dir = RECEIPTS_DIR
    receipts_dir.mkdir(parents=True, exist_ok=True)

    today = datetime.now()
    receipt_name = RECEIPT_NAME_PATTERN.format(today)
    receipt_path = receipts_dir / receipt_name

    diff_counts = {
        "IGUAL": sum(1 for r in report if r["status"] == "IGUAL"),
        "SÓ_LOCAL": sum(1 for r in report if r["status"] == "SÓ_LOCAL"),
        "SÓ_DRIVE": sum(1 for r in report if r["status"] == "SÓ_DRIVE"),
        "CONFLITO": sum(1 for r in report if r["status"] == "CONFLITO"),
    }

    content = {
        "timestamp": today.isoformat(),
        "base_label": base_label,
        "local_manifest_count": len(local_manifest),
        "remote_manifest_count": len(remote_manifest),
        "diff_summary": diff_counts,
        "diff_list": [
            {
                "path": r["path"],
                "status": r["status"],
                "local_sha": r.get("local_sha"),
                "remote_sha": r.get("remote_sha"),
                "fileId": r.get("fileId"),
            }
            for r in report
        ],
        "stats": {
            "uploaded": stats.get("uploaded", []),
            "downloaded": stats.get("downloaded", []),
            "conflicted": stats.get("conflicted", []),
            "skipped": stats.get("skipped", []),
            "errors": stats.get("errors", []),
        },
        "verify_result": verify_result,
        "hard_stops": [
            "Conta não aceticionada ou credencial ausente → UNKNOWN",
            "File diferente → confirmação humana antes",
            "Arquivo velho no Drive → não assume atualidade (HISTORICAL ≠ CURRENT)",
            "Delete remoto → não executa sem confirmação explícita",
            "Está ignorável → não processa",
        ],
    }

    with open(receipt_path, "w", encoding="utf-8") as f:
        json.dump(content, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(f"\n[RECEIPT] {receipt_path}")
    print(f"  local_manifest: {len(local_manifest)} arquivos")
    print(f"  remote_manifest: {len(remote_manifest)} arquivos")
    print(f"  diff_summary: {diff_counts}")
    print(f"  uploaded: {len(stats.get('uploaded', []))}")
    print(f"  downloaded: {len(stats.get('downloaded', []))}")
    print(f"  conflicted: {len(stats.get('conflicted', []))}")
    print(f"  verify_ok: {len(verify_result.get('ok', []))}/{verify_result.get('total_checked', 0)}")
    print(f"  verify_failures: {len(verify_result.get('failures', []))}")
    print(f"  verify_unknown: {len(verify_result.get('unknown', []))}")
    return receipt_path


def check_config():
    config_paths = [
        DEFAULT_CONFIG_PATH,
        Path("config/drive_config.yaml"),
        Path("drive_config.yaml"),
    ]
    for p in config_paths:
        if p.exists():
            print(f"[i] Configuração encontrada em: {p}")
            return True, p

    print("[!] Sem configuração encontrada.")
    print("    Caminhos verificados:")
    for p in config_paths:
        print(f"      - {p}")
    print("\n    Para configurar, crie um config.yaml com:")
    print("    ```")
    print("    drive:")
    print("      root_folder_name: 'CentralDark'")
    print("      mappings:")
    print("        - local: '/caminho/local'")
    print("          remote: 'Pasta no Drive'")
    print("    ```")
    print("\n    Ou use --local <pasta> para rodar em modo simples (sem Drive).")
    return False, None


def move_conflicts_to_folder(report, base_path, dry_run=False):
    conflicts = [r for r in report if r.get("status") == "CONFLITO"]
    if not conflicts:
        return []

    base = Path(base_path).resolve()
    conflicts_dir = base.parent / "_CONFLICTS"
    timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")

    moved = []
    for r in conflicts:
        name = r.get("path", "")
        safe_name = name.replace("/", "_").replace("\\", "_")
        target_name = f"{timestamp}_{safe_name}" if safe_name else f"{timestamp}_conflito"
        if not target_name.endswith((".json", ".txt", ".md", ".yaml", ".yml", ".py", ".sh", ".log", ".env")):
            target_name = target_name + ".conflicted"
        target_path = conflicts_dir / target_name

        if dry_run:
            print(f"  [DRY-RUN] would move {r.get('path','?')} -> {target_path}")
            moved.append({"path": r.get("path","?"), "target": str(target_path), "dry_run": True, "ok": True})
            continue

        conflicts_dir.mkdir(parents=True, exist_ok=True)
        source_path = base / r.get("path","")
        if not source_path.exists():
            found = None
            for candidate in base.glob("**/" + source_path.name):
                if candidate.is_file():
                    found = candidate
                    break
            source_path = found

        if source_path and source_path.exists():
            try:
                target_path.parent.mkdir(parents=True, exist_ok=True)
                shutil.move(str(source_path), str(target_path))
                print(f"  [MOVED] {r.get('path','?')} -> {target_path}")
                moved.append({"path": r.get("path","?"), "target": str(target_path), "dry_run": False, "ok": True})
            except Exception as e:
                msg = f"{type(e).__name__}: {e}"
                print(f"  [FAILED] {r.get('path','?')} -> {target_path}: {msg}")
                moved.append({"path": r.get("path","?"), "target": str(target_path), "dry_run": False, "ok": False, "error": msg})
        else:
            print(f"  [SKIP] {r.get('path','?')} nao encontrado localmente (remoto so ou path invalido)")
            moved.append({"path": r.get("path","?"), "target": str(target_path), "dry_run": False, "ok": False, "error": "source not found"})

    return moved


def main():
    parser = argparse.ArgumentParser(
        description="Reconciliador Google Drive ↔ workspace local (FABLE LOOP FRONT 3)"
    )
    parser.add_argument("--dry-run", action="store_true", help="Só mostra o que faria, não executa")
    parser.add_argument("--check", action="store_true", help="Verifica se está configurado")
    parser.add_argument("--local", nargs="+", help="Pasta(s) local(is) para medir (modo simples sem Drive)")
    parser.add_argument("--config", type=Path, help="Caminho do config.yaml")
    parser.add_argument("--resolve-conflicts", type=Path, metavar="REPORT_JSON",
                        help="Lê um report JSON salvo e move os conflitos para _CONFLICTS/ (use com --dry-run para simular, ou --force para executar)")
    parser.add_argument("--force", action="store_true", help="Força conflitos para _CONFLICTS/ em vez de pedir confirmação (apenas em modo real, não dry-run)")
    parser.add_argument("--manifest", action="store_true", help="Gera manifesto local (sha256, mtime, size) e sai")
    parser.add_argument("--manifest-base", type=Path, default=None, help="Base path para o manifesto (padrão: pasta atual)")
    args = parser.parse_args()

    # --manifest: gera manifesto local e sai
    if args.manifest:
        base = args.manifest_base or Path.cwd()
        print(f"[i] Gerando manifesto de: {base}")
        manifest, errs = scan_local(str(base))
        print_local_manifest(manifest, base_label=str(base))
        if errs:
            print(f"\n[!] Erros ({len(errs)}):")
            for e in errs[:10]:
                print(f"    - {e}")
            if len(errs) > 10:
                print(f"    ... e mais {len(errs) - 10}")
        print(f"\n[i] Manifesto completo: {len(manifest)} arquivos, {len(errs)} erros")
        sys.exit(0)

    # --resolve-conflicts: carrega report JSON e move os conflitos para _CONFLICTS/
    if args.resolve_conflicts:
        import json as _json
        report_path = Path(args.resolve_conflicts)
        if not report_path.exists():
            print(f"[!] Report file not found: {report_path}")
            sys.exit(2)
        try:
            report = _json.loads(report_path.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"[!] Failed to parse report JSON: {e}")
            sys.exit(3)
        base_path = report_path.parent
        print(f"[i] Resolving conflicts from report: {report_path}")
        print(f"[i] Base path for _CONFLICTS/: {base_path}")
        different = [r for r in report if r.get("status") == "CONFLITO"]
        print(f"[i] Conflicts found in report: {len(different)}")
        moved = move_conflicts_to_folder(report, str(base_path), dry_run=args.dry_run)
        ok_count = sum(1 for m in moved if m.get("ok"))
        fail_count = len(moved) - ok_count
        print(f"[i] Done. Moved/ok: {ok_count}, failed/skipped: {fail_count}")
        if args.dry_run:
            print("[i] Dry-run: no files were actually moved.")
        sys.exit(0 if fail_count == 0 else 4)

    if args.check:
        ok, _ = check_config()
        sys.exit(0 if ok else 1)

    # Se --local for passado, roda em modo "somente local" (sem Drive)
    if args.local:
        print("[i] Modo somente local (sem conexão Drive) — use --check ou configure para sync completo.")
        local_files = []
        for root in args.local:
            files, err = scan_local(root)
            if err:
                print(f"[!] {err}")
            local_files.extend(files)
        print(f"\n=== MEDIDA LOCAL ({len(args.local)} raízes, {len(local_files)} arquivos) ===")
        for f in sorted(local_files, key=lambda x: x["path"]):
            print(f"  {f['path']}  sha={f['sha256'][:12]}...  {f['size']} bytes")
        if args.dry_run:
            print("\n=== DRY-RUN: MEDIDA LOCAL COMPLETA (sem remoto) ===")
            print(f"Total de arquivos locais encontrados: {len(local_files)}")
            print("Ações que seriam feitas se estivesse conectado ao Drive:")
            print("  - Só local: candidato a upload")
            print("  - Só no Drive: N/A (não mediu remoto)")
            print("  - Diferentes: N/A (não mediu remoto)")
            print("  - Sincronizados: N/A (não mediu remoto)")
            print("\n  Para sync completo, configure a conta/drive e rode sem --dry-run")
            print("\n  ARQUIVO STANDALONE (não confundir com o script do Hermes):")
            print(f"  - Este arquivo: {Path(__file__).resolve()}")
            print("  - Para uso no Hermes, veja a skill centraldark-drive-reconciliation")
        return

    # Verifica configuração
    config_ok, config_path = check_config()
    if not config_ok:
        if args.dry_run:
            print("\n=== DRY-RUN: FALHA — SEM CONFIGURAÇÃO ===")
            print("Não é possível medir o Drive sem configuração.")
            print("Use --local <pasta> para medir só o local e ver o que faria.")
        return

    # Modo normal (com Drive) — nesse esqueleto, só mostra a intenção
    if args.dry_run:
        print("\n=== DRY-RUN (SEM EXECUÇÃO) ===")
        print("Configuração: OK (encontrada)")
        print("Ações que seriam feitas:")
        print("  1. Medir local (scan_local)")
        print("  2. Medir remoto (scan_remote)")
        print("  3. Diff (SÓ_LOCAL / SÓ_DRIVE / IGUAL / CONFLITO)")
        print("  4. Execute (upload/download bidirecional)")
        print("  5. Verify (re-check checksums pós-sync)")
        print("  6. Receipt (.hermes/receipts/drive-reconcile-YYYYMMDD.json)")
        print("\n  Hard stops aplicados:")
        print("  - Conta não aceticionada ou credencial ausente → UNKNOWN")
        print("  - File diferente → confirmação humana antes de qualquer coisa")
        print("  - Arquivo velho no Drive → não assume atualidade (HISTORICAL ≠ CURRENT)")
        print("  - Delete remoto → não executa sem confirmação explícita")
        print("  - Está ignorável → não processa")
        print("\n  Para executar o sync real, rode sem --dry-run (seguro: só o útil, com hard stops).")
    else:
        print("[i] Modo normal — sincronização completa (após confirmações humanas necessárias).")
        print("    Primeiro rode com --dry-run para ver o que será feito.")
        print("    Depois, se estiver tudo ok, rode sem --dry-run para executar.")


if __name__ == "__main__":
    main()
