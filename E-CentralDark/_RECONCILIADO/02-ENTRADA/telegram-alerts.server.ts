// Envio de alertas para o Telegram (mesmo bot do MultiZap usado pelos deploys).
// Servidor-only. Fire-and-forget: nunca quebra fluxo se Telegram falhar.

const TELEGRAM_API = "https://api.telegram.org";

export type TelegramAlertInput = {
  title: string;
  friendlySummary: string;
  technicalReport: string;
  aiSuggestion?: string | null;
  pagePath?: string | null;
  workspaceId?: string | null;
  userId?: string | null;
  errorId?: string | null;
};

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
}

function clip(s: string, max: number): string {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export async function sendTelegramAlert(input: TelegramAlertInput): Promise<{
  ok: boolean;
  error?: string;
}> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ALERTS_CHAT_ID;

  if (!token || !chatId) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN ou TELEGRAM_ALERTS_CHAT_ID não configurados" };
  }

  const parts: string[] = [];
  parts.push(`🚨 <b>${esc(input.title)}</b>`);
  parts.push("");
  parts.push(`<b>O que aconteceu (resumo):</b>\n${esc(clip(input.friendlySummary, 600))}`);
  if (input.pagePath) parts.push(`\n<b>Onde:</b> <code>${esc(input.pagePath)}</code>`);
  if (input.workspaceId) parts.push(`<b>Workspace:</b> <code>${esc(input.workspaceId)}</code>`);
  if (input.userId) parts.push(`<b>Usuário:</b> <code>${esc(input.userId)}</code>`);
  if (input.aiSuggestion) {
    parts.push("");
    parts.push(`<b>💡 Sugestão da IA (cole na Lovable):</b>\n<pre>${esc(clip(input.aiSuggestion, 1200))}</pre>`);
  }
  parts.push("");
  parts.push(`<b>🔧 Relatório técnico:</b>\n<pre>${esc(clip(input.technicalReport, 1800))}</pre>`);
  if (input.errorId) parts.push(`\n<i>ID: ${esc(input.errorId)}</i>`);

  const text = parts.join("\n");

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: `Telegram ${res.status}: ${body.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Falha desconhecida ao enviar pro Telegram" };
  }
}
