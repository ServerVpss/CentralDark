#!/usr/bin/env node
// Bot: vps-healthcheck (Lote 7 do Time de Bots)
// MODO: READ-ONLY. Roda comandos seguros via SSH e abre/atualiza 1 Issue consolidada.
// NUNCA reinicia serviço, NUNCA edita Caddy/Docker/WuzAPI, NUNCA toca em sessão WhatsApp.

import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { findBotIssue, createIssue, updateIssue, repo } from "./lib/gh.mjs";

const MARKER = "<!-- bot:vps-healthcheck -->";
const LABELS = ["auto", "revisao-humana", "assign:grok", "p2"];
const SSH_TIMEOUT = 20; // segundos por comando
const HISTORY_FILE = "CentralDark/apps/projeto-dashboard/healthcheck-history.json";
const HISTORY_DAYS = 30;


function ssh(cmd) {
  try {
    const out = execSync(
      `ssh -o BatchMode=yes -o StrictHostKeyChecking=no -o ConnectTimeout=${SSH_TIMEOUT} ` +
      `-i "$VPS_SSH_KEY_FILE" "$VPS_USER@$VPS_HOST" ${JSON.stringify(cmd)}`,
      { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: (SSH_TIMEOUT + 5) * 1000 }
    );
    return { ok: true, out: out.trim() };
  } catch (e) {
    return { ok: false, out: (e.stdout || "").toString().trim(), err: (e.stderr || e.message || "").toString().slice(0, 400) };
  }
}

// Checks read-only — nada que mexa em produção.
const CHECKS = [
  { id: "pm2",     label: "PM2 (lista de processos)", cmd: "pm2 jlist 2>/dev/null | head -c 8000" },
  { id: "portas",  label: "Portas escutando (ss -tlnp)", cmd: "ss -tlnp 2>/dev/null | head -50" },
  { id: "disco",   label: "Uso de disco (df -h /)", cmd: "df -h / | tail -1" },
  { id: "inodes",  label: "Uso de inode (df -i /)", cmd: "df -i / | tail -1" },
  { id: "memoria", label: "Memória livre (free -h)", cmd: "free -h | head -2" },
  { id: "load",    label: "Load average", cmd: "uptime" },
  { id: "caddy",   label: "Caddy ativo (systemctl is-active)", cmd: "systemctl is-active caddy 2>/dev/null || echo unknown" },
  { id: "git-head",label: "Git HEAD em /root", cmd: "cd /root && git rev-parse --short HEAD 2>/dev/null || echo no-repo" },
  { id: "uptime-sys", label: "Uptime do servidor", cmd: "uptime -p" },
  { id: "grok-worktrees", label: "Tamanho /root/.grok/worktrees (proteção recursão)", cmd: "du -sh /root/.grok/worktrees 2>/dev/null || echo none" },
];

function classify(results) {
  // Severity simples: P0 se SSH caiu / disco >95% / PM2 erro grave; P1 se algum critical não respondeu; P2 caso contrário.
  const findings = [];
  let severity = "p3";

  const sshOk = results.every(r => r.ok || r.id === "grok-worktrees");
  if (!sshOk && !results[0].ok) {
    return { severity: "p0", findings: ["🛑 SSH não respondeu — `pm2 jlist` falhou. Verificar VPS imediatamente."] };
  }

  const disco = results.find(r => r.id === "disco");
  if (disco?.ok) {
    const m = disco.out.match(/(\d+)%/);
    if (m) {
      const pct = parseInt(m[1], 10);
      if (pct >= 95) { findings.push(`🔥 Disco em ${pct}% — risco P0`); severity = "p0"; }
      else if (pct >= 85) { findings.push(`⚠️ Disco em ${pct}% — atenção`); severity = "p1"; }
    }
  }

  const caddy = results.find(r => r.id === "caddy");
  if (caddy?.ok && caddy.out !== "active") {
    findings.push(`⚠️ Caddy não está ativo (status: \`${caddy.out}\`)`);
    if (severity === "p3") severity = "p1";
  }

  const grok = results.find(r => r.id === "grok-worktrees");
  if (grok?.ok && /([0-9.]+)G/.test(grok.out)) {
    const gb = parseFloat(grok.out.match(/([0-9.]+)G/)[1]);
    if (gb > 5) { findings.push(`⚠️ /root/.grok/worktrees com ${grok.out} (recursão Grok? — pendência #30)`); if (severity === "p3") severity = "p2"; }
  }

  const pm2 = results.find(r => r.id === "pm2");
  if (pm2?.ok) {
    try {
      const list = JSON.parse(pm2.out);
      const errored = list.filter(p => p.pm2_env?.status !== "online");
      if (errored.length) {
        findings.push(`⚠️ ${errored.length} processo(s) PM2 não-online: ${errored.map(p => `\`${p.name}\``).join(", ")}`);
        if (severity === "p3") severity = "p1";
      }
    } catch { /* PM2 truncado, ignora */ }
  }

  if (!findings.length) findings.push("✅ Nenhum sinal vermelho detectado nos 10 checks read-only.");
  return { severity, findings };
}

function renderBody(results, severity, findings) {
  const ts = new Date().toISOString();
  const blocks = results.map(r => {
    const tag = r.ok ? "✅" : "❌";
    const out = (r.out || "(vazio)").slice(0, 2000);
    const err = r.err ? `\n  ↳ erro: \`${r.err.replace(/\n/g, " ").slice(0, 200)}\`` : "";
    return `### ${tag} ${r.label}\n\n\`\`\`\n${out}\n\`\`\`${err}`;
  }).join("\n\n");

  return `${MARKER}
🤖 **vps-healthcheck** — relatório read-only do estado da VPS.

> **Severidade:** \`${severity}\` · **Atualizado:** ${ts}
> **Modo:** apenas leitura. Este bot NÃO reinicia serviço, NÃO edita Caddy/Docker/WuzAPI, NÃO toca em sessão WhatsApp. Toda ação corretiva exige humano.

## Findings

${findings.map(f => `- ${f}`).join("\n")}

## Checks (10 read-only)

${blocks}

---
_Atualizado automaticamente pelo workflow \`vps-healthcheck.yml\` (cron 6h + manual). A Issue se atualiza no lugar — não duplica._
`;
}

async function notifyTelegram(severity, findings, issueUrl) {
  const token = process.env.SRVER1_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !chatId) {
    console.log("[vps-healthcheck] Telegram não configurado — pulando notificação");
    return;
  }
  const icons = { p0: "🔴", p1: "🟠", p2: "🟡", p3: "✅" };
  const icon = icons[severity] || "❓";
  const ts = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const text = severity === "p3"
    ? `✅ <b>VPS Healthcheck — Recuperado</b>\n\n🕐 ${ts}\nTodos os checks OK. VPS saudável.`
    : `${icon} <b>VPS Healthcheck — ${severity.toUpperCase()}</b>\n\n${findings.slice(0, 3).map(f => `• ${f}`).join("\n")}\n\n🕐 ${ts}\n<a href="${issueUrl}">Ver Issue completa</a>`;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    const data = await res.json();
    if (data.ok) console.log("[vps-healthcheck] Telegram notificado ✅");
    else console.warn("[vps-healthcheck] Telegram falhou:", data.description);
  } catch (e) {
    console.warn("[vps-healthcheck] Telegram erro (não-fatal):", e.message);
  }
}

function shouldNotify(severity, lastSeverity) {
  const isAlert = ["p0", "p1"].includes(severity);
  const wasAlert = ["p0", "p1"].includes(lastSeverity);
  if (severity === "p0") return true;                    // P0 sempre notifica
  if (isAlert && !wasAlert) return true;                 // novo problema
  if (!isAlert && wasAlert) return true;                 // recuperação
  if (isAlert && severity !== lastSeverity) return true; // escalada ex: p1→p0
  return false;
}

async function main() {
  const required = ["VPS_HOST", "VPS_USER", "VPS_SSH_KEY_FILE"];
  for (const v of required) {
    if (!process.env[v]) {
      console.error(`[vps-healthcheck] faltando env ${v} — abortando`);
      process.exit(2);
    }
  }

  console.log("[vps-healthcheck] rodando 10 checks read-only via SSH…");
  const results = CHECKS.map(c => {
    const r = ssh(c.cmd);
    return { id: c.id, label: c.label, ok: r.ok, out: r.out, err: r.err };
  });

  const { severity, findings } = classify(results);
  console.log(`[vps-healthcheck] severidade=${severity} findings=${findings.length}`);

  const title = `[vps-healthcheck] Estado da VPS — ${severity.toUpperCase()} — ${findings[0].slice(0, 80)}`;
  const body = renderBody(results, severity, findings);
  const labels = LABELS.map(l => l === "p2" ? severity : l).filter((v, i, a) => a.indexOf(v) === i);

  const existing = await findBotIssue(MARKER);
  let issueNumber, issueUrl;
  if (existing) {
    console.log(`[vps-healthcheck] atualizando Issue #${existing.number}`);
    await updateIssue(existing.number, { title, body, labels });
    issueNumber = existing.number;
    issueUrl = existing.html_url;
  } else {
    console.log("[vps-healthcheck] criando Issue nova");
    const issue = await createIssue({ title, body, labels });
    console.log(`[vps-healthcheck] criada Issue #${issue?.number}`);
    issueNumber = issue?.number;
    issueUrl = issue?.html_url || `https://github.com/${repo}/issues/${issue?.number}`;
  }

  // Histórico + dedup Telegram — lê last severity antes de appendar o evento atual.
  let lastSeverity = "p3";
  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - HISTORY_DAYS * 24 * 60 * 60 * 1000).toISOString();
    let history = { marker: "vps-healthcheck-history", description: "Histórico do bot vps-healthcheck (máx 30 dias).", events: [] };
    if (existsSync(HISTORY_FILE)) {
      try { history = JSON.parse(readFileSync(HISTORY_FILE, "utf8")); } catch {}
      if (!Array.isArray(history.events)) history.events = [];
    }
    history.events = history.events.filter(e => e.time && e.time >= cutoff);
    if (history.events.length) lastSeverity = history.events[history.events.length - 1].severity || "p3";
    history.events.push({
      time: now.toISOString(),
      severity,
      findings,
      issueNumber,
      issueUrl,
      diskUsedPercent: (results.find(r => r.id === "disco")?.out.match(/(\d+)%/) || [])[1] || null,
      caddyStatus: results.find(r => r.id === "caddy")?.out || null,
    });
    history.lastUpdate = now.toISOString();
    history.latestIssue = { number: issueNumber, url: issueUrl, severity };
    writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2) + "\n");
    console.log(`[vps-healthcheck] histórico atualizado (${history.events.length} eventos nos últimos ${HISTORY_DAYS}d)`);
  } catch (e) {
    console.warn("[vps-healthcheck] falha ao atualizar histórico (não-fatal):", e.message);
  }

  // Notificação Telegram — só dispara quando o estado muda.
  console.log(`[vps-healthcheck] severidade anterior=${lastSeverity} atual=${severity}`);
  if (shouldNotify(severity, lastSeverity)) {
    await notifyTelegram(severity, findings, issueUrl);
  } else {
    console.log("[vps-healthcheck] sem mudança de estado — Telegram silenciado");
  }

  console.log("[vps-healthcheck] ok");
}




main().catch(e => {
  console.error("[vps-healthcheck] erro fatal:", e.message);
  process.exit(1);
});
