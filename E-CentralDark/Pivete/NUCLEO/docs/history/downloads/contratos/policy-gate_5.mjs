#!/usr/bin/env node
/**
 * policy-gate.mjs — fail-closed.
 * Contadores numéricos NUNCA aceitam "SIM".
 * Flags proibidas exigem declaração explícita NAO.
 */
function isYes(value) {
  return value === true || String(value).toUpperCase() === "SIM";
}

/** Aceita apenas zero numérico real. "SIM", "true", "NAO" → false. */
function isNumericZero(value) {
  if (value === 0) return true;
  if (typeof value === "string" && value.trim() === "0") return true;
  return false;
}

function isNo(value) {
  const v = String(value).toUpperCase();
  return value === false || v === "NAO" || v === "NÃO";
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
    // Contadores: só número 0. FAIL="SIM" NÃO passa.
    ARQUIVOS_FORA_ESCOPO_ZERO: isNumericZero(
      flags.ARQUIVOS_FORA_ESCOPO_ZERO ?? flags.ARQUIVOS_FORA_DO_ESCOPO
    ),
    FAIL_ZERO: isNumericZero(flags.FAIL_ZERO ?? flags.FAIL),
    SKIPPED_ZERO: isNumericZero(flags.SKIPPED_ZERO ?? flags.SKIPPED),
    UNKNOWN_ZERO: isNumericZero(flags.UNKNOWN_ZERO ?? flags.UNKNOWN),
  };

  const forbidden = {
    SECRETS: { active: isYes(flags.SECRETS), declaredNo: isNo(flags.SECRETS) },
    MERGE: { active: isYes(flags.MERGE), declaredNo: isNo(flags.MERGE) },
    DEPLOY: { active: isYes(flags.DEPLOY), declaredNo: isNo(flags.DEPLOY) },
    VPS: { active: isYes(flags.VPS), declaredNo: isNo(flags.VPS) },
    PRODUCAO: { active: isYes(flags.PRODUCAO), declaredNo: isNo(flags.PRODUCAO) },
    HISTORY_REWRITE: {
      active: isYes(flags.HISTORY_REWRITE),
      declaredNo: isNo(flags.HISTORY_REWRITE),
    },
  };

  const reasons = [];
  for (const [name, passed] of Object.entries(required)) {
    if (!passed) reasons.push(`${name}=NAO`);
  }
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
