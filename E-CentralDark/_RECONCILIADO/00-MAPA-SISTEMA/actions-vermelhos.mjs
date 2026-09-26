#!/usr/bin/env node
// Vigia de Actions Vermelhos.
// - workflow_run: avalia o run que disparou; abre/atualiza/fecha Issue.
// - schedule: varre últimos 100 runs e processa cada workflow distinto.
//
// Por workflow:
//   - Issue dedupe por label `red-action:<slug>` (+ `vigia`, `auto`, `p2`, `assign:<bot>`).
//   - Se último run = failure  → cria (ou comenta) Issue.
//   - Se último run = success  → fecha Issues abertas desse workflow.
//
// Saída: log curto stdout. Erros não-fatais não derrubam o job.

// IMPORTANTE: import vindo de node_modules local (scripts/vigia/package.json),
// nunca de URL https — Node 22 não suporta ERR_UNSUPPORTED_ESM_URL_SCHEME.
// O workflow roda `npm ci --prefix scripts/vigia` antes deste arquivo.
import { Octokit } from "@octokit/rest";

const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
if (!token || !owner || !repo) {
  console.error("faltando GH_TOKEN / GITHUB_REPOSITORY");
  process.exit(1);
}

const gh = new Octokit({ auth: token });
const EVENT = process.env.EVENT_NAME || "schedule";

const SELF = "vigia-actions-vermelhos";
const IGNORADOS = new Set([SELF]); // não vigiamos a nós mesmos

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

const labelDoWorkflow = (name) => `red-action:${slug(name)}`;

const assignDe = (name) => {
  const n = name.toLowerCase();
  if (n.includes("codeql") || n.includes("security")) return "assign:codex";
  if (n.includes("painel") || n.includes("frontend") || n.includes("ui")) return "assign:lovable";
  if (n.includes("deploy") || n.includes("vps") || n.includes("pm2")) return "assign:grok";
  if (n.includes("supabase") || n.includes("migrations") || n.includes("db")) return "assign:supabase-bot";
  if (n.includes("bot-server") || n.includes("whatsapp") || n.includes("wuzapi")) return "assign:codex";
  return "assign:codex";
};

async function garantirLabel(name, color, description) {
  try {
    await gh.issues.getLabel({ owner, repo, name });
  } catch {
    try {
      await gh.issues.createLabel({ owner, repo, name, color, description });
    } catch (e) {
      // corrida com outro job; ignora
    }
  }
}

async function listarRunsAlvo() {
  if (EVENT === "workflow_run" && process.env.TRIGGER_RUN_ID) {
    const id = Number(process.env.TRIGGER_RUN_ID);
    const { data } = await gh.actions.getWorkflowRun({ owner, repo, run_id: id });
    return [data];
  }
  // schedule / dispatch: pega últimos 100 runs e fica com o mais recente de cada workflow
  const { data } = await gh.actions.listWorkflowRunsForRepo({
    owner, repo, per_page: 100, status: "completed",
  });
  const porWorkflow = new Map();
  for (const r of data.workflow_runs || []) {
    if (!porWorkflow.has(r.name)) porWorkflow.set(r.name, r);
  }
  return [...porWorkflow.values()];
}

async function extrairErro(run) {
  // tenta puxar logs do primeiro job com falha (texto curto)
  try {
    const { data: jobs } = await gh.actions.listJobsForWorkflowRun({
      owner, repo, run_id: run.id, per_page: 30,
    });
    const failed = (jobs.jobs || []).find((j) => j.conclusion === "failure");
    if (!failed) return null;
    const failedStep = (failed.steps || []).find((s) => s.conclusion === "failure");
    return {
      job: failed.name,
      step: failedStep?.name || "(passo desconhecido)",
      url: failed.html_url,
    };
  } catch {
    return null;
  }
}

async function acharIssue(label) {
  const { data } = await gh.issues.listForRepo({
    owner, repo, state: "open", labels: `vigia,${label}`, per_page: 5,
  });
  return data[0] || null;
}

async function processarRun(run) {
  const nome = run.name || "(sem nome)";
  if (IGNORADOS.has(nome)) return { skip: true, nome };

  const label = labelDoWorkflow(nome);
  const assign = assignDe(nome);

  await Promise.all([
    garantirLabel("vigia", "B60205", "Aberta pelo Vigia de Actions Vermelhos"),
    garantirLabel("auto", "0E8A16", "Automação"),
    garantirLabel("p2", "FBCA04", "Prioridade média"),
    garantirLabel(label, "B60205", `Workflow vermelho: ${nome}`),
    garantirLabel(assign, "5319E7", "Dispatcher: bot dono"),
  ]);

  const issue = await acharIssue(label);
  const conclusao = run.conclusion;
  const ok = conclusao === "success";
  // Conclusões "neutras" (não são falha real): skipped, cancelled, neutral,
  // action_required (aguardando aprovação). Vigia ignora — não abre Issue
  // nem fecha a existente.
  const NEUTRAS = new Set(["skipped", "cancelled", "neutral", "action_required", null]);
  if (NEUTRAS.has(conclusao)) {
    return { acao: "neutro", nome, conclusao };
  }


  if (ok) {
    if (issue) {
      await gh.issues.createComment({
        owner, repo, issue_number: issue.number,
        body: `✅ **Voltou ao verde** no run [#${run.run_number}](${run.html_url}) (commit \`${run.head_sha.slice(0,7)}\`). Fechando automático.`,
      });
      await gh.issues.update({ owner, repo, issue_number: issue.number, state: "closed", state_reason: "completed" });
      return { acao: "fechou", nome, issue: issue.number };
    }
    return { acao: "verde", nome };
  }

  // failure / cancelled / timed_out / etc.
  const err = await extrairErro(run);
  const corpoBase = [
    `**Workflow:** \`${nome}\``,
    `**Conclusão:** \`${run.conclusion}\``,
    `**Run:** [#${run.run_number}](${run.html_url})`,
    `**Branch:** \`${run.head_branch}\``,
    `**Commit:** \`${run.head_sha.slice(0,7)}\` — ${run.head_commit?.message?.split("\n")[0] || ""}`,
    `**Autor:** @${run.actor?.login || "?"}`,
    err ? `**Job que falhou:** \`${err.job}\` → passo \`${err.step}\` → [logs](${err.url})` : `_Sem detalhe de job (provavelmente setup)._`,
  ].join("\n");

  if (issue) {
    await gh.issues.createComment({
      owner, repo, issue_number: issue.number,
      body: `🔴 **Nova falha** detectada pelo Vigia.\n\n${corpoBase}`,
    });
    return { acao: "comentou", nome, issue: issue.number };
  }

  const titulo = `🔴 [Vigia] Action vermelho: ${nome}`;
  const corpo = [
    `O **Vigia de Actions Vermelhos** detectou que o workflow \`${nome}\` está falhando.`,
    ``,
    corpoBase,
    ``,
    `---`,
    `**O que fazer:**`,
    `1. Abrir o link do run, ler o passo que falhou.`,
    `2. Corrigir no repo (commit direto na main, exceto se for Caddy/Docker/secret/banco).`,
    `3. Esperar próximo run — o Vigia fecha essa Issue sozinho quando voltar ao verde.`,
    ``,
    `Bot dono atribuído pela label \`${assign}\` — o Dispatcher posta briefing.`,
    `Dedupe pela label \`${label}\` — novas falhas viram comentário aqui, não Issue duplicada.`,
  ].join("\n");

  const { data: nova } = await gh.issues.create({
    owner, repo,
    title: titulo,
    body: corpo,
    labels: ["vigia", "auto", "p2", label, assign],
  });
  return { acao: "abriu", nome, issue: nova.number };
}

(async () => {
  const runs = await listarRunsAlvo();
  console.log(`vigia: ${runs.length} workflow(s) pra avaliar (evento=${EVENT})`);
  const resultados = [];
  for (const r of runs) {
    try {
      resultados.push(await processarRun(r));
    } catch (e) {
      console.error(`erro em ${r.name}:`, e.message);
      resultados.push({ erro: e.message, nome: r.name });
    }
  }
  const resumo = resultados.reduce((acc, r) => {
    const k = r.acao || (r.skip ? "skip" : r.erro ? "erro" : "?");
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  console.log("vigia: resumo →", JSON.stringify(resumo));
  for (const r of resultados) console.log(" ·", JSON.stringify(r));
})().catch((e) => { console.error(e); process.exit(1); });
