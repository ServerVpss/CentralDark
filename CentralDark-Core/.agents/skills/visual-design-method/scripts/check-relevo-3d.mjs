#!/usr/bin/env node
/**
 * check-relevo-3d.mjs
 * ---------------------------------------------------------------------------
 * Gate determinístico do RELEVO 3D TÁTIL do tema `forge`.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 * O relevo da forja se perdeu sem nada falhar. `transform-style:preserve-3d`
 * continuava declarado, `perspective` continuava lá, o tilt continuava
 * funcionando — mas nenhum filho tinha `translateZ`, então nada levantava.
 * Prosa não pega isso. Check pega.
 *
 *   prose_only_rule: NOT_LEARNED
 *   -> BIND_RULE_TO_ENGINE_OR_GATE + POSITIVE_TEST + NEGATIVE_TEST
 *
 * USO
 *   node check-relevo-3d.mjs                 valida os assets registrados
 *   node check-relevo-3d.mjs --selftest      roda os testes positivo/negativo
 *   node check-relevo-3d.mjs <arquivo.html>  valida um asset avulso
 *
 * SAÍDA: JSON. exit 0 = PASS, exit 1 = FAIL, exit 2 = NAO_APLICAVEL.
 * Sem cor, sem emoji, sem amarelo — public_status_contract proíbe amarelo
 * como aprovação pública.
 *
 * @module check-relevo-3d
 * @author CentralDark · SEGREDO/CHEFE
 * @see RELEVO-3D-TATIL.md   a técnica e as três invariantes
 * @see TOKENS-FORGE.json    os valores canônicos
 * ---------------------------------------------------------------------------
 *
 * TODO: gate irmão para `Merge-Policy` quase-certa — `SQUASH_IF_CLEAN` passa
 *       por `AUTO_SQUASH_IF_CLEAN` no olho humano e falha na igualdade `===`.
 *       Owner: scripts/trigger-fabric/verify_repo_contract.py (PR #1149).
 *
 * TODO: gate irmão para a etiqueta inerte — `permito-segredo` sem a coroa
 *       nunca é consultada por authorizationFor(). Mesmo owner acima.
 *
 * FIXME: a invariante SOMBRA_VIVA detecta a variável do ponteiro por regex.
 *        Se alguém driblar usando outro nome que não case `--*p[xy]`, o check
 *        devolve FAIL sendo o código correto. Falso negativo, não falso verde —
 *        erra para o lado seguro, mas erra.
 *
 * NOTE: quando o tilt vem de vanilla-tilt.js (data-tilt), a lib escreve o
 *       transform inline na carta e o CSS não declara mais rotateY. A
 *       invariante SOMBRA_VIVA continua valendo: a sombra é do CSS.
 */

import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '../../../..');

/** Assets que carregam o relevo tátil e por isso respondem a este gate. */
const REGISTRADOS = [
  '.agents/skills/visual-design-method/assets/forja-de-cartas.html',
];

/** Onde o sha256 do asset da forja está documentado. Todos têm que concordar. */
const SHA_DECLARADO_EM = [
  '.agents/skills/visual-design-method/SKILL.md',
  'docs/CONSCIENCIA/ARQUITETURA/DESIGN-SISTEMA.md',
];

//#region AS TRÊS INVARIANTES DO RELEVO

/**
 * @typedef  {Object} Veredito
 * @property {string}  id      nome da invariante
 * @property {'PASS'|'FAIL'|'NA'} estado
 * @property {boolean|null} ok  true/false, ou null quando NA
 * @property {string}  motivo  frase legível explicando o veredito
 */

/**
 * INVARIANTE 1 — PROFUNDIDADE REAL
 *
 * `preserve-3d` cria um espaço 3D para os **filhos**. Se nenhum filho se
 * eleva, todos ficam coplanares: o cartão gira como folha de papel.
 * Foi exatamente esta a regressão silenciosa da forja.
 *
 * @param   {string} css  conteúdo do asset (HTML ou CSS) como texto
 * @returns {Veredito & {camadas_elevadas?:number, profundidade_max?:number}}
 */
function invarianteProfundidade(css) {
  const declaraPreserve = /transform-style\s*:\s*preserve-3d/i.test(css);
  if (!declaraPreserve) {
    return { id: 'PROFUNDIDADE', estado: 'NA', ok: null, motivo: 'asset não declara preserve-3d' };
  }
  const zs = [...css.matchAll(/translateZ\(\s*(-?[\d.]+)\s*([a-z%]*)\s*\)/gi)]
    .map((m) => ({ valor: parseFloat(m[1]), unidade: m[2] }))
    .filter((z) => Number.isFinite(z.valor) && z.valor !== 0);

  return {
    id: 'PROFUNDIDADE',
    estado: zs.length > 0 ? 'PASS' : 'FAIL',
    ok: zs.length > 0,
    camadas_elevadas: zs.length,
    profundidade_max: zs.length ? Math.max(...zs.map((z) => Math.abs(z.valor))) : 0,
    motivo: zs.length > 0
      ? `${zs.length} camada(s) com translateZ não-zero`
      : 'preserve-3d declarado e NENHUM translateZ não-zero: o cartão inclina mas não levanta',
  };
}

/**
 * INVARIANTE 2 — SOMBRA VIVA
 *
 * Sombra estática sob objeto que gira é a pista mais forte de que a cena é
 * falsa: o cérebro sabe que a luz não se move junto com o objeto.
 * A sombra tem que contra-deslocar — objeto inclina para um lado, sombra
 * foge para o oposto.
 *
 * @param   {string} css  conteúdo do asset como texto
 * @returns {Veredito & {box_shadows?:number}}
 */
function invarianteSombraViva(css) {
  const temTiltPonteiro = /rotate[XY]\(/i.test(css) && /pointermove|mousemove/i.test(css);
  if (!temTiltPonteiro) {
    return { id: 'SOMBRA_VIVA', estado: 'NA', ok: null, motivo: 'asset não inclina pelo ponteiro' };
  }
  const sombras = [...css.matchAll(/box-shadow\s*:([^;]+);/gi)].map((m) => m[1]);
  const viva = sombras.some((s) => /var\(\s*--[a-z0-9-]*p[xy]/i.test(s) || /calc\([^)]*--[a-z0-9-]*p[xy]/i.test(s));

  return {
    id: 'SOMBRA_VIVA',
    estado: viva ? 'PASS' : 'FAIL',
    ok: viva,
    box_shadows: sombras.length,
    motivo: viva
      ? 'box-shadow acompanha a variável do ponteiro'
      : 'cartão inclina pelo ponteiro mas toda box-shadow é estática',
  };
}

/**
 * INVARIANTE 3 — MOVIMENTO REDUZIDO
 *
 * Relevo é enfeite. Quem marcou "reduzir movimento" no sistema operacional
 * fez isso por enjoo, vertigem ou epilepsia fotossensível — não por gosto.
 * Ignorar essa marca é perder o visitante na primeira tela.
 *
 * @param   {string} css  conteúdo do asset como texto
 * @returns {Veredito}
 */
function invarianteMovimentoReduzido(css) {
  const temMotion = /rotate[XY]\(|translateZ\(/i.test(css);
  if (!temMotion) {
    return { id: 'MOVIMENTO_REDUZIDO', estado: 'NA', ok: null, motivo: 'asset sem movimento 3D' };
  }
  const ok = /prefers-reduced-motion/i.test(css);
  return {
    id: 'MOVIMENTO_REDUZIDO',
    estado: ok ? 'PASS' : 'FAIL',
    ok,
    motivo: ok ? 'prefers-reduced-motion respeitado' : 'movimento 3D sem guarda de prefers-reduced-motion',
  };
}

/** Ordem de avaliação. Acrescentar aqui é o jeito de estender o gate. */
const INVARIANTES = [invarianteProfundidade, invarianteSombraViva, invarianteMovimentoReduzido];

//#endregion

//#region AUDITORIA E VEREDITO

/**
 * UNKNOWN_IS_NOT_PASS.
 *
 * Um asset que não declara 3D nenhum NÃO passa neste gate — ele simplesmente
 * não responde a ele. Colapsar `NA` em `PASS` foi um falso-verde real,
 * observado em 2026-08-24: um arquivo sem uma linha de 3D recebeu PASS nas
 * três invariantes e por um instante passou por "a forja com relevo".
 *
 *   NA  -> NAO_APLICAVEL (exit 2)   nunca PASS
 *   NA  != PASS
 *
 * @param   {string} nome  identificador do asset (caminho ou rótulo de teste)
 * @param   {string} css   conteúdo do asset como texto
 * @returns {{asset:string, veredito:'PASS'|'FAIL'|'NAO_APLICAVEL',
 *            resumo:{pass:number,fail:number,na:number},
 *            nota?:string, checks:Veredito[]}}
 */
function auditar(nome, css) {
  const checks = INVARIANTES.map((f) => f(css));
  const houveFalha = checks.some((c) => c.estado === 'FAIL');
  const todosNA = checks.every((c) => c.estado === 'NA');

  let veredito;
  if (houveFalha) veredito = 'FAIL';
  else if (todosNA) veredito = 'NAO_APLICAVEL';
  else veredito = 'PASS';

  return {
    asset: nome,
    veredito,
    resumo: {
      pass: checks.filter((c) => c.estado === 'PASS').length,
      fail: checks.filter((c) => c.estado === 'FAIL').length,
      na: checks.filter((c) => c.estado === 'NA').length,
    },
    ...(todosNA && { nota: 'asset não carrega relevo tátil — não é PASS, é fora de escopo' }),
    checks,
  };
}

//#endregion

//#region PROVENIÊNCIA — o sha tem que bater onde está documentado

/**
 * O sha256 da forja está escrito em três documentos e, até este gate existir,
 * não era conferido por ninguém. Se o asset mudasse, os três ficavam
 * silenciosamente errados e nada falhava. Foi assim que o relevo pôde sumir
 * sem alarme.
 *
 * @param   {string} caminhoRel  caminho do asset, relativo à raiz do repo
 * @returns {Promise<{id:string, asset:string, sha256:string, ok:boolean,
 *                    divergentes:{doc:string,problema:string}[], motivo:string}>}
 */
async function auditarProveniencia(caminhoRel) {
  const bytes = await readFile(resolve(RAIZ, caminhoRel));
  const sha = createHash('sha256').update(bytes).digest('hex');
  const divergentes = [];

  for (const doc of SHA_DECLARADO_EM) {
    let texto;
    try {
      texto = await readFile(resolve(RAIZ, doc), 'utf8');
    } catch {
      divergentes.push({ doc, problema: 'ILEGIVEL' });
      continue;
    }
    if (!texto.includes(caminhoRel.split('/').pop())) continue;
    if (!texto.includes(sha)) divergentes.push({ doc, problema: 'SHA_NAO_CONFERE' });
  }

  return {
    id: 'PROVENIENCIA',
    asset: caminhoRel,
    sha256: sha,
    ok: divergentes.length === 0,
    divergentes,
    motivo: divergentes.length === 0
      ? `sha256 confere nos ${SHA_DECLARADO_EM.length} documentos que o declaram`
      : 'o asset mudou e a documentação não acompanhou',
  };
}

//#endregion

//#region SELFTEST — positivo, negativo e vacuidade

const CASO_BOM = `
  .suporte{perspective:1500px;}
  .carta{transform-style:preserve-3d;transform:rotateY(calc(var(--px)*14deg));
    box-shadow:calc(var(--px) * -26px) 30px 58px -18px rgba(0,0,0,.92);}
  .interior{transform:translateZ(16px);}
  .emblema{transform:translateZ(34px);}
  @media (prefers-reduced-motion:reduce){.carta{transform:none;}}
  el.addEventListener('pointermove', mover);
`;

/** Regressão real observada: preserve-3d declarado, zero translateZ, sombra estática. */
const CASO_RUIM = `
  .suporte{perspective:1400px;}
  .carta{transform-style:preserve-3d;transform:rotateY(13deg);
    box-shadow:0 34px 70px -20px rgba(0,0,0,.9);}
  .interior{position:relative;}
  el.addEventListener('pointermove', mover);
`;

/**
 * Caso que quebrou o gate na primeira versão: um documento sem 3D nenhum.
 * Recebia PASS nas três invariantes por vacuidade.
 */
const CASO_SEM_3D = `
  .cartao{ border:1px solid #C0902B; border-radius:8px; }
  .cartao:hover{ background:#1E1A11; }
`;

function selftest() {
  const bom = auditar('CASO_BOM', CASO_BOM);
  const ruim = auditar('CASO_RUIM', CASO_RUIM);
  const sem3d = auditar('CASO_SEM_3D', CASO_SEM_3D);

  const positivo = { nome: 'POSITIVE_TEST', esperado: 'PASS', obtido: bom.veredito, ok: bom.veredito === 'PASS' };
  const negativo = { nome: 'NEGATIVE_TEST', esperado: 'FAIL', obtido: ruim.veredito, ok: ruim.veredito === 'FAIL' };

  const falhouPorProfundidade = ruim.checks.find((c) => c.id === 'PROFUNDIDADE' && c.estado === 'FAIL');
  negativo.pega_a_regressao_certa = Boolean(falhouPorProfundidade);
  negativo.ok = negativo.ok && negativo.pega_a_regressao_certa;

  /* Regressão do próprio gate — NA jamais pode virar PASS. */
  const vacuo = {
    nome: 'VACUITY_TEST',
    esperado: 'NAO_APLICAVEL',
    obtido: sem3d.veredito,
    ok: sem3d.veredito === 'NAO_APLICAVEL',
    guarda: 'UNKNOWN_IS_NOT_PASS',
  };

  const testes = [positivo, negativo, vacuo];
  return { selftest: testes, veredito: testes.every((t) => t.ok) ? 'PASS' : 'FAIL' };
}

//#endregion

//#region MAIN

const arg = process.argv[2];

if (arg === '--selftest') {
  const r = selftest();
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.veredito === 'PASS' ? 0 : 1);
}

const alvos = arg ? [relative(RAIZ, resolve(process.cwd(), arg)).split('\\').join('/')] : REGISTRADOS;
const relatorio = { gate: 'RELEVO_3D_TATIL', raiz: RAIZ, assets: [], proveniencia: [] };

for (const alvo of alvos) {
  let css;
  try {
    css = await readFile(resolve(RAIZ, alvo), 'utf8');
  } catch (err) {
    relatorio.assets.push({ asset: alvo, veredito: 'FAIL', erro: `ILEGIVEL: ${err.message}` });
    continue;
  }
  relatorio.assets.push(auditar(alvo, css));
  if (REGISTRADOS.includes(alvo)) relatorio.proveniencia.push(await auditarProveniencia(alvo));
}

const falhas = [
  ...relatorio.assets.filter((a) => a.veredito === 'FAIL'),
  ...relatorio.proveniencia.filter((p) => !p.ok),
];
const foraDeEscopo = relatorio.assets.filter((a) => a.veredito === 'NAO_APLICAVEL');

relatorio.falhas = falhas.length;
relatorio.fora_de_escopo = foraDeEscopo.length;

/* exit 0 = PASS · 1 = FAIL · 2 = NAO_APLICAVEL. NA nunca é 0. */
if (falhas.length) relatorio.veredito = 'FAIL';
else if (foraDeEscopo.length) relatorio.veredito = 'NAO_APLICAVEL';
else relatorio.veredito = 'PASS';

console.log(JSON.stringify(relatorio, null, 2));
process.exit(relatorio.veredito === 'PASS' ? 0 : relatorio.veredito === 'FAIL' ? 1 : 2);

//#endregion
