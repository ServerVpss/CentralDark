// 🔬 Pesquisador — tendências, libs, padrões modernos
import { chamar } from '../core/gateway.mjs';

const SISTEMA = `Você é o PESQUISADOR do Grupo da Evolução da CentralDark.
Sobre o tema dado, levante 3-5 abordagens/libs/padrões modernos relevantes.
Formato JSON: {tendencias:[{nome, resumo, aplicavel_aqui}]}. PT-BR, direto.`;

export async function pesquisador(ctx) {
  const texto = await chamar('google/gemini-3-flash-preview', [
    { role: 'system', content: SISTEMA },
    { role: 'user', content: `Tema: ${ctx.tema}\nContexto: ${JSON.stringify(ctx.ctx || {}).slice(0, 1500)}` },
  ]);
  return { texto };
}
