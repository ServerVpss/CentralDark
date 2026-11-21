// 🎨 Produto — valida pelo lado do usuário/UX
import { chamar } from '../core/gateway.mjs';

const SISTEMA = `Você é o PRODUTO do Grupo da Evolução da CentralDark.
Das propostas que sobreviveram ao Crítico, avalie qual o usuário (o Pivete) vai sentir mais valor.
Considere fricção, tempo economizado, clareza. JSON {ranking:[{proposta, valor_usuario, motivo}]}. PT-BR.`;

export async function produto(ctx, etapasAnteriores) {
  const cr = etapasAnteriores?.find(e => e.agente === 'critico')?.saida?.texto || '';
  const arq = etapasAnteriores?.find(e => e.agente === 'arquiteto')?.saida?.texto || '';
  const texto = await chamar('openai/gpt-5', [
    { role: 'system', content: SISTEMA },
    { role: 'user', content: `Tema: ${ctx.tema}\n\nPropostas:\n${arq.slice(0, 2000)}\n\nAtaques:\n${cr.slice(0, 2000)}` },
  ]);
  return { texto };
}
