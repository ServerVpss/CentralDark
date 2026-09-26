# OUTRO - run.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-cad-to-simready\references\assemble-package-source\scripts\run.py
**SHA:** 903198a72157f3c9
**Timestamp:** 2026-08-26T18:31:37.825216
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- checks.append(_check("root_usd_assembled", root_usd_path.is_file(), f"Assembled root USD: {root_usd_path}" if root_usd_path.is_file() else f"Assembled root USD is missing: {root_usd_path}"))
- checks.append(_check("thumbnail_assembled", thumbnail_target.is_file(), f"Assembled thumbnail: {thumbnail_target}" if thumbnail_target.is_file() else f"Assembled thumbnail is missing: {thumbnail_targe

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import shutil
import sys
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[3] / "shared"))

from script_utils import check_result_with_code as _check


USD_SUFFIXES = {".usd", ".usda", ".usdc"}
TEXTURE_SUFFIXES = {".png", ".jpg", ".jpeg", ".exr", ".tif", ".tiff", ".bmp", ".tga"}
URI_PREFIXES = ("http://", "https://", "omniverse://", "s3://", "ngc://", "mdl://")


def _normalize_asset_name(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    normalized = re.sub(r"_+", "_", normalized)
    return normalized or "asset"


def _is_uri(value: str) -> bool:
    lower = value.lower()
    return lower.startswith(URI_PREFIXES) or "://" in lower


def _resolve_authored_path(source_layer_path: Path, authored_path: str) -> Path | None:
    if not authored_path or _is_uri(authored_path):
        return None
    if "[" in authored_path and "]" in authored_path:
        return None
    path = Path(authored_path)
    if not path.is_absolute():
        path = source_layer_path.parent / path
    try:
        return path.resolve()
    except OSError:
        return path


def _safe_relative_to(path: Path, base: Path) -> Path | None:
    try:
        rel = path.resolve().relative_to(base.resolve())
    except (OSError, ValueError):
        return None
    if any(part == ".." for part in rel.parts):
        return None
    return rel


def _anchored_relative(from_dir: Path, target: Path) -> str:
    try:
        rel = Path(os.path.relpath(target.resolve(), from_dir.resolve()))
    except OSError:
        rel = Path(os.path.relpath(target, from_dir))
    value = rel.as_posix()
    if not value.startswith((".", "/")):
        value = f"./{value}"
    return value


def _file_same(left: Path, right: Path) -> bool:
    if not left.exists() or not right.exists():
        return False
    return left.stat().st_size == right.stat().st_size and left.read_bytes() == right.read_bytes()


def _copy_with_collision(source: Path, destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and _file_same(source, destination):
        return destination
    target = destination
    counter = 1
    while target.exists() and not _file_same(source, target):
        target = destination.with_name(f"{destination.stem}_{counter}{destination.suffix}")
        counter += 1
    shutil.copy2(source, target)
    return target


def _layer_identifier(layer: Any) -> str:
    return str(getattr(layer, "realPath", None) or getattr(layer, "identifier", "") or "")


def _source_layers(final_usd: Path) -> list[Path]:
    from pxr import UsdUtils

    layers: list[Path] = [final_usd.resolve()]
    try:
        dependency_layers, _, _ = UsdUtils.ComputeAllDependencies(str(final_usd))
    except Exception:
        return layers
    for layer in dependency_layers:
        identifier = _layer_identifier(layer)
        if not identifier:
            continue
        path = Path(identifier)
        if not path.is_file():
            continue
        resolved = path.resolve()
        if resolved not in layers:
            layers.append(resolved)
    return layers


def _target_layer_path(source_layer: Path, final_usd: Path, simready_root: Path, root_usd_name: str) -> Path:
    if source_layer.resolve() == final_usd.resolve():
        return simready_root / root_usd_name
    source_root = final_usd.resolve().parent
    rel = _safe_relative_to(source_layer, source_root)
    if rel is None or rel.name == final_usd.name:
        rel = Path("layers") / source_layer.name
    return simready_root / rel


def _target_asset_path(source_asset: Path, final_usd: Path, simready_root: Path) -> Path:
    suffix = source_asset.suffix.lower()
    source_root = final_usd.resolve().parent
    rel = _safe_relative_to(source_asset, source_root)
    if suffix == ".mdl":
        return simready_root / "materials" / source_asset.parent.name / source_asset.name
    if suffix in TEXTURE_SUFFIXES:
        if rel is not None and "textures" in rel.parts:
            index = rel.parts.index("textures")
            return simready_root.joinpath(*rel.parts[index:])
        return simready_root / "textures" / source_asset.name
    if suffix in USD_SUFFIXES:
        if rel is not None:
            return simready_root / rel
        return simready_root / "layers" / source_asset.name
    if rel is not None:
        return simready_root / rel
    return simready_root / "assets" / source_asset.name


def _iter_prim_specs(prim_spec: Any) -> Any:
    yield prim_spec
    for child in prim_spec.nameChildren:
        yield from _iter_prim_specs(child)


def _rewrite_asset_path_value(
    *,
    value: Any,
    source_layer_
```

---

# OUTRO - run.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\scripts\sentinela\run.mjs
**SHA:** dbb6fd15895505ff
**Timestamp:** 2026-08-26T19:32:52.961911
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const DRY_RUN = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';
- // === Run ===

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
// Sentinela 24/7 — varre divergências e abre Issues com dedupe.
// Read-only no repo/VPS (não toca em produção). Usa apenas HTTPS público + gh CLI.

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const DRY_RUN = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';
const REPO = process.env.REPO_ALVO || 'ServerVpss/CentralDark';
const SNAPSHOT_DIR = 'docs/sentinela';
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'last-snapshot.json');
const REPORT_FILE = path.join(SNAPSHOT_DIR, 'last-report.md');

mkdirSync(SNAPSHOT_DIR, { recursive: true });

const ENDPOINTS = [
  { name: 'MCP health', url: 'https://mcp.centralldark.com/health', bot: 'grok' },
  { name: 'MCP status', url: 'https://mcp.centralldark.com/status.json', bot: 'grok' },
  { name: 'MCP tools', url: 'https://mcp.centralldark.com/tools.json', bot: 'codex' },
  { name: 'Install status', url: 'https://install.centralldark.com/status.json', bot: 'lovable' },
  { name: 'Painel', url: 'https://status.centralldark.com/', bot: 'lovable' },
  { name: 'API', url: 'https://api.centralldark.com/health', bot: 'codex' },
];

const divergencias = [];

async function checkEndpoint(ep) {
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(ep.url, { signal: ctrl.signal });
    clearTimeout(to);
    const dt = Date.now() - t0;
    const cors = r.headers.get('access-control-allow-origin');
    return { ...ep, status: r.status, latencyMs: dt, cors };
  } catch (e) {
    return { ...ep, status: 0, latencyMs: Date.now() - t0, error: String(e.message || e) };
  }
}

function hash(s) {
  return createHash('sha1').update(s).digest('hex').slice(0, 10);
}

function ghIssueExists(titleHash) {
  try {
    const out = execSync(
      `gh issue list -R "${REPO}" --state open --search "in:title sentinela-${titleHash}" --json number,title --limit 5`,
      { encoding: 'utf8' }
    );
    const arr = JSON.parse(out);
    return arr.find((i) => i.title.includes(titleHash));
  } catch {
    return null;
  }
}

function ghOpenIssue({ title, body, labels }) {
  if (DRY_RUN) return { number: 0, dry: true };
  const labelArgs = labels.map((l) => `--label "${l}"`).join(' ');
  const tmpBody = path.join('/tmp', `sent-${Date.now()}.md`);
  writeFileSync(tmpBody, body);
  try {
    const out = execSync(
      `gh issue create -R "${REPO}" --title "${title.replace(/"/g, '\\"')}" --body-file "${tmpBody}" ${labelArgs}`,
      { encoding: 'utf8' }
    );
    const m = out.match(/\/issues\/(\d+)/);
    return { number: m ? Number(m[1]) : 0 };
  } catch (e) {
    return { error: String(e.message || e) };
  }
}

function ensureLabels() {
  if (DRY_RUN) return;
  const labels = [
    ['sentinela', 'B60205', 'Aberta automaticamente pela sentinela'],
    ['auto', 'CCCCCC', 'Criada por bot'],
    ['p1', 'FF0000', 'Alta prioridade'],
    ['p2', 'FFA500', 'Média'],
    ['p3', 'FFFF00', 'Baixa'],
    ['assign:codex', '5319E7', 'Bot responsável: Codex'],
    ['assign:supabase-bot', '3ECF8E', 'Bot responsável: Supabase'],
    ['assign:lovable', 'FF80B0', 'Bot responsável: Lovable'],
    ['assign:grok', '1F6FEB', 'Bot responsável: Grok'],
    ['assign:chatgpt', '10A37F', 'Bot responsável: ChatGPT'],
    ['stale', '6E6E6E', 'Passou do TTL'],
  ];
  for (const [name, color, desc] of labels) {
    try {
      execSync(`gh label create "${name}" -R "${REPO}" -c "${color}" -d "${desc}" --force`, { stdio: 'ignore' });
    } catch {}
  }
}

// === Checks ===

async function checkEndpoints() {
  const out = await Promise.all(ENDPOINTS.map(checkEndpoint));
  for (const r of out) {
    if (r.status >= 200 && r.status < 400) continue;
    divergencias.push({
      area: 'Endpoints',
      bot: r.bot,
      sev: r.status === 0 ? 'p1' : 'p2',
      titulo: `Endpoint ${r.name} fora do ar (HTTP ${r.status})`,
      detalhe: `URL: ${r.url}\nStatus: ${r.status}\nLatência: ${r.latencyMs}ms\nErro: ${r.error || '-'}`,
    });
  }
  // CORS check
  for (const r of out) {
    if (r.url.includes('mcp.centralldark.com') && r.status >= 200 && r.status < 400 && !r.cors) {
      divergencias.push({
        area: 'CORS',
        bot: 'grok',
        sev: 'p2',
        titulo: `MCP sem CORS no painel: ${r.name}`,
        detalhe: `${r.url} responde 200 mas não envia Access-Control-Allow-Origin. O painel status.centralldark.com não consegue ler.`,
      });
    }
  }
  return out;
}

async function checkWorkflowsRuins() {
  try {
    const out = execSync(
      `gh run list -R "${REPO}" --status failure --created ">=$(date -u -d '-24 hours' +%Y-%m-%dT%H:%M:%SZ)" --json name,databaseId,conclusion,headBranch --limit 20`,
      { encoding: 'utf8' }
    );
    const arr = JSON.parse(out);
    for (const r of arr) {
      divergencias.push({
        area: 'Workflows'
```

---

# OUTRO - run.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\sentinela\run.mjs
**SHA:** 7313d917ce78addb
**Timestamp:** 2026-08-28T02:57:39.035007
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const DRY_RUN = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
// Sentinela 24/7 — varre divergências e abre Issues com dedupe.
// Read-only no repo/VPS (não toca em produção). Usa apenas HTTPS público + gh CLI.
// Labels são consumidas do catálogo canônico; este script nunca recria aliases legados.

import { execSync, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { evaluateDrift, toDivergencia, describeRecovery } from './drift.mjs';

const DRY_RUN = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';
const REPO = process.env.REPO_ALVO || 'ServerVpss/CentralDark';
const SNAPSHOT_DIR = 'docs/sentinela';
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'last-snapshot.json');
const REPORT_FILE = path.join(SNAPSHOT_DIR, 'last-report.md');

const CANONICAL = Object.freeze({
  sentinela: '🛡️ SENTINELA',
  auto: '🤖 AUTO',
  p1: '🔴 PRIORIDADE-ALTA',
  p2: '🟡 PRIORIDADE-MÉDIA',
  p3: '🟢 PRIORIDADE-BAIXA',
  stale: '🧊 PARADO',
  codex: '🧠 AGENTE-CODEX',
  supabase: '🧠 AGENTE-SUPABASE',
  claude: '🧠 AGENTE-CLAUDE',
  grok: '🧠 AGENTE-GROK',
  chatgpt: '🧠 AGENTE-CHATGPT',
});

function severityLabel(sev) {
  return CANONICAL[sev] || CANONICAL.p2;
}

function agentLabel(bot) {
  return CANONICAL[String(bot || '').toLowerCase()] || CANONICAL.codex;
}

mkdirSync(SNAPSHOT_DIR, { recursive: true });

const previousSnapshot = existsSync(SNAPSHOT_FILE)
  ? JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8'))
  : null;

const ENDPOINTS = [
  { name: 'MCP health', url: 'https://mcp.centralldark.com/health', bot: 'grok' },
  { name: 'MCP status', url: 'https://mcp.centralldark.com/status.json', bot: 'grok' },
  { name: 'MCP tools', url: 'https://mcp.centralldark.com/tools.json', bot: 'codex' },
  { name: 'Install status', url: 'https://install.centralldark.com/status.json', bot: 'claude' },
  { name: 'Painel', url: 'https://status.centralldark.com/', bot: 'claude' },
  { name: 'API', url: 'https://api.centralldark.com/health', bot: 'codex' },
];

const divergencias = [];

async function checkEndpoint(ep) {
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(ep.url, { signal: ctrl.signal });
    clearTimeout(to);
    const dt = Date.now() - t0;
    const cors = r.headers.get('access-control-allow-origin');
    return { ...ep, status: r.status, latencyMs: dt, cors };
  } catch (e) {
    return { ...ep, status: 0, latencyMs: Date.now() - t0, error: String(e.message || e) };
  }
}

function hash(s) {
  return createHash('sha1').update(s).digest('hex').slice(0, 10);
}

function ghIssueExists(titleHash) {
  try {
    const out = execSync(
      `gh issue list -R "${REPO}" --state open --json number,title --limit 1000`,
      { encoding: 'utf8' }
    );
    const arr = JSON.parse(out);
    return arr.find((i) => i.title.includes(`sentinela-${titleHash}`));
  } catch {
    return null;
  }
}

function ghOpenIssue({ title, body, labels }) {
  if (DRY_RUN) return { number: 0, dry: true };
  const labelArgs = labels.map((l) => `--label "${l}"`).join(' ');
  const tmpBody = path.join('/tmp', `sent-${Date.now()}.md`);
  writeFileSync(tmpBody, body);
  try {
    const out = execSync(
      `gh issue create -R "${REPO}" --title "${title.replace(/"/g, '\\"')}" --body-file "${tmpBody}" ${labelArgs}`,
      { encoding: 'utf8' }
    );
    const m = out.match(/\/issues\/(\d+)/);
    return { number: m ? Number(m[1]) : 0 };
  } catch (e) {
    return { error: String(e.message || e) };
  }
}

// === Checks ===

async function checkEndpoints() {
  const out = await Promise.all(ENDPOINTS.map(checkEndpoint));
  for (const r of out) {
    if (r.status >= 200 && r.status < 400) continue;
    divergencias.push({
      area: 'Endpoints',
      bot: r.bot,
      sev: r.status === 0 ? 'p1' : 'p2',
      titulo: `Endpoint ${r.name} fora do ar (HTTP ${r.status})`,
      detalhe: `URL: ${r.url}\nStatus: ${r.status}\nLatência: ${r.latencyMs}ms\nErro: ${r.error || '-'}`,
    });
  }
  for (const r of out) {
    if (r.url.includes('mcp.centralldark.com') && r.status >= 200 && r.status < 400 && !r.cors) {
      divergencias.push({
        area: 'CORS',
        bot: 'grok',
        sev: 'p2',
        titulo: `MCP sem CORS no painel: ${r.name}`,
        detalhe: `${r.url} responde 200 mas não envia Access-Control-Allow-Origin. O painel status.centralldark.com não consegue ler.`,
      });
    }
  }
  return out;
}

async function checkWorkflowsRuins() {
  try {
    const out = execSync(
      `gh run list -R "${REPO}" --status failure --created ">=$(date -u -d '-24 hours' +%Y-%m-%dT%H:%M:%SZ)" --json name,databaseId,conclusion,headBranch --limit 20`,
      { encoding: 'utf8' }
    );
    const arr = JSON.parse(out);
    for (const r of arr) {
      divergencias.push({
        area: 'Workflows',
        bot: 'codex',
        sev: 'p2',
        titulo: `Workf
```