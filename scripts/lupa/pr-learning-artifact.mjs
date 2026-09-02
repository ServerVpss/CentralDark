#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const MARKER = '<!-- centraldark-pr-learning-artifact -->';
export const CAPABILITY_KEYS = ['mermaid', 'canvas_html', 'structured_yaml'];

const YES = new Set(['sim', 'yes', 'true', '1', 'suportado', 'supported']);
const NO = new Set(['nao', 'não', 'no', 'false', '0', 'não_suportado', 'unsupported']);

function stripDiacritics(value) {
  return String(value ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

export function normalizeTriState(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  const ascii = stripDiacritics(raw);
  if (YES.has(raw) || YES.has(ascii)) return 'SIM';
  if (NO.has(raw) || NO.has(ascii)) return 'NAO';
  return 'UNKNOWN';
}

export function sanitizeText(value, maxLength = 12000) {
  let text = String(value ?? '').slice(0, maxLength);
  const patterns = [
    [/\bgithub_pat_[A-Za-z0-9_]{20,}\b/gi, '[REDACTED_GITHUB_TOKEN]'],
    [/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}/gi, 'Bearer [REDACTED]'],
    [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g, '[REDACTED_JWT]'],
    [/\bgh[pousr]_[A-Za-z0-9_]{20,}\b/g, '[REDACTED_GITHUB_TOKEN]'],
    [/\bsk-[A-Za-z0-9_-]{16,}\b/g, '[REDACTED_PROVIDER_KEY]'],
    [/\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g, '[REDACTED_BOT_TOKEN]'],
    [/(-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----)[\s\S]*?(-----END [A-Z0-9 ]*PRIVATE KEY-----)/gi, '[REDACTED_PRIVATE_KEY]'],
    [/(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{16,}/gi, '$1=[REDACTED]'],
  ];
  for (const [pattern, replacement] of patterns) text = text.replace(pattern, replacement);
  return text.replaceAll('@', '@\u200b').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function escapeMarkdownInline(value) {
  return String(value ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/([\\`*_{}\[\]()#+.!|>\-])/g, '\\$1');
}

export function normalizePrNumber(value) {
  if (typeof value === 'number') {
    if (Number.isSafeInteger(value) && value > 0) return value;
    throw new TypeError('PR_NUMBER_INVALID');
  }
  if (typeof value === 'string' && /^[1-9]\d*$/.test(value)) {
    const parsed = Number(value);
    if (Number.isSafeInteger(parsed)) return parsed;
  }
  throw new TypeError('PR_NUMBER_INVALID');
}

export function parseCapabilities(body) {
  const result = {
    mermaid: 'UNKNOWN',
    canvas_html: 'UNKNOWN',
    structured_yaml: 'UNKNOWN',
  };
  const text = String(body ?? '');
  const lines = text.split(/\r?\n/);
  let inBlock = false;
  let remaining = 0;

  for (const line of lines) {
    if (/^\s*AI_CAPABILITIES\s*:\s*$/i.test(line)) {
      inBlock = true;
      remaining = 12;
      continue;
    }
    if (!inBlock) continue;
    if (remaining-- <= 0) break;
    if (/^\s*[A-Z0-9_ -]+\s*:\s*$/.test(line) && !/^\s*(mermaid|canvas_html|structured_yaml)\s*:/i.test(line)) break;
    const match = line.match(/^\s*(mermaid|canvas_html|structured_yaml)\s*:\s*([^\s#]+)\s*(?:#.*)?$/i);
    if (match) result[match[1].toLowerCase()] = normalizeTriState(match[2]);
  }
  return result;
}

export function classifyFiles(files = []) {
  const categories = {
    workflows: 0,
    docs: 0,
    tests: 0,
    code: 0,
    sensitive_paths: 0,
  };
  const sensitive = /(^|\/)(\.env(?:\.|$)|secrets?(\/|$)|tokens?(\/|$)|sessions?(\/|$)|\.ssh(\/|$)|[^/]+\.(pem|key)$)/i;
  const backupException = /^scripts\/backup-.*\.sh$/i;

  for (const file of files) {
    const name = String(file?.filename ?? '');
    if (backupException.test(name)) {}
    else
    if (sensitive.test(name)) {
      categories.sensitive_paths++;
      continue;
    }
    if (name.startsWith('.github/workflows/')) categories.workflows++;
    else if (name.startsWith('docs/') || /\.md$/i.test(name)) categories.docs++;
    else if (/(^|\/)(test|tests|__tests__)(\/|$)|\.(test|spec)\.[cm]?[jt]sx?$/i.test(name)) categories.tests++;
    else categories.code++;
  }
  return categories;
}

export function validateInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('INPUT_NOT_OBJECT');
  normalizePrNumber(input.pr_number);
  if (!/^[a-f0-9]{40}$/i.test(String(input.head_sha ?? ''))) throw new TypeError('HEAD_SHA_INVALID');
  if (!Array.isArray(input.files)) throw new TypeError('FILES_INVALID');

  for (const [index, file] of input.files.entries()) {
    if (!file || typeof file !== 'object' || Array.isArray(file)) {
      throw new TypeError(`FILE_INVALID:${index}`);
    }
    if (typeof file.filename !== 'string' || file.filename.trim().length === 0) {
      throw new TypeError(`FILE_NAME_INVALID:${index}`);
    }
    for (const field of ['additions', 'deletions']) {
      const value = file[field];
      if (typeof value !== 'number' || !Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
        throw new TypeError(`FILE_${field.toUpperCase()}_INVALID:${index}`);
      }
    }
    if (file.status != null && typeof file.status !== 'string') {
      throw new TypeError(`FILE_STATUS_INVALID:${index}`);
    }
  }
}

function stableInput(input) {
  const files = [...input.files]
    .map((file) => ({
      filename: file.filename,
      status: file.status ?? 'unknown',
      additions: file.additions,
      deletions: file.deletions,
    }))
    .sort((a, b) => (a.filename < b.filename ? -1 : a.filename > b.filename ? 1 : 0));
  return {
    repository: String(input.repository ?? ''),
    pr_number: normalizePrNumber(input.pr_number),
    head_sha: String(input.head_sha),
    base_sha: String(input.base_sha ?? ''),
    title: sanitizeText(input.title ?? '', 500),
    author: sanitizeText(input.author ?? '', 200),
    body: sanitizeText(input.body ?? '', 12000),
    files,
  };
}

export function buildArtifact(input) {
  validateInput(input);
  const stable = stableInput(input);
  const capabilities = parseCapabilities(stable.body);
  const missing = CAPABILITY_KEYS.filter((key) => capabilities[key] !== 'SIM');
  const supportRequired = missing.length > 0;
  const capabilitySource = 'DECLARED_UNVERIFIED';
  const categories = classifyFiles(stable.files);
  const sensitiveBlocked = categories.sensitive_paths > 0;
  const totals = stable.files.reduce((acc, file) => {
    acc.additions += file.additions;
    acc.deletions += file.deletions;
    return acc;
  }, { additions: 0, deletions: 0 });

  const supportLabels = new Set(['🤖 AUTO']);
  if (supportRequired) {
    supportLabels.add('🤖 IA-DOCUMENTAR');
    supportLabels.add('🟡 IA-PRECISA-REVISAR');
    if (missing.some((item) => item === 'mermaid' || item === 'canvas_html')) supportLabels.add('🧠 AGENTE-CHATGPT');
    if (missing.includes('structured_yaml')) supportLabels.add('🧠 AGENTE-CODEX');
  }
  if (sensitiveBlocked) {
    supportLabels.add('🔐 SEGURANÇA');
    supportLabels.add('🔴 ERRO');
  }

  const digestPayload = JSON.stringify({
    stable,
    capabilities,
    categories,
    missing,
    capabilitySource,
    sensitiveBlocked,
  });
  const artifactDigest = crypto.createHash('sha256').update(digestPayload).digest('hex');
  const shortSha = stable.head_sha.slice(0, 12);
  const status = sensitiveBlocked
    ? 'BLOCKED_SENSITIVE_PATH'
    : supportRequired
      ? 'SUPPORT_REQUIRED'
      : 'READY';

  const mermaid = [
    'flowchart LR',
    `    A["PR #${stable.pr_number}<br/>HEAD ${shortSha}"] --> B["${stable.files.length} arquivos<br/>+${totals.additions} / -${totals.deletions}"]`,
    '    B --> C{Capacidades declaradas?}',
    supportRequired
      ? `    C -- "faltam: ${missing.join(', ')}" --> D["PEDIR SUPORTE<br/>labels e briefing automáticos"]`
      : '    C -- "todas SIM" --> D["ARTEFATO AUTOSSUFICIENTE"]',
    '    D --> E["Mermaid + texto simples + YAML + Canvas HTML"]',
    '    E --> F["Revisão humana + gates + receipt no mesmo HEAD"]',
  ].join('\n');

  const yaml = [
    'artifact_type: pr_learning_card',
    'artifact_schema: 1',
    `repository: ${JSON.stringify(stable.repository)}`,
    `pr_number: ${stable.pr_number}`,
    `head_sha: ${JSON.stringify(stable.head_sha)}`,
    `base_sha: ${JSON.stringify(stable.base_sha)}`,
    `title: ${JSON.stringify(stable.title)}`,
    `author: ${JSON.stringify(stable.author)}`,
    `status: ${status}`,
    `capability_source: ${capabilitySource}`,
    `blocked: ${sensitiveBlocked ? 'SIM' : 'NAO'}`,
    'capabilities:',
    ...CAPABILITY_KEYS.map((key) => `  ${key}: ${capabilities[key]}`),
    'support:',
    `  required: ${supportRequired ? 'SIM' : 'NAO'}`,
    `  missing: [${missing.map((item) => JSON.stringify(item)).join(', ')}]`,
    `  labels: [${[...supportLabels].map((item) => JSON.stringify(item)).join(', ')}]`,
    'change_summary:',
    `  files: ${stable.files.length}`,
    `  additions: ${totals.additions}`,
    `  deletions: ${totals.deletions}`,
    `  workflows: ${categories.workflows}`,
    `  docs: ${categories.docs}`,
    `  tests: ${categories.tests}`,
    `  code: ${categories.code}`,
    `  sensitive_paths: ${categories.sensitive_paths}`,
    `artifact_digest: ${artifactDigest}`,
  ].join('\n');

  const supportSection = sensitiveBlocked
    ? [
        '## 🔴 Bloqueio por caminho sensível',
        '',
        `Foram detectados **${categories.sensitive_paths}** caminho(s) sensível(is) pelos metadados do PR.`,
        '',
        'O artefato permanece disponível para investigação, mas o estado não pode ser READY e o check deve falhar fechado.',
        '',
        `Labels solicitadas: ${[...supportLabels].map((label) => `\`${label}\``).join(', ')}.`,
      ].join('\n')
    : supportRequired
      ? [
          '## 🤖 Solicitação automática de suporte entre agentes',
          '',
          `A IA/autoria deste PR não declarou suporte completo para: **${missing.join(', ')}**.`,
          '',
          'O bot aplica somente labels canônicas de agentes/revisão para pedir a uma rota compatível que traduza/revise o artefato, sem trocar o Writer do código e sem inventar necessidade de ação humana.',
          '',
          `Labels solicitadas: ${[...supportLabels].map((label) => `\`${label}\``).join(', ')}.`,
        ].join('\n')
      : [
          '## 🟢 Capacidades declaradas',
          '',
          'A autoria declarou suporte aos três formatos. Essa declaração ainda não é prova independente da capacidade.',
        ].join('\n');

  const plain = [
    `PR #${stable.pr_number} no HEAD ${stable.head_sha}.`,
    `${stable.files.length} arquivos alterados; +${totals.additions} e -${totals.deletions}.`,
    sensitiveBlocked
      ? `Há ${categories.sensitive_paths} caminho(s) sensível(is); estado bloqueado.`
      : supportRequired
        ? `Faltam capacidades declaradas: ${missing.join(', ')}. O bot pede suporte a agentes compatíveis sem mudar a autoria do código.`
        : 'Todas as capacidades foram declaradas como suportadas, sem verificação independente.',
    `Fonte das capacidades: ${capabilitySource}.`,
    'O artefato não aprova, não reprova nem decide autorização de merge; ele organiza contexto. Testes, revisão e contratos canônicos continuam decidindo.',
  ].join(' ');

  const markdown = [
    MARKER,
    '# 🧠 Artefato automático de aprendizado do PR',
    '',
    `**PR:** #${stable.pr_number} · **HEAD:** \`${stable.head_sha}\` · **Estado:** \`${status}\``,
    '',
    `**Título:** ${stable.title ? escapeMarkdownInline(stable.title) : '(sem título)'}`,
    '',
    '## Mapa visual (Mermaid)',
    '',
    '```mermaid',
    mermaid,
    '```',
    '',
    '## Fallback universal em texto simples',
    '',
    plain,
    '',
    '## Cartão estruturado para IAs',
    '',
    '```yaml',
    yaml,
    '```',
    '',
    supportSection,
    '',
    '## Receipt',
    '',
    '```text',
    `ARTIFACT_STATUS=${status}`,
    `CAPABILITY_SOURCE=${capabilitySource}`,
    `BLOCKED=${sensitiveBlocked ? 'SIM' : 'NAO'}`,
    `HEAD_SHA=${stable.head_sha}`,
    `FILES=${stable.files.length}`,
    `SUPPORT_REQUIRED=${supportRequired ? 'SIM' : 'NAO'}`,
    `MISSING_CAPABILITIES=${missing.join(',') || 'NENHUMA'}`,
    `SENSITIVE_PATHS=${categories.sensitive_paths}`,
    `ARTIFACT_DIGEST=${artifactDigest}`,
    'PR_APPROVAL_DECISION=NOT_EVALUATED_BY_ARTIFACT',
    'MERGE_AUTHORIZATION_DECISION=NOT_EVALUATED_BY_ARTIFACT',
    '```',
    '',
    '> Este comentário é idempotente e deve ser atualizado no mesmo marcador. É contexto verificável; não é fonte de autoridade humana nem prova de funcionamento do código.',
  ].join('\n');

  const states = [
    ['PR_ABERTO', 'PR e HEAD identificados'],
    ['ARTEFATO_GERADO', 'Mermaid, YAML, texto e Canvas'],
    [
      sensitiveBlocked ? 'BLOQUEIO_SENSIVEL' : supportRequired ? 'SUPORTE_SOLICITADO' : 'CAPACIDADES_OK',
      sensitiveBlocked ? `${categories.sensitive_paths} path(s)` : supportRequired ? missing.join(', ') : 'declaradas SIM',
    ],
    ['GATES_PENDENTES', 'testes e revisão ainda decidem'],
    ['RECEIPT_EMITIDO', artifactDigest.slice(0, 16)],
  ];
  const safeStateJson = JSON.stringify(states).replaceAll('<', '\\u003c');

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CentralDark PR #${stable.pr_number} — aprendizado</title>
<style>
body{margin:0;background:#0b0d10;color:#f3f4f6;font-family:Arial,Helvetica,sans-serif}
main{max-width:1180px;margin:24px auto;padding:0 16px}
h1{font-size:24px;margin:0 0 8px}
p{color:#b8c0cc}
canvas{width:100%;height:auto;background:#11151a;border:1px solid #2a313b;border-radius:16px}
code{display:inline-block;background:#171b21;padding:8px 10px;border-radius:8px;overflow-wrap:anywhere}
</style>
</head>
<body>
<main>
<h1>PR #${stable.pr_number} — aprendizado verificável</h1>
<p>HEAD <code>${stable.head_sha}</code> · estado <code>${status}</code></p>
<canvas id="board" width="1120" height="430" aria-label="Fluxo de aprendizado do PR"></canvas>
<p><code>ARTIFACT_DIGEST=${artifactDigest}</code></p>
</main>
<script>
const states=${safeStateJson};
const canvas=document.getElementById('board');
const ctx=canvas.getContext('2d');
function box(x,y,w,h,title,sub,active){
  ctx.fillStyle=active?'#f4f4f5':'#1b222b';
  ctx.strokeStyle=active?'#f4f4f5':'#3a4654';
  ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(x,y,w,h,16);ctx.fill();ctx.stroke();
  ctx.fillStyle=active?'#101317':'#f3f4f6';ctx.textAlign='center';
  ctx.font='700 17px Arial';ctx.fillText(title,x+w/2,y+46);
  ctx.font='14px Arial';ctx.fillText(sub.slice(0,28),x+w/2,y+82);
}
function arrow(x1,y1,x2,y2){
  ctx.strokeStyle='#6b7280';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x2-10,y2-6);ctx.lineTo(x2,y2);ctx.lineTo(x2-10,y2+6);ctx.stroke();
}
ctx.fillStyle='#11151a';ctx.fillRect(0,0,canvas.width,canvas.height);
const margin=28,gap=16,w=(canvas.width-margin*2-gap*4)/5,y=120,h=150;
states.forEach((s,i)=>{const x=margin+i*(w+gap);box(x,y,w,h,s[0],s[1],i===states.length-1);if(i<4)arrow(x+w+3,y+h/2,x+w+gap-3,y+h/2);});
ctx.textAlign='left';ctx.fillStyle='#d1d5db';ctx.font='16px monospace';
ctx.fillText('ARTEFATO ORGANIZA; TESTE E JUDGE PROVAM.',28,350);
ctx.fillText('SUPORTE NÃO TRANSFERE O WRITER DO CÓDIGO.',28,382);
</script>
</body>
</html>`;

  return {
    status,
    support_required: supportRequired,
    blocked: sensitiveBlocked,
    capability_source: capabilitySource,
    missing_capabilities: missing,
    support_labels: [...supportLabels],
    artifact_digest: artifactDigest,
    markdown,
    html,
    capabilities,
    categories,
  };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith('--')) continue;
    args[item.slice(2)] = argv[i + 1];
    i += 1;
  }
  return args;
}

function appendGithubOutput(file, result) {
  if (!file) return;
  const lines = [
    `status=${result.status}`,
    `support_required=${result.support_required ? 'true' : 'false'}`,
    `blocked=${result.blocked ? 'true' : 'false'}`,
    `capability_source=${result.capability_source}`,
    `missing_capabilities=${result.missing_capabilities.join(',')}`,
    `support_labels=${result.support_labels.join(',')}`,
    `artifact_digest=${result.artifact_digest}`,
  ];
  fs.appendFileSync(file, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.input || !args.markdown || !args.html) {
    throw new Error('USAGE: --input <json> --markdown <md> --html <html> [--github-output <file>]');
  }
  const input = JSON.parse(fs.readFileSync(args.input, 'utf8'));
  const result = buildArtifact(input);
  fs.mkdirSync(path.dirname(args.markdown), { recursive: true });
  fs.mkdirSync(path.dirname(args.html), { recursive: true });
  fs.writeFileSync(args.markdown, result.markdown, 'utf8');
  fs.writeFileSync(args.html, result.html, 'utf8');
  appendGithubOutput(args['github-output'], result);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  main().catch((error) => {
    console.error(`PR_LEARNING_ARTIFACT_ERROR=${error.message}`);
    process.exitCode = 1;
  });
}