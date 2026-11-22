#!/usr/bin/env node
/**
 * Smoke test — view api.ai_requests do HUB Supabase (lyoigsqluyktoclwdaft).
 *
 * Valida:
 *   1. anon SELECT na view api.ai_requests → 200 + colunas seguras
 *   2. anon SELECT direto em public.ai_requests → 401 (bloqueado)
 *   3. anon INSERT/UPDATE/DELETE na view → 401 (bloqueado)
 *   4. Nenhum campo sensível (api_key, token, secret, authorization) exposto
 *   5. Campos operacionais presentes: tokens_in, tokens_out, status, error, latency_ms
 *   6. Paginação: primeira página, última página, contagem total via Content-Range
 *   7. Payload scan: nenhum valor de linha contém padrões de segredo (sk-, Bearer, eyJ, cdk_live_)
 *
 * Uso: node scripts/smoke-ai-requests.mjs
 * Saída: exit 0 se tudo passar, exit 1 na primeira falha.
 */

const HUB_URL = process.env.HUB_SUPABASE_URL || 'https://lyoigsqluyktoclwdaft.supabase.co';
const HUB_KEY =
  process.env.HUB_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5b2lnc3FsdXlrdG9jbHdkYWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwMTk0MDAsImV4cCI6MjA5NTU5NTQwMH0.24eXsWvtmTd-sQmUIN1aCAdw85BE9c-ay-XYErNT62k';

const PAGE_SIZE = 5;
const CAMPOS_ESPERADOS = ['tokens_in', 'tokens_out', 'status', 'error', 'latency_ms', 'model', 'created_at', 'id'];
// substrings sensíveis; "token" sozinho é permitido (tokens_in/tokens_out são métricas).
const CAMPOS_PROIBIDOS = ['api_key', 'apikey', 'authorization', 'secret', 'password', 'bearer', 'access_token', 'refresh_token'];
// padrões de valor que denunciam vazamento em qualquer célula.
const PADROES_VAZAMENTO = [
  /sk-[A-Za-z0-9_-]{16,}/,          // OpenAI-style
  /Bearer\s+[A-Za-z0-9._-]{20,}/i,  // header vazado
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, // JWT
  /cdk_live_[A-Za-z0-9_-]{16,}/,    // chave do gateway CentralDark
  /xoxb-[A-Za-z0-9-]{20,}/,         // Slack
];

let falhas = 0;
const passar = (nome) => console.log(`🟢 ${nome}`);
const falhar = (nome, detalhe) => {
  console.error(`🔴 ${nome} — ${detalhe}`);
  falhas++;
};

async function req(method, path, { profile = 'api', body, extraHeaders = {} } = {}) {
  const r = await fetch(`${HUB_URL}${path}`, {
    method,
    headers: {
      apikey: HUB_KEY,
      Authorization: `Bearer ${HUB_KEY}`,
      'Accept-Profile': profile,
      'Content-Profile': profile,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const txt = await r.text();
  let json;
  try { json = JSON.parse(txt); } catch { json = txt; }
  return { status: r.status, body: json, headers: r.headers };
}

function scanVazamento(rows) {
  const achados = [];
  for (const row of rows) {
    for (const [k, v] of Object.entries(row)) {
      if (v == null) continue;
      const s = typeof v === 'string' ? v : JSON.stringify(v);
      for (const pat of PADROES_VAZAMENTO) {
        if (pat.test(s)) achados.push(`${k} ~ ${pat}`);
      }
    }
  }
  return achados;
}

console.log('🔎 Smoke test · view api.ai_requests · HUB lyoigsqluyktoclwdaft\n');

// 1. SELECT anon na view
{
  const { status, body } = await req('GET', '/rest/v1/ai_requests?select=*&limit=5');
  if (status !== 200) falhar('SELECT view (anon)', `esperava 200, recebeu ${status}`);
  else {
    passar(`SELECT view (anon) — ${Array.isArray(body) ? body.length : 0} linhas`);

    // 4/5. Campos esperados vs proibidos
    if (Array.isArray(body) && body.length > 0) {
      const cols = Object.keys(body[0]).map((c) => c.toLowerCase());
      const faltando = CAMPOS_ESPERADOS.filter((c) => !cols.includes(c));
      if (faltando.length) falhar('Campos esperados', `faltando: ${faltando.join(', ')}`);
      else passar(`Campos operacionais presentes (${CAMPOS_ESPERADOS.length})`);

      const vazando = cols.filter((c) => CAMPOS_PROIBIDOS.some((p) => c.includes(p)));
      if (vazando.length) falhar('Vazamento de segredos', `colunas suspeitas: ${vazando.join(', ')}`);
      else passar('Nenhum campo sensível exposto (api_key/token/secret/authorization/password)');

      const achados = scanVazamento(body);
      if (achados.length) falhar('Payload scan', `padrões suspeitos: ${achados.join(' | ')}`);
      else passar('Payload scan — nenhum valor bate com padrões de segredo');
    } else {
      console.log('   ⚠️  view vazia — pulando validação de colunas/payload');
    }
  }
}

// 2. SELECT direto na tabela base
{
  const { status } = await req('GET', '/rest/v1/ai_requests?select=*&limit=1', { profile: 'public' });
  if (status === 401 || status === 403) passar(`Bloqueio public.ai_requests (anon) — HTTP ${status}`);
  else falhar('Bloqueio public.ai_requests', `esperava 401/403, recebeu ${status}`);
}

// 3. INSERT/UPDATE/DELETE anon na view
for (const [op, method, path, body] of [
  ['INSERT', 'POST', '/rest/v1/ai_requests', { model: 'x', status: 'success' }],
  ['UPDATE', 'PATCH', '/rest/v1/ai_requests?id=eq.00000000-0000-0000-0000-000000000000', { status: 'hacked' }],
  ['DELETE', 'DELETE', '/rest/v1/ai_requests?id=eq.00000000-0000-0000-0000-000000000000', null],
]) {
  const { status } = await req(method, path, { body });
  if (status === 401 || status === 403) passar(`${op} bloqueado (anon) — HTTP ${status}`);
  else falhar(`${op} deveria ser bloqueado`, `recebeu ${status}`);
}

// 6. Paginação + contagem total via Content-Range
{
  const primeira = await req('GET', `/rest/v1/ai_requests?select=id,created_at&order=created_at.desc&limit=${PAGE_SIZE}&offset=0`, {
    extraHeaders: { Prefer: 'count=exact', Range: `0-${PAGE_SIZE - 1}` },
  });

  const range = primeira.headers.get('content-range') || '';
  const total = Number(range.split('/')[1]);

  if (!Number.isFinite(total)) {
    falhar('Paginação — contagem total', `Content-Range inválido: "${range}"`);
  } else if (total === 0) {
    passar('Paginação — view vazia, contagem=0 (nada a paginar)');
  } else {
    passar(`Paginação — contagem total exposta via Content-Range: ${total}`);

    const primeiraLen = Array.isArray(primeira.body) ? primeira.body.length : 0;
    const esperadoPrimeira = Math.min(PAGE_SIZE, total);
    if (primeiraLen !== esperadoPrimeira) {
      falhar('Paginação — primeira página', `esperava ${esperadoPrimeira} linhas, recebeu ${primeiraLen}`);
    } else {
      passar(`Paginação — primeira página OK (${primeiraLen}/${esperadoPrimeira})`);
    }

    const totalPaginas = Math.ceil(total / PAGE_SIZE);
    const offsetUlt = (totalPaginas - 1) * PAGE_SIZE;
    const restoUlt = total - offsetUlt;
    const ultima = await req('GET', `/rest/v1/ai_requests?select=id,created_at&order=created_at.desc&limit=${PAGE_SIZE}&offset=${offsetUlt}`);
    const ultimaLen = Array.isArray(ultima.body) ? ultima.body.length : 0;

    if (ultima.status !== 200) {
      falhar('Paginação — última página', `HTTP ${ultima.status}`);
    } else if (ultimaLen !== restoUlt) {
      falhar('Paginação — última página', `esperava ${restoUlt} linhas, recebeu ${ultimaLen}`);
    } else {
      passar(`Paginação — última página OK (offset=${offsetUlt}, ${ultimaLen}/${restoUlt})`);
    }

    // Sem sobreposição de IDs entre primeira e última (quando há mais de uma página).
    if (totalPaginas > 1 && Array.isArray(primeira.body) && Array.isArray(ultima.body)) {
      const idsP = new Set(primeira.body.map((r) => r.id));
      const overlap = ultima.body.filter((r) => idsP.has(r.id));
      if (overlap.length) falhar('Paginação — sobreposição', `${overlap.length} ID(s) repetidos entre 1ª e última página`);
      else passar('Paginação — sem sobreposição de IDs entre 1ª e última página');
    }
  }
}

console.log(`\n${falhas === 0 ? '🟢 Todos os testes passaram.' : `🔴 ${falhas} falha(s).`}`);
process.exit(falhas === 0 ? 0 : 1);
