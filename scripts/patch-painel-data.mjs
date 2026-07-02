#!/usr/bin/env node
// Atualização cirúrgica do Mega Painel após auditoria 2026-06-09.
// Adiciona Lotes 4–10, agentes novos, eventos, ajusta maturity/milestones/nextSteps.
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'CentralDark/apps/modulos/status/painel-data.json';
const data = JSON.parse(readFileSync(FILE, 'utf8'));
const NOW = new Date().toISOString();

data.updatedAt = NOW;
data.project.phase = 'Bot-server WhatsApp read-only completo (Lotes 2–10) + bots GitHub';
data.project.summary =
  '7 rotas read-only no bot-server (chats, contacts, avatar, groups, group-details, participants, history) com 9 validadores offline verdes. Bots GitHub reforçados: Dependabot, CodeQL, pr-auto-review, bot-server-validate, farm-co-author, painel-auto-update. Próximo: Lote 11 frontend chat live + auditoria working-tree VPS (#109).';
data.project.overallProgress = 84;

// ----- maturity (atualizar valores e detalhes) -----
const maturityUpdates = {
  '🧠 Memória e consciência': { value: 94, detail: 'Auto-aprendizado + gatilhos de pendências + cientista de sistemas inquebráveis. Memória sempre lida em reconexão.' },
  '🔌 MCP / conector': { value: 85, detail: 'MCP público online, watchdog + alertas Telegram + página /status. 83 tools no catálogo.' },
  '🧑‍💻 Codex integrado': { value: 82, detail: 'AGENTS/CODEX/prompt/PR template + codex-validate + pr-auto-review automático em todo PR.' },
  '🖥️ VPS / PM2': { value: 70, detail: 'Produção ativa, mas working tree sujo (#109) e webhook-bot ausente do PM2. Auditoria read-only pronta pra rodar.' },
  '🧪 Testes e checker': { value: 58, detail: '9 validadores offline cobrem Lotes 2–10 do bot-server. bot-server-validate.yml roda em todo PR.' }
};
for (const m of data.maturity) {
  if (maturityUpdates[m.name]) Object.assign(m, maturityUpdates[m.name]);
}

// ----- agents -----
const grok = data.agents.find(a => a.name === 'Grok / apoio');
if (grok) {
  grok.power = 65;
  grok.description = 'Operador VPS — SSH nativo, surgical pra reset/limpeza/merge conflict que o Lovable não toca.';
}
// adiciona novos se não existirem
const newAgents = [
  { name: 'Dependabot', emoji: '📦', role: 'Atualizações', power: 70, description: 'PRs semanais de npm + Actions, pré-configurado pra 5 pacotes (bot-server, mcp, install-callback, frontend, actions).' },
  { name: 'CodeQL', emoji: '🛡️', role: 'Segurança', power: 70, description: 'Análise estática JS/TS em push/PR/weekly. Alerta vulnerabilidade antes do merge.' }
];
for (const na of newAgents) {
  if (!data.agents.some(a => a.name === na.name)) data.agents.push(na);
}

// ----- milestones -----
const vps = data.milestones.find(m => m.title === 'Validar vps_pm2_ls via conector');
if (vps) { vps.status = 'done'; vps.percent = 100; }
const newMilestones = [
  { title: 'Lote 2/3 WhatsApp read-only (adaptador + getCentralDarkChats)', status: 'done', percent: 100 },
  { title: 'Lote 4 — GET /v1/whatsapp/chats',                                status: 'done', percent: 100 },
  { title: 'Lote 5 — GET /v1/whatsapp/contacts',                             status: 'done', percent: 100 },
  { title: 'Lote 6 — GET /v1/whatsapp/contacts/:phone/avatar',               status: 'done', percent: 100 },
  { title: 'Lote 7 — GET /v1/whatsapp/groups',                               status: 'done', percent: 100 },
  { title: 'Lote 8 — GET /v1/whatsapp/groups/:groupJid/participants',        status: 'done', percent: 100 },
  { title: 'Lote 9 — GET /v1/whatsapp/groups/:groupJid (detalhes)',          status: 'done', percent: 100 },
  { title: 'Lote 10 — GET /v1/whatsapp/messages/:chatId/history',            status: 'done', percent: 100 },
  { title: 'Bots GitHub reforçados (Dependabot + CodeQL + auto-review)',     status: 'done', percent: 100 },
  { title: 'Auditoria working-tree VPS pós-Lote 10 (#109)',                  status: 'doing', percent: 30 },
  { title: 'Lote 11 — frontend chat live read-only',                         status: 'next', percent: 0 }
];
for (const nm of newMilestones) {
  if (!data.milestones.some(m => m.title === nm.title)) data.milestones.push(nm);
}

// ----- nextSteps (limpar e atualizar) -----
data.nextSteps = [
  'Rodar `bash /root/CentralDark/scripts/auditoria/working-tree-vps.sh` na VPS e revisar buckets A/B/C/D antes de qualquer limpeza.',
  'Decidir webhook-bot: ressuscitar no PM2 ou aposentar oficialmente (2 camadas redundantes cobrem).',
  'Lote 11 — frontend chat live read-only consumindo as 7 rotas /v1/whatsapp/*.',
  'Observar primeiro PR pós-pr-auto-review.yml e ajustar checklist se Codex pedir.',
  'Avaliar release-please + semantic-pr depois que Dependabot/CodeQL estabilizarem.',
  'Documentar política de versionamento (SemVer) no CONSCIENCIA.md.',
  'Confirmar Caddy roteando api.centralldark.com pros endpoints /v1/whatsapp/* quando bot-server subir.',
  'Plano de envio (POST /v1/whatsapp/send) só após confirmação separada — sai do modo read-only.'
];

// ----- events (adicionar 10 novos no topo) -----
const novos = [
  { time: NOW, title: 'Bots GitHub reforçados — Dependabot + CodeQL + pr-auto-review + farm + painel-auto', area: 'GitHub / Automações', status: 'feito', detail: '6 workflows novos: dependabot.yml (5 escopos), codeql.yml (push+PR+weekly), pr-auto-review.yml (label + checklist + heart), bot-server-validate.yml (9 validadores Lotes 2–10), farm-co-author.yml (trailer SegredoiDev), painel-auto-update.yml (push→evento no painel). Tudo guard ServerVpss/CentralDark.' },
  { time: NOW, title: 'Auditoria working-tree VPS pós-Lote 10 aberta (#109)', area: 'VPS / Manutenção', status: 'em andamento', detail: 'Script read-only `CentralDark/scripts/auditoria/working-tree-vps.sh` classifica sujeira em buckets A/B/C/D sem reset/rm/pm2 delete. Snapshot antes de qualquer limpeza.' },
  { time: NOW, title: 'Lote 10 — GET /v1/whatsapp/messages/:chatId/history', area: 'Bot / WhatsApp', status: 'feito', detail: 'Handler puro com chatId @s.whatsapp.net/@g.us/@lid, limit default 50 teto 200, cursor opcional. Validador offline 22/22.' },
  { time: NOW, title: 'Lote 9 — GET /v1/whatsapp/groups/:groupJid (detalhes)', area: 'Bot / WhatsApp', status: 'feito', detail: 'Detalhes completos de grupo via read-only. Validador 20/20.' },
  { time: NOW, title: 'Lote 8 — GET /v1/whatsapp/groups/:groupJid/participants', area: 'Bot / WhatsApp', status: 'feito', detail: 'Validação @g.us, erro 400 antes do upstream. Validador 15/15.' },
  { time: NOW, title: 'Lote 7 — GET /v1/whatsapp/groups', area: 'Bot / WhatsApp', status: 'feito', detail: 'Handler puro com DI/workspace/erro sanitizado. Validador 13/13.' },
  { time: NOW, title: 'Lote 6 — GET /v1/whatsapp/contacts/:phone/avatar', area: 'Bot / WhatsApp', status: 'feito', detail: 'Normalização E.164/JID/LID, query ?preview=. Validador 15/15.' },
  { time: NOW, title: 'Lote 5 — GET /v1/whatsapp/contacts', area: 'Bot / WhatsApp', status: 'feito', detail: 'Handler puro consumindo /user/contacts. Validador 13/13.' },
  { time: NOW, title: 'Lote 4 — GET /v1/whatsapp/chats', area: 'Bot / WhatsApp', status: 'feito', detail: 'Primeira rota pública composta (contatos + grupos), com cache curto e auth. Validador 13/13.' },
  { time: NOW, title: 'deploy_status #108 — repo↔VPS sincronizado', area: 'Deploy', status: 'feito', detail: 'Commit d5e9ba2 ativo. webhook-bot ausente do PM2 (sobraram 7 processos) — pendência #109 registrada.' }
];
data.events = [...novos, ...data.events];

// ----- aiSuggestions (adicionar bots novos no topo) -----
data.aiSuggestions = data.aiSuggestions || [];
data.aiSuggestions.unshift({
  id: 'bots-github-reforcados-2026-06-09',
  title: 'Bots GitHub agora operam o repo 24/7',
  origin: 'Auditoria + plano aprovado Modo Lovable/Modo Segredo',
  suggestion: 'Dependabot abre PRs semanais; CodeQL escaneia em push/PR/weekly; pr-auto-review marca todo PR com label + checklist + heart; bot-server-validate roda 9 validadores offline; farm-co-author confirma trailer SegredoiDev; painel-auto-update mantém status.centralldark.com vivo a cada push.'
});

writeFileSync(FILE, JSON.stringify(data, null, 2) + '\n');
console.log('[OK] painel atualizado:', FILE);
console.log('     events:', data.events.length, '· milestones:', data.milestones.length, '· agents:', data.agents.length);
