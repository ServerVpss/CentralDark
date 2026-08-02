import assert from 'node:assert/strict';
import test from 'node:test';
import { validateReport } from './validar-relato-pivete.mjs';

function fullReport(overrides = '') {
  return `
╔════════════════════════════════════════════╗
║ 🧠 CENTRALDARK — ESTADO DA MISSÃO         ║
╚════════════════════════════════════════════╝

🎯 VEREDITO=
A escola está operacional, mas ainda não está completa.

📊 PROGRESSO=
ESCOPO_MEDIDO=10 gates declarados da escola agentic
PERCENTUAL_MEDIDO=900/1000=90%
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

test('aceita relatório completo com porcentagem e diagrama corretos', () => {
  const result = validateReport(fullReport(), 'full');
  assert.deepEqual(result.progress, { earned: 900, total: 1000, percent: 90 });
});

test('aceita modo curto para atualização sem mutação', () => {
  const report = `
🎯 VEREDITO=CI ainda executando.
📊 PROGRESSO=ESCOPO:5 checks; MEDIDO:3/5=60%; SITUAÇÃO:PARTIAL_COM_PROVA
🔎 PROVA=PR/ISSUE:#611; HEAD:${'b'.repeat(40)}; CHECKS:3 PASS, 2 PENDING
➡️ PRÓXIMO GATE=aguardar resultado dos dois checks
👑 AÇÃO DO CHEFE=NENHUMA`;
  const result = validateReport(report, 'short');
  assert.equal(result.progress.percent, 60);
});

test('aceita PR completo com HEAD real', () => {
  const result = validateReport(fullReport(), 'pr');
  assert.equal(result.mode, 'pr');
});

test('bloqueia PR com HEAD placeholder', () => {
  const report = fullReport().replace('a'.repeat(40), '<SHA completo>');
  assert.throws(() => validateReport(report, 'pr'), /PR_REPORT_HEAD_INVALID/);
});

test('bloqueia template de PR ainda não preenchido', () => {
  const report = fullReport()
    .replace('PR #611', 'PR A DEFINIR')
    .replace('docs/acorda-rebuilder-20260801', 'BRANCH A DEFINIR')
    .replace('a'.repeat(40), '0'.repeat(40));
  assert.throws(() => validateReport(report, 'pr'), /PR_REPORT_REFERENCE_PLACEHOLDER|PR_REPORT_BRANCH_PLACEHOLDER|PR_REPORT_HEAD_INVALID/);
});

test('bloqueia porcentagem matemática falsa', () => {
  const report = fullReport().replace('900/1000=90%', '900/1000=99%');
  assert.throws(() => validateReport(report, 'full'), /REPORT_PERCENT_MISMATCH/);
});

test('bloqueia estimativa sem escopo separado', () => {
  const report = fullReport().replace('ESTIMATIVA=NÃO_CALCULADA', 'ESTIMATIVA=30%');
  assert.throws(() => validateReport(report, 'full'), /REPORT_ESTIMATE_SCOPE_NOT_DECLARED/);
});

test('bloqueia papo reto antes do diagnóstico técnico', () => {
  const report = fullReport();
  const bad = report
    .replace('🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=', '__TEMP_HEADER__')
    .replace('🗣️ PAPO RETO DO PIVETE=', '🩺 DIAGNÓSTICO TÉCNICO E CICATRIZ=')
    .replace('__TEMP_HEADER__', '🗣️ PAPO RETO DO PIVETE=');
  assert.throws(() => validateReport(bad, 'full'), /REPORT_HEADER_ORDER_INVALID/);
});

test('bloqueia PASS sem 100 por cento', () => {
  const report = fullReport().replace('SITUAÇÃO=PARTIAL_COM_PROVA', 'SITUAÇÃO=PASS');
  assert.throws(() => validateReport(report, 'full'), /REPORT_PASS_WITHOUT_100_PERCENT/);
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
