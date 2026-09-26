# COMANDO - create_basic_plugin.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\.agents\skills\plugin-creator\scripts\create_basic_plugin.py
**SHA:** 93d5c2ad186eccdc
**Timestamp:** 2026-08-26T18:31:04.375283
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- DEFAULT_MARKETPLACE_DISPLAY_NAME = "[TODO: Marketplace Display Name]"
- "version": "[TODO: 1.2.0]",
- "description": "[TODO: Brief plugin description]",
- "name": "[TODO: Author Name]",
- "email": "[TODO: author@example.com]",
- "url": "[TODO: https://github.com/author]",
- "homepage": "[TODO: https://docs.example.com/plugin]",
- "repository": "[TODO: https://github.com/author/plugin]",
- "license": "[TODO: MIT]",
- "keywords": ["[TODO: keyword1]", "[TODO: keyword2]"],

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Scaffold a plugin directory and optionally update marketplace.json."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any


MAX_PLUGIN_NAME_LENGTH = 64
DEFAULT_PLUGIN_PARENT = Path.home() / "plugins"
DEFAULT_MARKETPLACE_PATH = Path.home() / ".agents" / "plugins" / "marketplace.json"
DEFAULT_INSTALL_POLICY = "AVAILABLE"
DEFAULT_AUTH_POLICY = "ON_INSTALL"
DEFAULT_CATEGORY = "Productivity"
DEFAULT_MARKETPLACE_DISPLAY_NAME = "[TODO: Marketplace Display Name]"
VALID_INSTALL_POLICIES = {"NOT_AVAILABLE", "AVAILABLE", "INSTALLED_BY_DEFAULT"}
VALID_AUTH_POLICIES = {"ON_INSTALL", "ON_USE"}


def normalize_plugin_name(plugin_name: str) -> str:
    """Normalize a plugin name to lowercase hyphen-case."""
    normalized = plugin_name.strip().lower()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    normalized = normalized.strip("-")
    normalized = re.sub(r"-{2,}", "-", normalized)
    return normalized


def validate_plugin_name(plugin_name: str) -> None:
    if not plugin_name:
        raise ValueError("Plugin name must include at least one letter or digit.")
    if len(plugin_name) > MAX_PLUGIN_NAME_LENGTH:
        raise ValueError(
            f"Plugin name '{plugin_name}' is too long ({len(plugin_name)} characters). "
            f"Maximum is {MAX_PLUGIN_NAME_LENGTH} characters."
        )


def build_plugin_json(plugin_name: str) -> dict:
    return {
        "name": plugin_name,
        "version": "[TODO: 1.2.0]",
        "description": "[TODO: Brief plugin description]",
        "author": {
            "name": "[TODO: Author Name]",
            "email": "[TODO: author@example.com]",
            "url": "[TODO: https://github.com/author]",
        },
        "homepage": "[TODO: https://docs.example.com/plugin]",
        "repository": "[TODO: https://github.com/author/plugin]",
        "license": "[TODO: MIT]",
        "keywords": ["[TODO: keyword1]", "[TODO: keyword2]"],
        "skills": "[TODO: ./skills/]",
        "hooks": "[TODO: ./hooks.json]",
        "mcpServers": "[TODO: ./.mcp.json]",
        "apps": "[TODO: ./.app.json]",
        "interface": {
            "displayName": "[TODO: Plugin Display Name]",
            "shortDescription": "[TODO: Short description for subtitle]",
            "longDescription": "[TODO: Long description for details page]",
            "developerName": "[TODO: OpenAI]",
            "category": "[TODO: Productivity]",
            "capabilities": ["[TODO: Interactive]", "[TODO: Write]"],
            "websiteURL": "[TODO: https://openai.com/]",
            "privacyPolicyURL": "[TODO: https://openai.com/policies/row-privacy-policy/]",
            "termsOfServiceURL": "[TODO: https://openai.com/policies/row-terms-of-use/]",
            "defaultPrompt": [
                "[TODO: Summarize my inbox and draft replies for me.]",
                "[TODO: Find open bugs and turn them into tickets.]",
                "[TODO: Review today's meetings and flag gaps.]",
            ],
            "brandColor": "[TODO: #3B82F6]",
            "composerIcon": "[TODO: ./assets/icon.png]",
            "logo": "[TODO: ./assets/logo.png]",
            "screenshots": [
                "[TODO: ./assets/screenshot1.png]",
                "[TODO: ./assets/screenshot2.png]",
                "[TODO: ./assets/screenshot3.png]",
            ],
        },
    }


def build_marketplace_entry(
    plugin_name: str,
    install_policy: str,
    auth_policy: str,
    category: str,
) -> dict[str, Any]:
    return {
        "name": plugin_name,
        "source": {
            "source": "local",
            "path": f"./plugins/{plugin_name}",
        },
        "policy": {
            "installation": install_policy,
            "authentication": auth_policy,
        },
        "category": category,
    }


def load_json(path: Path) -> dict[str, Any]:
    with path.open() as handle:
        return json.load(handle)


def build_default_marketplace() -> dict[str, Any]:
    return {
        "name": "[TODO: marketplace-name]",
        "interface": {
            "displayName": DEFAULT_MARKETPLACE_DISPLAY_NAME,
        },
        "plugins": [],
    }


def validate_marketplace_interface(payload: dict[str, Any]) -> None:
    interface = payload.get("interface")
    if interface is not None and not isinstance(interface, dict):
        raise ValueError("marketplace.json field 'interface' must be an object.")


def update_marketplace_json(
    marketplace_path: Path,
    plugin_name: str,
    install_policy: str,
    auth_policy: str,
    category: str,
    force: bool,
) -> None:
    if marketplace_path.exists():
        payload = load_json(marketplace_path)
    else:
        payload = build_default_marketplace()

    if not isinstance(payload, dict):
        raise ValueError(f"{marketplace_path} must contain a JSON object.")

    validate_marketplace_interface(payload)

    plugins = payload.setdefault("plugins", [])
   
```