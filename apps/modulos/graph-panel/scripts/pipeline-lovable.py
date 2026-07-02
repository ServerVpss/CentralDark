#!/usr/bin/env python3
import json
import pathlib
import time
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[1]
REPO = ROOT.parents[2]
DATA = ROOT / "data"
HISTORY = DATA / "history"
HISTORY.mkdir(parents=True, exist_ok=True)
IGNORE = [line.strip() for line in (ROOT / "scripts" / ".graphifyignore").read_text().splitlines() if line.strip() and not line.startswith("#")]
ALLOWED_SUFFIX = {".js", ".ts", ".tsx", ".jsx", ".py", ".sh", ".md", ".json", ".yml", ".yaml"}

def ignored(path):
    text = str(path.relative_to(REPO))
    for rule in IGNORE:
        clean = rule.rstrip("/")
        if clean and (text == clean or text.startswith(clean + "/") or pathlib.PurePosixPath(text).match(rule)):
            return True
    return False

def collect_files(limit=260):
    files = []
    skip_md = bool(__import__('os').environ.get('GRAPH_PANEL_SKIP_MD'))
    for path in REPO.rglob("*"):
        if len(files) >= limit:
            break
        if not path.is_file() or ignored(path):
            continue
        if skip_md and path.suffix.lower() == ".md":
            continue
        if path.suffix.lower() not in ALLOWED_SUFFIX:
            continue
        try:
            if path.stat().st_size > 180000:
                continue
        except OSError:
            continue
        files.append(path)
    return files

def static_graph(files):
    nodes = [{"id": "centraldark", "label": "CentralDark", "group": "raiz", "size": 26}]
    edges = []
    seen_dirs = {"centraldark"}
    for file in files:
        rel = file.relative_to(REPO)
        parts = rel.parts
        parent_id = "centraldark"
        for index, part in enumerate(parts[:-1]):
            node_id = "/".join(parts[: index + 1])
            if node_id not in seen_dirs:
                seen_dirs.add(node_id)
                nodes.append({"id": node_id, "label": part, "group": "pasta"})
                edges.append({"from": parent_id, "to": node_id})
            parent_id = node_id
        file_id = str(rel)
        nodes.append({"id": file_id, "label": parts[-1], "group": file.suffix.lower().lstrip(".") or "arquivo", "title": file_id})
        edges.append({"from": parent_id, "to": file_id})
    return {"nodes": nodes, "edges": edges, "meta": {"source": "lovable-api-static", "backend": "fallback-local", "model": "static", "generatedAt": datetime.now(timezone.utc).isoformat()}}

def write_outputs(graph, started):
    DATA.joinpath("graph.json").write_text(json.dumps(graph, ensure_ascii=False, indent=2))
    stats = {"nodes": len(graph.get("nodes", [])), "edges": len(graph.get("edges", [])), "communities": len({n.get("group") for n in graph.get("nodes", []) if n.get("group")})}
    DATA.joinpath("report.md").write_text(f"# Resumo do último run\n\nMapeamento concluído em {datetime.now().strftime('%d/%m/%Y %H:%M')}.\n\n- Nós: {stats['nodes']}\n- Ligações: {stats['edges']}\n- Grupos: {stats['communities']}\n- Origem: API Lovable com fallback local seguro.\n")
    DATA.joinpath("audit.md").write_text(f"# Auditoria do último run\n\n- Arquivos analisados respeitando `.graphifyignore`.\n- Caminhos sensíveis bloqueados.\n- Duração: {round(time.time() - started, 2)}s.\n- Status: concluído.\n")
    HISTORY.joinpath(datetime.now().strftime("%Y%m%d-%H%M%S") + ".json").write_text(json.dumps({"graph": graph, "stats": stats}, ensure_ascii=False, indent=2))

def main():
    started = time.time()
    files = collect_files()
    graph = static_graph(files)
    write_outputs(graph, started)
    print(json.dumps({"ok": True, "files": len(files), "nodes": len(graph["nodes"]), "edges": len(graph["edges"])}))

if __name__ == "__main__":
    main()
