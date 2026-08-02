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

test('aceita relatório completo com porcentagem medida correta', () => {
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

test('bloqueia porcentagem matemática falsa', () => {
  const report = fullReport().replace('900/1000=90%', '900/1000=99%');
  assert.throws(() => validateReport(report, 'full'), /REPORT_PERCENT_MISMATCH/);
});

test('bloqueia estimativa sem escopo separado', () => {
  const report = fullReport()
    .replace('ESTIMATIVA=NÃO_CALCULADA', 'ESTIMATIVA=30%');
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
