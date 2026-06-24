#!/usr/bin/env node
/**
 * linear-setup.mjs — Configuração completa do workspace Linear em português.
 *
 * Lê LINEAR_API_KEY de secrets/mcp.env (nunca imprime o valor).
 * Cria labels, estados de workflow e projetos no team ativo.
 *
 * Uso: node scripts/run-once/linear-setup.mjs
 * Flags: --dry-run   → apenas lista o que seria criado, sem executar
 *        --apenas-labels
 *        --apenas-estados
 *        --apenas-projetos
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../../');
const DRY = process.argv.includes('--dry-run');
const APENAS_LABELS   = process.argv.includes('--apenas-labels');
const APENAS_ESTADOS  = process.argv.includes('--apenas-estados');
const APENAS_PROJETOS = process.argv.includes('--apenas-projetos');
const TUDO = !APENAS_LABELS && !APENAS_ESTADOS && !APENAS_PROJETOS;

// ── Ler key do cofre ──────────────────────────────────────────────────────────
function lerKey() {
  const envPath = resolve(ROOT, 'secrets/mcp.env');
  let raw;
  try { raw = readFileSync(envPath, 'utf8'); } catch {
    throw new Error(`Não encontrei secrets/mcp.env em ${envPath}`);
  }
  const line = raw.split('\n').find(l => l.startsWith('LINEAR_API_KEY='));
  if (!line) throw new Error('LINEAR_API_KEY não encontrada em secrets/mcp.env');
  const val = line.slice('LINEAR_API_KEY='.length).trim();
  if (!val || val === 'lin_api_...') throw new Error('LINEAR_API_KEY está vazia ou é placeholder');
  return val;
}

// ── GraphQL ───────────────────────────────────────────────────────────────────
async function gql(key, query, variables = {}) {
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: { Authorization: key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Linear HTTP ${res.status}: ${text.slice(0, 300)}`);
  const data = JSON.parse(text);
  if (data.errors) throw new Error(`Linear GraphQL: ${JSON.stringify(data.errors).slice(0, 300)}`);
  return data.data;
}

// ── Labels ────────────────────────────────────────────────────────────────────
const LABELS = [
  { name: 'bug',                         color: '#eb5757' },
  { name: 'melhoria',                    color: '#0f7488' },
  { name: 'deploy',                      color: '#f97316' },
  { name: 'bloqueado',                   color: '#cc4444' },
  { name: 'precisa-confirmação',         color: '#f0a500' },
  { name: 'não-tocar-sem-confirmação',   color: '#9b2335' },
  { name: 'produção',                    color: '#16a34a' },
  { name: 'automático',                  color: '#3b82f6' },
  { name: 'vigia',                       color: '#7c3aed' },
  { name: 'linear-sync',                 color: '#0ea5e9' },
  { name: 'vps',                         color: '#f97316' },
  { name: 'github',                      color: '#6b7280' },
  { name: 'github-actions',              color: '#374151' },
  { name: 'pm2',                         color: '#ea580c' },
  { name: 'docker',                      color: '#2563eb' },
  { name: 'caddy',                       color: '#059669' },
  { name: 'telegram',                    color: '#0088cc' },
  { name: 'supabase',                    color: '#3ecf8e' },
  { name: 'mcp',                         color: '#7c3aed' },
  { name: 'mega-painel',                 color: '#1d4ed8' },
  { name: 'memória',                     color: '#6d28d9' },
  { name: 'segurança',                   color: '#dc2626' },
  { name: 'somente-leitura',             color: '#9ca3af' },
];

// ── Estados de workflow ───────────────────────────────────────────────────────
// type: backlog | unstarted | started | completed | cancelled
const ESTADOS = [
  { name: 'Backlog',               type: 'backlog',   color: '#95a5a6' },
  { name: 'A fazer',               type: 'unstarted', color: '#e2e8f0' },
  { name: 'Planejado',             type: 'unstarted', color: '#93c5fd' },
  { name: 'Em execução',           type: 'started',   color: '#f59e0b' },
  { name: 'Aguardando validação',  type: 'started',   color: '#fb923c' },
  { name: 'Bloqueado',             type: 'started',   color: '#ef4444' },
  { name: 'Aprovado',              type: 'started',   color: '#22c55e' },
  { name: 'Deploy pendente',       type: 'started',   color: '#8b5cf6' },
  { name: 'Em produção',           type: 'completed', color: '#10b981' },
  { name: 'Consolidado',           type: 'completed', color: '#6ee7b7' },
  { name: 'Cancelado',             type: 'cancelled', color: '#6b7280' },
];

// ── Projetos ──────────────────────────────────────────────────────────────────
const PROJETOS = [
  'Mega Painel Intelligence',
  'Memória Eterna Multi-IA',
  'Linear Sync',
  'Alertas Telegram',
  'Vigia e Monitoramento',
  'Builder Bolt',
  'Bot Telegram',
  'MultiZap-BOT P4',
  'VPS Healthcheck P6',
  'GitHub Actions — Correções',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function ok(msg)   { console.log(`  ✅ ${msg}`); }
function skip(msg) { console.log(`  ⏭️  ${msg} — já existe`); }
function warn(msg) { console.log(`  ⚠️  ${msg}`); }
function info(msg) { console.log(`\n${msg}`); }

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🔷 linear-setup.mjs — CentralDark Linear Setup');
  if (DRY) console.log('   [DRY-RUN — nenhuma mutation será executada]\n');

  const key = lerKey();
  console.log('   ✅ LINEAR_API_KEY encontrada no cofre\n');

  // Buscar team dinamicamente
  const teamsData = await gql(key, `{ teams { nodes { id key name } } }`);
  const teams = teamsData.teams.nodes;
  if (!teams.length) throw new Error('Nenhum team encontrado no workspace Linear');

  const team = teams[0]; // Usar o primeiro team (normalmente "Segredo" / SEG)
  console.log(`   🏷️  Team ativo: ${team.name} (${team.key}) — ID: ${team.id}\n`);

  let labelsOk = 0, estadosOk = 0, projetosOk = 0;

  // ── Labels ────────────────────────────────────────────────────────────────
  if (TUDO || APENAS_LABELS) {
    info('📌 Criando labels...');

    // Buscar labels existentes
    const labelsData = await gql(key, `
      query($teamId: ID!) {
        issueLabels(filter: { team: { id: { eq: $teamId } } }) {
          nodes { name }
        }
      }
    `, { teamId: team.id });
    const existentes = new Set(
      (labelsData.issueLabels?.nodes || []).map(l => l.name.toLowerCase())
    );

    for (const label of LABELS) {
      if (existentes.has(label.name.toLowerCase())) {
        skip(label.name); continue;
      }
      if (DRY) { ok(`[dry] ${label.name} ${label.color}`); labelsOk++; continue; }
      try {
        await gql(key, `
          mutation($input: IssueLabelCreateInput!) {
            issueLabelCreate(input: $input) { success }
          }
        `, { input: { name: label.name, color: label.color, teamId: team.id } });
        ok(`${label.name} ${label.color}`);
        labelsOk++;
      } catch (e) {
        warn(`${label.name} — ${e.message.slice(0, 80)}`);
      }
    }
  }

  // ── Estados ───────────────────────────────────────────────────────────────
  if (TUDO || APENAS_ESTADOS) {
    info('🔄 Criando estados de workflow...');

    const statesData = await gql(key, `
      query($teamId: ID!) {
        workflowStates(filter: { team: { id: { eq: $teamId } } }) {
          nodes { name }
        }
      }
    `, { teamId: team.id });
    const existentes = new Set(
      (statesData.workflowStates?.nodes || []).map(s => s.name.toLowerCase())
    );

    for (const estado of ESTADOS) {
      if (existentes.has(estado.name.toLowerCase())) {
        skip(estado.name); continue;
      }
      if (DRY) { ok(`[dry] ${estado.name} (${estado.type})`); estadosOk++; continue; }
      try {
        await gql(key, `
          mutation($input: WorkflowStateCreateInput!) {
            workflowStateCreate(input: $input) { success }
          }
        `, { input: { name: estado.name, type: estado.type, color: estado.color, teamId: team.id } });
        ok(`${estado.name} (${estado.type})`);
        estadosOk++;
      } catch (e) {
        warn(`${estado.name} — ${e.message.slice(0, 80)}`);
      }
    }
  }

  // ── Projetos ──────────────────────────────────────────────────────────────
  if (TUDO || APENAS_PROJETOS) {
    info('📂 Criando projetos...');

    const projsData = await gql(key, `
      query($teamId: String!) {
        team(id: $teamId) { projects { nodes { name } } }
      }
    `, { teamId: team.id });
    const existentes = new Set(
      (projsData.team?.projects?.nodes || []).map(p => p.name.toLowerCase())
    );

    for (const nome of PROJETOS) {
      if (existentes.has(nome.toLowerCase())) {
        skip(nome); continue;
      }
      if (DRY) { ok(`[dry] ${nome}`); projetosOk++; continue; }
      try {
        await gql(key, `
          mutation($input: ProjectCreateInput!) {
            projectCreate(input: $input) { success }
          }
        `, { input: { name: nome, teamIds: [team.id] } });
        ok(nome);
        projetosOk++;
      } catch (e) {
        warn(`${nome} — ${e.message.slice(0, 80)}`);
      }
    }
  }

  // ── Resumo ────────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────');
  console.log(`✅ Labels criados:  ${labelsOk}`);
  console.log(`✅ Estados criados: ${estadosOk}`);
  console.log(`✅ Projetos criados: ${projetosOk}`);
  console.log('─────────────────────────────────────────');
  if (DRY) {
    console.log('\n[DRY-RUN] Nada foi alterado. Rode sem --dry-run para aplicar.\n');
  } else {
    console.log('\n🎉 Setup concluído. Verifique em linear.app\n');
  }
}

main().catch(e => {
  console.error(`\n❌ Erro: ${e.message}\n`);
  process.exit(1);
});
