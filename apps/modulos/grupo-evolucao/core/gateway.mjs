// Cliente do Lovable AI Gateway
const KEY = process.env.LOVABLE_API_KEY;
const URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

export async function chamar(modelo, mensagens, extras = {}) {
  if (!KEY) throw new Error('LOVABLE_API_KEY ausente');
  const r = await fetch(URL, {
    method: 'POST',
    headers: { 'Lovable-API-Key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: modelo, messages: mensagens, ...extras }),
  });
  const json = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`gateway ${r.status}: ${JSON.stringify(json).slice(0, 300)}`);
  return json?.choices?.[0]?.message?.content || '';
}
