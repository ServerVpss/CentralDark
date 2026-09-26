# COMANDO - run_scrnaseq_post_count_qc.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\scripts\run_scrnaseq_post_count_qc.py
**SHA:** 756a4f72cd01c75f
**Timestamp:** 2026-08-26T18:31:12.852279
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dry_run={"ok": False, "detail": "input validation failed"},
- dry_run={"ok": False, "detail": "Python dependency preflight failed"},
- dry_run={"ok": True, "detail": "matrix and metadata validation completed"},

### Gaps
- missing = []
- summary["errors"].append(f"required file missing: {path}")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Run matrix-level scRNA post-count QC with raw-count preservation and auditable artifacts."""

from __future__ import annotations

import argparse
import importlib.metadata
import importlib.util
import json
import os
import shutil
import subprocess
import tempfile
from datetime import datetime
from pathlib import Path
from textwrap import dedent
from typing import Any

SCRIPT_PATH = Path(__file__).resolve()
PLUGIN_ROOT = SCRIPT_PATH.parents[1]
WORKSPACE_ROOT = Path.cwd()


def configure_runtime_environment() -> dict[str, str]:
    runtime_root = (
        Path(os.environ.get("NGS_ANALYSIS_RUNTIME_ROOT", tempfile.gettempdir()))
        / "ngs-analysis-runtime"
        / "scrnaseq-post-count"
    )
    dirs = {
        "runtime_root": runtime_root,
        "mplconfig": runtime_root / "matplotlib",
        "xdg_cache": runtime_root / "xdg_cache",
        "xdg_state": runtime_root / "xdg_state",
        "numba_cache": runtime_root / "numba",
    }
    for path in dirs.values():
        path.mkdir(parents=True, exist_ok=True)
    os.environ.setdefault("MPLCONFIGDIR", str(dirs["mplconfig"]))
    os.environ.setdefault("XDG_CACHE_HOME", str(dirs["xdg_cache"]))
    os.environ.setdefault("XDG_STATE_HOME", str(dirs["xdg_state"]))
    os.environ.setdefault("NUMBA_CACHE_DIR", str(dirs["numba_cache"]))
    os.environ.setdefault("LOKY_MAX_CPU_COUNT", str(os.cpu_count() or 1))
    return {key: str(value) for key, value in dirs.items()}


RUNTIME_ENV = configure_runtime_environment()


def patch_numba_cache_decorators() -> None:
    try:
        import numba  # type: ignore
    except ImportError:
        return

    def wrap_strip_cache(fn: Any) -> Any:
        def wrapped(*args: Any, **kwargs: Any) -> Any:
            kwargs.pop("cache", None)
            return fn(*args, **kwargs)

        return wrapped

    for name in ("jit", "njit", "vectorize", "guvectorize", "cfunc"):
        if hasattr(numba, name):
            setattr(numba, name, wrap_strip_cache(getattr(numba, name)))


patch_numba_cache_decorators()

from ngs_run_utils import build_artifact_index, write_standard_manifest  # noqa: E402
from ngs_visualization_utils import (  # noqa: E402
    artifact_entry,
    copy_visual_asset,
    launch_marimo_review_app,
    write_marimo_review_notebook,
    write_visualization_index,
)

PYTHON_ANALYSIS_MODULES = {
    "anndata": "anndata",
    "matplotlib": "matplotlib",
    "numpy": "numpy",
    "pandas": "pandas",
    "scanpy": "scanpy",
}
REQUIRED_R_PACKAGES = ("DropletUtils", "scDblFinder", "SoupX")

ad: Any = None
matplotlib: Any = None
plt: Any = None
np: Any = None
pd: Any = None
sc: Any = None


def python_dependency_status() -> dict[str, Any]:
    modules = {}
    missing = []
    for module_name, package_name in PYTHON_ANALYSIS_MODULES.items():
        try:
            present = importlib.util.find_spec(module_name) is not None
        except (ImportError, AttributeError, ValueError):
            present = False
        modules[module_name] = {"present": present, "package": package_name}
        if not present:
            missing.append(module_name)
    return {
        "ok": not missing,
        "python_modules": modules,
        "missing": missing,
        "errors": ["Missing Python analysis packages: " + ", ".join(missing)] if missing else [],
    }


def installed_package_version(package_name: str) -> str | None:
    try:
        return importlib.metadata.version(package_name)
    except importlib.metadata.PackageNotFoundError:
        return None


def load_analysis_modules() -> dict[str, Any]:
    status = python_dependency_status()
    if not status["ok"]:
        return status

    global ad, matplotlib, np, pd, plt, sc

    import anndata as ad_module  # type: ignore[import-not-found]
    import matplotlib as matplotlib_module  # type: ignore[import-not-found]
    import numpy as np_module
    import pandas as pd_module
    import scanpy as sc_module  # type: ignore[import-not-found]

    matplotlib_module.use("Agg")
    import matplotlib.pyplot as plt_module  # type: ignore[import-not-found]

    ad = ad_module
    matplotlib = matplotlib_module
    np = np_module
    pd = pd_module
    plt = plt_module
    sc = sc_module
    for module_name, loaded_module in {
        "anndata": ad,
        "matplotlib": matplotlib,
        "numpy": np,
        "pandas": pd,
        "scanpy": sc,
    }.items():
        package_name = PYTHON_ANALYSIS_MODULES[module_name]
        status["python_modules"][module_name]["version"] = installed_package_version(
            package_name
        ) or getattr(loaded_module, "__version__", None)
    return status


def now_iso() -> str:
    return datetime.now().astimezone().isoformat(timespec="seconds")


def slug_timestamp() -> str:
    return datetime.now().strftime("%Y-%m-%dT%H-%M-%S-scrnaseq-post-count-qc")


def write_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, inden
```