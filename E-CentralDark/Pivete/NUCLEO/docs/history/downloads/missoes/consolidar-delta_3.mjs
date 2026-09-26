#!/usr/bin/env node
/** Monta um QA_CONTEXT_DELTA curto, sanitizado e fail-closed. */
import { learningSummary } from "./learning-store.mjs";
import { sanitizeText } from "./sanitize.mjs";

function listBlock(title, values = []) {
  const clean = values.filter(Boolean);
  return clean.length ? `${title}=\n- ${clean.join("\n- ")}` : `${title}=`;
}

export function consolidarDelta({
  routeResult,
  consulta,
  event,
  policy = {},
  enxame = null,
  learning = null,
  previousLearning = [],
}) {
  const lines = ["QA_CONTEXT_DELTA=", "", `EVENTO=${routeResult?.event || event?.event || "UNKNOWN"}`];
  if (routeResult?.manifestHash) lines.push(`MANIFEST_HASH=${routeResult.manifestHash}`);
  lines.push("");

  if (routeResult?.inconclusive || routeResult?.matchCount === 0) {
    lines.push("STATUS=INCONCLUSIVO");
    lines.push("HEURISTICAS_ATIVADAS=");
    lines.push("DOCUMENTOS_CONSULTADOS=");
    lines.push("CAUSA_A_INVESTIGAR=Nenhum gatilho comprovado do manifest casou com o evento.");
    lines.push("TESTE_DISCRIMINATIVO=DEFINIR_TESTE_QUE_SEPARE_AS_HIPOTESES");
    lines.push("REGRESSAO_PRESERVADA=SIM");
    lines.push("MISSAO_ATUAL_PRESERVADA=SIM");
    lines.push(`PROXIMO_ESTADO=${event?.mission?.nextState || "INALTERADO"}`);
    lines.push("AUTO_APPLY=NAO");
    lines.push("APRENDIZADO_PROMOVIDO=NAO");
    lines.push("APRENDIZADO_REUTILIZADO=NAO");
    lines.push("CONTEXTO_INTEIRO_CARREGADO=NAO");
    lines.push("APENAS_DELTA_RELEVANTE=SIM");
    return lines.join("\n");
  }

  if (!consulta || consulta.loaded === 0) {
    lines.push("STATUS=BLOCKED_CONTEXT_LOAD");
    lines.push(listBlock("HEURISTICAS_ATIVADAS", (routeResult.matches || []).map((match) => match.id.toUpperCase())));
    lines.push("DOCUMENTOS_CONSULTADOS=");
    lines.push(listBlock("ERROS_DE_CONSULTA", (consulta?.errors || []).map((error) => `${error.path}:${error.error}`)));
    lines.push("MISSAO_ATUAL_PRESERVADA=SIM");
    lines.push(`PROXIMO_ESTADO=${event?.mission?.nextState || "INALTERADO"}`);
    lines.push("AUTO_APPLY=NAO");
    lines.push("APRENDIZADO_PROMOVIDO=NAO");
    return lines.join("\n");
  }

  const ids = (routeResult.matches || []).map((match) => match.id.toUpperCase());
  const paths = (consulta.documents || []).filter((document) => document.content).map((document) => document.path);
  lines.push("STATUS=OK");
  lines.push(listBlock("HEURISTICAS_ATIVADAS", ids));
  lines.push("");
  lines.push(listBlock("DOCUMENTOS_CONSULTADOS", paths));
  lines.push("");
  lines.push(`CAUSA_A_INVESTIGAR=${sanitizeText(event?.evidence?.error || "Localizar causa causal com a evidência disponível.", 500)}`);
  lines.push("TESTE_DISCRIMINATIVO=Preservar o teste que encontrou a falha; corrigir a fonte, nunca a assertion para fabricar verde.");
  lines.push("REGRESSAO_PRESERVADA=SIM");
  lines.push("MISSAO_ATUAL_PRESERVADA=SIM");
  lines.push(`PROXIMO_ESTADO=${event?.mission?.nextState || "TESTE_DISCRIMINATIVO_VERDE"}`);
  lines.push("");
  lines.push(`AUTO_APPLY=${policy.allowed ? "SIM" : "NAO"}`);
  lines.push(`POLICY_STATE=${policy.state || "AUTO_APPLY_BLOCKED"}`);
  if (!policy.allowed && policy.reasons?.length) lines.push(`AUTO_APPLY_BLOQUEIO=${policy.reasons.join(" | ")}`);
  lines.push("");
  lines.push(`APRENDIZADO_PROMOVIDO=${learning?.promoted ? "SIM" : "NAO"}`);
  if (learning?.id) lines.push(`APRENDIZADO_ID=${learning.id}`);
  if (learning?.reason) lines.push(`APRENDIZADO_STATUS=${learning.reason}`);
  lines.push(`APRENDIZADO_REUTILIZADO=${previousLearning.length ? "SIM" : "NAO"}`);
  if (previousLearning.length) lines.push(listBlock("APRENDIZADOS_ANTERIORES", previousLearning.map(learningSummary)));
  lines.push("");
  lines.push("CONTEXTO_INTEIRO_CARREGADO=NAO");
  lines.push("APENAS_DELTA_RELEVANTE=SIM");
  lines.push(`MATCH_COUNT=${routeResult.matchCount}`);
  lines.push(`DOCUMENTOS_CARREGADOS=${consulta.loaded}`);

  if (consulta.errors?.length) lines.push(listBlock("ERROS_DE_CONSULTA", consulta.errors.map((error) => `${error.path}:${error.error}`)));

  if (consulta.documents?.length) {
    lines.push("", "--- TRECHOS SELETIVOS ---");
    for (const document of consulta.documents.filter((item) => item.content)) {
      lines.push(`### ${document.id} (${document.path}) score=${document.score} mode=${document.selectionMode}`);
      lines.push(sanitizeText(document.content, 900));
      lines.push("");
    }
  }

  if (enxame) {
    lines.push("--- ENXAME ---");
    lines.push(`ENXAME_STATUS=${enxame.status}`);
    if (enxame.sourcesUsed?.length) lines.push(`ENXAME_SOURCES=${enxame.sourcesUsed.join(",")}`);
    if (enxame.judgeIndependence) lines.push(`JUDGE_INDEPENDENCE=${enxame.judgeIndependence}`);
    if (enxame.veredito) lines.push(`ENXAME_VEREDITO=${sanitizeText(enxame.veredito, 800)}`);
    if (enxame.outputDir) lines.push(`ENXAME_OUTPUT=${enxame.outputDir}`);
  }

  return lines.join("\n");
}
