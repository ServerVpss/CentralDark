#!/usr/bin/env node
/** Monta QA_CONTEXT_DELTA curto, sanitizado, fail-closed. Sem inventar missao. */
import { learningSummary } from "./learning-store.mjs";
import { sanitizeText, singleLineField } from "./sanitize.mjs";

function listBlock(title, values = []) {
  const clean = values.filter(Boolean).map((v) => singleLineField(v, 300));
  return clean.length ? `${title}=\n- ${clean.join("\n- ")}` : `${title}=`;
}

function missionPresent(mission) {
  return Boolean(mission && (mission.id || mission.state || mission.nextState || mission.objective));
}

function missionBlock(event) {
  const m = event?.mission || {};
  const present = missionPresent(m);
  const lines = [
    `MISSAO_PRESENTE=${present ? "SIM" : "NAO"}`,
    `MISSAO_ATUAL_PRESERVADA=${present ? "SIM" : "NAO"}`,
  ];
  if (present) {
    if (m.id) lines.push(`MISSION_ID=${singleLineField(m.id, 120)}`);
    if (m.state) lines.push(`MISSION_STATE=${singleLineField(m.state, 120)}`);
    if (m.objective) lines.push(`MISSION_OBJECTIVE=${singleLineField(m.objective, 200)}`);
    if (m.nextState) lines.push(`PROXIMO_ESTADO=${singleLineField(m.nextState, 120)}`);
    else lines.push("PROXIMO_ESTADO=INALTERADO");
  } else {
    lines.push("PROXIMO_ESTADO=INALTERADO");
    lines.push("MISSAO_AVISO=Missao ausente no evento; nenhum estado foi inventado.");
  }
  return lines;
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
  const lines = [
    "QA_CONTEXT_DELTA=",
    "",
    `EVENTO=${singleLineField(routeResult?.event || event?.event || "UNKNOWN", 80)}`,
  ];
  if (routeResult?.manifestHash) lines.push(`MANIFEST_HASH=${singleLineField(routeResult.manifestHash, 80)}`);
  lines.push("");

  if (routeResult?.inconclusive || routeResult?.matchCount === 0) {
    lines.push("STATUS=INCONCLUSIVO");
    lines.push("HEURISTICAS_ATIVADAS=");
    lines.push("DOCUMENTOS_CONSULTADOS=");
    lines.push("CAUSA_A_INVESTIGAR=Nenhum gatilho comprovado do manifest casou com o evento.");
    lines.push("TESTE_DISCRIMINATIVO=DEFINIR_TESTE_QUE_SEPARE_AS_HIPOTESES");
    lines.push("REGRESSAO_PRESERVADA=SIM");
    lines.push(...missionBlock(event));
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
    lines.push(...missionBlock(event));
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
  lines.push(`CAUSA_A_INVESTIGAR=${singleLineField(event?.evidence?.error || "Localizar causa causal com a evidencia disponivel.", 500)}`);
  lines.push("TESTE_DISCRIMINATIVO=Preservar o teste que encontrou a falha; corrigir a fonte, nunca a assertion para fabricar verde.");
  lines.push("REGRESSAO_PRESERVADA=SIM");
  lines.push(...missionBlock(event));
  lines.push("");
  lines.push(`AUTO_APPLY=${policy.allowed ? "SIM" : "NAO"}`);
  lines.push(`POLICY_STATE=${singleLineField(policy.state || "AUTO_APPLY_BLOCKED", 40)}`);
  if (!policy.allowed && policy.reasons?.length) {
    lines.push(`AUTO_APPLY_BLOQUEIO=${singleLineField(policy.reasons.join(" | "), 500)}`);
  }
  lines.push("");
  lines.push(`APRENDIZADO_PROMOVIDO=${learning?.promoted ? "SIM" : "NAO"}`);
  if (learning?.id) lines.push(`APRENDIZADO_ID=${singleLineField(learning.id, 40)}`);
  if (learning?.reason) lines.push(`APRENDIZADO_STATUS=${singleLineField(learning.reason, 80)}`);
  lines.push(`APRENDIZADO_REUTILIZADO=${previousLearning.length ? "SIM" : "NAO"}`);
  if (previousLearning.length) {
    lines.push(listBlock("APRENDIZADOS_ANTERIORES", previousLearning.map(learningSummary)));
  }
  lines.push("");
  lines.push("CONTEXTO_INTEIRO_CARREGADO=NAO");
  lines.push("APENAS_DELTA_RELEVANTE=SIM");
  lines.push(`MATCH_COUNT=${routeResult.matchCount}`);
  lines.push(`DOCUMENTOS_CARREGADOS=${consulta.loaded}`);

  if (consulta.errors?.length) {
    lines.push(listBlock("ERROS_DE_CONSULTA", consulta.errors.map((error) => `${error.path}:${error.error}`)));
  }

  if (consulta.documents?.length) {
    lines.push("", "--- TRECHOS SELETIVOS ---");
    for (const document of consulta.documents.filter((item) => item.content)) {
      lines.push(`### ${singleLineField(document.id, 40)} (${singleLineField(document.path, 120)}) score=${document.score} mode=${document.selectionMode}`);
      lines.push(sanitizeText(document.content, 900));
      lines.push("");
    }
  }

  if (enxame) {
    lines.push("--- ENXAME ---");
    lines.push(`ENXAME_STATUS=${singleLineField(enxame.status, 40)}`);
    if (enxame.sourcesUsed?.length) lines.push(`ENXAME_SOURCES=${singleLineField(enxame.sourcesUsed.join(","), 120)}`);
    if (enxame.judgeIndependence) lines.push(`JUDGE_INDEPENDENCE=${singleLineField(enxame.judgeIndependence, 40)}`);
    if (enxame.veredito) lines.push(`ENXAME_VEREDITO=${sanitizeText(enxame.veredito, 800)}`);
    if (enxame.outputDir) lines.push(`ENXAME_OUTPUT=${singleLineField(enxame.outputDir, 200)}`);
  }

  return lines.join("\n");
}
