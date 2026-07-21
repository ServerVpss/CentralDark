#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const paths = {
  config: path.join(repoRoot, 'apps/bot-telegram/skills/config/skills.json'),
  skill: path.join(repoRoot, 'apps/bot-telegram/skills/tecnica-da-lupa-premium/SKILL.md'),
  prompt: path.join(repoRoot, 'missoes/INVENTARIO-FULL-CENTRALDARK/PROMPT-INVENTARIO-FULL-CENTRALDARK.md'),
  executor: path.join(repoRoot, 'apps/bot-telegram/skills/core/executor.cjs'),
};

const checks = [];
let expectedSkillHash = 'N/A';
let expectedPromptHash = 'N/A';

const check = (name, condition, detail = '') => {
  checks.push({ name, ok: Boolean(condition), detail });
};

for (const [name, file] of Object.entries(paths)) {
  check(`arquivo:${name}`, fs.existsSync(file), file);
}

if (checks.some(item => !item.ok)) finish();

const config = JSON.parse(fs.readFileSync(paths.config, 'utf-8'));
const skillText = fs.readFileSync(paths.skill, 'utf-8');
const promptText = fs.readFileSync(paths.prompt, 'utf-8');
expectedSkillHash = sha256(skillText);
expectedPromptHash = sha256(promptText);

const registrations = (config.methodology?.skills || [])
  .filter(skill => skill.slug === 'tecnica-da-lupa-premium');

check('registro:slug-unico', registrations.length === 1, `encontrados=${registrations.length}`);
check('registro:tipo-metodologia', registrations[0]?.type === 'methodology');
check('registro:ativa', registrations[0]?.active === true);
check('registro:path-canonico', registrations[0]?.path === 'tecnica-da-lupa-premium/SKILL.md');

const requiredSkillSections = [
  '## Regra de Ouro',
  '## 1. Zoom Out',
  '## 2. Zoom In',
  '## 3. Técnica de Feynman',
  '# Gate de Evidência',
  '# Bloqueios Absolutos',
  '# Validação por Cenários',
  '# Registro',
  '# Limite de Garantia',
];
for (const section of requiredSkillSections) {
  check(`skill:${section}`, skillText.includes(section));
}
check('skill:nao-vazia', skillText.trim().length > 1000, `chars=${skillText.length}`);
check('skill:fences-balanceadas', countFences(skillText) % 2 === 0, `fences=${countFences(skillText)}`);

const requiredPromptTerms = [
  '100% READ-ONLY sobre a infraestrutura',
  'NÃO INICIAR A COLETA DA INFRAESTRUTURA',
  'não enviar automaticamente ao Telegram',
  'E-001, E-002, E-003',
  'Hipótese de arquitetura herdada',
  'REGRESSÃO NECESSÁRIA',
  'ROLLBACK FUTURO',
  'APTO PARA REVISÃO E AUTORIZAÇÃO DO PIVETE',
];
for (const term of requiredPromptTerms) {
  check(`prompt:${term}`, promptText.includes(term));
}

check('prompt:sem-frontmatter-versao', !/^---\s*[\s\S]*?\bvers[aã]o\s*:/i.test(promptText));
check('prompt:sem-versao-2', !/vers[aã]o\s*2\.0/i.test(promptText));
check('prompt:sem-nota-autodeclarada', !promptText.includes('100/100'));
check('prompt:fences-balanceadas', countFences(promptText) % 2 === 0, `fences=${countFences(promptText)}`);

const secretPatterns = [
  /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/i,
  /\bghp_[A-Za-z0-9]{20,}\b/,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  /\bAIza[0-9A-Za-z_-]{20,}\b/,
  /\b(?:api[_-]?key|token|secret|password)\s*[:=]\s*['"]?([A-Za-z0-9_./+=-]{16,})/i,
];
const secretFindings = [];
for (const [label, text] of [['skill', skillText], ['prompt', promptText]]) {
  for (const pattern of secretPatterns) {
    if (pattern.test(text)) secretFindings.push(`${label}:${pattern}`);
  }
}
check('seguranca:sem-secrets-obvios', secretFindings.length === 0, secretFindings.join(', '));

const executor = require(paths.executor);
const loaded = await executor.run('tecnica-da-lupa-premium');
check('loader:ok', loaded.ok === true, loaded.error || '');
check('loader:tipo', loaded.type === 'methodology', loaded.type || '');
check('loader:loaded', loaded.loaded === true);
check('loader:path', loaded.path === 'tecnica-da-lupa-premium/SKILL.md', loaded.path || '');
check('loader:conteudo-integral', loaded.content === skillText, `chars=${loaded.content?.length || 0}`);
check('loader:sha256', loaded.sha256 === expectedSkillHash, loaded.sha256 || '');
check('loader:pipeline-result', loaded.result?.skillContent === skillText);

finish();

function sha256(text) {
  return crypto.createHash('sha256').update(text, 'utf-8').digest('hex');
}

function countFences(text) {
  return (text.match(/```/g) || []).length;
}

function finish() {
  const failed = checks.filter(item => !item.ok);

  console.log('# Prova — Técnica da Lupa Premium + Inventário FULL');
  console.log(`branch=${process.env.GITHUB_REF_NAME || 'local'}`);
  console.log(`head_sha=${process.env.GITHUB_SHA || 'local'}`);
  console.log(`skill_sha256=${expectedSkillHash}`);
  console.log(`prompt_sha256=${expectedPromptHash}`);
  console.log(`checks=${checks.length - failed.length}/${checks.length}`);

  for (const item of checks) {
    console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
  }

  if (failed.length) {
    console.error(`BLOQUEADO: ${failed.length} gate(s) falharam.`);
    process.exit(1);
  }

  console.log('APTO PARA REVISÃO DO PIVETE — nenhuma infraestrutura foi acessada ou alterada.');
}
