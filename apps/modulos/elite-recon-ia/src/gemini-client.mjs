// 🩸 Cliente Gemini REST · modelos: gemini-2.5-pro, gemini-2.5-flash.
import { request } from 'undici';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
export async function chamarGemini({ modelo, prompt, system, temperatura = 0.4, timeoutMs = 60000 }) {
  const chave = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!chave) { const e = new Error('GEMINI_API_KEY ausente'); e.status = 401; throw e; }
  const url = `${BASE}/${modelo}:generateContent?key=${chave}`;
  const body = { contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: temperatura, maxOutputTokens: 4096 } };
  if (system) body.systemInstruction = { parts: [{ text: system }] };
  const c = new AbortController(); const to = setTimeout(() => c.abort(), timeoutMs);
  try {
    const { statusCode, body: rb } = await request(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: c.signal });
    const raw = await rb.text();
    if (statusCode >= 400) { const e = new Error(`Gemini ${statusCode}: ${raw.slice(0,300)}`); e.status = statusCode; throw e; }
    const j = JSON.parse(raw);
    return { texto: j?.candidates?.[0]?.content?.parts?.map(p => p.text).join('\n') ?? '', uso: j?.usageMetadata || null };
  } finally { clearTimeout(to); }
}
