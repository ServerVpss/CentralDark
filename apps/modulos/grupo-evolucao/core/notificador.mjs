// Notificador — Card Hermes v1.3 sempre em <pre>
const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
const ADMIN_CHAT = process.env.TELEGRAM_ADMIN_CHAT_ID || '1901426549';
const GATEWAY = 'https://connector-gateway.lovable.dev/telegram';

function montarCard({ modulo, status, acao, prova, proxima }) {
  const linhas = [
    '╔══════════════════════════════════╗',
    `║   CENTRAL DARK — ${String(modulo).padEnd(15)}║`,
    '╠══════════════════════════════════╣',
    `║ Status:  ${status}`,
    `║ Ação:    ${String(acao || '').slice(0, 60)}`,
    `║ Prova:   ${String(prova || '').slice(0, 60)}`,
    `║ Próxima: ${String(proxima || '').slice(0, 60)}`,
    '╚══════════════════════════════════╝',
  ];
  return `<pre>${linhas.join('\n')}</pre>`;
}

export async function notificar(dados) {
  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
    console.warn('[notificador] credenciais ausentes — pulando envio');
    return { ok: false, motivo: 'sem-credenciais' };
  }
  const r = await fetch(`${GATEWAY}/sendMessage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': TELEGRAM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chat_id: ADMIN_CHAT, text: montarCard(dados), parse_mode: 'HTML' }),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error('[notificador] falhou', r.status, json);
    return { ok: false, status: r.status, json };
  }
  return { ok: true };
}
