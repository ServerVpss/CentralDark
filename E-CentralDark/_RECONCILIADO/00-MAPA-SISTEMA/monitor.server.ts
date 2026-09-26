// Helpers de monitoramento (server-only).
// Roda checagens em paralelo, registra na tabela monitor_heartbeat
// e dispara alerta no Telegram quando algo passa de "ok" para "warn/down".

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendTelegramAlert } from "@/lib/telegram-alerts.server";

export type MonitorStatus = "ok" | "warn" | "down" | "unknown";

export type MonitorCheck = {
  target: string;
  label: string;
  status: MonitorStatus;
  latency_ms: number;
  details: Record<string, unknown>;
  friendly: string; // o que aconteceu, em PT-BR leigo
  fix_hint: string; // o que fazer, em PT-BR leigo
};

const DEDUP_WINDOW_MS = 10 * 60 * 1000; // 10min entre alertas iguais

async function timed<T>(fn: () => Promise<T>): Promise<{ res: T | null; ms: number; err?: string }> {
  const t = Date.now();
  try {
    const res = await fn();
    return { res, ms: Date.now() - t };
  } catch (e: any) {
    return { res: null, ms: Date.now() - t, err: e?.message ?? String(e) };
  }
}

// ===== Checagens =====

async function checkPublicSite(): Promise<MonitorCheck> {
  const url = "https://multizap.dev";
  const { res, ms, err } = await timed(async () => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(url, { method: "HEAD", signal: ctrl.signal });
      return r.status;
    } finally {
      clearTimeout(id);
    }
  });
  const status: MonitorStatus = res && res < 500 ? "ok" : "down";
  return {
    target: "site",
    label: "Site público (multizap.dev)",
    status,
    latency_ms: ms,
    details: { http: res, error: err },
    friendly:
      status === "ok"
        ? "Site público respondendo normalmente."
        : "O site público não respondeu agora.",
    fix_hint:
      status === "ok"
        ? ""
        : "Conferir status do Cloudflare/Lovable e se o último deploy não quebrou a rota '/'.",
  };
}

async function checkGateway(): Promise<MonitorCheck> {
  const baseRaw = process.env.MULTIZAP_GATEWAY_URL || "";
  const token = process.env.MULTIZAP_GATEWAY_TOKEN || "";
  if (!baseRaw) {
    return {
      target: "gateway",
      label: "Gateway MultiZap",
      status: "unknown",
      latency_ms: 0,
      details: { reason: "MULTIZAP_GATEWAY_URL não configurado" },
      friendly: "Endereço do Gateway ainda não foi configurado.",
      fix_hint: "Cadastrar MULTIZAP_GATEWAY_URL nos secrets do projeto.",
    };
  }
  const url = baseRaw.replace(/\/+$/, "") + "/health";
  const { res, ms, err } = await timed(async () => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(url, {
        method: "GET",
        signal: ctrl.signal,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return { status: r.status, ok: r.ok };
    } finally {
      clearTimeout(id);
    }
  });
  const ok = res?.ok === true;
  const status: MonitorStatus = ok ? "ok" : "down";
  return {
    target: "gateway",
    label: "Gateway MultiZap (envio WhatsApp)",
    status,
    latency_ms: ms,
    details: { http: res?.status, error: err, url },
    friendly: ok
      ? "Gateway respondendo, envio de mensagens funcionando."
      : "O Gateway que envia WhatsApp não respondeu agora.",
    fix_hint: ok
      ? ""
      : "Na VPS: 'pm2 logs MultiZap-Gateway' e 'pm2 restart MultiZap-Gateway --update-env'. Não derrubar WuzAPI sem autorização.",
  };
}

async function checkSupabase(): Promise<MonitorCheck> {
  const { res, ms, err } = await timed(async () => {
    const { error } = await supabaseAdmin
      .from("master_settings")
      .select("id")
      .eq("id", 1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return true;
  });
  const ok = !!res;
  return {
    target: "database",
    label: "Banco de dados (Lovable Cloud)",
    status: ok ? "ok" : "down",
    latency_ms: ms,
    details: { error: err },
    friendly: ok
      ? "Banco respondendo normalmente."
      : "O banco de dados não respondeu agora.",
    fix_hint: ok
      ? ""
      : "Conferir status do Lovable Cloud / Supabase. Pode estar pausado ou em manutenção.",
  };
}

async function checkGitHub(): Promise<MonitorCheck> {
  const pat = process.env.GITHUB_PAT;
  if (!pat) {
    return {
      target: "github",
      label: "GitHub (segredounlock/atendimentoo)",
      status: "unknown",
      latency_ms: 0,
      details: { reason: "GITHUB_PAT não configurado" },
      friendly: "Token do GitHub não foi configurado.",
      fix_hint: "Cadastrar GITHUB_PAT nos secrets pra checar divergência de main.",
    };
  }
  const { res, ms, err } = await timed(async () => {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(
        "https://api.github.com/repos/segredounlock/atendimentoo/commits/main",
        {
          headers: {
            Authorization: `Bearer ${pat}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "multizap-monitor",
          },
          signal: ctrl.signal,
        },
      );
      if (!r.ok) throw new Error(`GitHub ${r.status}`);
      const j: any = await r.json();
      return {
        sha: (j?.sha ?? "").slice(0, 7),
        author: j?.commit?.author?.name ?? "?",
        message: (j?.commit?.message ?? "").split("\n")[0]?.slice(0, 120) ?? "",
        date: j?.commit?.author?.date ?? null,
      };
    } finally {
      clearTimeout(id);
    }
  });
  const ok = !!res;
  return {
    target: "github",
    label: "GitHub main",
    status: ok ? "ok" : "warn",
    latency_ms: ms,
    details: { last: res, error: err },
    friendly: ok
      ? `Último commit em main: ${res?.sha} — ${res?.message}`
      : "Não consegui consultar o GitHub agora.",
    fix_hint: ok ? "" : "Conferir se GITHUB_PAT está válido (pode ter expirado).",
  };
}

// ===== Execução =====

export async function runAllChecks(): Promise<MonitorCheck[]> {
  const results = await Promise.all([
    checkPublicSite(),
    checkGateway(),
    checkSupabase(),
    checkGitHub(),
  ]);
  return results;
}

/**
 * Persiste cada checagem e dispara Telegram quando status mudou
 * de "ok" para algo pior (ou se já está ruim e o último alerta foi
 * há mais de DEDUP_WINDOW_MS).
 */
export async function persistAndAlert(checks: MonitorCheck[]): Promise<void> {
  for (const c of checks) {
    // último registro do mesmo target
    const { data: prev } = await supabaseAdmin
      .from("monitor_heartbeat")
      .select("status,alert_sent,last_alert_at,created_at")
      .eq("target", c.target)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const isBad = c.status === "warn" || c.status === "down";
    const wasBad = prev?.status === "warn" || prev?.status === "down";

    let shouldAlert = false;
    if (isBad && !wasBad) {
      shouldAlert = true; // transição ok → ruim
    } else if (isBad && wasBad) {
      const last = prev?.last_alert_at ? new Date(prev.last_alert_at).getTime() : 0;
      if (Date.now() - last > DEDUP_WINDOW_MS) shouldAlert = true;
    } else if (!isBad && wasBad) {
      shouldAlert = true; // recuperou
    }

    let sentNow = false;
    if (shouldAlert) {
      const title = isBad
        ? `⚠️ Problema detectado: ${c.label}`
        : `✅ Recuperado: ${c.label}`;
      const technical = JSON.stringify(
        { target: c.target, status: c.status, latency_ms: c.latency_ms, details: c.details },
        null,
        2,
      );
      const r = await sendTelegramAlert({
        title,
        friendlySummary: c.friendly,
        technicalReport: technical,
        aiSuggestion: c.fix_hint || null,
      });
      sentNow = r.ok;
    }

    await supabaseAdmin.from("monitor_heartbeat").insert({
      target: c.target,
      status: c.status,
      latency_ms: c.latency_ms,
      details: c.details as never,
      alert_sent: sentNow,
      last_alert_at: sentNow ? new Date().toISOString() : prev?.last_alert_at ?? null,
    });
  }
}
