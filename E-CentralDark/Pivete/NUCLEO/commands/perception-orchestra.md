# COMANDO - perception-orchestra.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\modulos\HERMES-CORE\core\perception-orchestra.mjs
**SHA:** 761e2e0be5b89c59
**Timestamp:** 2026-08-28T02:56:26.556490
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const start = raw.indexOf('{');

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildCognitiveCouncilPlan,
  evaluateUsefulCeiling,
  validateCognitiveCouncilPlan,
} from './cognitive-council.mjs';

const pexec = promisify(execFile);
const DIR = dirname(fileURLToPath(import.meta.url));
const BASE = dirname(DIR);
const CADEIA_PATH = join(DIR, 'cadeia.json');
const ANDAMENTO = join(BASE, 'missions', 'em-andamento');

export const PERCEPTION_ATTACKS = Object.freeze([
  Object.freeze({ id: 'A_LOGIC', objective: 'Tente quebrar a lógica, premissas, causalidade e contradições da intenção atual.' }),
  Object.freeze({ id: 'B_IMPLEMENTATION', objective: 'Tente quebrar a implementação: interfaces, owners, integração, estados e falhas concretas.' }),
  Object.freeze({ id: 'C_REGRESSION_FALSE_GREEN', objective: 'Procure regressão, falso verde, prova circular, denominador incompleto e erro mascarado.' }),
  Object.freeze({ id: 'D_SIMPLIFICATION', objective: 'Procure simplificação Menos É Mais: remover trabalho, duplicação e complexidade sem perder capacidade.' }),
]);

const REQUIRED_ROLES = Object.freeze(PERCEPTION_ATTACKS.map((item) => item.id));

const SYSTEM = `Você é um braço READ_ONLY de percepção da CentralDark.
Sua função é falsificar uma crença por um ângulo específico. Não escreva arquivos, não faça deploy, não proponha autoridade nova e não encerre por votação.
Devolva APENAS JSON válido neste schema:
{"claim":"frase curta","class":"FACT|INFERENCE|HYPOTHESIS|UNKNOWN","evidence_ref":"referência observável ou UNKNOWN","independence_key":"fonte/failure-mode causal que torna esta evidência independente, ou UNKNOWN","counterexample":"o que quebraria a tese","recommended_test":"teste discriminante read-only ou reversível","material_delta":"delta útil ou NO_CHANGE"}`;

function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function normalizeIndependenceKey(value) {
  const key = normalizeText(value);
  if (!key || key.toUpperCase() === 'UNKNOWN') return 'UNKNOWN';
  return key.toLowerCase();
}

function normalizeClass(value) {
  const classification = String(value || 'UNKNOWN').toUpperCase();
  return ['FACT', 'INFERENCE', 'HYPOTHESIS', 'UNKNOWN'].includes(classification) ? classification : 'UNKNOWN';
}

function isNoChange(finding) {
  return normalizeText(finding?.material_delta).toUpperCase() === 'NO_CHANGE';
}

function isProvenMaterialFinding(finding) {
  return !isNoChange(finding)
    && normalizeClass(finding?.class) === 'FACT'
    && (normalizeText(finding?.evidence_ref) || 'UNKNOWN').toUpperCase() !== 'UNKNOWN';
}

function addCluster(map, key, role) {
  const roles = map.get(key) || [];
  roles.push(role);
  map.set(key, roles);
}

function extractJson(text) {
  const raw = String(text || '').trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('PERCEPTION_JSON_NOT_FOUND');
  return JSON.parse(raw.slice(start, end + 1));
}

function modelName(value) {
  return normalizeText(typeof value === 'string' ? value : value?.modelo);
}

export function enrichPerceptionMission(mission, proposalB64 = process.env.HERMES_PERCEPTION_PROPOSAL_B64 || '') {
  const base = normalizeText(mission);
  if (!proposalB64) return base;
  try {
    const proposal = JSON.parse(Buffer.from(String(proposalB64), 'base64url').toString('utf8'));
    const safe = {
      ferramenta: normalizeText(proposal?.ferramenta),
      scope_key: normalizeText(proposal?.scope_key),
      estado: normalizeText(proposal?.estado),
      etapa_titulo: normalizeText(proposal?.etapa_titulo).slice(0, 120),
      pensamento: normalizeText(proposal?.pensamento).slice(0, 500),
    };
    return `${base}\n\nPROPOSTA MATERIAL A SER CONTRAPROVADA:\n${JSON.stringify(safe)}`;
  } catch {
    return `${base}\n\nPROPOSTA MATERIAL A SER CONTRAPROVADA: UNKNOWN_PROPOSAL_ENCODING`;
  }
}

export function assignPerceptionModels(models, attacks = PERCEPTION_ATTACKS) {
  const pool = (Array.isArray(models) ? models : [])
    .map(modelName)
    .filter(Boolean);
  if (!pool.length) throw new Error('PERCEPTION_MODEL_POOL_EMPTY');
  return attacks.map((attack, index) => Object.freeze({
    ...attack,
    model: pool[index % pool.length],
    independence: pool.length >= attacks.length ? 'ROLE_AND_PROVIDER_DIVERSE' : 'ROLE_DIVERSE_PROVIDER_REUSE',
  }));
}

export function selectFallbackModel(configs, usedModels = []) {
  const used = new Set((Array.isArray(usedModels) ? usedModels : []).map(normalizeText).filter(Boolean));
  for (const item of Array.isArray(configs) ? configs : []) {
    const candidate = modelName(item);
    if (candidate && !used.has(candidate)) return candidate;
  }
  return null;
}

export function dedupePerceptionFindings(resu
```