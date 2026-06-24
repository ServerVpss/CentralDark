"""
integrations/telegram_menu.py
Documentação e helpers para integrar o Elite Mapper no menu do bot Telegram.

NÃO MODIFICA o bot-telegram/ diretamente.
Cole os trechos abaixo nos arquivos indicados.
"""

# ──────────────────────────────────────────────────────────────────────────────
# TRECHO 1 — Adicionar ao handlers/commands.js do bot-telegram
# ──────────────────────────────────────────────────────────────────────────────

COMMANDS_JS_PATCH = r"""
// ── Elite Mapper ─────────────────────────────────────────────────────────────
// Adicionar em handlers/commands.js, dentro do switch/if de comandos

if (text === '/mapper' || text === '/mapeamento') {
  await reply(chatId, '🔍 <b>Elite Mapper</b>\nEscolha uma ação:', [
    [{ text: '🚀 Rodar agora (completo)', callback_data: 'mapper:run' }],
    [{ text: '📄 Dry-run (só scan)', callback_data: 'mapper:dryrun' }],
    [{ text: '📋 Ver último relatório', callback_data: 'mapper:report' }],
    [{ text: '🔙 Menu', callback_data: 'cmd:menu' }],
  ]);
  return;
}
"""

# ──────────────────────────────────────────────────────────────────────────────
# TRECHO 2 — Adicionar ao handlers/callbacks.js do bot-telegram
# ──────────────────────────────────────────────────────────────────────────────

CALLBACKS_JS_PATCH = r"""
// ── Elite Mapper callbacks ────────────────────────────────────────────────────
// Adicionar em handlers/callbacks.js, dentro do switch/if de callback_data

if (data === 'mapper:run') {
  await answerCbQuery(callbackQueryId, '⏳ Iniciando...');
  await editMsg(chatId, msgId, '🔍 <b>Elite Mapper rodando...</b>\nAguarde, pode levar 2-5 minutos.');
  const { exec } = await import('child_process');
  exec(
    'cd /root/CentralDark/docs/agente/elite-mapper && python3 elite_mapper.py',
    { timeout: 600000 },
    async (err, stdout, stderr) => {
      const result = err
        ? `❌ Erro: ${err.message}`
        : `✅ Concluído!\n<pre>${stdout.slice(-800)}</pre>`;
      await editMsg(chatId, msgId, result);
    }
  );
  return;
}

if (data === 'mapper:dryrun') {
  await answerCbQuery(callbackQueryId, '⏳ Iniciando dry-run...');
  await editMsg(chatId, msgId, '🔍 <b>Elite Mapper (dry-run)...</b>');
  const { exec } = await import('child_process');
  exec(
    'cd /root/CentralDark/docs/agente/elite-mapper && python3 elite_mapper.py --dry-run',
    { timeout: 600000 },
    async (err, stdout) => {
      const result = err
        ? `❌ Erro: ${err.message}`
        : `✅ Dry-run concluído!\n<pre>${stdout.slice(-800)}</pre>`;
      await editMsg(chatId, msgId, result);
    }
  );
  return;
}

if (data === 'mapper:report') {
  const fs = await import('fs');
  const report_path = '/root/CentralDark/docs/agente/elite-mapper/relatorios/00_RESUMO_EXECUTIVO.md';
  try {
    const content = fs.readFileSync(report_path, 'utf8').slice(0, 3000);
    await editMsg(chatId, msgId,
      `📋 <b>Último Resumo Executivo</b>\n<pre>${content}</pre>`
    );
  } catch (e) {
    await editMsg(chatId, msgId, '⚠️ Nenhum relatório gerado ainda. Use 🚀 Rodar agora primeiro.');
  }
  return;
}
"""

# ──────────────────────────────────────────────────────────────────────────────
# TRECHO 3 — Adicionar botão no panel.cjs (opcional)
# ──────────────────────────────────────────────────────────────────────────────

PANEL_CJS_BUTTON = r"""
// No array de botões do painel principal (panel.cjs), adicionar:
[{ text: '🗺️ Elite Mapper', callback_data: 'mapper:run' }],
"""


def print_integration_guide():
    """Imprime o guia de integração no terminal."""
    print("""
╔═══════════════════════════════════════════════════════════════╗
║           GUIA DE INTEGRAÇÃO — BOT TELEGRAM                   ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  1. Adicione o TRECHO 1 em:                                   ║
║     apps/bot-telegram/handlers/commands.js                    ║
║                                                               ║
║  2. Adicione o TRECHO 2 em:                                   ║
║     apps/bot-telegram/handlers/callbacks.js                   ║
║                                                               ║
║  3. (Opcional) Adicione o TRECHO 3 em:                        ║
║     apps/bot-telegram/panel.cjs                               ║
║                                                               ║
║  4. Reinicie o bot:                                           ║
║     pm2 restart CentralDark-TelegramBot                       ║
║                                                               ║
║  5. No Telegram: /mapper                                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
""")
    print("─── TRECHO 1 (commands.js) ───")
    print(COMMANDS_JS_PATCH)
    print("─── TRECHO 2 (callbacks.js) ───")
    print(CALLBACKS_JS_PATCH)
    print("─── TRECHO 3 (panel.cjs — opcional) ───")
    print(PANEL_CJS_BUTTON)


if __name__ == "__main__":
    print_integration_guide()
