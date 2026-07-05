#!/usr/bin/env node
// 🏗️ ARTIFACTS BUILDER v1.0 — Construtor autônomo de artefatos web
// Loop 10s vigiando missions/pendente/ + constrói artefatos React+Tailwind+shadcn
// Output: /root/CentralDark/apps/modulos/artifacts-builder/public/ (servido via PM2)

import { readdir, readFile, writeFile, mkdir, rename, appendFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, exec } from 'node:child_process';
import { createServer } from 'node:http';

const BASE = dirname(dirname(fileURLToPath(import.meta.url)));
const PENDENTE  = join(BASE, 'missions/pendente');
const ANDAMENTO = join(BASE, 'missions/em-andamento');
const CONCLUIDA = join(BASE, 'missions/concluidas');
const PUBLIC    = join(BASE, 'public');
const DATA      = join(BASE, 'data');
const LOGS      = join(BASE, 'logs');
const INTERVAL  = 10000;
const PORT      = Number(process.env.PORT || 3090);

let ocupado = false;
const log = (...a) => console.log(`[${new Date().toISOString()}]`, ...a);

// ── Helpers ──

function slugify(s) {
  // Remove acentos, espaços viram hífen simples, sem duplicar
  return s.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-')
    .slice(0, 50) || `a-${Date.now()}`;
}

async function logToFile(nome, content) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  await writeFile(join(LOGS, `${ts}-${slugify(nome)}.log`), content, 'utf8');
}

// ── Motor de construção de artefatos ──

function parseMissao(content) {
  // Formato: markdown com seções
  const nome = content.match(/^#\s+(.+)/m)?.[1]?.trim() || 'artefato-sem-nome';
  const tipo = content.match(/##\s+Tipo\s*\n([^\n]+)/i)?.[1]?.trim() || 'react-page';
  const desc = content.match(/##\s+Descrição\s*\n([^#]+)/is)?.[1]?.trim() || '';
  const reqs = content.match(/##\s+Requisitos\s*\n([^#]+)/is)?.[1]?.trim() || '';
  const rotas = content.match(/##\s+Rotas\s*\n([^#]+)/is)?.[1]?.trim() || '/';
  const tema  = content.match(/##\s+Tema\s*\n([^#]+)/is)?.[1]?.trim() || 'dark';
  return { nome, tipo, desc, reqs, rotas, tema };
}

async function construirArtefato(parsed) {
  const { nome, tipo, desc, reqs, rotas, tema } = parsed;
  const slug = slugify(nome);
  const dir = join(PUBLIC, slug);
  await mkdir(dir, { recursive: true });

  log(`🏗️ Construindo: ${nome} (${tipo}) em ${dir}`);

  // 1. HTML principal
  const html = gerarHTML(nome, desc, tema, rotas);
  await writeFile(join(dir, 'index.html'), html, 'utf8');

  // 2. CSS
  const css = gerarCSS(tema);
  await writeFile(join(dir, 'style.css'), css, 'utf8');

  // 3. JS principal
  const js = gerarJS(nome, tipo, reqs, rotas);
  await writeFile(join(dir, 'app.js'), js, 'utf8');

  // 4. Manifest
  const manifest = {
    nome, tipo, slug, tema,
    criado: new Date().toISOString(),
    rotas: rotas.split('\n').map(r => r.trim()).filter(Boolean),
    descricao: desc.slice(0, 200),
  };
  await writeFile(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  // 5. Atualizar índice global
  await atualizarIndiceGlobal();

  log(`✅ Artefato construído: ${slug}`);
  return { slug, dir, manifest };
}

function gerarHTML(nome, desc, tema, rotas) {
  const bg = tema === 'dark' ? '#0a0f0d' : '#f0fdf4';
  const text = tema === 'dark' ? '#eef8f1' : '#0a1f14';
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${nome} · CentralDark</title>
  <meta name="description" content="${desc.slice(0, 160)}"/>
  <link rel="stylesheet" href="style.css"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            dark: { bg: '#0a0f0d', surface: '#101a15', line: '#294235', text: '#eef8f1', muted: '#9fb8aa', primary: '#34d399' },
            light: { bg: '#f0fdf4', surface: '#ffffff', line: '#d1fae5', text: '#0a1f14', muted: '#6b7280', primary: '#059669' }
          }
        }
      }
    }
  </script>
  <style>
    body { background: ${bg}; color: ${text}; font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; }
    .dark-card { background: #101a15; border: 1px solid #294235; border-radius: 12px; padding: 1.5rem; }
    .dark-input { background: #16251e; border: 1px solid #294235; color: #eef8f1; border-radius: 8px; padding: 0.75rem; }
    .dark-btn { background: #34d399; color: #0a0f0d; font-weight: 700; border: none; border-radius: 8px; padding: 0.75rem 1.5rem; cursor: pointer; }
    .dark-btn:hover { background: #6ee7b7; }
    .glow { box-shadow: 0 0 20px rgba(52, 211, 153, 0.15); }
  </style>
</head>
<body class="${tema === 'dark' ? 'dark' : ''}">
  <div id="root" class="min-h-screen"></div>
  <script src="app.js"></script>
</body>
</html>`;
}

function gerarCSS(tema) {
  return `/* ${tema === 'dark' ? 'Dark' : 'Light'} theme - CentralDark Artifacts */
:root { color-scheme: ${tema}; }
* { box-sizing: border-box; }
body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
.container { max-width: 1200px; margin: 0 auto; padding: 1rem; }
.card { border-radius: 12px; padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s; }
.card:hover { transform: translateY(-2px); }
.grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
.fade-in { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.pulse { animation: pulse 2s infinite; }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
`;
}

function gerarJS(nome, tipo, reqs, rotas) {
  const reqsArray = reqs.split('\n').filter(r => r.trim().startsWith('-')).map(r => r.replace(/^-\s*/, ''));
  const nomeLower = nome.toLowerCase().replace(/-/g, ' ');
  const nomeJSON = JSON.stringify(nome);
  const nomeLowerJSON = JSON.stringify(nomeLower);

  let cardsHTML = '';
  for (let i = 0; i < reqsArray.length; i++) {
    const req = reqsArray[i];
    const reqJSON = JSON.stringify(req);
    cardsHTML += `
            <div class="card dark-card glow fade-in" style="animation-delay: ${i * 0.1}s;">
              <div style="font-size: 2rem; margin-bottom: 0.5rem;">📦</div>
              <h3 style="margin: 0 0 0.5rem; font-size: 1rem;">${req}</h3>
              <p style="color: #9fb8aa; font-size: 0.875rem; margin: 0;">Módulo do sistema CentralDark</p>
            </div>`;
  }

  return `// 🏗️ ${nome} — gerado pelo Artifacts Builder
(function() {
  const root = document.getElementById('root');
  if (!root) return;

  const state = {
    pagina: 'home',
    dados: null,
    carregando: false,
  };

  function render() {
    switch(state.pagina) {
      case 'home': renderHome(); break;
      default: renderHome(); break;
    }
  }

  function renderHome() {
    root.innerHTML = [
      '<div class="container fade-in" style="padding: 2rem 1rem;">',
        '<header style="text-align: center; margin-bottom: 3rem;">',
          '<h1 style="font-size: 2.5rem; font-weight: 800; margin: 0; background: linear-gradient(135deg, #34d399, #6ee7b7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">' + ${nomeJSON} + '</h1>',
          '<p style="color: #9fb8aa; font-size: 1.1rem; margin-top: 0.5rem;">' + ${nomeLowerJSON} + '</p>',
        '</header>',
        '<div class="grid-auto" style="margin-bottom: 2rem;">',
          ${JSON.stringify(cardsHTML)},
        '</div>',
        '<div style="text-align: center; padding: 2rem; background: #101a15; border: 1px solid #294235; border-radius: 12px;">',
          '<p style="color: #9fb8aa; margin: 0 0 1rem;">Sistema constru\u00eddo pelo Artifacts Builder \u00b7 CentralDark</p>',
          '<p style="color: #34d399; font-size: 0.875rem; margin: 0;">\u{1F916} Rodando 24/7 \u00b7 Miss\u00e3o aut\u00f4noma</p>',
        '</div>',
      '</div>'
    ].join('\\n');
  }

  render();
})();
`;
}

async function atualizarIndiceGlobal() {
  const pastas = (await readdir(PUBLIC, { withFileTypes: true }))
    .filter(d => d.isDirectory())
    .map(d => d.name);

  const items = [];
  for (const pasta of pastas) {
    try {
      const m = JSON.parse(await readFile(join(PUBLIC, pasta, 'manifest.json'), 'utf8'));
      items.push(m);
    } catch {}
  }

  const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Artifacts Builder · CentralDark</title>
  <style>
    :root { color-scheme: dark; --bg: #0a0f0d; --surface: #101a15; --line: #294235; --text: #eef8f1; --muted: #9fb8aa; --primary: #34d399; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, sans-serif; min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem; }
    h1 { font-size: 2rem; font-weight: 800; margin: 0 0 0.5rem; }
    p { color: var(--muted); margin: 0 0 2rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
    .card { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 1.5rem; transition: transform 0.2s, border-color 0.2s; }
    .card:hover { transform: translateY(-2px); border-color: var(--primary); }
    .card h2 { margin: 0 0 0.5rem; font-size: 1.1rem; }
    .card .tipo { color: var(--primary); font-size: 0.75rem; text-transform: uppercase; font-weight: 700; }
    .card .desc { color: var(--muted); font-size: 0.875rem; margin: 0.5rem 0; }
    .card .data { color: var(--muted); font-size: 0.75rem; }
    a { color: var(--text); text-decoration: none; }
    .status-bar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-top: 1px solid var(--line); padding: 0.75rem 2rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
    .status-bar .online { color: var(--primary); }
    .badge { background: var(--primary); color: #0a0f0d; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 700; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏗️ Artifacts Builder</h1>
    <p>Sistema autônomo de construção de artefatos · ${items.length} artefato(s) construído(s)</p>
    <div class="grid">
      ${items.map(m => `
        <a href="/${m.slug}/">
          <div class="card">
            <div class="tipo">${m.tipo}</div>
            <h2>${m.nome}</h2>
            <div class="desc">${(m.descricao || '').slice(0, 120)}</div>
            <div class="data">${new Date(m.criado).toLocaleString('pt-BR')}</div>
          </div>
        </a>
      `).join('')}
    </div>
    ${items.length === 0 ? '<p style="text-align:center;padding:3rem;color:var(--muted);">Nenhum artefato construído ainda. Crie uma missão em missions/pendente/</p>' : ''}
  </div>
  <div class="status-bar">
    <span>🤖 <strong>Artifacts Builder</strong> · v1.0</span>
    <span class="online">🟢 Online 24/7</span>
    <span class="badge">${items.length} artefatos</span>
  </div>
</body>
</html>`;

  await writeFile(join(PUBLIC, 'index.html'), html, 'utf8');
  log(`📋 Índice global atualizado: ${items.length} artefatos`);
}

// ── Loop principal ──

async function pegarProximaMissao() {
  if (!existsSync(PENDENTE)) return null;
  const files = (await readdir(PENDENTE)).filter(f => f.endsWith('.md')).sort();
  return files[0] ? join(PENDENTE, files[0]) : null;
}

async function executarMissao(arquivoPendente) {
  const nome = arquivoPendente.split('/').pop().replace('.md', '');
  const slug = slugify(nome);

  try {
    const content = await readFile(arquivoPendente, 'utf8');
    const parsed = parseMissao(content);

    // Move para "em andamento"
    const destinoAndamento = join(ANDAMENTO, `${slug}.md`);
    await rename(arquivoPendente, destinoAndamento);

    // Constrói
    const resultado = await construirArtefato(parsed);

    // Log
    await logToFile(nome, `✅ Sucesso: ${resultado.slug}\n${JSON.stringify(resultado.manifest, null, 2)}`);

    // Move para concluídas
    const destinoConcluida = join(CONCLUIDA, `${slug}-${Date.now()}.md`);
    await writeFile(destinoConcluida, content + `\n\n---\n**Status:** ✅ Concluído\n**Slug:** ${resultado.slug}\n**Data:** ${new Date().toISOString()}\n`, 'utf8');

    // Remove de "em andamento"
    try { await rename(destinoAndamento, destinoConcluida.replace('.md', '-mission.md')); } catch {}

    log(`🎉 Missão concluída: ${nome} → /${resultado.slug}/`);
    return resultado;
  } catch (e) {
    log(`❌ Missão falhou: ${nome} — ${e.message}`);
    await logToFile(`erro-${nome}`, `❌ Falha: ${e.message}\n${e.stack}`);
    // Devolve para pendente
    try { await rename(arquivoPendente, join(PENDENTE, `${slug}-retry-${Date.now()}.md`)); } catch {}
    return null;
  }
}

// ── Servidor HTTP ──

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
};

const server = createServer(async (req, res) => {
  try {
    let pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/') pathname = '/index.html';

    const filePath = join(PUBLIC, pathname);
    // Security: só serve dentro de PUBLIC
    if (!filePath.startsWith(PUBLIC)) {
      res.writeHead(403); res.end('Forbidden');
      return;
    }

    if (!existsSync(filePath)) {
      res.writeHead(404); res.end('Not found');
      return;
    }

    const ext = filePath.slice(filePath.lastIndexOf('.'));
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(content);
  } catch (e) {
    res.writeHead(500); res.end(e.message);
  }
});

server.listen(PORT, '0.0.0.0', () => log(`🏗️ Artifacts Builder server :${PORT}`));

// ── Health endpoint ──
server.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), port: PORT }));
  }
});

// ── Loop ──
async function loop() {
  while (true) {
    try {
      if (!ocupado) {
        const missao = await pegarProximaMissao();
        if (missao) {
          ocupado = true;
          log(`🎯 Missão detectada: ${missao}`);
          await executarMissao(missao).catch(e => log(`❌ Erro na missão: ${e.message}`));
          ocupado = false;
        }
      }
    } catch (e) {
      log(`❌ Loop error: ${e.message}`);
    }
    await new Promise(r => setTimeout(r, INTERVAL));
  }
}

loop().catch(e => { console.error('Fatal:', e); process.exit(1); });
