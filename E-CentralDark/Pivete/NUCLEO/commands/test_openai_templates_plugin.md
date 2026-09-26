# COMANDO - test_openai_templates_plugin.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\plugins\cache\openai-curated-remote\openai-templates\0.1.1\tests\test_openai_templates_plugin.py
**SHA:** e2250e07a0e9f24e
**Timestamp:** 2026-08-26T18:42:53.231700
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- assert f'default_prompt: "Create a new {kind} with this template."' in metadata

### Ouro Bruto (primeiros 5000 chars)
```
from __future__ import annotations

import hashlib
import io
import json
import re
import struct
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

REPO_ROOT = Path(__file__).resolve().parents[3]
PLUGIN_ROOT = REPO_ROOT / "plugins" / "openai-templates"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
ZIP_SIGNATURE = b"PK\x03\x04"
MAX_PREVIEW_EDGE_PX = 800
MAX_PLUGIN_ARCHIVE_BYTES = 26 * 1024 * 1024
MAX_PLUGIN_ARCHIVE_ENTRIES = 5_000
EXPECTED_BINARY_ASSET_SET_SHA256 = (
    "ee1a1469054c77c71dd54a5bc36122fa679a9b639daddf51f20a057fcafac136"
)
TEMPLATES = (
    (
        "artifact-template-analytics-dashboard",
        "Analytics Dashboard",
        "spreadsheet",
        "xlsx",
    ),
    ("artifact-template-business-review", "Business Review", "presentation", "pptx"),
    (
        "artifact-template-design-report",
        "Design Report",
        "document",
        "docx",
    ),
    (
        "artifact-template-experiment-analysis",
        "Experiment Analysis",
        "document",
        "docx",
    ),
    (
        "artifact-template-financial-budget",
        "Financial Budget",
        "spreadsheet",
        "xlsx",
    ),
    (
        "artifact-template-investment-committee-memo",
        "Investment Committee Memo",
        "document",
        "docx",
    ),
    ("artifact-template-legal-memorandum", "Legal Memorandum", "document", "docx"),
    (
        "artifact-template-market-trends-report",
        "Market Trends Report",
        "presentation",
        "pptx",
    ),
    (
        "artifact-template-minimal-letterhead",
        "Minimal Letterhead",
        "document",
        "docx",
    ),
    (
        "artifact-template-operating-calendar",
        "Operating Calendar",
        "spreadsheet",
        "xlsx",
    ),
    (
        "artifact-template-operating-review",
        "Operating Review",
        "presentation",
        "pptx",
    ),
    (
        "artifact-template-project-kickoff",
        "Project Kickoff",
        "presentation",
        "pptx",
    ),
    ("artifact-template-project-tracker", "Project Tracker", "spreadsheet", "xlsx"),
    ("artifact-template-sales-pipeline", "Sales Pipeline", "spreadsheet", "xlsx"),
    (
        "artifact-template-simple-dark-mode",
        "Simple Dark Mode",
        "presentation",
        "pptx",
    ),
    (
        "artifact-template-simple-light-mode",
        "Simple Light Mode",
        "presentation",
        "pptx",
    ),
    (
        "artifact-template-strategy-memorandum",
        "Strategy Memorandum",
        "document",
        "docx",
    ),
    ("artifact-template-system-design", "System Design", "document", "docx"),
    (
        "artifact-template-team-alignment",
        "Team Alignment",
        "presentation",
        "pptx",
    ),
    (
        "artifact-template-three-statement-forecast",
        "Three-Statement Forecast",
        "spreadsheet",
        "xlsx",
    ),
)


def test_openai_templates_plugin_contract() -> None:
    manifest = json.loads((PLUGIN_ROOT / ".codex-plugin" / "plugin.json").read_text())
    app_manifest = json.loads((PLUGIN_ROOT / ".app.json").read_text())
    marketplace = json.loads((REPO_ROOT / "marketplace.json").read_text())

    assert manifest["name"] == "openai-templates"
    assert manifest["skills"] == "./skills/"
    assert manifest["apps"] == "./.app.json"
    assert manifest["interface"]["displayName"] == "Default templates"
    assert manifest["interface"]["shortDescription"] == (
        "Default templates for documents, spreadsheets, and presentations"
    )
    assert manifest["interface"]["defaultPrompt"] == [
        "Create a document using the Minimal Letterhead template",
        "Create an Analytics Dashboard spreadsheet using the Analytics Dashboard template",
        "Create a planning presentation with the Team Alignment template",
    ]
    assert app_manifest == {
        "apps": {
            "default_templates": {
                "id": "connector_openai_default_templates",
                "required": True,
            },
        }
    }
    assert {
        "name": "openai-templates",
        "source": {
            "source": "local",
            "path": "./plugins/openai-templates",
        },
        "policy": {
            "installation": "AVAILABLE",
            "authentication": "ON_USE",
        },
        "category": "Productivity",
    } in marketplace["plugins"]


def test_openai_templates_are_packaged_for_chatgpt() -> None:
    package_files = sorted(
        path
        for path in PLUGIN_ROOT.rglob("*")
        if path.is_file() and "__pycache__" not in path.parts and path.suffix != ".pyc"
    )
    assert len(package_files) < MAX_PLUGIN_ARCHIVE_ENTRIES

    archive_buffer = io.BytesIO()
    with ZipFile(archive_buffer, "w", compression=ZIP_DEFLATED) as archive:
        for path in package_files:
            archive.write(path, path.relative_to(PLUGIN_ROOT))
    assert archive_buffer.tell() < MAX_PLUGIN_ARCH
```