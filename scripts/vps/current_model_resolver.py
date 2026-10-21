#!/usr/bin/env python3
"""Resolve the CURRENT local worker model without making model names architecture.

Precedence: explicit per-run override -> current Kylin selection -> Hermes custom
provider fallback. The selected model is frozen by each caller for one request/lote.
"""
from __future__ import annotations

import ast
import json
import os
import re
import subprocess
import time
from pathlib import Path

DEFAULT_HERMES_CONFIG = "/root/.hermes/config.yaml"
DEFAULT_STATE_FILE = "/root/CentralDark/logs/model-binding-current.json"
_PROVIDER_NAME = "centraldark-kylin"
_KYLIN_SCHEMAS = (
    "com.kylin.aisdk.model.cloud",
    "com.kylin.aisdk.model.ondevice",
    "com.kylin.aisdk.model.custom",
    "com.kylin.aisdk.model.shared",
)
_SESSION_ENV_KEYS = (
    "DBUS_SESSION_BUS_ADDRESS",
    "XDG_RUNTIME_DIR",
    "DISPLAY",
    "XAUTHORITY",
)


def inherit_kylin_runtime_environment(proc_root: Path = Path("/proc")) -> dict[str, str]:
    """Recover the session environment from the same-user Kylin runtime.

    A system service does not inherit the graphical/session D-Bus environment.
    Without it, ``gsettings`` reads an empty binding and the native SDK can fail
    during session initialization. Only missing, allow-listed variables are
    copied, and only from a ``kylin-ai-runtime`` process owned by this uid.
    """
    if os.environ.get("DBUS_SESSION_BUS_ADDRESS") and os.environ.get("XDG_RUNTIME_DIR"):
        return {}

    try:
        entries = sorted((p for p in proc_root.iterdir() if p.name.isdigit()), key=lambda p: int(p.name))
    except OSError:
        return {}

    uid = os.getuid()
    for entry in entries:
        try:
            if entry.stat().st_uid != uid:
                continue
            command = (entry / "cmdline").read_bytes().replace(b"\0", b" ").decode("utf-8", "replace")
            if "kylin-ai-runtime" not in command:
                continue
            values = {}
            for item in (entry / "environ").read_bytes().split(b"\0"):
                if b"=" not in item:
                    continue
                key, value = item.split(b"=", 1)
                name = key.decode("ascii", "ignore")
                if name in _SESSION_ENV_KEYS and value:
                    values[name] = value.decode("utf-8", "replace")
            if not values.get("DBUS_SESSION_BUS_ADDRESS") or not values.get("XDG_RUNTIME_DIR"):
                continue
            inherited = {}
            for name, value in values.items():
                if not os.environ.get(name):
                    os.environ[name] = value
                    inherited[name] = value
            return inherited
        except (OSError, ValueError):
            continue
    return {}

def _execution_class(source: str) -> str:
    if source.startswith("gsettings:"):
        for kind in ("cloud", "ondevice", "custom", "shared"):
            if f".model.{kind}." in source:
                return kind
    if source.startswith("env:"):
        return "override"
    if source.startswith("hermes-config:"):
        return "catalog"
    return "unknown"

def _env_model() -> str | None:
    value = os.environ.get("CENTRALDARK_LOCAL_MODEL", "").strip()
    return value or None

def _gsettings_get(schema: str, key: str) -> str:
    try:
        return subprocess.run(
            ["gsettings", "get", schema, key],
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL,
            text=True, timeout=2, check=True,
        ).stdout.strip()
    except Exception:
        return ""

def _gvariant_string(raw: str) -> str:
    if not raw:
        return ""
    try:
        value = ast.literal_eval(raw)
        return value if isinstance(value, str) else str(value)
    except Exception:
        return raw.strip("'\"")

def _kylin_current() -> dict | None:
    candidates = []
    for schema in _KYLIN_SCHEMAS:
        enabled = _gsettings_get(schema, "enabled").lower() == "true"
        try:
            priority = int(_gsettings_get(schema, "priority") or 999)
        except ValueError:
            priority = 999
        raw = _gvariant_string(_gsettings_get(schema, "nlp"))
        model = ""
        if raw:
            try:
                model = str(json.loads(raw).get("currentModel") or "").strip()
            except Exception:
                pass
        if enabled and model:
            candidates.append({"model": model, "priority": priority, "source": f"gsettings:{schema}.nlp"})
    return min(candidates, key=lambda x: x["priority"]) if candidates else None

def _config_model(path: Path) -> str | None:
    if not path.is_file():
        return None
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    in_provider = False
    in_models = False
    provider_indent = None
    models_indent = None
    for line in lines:
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        indent = len(line) - len(line.lstrip(" "))
        if re.match(r"-\s+name:\s*" + re.escape(_PROVIDER_NAME) + r"\s*$", stripped):
            in_provider, in_models, provider_indent = True, False, indent
            continue
        if in_provider and provider_indent is not None and indent <= provider_indent and not stripped.startswith("-"):
            in_provider, in_models = False, False
        if not in_provider:
            continue
        if stripped == "models:":
            in_models, models_indent = True, indent
            continue
        if in_models and models_indent is not None and indent <= models_indent:
            in_models = False
        if in_models:
            match = re.match(r"([A-Za-z0-9._:/-]+):(?:\s+.*)?$", stripped)
            if match:
                return match.group(1)
    return None

def _persist(details: dict) -> None:
    raw = os.environ.get("CENTRALDARK_MODEL_BINDING_STATE", DEFAULT_STATE_FILE)
    if raw.lower() in {"", "off", "none"}:
        return
    try:
        p = Path(raw)
        p.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "schema": "centraldark.model-binding.v1",
            "observed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "local_worker": details,
            "rules": {
                "model_name_is_binding": True,
                "resolve_at_lote_start": True,
                "mid_lote_swap": False,
                "resolve_again_next_lote": True,
            },
        }
        p.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")
        os.chmod(p, 0o600)
    except Exception:
        pass

def resolve_current_model_details() -> dict:
    inherit_kylin_runtime_environment()
    model = _env_model()
    if model:
        source = "env:CENTRALDARK_LOCAL_MODEL"
        details = {"model": model, "source": source, "execution_class": _execution_class(source), "priority": -1}
        _persist(details)
        return details
    current = _kylin_current()
    if current:
        current["execution_class"] = _execution_class(current["source"])
        _persist(current)
        return current
    config_path = Path(os.environ.get("HERMES_CONFIG", DEFAULT_HERMES_CONFIG))
    model = _config_model(config_path)
    if model:
        source = f"hermes-config:{_PROVIDER_NAME}.models"
        details = {"model": model, "source": source, "execution_class": _execution_class(source), "priority": 999}
        _persist(details)
        return details
    raise RuntimeError(
        "CURRENT_LOCAL_MODEL_UNRESOLVED: no explicit override, no enabled Kylin currentModel, "
        f"and no {_PROVIDER_NAME}.models entry in {config_path}"
    )

def resolve_current_model() -> str:
    return resolve_current_model_details()["model"]

if __name__ == "__main__":
    print(resolve_current_model())
