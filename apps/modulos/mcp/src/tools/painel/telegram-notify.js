import { pick } from "../integrations.js";
export async function notifyTelegramPainel(opts) {
    const token = pick("TELEGRAM_BOT_TOKEN", "SRVER1_BOT_TOKEN");
    const chatId = pick("TELEGRAM_ALERTS_CHAT_ID", "TELEGRAM_CHANNEL_ID");
    if (!token || !chatId)
        return;
    const icon = opts.pushed ? "✅" : "❌";
    const title = opts.pushed ? "Painel Atualizado" : "Push Falhou";
    const text = `${icon} <b>${title}</b>\n\n` +
        `${opts.evento}\n\n` +
        `<code>${opts.commit}</code>`;
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            disable_web_page_preview: true,
        }),
    });
}
//# sourceMappingURL=telegram-notify.js.map