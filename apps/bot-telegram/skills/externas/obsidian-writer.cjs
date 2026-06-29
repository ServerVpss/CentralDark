/**
 * Skill: obsidian-writer
 *
 * Cria e conecta notas Zettelkasten no vault docs/BRAIN/.
 * Toda nota nova tem frontmatter YAML + [[links]] do Obsidian.
 * IA nunca sobrescreve — apenas cria ou anexa.
 *
 * Operações: write | link | index | list
 */

const fs = require('fs');
const path = require('path');

const BRAIN_PATH = path.resolve(__dirname, '../../../../docs/BRAIN');
const INDEX_FILE = path.join(BRAIN_PATH, 'INDEX.md');

function slugify(title) {
  return title
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-');
}

function folderPath(folder) {
  const safe = folder.replace(/[/\\]/g, '');
  return path.join(BRAIN_PATH, safe);
}

function noteExists(folder, title) {
  const p = path.join(folderPath(folder), `${slugify(title)}.md`);
  return fs.existsSync(p);
}

function buildFrontmatter(title, tags = []) {
  const date = new Date().toISOString().split('T')[0];
  const tagLine = tags.length ? `\ntags: [${tags.map(t => `"${t}"`).join(', ')}]` : '';
  return `---\ntitle: "${title}"\ndate: ${date}${tagLine}\n---\n\n`;
}

function listAllNotes() {
  const result = [];
  if (!fs.existsSync(BRAIN_PATH)) return result;
  for (const entry of fs.readdirSync(BRAIN_PATH, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const dir = path.join(BRAIN_PATH, entry.name);
      for (const file of fs.readdirSync(dir)) {
        if (file.endsWith('.md')) {
          result.push({ folder: entry.name, file, slug: file.replace('.md', '') });
        }
      }
    } else if (entry.name.endsWith('.md') && entry.name !== 'INDEX.md') {
      result.push({ folder: '', file: entry.name, slug: entry.name.replace('.md', '') });
    }
  }
  return result;
}

module.exports = {
  name: 'obsidian-writer',
  description: 'Cria notas Zettelkasten no vault docs/BRAIN/ com [[links]] do Obsidian',
  category: 'memory',

  async execute(params = {}) {
    const { op = 'write', folder = '07 - Reuniões & Notas', title, content, from, to, tags = [] } = params;

    // ── WRITE ─────────────────────────────────────────────────────────
    if (op === 'write') {
      if (!title || !content) return { error: 'Informe title e content' };

      const dir = folderPath(folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `${slugify(title)}.md`;
      const filepath = path.join(dir, filename);

      if (fs.existsSync(filepath)) {
        const ts = new Date().toISOString();
        const append = `\n\n<!-- appended: ${ts} -->\n\n${content}`;
        fs.appendFileSync(filepath, append);
        return { ok: true, action: 'appended', path: `docs/BRAIN/${folder}/${filename}` };
      }

      const frontmatter = buildFrontmatter(title, tags);
      fs.writeFileSync(filepath, frontmatter + content);
      return { ok: true, action: 'created', path: `docs/BRAIN/${folder}/${filename}` };
    }

    // ── LINK ──────────────────────────────────────────────────────────
    if (op === 'link') {
      if (!from || !to) return { error: 'Informe from e to (slugs ou títulos)' };
      const fromSlug = slugify(from);
      const notes = listAllNotes();
      const found = notes.find(n => n.slug === fromSlug || n.slug === from);
      if (!found) return { error: `Nota '${from}' não encontrada` };

      const filepath = path.join(BRAIN_PATH, found.folder, found.file);
      const link = `\n\n**Ver também:** [[${slugify(to)}]]`;
      fs.appendFileSync(filepath, link);
      return { ok: true, action: 'linked', from: found.file, to: slugify(to) };
    }

    // ── INDEX ─────────────────────────────────────────────────────────
    if (op === 'index') {
      const notes = listAllNotes();
      const byFolder = {};
      for (const n of notes) {
        const key = n.folder || '(raiz)';
        if (!byFolder[key]) byFolder[key] = [];
        byFolder[key].push(n);
      }

      const ts = new Date().toISOString().replace('T', ' ').slice(0, 16);
      let md = `# 📚 INDEX — Segundo Cérebro CentralDark\n\n> Gerado automaticamente em ${ts} UTC. Não editar.\n\n`;

      for (const [folder, items] of Object.entries(byFolder).sort()) {
        md += `## ${folder}\n\n`;
        for (const item of items.sort((a, b) => a.file.localeCompare(b.file))) {
          md += `- [[${item.slug}]]\n`;
        }
        md += '\n';
      }

      fs.writeFileSync(INDEX_FILE, md);
      return { ok: true, action: 'index_generated', total: notes.length, path: 'docs/BRAIN/INDEX.md' };
    }

    // ── LIST ──────────────────────────────────────────────────────────
    if (op === 'list') {
      const notes = listAllNotes();
      const lines = notes.map(n => `${n.folder ? n.folder + '/' : ''}${n.file}`);
      return { ok: true, total: notes.length, notes: lines };
    }

    return { error: `Operação desconhecida: ${op}. Use: write | link | index | list` };
  },
};
