// ⚔️ Crítico — steelman contra cada proposta
import { chamar } from '../core/gateway.mjs';

const SISTEMA = `Você é o CRÍTICO STEELMAN do Grupo da Evolução da CentralDark.
Dado as propostas do Arquiteto, construa o melhor argumento CONTRÁRIO possível pra cada uma.
JSON {ataques:[{proposta, argumento_contrario, sobrevive, motivo}]}. Implacável mas justo. PT-BR.`;

export async function critico(ctx, etapasAnteriores) {
  const arq = etapasAnteriores?.find(e => e.agente === 'arquiteto')?.saida?.texto || '';
  const texto = await chamar('openai/gpt-5', [
    { role: 'system', content: SISTEMA },
    { role: 'user', content: `Tema: ${ctx.tema}\n\nPropostas:\n${arq.slice(0, 3000)}` },
  ]);
  return { texto };
}
