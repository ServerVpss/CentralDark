# AGENTE - content_agent_client.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-cad-to-simready\references\content-agents\scripts\content_agent_client.py
**SHA:** 21aafc0e4b830d2b
**Timestamp:** 2026-08-26T18:31:15.230202
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- if args.prompt:
- if args.prompt:
- if args.prompt:
- if args.prompt:

### Gaps
- required_missing = [artifact for artifact in artifacts if artifact["required"] and not artifact["downloaded"]]
- if agent_key == "physics" and args.convert_output_to_usd and not required_missing:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

from __future__ import annotations

import argparse
from email.message import Message
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen
import uuid

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "shared"))

from script_utils import check_result as _check, emit_json_report

from content_agent_material_cleanup import cleanup_material_output
from preflight_manifest import load_preflight_manifest, preflight_required, preflight_status_check, ready_service_url


USD_EXTENSIONS = {".usd", ".usda", ".usdc", ".usdz"}
USD_LAYER_EXTENSIONS = {".usd", ".usda", ".usdc"}
TERMINAL_SUCCESS = {"completed", "complete", "succeeded", "success", "done"}
TERMINAL_FAILURE = {"failed", "failure", "cancelled", "canceled", "error"}
MATERIAL_ZERO_IMAGE_MARKERS = (
    "rendering produced 0 images",
    "build_dataset_usd",
)
PHYSICS_OPTIMIZER_FAILURE_MARKERS = (
    "optimize_usd",
    "scene optimizer",
    "local backend unavailable",
    "optimizer_endpoint",
    "nvcf_optimizer_function_id",
)
SCENE_OPTIMIZER_PERMISSION_MARKERS = (
    "permission denied",
    "/app/.build-resources/scene_optimizer_core/python",
)
PHYSICS_SCENE_OPTIMIZER_CONTAINER_CANDIDATES = (
    "content-physics-agent-service",
    "pash-e2e-physics_agent_service",
    "physics_agent_service",
)
MDL_UPLOAD_PREP_SNIPPET = r"""
import json
import shutil
import sys
from pathlib import Path

from pxr import Sdf, Usd

asset_path = Path(sys.argv[1]).resolve()
label = sys.argv[2] if len(sys.argv) > 2 else "content_agents"
info = {
    "staged": False,
    "path": str(asset_path),
    "stripped_mdl_source_assets": 0,
    "cleared_unresolved_service_asset_paths": 0,
    "warning": None,
}

def is_unresolved_service_asset_path(path: str) -> bool:
    lower = path.lower()
    return ".usdz[" in lower and lower.startswith(
        (
            "/var/material-agent/sessions/",
            "/var/physics-agent/sessions/",
            "/var/texture-agent/sessions/",
        )
    )

stage = Usd.Stage.Open(str(asset_path))
if stage is None:
    info["warning"] = f"Could not inspect {label} upload USD for MDL source assets"
    print(json.dumps(info))
    raise SystemExit(0)
mdl_attr_count = 0
service_asset_path_count = 0
for prim in stage.Traverse():
    for attr in prim.GetAttributes():
        try:
            value = attr.Get()
        except Exception:
            continue
        if not isinstance(value, Sdf.AssetPath):
            continue
        path = str(value.path)
        if path.lower().endswith(".mdl"):
            mdl_attr_count += 1
        elif is_unresolved_service_asset_path(path):
            service_asset_path_count += 1
if mdl_attr_count == 0 and service_asset_path_count == 0:
    print(json.dumps(info))
    raise SystemExit(0)
staged_path = asset_path.with_name(f"{asset_path.stem}_{label}_upload{asset_path.suffix.lower()}")
if staged_path.exists():
    staged_path.unlink()
shutil.copy2(asset_path, staged_path)
staged = Usd.Stage.Open(str(staged_path))
if staged is None:
    raise RuntimeError(f"Could not open staged {label} upload USD: {staged_path}")
stripped = 0
cleared_service_paths = 0
for prim in staged.Traverse():
    for attr in prim.GetAttributes():
        try:
            value = attr.Get()
        except Exception:
            continue
        if not isinstance(value, Sdf.AssetPath):
            continue
        path = str(value.path)
        if path.lower().endswith(".mdl"):
            attr.Clear()
            stripped += 1
        elif is_unresolved_service_asset_path(path):
            attr.Clear()
            cleared_service_paths += 1
if (stripped or cleared_service_paths) and not staged.GetRootLayer().Save():
    raise RuntimeError(f"Could not save staged {label} upload USD: {staged_path}")
info.update(
    {
        "staged": True,
        "path": str(staged_path.resolve()),
        "stripped_mdl_source_assets": stripped,
        "cleared_unresolved_service_asset_paths": cleared_service_paths,
        "source_path": str(asset_path),
    }
)
print(json.dumps(info))
"""
USD_TOPOLOGY_INSPECTION_SNIPPET = r"""
import json
import sys
from pathlib import Path

from pxr import Usd, UsdGeom

asset_path = Path(sys.argv[1]).resolve()
result = {
    "inspected": False,
    "reason": None,
    "default_prim_path": None,
    "mesh_count": 0,
    "geom_subset_count": 0,
    "mesh_with_geom_subset_count": 0,
    "instance_count": 0,
    "instance_proxy_count": 0,
    "prototype_count": 0,
    "has_composed_component_topology": False,
    "component_topology_reasons": [],
}
stage = Usd.Stage.Open(str(asset_path))
if stage is None:
    result["reason"] = "Could not open USD stage"
   
```