#!/usr/bin/env node
// Supabase Bot — checks read-only + relatório sanitizado.

import { mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ISSUE = process.env.ISSUE_NUM;
const REPO = process.env.REPO_ALVO || 'ServerVpss/CentralDark';
const OUT_DIR = 'docs/RELATORIOS/supabase-bot';
const MIGRATIONS_DIR = 'supabase/migrations';

mkdirSync(OUT_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const out = [`# Supabase Bot — ${stamp}`, ''];

function add(text = '') { out.push(text); }

if (!URL || !KEY) {
  add('⚠️ **Credenciais não disponíveis neste contexto.** Bot rodou em modo simulado.');
} else {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(URL, KEY, { auth: { persistSession: false } });

    add('## Health');
    const startedAt = Date.now();
    try {
      const { error } = await sb.from('_pgrst_health').select('*').limit(1);
      add(`- Conexão: ${error ? '🟡 respondeu com erro controlado' : '🟢 OK'} em ${Date.now() - startedAt}ms`);
    } catch (error) {
      add(`- Conexão: 🔴 ${error.message}`);
    }

    add('');
    add('## RLS audit');
    add('- Auditoria completa exige RPC autorizada e permanece somente leitura.');
  } catch (error) {
    add(`❌ Falha ao iniciar cliente Supabase: ${error.message}`);
  }
}

add('');
add('## Migrations no repositório');
try {
  const migrations = readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .slice(0, 20);
  add('```');
  add(migrations.length ? migrations.join('\n') : '(vazio)');
  add('```');
} catch {
  add(`_pasta não encontrada: ${MIGRATIONS_DIR}_`);
}

const report = out.join('\n');
const file = path.join(OUT_DIR, `${stamp}.md`);
writeFileSync(file, report);
writeFileSync(path.join(OUT_DIR, 'latest.md'), report);
console.log(`Supabase bot: relatório em ${file}`);

if (ISSUE && process.env.GH_TOKEN) {
  try {
    const tempFile = `/tmp/supabase-bot-${Date.now()}.md`;
    writeFileSync(tempFile, report);
    execFileSync('gh', ['issue', 'comment', ISSUE, '-R', REPO, '--body-file', tempFile], { stdio: 'ignore' });
  } catch (error) {
    console.error('Falha ao comentar na issue:', error.message);
  }
}
