#!/usr/bin/env node
/**
 * check-documentacao.mjs
 * ---------------------------------------------------------------------------
 * 🔍 LUPA NA MÃO · INTENÇÃO NA FRENTE — CentralDark
 *
 * GATE DA DOCUMENTAÇÃO OBRIGATÓRIA.
 *
 * Lei da Casa (SEGREDO/CHEFE, 2026-08-25):
 *
 *   SEM DOCUMENTAÇÃO A CASA NÃO ANDA.
 *
 * Vale para qualquer linguagem, qualquer arquivo, qualquer motor. Um arquivo
 * de código sem documentação é entregue **vazio para o dono** — ele recebe algo
 * que só funciona enquanto quem escreveu estiver por perto. Isso é dependência
 * disfarçada de entrega.
 *
 * POR QUE ESTE ARQUIVO EXISTE, E NÃO SÓ UM DOCUMENTO DIZENDO A REGRA
 *
 *   prose_only_rule: NOT_LEARNED
 *   -> BIND_RULE_TO_ENGINE_OR_GATE + POSITIVE_TEST + NEGATIVE_TEST
 *
 * Regra escrita em markdown é intenção. Regra que reprova build é lei.
 *
 * USO
 *   node check-documentacao.mjs                  varre os caminhos registrados
 *   node check-documentacao.mjs --selftest       prova que o gate distingue
 *   node check-documentacao.mjs <arquivo|pasta>  audita um alvo avulso
 *   node check-documentacao.mjs --arvore         imprime a árvore documentada
 *
 * SAÍDA: JSON. exit 0 = PASS · 1 = FAIL · 2 = NAO_APLICAVEL.
 * Sem amarelo — public_status_contract proíbe amarelo como aprovação pública.
 *
 * @module check-documentacao
 * @author CentralDark · SEGREDO/CHEFE
 * @see    DOCUMENTACAO-OBRIGATORIA.md   a lei, por extenso
 * @see    ARVORE-DO-PROJETO.md          a árvore ponta a ponta, arquivo único
 * ---------------------------------------------------------------------------
 *
 * NOTE: este gate mede PRESENÇA e ANCORAGEM de documentação, não qualidade da
 *       prosa. Ele garante que existe cabeçalho, que funções exportadas têm
 *       contrato e que o arquivo está na árvore. Se o texto é bom, quem julga
 *       é gente lendo — REALITY_IS_JUDGE vale aqui também.
 *
 * TODO: estender para .py (docstring """ """) e .sh (bloco # no topo) quando
 *       houver arquivo desses sob o escopo deste gate.
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve, relative, extname, basename, join } from 'node:path';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '../../../..');

//#region CONTRATO — o que a Casa exige de cada arquivo

/**
 * Extensões que respondem a este gate e como cada uma declara documentação.
 * Acrescentar aqui é o jeito de estender a lei para outra linguagem.
 */
const LINGUAGENS = {
  '.mjs':  { nome: 'JavaScript',  bloco: /\/\*\*[\s\S]*?\*\//,      linha: /^\s*\/\// },
  '.js':   { nome: 'JavaScript',  bloco: /\/\*\*[\s\S]*?\*\//,      linha: /^\s*\/\// },
  '.ts':   { nome: 'TypeScript',  bloco: /\/\*\*[\s\S]*?\*\//,      linha: /^\s*\/\// },
  '.tsx':  { nome: 'TypeScript',  bloco: /\/\*\*[\s\S]*?\*\//,      linha: /^\s*\/\// },
  '.css':  { nome: 'CSS',         bloco: /\/\*[\s\S]*?\*\//,        linha: null },
  '.scss': { nome: 'SCSS',        bloco: /\/\*[\s\S]*?\*\//,        linha: /^\s*\/\// },
  '.html': { nome: 'HTML',        bloco: /<!--[\s\S]*?-->|\/\*[\s\S]*?\*\//, linha: null },
  '.json': { nome: 'JSON',        bloco: null,                      linha: null },
  '.md':   { nome: 'Markdown',    bloco: null,                      linha: null },
};

/** Tamanho abaixo do qual um arquivo é pequeno demais para exigir cabeçalho. */
const BYTES_MINIMOS = 400;

/**
 * Escopos auditados. Cada um precisa do seu `docs/DOCUMENTACAO.md`.
 *
 * Ligado no repositório inteiro por decisão do CHEFE em 2026-08-25.
 * Vai reprovar no primeiro dia — isso é o passivo aparecendo, não o gate
 * errado. Pagar por área é o caminho menos doloroso.
 */
const REGISTRADOS = [
  '.agents',
  'apps',
  'scripts',
  'src',
  'supabase',
  'infra',
];

/** Pastas que nunca entram na varredura. */
const IGNORAR = new Set(['node_modules', '.git', 'dist', 'build', '.cache', 'coverage']);

//#endregion

//#region AS QUATRO EXIGÊNCIAS

/**
 * @typedef  {Object} Exigencia
 * @property {string} id
 * @property {'PASS'|'FAIL'|'NA'} estado
 * @property {string} motivo
 */

/**
 * D1 — CABEÇALHO
 *
 * Todo arquivo de código precisa abrir dizendo o que é e para que serve.
 * Quem abre o arquivo daqui a seis meses tem que entender o assunto sem
 * ler uma linha de lógica.
 *
 * @param   {string} texto  conteúdo do arquivo
 * @param   {object} ling   entrada de LINGUAGENS
 * @returns {Exigencia}
 */
function exigenciaCabecalho(texto, ling) {
  if (!ling.bloco) return { id: 'CABECALHO', estado: 'NA', motivo: 'formato sem sintaxe de comentário' };
  const topo = texto.slice(0, 2600);
  const achou = ling.bloco.exec(topo);
  if (!achou) return { id: 'CABECALHO', estado: 'FAIL', motivo: 'arquivo abre sem bloco de documentação' };
  const corpo = achou[0].replace(/[*/<!-]/g, ' ').trim();
  if (corpo.length < 60) {
    return { id: 'CABECALHO', estado: 'FAIL', motivo: `cabeçalho existe mas é vazio demais (${corpo.length} caracteres úteis)` };
  }
  return { id: 'CABECALHO', estado: 'PASS', motivo: `cabeçalho com ${corpo.length} caracteres úteis` };
}

/**
 * D2 — CONTRATO DAS FUNÇÕES
 *
 * Função exportada é porta pública: alguém vai chamar sem ler o corpo.
 * Precisa dizer o que entra e o que sai.
 *
 * @param   {string} texto
 * @param   {object} ling
 * @returns {Exigencia & {exportadas?:number, documentadas?:number}}
 */
function exigenciaContrato(texto, ling) {
  if (!/JavaScript|TypeScript/.test(ling.nome)) {
    return { id: 'CONTRATO', estado: 'NA', motivo: 'exigência vale para JS/TS' };
  }

  /* Código real, sem literais de texto.
     Sem isto o detector lê uma fixture de teste — `export function subtrair`
     escrita dentro de crases — como se fosse função de verdade e reprova o
     arquivo por uma função que não existe. Falso positivo observado em
     2026-08-25, neste próprio arquivo.
     Substitui cada literal por espaços do mesmo tamanho para não deslocar os
     índices usados na busca do JSDoc logo abaixo. */
  const brancos = (m) => ' '.repeat(m.length);
  const codigo = texto
    .replace(/`(?:\\[\s\S]|\$\{[^}]*\}|[^\\`])*`/g, brancos)
    .replace(/'(?:\\[\s\S]|[^\\'\n])*'/g, brancos)
    .replace(/"(?:\\[\s\S]|[^\\"\n])*"/g, brancos);

  const exportadas = [...codigo.matchAll(/^export\s+(?:async\s+)?function\s+(\w+)/gm)].map(m => m[1]);
  if (!exportadas.length) return { id: 'CONTRATO', estado: 'NA', motivo: 'nenhuma função exportada' };

  const semDoc = exportadas.filter(nome => {
    const i = codigo.search(new RegExp(`^export\\s+(?:async\\s+)?function\\s+${nome}\\b`, 'm'));
    return !/\*\/\s*$/.test(texto.slice(Math.max(0, i - 400), i).trimEnd());
  });

  return {
    id: 'CONTRATO',
    estado: semDoc.length ? 'FAIL' : 'PASS',
    exportadas: exportadas.length,
    documentadas: exportadas.length - semDoc.length,
    motivo: semDoc.length ? `sem JSDoc: ${semDoc.join(', ')}` : `${exportadas.length} função(ões) com contrato`,
  };
}

/**
 * D3 — PENDÊNCIA VISÍVEL
 *
 * Pendência que só existe na cabeça de quem escreveu é dívida escondida.
 * Arquivo grande sem nenhuma marca de pendência costuma significar que a
 * pendência existe e não foi escrita — não que não exista.
 *
 * Esta exigência avisa, não reprova: código pequeno e fechado pode
 * legitimamente não ter pendência nenhuma.
 *
 * @param   {string} texto
 * @returns {Exigencia & {tags?:number}}
 */
function exigenciaPendencia(texto) {
  const tags = (texto.match(/\b(TODO|FIXME|HACK|BUG|NOTE|XXX):/g) || []).length;
  if (texto.length < 4000) return { id: 'PENDENCIA', estado: 'NA', motivo: 'arquivo pequeno; marca não exigida' };
  return {
    id: 'PENDENCIA',
    estado: 'PASS',
    tags,
    motivo: tags ? `${tags} marca(s) de pendência declarada(s)` : 'sem marcas — confira se não há dívida escondida',
  };
}

/**
 * D4 — ANCORAGEM NA ÁRVORE
 *
 * Documentação solta some. Todo arquivo tem que estar citado na árvore única
 * do projeto, senão ele é órfão: existe no disco e não existe no mapa.
 *
 * @param   {string} caminhoRel
 * @param   {string} arvore      conteúdo de ARVORE-DO-PROJETO.md
 * @returns {Exigencia}
 */
function exigenciaAncoragem(caminhoRel, arvore) {
  if (arvore === null) return { id: 'ANCORAGEM', estado: 'NA', motivo: 'ARVORE-DO-PROJETO.md não encontrada' };
  const nome = basename(caminhoRel);
  const citado = arvore.includes(caminhoRel) || arvore.includes(nome);
  return {
    id: 'ANCORAGEM',
    estado: citado ? 'PASS' : 'FAIL',
    motivo: citado ? 'citado na árvore do projeto' : 'órfão — não aparece em ARVORE-DO-PROJETO.md',
  };
}

/**
 * D5 — SINCRONIA (documentação velha = documentação ausente)
 *
 * Esta é a exigência que separa documentação viva de documentação enterrada.
 * D1–D4 medem **presença**: existe cabeçalho, existe contrato, está no mapa.
 * Nada disso impede que o texto esteja completamente desatualizado.
 *
 *   DOCUMENTED   != IMPLEMENTED
 *   IMPLEMENTED  != DOCUMENTED
 *   CODE_AND_DOCS_MUST_RECONCILE = true
 *
 * O `DOCUMENTACAO.md` de cada escopo carrega um bloco mecânico gerado pela
 * máquina — árvore, entradas, exports públicos, comandos — e um carimbo
 * `LAST_SYNC_HEAD`. Esta exigência regenera os fatos mecânicos e compara.
 *
 * NO_FAKE_DOC_CHANGE: se só mudou implementação interna e a superfície
 * semântica continua idêntica, o veredito é PASS com `AUTO_REFRESH_METADATA`.
 * Obrigar edição textual falsa só para o CI ficar verde produz documentação
 * mentirosa — o oposto do objetivo.
 *
 * @param   {string} caminhoRel    arquivo auditado
 * @param   {string|null} doc      conteúdo do DOCUMENTACAO.md do escopo
 * @param   {string[]} superficie  fatos mecânicos medidos agora
 * @returns {Exigencia & {ausentes?:string[], head_declarado?:string}}
 */
function exigenciaSincronia(caminhoRel, doc, superficie) {
  if (doc === null) {
    return { id: 'SINCRONIA', estado: 'FAIL', motivo: 'escopo sem DOCUMENTACAO.md — NO_DOCUMENTATION = NO_PROMOTION' };
  }

  /* Aceita as três formas em uso na Casa: `=`, `:` ou alinhado com espaços.
     A primeira versão exigia `=` ou `:` e reprovava o bloco alinhado, que é
     justamente o estilo dos documentos canônicos. Bug observado em 2026-08-25. */
  const carimbo = /LAST_SYNC_HEAD\s*[=:]?\s*([0-9a-f]{7,40})/i.exec(doc);
  if (!carimbo) {
    return { id: 'SINCRONIA', estado: 'FAIL', motivo: 'DOCUMENTACAO.md sem LAST_SYNC_HEAD — impossível saber de quando é' };
  }

  /* A superfície semântica: o que um leitor precisa achar no documento.
     Nome do arquivo e cada export público. Se o código ganhou uma porta
     pública que o documento não cita, o documento está velho. */
  const ausentes = superficie.filter((item) => !doc.includes(item));

  if (ausentes.length) {
    return {
      id: 'SINCRONIA',
      estado: 'FAIL',
      ausentes,
      head_declarado: carimbo[1],
      motivo: `documentação velha: ${ausentes.length} item(ns) da superfície pública não aparecem no DOCUMENTACAO.md`,
    };
  }

  return {
    id: 'SINCRONIA',
    estado: 'PASS',
    head_declarado: carimbo[1],
    motivo: superficie.length
      ? `superfície pública reconciliada (${superficie.length} item(ns))`
      : 'AUTO_REFRESH_METADATA — nada de semântico mudou',
  };
}

/**
 * Extrai a superfície semântica de um arquivo: o que precisa estar citado
 * no documento do escopo. Implementação interna não entra — só porta pública.
 *
 * @param   {string} caminhoRel
 * @param   {string} texto
 * @returns {string[]}
 */
function superficiePublica(caminhoRel, texto) {
  const itens = [basename(caminhoRel)];
  const ling = LINGUAGENS[extname(caminhoRel)];
  if (ling && /JavaScript|TypeScript/.test(ling.nome)) {
    const brancos = (m) => ' '.repeat(m.length);
    const codigo = texto
      .replace(/`(?:\\[\s\S]|\$\{[^}]*\}|[^\\`])*`/g, brancos)
      .replace(/'(?:\\[\s\S]|[^\\'\n])*'/g, brancos)
      .replace(/"(?:\\[\s\S]|[^\\"\n])*"/g, brancos);
    for (const m of codigo.matchAll(/^export\s+(?:async\s+)?function\s+(\w+)/gm)) itens.push(m[1]);
  }
  return itens;
}

//#endregion

//#region AUDITORIA

/**
 * Audita um arquivo contra as quatro exigências.
 *
 * UNKNOWN_IS_NOT_PASS: quando todas as exigências saem `NA`, o veredito é
 * NAO_APLICAVEL — nunca PASS. Arquivo fora de escopo não "passou"; ele não
 * foi julgado.
 *
 * @param   {string} caminhoRel
 * @param   {string} texto
 * @param   {string|null} arvore
 * @returns {{arquivo:string, linguagem:string, veredito:string, exigencias:Exigencia[]}}
 */
export function auditarArquivo(caminhoRel, texto, arvore, doc = undefined) {
  const ling = LINGUAGENS[extname(caminhoRel)];
  if (!ling) {
    return { arquivo: caminhoRel, linguagem: 'desconhecida', veredito: 'NAO_APLICAVEL', exigencias: [] };
  }
  if (texto.length < BYTES_MINIMOS) {
    return { arquivo: caminhoRel, linguagem: ling.nome, veredito: 'NAO_APLICAVEL',
             nota: `menor que ${BYTES_MINIMOS} bytes`, exigencias: [] };
  }

  const exigencias = [
    exigenciaCabecalho(texto, ling),
    exigenciaContrato(texto, ling),
    exigenciaPendencia(texto),
    exigenciaAncoragem(caminhoRel, arvore),
  ];

  /* D5 só entra quando o escopo declara um DOCUMENTACAO.md.
     `undefined` = não perguntamos; `null` = perguntamos e não existe. */
  if (doc !== undefined) {
    exigencias.push(exigenciaSincronia(caminhoRel, doc, superficiePublica(caminhoRel, texto)));
  }

  const falhou = exigencias.some(e => e.estado === 'FAIL');
  const todosNA = exigencias.every(e => e.estado === 'NA');

  return {
    arquivo: caminhoRel,
    linguagem: ling.nome,
    veredito: falhou ? 'FAIL' : todosNA ? 'NAO_APLICAVEL' : 'PASS',
    exigencias,
  };
}

/**
 * Percorre uma pasta recursivamente, pulando o que IGNORAR lista.
 *
 * @param   {string} absoluto
 * @returns {Promise<string[]>} caminhos absolutos de arquivos
 */
export async function varrer(absoluto) {
  const achados = [];
  async function desce(dir) {
    let itens;
    try { itens = await readdir(dir, { withFileTypes: true }); } catch { return; }
    for (const it of itens) {
      if (IGNORAR.has(it.name)) continue;
      const p = join(dir, it.name);
      if (it.isDirectory()) await desce(p);
      else achados.push(p);
    }
  }
  const info = await stat(absoluto).catch(() => null);
  if (!info) return achados;
  if (info.isDirectory()) await desce(absoluto); else achados.push(absoluto);
  return achados;
}

//#endregion

//#region SELFTEST — positivo, negativo e vacuidade

const BOM = `/**
 * Módulo de exemplo — existe para provar que o gate reconhece documentação
 * de verdade: cabeçalho com assunto, contrato nas funções e pendência visível.
 * @module exemplo
 */
// TODO: nada pendente, marca presente para o teste
/**
 * Soma dois números.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function somar(a, b) { return a + b; }
${'\n// preenchimento para passar de 4000 bytes'.repeat(120)}
`;

const RUIM = `export function somar(a, b) { return a + b; }
export function subtrair(a, b) { return a - b; }
${'\nconst x = 1;'.repeat(400)}
`;

const VAZIO = `{"a":1}`;

/**
 * Prova que o gate distingue os três casos. Um gate que nunca reprova não
 * está protegendo nada — está decorando.
 *
 * @returns {{selftest:object[], veredito:'PASS'|'FAIL'}}
 */
export function selftest() {
  const arvore = 'exemplo.mjs · ruim.mjs · dados.json';
  const bom   = auditarArquivo('exemplo.mjs', BOM, arvore);
  const ruim  = auditarArquivo('ruim.mjs', RUIM, arvore);
  const vazio = auditarArquivo('dados.json', VAZIO, arvore);

  const t = [
    { nome: 'POSITIVE_TEST', esperado: 'PASS', obtido: bom.veredito, ok: bom.veredito === 'PASS' },
    { nome: 'NEGATIVE_TEST', esperado: 'FAIL', obtido: ruim.veredito, ok: ruim.veredito === 'FAIL' },
    { nome: 'VACUITY_TEST',  esperado: 'NAO_APLICAVEL', obtido: vazio.veredito,
      ok: vazio.veredito === 'NAO_APLICAVEL', guarda: 'UNKNOWN_IS_NOT_PASS' },
  ];

  const porCabecalho = ruim.exigencias.find(e => e.id === 'CABECALHO' && e.estado === 'FAIL');
  t[1].pega_o_motivo_certo = Boolean(porCabecalho);
  t[1].ok = t[1].ok && t[1].pega_o_motivo_certo;

  /* REGRESSÃO 2026-08-25 — o detector lia fixture de teste como código real.
     `export function subtrair` mora dentro de crases neste arquivo; era
     contado como função exportada sem JSDoc e reprovava o próprio gate. */
  const esteArquivo = auditarArquivo(
    'check-documentacao.mjs',
    `/**\n * Cabeçalho suficiente para o teste de regressão de literais.\n * O corpo abaixo contém uma fixture entre crases.\n */\nconst FIXTURE = \`export function subtrair(a,b){return a-b;}\`;\n${'\n// preenchimento\n'.repeat(300)}`,
    'check-documentacao.mjs',
  );
  const contrato = esteArquivo.exigencias.find(e => e.id === 'CONTRATO');
  t.push({
    nome: 'LITERAL_TEST',
    esperado: 'NA (nenhuma função exportada de verdade)',
    obtido: `${contrato.estado} — ${contrato.motivo}`,
    ok: contrato.estado === 'NA',
    guarda: 'fixture entre crases não é código',
  });

  /* D5 — documentação velha reprova mesmo com D1–D4 impecáveis.
     Este é o teste que separa presença de sincronia. */
  const codigoNovo = `/**
 * Cabeçalho farto e bem escrito, para provar que D1 passa.
 * O arquivo exporta uma porta pública nova.
 */
/** @param {number} a @returns {number} */
export function portaNova(a) { return a; }
// TODO: alvo declarado
${'\n// preenchimento\n'.repeat(300)}`;

  const docVelha  = 'LAST_SYNC_HEAD=abc1234\n# Doc\nCita apenas modulo.mjs e nada mais.';
  const docNova   = 'LAST_SYNC_HEAD=def5678\n# Doc\nArquivo modulo.mjs · exporta portaNova.';
  const docSemCarimbo = '# Doc\nArquivo modulo.mjs · exporta portaNova, mas sem carimbo.';

  const velha = auditarArquivo('modulo.mjs', codigoNovo, 'modulo.mjs', docVelha);
  const nova  = auditarArquivo('modulo.mjs', codigoNovo, 'modulo.mjs', docNova);
  const sem   = auditarArquivo('modulo.mjs', codigoNovo, 'modulo.mjs', docSemCarimbo);

  t.push({
    nome: 'STALE_TEST',
    esperado: 'FAIL — doc não cita a porta pública nova',
    obtido: `${velha.veredito} — ${velha.exigencias.find(e => e.id === 'SINCRONIA')?.motivo}`,
    ok: velha.veredito === 'FAIL',
    guarda: 'DOCUMENTACAO_VELHA = DOCUMENTACAO_AUSENTE',
  });
  t.push({
    nome: 'SYNC_TEST',
    esperado: 'PASS — doc reconciliada',
    obtido: nova.veredito,
    ok: nova.veredito === 'PASS',
  });
  t.push({
    nome: 'CARIMBO_TEST',
    esperado: 'FAIL — sem LAST_SYNC_HEAD não dá pra saber de quando é',
    obtido: sem.veredito,
    ok: sem.veredito === 'FAIL',
  });

  /* REGRESSÃO 2026-08-25 — o carimbo alinhado com espaços, que é o estilo dos
     documentos canônicos da Casa, era lido como ausente. */
  const docAlinhada = 'LAST_SYNC_HEAD   def5678\n# Doc\nArquivo modulo.mjs · exporta portaNova.';
  const alinhada = auditarArquivo('modulo.mjs', codigoNovo, 'modulo.mjs', docAlinhada);
  t.push({
    nome: 'CARIMBO_ALINHADO_TEST',
    esperado: 'PASS — carimbo separado por espaços vale igual',
    obtido: alinhada.veredito,
    ok: alinhada.veredito === 'PASS',
  });

  return { selftest: t, veredito: t.every(x => x.ok) ? 'PASS' : 'FAIL' };
}

//#endregion

//#region MAIN

const arg = process.argv[2];

if (arg === '--selftest') {
  const r = selftest();
  console.log(JSON.stringify(r, null, 2));
  process.exit(r.veredito === 'PASS' ? 0 : 1);
}

const arvore = await readFile(resolve(RAIZ, 'ARVORE-DO-PROJETO.md'), 'utf8').catch(() => null);
const alvos = arg && arg !== '--arvore' ? [arg] : REGISTRADOS;

const relatorio = { gate: 'DOCUMENTACAO_OBRIGATORIA', raiz: RAIZ, escopos: [], arquivos: [] };

for (const alvo of alvos) {
  /* ONE_DOCUMENTATION_OWNER_PER_SCOPE — cada escopo tem o SEU DOCUMENTACAO.md.
     Um arquivo único para o repositório inteiro vira bíblia impossível de
     manter, e bíblia desatualizada é pior que documento ausente. */
  const doc = await readFile(resolve(RAIZ, alvo, 'docs/DOCUMENTACAO.md'), 'utf8').catch(() => null);
  relatorio.escopos.push({ escopo: alvo, owner_documental: doc === null ? 'AUSENTE' : `${alvo}/docs/DOCUMENTACAO.md` });

  for (const abs of await varrer(resolve(RAIZ, alvo))) {
    const rel = relative(RAIZ, abs).split('\\').join('/');
    const texto = await readFile(abs, 'utf8').catch(() => null);
    if (texto === null) continue;
    if (rel.endsWith('docs/DOCUMENTACAO.md')) continue; // o owner não se audita
    const r = auditarArquivo(rel, texto, arvore, doc);
    if (r.veredito !== 'NAO_APLICAVEL') relatorio.arquivos.push(r);
  }
}

relatorio.resumo = {
  auditados: relatorio.arquivos.length,
  pass: relatorio.arquivos.filter(a => a.veredito === 'PASS').length,
  fail: relatorio.arquivos.filter(a => a.veredito === 'FAIL').length,
};
relatorio.veredito = relatorio.resumo.fail ? 'FAIL'
                   : relatorio.resumo.auditados ? 'PASS' : 'NAO_APLICAVEL';

console.log(JSON.stringify(relatorio, null, 2));
process.exit(relatorio.veredito === 'PASS' ? 0 : relatorio.veredito === 'FAIL' ? 1 : 2);

//#endregion
