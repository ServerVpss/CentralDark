import process from 'node:process';

async function sendTelegramMessage(chatId, text) {
  const url = 'https://connector-gateway.lovable.dev/telegram/sendMessage';
  const apiKey = process.env.LOVABLE_API_KEY;
  const connectionId = 'std_01kvw4jkcbekyr1t33vs4p5e9w';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'x-telegram-api-key': process.env.TELEGRAM_API_KEY // Incluindo conforme solicitado
    },
    body: JSON.stringify({
      connection_id: connectionId,
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`Erro ao enviar para ${chatId}: ${response.status} ${response.statusText}`);
    console.error(`Body: ${body}`);
    return false;
  }
  return true;
}

async function main() {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '1901426549';
  const statusChannelId = process.env.TELEGRAM_STATUS_CHANNEL_ID || '-1003669176367';

  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const adminMsg = `
<b>🚀 Arsenal Council — Rollout Fase 2+3</b>

• 4 verbos validados (router/parallel/debate/hermes)
• sidecar cd-tools porta 9077 up
• 5 slash-commands plantados
• tema Esmeralda pronto (esperando docker restart)
• aprendizados 266/267/268 gravados

<i>Gerado em: ${now} (BRT)</i>
`.trim();

  const channelMsg = `✅ Arsenal Council fase 2+3 fechada — verbos OK, tools OK, Esmeralda pronto (falta reload WebUI)`;

  console.log('Iniciando disparos de notificação...');

  const results = await Promise.all([
    sendTelegramMessage(adminChatId, adminMsg),
    sendTelegramMessage(statusChannelId, channelMsg)
  ]);

  if (results.every(r => r === true)) {
    console.log('Sucesso: Notificações enviadas.');
    process.exit(0);
  } else {
    console.error('Falha: Algumas notificações não puderam ser enviadas.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
