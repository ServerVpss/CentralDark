# COMANDO - actions-vermelhos.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\scripts\vigia\actions-vermelhos.mjs
**SHA:** 1241e0806a443250
**Timestamp:** 2026-08-26T19:32:52.999049
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // - workflow_run: avalia o run que disparou; abre/atualiza/fecha Issue.
- //   - Se último run = failure  → cria (ou comenta) Issue.
- //   - Se último run = success  → fecha Issues abertas desse workflow.
- `**Run:** [#${run.run_number}](${run.html_url})`,

### Decisoes
- const conclusao = run.conclusion;
- const ok = conclusao === "success";

### Ouro Bruto (primeiros 5000 chars)
```
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
      await gh.issues.update(
```