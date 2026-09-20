// Orquestrador do Grupo da Evolução — roda debate em cascata
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { notificar } from './notificador.mjs';
import { pesquisador } from '../agents/pesquisador.mjs';
import { arquiteto } from '../agents/arquiteto.mjs';
import { critico } from '../agents/critico.mjs';
import { produto } from '../agents/produto.mjs';
import { historiador } from '../agents/historiador.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(__dirname, '..');
const LOGS = path.join(RAIZ, 'logs', 'vereditos');

async function rodarDebate(missao) {
  const inicio = Date.now();
  const rastro = { missao, etapas: [], veredito: null };
  console.log(`[grupo-evolucao] 🎯 tema: ${missao.tema}`);

  const contexto = { tema: missao.tema, origem: missao.origem, ctx: missao.contexto };
  rastro.etapas.push({ agente: 'pesquisador', saida: await pesquisador(contexto) });
  rastro.etapas.push({ agente: 'arquiteto', saida: await arquiteto(contexto, rastro.etapas) });
  rastro.etapas.push({ agente: 'critico', saida: await critico(contexto, rastro.etapas) });
  rastro.etapas.push({ agente: 'produto', saida: await produto(contexto, rastro.etapas) });
  rastro.etapas.push({ agente: 'historiador', saida: await historiador(contexto, rastro.etapas) });

  const ultima = rastro.etapas[rastro.etapas.length - 1];
  rastro.veredito = {
    resumo: ultima.saida?.veredito || String(ultima.saida?.texto || '').slice(0, 500) || 'sem veredito',
    duracao_ms: Date.now() - inicio,
    concluido_em: new Date().toISOString(),
  };

  await fs.mkdir(LOGS, { recursive: true });
  const arquivo = path.join(LOGS, `${new Date().toISOString().slice(0, 10)}-${missao.id}.json`);
  await fs.writeFile(arquivo, JSON.stringify(rastro, null, 2));

  await notificar({
    modulo: 'GRUPO EVOLUCAO',
    status: '✅',
    acao: `Debate concluido: ${missao.tema}`,
    prova: path.relative('/root/CentralDark', arquivo),
    proxima: String(rastro.veredito.resumo).slice(0, 80),
  });
  console.log(`[grupo-evolucao] ✅ veredito salvo em ${arquivo}`);
  return rastro;
}

const arg = process.argv[2];
if (arg) {
  const missao = JSON.parse(await fs.readFile(arg, 'utf8'));
  rodarDebate(missao).catch(async (e) => {
    console.error('[grupo-evolucao] ❌', e);
    try {
      await notificar({
        modulo: 'GRUPO EVOLUCAO',
        status: '❌',
        acao: `Debate falhou: ${arg}`,
        prova: String(e?.message || e).slice(0, 200),
        proxima: 'investigar logs PM2',
      });
    } catch {}
    process.exit(1);
  });
}

export { rodarDebate };
