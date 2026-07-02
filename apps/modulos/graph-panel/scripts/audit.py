#!/usr/bin/env python3
import json
import pathlib
from datetime import datetime
ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
graph = json.loads((DATA / "graph.json").read_text()) if (DATA / "graph.json").exists() else {"nodes": [], "edges": []}
blocked = [".env", "secrets/", "tokens/", "sessions/", ".ssh/", ".pem", ".key"]
hits = [n.get("id", "") for n in graph.get("nodes", []) if any(b in n.get("id", "") for b in blocked)]
status = "atenção" if hits else "ok"
(DATA / "audit.md").write_text(f"# Auditoria do último run\n\n- Status: {status}.\n- Nós: {len(graph.get('nodes', []))}\n- Ligações: {len(graph.get('edges', []))}\n- Caminhos sensíveis encontrados: {len(hits)}\n- Verificado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}\n")
print({"ok": not hits, "sensitive_hits": len(hits)})
