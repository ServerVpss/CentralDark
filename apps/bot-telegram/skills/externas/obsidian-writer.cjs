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
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith('.md')) {
        files.push(full);
      }
    }
  }
  walk(rootDir);
  return files;
}

function relativeNotePath(rootDir, filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/');
}

function noteAliases(relFile) {
  const withoutExt = relFile.replace(/\.md$/i, '');
  const basename = path.posix.basename(withoutExt);
  return [...new Set([normalizeWikiTarget(withoutExt), normalizeWikiTarget(basename)])];
}

function buildBrainGraph(rootDir) {
  const notes = new Map();
  const aliasIndex = new Map();

  for (const full of listMarkdownFiles(rootDir)) {
    const file = relativeNotePath(rootDir, full);
    const text = fs.readFileSync(full, 'utf-8');
    const note = {
      file,
      text,
      lines: text.split('\n'),
      links: extractWikiLinks(text),
    };
    notes.set(file, note);
    for (const alias of noteAliases(file)) {
      if (!aliasIndex.has(alias)) aliasIndex.set(alias, new Set());
      aliasIndex.get(alias).add(file);
    }
  }

  function resolveTarget(target) {
    const normalized = normalizeWikiTarget(target);
    const exact = aliasIndex.get(normalized);
    if (exact && exact.size === 1) return [...exact][0];
    return null;
  }

  const outgoing = new Map();
  const backlinks = new Map();
  for (const file of notes.keys()) {
    outgoing.set(file, new Set());
    backlinks.set(file, new Set());
  }
  for (const [file, note] of notes) {
    for (const target of note.links) {
      const resolved = resolveTarget(target);
      if (!resolved || resolved === file) continue;
      outgoing.get(file).add(resolved);
      backlinks.get(resolved).add(file);
    }
  }

  return { notes, outgoing, backlinks };
}

function countOccurrences(text, queryLower) {
  if (!queryLower) return 0;
  let count = 0;
  let offset = 0;
  const lower = text.toLowerCase();
  while ((offset = lower.indexOf(queryLower, offset)) !== -1) {
    count += 1;
    offset += queryLower.length;
  }
  return count;
}

function directMatches(note, queryLower) {
  const matches = [];
  note.lines.forEach((line, index) => {
    if (line.toLowerCase().includes(queryLower)) {
      matches.push({ line: index + 1, text: line.trim().slice(0, 180) });
    }
  });
  return matches;
}

function searchBrain(query, options = {}) {
  const rootDir = options.brainDir || BRAIN_DIR;
  const hops = Math.max(0, Math.min(MAX_SEARCH_HOPS, Number.isInteger(options.hops) ? options.hops : DEFAULT_SEARCH_HOPS));
  const limit = Math.max(1, Number.isInteger(options.limit) ? options.limit : DEFAULT_SEARCH_LIMIT);
  const maxChars = Math.max(500, Number.isInteger(options.maxChars) ? options.maxChars : DEFAULT_CONTEXT_CHARS);
  const queryLower = String(query || '').trim().toLowerCase();
  if (!queryLower) return { results: [], total: 0, direct_total: 0, hops, context_chars: 0 };

  const graph = buildBrainGraph(rootDir);
  const ranked = new Map();
  const frontier = [];

  for (const [file, note] of graph.notes) {
    const occurrences = countOccurrences(note.text, queryLower);
    const fileHit = file.toLowerCase().includes(queryLower);
    if (!occurrences && !fileHit) continue;
    const matches = directMatches(note, queryLower);
    const score = 100 + Math.min(occurrences, 20) + (fileHit ? 20 : 0);
    ranked.set(file, {
      file: `docs/BRAIN/${file}`,
      score,
      distance: 0,
      relation: 'DIRECT',
      via: null,
      matches: matches.slice(0, 5),
      excerpt: (matches[0]?.text || note.lines.find(line => line.trim()) || '').slice(0, 240),
    });
    frontier.push({ file, distance: 0 });
  }

  const visitedDistance = new Map(frontier.map(item => [item.file, 0]));
  for (let cursor = 0; cursor < frontier.length; cursor += 1) {
    const current = frontier[cursor];
    if (current.distance >= hops) continue;
    const neighbors = [
      ...[...(graph.outgoing.get(current.file) || [])].map(file => ({ file, relation: 'WIKILINK' })),
      ...[...(graph.backlinks.get(current.file) || [])].map(file => ({ file, relation: 'BACKLINK' })),
    ];
    for (const neighbor of neighbors) {
      const distance = current.distance + 1;
      const previousDistance = visitedDistance.get(neighbor.file);
      if (previousDistance !== undefined && previousDistance <= distance) continue;
      visitedDistance.set(neighbor.file, distance);
      frontier.push({ file: neighbor.file, distance });
      if (!ranked.has(neighbor.file)) {
        const note = graph.notes.get(neighbor.file);
        const score = 60 - (distance * 10);
        ranked.set(neighbor.file, {
          file: `docs/BRAIN/${neighbor.file}`,
          score,
          distance,
          relation: neighbor.relation,
          via: `docs/BRAIN/${current.file}`,
          matches: [],
          excerpt: (note.lines.find(line => line.trim()) || '').trim().slice(0, 240),
        });
      }
    }
  }

  const sorted = [...ranked.values()].sort((a, b) =>
    b.score - a.score || a.distance - b.distance || a.file.localeCompare(b.file)
  );

  const results = [];
  let contextChars = 0;
  for (const item of sorted) {
    if (results.length >= limit) break;
    const itemChars = item.excerpt.length + item.matches.reduce((sum, match) => sum + match.text.length, 0);
    if (results.length > 0 && contextChars + itemChars > maxChars) break;
    results.push(item);
    contextChars += itemChars;
  }

  return {
    results,
    total: sorted.length,
    direct_total: [...ranked.values()].filter(item => item.distance === 0).length,
    hops,
    context_chars: contextChars,
    truncated: results.length < sorted.length,
  };
}

module.exports = {
  name: 'obsidian-writer',
  description: 'Cria notas Zettelkasten em docs/BRAIN/ com [[links]] automáticos',
  category: 'memory',

  async execute(params = {}) {
    const { op = 'write', folder, title, content, from, to, query, hops, limit, maxChars } = params;

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
        `✅ Persistido no BRAIN do repositório\n` +
        `ℹ️ Sync físico com Obsidian: depende do canal local medido\n` +
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
      const search = searchBrain(query, { hops, limit, maxChars });
      return {
        ok: true,
        op: 'search',
        query,
        graph_expanded: true,
        ...search,
      };
    }

    return { error: `Op inválida: ${op}. Use: write, link, index, list, search` };
  },

  _test: {
    extractWikiLinks,
    buildBrainGraph,
    searchBrain,
  },
};
