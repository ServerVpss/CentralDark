#!/usr/bin/env node
// Atualizador do Mega Painel (status.centralldark.com)
// Owner canônico: apps/modulos/status/painel-data.json.
//
// Um push Git prova commit/evento. Ele NÃO prova phase/currentTask de runtime.
// Campos voláteis só recebem valor atual quando o chamador fornece evidência
// explícita. Inputs históricos do workflow painel-vivo são absorvidos aqui para
// preservar a capacidade sem manter um segundo updater concorrente.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARQ = resolve(__dirname, "painel-data.json");

const evento = process.env.PAINEL_EVENTO || "Push na main";
const detalhe = process.env.PAINEL_EVENTO_DETALHE || process.env.MSG || "";
const area = process.env.PAINEL_EVENTO_AREA || "Repositório";
const sha = (process.env.SHA || "").slice(0, 7);
const actor = process.env.ACTOR || "desconhecido";
const phaseMedida = String(process.env.PAINEL_PHASE || "").trim();
const currentTaskMedida = String(process.env.PAINEL_CURRENT_TASK || "").trim();
const geralRaw = String(process.env.PAINEL_GERAL || "").trim();
const marco = String(process.env.PAINEL_MARCO || "").trim();
const marcoPctRaw = String(process.env.PAINEL_MARCO_PCT || "").trim();
const marcoStatus = String(process.env.PAINEL_MARCO_STATUS || "").trim();
const agora = new Date().toISOString();
const agoraBR = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) + " BRT";

function parsePercent(raw, field) {
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`${field}_INVALID:${raw}`);
  }
  return value;
}

let data;
try {
  data = JSON.parse(readFileSync(ARQ, "utf8"));
} catch (e) {
  console.error("❌ Não consegui ler painel-data.json:", e.message);
  process.exit(1);
}

const geral = parsePercent(geralRaw, "PAINEL_GERAL");
const marcoPct = parsePercent(marcoPctRaw, "PAINEL_MARCO_PCT");
if (marcoStatus && !["done", "doing", "next", "later"].includes(marcoStatus)) {
  throw new Error(`PAINEL_MARCO_STATUS_INVALID:${marcoStatus}`);
}
if ((marcoPct !== null || marcoStatus) && !marco) {
  throw new Error("PAINEL_MARCO_REQUIRED_FOR_MARCO_UPDATE");
}

data.updatedAt = agora;
data.updatedAtBR = agoraBR;

if (data.project) {
  data.project.branch = "main";
  const primeiraLinha = (detalhe || "").split("\n")[0].slice(0, 200);
  if (primeiraLinha) data.project.lastCommit = primeiraLinha;

  data.project.phase = phaseMedida || "UNKNOWN — não medido neste push";
  data.project.currentTask = currentTaskMedida || "UNKNOWN — não medido neste push";
  if (geral !== null) data.project.overallProgress = geral;
  data.project.stateSource = (phaseMedida || currentTaskMedida || geral !== null || marco)
    ? "explicit-event-payload"
    : "git-push-only";
  data.project.stateMeasuredAt = (phaseMedida || currentTaskMedida || geral !== null || marco) ? agora : null;
}

if (marco) {
  const milestones = Array.isArray(data.milestones) ? data.milestones : [];
  const current = milestones.find((item) => item?.title === marco || item?.id === marco);
  if (current) {
    if (marcoPct !== null) current.percent = marcoPct;
    if (marcoStatus) current.status = marcoStatus;
  } else {
    milestones.push({
      title: marco,
      percent: marcoPct ?? 0,
      status: marcoStatus || "doing",
    });
  }
  data.milestones = milestones;
}

const events = Array.isArray(data.events) ? data.events : [];
events.unshift({
  time: agora,
  titulo: evento,
  detalhe: (detalhe || "").split("\n")[0].slice(0, 240),
  area,
  sha,
  actor,
});
data.events = events.slice(0, 50);

const tl = Array.isArray(data.iaTimeline) ? data.iaTimeline : [];
tl.unshift({
  time: agora,
  ia: `@${actor}`,
  action: `📌 ${evento}${sha ? ` (${sha})` : ""}`,
  area,
  status: "sucesso",
});
data.iaTimeline = tl.slice(0, 50);

writeFileSync(ARQ, JSON.stringify(data, null, 2) + "\n");
console.log(`✅ Painel atualizado — ${evento} (${sha || "sem-sha"})`);
