# CONTRATO - preflight.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-cad-to-simready\references\preflight\scripts\preflight.py
**SHA:** 112232a81374a1be
**Timestamp:** 2026-08-26T18:33:16.808628
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- "message": f"checkout is missing: {path}",
- "message": "checkout is present" if present else f"checkout is missing: {path}",

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

"""Prepare local cad-to-simready dependencies and write a preflight manifest.

Usage:
    python3 scripts/preflight.py [--check-only]
    python3 scripts/preflight.py --report preflight.json --env-file preflight.env

Arguments:
    --check-only              Verify local readiness without cloning, installing, or deploying.
    --skip-content-agents     Do not verify or deploy Content Agents services.
    --skip-deploy             Verify Content Agents endpoints but do not start services.
    --report PATH             Write the preflight manifest JSON.
    --env-file PATH           Write shell exports for downstream references.
    --powershell-env-file PATH
                              Write PowerShell env assignments for downstream references.
    --markdown-report PATH    Write a human-readable readiness report.

Exit codes:
    0 - dependencies and services are ready or explicitly skipped
    1 - one or more dependencies or services are blocked
    2 - unexpected error (crash or malformed input)
"""

from __future__ import annotations

import argparse
import base64
from dataclasses import dataclass, field
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse, urlunparse
from urllib.request import Request, urlopen

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "shared"))

from script_utils import tail_text
from usd_convert_cad_diagnostics import summarize_usd_convert_cad_validation_failure


SKILL = "cad-to-simready-preflight"
SCHEMA_VERSION = "1.0"
DEFAULT_TARGETS = ("conversion", "validation", "content-agents")
SECRET_NAME_PARTS = ("KEY", "TOKEN", "SECRET", "PASSWORD")
DEFAULT_SERVICE_URLS = {
    "ovrtx": "http://localhost:8001",
    "material": "http://localhost:8100",
    "physics": "http://localhost:8200",
    "texture": "http://localhost:8300",
}
SMOKE_CAMERA_TRANSLATE_X = 3
SMOKE_CAMERA_TRANSLATE_Y = 3
SMOKE_CAMERA_TRANSLATE_Z = 3
SMOKE_CAMERA_ROTATE_X = -30
SMOKE_CAMERA_ROTATE_Y = 45
SMOKE_CAMERA_ROTATE_Z = 0
SMOKE_LIGHT_ROTATE_X = -45
SMOKE_LIGHT_ROTATE_Y = 30
SMOKE_LIGHT_ROTATE_Z = 0
SMOKE_CAMERA_TRANSLATE = f"{SMOKE_CAMERA_TRANSLATE_X}, {SMOKE_CAMERA_TRANSLATE_Y}, {SMOKE_CAMERA_TRANSLATE_Z}"
SMOKE_CAMERA_ROTATE = f"{SMOKE_CAMERA_ROTATE_X}, {SMOKE_CAMERA_ROTATE_Y}, {SMOKE_CAMERA_ROTATE_Z}"
SMOKE_LIGHT_ROTATE = f"{SMOKE_LIGHT_ROTATE_X}, {SMOKE_LIGHT_ROTATE_Y}, {SMOKE_LIGHT_ROTATE_Z}"
OVRTX_RENDER_SMOKE_USDA_TEMPLATE = """#usda 1.0
(
    defaultPrim = "World"
    metersPerUnit = 1
    upAxis = "Y"
)

def Xform "World"
{
    def Cube "Cube"
    {
        double size = 1
    }

    def Camera "Camera"
    {
        float focalLength = 35
        float horizontalAperture = 36
        float verticalAperture = 36
        float2 clippingRange = (0.1, 1000)
        double3 xformOp:translate = (__SMOKE_CAMERA_TRANSLATE__)
        float3 xformOp:rotateXYZ = (__SMOKE_CAMERA_ROTATE__)
        uniform token[] xformOpOrder = ["xformOp:translate", "xformOp:rotateXYZ"]
    }

    def DistantLight "KeyLight"
    {
        float intensity = 5000
        float3 xformOp:rotateXYZ = (__SMOKE_LIGHT_ROTATE__)
        uniform token[] xformOpOrder = ["xformOp:rotateXYZ"]
    }
}
"""
OVRTX_RENDER_SMOKE_USDA = (
    OVRTX_RENDER_SMOKE_USDA_TEMPLATE.replace("__SMOKE_CAMERA_TRANSLATE__", SMOKE_CAMERA_TRANSLATE)
    .replace("__SMOKE_CAMERA_ROTATE__", SMOKE_CAMERA_ROTATE)
    .replace("__SMOKE_LIGHT_ROTATE__", SMOKE_LIGHT_ROTATE)
)
CONTENT_AGENTS_SECRET_ENV_NAMES = (
    "NVIDIA_API_KEY",
    "NGC_API_KEY",
    "NVCF_API_KEY",
    "NSTORAGE_API_KEY",
    "INFERENCE_NVIDIA_API_KEY",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "GOOGLE_API_KEY",
    "GEMINI_API_KEY",
    "MA_NVIDIA_API_KEY",
    "MA_NSTORAGE_API_KEY",
    "MA_IMAGE_GEN_API_KEY",
    "MA_CLUSTER_EMBEDDING_API_KEY",
    "MA_NIM_API_KEY",
    "PA_NVIDIA_API_KEY",
    "PA_NSTORAGE_API_KEY",
    "PA_NIM_API_KEY",
    "TA_IMAGE_GEN_API_KEY",
)
SIMREADY_RUNTIME_EXTRA_REQUIREMENTS = ("numpy>=1.24,<3",)
DEFAULT_SIMREADY_VALIDATE_REQUIREMENT = "simready-validate>=2026.4.8"
USD_EXCHANGE_SDK_FALLBACK_REQUIREMENTS = (
    "usd-exchange>=2.3.0",
    "omniverse-asset-validator",
    "omniverse-usd-profiles>=1.10.22",
)
DEFAULT_CONVERSION_TOOLS = {
    "repo-python",
    "usd-convert-cad",
    "usd-convert-gsplat",
}
UV_INSTALL_HINT = "Install uv with: curl -LsSf https://astral.sh/uv/install.sh | sh"
OPENUSD_IMPORT_CHECK = "from pxr import Usd, UsdGeom, UsdPhysics; print(Usd.GetVersion())"
ASSET_VALIDATOR_IMPORT_CHECK = "import omni.asset_validator"
USD_SUFFIXES = {".usd", ".usda", ".usdc", ".usdz"}
REPO_PYTHON_SOURCE_FORMATS = {"urdf", "mjcf", "mujoco"}
CAD_SOURCE_SUFFIXES = {
    ".3dm",
    "
```