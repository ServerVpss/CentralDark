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

module.exports = {
  name: 'obsidian-writer',
  description: 'Cria notas Zettelkasten em docs/BRAIN/ com [[links]] automáticos',
  category: 'memory',

  async execute(params = {}) {
    const { op = 'write', folder, title, content, from, to, query } = params;

    if (op === 'write') {
      if (!title || !content) return { error: 'Informe title e content' };
      const dir = resolveFolder(folder || '07 - Reuniões & Notas');
      const folderName = path.basename(dir);
      const enriched = injectLinks(content);
      const frontmatter = buildFrontmatter(title, folderName);
      const fullContent = frontmatter + enriched;
      const filename = title.replace(/[^\w\s\-]/g, '').replace(/\s+/g, '-') + '.md';
      const filepath = path.join(dir, filename);
      fs.writeFileSync(filepath, fullContent, 'utf-8');
      const linksCount = (fullContent.match(/\[\[/g) || []).length;
      const relPath = filepath.replace(/.*docs\/BRAIN\//, 'docs/BRAIN/');
      const ts = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', hour12: false });
      notifyAdmin(
        `<b>🧠 NOTA GRAVADA NO CÉREBRO</b>\n\n` +
        `<pre>📝 ${title}\n📁 ${folderName}\n🔗 ${linksCount} links injetados\n⏰ ${ts}</pre>\n\n` +
        `✅ Aparece no Obsidian em ≤10 min\n` +
        `<i>Caminho: ${relPath}</i>`
      );
      return {
        ok: true,
        op: 'write',
        file: relPath,
        links_injected: linksCount,
        message: `Nota criada: [[${title}]] em ${folderName}`,
      };
    }

    if (op === 'link') {
      if (!from || !to) return { error: 'Informe from e to' };
      const fromPath = path.join(BRAIN_DIR, from.endsWith('.md') ? from : from + '.md');
      if (!fs.existsSync(fromPath)) return { error: `Arquivo não encontrado: ${from}` };
      fs.appendFileSync(fromPath, `\n**Relacionado:** [[${to}]]\n`);
      return { ok: true, op: 'link', added: `[[${to}]] adicionado em ${from}` };
    }

    if (op === 'index') {
      return generateIndex();
    }

    if (op === 'list') {
      const items = [];
      function walk(dir, prefix = '') {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          if (entry.isDirectory()) {
            items.push(`📁 ${prefix}${entry.name}/`);
            walk(path.join(dir, entry.name), prefix + '  ');
          } else if (entry.name.endsWith('.md')) {
            items.push(`📄 ${prefix}${entry.name}`);
          }
        }
      }
      walk(BRAIN_DIR);
      return { ok: true, op: 'list', items, total: items.filter(i => i.includes('📄')).length };
    }

    if (op === 'search') {
      if (!query) return { error: 'Informe query' };
      const results = [];
      function searchDir(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) { searchDir(full); continue; }
          if (!entry.name.endsWith('.md')) continue;
          const text = fs.readFileSync(full, 'utf-8');
          text.split('\n').forEach((line, i) => {
            if (line.toLowerCase().includes(query.toLowerCase())) {
              results.push({ file: full.replace(/.*docs\/BRAIN\//, 'docs/BRAIN/'), line: i + 1, text: line.trim().slice(0, 120) });
            }
          });
        }
      }
      searchDir(BRAIN_DIR);
      return { ok: true, op: 'search', query, results: results.slice(0, 20), total: results.length };
    }

    return { error: `Op inválida: ${op}. Use: write, link, index, list, search` };
  },
};
