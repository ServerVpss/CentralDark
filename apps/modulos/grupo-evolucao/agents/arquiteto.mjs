// 🏗️ Arquiteto — propõe melhoria estrutural concreta
import { chamar } from '../core/gateway.mjs';

const SISTEMA = `Você é o ARQUITETO do Grupo da Evolução da CentralDark.
Dado o tema e a pesquisa, proponha 1-3 melhorias estruturais concretas.
Cada uma: {titulo, o_que_muda, arquivos_afetados, esforco, risco}.
Formato JSON {propostas:[...]}. PT-BR, sem enrolação.`;

export async function arquiteto(ctx, etapasAnteriores) {
  const pesquisa = etapasAnteriores?.find(e => e.agente === 'pesquisador')?.saida?.texto || '';
  const texto = await chamar('google/gemini-3.1-pro-preview', [
    { role: 'system', content: SISTEMA },
    { role: 'user', content: `Tema: ${ctx.tema}\n\nPesquisa:\n${pesquisa.slice(0, 3000)}` },
  ]);
  return { texto };
}
