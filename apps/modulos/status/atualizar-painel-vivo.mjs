#!/usr/bin/env node
// Atualizador do Mega Painel (status.centralldark.com)
// Recebe variáveis de ambiente do workflow `painel-auto-update.yml`
// e registra o evento em apps/projeto-dashboard/painel-data.json.
//
// Variáveis lidas:
//   PAINEL_EVENTO          — título curto do evento (ex.: "Push na main · <sha>")
//   PAINEL_EVENTO_DETALHE  — descrição maior (ex.: mensagem de commit)
//   PAINEL_EVENTO_AREA     — área/contexto (ex.: "Repositório")
//   SHA                    — hash do commit
//   ACTOR                  — quem disparou
//   MSG                    — mensagem do commit

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
const agora = new Date().toISOString();
const agoraBR = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) + " BRT";

let data;
try {
  data = JSON.parse(readFileSync(ARQ, "utf8"));
} catch (e) {
  console.error("❌ Não consegui ler painel-data.json:", e.message);
  process.exit(1);
}

// 1) Atualiza carimbo
data.updatedAt = agora;
data.updatedAtBR = agoraBR;

// 2) Registra commit recente em project
if (data.project) {
  if (sha) data.project.branch = data.project.branch || "main";
  const primeiraLinha = (detalhe || "").split("\n")[0].slice(0, 200);
  if (primeiraLinha) data.project.lastCommit = primeiraLinha;
}

// 3) Anexa ao events[]
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

// 4) Anexa ao iaTimeline[]
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
