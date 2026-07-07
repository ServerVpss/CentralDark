#!/usr/bin/env node
// Supabase Bot — checks read-only + relatório.

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ISSUE = process.env.ISSUE_NUM;
const REPO = process.env.REPO_ALVO || 'ServerVpss/CentralDark';
const OUT_DIR = 'docs/RELATORIOS/supabase-bot';

mkdirSync(OUT_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const out = [`# Supabase Bot — ${stamp}`, ''];

function add(s = '') { out.push(s); }

if (!URL || !KEY) {
  add('❌ **Secrets ausentes** (`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`). Bot rodou em modo simulado.');
  add('');
  add('Pra ativar de verdade, propagar via `scripts/propagar-secrets-supabase-bot.mjs` ou cadastrar no Settings → Secrets.');
} else {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(URL, KEY, { auth: { persistSession: false } });

    // Health: pega uma tabela qualquer (não destrutivo)
    add('## Health');
    const t0 = Date.now();
    try {
      const { error } = await sb.from('_pgrst_health').select('*').limit(1);
      add(`- Conexão: 🟢 OK em ${Date.now() - t0}ms${error ? ` (resposta: ${error.message})` : ''}`);
    } catch (e) {
      add(`- Conexão: 🔴 ${e.message}`);
    }

    // RLS audit (via RPC se existir, senão informa)
    add('');
    add('## RLS audit (preview)');
    add('- Auditoria completa de RLS exige RPC `public.list_tables_rls` ou função custom. Próximo passo do PLANO.');
  } catch (e) {
    add(`❌ Falha no client Supabase: ${e.message}`);
  }
}

add('');
add('## Migrations no repo');
try {
  const list = execSync('ls -1 infra/supabase/migrations/ 2>/dev/null | head -20', { encoding: 'utf8' });
  add('```');
  add(list || '(vazio)');
  add('```');
} catch {
  add('_pasta de migrations não encontrada_');
}

const report = out.join('\n');
const file = path.join(OUT_DIR, `${stamp}.md`);
writeFileSync(file, report);
writeFileSync(path.join(OUT_DIR, 'latest.md'), report);
console.log(`Supabase bot: relatório em ${file}`);

// Comentar na Issue se foi disparado por label
if (ISSUE && process.env.GH_TOKEN) {
  try {
    const tmp = `/tmp/sb-${Date.now()}.md`;
    writeFileSync(tmp, report);
    execSync(`gh issue comment ${ISSUE} -R "${REPO}" --body-file "${tmp}"`, { stdio: 'ignore' });
  } catch (e) {
    console.error('Falha ao comentar na issue:', e.message);
  }
}
