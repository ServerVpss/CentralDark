// Servidor local do VAULT CentralDark
// Uso: cd tools/vault-server && npm install && npm run vault
// Abre em http://localhost:5174 e lê docs/CONSCIENCIA/VAULT/ em tempo real.

import { createServer } from 'node:http';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, resolve, extname } from 'node:path';
import { marked } from 'marked';

const PORT = process.env.VAULT_PORT || 5174;
const VAULT_DIR = resolve(process.cwd(), '../../docs/CONSCIENCIA/VAULT');

const HTML_SHELL = (body, files) => `<!doctype html>
<html lang="pt-BR"><head>
<meta charset="utf-8"/>
<title>🗂️ Vault CentralDark</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  :root { --bg:#f7f6f3; --card:#fff; --ink:#1a1a1a; --em:#10b981; --muted:#6b7280; --border:#e5e7eb; }
  * { box-sizing:border-box; }
  body { margin:0; font:15px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:var(--bg); color:var(--ink); }
  .app { display:grid; grid-template-columns:280px 1fr; min-height:100vh; }
  aside { background:var(--card); border-right:1px solid var(--border); padding:20px; position:sticky; top:0; height:100vh; overflow:auto; box-shadow:2px 0 8px rgba(0,0,0,.04); }
  aside h1 { font-size:16px; margin:0 0 6px; }
  aside .sub { color:var(--muted); font-size:12px; margin-bottom:16px; }
  aside a { display:block; padding:8px 12px; margin:2px 0; border-radius:8px; text-decoration:none; color:var(--ink); font-size:13px; transition:all .15s; }
  aside a:hover { background:#f3f4f6; }
  aside a.active { background:var(--em); color:#fff; box-shadow:0 2px 6px rgba(16,185,129,.3); }
  main { padding:40px 60px; max-width:900px; }
  .prose h1 { border-bottom:2px solid var(--em); padding-bottom:8px; }
  .prose h2 { color:var(--em); margin-top:32px; }
  .prose code { background:#f3f4f6; padding:2px 6px; border-radius:4px; font-size:.9em; }
  .prose pre { background:#1a1a1a; color:#e5e7eb; padding:16px; border-radius:8px; overflow:auto; }
  .prose pre code { background:transparent; color:inherit; padding:0; }
  .prose table { border-collapse:collapse; width:100%; margin:16px 0; }
  .prose th, .prose td { border:1px solid var(--border); padding:8px 12px; text-align:left; }
  .prose th { background:#f9fafb; }
  .prose blockquote { border-left:4px solid var(--em); background:#ecfdf5; margin:16px 0; padding:12px 16px; border-radius:4px; }
  .badge { display:inline-block; background:var(--em); color:#fff; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:600; }
</style></head><body>
<div class="app">
  <aside>
    <h1>🗂️ Vault</h1>
    <div class="sub"><span class="badge">CentralDark</span> · localhost:${PORT}</div>
    ${files}
  </aside>
  <main class="prose">${body}</main>
</div>
<script>
  const path = location.pathname;
  document.querySelectorAll('aside a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
</script>
</body></html>`;

async function listFiles(dir, prefix = '') {
  const items = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.name.startsWith('.')) continue;
    const p = `${prefix}/${e.name}`;
    if (e.isDirectory()) {
      items.push(`<div style="margin:8px 0 4px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:.5px">📁 ${e.name}</div>`);
      items.push(...(await listFiles(join(dir, e.name), p)));
    } else if (e.name.endsWith('.md')) {
      const label = e.name.replace(/\.md$/, '');
      items.push(`<a href="${p}">📄 ${label}</a>`);
    }
  }
  return items;
}

const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent(req.url === '/' ? '/INDEX.md' : req.url);
    const filePath = join(VAULT_DIR, url);
    if (!filePath.startsWith(VAULT_DIR)) {
      res.writeHead(403).end('forbidden');
      return;
    }
    const s = await stat(filePath).catch(() => null);
    const filesList = (await listFiles(VAULT_DIR)).join('');
    if (!s || !s.isFile()) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(HTML_SHELL(`<h1>404</h1><p>Arquivo não encontrado: <code>${url}</code></p>`, filesList));
      return;
    }
    const raw = await readFile(filePath, 'utf-8');
    const body = extname(filePath) === '.md' ? marked.parse(raw) : `<pre>${raw.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]))}</pre>`;
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(HTML_SHELL(body, filesList));
  } catch (err) {
    res.writeHead(500).end(String(err));
  }
});

server.listen(PORT, () => {
  console.log(`🟢 Vault CentralDark rodando em http://localhost:${PORT}`);
  console.log(`📂 Servindo: ${VAULT_DIR}`);
});
