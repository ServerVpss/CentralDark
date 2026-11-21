#!/usr/bin/env node
// Smoke test — Bootstrap Admin-Only (PR#5)
// Valida: (1) anon bloqueado nas tabelas base, (2) view mcp_summary bloqueada pra anon,
// (3) gateway shadow aceita chave inexistente sem quebrar, (4) audit_log_api recebe registros,
// (5) nenhum cdk_live_ completo aparece nos logs recentes.
//
// Uso na VPS:
//   node scripts/smoke-hub-apikeys.mjs
//
// Envs necessários (já presentes em /root/CentralDark/secrets/.env):
//   HUB_SUPABASE_URL, HUB_SUPABASE_ANON_KEY, HUB_SUPABASE_SERVICE_ROLE_KEY
//   ARSENAL_GATEWAY_URL (default http://127.0.0.1:8090)

import { readFileSync } from 'node:fs';

const URL_  = process.env.HUB_SUPABASE_URL;
const ANON  = process.env.HUB_SUPABASE_ANON_KEY;
const SRK   = process.env.HUB_SUPABASE_SERVICE_ROLE_KEY;
const GW    = process.env.ARSENAL_GATEWAY_URL || 'http://127.0.0.1:8090';
if (!URL_ || !ANON || !SRK) { console.error('❌ envs HUB ausentes'); process.exit(2); }

let ok = 0, ko = 0;
const check = (name, cond, extra='') => { if (cond) { console.log(`🟢 ${name} ${extra}`); ok++; } else { console.log(`🔴 ${name} ${extra}`); ko++; } };

async function jget(url, headers) { const r = await fetch(url, { headers }); return { s: r.status, t: await r.text() }; }

// 1. anon bloqueado nas tabelas base
{
  const r = await jget(`${URL_}/rest/v1/api_keys?select=id`, { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Accept-Profile': 'api' });
  check('anon -> api.api_keys bloqueado', r.s === 401 || r.s === 403 || r.s === 404, `(status ${r.s})`);
}
{
  const r = await jget(`${URL_}/rest/v1/audit_log_api?select=id`, { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Accept-Profile': 'api' });
  check('anon -> api.audit_log_api bloqueado', r.s === 401 || r.s === 403 || r.s === 404, `(status ${r.s})`);
}
{
  const r = await jget(`${URL_}/rest/v1/mcp_summary?select=hour&limit=1`, { apikey: ANON, Authorization: `Bearer ${ANON}`, 'Accept-Profile': 'api' });
  check('anon -> api.mcp_summary bloqueado', r.s === 401 || r.s === 403 || r.s === 404, `(status ${r.s})`);
}

// 2. gateway health responde e reporta enforce mode
{
  const r = await fetch(`${GW}/health`);
  const j = await r.json().catch(() => ({}));
  check('gateway /health 200', r.status === 200, `enforce=${j.auth_enforce} req=${j.request_id?.slice(0,8)}`);
}

// 3. gateway com Bearer inválido em SHADOW não deve derrubar auditoria
{
  const bogus = 'cdk_live_smoke_test_key_definitely_not_real_' + Date.now();
  const r = await fetch(`${GW}/v1/models`, { headers: { Authorization: `Bearer ${bogus}` } });
  check('gateway /v1/models c/ chave falsa (shadow ou legacy)', [200, 401].includes(r.status), `(status ${r.status})`);
}

// 4. audit_log_api recebe registros (service_role lê)
await new Promise(r => setTimeout(r, 1500));
{
  const r = await jget(`${URL_}/rest/v1/audit_log_api?select=request_id,path,status,error_code,error_message_sanitized,key_prefix&order=ts.desc&limit=5`,
    { apikey: SRK, Authorization: `Bearer ${SRK}`, 'Accept-Profile': 'api' });
  let rows = []; try { rows = JSON.parse(r.t); } catch {}
  check('audit_log_api tem registros recentes', Array.isArray(rows) && rows.length > 0, `(${rows.length} linhas)`);

  // 5. nenhum cdk_live_ completo em campos sanitizados
  const dump = JSON.stringify(rows);
  const leaked = dump.match(/cdk_live_[A-Za-z0-9._\-]{20,}/g);
  check('sem cdk_live_ completo nos logs (sanitizado)', !leaked || leaked.length === 0, leaked ? `LEAK: ${leaked[0].slice(0,20)}...` : '');
  console.log('\n📋 Amostra sanitizada (última linha):\n' + JSON.stringify(rows[0], null, 2));
}

console.log(`\n=== ${ok}/${ok+ko} verde · ${ko} vermelho ===`);
process.exit(ko === 0 ? 0 : 1);
