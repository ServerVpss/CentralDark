#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MODULES_ROOT = 'apps/modulos/';
const PARALLEL_NAME = /(?:^|[-_.])(v\d+|copy|copia|backup|bak|novo|new|old|legacy)(?:$|[-_.])/i;
const DEFAULT_MAP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../config/mapa-canonico.json');

export function normalizarCaminho(value) {
  const raw = String(value || '').replaceAll('\\', '/').replace(/^\.\//, '');
  const normalized = path.posix.normalize(raw);
  const hasTraversal = raw.split('/').includes('..');
  if (!raw || hasTraversal || normalized === '.' || normalized.startsWith('/') || normalized === '..' || normalized.startsWith('../')) {
    throw new Error(`caminho inválido no mapa: ${value}`);
  }
  return normalized.replace(/\/+$/, '') + (raw.endsWith('/') ? '/' : '');
}

export function carregarMapa(mapPath = DEFAULT_MAP) {
  return JSON.parse(fs.readFileSync(mapPath, 'utf8'));
}

export function validarDocumentoMapa(map) {
  const erros = [];
  if (map?.schema_version !== 1) erros.push('schema_version deve ser 1');
  if (map?.source_of_truth !== 'apps/modulos/mapeamento/config/mapa-canonico.json') {
    erros.push('source_of_truth divergente');
  }
  if (!Array.isArray(map?.sectors) || !map.sectors.length) erros.push('sectors vazio');
  if (!Array.isArray(map?.consolidated_areas) || !map.consolidated_areas.length) erros.push('consolidated_areas vazio');

  const setoresVistos = new Map();
  const travasVistas = new Map();
  const registrar = (raw, origem, vistos) => {
    try {
      const p = normalizarCaminho(raw);
      const key = p.toLocaleLowerCase('en-US');
      if (vistos.has(key)) erros.push(`caminho duplicado no mapa: ${p} (${vistos.get(key)} e ${origem})`);
      else vistos.set(key, origem);
    } catch (error) {
      erros.push(error.message);
    }
  };

  for (const sector of map?.sectors || []) {
    if (!sector?.id || !sector?.label || !Array.isArray(sector.paths)) erros.push('setor inválido');
    for (const p of sector?.paths || []) registrar(p, `setor:${sector.id}`, setoresVistos);
  }
  for (const area of map?.consolidated_areas || []) {
    if (!area?.path || !area?.reason) erros.push('área consolidada sem path/reason');
    else registrar(area.path, `trava:${area.path}`, travasVistas);
  }
  return erros;
}

function moduleRootsFromMap(map) {
  const roots = new Set();
  for (const sector of map.sectors || []) {
    for (const raw of sector.paths || []) {
      const p = normalizarCaminho(raw);
      if (!p.startsWith(MODULES_ROOT)) continue;
      const name = p.slice(MODULES_ROOT.length).split('/')[0];
      if (name) roots.add(name.toLocaleLowerCase('en-US'));
    }
  }
  return roots;
}

function protectedPaths(map) {
  return (map.consolidated_areas || []).map(area => normalizarCaminho(area.path));
}

function touchesPath(file, locked) {
  const target = locked.endsWith('/') ? locked : `${locked}/`;
  return file === locked.replace(/\/$/, '') || file.startsWith(target);
}

export function validarArvore({ repoRoot, map = carregarMapa() }) {
  const erros = validarDocumentoMapa(map);
  const avisos = [];
  const modulesDir = path.join(repoRoot, MODULES_ROOT);
  let names = [];
  try {
    names = fs.readdirSync(modulesDir, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
  } catch (error) {
    erros.push(`não foi possível ler ${MODULES_ROOT}: ${error.code || error.message}`);
  }

  const byCasefold = new Map();
  for (const name of names) {
    const key = name.toLocaleLowerCase('en-US');
    if (byCasefold.has(key) && byCasefold.get(key) !== name) erros.push(`módulos duplicados por caixa: ${byCasefold.get(key)} e ${name}`);
    else byCasefold.set(key, name);
    if (PARALLEL_NAME.test(name)) avisos.push(`nome de versão paralela existente: ${name}`);
  }

  for (const locked of protectedPaths(map)) {
    if (!fs.existsSync(path.join(repoRoot, locked))) avisos.push(`caminho consolidado ausente no checkout: ${locked}`);
  }

  return { ok: erros.length === 0, erros, avisos, modulos: names.sort() };
}

function git(repoRoot, args, options = {}) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
}

function existedAt(repoRoot, sha, moduleRoot) {
  try {
    execFileSync('git', ['cat-file', '-e', `${sha}:${MODULES_ROOT}${moduleRoot}`], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

export function validarMudanca({ repoRoot, baseSha, headSha, approved = false, map = carregarMapa() }) {
  const erros = validarDocumentoMapa(map);
  const avisos = [];
  const changed = [];
  if (!baseSha || !headSha) return { ok: erros.length === 0, erros, avisos, changed };

  const raw = git(repoRoot, ['diff', '--name-status', '--find-renames', baseSha, headSha]);
  for (const line of raw ? raw.split('\n') : []) {
    const cols = line.split('\t');
    const status = cols[0];
    const file = normalizarCaminho(cols.at(-1));
    changed.push({ status, file });
  }

  const locks = protectedPaths(map);
  const touchedLocks = [...new Set(changed.flatMap(item => locks.filter(locked => touchesPath(item.file, locked))))];
  if (touchedLocks.length && !approved) erros.push(`área consolidada alterada sem label ${map.approval_label}: ${touchedLocks.join(', ')}`);

  const mappedModules = moduleRootsFromMap(map);
  const newModules = new Set();
  for (const item of changed) {
    if (!item.file.startsWith(MODULES_ROOT)) continue;
    const moduleName = item.file.slice(MODULES_ROOT.length).split('/')[0];
    if (!moduleName || existedAt(repoRoot, baseSha, moduleName)) continue;
    newModules.add(moduleName);
  }

  const folded = new Map();
  for (const name of newModules) {
    const key = name.toLocaleLowerCase('en-US');
    if (folded.has(key) && folded.get(key) !== name) erros.push(`novos módulos duplicados por caixa: ${folded.get(key)} e ${name}`);
    else folded.set(key, name);
    if (PARALLEL_NAME.test(name)) erros.push(`novo módulo parece versão paralela: ${name}`);
    if (!mappedModules.has(key)) erros.push(`novo módulo fora do mapa canônico: ${MODULES_ROOT}${name}/`);
  }

  return { ok: erros.length === 0, erros, avisos, changed, touchedLocks, newModules: [...newModules] };
}

function parseArgs(argv) {
  const args = { repoRoot: process.cwd(), mapPath: DEFAULT_MAP, approved: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--repo-root') args.repoRoot = path.resolve(argv[++i]);
    else if (argv[i] === '--map') args.mapPath = path.resolve(argv[++i]);
    else if (argv[i] === '--base-sha') args.baseSha = argv[++i];
    else if (argv[i] === '--head-sha') args.headSha = argv[++i];
    else if (argv[i] === '--approved') args.approved = argv[++i] === 'true';
    else throw new Error(`argumento desconhecido: ${argv[i]}`);
  }
  return args;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const map = carregarMapa(args.mapPath);
    const tree = validarArvore({ repoRoot: args.repoRoot, map });
    const change = validarMudanca({ ...args, map });
    const result = {
      ok: tree.ok && change.ok,
      source_of_truth: map.source_of_truth,
      errors: [...tree.erros, ...change.erros],
      warnings: [...tree.avisos, ...change.avisos],
      changed_files: change.changed.length,
      touched_locks: change.touchedLocks || [],
      new_modules: change.newModules || [],
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: String(error?.message || error) }));
    process.exit(1);
  }
}
