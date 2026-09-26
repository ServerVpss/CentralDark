#!/usr/bin/env node
/** Monta um QA_CONTEXT_DELTA curto, sanitizado e fail-closed. */
import { learningSummary } from "./learning-store.mjs";
import { sanitizeText, singleLineField } from "./sanitize.mjs";

function safeListItem(value) {
  return singleLineField(value, "", 600);
}

function listBlock(title, values = []) {
  const clean = values.map(safeListItem).filter(Boolean);
  return clean.length ? `${title}=\n- ${clean.join("\n- ")}` : `${title}=`;
}

function missionState(event) {
  const present = Boolean(event?.mission?.id);
  return {
    present,
    id: present ? singleLineField(event.mission.id, "UNKNOWN", 160) : "AUSENTE",
    nextState: present ? singleLineField(event.mission?.nextState, "INALTERADO", 240) : "INALTERADO",
  };
}

function safeExcerpt(content) {
  return sanitizeText(content, 900)
    .split(/\r?\n/)
    .map((line) => `| ${line}`)
    .join("\n");
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
  const mission = missionState(event);
  const lines = [
    "QA_CONTEXT_DELTA=",
    "",
    `EVENTO=${singleLineField(routeResult?.event || event?.event, "UNKNOWN", 120)}`,
  ];
  if (routeResult?.manifestHash) lines.push(`MANIFEST_HASH=${singleLineField(routeResult.manifestHash, "UNKNOWN", 128)}`);
  lines.push(`MISSION_ID=${mission.id}`, "");

  if (!mission.present) {
    lines.push("STATUS=BLOCKED_MISSION_REQUIRED");
    lines.push("HEURISTICAS_ATIVADAS=");
    lines.push("DOCUMENTOS_CONSULTADOS=");
    lines.push("MISSAO_ATUAL_PRESERVADA=NAO");
    lines.push("PROXIMO_ESTADO=INALTERADO");
    lines.push("AUTO_APPLY=NAO");
    lines.push("APRENDIZADO_PROMOVIDO=NAO");
    lines.push("APRENDIZADO_REUTILIZADO=NAO");
    lines.push("CONTEXTO_INTEIRO_CARREGADO=NAO");
    lines.push("APENAS_DELTA_RELEVANTE=SIM");
    return lines.join("\n");
  }

  if (routeResult?.inconclusive || routeResult?.matchCount === 0) {
    lines.push("STATUS=INCONCLUSIVO");
    lines.push("HEURISTICAS_ATIVADAS=");
    lines.push("DOCUMENTOS_CONSULTADOS=");
    lines.push("CAUSA_A_INVESTIGAR=Nenhum gatilho comprovado do manifest casou com o evento.");
    lines.push("TESTE_DISCRIMINATIVO=DEFINIR_TESTE_QUE_SEPARE_AS_HIPOTESES");
    lines.push("REGRESSAO_PRESERVADA=SIM");
    lines.push("MISSAO_ATUAL_PRESERVADA=SIM");
    lines.push(`PROXIMO_ESTADO=${mission.nextState}`);
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
    lines.push(`PROXIMO_ESTADO=${mission.nextState}`);
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
  lines.push(`CAUSA_A_INVESTIGAR=${singleLineField(event?.evidence?.error, "Localizar causa causal com a evidência disponível.", 500)}`);
  lines.push("TESTE_DISCRIMINATIVO=Preservar o teste que encontrou a falha; corrigir a fonte, nunca a assertion para fabricar verde.");
  lines.push("REGRESSAO_PRESERVADA=SIM");
  lines.push("MISSAO_ATUAL_PRESERVADA=SIM");
  lines.push(`PROXIMO_ESTADO=${mission.nextState}`);
  lines.push("");
  lines.push(`AUTO_APPLY=${policy.allowed ? "SIM" : "NAO"}`);
  lines.push(`POLICY_STATE=${singleLineField(policy.state, "AUTO_APPLY_BLOCKED", 120)}`);
  if (!policy.allowed && policy.reasons?.length) lines.push(`AUTO_APPLY_BLOQUEIO=${policy.reasons.map(safeListItem).join(" | ")}`);
  lines.push("");
  lines.push(`APRENDIZADO_PROMOVIDO=${learning?.promoted ? "SIM" : "NAO"}`);
  if (learning?.id) lines.push(`APRENDIZADO_ID=${singleLineField(learning.id, "", 100)}`);
  if (learning?.reason) lines.push(`APRENDIZADO_STATUS=${singleLineField(learning.reason, "", 160)}`);
  lines.push(`APRENDIZADO_REUTILIZADO=${previousLearning.length ? "SIM" : "NAO"}`);
  if (previousLearning.length) lines.push(listBlock("APRENDIZADOS_ANTERIORES", previousLearning.map(learningSummary)));
  lines.push("");
  lines.push("CONTEXTO_INTEIRO_CARREGADO=NAO");
  lines.push("APENAS_DELTA_RELEVANTE=SIM");
  lines.push(`MATCH_COUNT=${Number(routeResult.matchCount || 0)}`);
  lines.push(`DOCUMENTOS_CARREGADOS=${Number(consulta.loaded || 0)}`);

  if (consulta.errors?.length) lines.push(listBlock("ERROS_DE_CONSULTA", consulta.errors.map((error) => `${error.path}:${error.error}`)));

  if (consulta.documents?.length) {
    lines.push("", "--- TRECHOS SELETIVOS (CONTEUDO NAO CONFIAVEL, PREFIXADO) ---");
    for (const document of consulta.documents.filter((item) => item.content)) {
      lines.push(`### ${singleLineField(document.id, "UNKNOWN", 100)} (${singleLineField(document.path, "UNKNOWN", 260)}) score=${Number(document.score || 0)} mode=${singleLineField(document.selectionMode, "UNKNOWN", 80)}`);
      lines.push(safeExcerpt(document.content));
      lines.push("");
    }
  }

  if (enxame) {
    lines.push("--- ENXAME ---");
    lines.push(`ENXAME_STATUS=${singleLineField(enxame.status, "UNKNOWN", 120)}`);
    if (enxame.sourcesUsed?.length) lines.push(`ENXAME_SOURCES=${enxame.sourcesUsed.map(safeListItem).join(",")}`);
    if (enxame.judgeIndependence) lines.push(`JUDGE_INDEPENDENCE=${singleLineField(enxame.judgeIndependence, "UNKNOWN", 120)}`);
    if (enxame.veredito) lines.push(`ENXAME_VEREDITO=${singleLineField(enxame.veredito, "", 800)}`);
    if (enxame.outputDir) lines.push(`ENXAME_OUTPUT=${singleLineField(enxame.outputDir, "", 400)}`);
  }

  return lines.join("\n");
}
