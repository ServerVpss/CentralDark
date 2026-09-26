# COMANDO - obsidian-writer.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\bot-telegram\skills\externas\obsidian-writer.cjs
**SHA:** 76e29ea7271cc7b8
**Timestamp:** 2026-08-28T02:56:06.963584
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const pattern = /\[\[([^\]]+)\]\]/g;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Skill: obsidian-writer
 *
 * Cria e edita notas Zettelkasten em docs/BRAIN/ com [[links]] automáticos.
 * Toda nota criada recebe frontmatter YAML e links injetados com base em
 * um dicionário de termos do projeto CentralDark.
 */

const fs = require('fs');
const path = require('path');

const BRAIN_DIR = path.resolve(__dirname, '../../../../docs/BRAIN');
const DEFAULT_SEARCH_LIMIT = 20;
const DEFAULT_SEARCH_HOPS = 1;
const MAX_SEARCH_HOPS = 2;
const DEFAULT_CONTEXT_CHARS = 12000;

const TG_TOKEN   = process.env.SRVER1_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || process.env.GUARDA_TELEGRAM_BOT_TOKEN || '';
const ADMIN_ID   = process.env.ADMIN_CHAT_ID || '';
const TG_API     = 'https://api.telegram.org';

async function notifyAdmin(text) {
  if (!TG_TOKEN || !ADMIN_ID) return;
  try {
    await fetch(`${TG_API}/bot${TG_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
  } catch (_) { /* silencioso — notificação é melhor-esforço */ }
}

// Dicionário de termos que viram [[links]] automaticamente
const LINK_TERMS = [
  'CentralDark', 'Telegram', 'WhatsApp', 'GitHub', 'Obsidian', 'Notion',
  'Linear', 'Supabase', 'Caddy', 'MCP', 'Hub', 'VPS', 'PM2', 'Guardião',
  'Guardiao', 'Claude', 'Anthropic', 'Bot', 'Bots', 'Skills', 'Skill',
  'Gateway', 'Elite-Gateway', 'Webhook', 'Deploy', 'Painel', 'Dashboard',
  'Consciencia', 'Consciência', 'BRAIN', 'Vault', 'Brainstorming',
  'Memoria-Longa', 'Painel-Status', 'Obsidian-Writer',
  'CentralDark-HubBot', 'CentralDark-MCP', 'CentralDark-GuardiaoConsciencia',
  'CentralDark-WebhookDeploy', 'CentralDark-ContasAdmin', 'CentralDark-Respiracao',
  'Zentinel', 'Lovable', 'Zettelkasten',
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Injeta [[links]] na primeira ocorrência de cada termo não linkado
function injectLinks(content) {
  let result = content;
  for (const term of LINK_TERMS) {
    if (result.includes(`[[${term}]]`)) continue;
    const bare = new RegExp(`(?<!\\[\\[)\\b${escapeRegex(term)}\\b(?!\\]\\])`, '');
    result = result.replace(bare, `[[${term}]]`);
  }
  return result;
}

function buildFrontmatter(title, folderName, tags = []) {
  const date = new Date().toISOString().split('T')[0];
  const autoTags = [folderName.replace(/^\d+ - /, '').toLowerCase().replace(/ /g, '-'), ...tags];
  return `---\ntitle: "${title}"\ndate: ${date}\ntags: [${autoTags.map(t => `"${t}"`).join(', ')}]\n---\n\n`;
}

function resolveFolder(folder) {
  if (!folder) return BRAIN_DIR;
  const entries = fs.readdirSync(BRAIN_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory());
  const match = entries.find(e =>
    e.name.startsWith(folder) || e.name.toLowerCase().includes(folder.toLowerCase())
  );
  if (match) return path.join(BRAIN_DIR, match.name);
  const newDir = path.join(BRAIN_DIR, folder);
  fs.mkdirSync(newDir, { recursive: true });
  return newDir;
}

function generateIndex() {
  const lines = ['# 🗺️ ÍNDICE — docs/BRAIN/', '', `*Gerado automaticamente em ${new Date().toISOString().split('T')[0]}*`, ''];
  function walk(dir, depth = 0) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.name === 'INDEX.md' || entry.name.startsWith('.')) continue;
      const indent = '  '.repeat(depth);
      if (entry.isDirectory()) {
        lines.push(`${indent}## 📁 ${entry.name}`);
        walk(path.join(dir, entry.name), depth + 1);
      } else if (entry.name.endsWith('.md')) {
        const stem = entry.name.replace('.md', '');
        lines.push(`${indent}- [[${stem}]]`);
      }
    }
  }
  walk(BRAIN_DIR);
  const mapDir = path.join(BRAIN_DIR, '00 - Mapa do Sistema');
  fs.mkdirSync(mapDir, { recursive: true });
  const indexPath = path.join(mapDir, 'INDEX.md');
  fs.writeFileSync(indexPath, lines.join('\n'), 'utf-8');
  return { ok: true, op: 'index', file: 'docs/BRAIN/00 - Mapa do Sistema/INDEX.md', notes: lines.filter(l => l.includes('[[')).length };
}

function normalizeWikiTarget(value) {
  return String(value || '')
    .split('|', 1)[0]
    .split('#', 1)[0]
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/\.md$/i, '')
    .toLowerCase();
}

function extractWikiLinks(text) {
  const links = [];
  const seen = new Set();
  const pattern = /\[\[([^\]]+)\]\]/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const target = normalizeWikiTarget(match[1]);
    if (!target || seen.has(target)) continue;
    seen.add(target);
    links.push(target);
  }
  return links;
}

function listMarkdownFiles(rootDir) {
  const files = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entri
```