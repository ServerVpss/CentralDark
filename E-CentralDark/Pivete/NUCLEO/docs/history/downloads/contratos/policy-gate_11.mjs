#!/usr/bin/env node
/** Fail-closed: AUTO_APPLY só é liberado com prova completa e sem área proibida. */
function isYes(value) {
  return value === true || String(value).toUpperCase() === "SIM";
}
function isZero(value) {
  return value === 0 || value === "0" || String(value).toUpperCase() === "SIM";
}
function isNo(value) {
  return value === false || String(value).toUpperCase() === "NAO" || String(value).toUpperCase() === "NÃO";
}

export function evaluatePolicyGate(flags = {}) {
  const required = {
    MATCH_PROVADO: isYes(flags.MATCH_PROVADO),
    ALTERACAO_LOCAL: isYes(flags.ALTERACAO_LOCAL),
    REVERSIVEL: isYes(flags.REVERSIVEL),
    WRITER_UNICO: isYes(flags.WRITER_UNICO),
    ESCOPO_AUTORIZADO: isYes(flags.ESCOPO_AUTORIZADO),
    MUDANCA_MINIMA: isYes(flags.MUDANCA_MINIMA),
    TESTE_DISCRIMINATIVO_EXISTE: isYes(flags.TESTE_DISCRIMINATIVO_EXISTE),
    TESTE_ANTES_FALHOU: isYes(flags.TESTE_ANTES_FALHOU),
    TESTE_DEPOIS_PASSOU: isYes(flags.TESTE_DEPOIS_PASSOU),
    REGRESSAO_PASSOU: isYes(flags.REGRESSAO_PASSOU),
    CASO_NEGATIVO_PASSOU: isYes(flags.CASO_NEGATIVO_PASSOU),
    IDEMPOTENCIA_PASSOU: isYes(flags.IDEMPOTENCIA_PASSOU),
    ROLLBACK_EXISTE: isYes(flags.ROLLBACK_EXISTE),
    HEAD_FIXADO: isYes(flags.HEAD_FIXADO),
    SEM_CONFLITO_CANONICO: isYes(flags.SEM_CONFLITO_CANONICO),
    ARQUIVOS_FORA_ESCOPO_ZERO: isZero(flags.ARQUIVOS_FORA_ESCOPO_ZERO ?? flags.ARQUIVOS_FORA_DO_ESCOPO),
    FAIL_ZERO: isZero(flags.FAIL_ZERO ?? flags.FAIL),
    SKIPPED_ZERO: isZero(flags.SKIPPED_ZERO ?? flags.SKIPPED),
    UNKNOWN_ZERO: isZero(flags.UNKNOWN_ZERO ?? flags.UNKNOWN),
  };

  const forbidden = {
    SECRETS: { active: isYes(flags.SECRETS), declaredNo: isNo(flags.SECRETS) },
    MERGE: { active: isYes(flags.MERGE), declaredNo: isNo(flags.MERGE) },
    DEPLOY: { active: isYes(flags.DEPLOY), declaredNo: isNo(flags.DEPLOY) },
    VPS: { active: isYes(flags.VPS), declaredNo: isNo(flags.VPS) },
    PRODUCAO: { active: isYes(flags.PRODUCAO), declaredNo: isNo(flags.PRODUCAO) },
    HISTORY_REWRITE: { active: isYes(flags.HISTORY_REWRITE), declaredNo: isNo(flags.HISTORY_REWRITE) },
  };

  const reasons = [];
  for (const [name, passed] of Object.entries(required)) if (!passed) reasons.push(`${name}=NAO`);
  for (const [name, state] of Object.entries(forbidden)) {
    if (state.active) reasons.push(`${name}=SIM (proibido)`);
    else if (!state.declaredNo) reasons.push(`${name}=DESCONHECIDO`);
  }

  return {
    allowed: reasons.length === 0,
    state: reasons.length === 0 ? "AUTO_APPLY_ALLOWED" : "AUTO_APPLY_BLOCKED",
    reasons,
    required,
    forbidden,
  };
}
