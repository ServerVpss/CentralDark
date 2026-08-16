#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const MODULES_ROOT = 'apps/modulos/';
const PARALLEL_NAME = /(?:^|[-_.])(v\d+|copy|copia|backup|bak|novo|new|old|legacy|antigo)(?:$|[-_.])/i;
const TEXT_EXTENSION = /\.(?:md|mdc|txt|json|ya?ml|mjs|cjs|js|ts|tsx|jsx|py|sh|ps1|toml|ini|conf|properties)$/i;
const DEFAULT_MAP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../config/mapa-canonico.json');
const FULL_SHA = /^[0-9a-f]{40}$/;
const CONSOLIDATION_LOCK = 'MAP_PROTECTED_PATH';
export const CONSOLIDATION_PROOF_DEPENDENCIES = Object.freeze([
  'apps/modulos/mapeamento/core/validar-mapa.mjs',
  '.agents/skills/meta-lupa/SKILL.md',
]);

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

function registrarCaminho(raw, origem, vistos, erros) {
  try {
    const p = normalizarCaminho(raw);
    const key = p.toLocaleLowerCase('en-US');
    if (vistos.has(key)) erros.push(`caminho duplicado no mapa: ${p} (${vistos.get(key)} e ${origem})`);
    else vistos.set(key, origem);
  } catch (error) {
    erros.push(error.message);
  }
}

function textoNaoVazio(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function inteiroNaoNegativo(value) {
  return Number.isInteger(value) && value >= 0;
}

function gitObjectOidAt(repoRoot, ref, rawPath) {
  const target = normalizarCaminho(rawPath).replace(/\/$/, '');
  return git(repoRoot, ['rev-parse', `${ref}:${target}`]).toLowerCase();
}

/**
 * Um caminho listado como consolidado continua protegido por segurança, mas só
 * recebe selo evidencial PROVEN quando a prova é fechada e reproduzível.
 * Ausência de prova nunca é convertida em PASS: vira PROTECTED_UNPROVEN.
 * Quando repoRoot/headSha são fornecidos, o selo precisa manter iguais tanto o
 * objeto Git material do alvo quanto as dependências que produziram/julgaram a
 * prova. HEAD novo fora dessas fronteiras preserva a prova; delta material no
 * alvo ou no mecanismo probatório invalida somente a fronteira dependente.
 */
export function validarProvaConsolidacao(area, { repoRoot = null, headSha = null } = {}) {
  const proof = area?.proof;
  if (proof == null) {
    return { status: 'PROTECTED_UNPROVEN', errors: [] };
  }

  const errors = [];
  if (!FULL_SHA.test(String(proof.head_sha || ''))) errors.push('head_sha inválido');
  if (!FULL_SHA.test(String(proof.material_git_oid || ''))) errors.push('material_git_oid inválido');
  for (const field of ['evidence_ref', 'writer_ref', 'judge_ref', 'counterproof_ref', 'rollback_ref']) {
    if (!textoNaoVazio(proof[field])) errors.push(`${field} ausente`);
  }
  if (textoNaoVazio(proof.writer_ref) && textoNaoVazio(proof.judge_ref) && proof.writer_ref === proof.judge_ref) {
    errors.push('writer_ref e judge_ref devem ser independentes');
  }
  if (proof.lock_mechanism !== CONSOLIDATION_LOCK) {
    errors.push(`lock_mechanism deve ser ${CONSOLIDATION_LOCK}`);
  }

  const dependencyOids = proof.dependency_git_oids;
  if (!dependencyOids || typeof dependencyOids !== 'object' || Array.isArray(dependencyOids)) {
    errors.push('dependency_git_oids ausente');
  } else {
    for (const dependencyPath of CONSOLIDATION_PROOF_DEPENDENCIES) {
      if (!FULL_SHA.test(String(dependencyOids[dependencyPath] || ''))) {
        errors.push(`dependency_git_oids inválido: ${dependencyPath}`);
      }
    }
  }

  const tests = proof.tests;
  if (!tests || !inteiroNaoNegativo(tests.passed) || !Number.isInteger(tests.total) || tests.total <= 0 || !inteiroNaoNegativo(tests.skipped)) {
    errors.push('tests inválido');
  } else {
    if (tests.passed !== tests.total) errors.push('tests não estão 100% PASS');
    if (tests.skipped !== 0) errors.push('tests contém SKIPPED');
  }

  const efficacy = proof.efficacy;
  if (!efficacy || !inteiroNaoNegativo(efficacy.numerator) || !Number.isInteger(efficacy.denominator) || efficacy.denominator <= 0) {
    errors.push('efficacy sem numerador/denominador válido');
  } else {
    const expected = (efficacy.numerator / efficacy.denominator) * 100;
    if (efficacy.numerator !== efficacy.denominator) errors.push('eficácia menor que 100%');
    if (efficacy.percent !== expected || efficacy.percent !== 100) {
      errors.push('efficacy.percent não reproduz 100%');
    }
  }

  if (repoRoot && headSha && errors.length === 0) {
    if (!FULL_SHA.test(String(headSha))) {
      errors.push('HEAD atual inválido para prova material');
    } else {
      try {
        const declared = String(proof.material_git_oid).toLowerCase();
        const proofOid = gitObjectOidAt(repoRoot, proof.head_sha, area.path);
        const currentOid = gitObjectOidAt(repoRoot, headSha, area.path);
        if (declared !== proofOid) {
          errors.push(`material_git_oid não corresponde ao proof.head_sha: declarado=${declared} prova=${proofOid}`);
        }
        if (declared !== currentOid) {
          errors.push(`material mudou desde a prova: declarado=${declared} atual=${currentOid}`);
        }

        for (const dependencyPath of CONSOLIDATION_PROOF_DEPENDENCIES) {
          const declaredDependency = String(proof.dependency_git_oids[dependencyPath]).toLowerCase();
          const proofDependencyOid = gitObjectOidAt(repoRoot, proof.head_sha, dependencyPath);
          const currentDependencyOid = gitObjectOidAt(repoRoot, headSha, dependencyPath);
          if (declaredDependency !== proofDependencyOid) {
            errors.push(`dependency_git_oids não corresponde ao proof.head_sha [${dependencyPath}]: declarado=${declaredDependency} prova=${proofDependencyOid}`);
          }
          if (declaredDependency !== currentDependencyOid) {
            errors.push(`dependência da prova mudou [${dependencyPath}]: declarado=${declaredDependency} atual=${currentDependencyOid}`);
          }
        }
      } catch (error) {
        errors.push(`fingerprint material/dependência indisponível: ${error.message}`);
      }
    }
  }

  return { status: errors.length ? 'INVALID_PROOF' : 'PROVEN', errors };
}

export function resumirConsolidacoes(map, context = {}) {
  const proven = [];
  const protectedUnproven = [];
  const invalid = [];
  for (const area of map?.consolidated_areas || []) {
    const result = validarProvaConsolidacao(area, context);
    const pathValue = area?.path || '<sem-path>';
    if (result.status === 'PROVEN') proven.push(pathValue);
    else if (result.status === 'PROTECTED_UNPROVEN') protectedUnproven.push(pathValue);
    else invalid.push({ path: pathValue, errors: result.errors });
  }
  return {
    proven,
    protected_unproven: protectedUnproven,
    invalid,
  };
}

export function validarDocumentoMapa(map) {
  const erros = [];
  if (map?.schema_version !== 1) erros.push('schema_version deve ser 1');
  if (map?.source_of_truth !== 'apps/modulos/mapeamento/config/mapa-canonico.json') {
    erros.push('source_of_truth divergente');
  }
  if (!Array.isArray(map?.sectors) || !map.sectors.length) erros.push('sectors vazio');
  if (!Array.isArray(map?.consolidated_areas) || !map.consolidated_areas.length) erros.push('consolidated_areas vazio');
  if (!Array.isArray(map?.canonical_contracts) || !map.canonical_contracts.length) erros.push('canonical_contracts vazio');
  if (!Array.isArray(map?.forbidden_roots)) erros.push('forbidden_roots inválido');
  if (!Array.isArray(map?.historical_roots)) erros.push('historical_roots inválido');
  if (!Array.isArray(map?.validation_entrypoints) || !map.validation_entrypoints.length) erros.push('validation_entrypoints vazio');

  const policy = map?.consolidation_evidence_policy;
  if (policy?.enabled !== true) erros.push('consolidation_evidence_policy.enabled deve ser true');
  if (policy?.legacy_without_proof !== 'PROTECTED_UNPROVEN') {
    erros.push('consolidation_evidence_policy.legacy_without_proof inválido');
  }
  if (policy?.efficacy_100_requires_denominator !== true) {
    erros.push('consolidation_evidence_policy.efficacy_100_requires_denominator deve ser true');
  }

  const setoresVistos = new Map();
  const travasVistas = new Map();
  const contratosVistos = new Set();
  const proibidosVistos = new Map();

  for (const sector of map?.sectors || []) {
    if (!sector?.id || !sector?.label || !Array.isArray(sector.paths)) erros.push('setor inválido');
    for (const p of sector?.paths || []) registrarCaminho(p, `setor:${sector.id}`, setoresVistos, erros);
  }

  for (const area of map?.consolidated_areas || []) {
    if (!area?.path || !area?.reason) erros.push('área consolidada sem path/reason');
    else registrarCaminho(area.path, `trava:${area.path}`, travasVistas, erros);
    const proof = validarProvaConsolidacao(area);
    for (const error of proof.errors) erros.push(`prova de consolidação inválida [${area?.path || '<sem-path>'}]: ${error}`);
  }

  for (const contract of map?.canonical_contracts || []) {
    if (!contract?.id || !contract?.source || !Array.isArray(contract?.consumers) || !contract.consumers.length) {
      erros.push('contrato canônico inválido');
      continue;
    }
    if (contratosVistos.has(contract.id)) erros.push(`contrato canônico duplicado: ${contract.id}`);
    contratosVistos.add(contract.id);
    if (!Array.isArray(contract.required_tokens) || !contract.required_tokens.length) {
      erros.push(`contrato sem required_tokens: ${contract.id}`);
    }
    if (contract.identity === 'git_blob_sha1' && !contract.target) {
      erros.push(`contrato de identidade sem target: ${contract.id}`);
    }
  }

  for (const item of map?.forbidden_roots || []) {
    if (!item?.path || !item?.canonical || !item?.reason) {
      erros.push('forbidden_root inválido');
      continue;
    }
    registrarCaminho(item.path, `forbidden:${item.path}`, proibidosVistos, erros);
    try {
      if (normalizarCaminho(item.path).toLocaleLowerCase('en-US') === normalizarCaminho(item.canonical).toLocaleLowerCase('en-US')) {
        erros.push(`forbidden_root aponta para si mesmo: ${item.path}`);
      }
    } catch (error) {
      erros.push(error.message);
    }
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

function evidenceLockedPaths(map) {
  return (map.consolidated_areas || [])
    .filter(area => validarProvaConsolidacao(area).status === 'PROVEN')
    .map(area => normalizarCaminho(area.path));
}

function touchesPath(file, locked) {
  const clean = locked.replace(/\/$/, '');
  const target = `${clean}/`;
  return file === clean || file.startsWith(target);
}

function gitRaw(repoRoot, args, options = {}) {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  });
}

function git(repoRoot, args, options = {}) {
  return gitRaw(repoRoot, args, options).trim();
}

function trackedFiles(repoRoot) {
  const raw = gitRaw(repoRoot, ['ls-files', '-z']);
  return raw.split('\0').filter(Boolean).map(normalizarCaminho);
}

function isUnder(file, root) {
  const clean = normalizarCaminho(root).replace(/\/$/, '');
  return file === clean || file.startsWith(`${clean}/`);
}

function isHistorical(file, map) {
  return (map.historical_roots || []).some(root => isUnder(file, root));
}

export function temSegmentoAdjacenteDuplicado(file) {
  const parts = normalizarCaminho(file).replace(/\/$/, '').split('/');
  for (let index = 1; index < parts.length; index += 1) {
    if (parts[index - 1].toLocaleLowerCase('en-US') === parts[index].toLocaleLowerCase('en-US')) return true;
  }
  return false;
}

function readTextFile(repoRoot, file) {
  const absolute = path.join(repoRoot, file);
  let stat;
  try {
    stat = fs.statSync(absolute);
  } catch {
    return null;
  }
  if (!stat.isFile() || stat.size > 2_000_000) return null;
  const buffer = fs.readFileSync(absolute);
  if (buffer.includes(0)) return null;
  return buffer.toString('utf8');
}

function parseIdentityRecord(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
  if (lines.length !== 1) return { error: `registro de identidade deve ter uma linha útil; encontrado=${lines.length}` };
  const match = lines[0].match(/^([0-9a-f]{40})\s+(.+)$/i);
  if (!match) return { error: 'registro de identidade inválido' };
  return { sha: match[1].toLowerCase(), target: normalizarCaminho(match[2].trim()) };
}

export function validarContratosCanonicos({ repoRoot, map }) {
  const erros = [];
  const fatos = [];

  for (const contract of map.canonical_contracts || []) {
    const source = normalizarCaminho(contract.source);
    if (!fs.existsSync(path.join(repoRoot, source))) {
      erros.push(`fonte canônica ausente [${contract.id}]: ${source}`);
      continue;
    }

    const allConsumers = [...new Set(contract.consumers.map(normalizarCaminho))];
    for (const consumer of allConsumers) {
      const text = readTextFile(repoRoot, consumer);
      if (text === null) {
        erros.push(`consumidor canônico ausente ou ilegível [${contract.id}]: ${consumer}`);
        continue;
      }
      for (const token of contract.required_tokens || []) {
        if (!text.includes(token)) erros.push(`consumidor sem token [${contract.id}] ${consumer}: ${token}`);
      }
      for (const token of contract.forbidden_tokens || []) {
        if (text.includes(token)) erros.push(`token duplicado/proibido [${contract.id}] ${consumer}: ${token}`);
      }
    }

    if (contract.identity === 'git_blob_sha1') {
      const target = normalizarCaminho(contract.target);
      const parsed = parseIdentityRecord(fs.readFileSync(path.join(repoRoot, source), 'utf8'));
      if (parsed.error) {
        erros.push(`identidade inválida [${contract.id}]: ${parsed.error}`);
        continue;
      }
      if (parsed.target !== target) erros.push(`alvo de identidade divergente [${contract.id}]: ${parsed.target} != ${target}`);
      if (!fs.existsSync(path.join(repoRoot, target))) {
        erros.push(`alvo canônico ausente [${contract.id}]: ${target}`);
        continue;
      }
      try {
        const headBlob = git(repoRoot, ['rev-parse', `HEAD:${target}`]).toLowerCase();
        const worktreeBlob = git(repoRoot, ['hash-object', target]).toLowerCase();
        if (parsed.sha !== headBlob) erros.push(`identidade HEAD divergente [${contract.id}]: esperado=${parsed.sha} head=${headBlob}`);
        if (parsed.sha !== worktreeBlob) erros.push(`identidade worktree divergente [${contract.id}]: esperado=${parsed.sha} worktree=${worktreeBlob}`);
        if (headBlob !== worktreeBlob) erros.push(`drift HEAD/worktree [${contract.id}]: head=${headBlob} worktree=${worktreeBlob}`);
        fatos.push({ id: contract.id, source, target, expected: parsed.sha, head: headBlob, worktree: worktreeBlob });
      } catch (error) {
        erros.push(`prova Git indisponível [${contract.id}]: ${error.message}`);
      }
    } else {
      fatos.push({ id: contract.id, source, consumers: allConsumers.length });
    }
  }

  return { ok: erros.length === 0, erros, fatos };
}

export function validarRepositorioGlobal({ repoRoot, map }) {
  const erros = [];
  const avisos = [];
  const files = trackedFiles(repoRoot);

  for (const forbidden of map.forbidden_roots || []) {
    const hits = files.filter(file => isUnder(file, forbidden.path));
    if (hits.length) {
      erros.push(`raiz duplicada proibida ainda versionada: ${forbidden.path} (${hits.length} arquivo(s)); usar ${forbidden.canonical}`);
    }
  }

  for (const file of files) {
    if (isHistorical(file, map)) continue;
    if (temSegmentoAdjacenteDuplicado(file)) erros.push(`segmento de diretório repetido: ${file}`);
  }

  const workflows = files.filter(file => file.startsWith('.github/workflows/') && /\.ya?ml$/i.test(file));
  const validationNames = (map.validation_entrypoints || []).map(entry => path.posix.basename(entry));
  for (const workflow of workflows) {
    const text = readTextFile(repoRoot, workflow);
    if (text === null) continue;
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (!line.includes('|| true')) return;
      const touchesValidation = validationNames.some(name => line.includes(name)) || /(?:validar|verify|check|test)[-_a-z0-9.\/]*\s.*\|\| true/i.test(line);
      if (touchesValidation) erros.push(`falha de validação mascarada: ${workflow}:${index + 1}`);
    });
  }

  const contracts = validarContratosCanonicos({ repoRoot, map });
  erros.push(...contracts.erros);

  const parallelExisting = files.filter(file => {
    if (isHistorical(file, map)) return false;
    return file.split('/').some(segment => PARALLEL_NAME.test(segment));
  });
  for (const file of parallelExisting.slice(0, 50)) avisos.push(`candidato a versão paralela já existente: ${file}`);
  if (parallelExisting.length > 50) avisos.push(`outros candidatos a versão paralela omitidos: ${parallelExisting.length - 50}`);

  return {
    ok: erros.length === 0,
    erros,
    avisos,
    trackedFiles: files.length,
    canonicalContracts: contracts.fatos,
    parallelExisting: parallelExisting.length,
  };
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

  if (erros.length === 0) {
    try {
      const global = validarRepositorioGlobal({ repoRoot, map });
      erros.push(...global.erros);
      avisos.push(...global.avisos);
      return { ok: erros.length === 0, erros, avisos, modulos: names.sort(), global };
    } catch (error) {
      erros.push(`validação global indisponível: ${error.message}`);
    }
  }

  return { ok: erros.length === 0, erros, avisos, modulos: names.sort(), global: null };
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

function mergeBase(repoRoot, baseSha, headSha) {
  return git(repoRoot, ['merge-base', baseSha, headSha]);
}

export function validarMudanca({ repoRoot, baseSha, headSha, approved = false, map = carregarMapa() }) {
  const erros = validarDocumentoMapa(map);
  const avisos = [];
  const changed = [];
  if (!baseSha || !headSha) return { ok: erros.length === 0, erros, avisos, changed };

  const diffBaseSha = mergeBase(repoRoot, baseSha, headSha);
  const raw = git(repoRoot, ['diff', '--name-status', '--find-renames', diffBaseSha, headSha]);
  for (const line of raw ? raw.split('\n') : []) {
    const cols = line.split('\t');
    const status = cols[0];
    const file = normalizarCaminho(cols.at(-1));
    changed.push({ status, file });
  }

  const locks = protectedPaths(map);
  const evidenceLocks = evidenceLockedPaths(map);
  const touchedLocks = [...new Set(changed.flatMap(item => locks.filter(locked => touchesPath(item.file, locked))))];
  const touchedEvidenceLocks = [...new Set(changed.flatMap(item => evidenceLocks.filter(locked => touchesPath(item.file, locked))))];
  if (touchedLocks.length && !approved) erros.push(`área protegida alterada sem label ${map.approval_label}: ${touchedLocks.join(', ')}`);

  for (const area of map.consolidated_areas || []) {
    const locked = normalizarCaminho(area.path);
    if (!touchedEvidenceLocks.includes(locked)) continue;
    const liveProof = validarProvaConsolidacao(area, { repoRoot, headSha });
    if (liveProof.status !== 'PROVEN') {
      erros.push(`área PROVEN alterada exige nova prova material [${locked}]: ${liveProof.errors.join('; ') || 'prova atual indisponível'}`);
    }
  }

  const mappedModules = moduleRootsFromMap(map);
  const newModules = new Set();
  for (const item of changed) {
    const added = /^[ARC]/.test(item.status);
    if (added && !isHistorical(item.file, map)) {
      if (temSegmentoAdjacenteDuplicado(item.file)) erros.push(`novo caminho repete segmento: ${item.file}`);
      const segments = item.file.split('/');
      if (segments.some(segment => PARALLEL_NAME.test(segment))) erros.push(`novo caminho parece versão paralela: ${item.file}`);
      for (const forbidden of map.forbidden_roots || []) {
        if (isUnder(item.file, forbidden.path)) erros.push(`novo caminho usa raiz proibida ${forbidden.path}: ${item.file}`);
      }
    }

    if (!item.file.startsWith(MODULES_ROOT)) continue;
    const moduleName = item.file.slice(MODULES_ROOT.length).split('/')[0];
    if (!moduleName || existedAt(repoRoot, diffBaseSha, moduleName)) continue;
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

  return {
    ok: erros.length === 0,
    erros,
    avisos,
    changed,
    diffBaseSha,
    touchedLocks,
    touchedEvidenceLocks,
    newModules: [...newModules],
  };
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
    const effectiveHead = args.headSha || git(args.repoRoot, ['rev-parse', 'HEAD']);
    const consolidation = resumirConsolidacoes(map, { repoRoot: args.repoRoot, headSha: effectiveHead });
    const result = {
      ok: tree.ok && change.ok && consolidation.invalid.length === 0,
      source_of_truth: map.source_of_truth,
      errors: [
        ...tree.erros,
        ...change.erros,
        ...consolidation.invalid.flatMap(item => item.errors.map(error => `prova material inválida [${item.path}]: ${error}`)),
      ],
      warnings: [...tree.avisos, ...change.avisos],
      changed_files: change.changed.length,
      diff_base_sha: change.diffBaseSha || null,
      touched_locks: change.touchedLocks || [],
      touched_evidence_locks: change.touchedEvidenceLocks || [],
      consolidation_proven: consolidation.proven.length,
      consolidation_protected_unproven: consolidation.protected_unproven.length,
      consolidation_invalid: consolidation.invalid.length,
      new_modules: change.newModules || [],
      tracked_files: tree.global?.trackedFiles ?? null,
      canonical_contracts: tree.global?.canonicalContracts ?? [],
      parallel_existing: tree.global?.parallelExisting ?? null,
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: String(error?.message || error) }));
    process.exit(1);
  }
}
