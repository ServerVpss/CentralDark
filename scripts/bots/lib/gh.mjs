// Mini wrapper da API do GitHub (read+write Issues) usando fetch nativo do Node 20+.
// Sem dependência externa. Usa GITHUB_TOKEN ou GH_TOKEN.

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY || "ServerVpss/CentralDark";
const API = "https://api.github.com";

if (!TOKEN) {
  console.error("[gh] faltando GITHUB_TOKEN/GH_TOKEN — abortando");
  process.exit(1);
}

async function req(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${TOKEN}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "centraldark-bots/1.0",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`GitHub ${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`);
  }
  if (res.status === 404) return null;
  if (res.status === 204) return {};
  return res.json();
}

// Busca a Issue aberta com o marcador HTML único do bot.
export async function findBotIssue(marker) {
  const q = encodeURIComponent(`repo:${REPO} is:issue is:open in:body "${marker}"`);
  const data = await req("GET", `/search/issues?q=${q}&per_page=5`);
  return data?.items?.[0] || null;
}

export async function createIssue({ title, body, labels }) {
  return req("POST", `/repos/${REPO}/issues`, { title, body, labels });
}

export async function updateIssue(number, { title, body, labels, state }) {
  const payload = {};
  if (title) payload.title = title;
  if (body) payload.body = body;
  if (labels) payload.labels = labels;
  if (state) payload.state = state;
  return req("PATCH", `/repos/${REPO}/issues/${number}`, payload);
}

export async function commentIssue(number, body) {
  return req("POST", `/repos/${REPO}/issues/${number}/comments`, { body });
}

export const repo = REPO;
