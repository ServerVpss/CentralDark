import assert from 'node:assert/strict';
import test from 'node:test';
import { validateReport } from './validar-relato-pivete.mjs';

const GATES = JSON.stringify([
  { id: 'CORE', status: 'PASS', pontos: 100, prova: 'boot e CI verdes' },
  { id: 'ANEXO', status: 'PARTIAL', pontos: 50, prova: 'receipt presente; bytes externos' },
]);

function fullReport(overrides = '') {
  return `
╔════════════════════════════════════════════╗
║ 🧠 CENTRALDARK — ESTADO DA MISSÃO         ║
╚════════════════════════════════════════════╝

🎯 VEREDITO=
A escola está operacional, mas ainda não está completa.

📊 PROGRESSO=
ESCOPO_MEDIDO=2 gates declarados da escola agentic
GATES_MEDIDOS_JSON=${GATES}
PERCENTUAL_MEDIDO=150/200=75%
ESTIMATIVA=NÃO_CALCULADA
ESCOPO_DA_ESTIMATIVA=NÃO_APLICÁVEL
SITUAÇÃO=PARTIAL_COM_PROVA
OPERACIONAL=SIM
COMPLETO=NÃO

✅ O QUE JÁ ESTÁ PRONTO=
- boot e CI provados

🟡 O QUE ESTÁ PARCIAL=
- anexos externos

❌ O QUE AINDA FALTA=
- custódia integral

🚫 BLOQUEADORES=
- NENHUM

⚠️ PENDÊNCIAS NÃO BLOQUEANTES=
- ZIP externo

🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=
ERRO=NENHUM
CAUSA=NÃO_APLICÁVEL
CORREÇÃO=contrato unificado
TESTE_DA_CICATRIZ=validar-relato-pivete.test.mjs
REGRESSÃO=PASS

🔎 PROVA=
REPOSITÓRIO=ServerVpss/CentralDark
PR_OU_ISSUE=PR #611
BRANCH=docs/acorda-rebuilder-20260801
HEAD=${'a'.repeat(40)}
CHECKS=porta-de-entrada PASS
TESTES=5/5 PASS
RECEIPT=relato-validado
FONTE_DA_PROVA=GitHub
EMISSOR=ChatGPT
PAPEL_DO_EMISSOR=WRITER

🧭 FLUXO VISUAL=
DIAGRAMA_OBRIGATÓRIO=SIM
MOTIVO=Fluxo possui agente, GitHub, CI e Judge.

\`\`\`mermaid
sequenceDiagram
  participant Chefe as SEGREDO/CHEFE
  participant Agente as IA/Agente
  participant GitHub
  participant CI as CI/CD
  participant Juiz as Judge
  Chefe->>Agente: define intenção e escopo
  Agente->>GitHub: publica mudança no PR
  GitHub->>CI: executa gates no HEAD exato
  CI-->>Agente: devolve PASS ou falha
  Agente->>Juiz: solicita revisão independente
  Juiz-->>Chefe: entrega veredito e próximo gate
\`\`\`

🗣️ PAPO RETO DO PIVETE=
O padrão ficou curto para ler e duro para mentir.

➡️ PRÓXIMO GATE=
Rodar CI no HEAD novo.

🧰 COMANDO CIRÚRGICO=
NENHUM

🧪 COLETA DO CHEFE=
NENHUMA

👑 AÇÃO DO CHEFE=
NENHUMA

🛡️ O QUE NÃO FOI TOCADO=
- main
- VPS
- produção
- segredo
- deploy

AUTORIA_DO_PADRÃO=SEGREDO/CHEFE
${overrides}`;
}

test('aceita relatório completo com gates e diagrama corretos', () => {
  const result = validateReport(fullReport(), 'full');
  assert.equal(result.progress.percent, 75);
  assert.equal(result.progress.gates.length, 2);
});

test('aceita modo curto coerente e com papel', () => {
  const gates = JSON.stringify([{ id: 'CI', status: 'PARTIAL', pontos: 50, prova: '3 de 5 checks' }]);
  const report = `
🎯 VEREDITO=CI ainda executando.
📊 PROGRESSO=ESCOPO:1 gate; GATES_JSON:${gates}; MEDIDO:50/100=50%; SITUAÇÃO:PARTIAL_COM_PROVA
🔎 PROVA=PR/ISSUE:#611; HEAD:${'b'.repeat(40)}; CHECKS:3 PASS, 2 PENDING; EMISSOR:CodeRabbit; PAPEL:REVIEWER
➡️ PRÓXIMO GATE=aguardar resultado dos dois checks
👑 AÇÃO DO CHEFE=NENHUMA`;
  assert.equal(validateReport(report, 'short').progress.percent, 50);
});

test('bloqueia PASS falso no modo curto', () => {
  const gates = JSON.stringify([{ id: 'CI', status: 'PARTIAL', pontos: 50, prova: 'parcial' }]);
  const report = `
🎯 VEREDITO=tudo pronto
📊 PROGRESSO=ESCOPO:1 gate; GATES_JSON:${gates}; MEDIDO:50/100=50%; SITUAÇÃO:PASS
🔎 PROVA=PR/ISSUE:#611; HEAD:${'b'.repeat(40)}; CHECKS:parcial; EMISSOR:Codex; PAPEL:REVIEWER
➡️ PRÓXIMO GATE=nenhum
👑 AÇÃO DO CHEFE=NENHUMA`;
  assert.throws(() => validateReport(report, 'short'), /REPORT_PASS_WITHOUT_100_PERCENT/);
});

test('bloqueia BLOCKED curto sem identificar bloqueio', () => {
  const gates = JSON.stringify([{ id: 'CI', status: 'BLOCKED', pontos: 0, prova: 'sem receipt' }]);
  const report = `
🎯 VEREDITO=estado atual
📊 PROGRESSO=ESCOPO:1 gate; GATES_JSON:${gates}; MEDIDO:0/100=0%; SITUAÇÃO:BLOCKED
🔎 PROVA=PR/ISSUE:#611; HEAD:${'b'.repeat(40)}; CHECKS:sem receipt; EMISSOR:Codex; PAPEL:REVIEWER
➡️ PRÓXIMO GATE=continuar
👑 AÇÃO DO CHEFE=NENHUMA`;
  assert.throws(() => validateReport(report, 'short'), /REPORT_SHORT_BLOCKER_MISSING/);
});

test('aceita PR completo com HEAD e Writer reais', () => {
  assert.equal(validateReport(fullReport(), 'pr').mode, 'pr');
});

test('bloqueia PR com HEAD placeholder', () => {
  const report = fullReport().replace('a'.repeat(40), '<SHA completo>');
  assert.throws(() => validateReport(report, 'pr'), /PR_REPORT_HEAD_INVALID/);
});

test('bloqueia PR emitido por reviewer', () => {
  const report = fullReport().replace('PAPEL_DO_EMISSOR=WRITER', 'PAPEL_DO_EMISSOR=REVIEWER');
  assert.throws(() => validateReport(report, 'pr'), /PR_REPORT_EMITTER_MUST_BE_WRITER/);
});

test('bloqueia porcentagem diferente dos gates', () => {
  const report = fullReport().replace('150/200=75%', '180/200=90%');
  assert.throws(() => validateReport(report, 'full'), /REPORT_GATES_PERCENT_MISMATCH/);
});

test('bloqueia pontos incompatíveis com estado', () => {
  const bad = GATES.replace('"status":"PARTIAL","pontos":50', '"status":"PARTIAL","pontos":100');
  assert.throws(() => validateReport(fullReport().replace(GATES, bad), 'full'), /REPORT_GATE_POINTS_INVALID/);
});

test('bloqueia estimativa no escopo medido', () => {
  const report = fullReport().replace('2 gates declarados da escola agentic', '1 gate provado + 1 gate estimado');
  assert.throws(() => validateReport(report, 'full'), /REPORT_ESTIMATE_INSIDE_MEASURED_SCOPE/);
});

test('bloqueia template inerte em comentário mascarando ordem real', () => {
  const inert = `<!--\n${fullReport()}\n-->\n`;
  const bad = fullReport()
    .replace('🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=', '__A__')
    .replace('🗣️ PAPO RETO DO PIVETE=', '🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=')
    .replace('__A__', '🗣️ PAPO RETO DO PIVETE=');
  assert.throws(() => validateReport(inert + bad, 'full'), /REPORT_HEADER_(?:ORDER_INVALID|MISSING)/);
});

test('bloqueia cabeçalho real duplicado', () => {
  assert.throws(() => validateReport(fullReport('\n🎯 VEREDITO=duplicado'), 'full'), /REPORT_HEADER_DUPLICATED/);
});

test('bloqueia autoria escondida em comentário', () => {
  const report = fullReport().replace('AUTORIA_DO_PADRÃO=SEGREDO/CHEFE', 'AUTORIA_DO_PADRÃO=CODEX\n<!-- AUTORIA_DO_PADRÃO=SEGREDO/CHEFE -->');
  assert.throws(() => validateReport(report, 'full'), /REPORT_AUTHORSHIP_INVALID/);
});

test('bloqueia reviewer assumindo Writer', () => {
  const report = fullReport()
    .replace('PAPEL_DO_EMISSOR=WRITER', 'PAPEL_DO_EMISSOR=REVIEWER')
    .replace('O padrão ficou curto para ler e duro para mentir.', 'Atuo como WRITER e PROMOTOR deste escopo.');
  assert.throws(() => validateReport(report, 'full'), /REPORT_REVIEWER_ROLE_ESCALATION/);
});

test('bloqueia situação bloqueada marcada como operacional', () => {
  const blockedGates = JSON.stringify([{ id: 'CI', status: 'BLOCKED', pontos: 0, prova: 'receipt ausente' }]);
  const report = fullReport()
    .replace(GATES, blockedGates)
    .replace('150/200=75%', '0/100=0%')
    .replace('SITUAÇÃO=PARTIAL_COM_PROVA', 'SITUAÇÃO=BLOCKED')
    .replace('- NENHUM\n\n⚠️ PENDÊNCIAS', '- receipt ausente\n\n⚠️ PENDÊNCIAS');
  assert.throws(() => validateReport(report, 'full'), /REPORT_BLOCKED_MARKED_OPERATIONAL/);
});

test('bloqueia fluxo complexo sem Mermaid', () => {
  const report = fullReport().replace(/```mermaid[\s\S]*?```/, 'NÃO_APLICÁVEL');
  assert.throws(() => validateReport(report, 'full'), /REPORT_MERMAID_SEQUENCE_MISSING/);
});

test('aceita fluxo simples declarado como não aplicável', () => {
  const report = fullReport()
    .replace('DIAGRAMA_OBRIGATÓRIO=SIM', 'DIAGRAMA_OBRIGATÓRIO=NÃO')
    .replace('MOTIVO=Fluxo possui agente, GitHub, CI e Judge.', 'MOTIVO=A atualização não possui interação entre componentes.')
    .replace(/```mermaid[\s\S]*?```/, 'NÃO_APLICÁVEL');
  assert.equal(validateReport(report, 'full').valid, true);
});

test('bloqueia segredo desenhado no diagrama', () => {
  const report = fullReport().replace('Agente->>GitHub: publica mudança no PR', 'Agente->>GitHub: TOKEN=segredo');
  assert.throws(() => validateReport(report, 'full'), /REPORT_DIAGRAM_SECRET_PATTERN/);
});

test('bloqueia coleta fora do TEMP', () => {
  const report = fullReport().replace('🧪 COLETA DO CHEFE=\nNENHUMA', `🧪 COLETA DO CHEFE=\n\`\`\`powershell\n# somente leitura\nGet-Process | Out-File C:\\saida.txt\n\`\`\``);
  assert.throws(() => validateReport(report, 'full'), /REPORT_COLLECTION_TEMP_PATH_MISSING/);
});

test('aceita um único coletor read-only no TEMP', () => {
  const report = fullReport().replace('🧪 COLETA DO CHEFE=\nNENHUMA', `🧪 COLETA DO CHEFE=\n\`\`\`powershell\n# somente leitura / read-only\nGet-Process | Out-File E:\\CentralDark\\Pivete\\TEMP\\coleta.txt\n\`\`\``);
  assert.equal(validateReport(report, 'full').valid, true);
});
