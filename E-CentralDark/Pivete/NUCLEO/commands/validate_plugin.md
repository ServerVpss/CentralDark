# COMANDO - validate_plugin.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py
**SHA:** ebda00d55d7518b1
**Timestamp:** 2026-08-26T18:42:56.211230
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- default_prompt = interface.get("default_prompt")

### Gaps
- TODO_MARKER = "[TODO:"
- errors.append(f"{path} still contains a `[TODO: ...]` placeholder")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Validate a generated plugin against the plugin ingestion contract."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import urlparse

import yaml


TODO_MARKER = "[TODO:"
SEMVER_RE = re.compile(
    r"^(0|[1-9]\d*)\."
    r"(0|[1-9]\d*)\."
    r"(0|[1-9]\d*)"
    r"(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\."
    r"(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?"
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$"
)
HEX_COLOR_RE = re.compile(r"^#[0-9A-F]{6}$", re.IGNORECASE)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate a local Codex plugin.")
    parser.add_argument("plugin_path", help="Path to the plugin root directory")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    plugin_root = Path(args.plugin_path).expanduser().resolve()
    errors = validate_plugin(plugin_root)
    if errors:
        print("Plugin validation failed:")
        for error in errors:
            print(f"- {error}")
        raise SystemExit(1)
    print(f"Plugin validation passed: {plugin_root}")


def validate_plugin(plugin_root: Path) -> list[str]:
    errors: list[str] = []
    manifest_path = plugin_root / ".codex-plugin" / "plugin.json"
    manifest = load_json_object(manifest_path, errors)
    if manifest is None:
        return errors

    reject_todo_markers(manifest, "$", errors)
    validate_manifest_shape(plugin_root, manifest, errors)
    return errors


def load_json_object(path: Path, errors: list[str]) -> dict[str, Any] | None:
    if not path.is_file():
        errors.append("missing `.codex-plugin/plugin.json`")
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except OSError:
        errors.append("unable to read `.codex-plugin/plugin.json`")
        return None
    except json.JSONDecodeError:
        errors.append("`.codex-plugin/plugin.json` must be valid JSON")
        return None
    if not isinstance(payload, dict):
        errors.append("`.codex-plugin/plugin.json` must contain a JSON object")
        return None
    return payload


def reject_todo_markers(value: Any, path: str, errors: list[str]) -> None:
    if isinstance(value, str):
        if TODO_MARKER in value:
            errors.append(f"{path} still contains a `[TODO: ...]` placeholder")
        return
    if isinstance(value, list):
        for index, item in enumerate(value):
            reject_todo_markers(item, f"{path}[{index}]", errors)
        return
    if isinstance(value, dict):
        for key, item in value.items():
            reject_todo_markers(item, f"{path}.{key}", errors)


def validate_manifest_shape(
    plugin_root: Path,
    manifest: dict[str, Any],
    errors: list[str],
) -> None:
    allowed_keys = {
        "id",
        "name",
        "version",
        "description",
        "skills",
        "apps",
        "mcpServers",
        "interface",
        "author",
        "homepage",
        "repository",
        "license",
        "keywords",
    }
    for key in sorted(set(manifest) - allowed_keys):
        errors.append(f"plugin.json field `{key}` is not accepted by plugin validation")

    validate_optional_non_empty_string(manifest, "id", errors)
    require_non_empty_string(manifest, "name", errors)
    version = require_non_empty_string(manifest, "version", errors)
    if version is not None and SEMVER_RE.fullmatch(version) is None:
        errors.append("plugin.json field `version` must be strict semver")
    require_non_empty_string(manifest, "description", errors)

    author = require_object(manifest, "author", errors)
    if author is not None:
        reject_unknown_fields(author, {"name", "email", "url"}, "author", errors)
        require_non_empty_string(author, "name", errors, prefix="author")
        validate_optional_non_empty_string(author, "email", errors, prefix="author")
        validate_optional_https_url(author, "url", errors, prefix="author")

    validate_optional_contract_path(manifest, "skills", "skills", errors)
    validate_optional_contract_path(manifest, "apps", ".app.json", errors)
    validate_manifest_mcp_servers(plugin_root, manifest, errors)

    if manifest.get("apps") is not None:
        validate_app_manifest(
            plugin_root / ".app.json",
            errors,
        )
    validate_skill_manifests(plugin_root, errors)

    interface = require_object(manifest, "interface", errors)
    if interface is None:
        return
    reject_unknown_fields(
        interface,
        {
            "displayName",
            "shortDescription",
            "longDescription",
            "developerName",
            "category",
            "capabilities",
            "websiteURL",
            "privacyPolicyURL",
            "termsOfServiceURL",
            "brandColor",
            "composerIcon",
            "logo",
         
```