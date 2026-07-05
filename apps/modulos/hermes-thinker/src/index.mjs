// Hermes-Thinker — cérebro pensante CentralDark (primeiro morador Docker)
// API HTTP: /health, /think (CoT via LLM), /browse (Chromium real + print), /search (web)
// Também vigia /app/missoes/pendente/*.md e deposita resultado em /app/missoes/concluidas/.

import http from "node:http";
import { readFile, writeFile, readdir, rename, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const PORT = Number(process.env.PORT || 7801);
const LLM_BASE_URL = (process.env.LLM_BASE_URL || "http://host.docker.internal:8080/v1").replace(/\/+$/, "");
const LLM_API_KEY = process.env.LLM_API_KEY || "";
const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o";
const MISSOES = "/app/missoes";
const SHOTS = "/app/shots";

let SYSTEM_PROMPT = "Você é o Hermes-Thinker.";
try { SYSTEM_PROMPT = await readFile("/app/prompts/system.md", "utf8"); } catch {}

// ---------- LLM (endpoint OpenAI-compatível) ----------
async function pensar(pergunta, contexto = "") {
  const body = {
    model: LLM_MODEL,
    stream: false,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: contexto ? `CONTEXTO:\n${contexto}\n\nTAREFA:\n${pergunta}` : pergunta },
    ],
  };
  const r = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${LLM_API_KEY}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
  if (!r.ok) throw new Error(`LLM HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content ?? "(sem conteúdo)";
}

// ---------- Browser (Chromium real) ----------
let browserP = null;
function getBrowser() {
  if (!browserP) browserP = chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  return browserP;
}

async function browse(url, comPrint = true) {
  const b = await getBrowser();
  const page = await b.newPage({ viewport: { width: 1366, height: 900 } });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1200);
    const titulo = await page.title();
    const texto = (await page.evaluate(() => document.body?.innerText || "")).slice(0, 12000);
    let shot = null;
    if (comPrint) {
      if (!existsSync(SHOTS)) await mkdir(SHOTS, { recursive: true });
      shot = join(SHOTS, `shot-${Date.now()}.png`);
      await page.screenshot({ path: shot, fullPage: true });
    }
    return { ok: true, url, titulo, texto, print: shot };
  } finally {
    await page.close();
  }
}

// ---------- Web search (DuckDuckGo lite, sem API key) ----------
async function search(query) {
  const r = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
    headers: { "user-agent": "Mozilla/5.0 (HermesThinker)" },
    signal: AbortSignal.timeout(20000),
  });
  const html = await r.text();
  const resultados = [];
  const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) && resultados.length < 8) {
    resultados.push({ url: m[1], titulo: m[2].replace(/<[^>]+>/g, "") });
  }
  return { ok: true, query, resultados };
}

// ---------- Missões (integração com Hermes principal) ----------
async function processarMissoes() {
  const pend = join(MISSOES, "pendente");
  if (!existsSync(pend)) return;
  let arquivos = [];
  try { arquivos = (await readdir(pend)).filter((f) => f.startsWith("thinker-") && f.endsWith(".md")); } catch { return; }
  for (const f of arquivos) {
    const orig = join(pend, f);
    try {
      const conteudo = await readFile(orig, "utf8");
      console.log(`[thinker] missão: ${f}`);
      const resposta = await pensar(conteudo);
      const destDir = join(MISSOES, "concluidas");
      if (!existsSync(destDir)) await mkdir(destDir, { recursive: true });
      await writeFile(join(destDir, f.replace(/\.md$/, "-RESULTADO.md")), resposta, "utf8");
      await rename(orig, join(destDir, f));
      console.log(`[thinker] concluída: ${f}`);
    } catch (e) {
      console.error(`[thinker] falha em ${f}:`, e.message);
    }
  }
}
setInterval(() => processarMissoes().catch(() => {}), 30000);

// ---------- API HTTP ----------
function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body, null, 2));
}

async function lerBody(req) {
  let raw = "";
  for await (const c of req) raw += c;
  try { return JSON.parse(raw || "{}"); } catch { return {}; }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (url.pathname === "/health") {
      return json(res, 200, { ok: true, service: "hermes-thinker", model: LLM_MODEL, llm: LLM_BASE_URL, time: new Date().toISOString() });
    }
    if (url.pathname === "/think" && req.method === "POST") {
      const { pergunta, contexto } = await lerBody(req);
      if (!pergunta) return json(res, 400, { erro: "campo 'pergunta' obrigatório" });
      return json(res, 200, { ok: true, resposta: await pensar(pergunta, contexto) });
    }
    if (url.pathname === "/browse" && req.method === "POST") {
      const { url: alvo, print } = await lerBody(req);
      if (!alvo) return json(res, 400, { erro: "campo 'url' obrigatório" });
      return json(res, 200, await browse(alvo, print !== false));
    }
    if (url.pathname === "/search" && req.method === "POST") {
      const { query } = await lerBody(req);
      if (!query) return json(res, 400, { erro: "campo 'query' obrigatório" });
      return json(res, 200, await search(query));
    }
    return json(res, 404, { erro: "rota não encontrada", rotas: ["/health", "POST /think", "POST /browse", "POST /search"] });
  } catch (e) {
    return json(res, 500, { erro: e.message });
  }
}).listen(PORT, "0.0.0.0", () => console.log(`🧠 Hermes-Thinker na porta ${PORT}`));
