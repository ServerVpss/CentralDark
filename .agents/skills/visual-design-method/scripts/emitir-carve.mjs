#!/usr/bin/env node
/**
 * emitir-carve.mjs
 * ---------------------------------------------------------------------------
 * 🔍 LUPA NA MÃO · INTENÇÃO NA FRENTE — CentralDark
 *
 * RASTRO AUTOMÁTICO — grava cada movimento no formato que o moinho do Hermes
 * consome, sem depender de ninguém lembrar de escrever.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 *
 * Trabalho feito e não rastreado é trabalho perdido: o próximo agente refaz,
 * ou pior, desfaz. O `TRILHO.md` já define o formato — o CARVE de cinco
 * linhas, gravado em append em `rastro.jsonl`. Faltava a ferramenta que emite.
 *
 *   RACIOCÍNIO → CONTRATO → CÓDIGO/REGRA DETERMINÍSTICA → REFLEXO
 *
 * O rastro é a matéria-prima do destilador: agrupa curvas equivalentes, conta
 * ocorrências independentes, e o que sobrevive à contraprova cristaliza.
 *
 * USO
 *   node emitir-carve.mjs --ancora "missão · HEAD · passo" \
 *                         --curva  "o que vou fazer, verbo na frente" \
 *                         --gume   "a prova que exijo antes do resultado" \
 *                         --veredito PISO|GELO|PAREDE|QUEDA|FENDA|CONTRA|CRISTAL \
 *                         --carry  "o que o próximo passo herda" \
 *                         [--alvo caminho/do/arquivo]
 *
 *   node emitir-carve.mjs --ler        imprime o rastro em forma legível
 *   node emitir-carve.mjs --selftest   prova que grava e relê
 *
 * O `--gume` é escrito ANTES do resultado existir. Quem escolhe a prova depois
 * de ver o resultado sempre passa — é assim que nasce falso verde.
 *
 * @module emitir-carve
 * @author CentralDark · SEGREDO/CHEFE
 * @see    TRILHO.md   o protocolo CARVE, por extenso
 * ---------------------------------------------------------------------------
 *
 * NOTE: o alfabeto de vereditos é fechado. Emoji fora da tabela é ruído, e
 *       ruído é proibido no rastro — ele precisa ser parseável por regex e
 *       por gente ao mesmo tempo.
 *
 * TODO: gancho de PostToolUse para emitir CARVE sozinho a cada Write/Edit,
 *       sem chamada explícita. Owner: .claude/settings.json (hooks).
 */

import { appendFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '../../../..');
const RASTRO = resolve(RAIZ, 'rastro.jsonl');

//#region ALFABETO — fechado, doze estados

/**
 * Vereditos válidos. Cada um é estado de máquina, não decoração.
 * @see TRILHO.md · Alfabeto
 */
export const ALFABETO = {
  PISO:    { emoji: '🟢', significa: 'provado — pode virar chão' },
  GELO:    { emoji: '🟡', significa: 'passou com ressalva; anda devagar, não cristaliza' },
  PAREDE:  { emoji: '🔴', significa: 'proibido ou exige autorização; para aqui' },
  QUEDA:   { emoji: '🩸', significa: 'falhou — entra reancoragem' },
  FENDA:   { emoji: '❔', significa: 'UNKNOWN declarado; vira alvo, não desculpa' },
  CONTRA:  { emoji: '⚔️', significa: 'duas fontes discordam; autoridade não resolvida' },
  CRISTAL: { emoji: '🧊', significa: 'passou os quatro portões; virou reflexo' },
  FREIO:   { emoji: '🛑', significa: 'parada com relatório' },
};

//#endregion

//#region EMISSÃO

/**
 * Monta um CARVE válido. Recusa veredito fora do alfabeto e carry longo demais
 * — o teto de 40 palavras existe para que o próximo passo carregue a lâmina,
 * não a conversa inteira.
 *
 * @param   {{ancora:string, curva:string, gume:string, veredito:string,
 *            carry:string, alvo?:string, sha256?:string}} campos
 * @returns {object} o CARVE pronto para gravação
 * @throws  {Error} veredito inválido ou carry acima de 40 palavras
 */
export function montarCarve(campos) {
  const { ancora, curva, gume, veredito, carry, alvo, sha256 } = campos;

  if (!ALFABETO[veredito]) {
    throw new Error(`veredito fora do alfabeto: ${veredito} — válidos: ${Object.keys(ALFABETO).join(', ')}`);
  }
  const palavras = String(carry || '').trim().split(/\s+/).filter(Boolean).length;
  if (palavras > 40) {
    throw new Error(`carry com ${palavras} palavras; teto é 40 — o próximo passo carrega a lâmina, não a conversa`);
  }

  return {
    ts: new Date().toISOString(),
    ancora, curva, gume,
    veredito,
    emoji: ALFABETO[veredito].emoji,
    carry,
    ...(alvo && { alvo }),
    ...(sha256 && { sha256 }),
  };
}

/**
 * Grava um CARVE em append no rastro. Append-only por desenho: rastro que se
 * reescreve não é rastro, é narrativa.
 *
 * @param   {object} carve
 * @returns {Promise<string>} caminho do rastro
 */
export async function gravarCarve(carve) {
  await appendFile(RASTRO, JSON.stringify(carve) + '\n', 'utf8');
  return RASTRO;
}

/**
 * Calcula o sha256 de um arquivo, para amarrar o CARVE ao estado exato.
 *
 * @param   {string} caminhoAbsoluto
 * @returns {Promise<string|null>} hash, ou null se ilegível
 */
export async function shaDoAlvo(caminhoAbsoluto) {
  const bytes = await readFile(caminhoAbsoluto).catch(() => null);
  return bytes ? createHash('sha256').update(bytes).digest('hex') : null;
}

//#endregion

//#region LEITURA

/**
 * Lê o rastro e devolve as entradas em forma legível por gente.
 *
 * @returns {Promise<object[]>}
 */
export async function lerRastro() {
  const texto = await readFile(RASTRO, 'utf8').catch(() => '');
  return texto.split('\n').filter(Boolean).map((l) => {
    try { return JSON.parse(l); } catch { return { erro: 'linha ilegível', bruto: l.slice(0, 80) }; }
  });
}

//#endregion

//#region MAIN

const args = process.argv.slice(2);
const pega = (nome) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args[i + 1] : undefined;
};

if (args.includes('--selftest')) {
  const c = montarCarve({
    ancora: 'selftest · sem HEAD · passo 0',
    curva: 'provar que o emissor monta, valida e recusa',
    gume: 'só aceito PASS se veredito inválido e carry longo forem recusados',
    veredito: 'PISO',
    carry: 'emissor validado',
  });
  let recusouVeredito = false, recusouCarry = false;
  try { montarCarve({ ...c, veredito: 'AMARELO' }); } catch { recusouVeredito = true; }
  try { montarCarve({ ...c, carry: 'palavra '.repeat(41) }); } catch { recusouCarry = true; }

  const r = {
    selftest: [
      { nome: 'MONTA', ok: Boolean(c.ts && c.emoji === '🟢') },
      { nome: 'RECUSA_VEREDITO_FORA_DO_ALFABETO', ok: recusouVeredito },
      { nome: 'RECUSA_CARRY_ACIMA_DE_40', ok: recusouCarry },
    ],
  };
  r.veredito = r.selftest.every((t) => t.ok) ? 'PASS' : 'FAIL';
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.veredito === 'PASS' ? 0 : 1);
}

if (args.includes('--ler')) {
  const linhas = await lerRastro();
  for (const c of linhas) {
    if (c.erro) { console.log(`  ??  ${c.erro}`); continue; }
    console.log(`${c.emoji} ${c.veredito.padEnd(8)} ${c.ts.slice(0, 16)}  ${c.curva}`);
    console.log(`   gume  ${c.gume}`);
    console.log(`   carry ${c.carry}${c.alvo ? `\n   alvo  ${c.alvo}` : ''}\n`);
  }
  console.log(`${linhas.length} carve(s) · ${RASTRO}`);
  process.exit(0);
}

const alvo = pega('alvo');
const carve = montarCarve({
  ancora: pega('ancora') ?? 'sem âncora',
  curva: pega('curva') ?? 'sem curva',
  gume: pega('gume') ?? 'sem gume',
  veredito: pega('veredito') ?? 'FENDA',
  carry: pega('carry') ?? '',
  alvo,
  sha256: alvo ? await shaDoAlvo(resolve(RAIZ, alvo)) : undefined,
});

await gravarCarve(carve);
console.log(JSON.stringify({ gravado: true, rastro: RASTRO, carve }, null, 2));

//#endregion
