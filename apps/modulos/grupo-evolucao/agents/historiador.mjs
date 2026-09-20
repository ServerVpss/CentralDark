// 📚 Historiador — cruza com CONSCIENCIA + veredito final
import { chamar } from '../core/gateway.mjs';
import fs from 'node:fs/promises';

const SISTEMA = `Você é o HISTORIADOR do Grupo da Evolução da CentralDark.
1) Ver se a proposta já foi tentada (histórico anexo).
2) Emitir VEREDITO FINAL: aprovar | aprovar-com-ressalvas | reprovar.
JSON {ja_tentada, referencias, veredito, resumo_1_linha, proximo_passo}. PT-BR.`;

async function lerHistorico() {
  const paths = [
    '/root/CentralDark/docs/CONSCIENCIA/08-HISTORICO-DECISOES.md',
    '/root/CentralDark/docs/CONSCIENCIA/APRENDIZADOS.md',
  ];
  let out = '';
  for (const p of paths) {
    try { const t = await fs.readFile(p, 'utf8'); out += `\n--- ${p} ---\n${t.slice(0, 3000)}\n`; } catch {}
  }
  return out || '(sem histórico)';
}

export async function historiador(ctx, etapasAnteriores) {
  const historico = await lerHistorico();
  const pr = etapasAnteriores?.find(e => e.agente === 'produto')?.saida?.texto || '';
  const raw = await chamar('google/gemini-3-flash-preview', [
    { role: 'system', content: SISTEMA },
    { role: 'user', content: `Tema: ${ctx.tema}\n\nRanking:\n${pr.slice(0, 2500)}\n\nHistórico:\n${historico.slice(0, 4000)}` },
  ]);
  let veredito = raw;
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      const parsed = JSON.parse(m[0]);
      veredito = `${parsed.veredito || '?'} — ${parsed.resumo_1_linha || ''}`;
    }
  } catch {}
  return { texto: raw, veredito };
}
