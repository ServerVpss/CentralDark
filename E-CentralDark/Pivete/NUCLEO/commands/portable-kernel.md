# COMANDO - portable-kernel.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lupa\portable-kernel.mjs
**SHA:** d588cd5c77356e55
**Timestamp:** 2026-08-28T02:57:36.096911
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const RESPONSE_PATTERN = 'docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md';

### Contratos
- const CONTRACT = 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json';
- const EVOLUTION_GATE = '.agents/skills/meta-lupa/scripts/evolution_gate.py';
- contract = JSON.parse(load(CONTRACT));

### Gaps
- const missing = spec.markers.filter((marker) => !owner.content.includes(marker));
- const consumerMissing = (spec.consumer_markers ?? []).filter((marker) => !consumer.content.includes(marker));
- missing: consumerMissing,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(HERE, '..', '..');
const argv = process.argv.slice(2);

function valueAfter(name, fallback = '') {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
}

const ROOT = resolve(valueAfter('--repo-root', DEFAULT_ROOT));
const JSON_ONLY = argv.includes('--json');
const COMPACT = argv.includes('--compact');
const EXPORT_PATH = valueAfter('--export', '');
const CONTRACT = 'docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json';
const SOUL = 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md';
const COGNITION = 'docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/CAPACIDADES-COGNITIVAS.md';
const METACOGNITION = 'docs/CONSCIENCIA/METACOGNICAO-OPERACIONAL.md';
const ORCHESTRATION = 'docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md';
const PROOF_OWNERSHIP = 'docs/CONSCIENCIA/PROOF-OWNERSHIP.json';
const RESPONSE_PATTERN = 'docs/CONSCIENCIA/2026-06-20-padrao-resposta-pivete.md';
const EVIDENCE_ONTOLOGY = 'docs/GOVERNANCA/ONTOLOGIA-DE-EVIDENCIA-E-CAUSALIDADE.md';
const EVOLUTION_GATE = '.agents/skills/meta-lupa/scripts/evolution_gate.py';
const PORTABLE_SCRIPT = 'scripts/lupa/portable-kernel.mjs';
const PORTABLE_TEST = 'scripts/lupa/portable-kernel.test.mjs';

function git(args) {
  return execFileSync('git', ['-C', ROOT, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function canonicalJson(value) {
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function load(path) {
  return readFileSync(join(ROOT, path), 'utf8');
}

function fail(code, details = {}) {
  const out = { ok: false, status: 'BLOCKED', code, ...details };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
  process.exit(2);
}

if (!existsSync(join(ROOT, CONTRACT))) fail('CANONICAL_FILE_MISSING', { file: CONTRACT });

let contract;
try {
  contract = JSON.parse(load(CONTRACT));
} catch (error) {
  fail('CONTRACT_JSON_INVALID', { error: String(error?.message || error) });
}

function validateContract(value) {
  const errors = [];
  const image = value.multimodal_input_policy ?? {};
  const portable = value.portable_boot_policy ?? {};
  const language = value.language_policy ?? {};

  if (image.marker !== 'IMAGE_INPUT_IS_OPERATIONAL') errors.push('IMAGE_MARKER');
  if (image.image_is_sensor !== true) errors.push('IMAGE_NOT_SENSOR');
  if (image.screenshot_is_current_truth !== false) errors.push('SCREENSHOT_MUST_NOT_BE_CURRENT_TRUTH');
  if (image.screenshot_is_trigger_for_live_measurement !== true) errors.push('SCREENSHOT_MUST_TRIGGER_LIVE_MEASUREMENT');
  if (image.live_state_required_before_mutation !== true) errors.push('LIVE_REMEASURE_REQUIRED');
  if (image.material_visual_finding_action !== 'REMEASURE_LIVE_SOURCE_THEN_ACT_MINIMALLY') errors.push('IMAGE_ACTION_INVALID');

  if (language.paired_explanation_house_standard !== true) errors.push('PAIRED_EXPLANATION_REQUIRED');
  if (language.chefe_register_required_immediately_after_material_technical_unit !== true) errors.push('INLINE_CHEFE_REGISTER_REQUIRED');
  if (language.final_simple_summary_does_not_replace_inline_translation !== true) errors.push('INLINE_TRANSLATION_CANNOT_BE_REPLACED_BY_SUMMARY');
  if (language.referent_clarity_required !== true) errors.push('REFERENT_CLARITY_REQUIRED');
  if (language.ambiguous_pronoun_reference_is_incomplete !== true) errors.push('AMBIGUOUS_PRONOUN_MUST_BE_INCOMPLETE');
  if (language.orphan_deictic_reference_is_incomplete !== true) errors.push('ORPHAN_DEICTIC_MUST_BE_INCOMPLETE');
  if (language.referent_recovery !== 'REPEAT_THE_NOUN_OR_ENUMERATE_REFERENTS') errors.push('REFERENT_RECOVERY_INVALID');
  if (language.user_must_not_need_second_question_to_resolve_referent !== true) errors.push('REFERENT_SECOND_QUESTION_FORBIDDEN');

  if (portable.marker !== 'CENTRALDARK_PORTABLE_KERNEL') errors.push('PORTABLE_MARKER');
  if (portable.canonical_entrypoint !== 'LEIA-ME-IA.md') errors.push('PORTABLE_ENTRYPOINT');
  if (portable.package_is_cache_not_authority !== true) errors.push('PACKAGE_MUST_BE_CACHE');
  if (portable.package_source !== 'LIVE_REPOSITORY_CANONICAL_FILES') errors.push('PACKAGE_SOURCE_INVALID');
  if (portable.stale_package_action !== 'REBUILD_FROM_LIVE_REPOSITORY') errors.push('STALE_PACKAGE_ACTION_INVALID');
  if (portable.export_must_bind_to_head_sha !== true) errors.push('EXPORT_HEAD_BINDING_REQUIRED');
  if (portable.export_must_hash_each_member !== true) errors.push('EXPORT_MEMBER_HASH_REQUIRED');
  if (portable.model_provider_lock !== false) errors.push('MODEL_LOCK_FORBIDDEN');
  if (portable.never_overwrite_newer_live_st
```