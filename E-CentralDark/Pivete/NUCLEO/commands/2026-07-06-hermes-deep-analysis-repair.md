# COMANDO - 2026-07-06-hermes-deep-analysis-repair.md
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_agi-self-improvement-main\agi-self-improvement-main\docs\superpowers\plans\2026-07-06-hermes-deep-analysis-repair.md
**SHA:** 89eb7cef56293c9d
**Timestamp:** 2026-08-26T19:43:45.410742
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Run: `~/.venvs/hermes/bin/pytest tests/test_task_queue.py -v`
- Run: `~/.venvs/hermes/bin/pytest tests/test_task_queue.py -v`
- Run: `~/.venvs/hermes/bin/pytest tests/test_vector_memory.py -v`
- Run: `~/.venvs/hermes/bin/pytest tests/test_vector_memory.py tests/test_task_queue.py -v`
- Run: `~/.venvs/hermes/bin/pytest tests/test_semantic_clustering.py -v`
- Run: `~/.venvs/hermes/bin/pytest tests/ -v`
- Run: `~/.venvs/hermes/bin/pytest tests/test_mcp_protocol.py -v`
- Run: `~/.venvs/hermes/bin/pytest tests/ -v`
- Run: `~/.venvs/hermes/bin/pytest tests/test_memory_synthesizer.py -v`
- Run: `~/.venvs/hermes/bin/pytest tests/ -v`

### Ouro Bruto (primeiros 5000 chars)
```
# Hermes Deep Analysis & Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Hermes module actually run, fix all identified defects with tests, then improve efficiency — finishing with a knowledge-graph dashboard.

**Architecture:** Hermes is a file-backed multi-agent scaffold: `vector_memory/` (ChromaDB + Ollama embeddings), `mcp/` (file-queue message protocol), `tasks/` (JSON task queue), `agents/memory_synthesizer.py` (consumer agent), `memory_dashboard/` (HTML + exporter + HTTP server). Fixes keep this architecture; no rewrites.

**Tech Stack:** Python 3.11+, ChromaDB, ollama client, numpy, scikit-learn, pytest. hdbscan/umap-learn are optional (code has fallbacks; tests must pass without them and without Ollama running).

## Global Constraints

- Repo root: `/Users/kevin/Library/CloudStorage/OneDrive-Personal/AI/Hermes/self` — all commands run from here unless stated.
- Virtualenv lives OUTSIDE OneDrive at `~/.venvs/hermes`. Python binary: `~/.venvs/hermes/bin/python`, pytest: `~/.venvs/hermes/bin/pytest`.
- Never modify or delete anything under `memory/vector_db/` (live data).
- Tests must not require Ollama to be running, or hdbscan/umap-learn to be installed.
- All list-valued metadata going into ChromaDB must be serialized (comma-joined string for tags, JSON string for id lists) — ChromaDB only accepts str/int/float/bool.
- Commit after every task with a descriptive message.

---

### Task 1: Environment setup + baseline audit

**Files:**
- Create: `~/.venvs/hermes` (venv, outside repo)
- Create: `requirements.txt`
- Create: `tests/__init__.py` (empty)
- Create: `conftest.py` (empty — makes repo root importable by pytest)

**Interfaces:**
- Produces: working venv all later tasks use via `~/.venvs/hermes/bin/python`.

- [ ] **Step 1: Create venv and requirements.txt**

`requirements.txt`:
```
chromadb>=0.5
ollama>=0.3
numpy>=1.26
scikit-learn>=1.4
pytest>=8
```

```bash
python3 -m venv ~/.venvs/hermes
~/.venvs/hermes/bin/pip install -r requirements.txt
```
Expected: install succeeds.

- [ ] **Step 2: Baseline import audit**

```bash
cd "/Users/kevin/Library/CloudStorage/OneDrive-Personal/AI/Hermes/self"
~/.venvs/hermes/bin/python -c "import vector_memory; import mcp.protocol; import tasks.task_queue; import agents.memory_synthesizer" 
```
Expected: may fail or warn — record exact output in commit message body. (agents/ has no `__init__.py`; import via `python agents/memory_synthesizer.py --help` style instead if needed. Record what happens.)

- [ ] **Step 3: Create empty `tests/__init__.py` and `conftest.py`, commit**

```bash
git add requirements.txt tests/__init__.py conftest.py
git commit -m "chore: add venv requirements and test scaffolding; record baseline audit"
```

---

### Task 2: Anchor all filesystem paths to the repo root

**Files:**
- Modify: `tasks/task_queue.py:38-39`
- Modify: `mcp/protocol.py:102, 289`
- Modify: `memory_dashboard/schedule_memory_export.py:24-26`
- Modify: `vector_memory/vector_memory.py:67, 72-73, 293`
- Test: `tests/test_task_queue.py`

**Interfaces:**
- Produces: every module works regardless of CWD. `tasks.task_queue.TASKS_DIR` remains a module-level `Path` (tests monkeypatch it).

- [ ] **Step 1: Write failing test**

`tests/test_task_queue.py`:
```python
import json
from tasks import task_queue


def test_create_claim_complete_cycle(tmp_path, monkeypatch):
    monkeypatch.setattr(task_queue, "TASKS_DIR", tmp_path)
    tid = task_queue.create_task("full_synthesis", source="test", payload={"x": 1})
    pending = task_queue.list_pending_tasks()
    assert [t["id"] for t in pending] == [tid]
    assert task_queue.claim_task(tid) is True
    assert task_queue.claim_task(tid) is False  # already claimed
    assert task_queue.complete_task(tid, {"ok": True}) is True
    task = task_queue.get_task(tid)
    assert task["status"] == "completed"
    assert task["result"] == {"ok": True}
    assert task_queue.list_pending_tasks() == []


def test_pending_tasks_sorted_oldest_first(tmp_path, monkeypatch):
    monkeypatch.setattr(task_queue, "TASKS_DIR", tmp_path)
    ids = [task_queue.create_task(f"t{i}") for i in range(3)]
    # Force distinct created_at ordering
    for i, tid in enumerate(ids):
        p = tmp_path / f"{tid}.json"
        t = json.loads(p.read_text())
        t["created_at"] = 100 + i
        p.write_text(json.dumps(t))
    pending = task_queue.list_pending_tasks()
    assert [t["id"] for t in pending] == ids


def test_tasks_dir_is_absolute():
    assert task_queue.TASKS_DIR.is_absolute()
```

- [ ] **Step 2: Run to verify failure**

Run: `~/.venvs/hermes/bin/pytest tests/test_task_queue.py -v`
Expected: `test_tasks_dir_is_absolute` FAILS (`Path("tasks")` is relative). Others should pass.

- [ ] **Step 3: Anchor paths**

`tasks/task_queue
```