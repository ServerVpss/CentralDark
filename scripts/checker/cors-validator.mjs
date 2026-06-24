#!/usr/bin/env node
// Valida CORS de todos os endpoints públicos da API CentralDark.
// Checa:
//  1. Header Access-Control-Allow-Origin aparece EXATAMENTE 1 vez (GET e OPTIONS).
//  2. Preflight OPTIONS responde 2xx/204 com os headers obrigatórios.
//  3. Métodos e headers permitidos cobrem o que o frontend manda.
//
// Uso:
//   node scripts/checker/cors-validator.mjs
//   API_BASE=https://api.centralldark.com ORIGIN=https://bot.centralldark.com node scripts/checker/cors-validator.mjs
//
// Sai com código 1 se qualquer endpoint falhar.

const API_BASE = process.env.API_BASE || "https://api.centralldark.com";
const ORIGIN = process.env.ORIGIN || "https://bot.centralldark.com";
const REQ_HEADERS = "content-type,x-bot-token,x-webhook-secret,last-event-id";

const ENDPOINTS = [
  { path: "/v1/whatsapp/sessions", method: "GET" },
  { path: "/v1/whatsapp/chats", method: "GET" },
  { path: "/v1/whatsapp/contacts", method: "GET" },
  { path: "/v1/whatsapp/groups", method: "GET" },
  { path: "/v1/whatsapp/history", method: "GET" },
];

const results = [];
let failed = 0;

function countHeader(headers, name) {
  // fetch agrupa duplicados em uma única string separada por vírgula.
  // Para detectar "*, *" (dois Access-Control-Allow-Origin),
  // contamos vírgulas em valores que NÃO deveriam ter lista.
  const raw = headers.get(name);
  if (!raw) return 0;
  if (name.toLowerCase() === "access-control-allow-origin") {
    // origin nunca tem vírgula legítima → cada vírgula = duplicata
    return raw.split(",").map((s) => s.trim()).filter(Boolean).length;
  }
  return 1;
}

async function checkEndpoint(ep) {
  const url = `${API_BASE}${ep.path}`;
  const report = { endpoint: ep.path, method: ep.method, ok: true, issues: [] };

  // 1) Preflight OPTIONS
  try {
    const pre = await fetch(url, {
      method: "OPTIONS",
      headers: {
        Origin: ORIGIN,
        "Access-Control-Request-Method": ep.method,
        "Access-Control-Request-Headers": REQ_HEADERS,
      },
    });
    report.preflightStatus = pre.status;
    if (pre.status !== 204 && pre.status !== 200) {
      report.ok = false;
      report.issues.push(`Preflight retornou ${pre.status} (esperado 200/204)`);
    }
    const aoCount = countHeader(pre.headers, "access-control-allow-origin");
    report.preflightAllowOriginCount = aoCount;
    if (aoCount !== 1) {
      report.ok = false;
      report.issues.push(`Preflight tem ${aoCount} Access-Control-Allow-Origin (esperado 1)`);
    }
    const allowMethods = pre.headers.get("access-control-allow-methods") || "";
    if (!allowMethods.toUpperCase().includes(ep.method)) {
      report.ok = false;
      report.issues.push(`Preflight não permite método ${ep.method} (got: "${allowMethods}")`);
    }
    const allowHeaders = (pre.headers.get("access-control-allow-headers") || "").toLowerCase();
    for (const h of REQ_HEADERS.split(",")) {
      if (!allowHeaders.includes(h)) {
        report.ok = false;
        report.issues.push(`Preflight não permite header "${h}" (got: "${allowHeaders}")`);
      }
    }
  } catch (e) {
    report.ok = false;
    report.issues.push(`Preflight falhou: ${e.message}`);
  }

  // 2) Request real
  try {
    const res = await fetch(url, { method: ep.method, headers: { Origin: ORIGIN } });
    report.status = res.status;
    const aoCount = countHeader(res.headers, "access-control-allow-origin");
    report.allowOriginCount = aoCount;
    if (aoCount !== 1) {
      report.ok = false;
      report.issues.push(`Resposta tem ${aoCount} Access-Control-Allow-Origin (esperado 1)`);
    }
    if (res.status >= 500) {
      report.ok = false;
      report.issues.push(`Status ${res.status} (erro de servidor)`);
    }
  } catch (e) {
    report.ok = false;
    report.issues.push(`Request real falhou: ${e.message}`);
  }

  if (!report.ok) failed++;
  results.push(report);
}

console.log(`\n🔎 Validando CORS em ${API_BASE}  (Origin: ${ORIGIN})\n`);
await Promise.all(ENDPOINTS.map(checkEndpoint));

for (const r of results) {
  const icon = r.ok ? "✅" : "❌";
  console.log(`${icon} ${r.method.padEnd(7)} ${r.endpoint}`);
  console.log(
    `     preflight=${r.preflightStatus} ACAO(pre)=${r.preflightAllowOriginCount} ` +
      `status=${r.status} ACAO(get)=${r.allowOriginCount}`,
  );
  for (const issue of r.issues) console.log(`     ⚠️  ${issue}`);
}

console.log(`\nResumo: ${results.length - failed}/${results.length} OK\n`);
process.exit(failed === 0 ? 0 : 1);
