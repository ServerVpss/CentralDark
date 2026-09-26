#!/usr/bin/env python3
"""
monitor_screenpipe.py — monitora pastas e logs do Screenpipe em tempo real.

O que ele faz:
- Espia as pastas do Screenpipe (.screenpipe/*) a cada N segundos
- Detecta arquivos novos, modificados, removidos
- Mostra timestamp + nome + caminho + tamanho da mudança
- Registra um log local com o histórico de mudanças
- Sai com Ctrl+C

Uso:
    python monitor_screenpipe.py [--interval 5] [--log-dir DIR]

Dependências: Python 3 padrão (os, time, datetime, hashlib — nada externo)
"""

import os
import sys
import time
import hashlib
import argparse
from datetime import datetime
from pathlib import Path


def sha256_file(path: Path) -> str:
    """Hash SHA256 de arquivo — none se não existir."""
    try:
        h = hashlib.sha256()
        with open(path, "rb") as f:
            while True:
                chunk = f.read(8192)
                if not chunk:
                    break
                h.update(chunk)
        return h.hexdigest()
    except (FileNotFoundError, PermissionError):
        return None


def scan_tree(root: Path) -> dict:
    """
    Retorna dicionário {relativo:path_absoluta: sha256}
    Ignora diretórios vazios e arquivos não-lidos.
    """
    snapshot = {}
    if not root.exists():
        return snapshot
    for p in root.rglob("*"):
        if p.is_file():
            try:
                rel = str(p.relative_to(root))
                sha = sha256_file(p)
                if sha is not None:
                    snapshot[rel] = sha
            except (PermissionError, OSError):
                pass
    return snapshot


def diff_snapshots(
    before: dict, after: dict, root: Path
) -> list[dict]:
    """
    Compara dois snapshots e retorna lista de eventos:
    - added:     arquivo novo
    - modified: hash mudou (arquivo alterado)
    - removed:   arquivo sumiu
    """
    events = []
    ts = datetime.now().isoformat()

    before_set = set(before.keys())
    after_set = set(after.keys())

    # Adicionados
    for name in sorted(after_set - before_set):
        abs_path = root / name
        size = abs_path.stat().st_size if abs_path.exists() else 0
        events.append({
            "event": "added",
            "time": ts,
            "name": name,
            "abs_path": str(abs_path),
            "size_bytes": size,
            "old_hash": None,
            "new_hash": after.get(name),
        })

    # Modificados
    for name in sorted(before_set & after_set):
        if before[name] != after[name]:
            abs_path = root / name
            size = abs_path.stat().st_size if abs_path.exists() else 0
            events.append({
                "event": "modified",
                "time": ts,
                "name": name,
                "abs_path": str(abs_path),
                "size_bytes": size,
                "old_hash": before.get(name),
                "new_hash": after.get(name),
            })

    # Removidos
    for name in sorted(before_set - after_set):
        events.append({
            "event": "removed",
            "time": ts,
            "name": name,
            "abs_path": str(root / name),
            "size_bytes": 0,
            "old_hash": before.get(name),
            "new_hash": None,
        })

    return events


def format_event(ev: dict) -> str:
    """Formata um evento para saída legível."""
    etype = ev["event"]
    arrow = {
        "added": "➕",
        "modified": "✏️",
        "removed": "➖",
    }.get(etype, "?")

    if etype == "removed":
        return f"[{ev['time']}] {arrow} REMOVIDO  {ev['name']}"

    size_mb = ev["size_bytes"] / (1024 * 1024) if ev["size_bytes"] > 0 else 0
    size_str = f"{size_mb:.2f}MB" if size_mb >= 0.01 else f"{ev['size_bytes']}B"

    if ev["old_hash"] and ev["new_hash"]:
        return (
            f"[{ev['time']}] {arrow} ALTERADO {ev['name']}"
            f"  ({size_str})"
            f"  hash:{ev['old_hash'][:12]}... → {ev['new_hash'][:12]}..."
        )

    return (
        f"[{ev['time']}] {arrow} NOVO     {ev['name']}"
        f"  ({size_str})"
        f"  hash:{ev['new_hash'][:12]}..."
    )


def write_log(log_path: Path, events: list[dict]) -> None:
    """Anexa eventos ao arquivo de log."""
    if not events:
        return
    with open(log_path, "a", encoding="utf-8") as f:
        for ev in events:
            f.write(format_event(ev) + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Monitora pastas do Screenpipe em tempo real"
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=5.0,
        help="Intervalo entre varreduras em segundos (default: 5)",
    )
    parser.add_argument(
        "--log-dir",
        type=str,
        default=None,
        help="Diretório do log de mudanças (default: ~/screenpipe-monitor)",
    )
    parser.add_argument(
        "--watch",
        type=str,
        nargs="+",
        default=None,
        help="Caminhos para monitorar (default: detecta ~/.screenpipe)",
    )
    args = parser.parse_args()

    # Detecta caminhos padrão do Screenpipe
    home = Path.home()
    candidates = [
        home / ".screenpipe",
        Path("C:/Users/danda/.screenpipe"),
    ]

    watch_roots = []
    if args.watch:
        for w in args.watch:
            watch_roots.append(Path(w))
    else:
        for c in candidates:
            if c.exists():
                watch_roots.append(c)

    if not watch_roots:
        print(f"[ERRO] Nenhuma pasta do Screenpipe encontrada.")
        print(f"Tentou: {candidates}")
        print(f"Use --watch /c/Users/danda/.screenpipe para forçar.")
        sys.exit(1)

    # Preparar log
    log_dir = Path(args.log_dir) if args.log_dir else home / "screenpipe-monitor"
    log_dir.mkdir(parents=True, exist_ok=True)
    log_file = log_dir / "monitor-changes.log"

    # Snapshot inicial
    print(f"\n🕵️ Monitor Screenpipe")
    print(f"   Pastas observadas: {[str(r) for r in watch_roots]}")
    print(f"   Intervalo: {args.interval}s")
    print(f"   Log: {log_file}")
    print(f"   Pressione Ctrl+C para parar.\n")

    snapshots = {}
    for root in watch_roots:
        snapshots[root] = scan_tree(root)
        count = len(snapshots[root])
        print(f"   [{root.name}] snapshot inicial: {count} arquivo(s)")

    try:
        while True:
            time.sleep(args.interval)
            for root in watch_roots:
                new_snapshot = scan_tree(root)
                if not new_snapshot and not snapshots[root]:
                    continue

                events = diff_snapshots(snapshots[root], new_snapshot, root)
                if events:
                    write_log(log_file, events)
                    for ev in events:
                        print(format_event(ev))
                        # info extra de onde veio / pra onde foi
                        if ev["event"] == "added":
                            print(f"         →  novo arquivo detectado em {ev['abs_path']}")
                        elif ev["event"] == "modified":
                            print(f"         ← arquivo modificado (hash divergiu)")
                            print(f"         ← antes: {ev['old_hash'][:16]}")
                            print(f"         → agora: {ev['new_hash'][:16]}")
                        elif ev["event"] == "removed":
                            print(f"         ✗ arquivo removido de {ev['abs_path']}")

                    # resumo
                    added = sum(1 for e in events if e["event"] == "added")
                    modified = sum(1 for e in events if e["event"] == "modified")
                    removed = sum(1 for e in events if e["event"] == "removed")
                    print(f"         📊 resumo: +{added}  ~{modified}  -{removed}\n")

                snapshots[root] = new_snapshot
    except KeyboardInterrupt:
        print(f"\n\n⏹ Monitoramento parado pelo usuário.")
        print(f"   Log salvo em: {log_file}")
        print(f"   Total de eventos registrados: ", end="")
        if log_file.exists():
            with open(log_file, "r", encoding="utf-8") as f:
                lines = [l for l in f if l.strip()]
            print(f"{len(lines)}")
        else:
            print("0")
        sys.exit(0)


if __name__ == "__main__":
    main()
