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

// Notificação Telegram — fire-and-forget, nunca derruba o vigia
async function notificarTelegram(mensagem) {
  const token = process.env.SRVER1_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: mensagem, parse_mode: "HTML", disable_web_page_preview: true }),
    });
  } catch (e) {
    console.warn("[Telegram] falhou (não crítico):", e.message);
  }
}


function safeGithubLabelName(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-:_]+|[-:_]+$/g, '')
    .slice(0, 50)
    .replace(/[-:_]+$/g, '');
}

const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const [owner, repo] = (process.env.GITHUB_REPOSITORY || "").split("/");
if (!token || !owner || !repo) {
  console.error("faltando GH_TOKEN / GITHUB_REPOSITORY");
  process.exit(1);
}

const gh = new Octokit({ auth: token });
const EVENT = process.env.EVENT_NAME || "schedule";
const AUTO_REPAIR_BILLING_GUARD = process.env.AUTO_REPAIR_BILLING_GUARD === "true";

const SELF = "vigia-actions-vermelhos";
const IGNORADOS = new Set([SELF]); // não vigiamos a nós mesmos
const FLUXOS_SENSIVEIS = /deploy|caddy|docker|pm2|wuzapi|whatsapp|crm|supabase|database|banco|secret/i;

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

const labelDoWorkflow = (name) => safeGithubLabelName(`red-action:${slug(name)}`);

const BILLING_PATTERNS = [
  /billing/i,
  /spending limit/i,
  /hosted runner/i,
  /no hosted runners/i,
  /runner request/i,
  /waiting for a runner/i,
  /job was not started/i,
  /startup failure/i,
];

const isFalhaDeEsteira = (run, err) => {
  const texto = [
    run.name,
    run.display_title,
    run.conclusion,
    run.status,
    run.head_commit?.message,
    err?.job,
    err?.step,
    err?.message,
  ].filter(Boolean).join("\n");

  if (BILLING_PATTERNS.some((pattern) => pattern.test(texto))) return true;

  // Quando o GitHub falha antes de expor steps, o Vigia recebe failure mas
  // nao consegue apontar etapa. Isso costuma ser falha de runner/esteira,
  // nao erro de codigo do repo.
  return run.conclusion === "failure" && (!err || err.step === "(passo desconhecido)");
};

const classificacaoDe = (run, err) => {
  if (!isFalhaDeEsteira(run, err)) {
    return {
      tipo: "codigo-ou-config",
      label: "p2",
      titulo: "Falha de workflow",
      resumo: "Falha comum de workflow. Ler logs do job/step antes de corrigir.",
      acao: [
        "1. Abrir o link do run e ler o passo que falhou.",
        "2. Corrigir via branch/PR quando envolver workflow, runner, CI, infra, secrets, portas ou deploy.",
        "3. So usar commit direto em main para ajuste documental/baixo risco previamente aprovado.",
        "4. Esperar proximo run — o Vigia fecha essa Issue sozinho quando voltar ao verde.",
      ],
    };
  }

  return {
    tipo: "esteira-runner-billing",
    label: "p1",
    titulo: "Falha de esteira/runner",
    resumo: "Possivel falha antes dos steps por billing/spending limit ou indisponibilidade de runner GitHub-hosted.",
    acao: [
      "1. Confirmar no run se a falha cita billing, spending limit, runner indisponivel ou job nao iniciado.",
      "2. Se confirmar, abrir PR draft migrando somente este workflow para `runs-on: self-hosted`.",
      "3. Validar que o runner self-hosted da VPS esta online antes de mergear.",
      "4. Nao fazer auto-merge, deploy, restart, Caddy, Docker, PM2 ou leitura de secrets nessa correcao.",
    ],
  };
};

const assignDe = (name) => {
  const n = name.toLowerCase();
  if (n.includes("codeql") || n.includes("security")) return "assign:codex";
  if (n.includes("painel") || n.includes("frontend") || n.includes("ui")) return "assign:lovable";
  if (n.includes("deploy") || n.includes("vps") || n.includes("pm2")) return "assign:grok";
  if (n.includes("supabase") || n.includes("migrations") || n.includes("db")) return "assign:supabase-bot";
  if (n.includes("bot-server") || n.includes("whatsapp") || n.includes("wuzapi")) return "assign:codex";
  return "assign:codex";
};


async function obterWorkflowDoRun(run) {
  if (!run.workflow_id) return null;
  try {
    const { data } = await gh.actions.getWorkflow({ owner, repo, workflow_id: run.workflow_id });
    return data;
  } catch (e) {
    console.warn(`vigia: nao consegui obter workflow_id=${run.workflow_id}: ${e.message}`);
    return null;
  }
}

function migrarRunsOnParaSelfHosted(conteudo) {
  // Patch propositalmente pequeno: cobre o caso oficial do Billing Guard,
  // workflows usando GitHub-hosted literal. Nao tenta reescrever matrizes,
  // arrays complexos ou runners sensiveis sem revisao humana.
  const proximo = conteudo
    .replace(/runs-on:\s*ubuntu-latest\b/g, "runs-on: self-hosted")
    .replace(/runs-on:\s*\[\s*ubuntu-latest\s*\]/g, "runs-on: self-hosted");
  return proximo === conteudo ? null : proximo;
}

async function abrirPrAutoRepairSelfHosted(run, classificacao) {
  if (!AUTO_REPAIR_BILLING_GUARD || classificacao.tipo !== "esteira-runner-billing") {
    return { status: "desativado" };
  }

  const workflow = await obterWorkflowDoRun(run);
  const caminho = workflow?.path;
  if (!caminho || !caminho.startsWith(".github/workflows/")) {
    return { status: "sem-workflow-path" };
  }
  if (FLUXOS_SENSIVEIS.test(`${run.name}\n${caminho}`)) {
    return { status: "bloqueado-sensivel", caminho };
  }

  const baseBranch = run.repository?.default_branch || "main";
  const branchName = `vigia/billing-guard-${slug(run.name)}`;
  const { data: baseRef } = await gh.git.getRef({ owner, repo, ref: `heads/${baseBranch}` });

  let branchCriada = false;
  try {
    await gh.git.createRef({ owner, repo, ref: `refs/heads/${branchName}`, sha: baseRef.object.sha });
    branchCriada = true;
  } catch (e) {
    if (e.status !== 422) throw e;
  }

  const { data: arquivo } = await gh.repos.getContent({ owner, repo, path: caminho, ref: branchName });
  if (Array.isArray(arquivo) || arquivo.type !== "file") return { status: "conteudo-invalido", caminho };

  const atual = Buffer.from(arquivo.content, "base64").toString("utf8");
  const migrado = migrarRunsOnParaSelfHosted(atual);
  if (!migrado) return { status: "ja-sem-ubuntu-latest-ou-complexo", caminho, branchName };

  await gh.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: caminho,
    branch: branchName,
    sha: arquivo.sha,
    message: `fix(actions): route ${run.name} to self-hosted`,
    content: Buffer.from(migrado, "utf8").toString("base64"),
  });

  let pr;
  try {
    const { data } = await gh.pulls.create({
      owner,
      repo,
      title: `fix(actions): route ${run.name} to self-hosted`,
      head: branchName,
      base: baseBranch,
      draft: true,
      body: [
        "## Vigia Billing Guard — Auto-Repair",
        "",
        `O Vigia classificou o run [#${run.run_number}](${run.html_url}) como \`${classificacao.tipo}\`.`,
        "",
        "### Correção proposta",
        `- Migrar \`${caminho}\` de \`runs-on: ubuntu-latest\` para \`runs-on: self-hosted\`.`,
        "- Manter o PR como draft para revisão humana/Codex antes do merge.",
        "- Não tocar Caddy, Docker, PM2, WuzAPI, CRM, banco, sessões ou secrets.",
        "",
        "### Validação pós-merge esperada",
        "- Confirmar runner self-hosted online.",
        "- Reexecutar ou aguardar o próximo run do workflow afetado.",
        "- O Vigia fecha a issue quando o workflow voltar ao verde.",
      ].join("\n"),
    });
    pr = data;
  } catch (e) {
    if (e.status !== 422) throw e;
    const { data: prs } = await gh.pulls.list({ owner, repo, head: `${owner}:${branchName}`, state: "open", per_page: 1 });
    pr = prs[0];
  }

  return {
    status: "pr-draft",
    caminho,
    branchName,
    branchCriada,
    pr: pr ? `#${pr.number}` : "existente-ou-nao-localizado",
    url: pr?.html_url,
  };
}

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
    garantirLabel("p1", "D73A4A", "Prioridade alta"),
    garantirLabel("p2", "FBCA04", "Prioridade média"),
    garantirLabel("esteira", "5319E7", "Falha de esteira/runner/billing"),
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
      await notificarTelegram(
        `✅ <b>Recuperado</b> — <code>${nome}</code>\n` +
        `▸ Run <a href="${run.html_url}">#${run.run_number}</a> voltou ao verde\n` +
        `▸ Issue #${issue.number} fechada automaticamente\n` +
        `<i>#CentralDark #vigia #recuperado</i>`
      );
      return { acao: "fechou", nome, issue: issue.number };
    }
    return { acao: "verde", nome };
  }

  // failure / timed_out / etc.
  const err = await extrairErro(run);
  const classificacao = classificacaoDe(run, err);
  const labelsBase = ["vigia", "auto", classificacao.label, label, assign];
  if (classificacao.tipo === "esteira-runner-billing") labelsBase.push("esteira");

  const autoRepair = await abrirPrAutoRepairSelfHosted(run, classificacao);

  const corpoBase = [
    `**Workflow:** \`${nome}\``,
    `**Conclusão:** \`${run.conclusion}\``,
    `**Run:** [#${run.run_number}](${run.html_url})`,
    `**Branch:** \`${run.head_branch}\``,
    `**Commit:** \`${run.head_sha.slice(0,7)}\` — ${run.head_commit?.message?.split("\n")[0] || ""}`,
    `**Autor:** @${run.actor?.login || "?"}`,
    err ? `**Job que falhou:** \`${err.job}\` → passo \`${err.step}\` → [logs](${err.url})` : `_Sem detalhe de job/step (provavel falha antes de iniciar steps ou setup)._`,
    `**Classificação Vigia:** \`${classificacao.tipo}\` — ${classificacao.resumo}`,
    autoRepair.status !== "desativado" ? `**Auto-Repair Billing Guard:** \`${autoRepair.status}\`${autoRepair.url ? ` → ${autoRepair.url}` : ""}${autoRepair.caminho ? ` (arquivo: \`${autoRepair.caminho}\`)` : ""}` : null,
  ].filter(Boolean).join("\n");

  if (issue) {
    await gh.issues.createComment({
      owner, repo, issue_number: issue.number,
      body: `🔴 **Nova falha** detectada pelo Vigia.\n\n${corpoBase}`,
    });
    await notificarTelegram(
      `🔴 <b>Nova falha</b> — <code>${nome}</code>\n` +
      `▸ Run <a href="${run.html_url}">#${run.run_number}</a> · branch <code>${run.head_branch}</code>\n` +
      `▸ Commit <code>${run.head_sha.slice(0,7)}</code> · @${run.actor?.login || "?"}\n` +
      `▸ Issue <a href="https://github.com/${owner}/${repo}/issues/${issue.number}">#${issue.number}</a> (falha recorrente)\n` +
      `<i>#CentralDark #vigia #alerta</i>`
    );
    return { acao: "comentou", nome, issue: issue.number };
  }

  const titulo = `🔴 [Vigia] ${classificacao.titulo}: ${nome}`;
  const corpo = [
    `O **Vigia de Actions Vermelhos** detectou que o workflow \`${nome}\` está falhando.`,
    ``,
    corpoBase,
    ``,
    `---`,
    `**O que fazer:**`,
    ...classificacao.acao,
    ``,
    `Bot dono atribuído pela label \`${assign}\` — o Dispatcher posta briefing.`,
    `Dedupe pela label \`${label}\` — novas falhas viram comentário aqui, não Issue duplicada.`,
  ].join("\n");

  const { data: nova } = await gh.issues.create({
    owner, repo,
    title: titulo,
    body: corpo,
    labels: labelsBase,
  });
  await notificarTelegram(
    `🔴 <b>Workflow com falha</b> — <code>${nome}</code>\n` +
    `▸ Run <a href="${run.html_url}">#${run.run_number}</a> · branch <code>${run.head_branch}</code>\n` +
    `▸ Commit <code>${run.head_sha.slice(0,7)}</code> · @${run.actor?.login || "?"}\n` +
    `▸ Issue <a href="https://github.com/${owner}/${repo}/issues/${nova.number}">#${nova.number}</a> aberta\n` +
    `<i>#CentralDark #vigia #alerta</i>`
  );
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
