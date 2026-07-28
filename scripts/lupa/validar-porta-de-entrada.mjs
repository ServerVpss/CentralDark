#!/usr/bin/env node
// Guardrail da PORTA DE ENTRADA.
//
// Por que existe
// --------------
// Em 2026-07-27 descobriu-se que LEIA-ME-IA.md -- listado como item 1 "Porta de
// entrada" pelo kit_boas_vindas do MCP, e lido pela ferramenta
// ler_regras_inviolaveis -- NUNCA existiu em commit nenhum. As duas ferramentas
// feitas para calibrar tom e conduta de uma IA recem-chegada falhavam com 404.
// A IA caia nos documentos tecnicos, que existem, e trabalhava do proprio jeito.
//
// Resultado: docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md, marcado CANONICO, era
// citado por zero documentos de indice. Regra escrita, guardada e inalcancavel.
//
// Este guardrail transforma isso em build vermelho:
//   1. a porta precisa existir;
//   2. todo caminho citado na porta precisa existir;
//   3. todo documento marcado CANONICO precisa ser alcancavel a partir da porta.
//
// Alcancavel NAO conta citacao em arquivo auto-gerado. Foi exatamente isso que
// mascarou o problema: uma busca por JEITO-CORRETO-DO-PIVETE devolvia 10
// arquivos, e 9 eram relatorios do notion-sync. Instrumento com ruido produz
// falso verde.
//
// Uso: node scripts/lupa/validar-porta-de-entrada.mjs [--repo-root .] [--json]

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve, posix } from "node:path";

const args = process.argv.slice(2);
const argOf = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const ROOT = resolve(argOf("--repo-root", process.cwd()));
const JSON_OUT = args.includes("--json");

const PORTA = "LEIA-ME-IA.md";

// Pontos de entrada que uma IA percorre sem ninguem mandar.
const ENTRADAS = [PORTA, "AGENTS.md", "CLAUDE.md", "CODEX.md", "README.md"];

// Fontes auto-geradas: citacao aqui NAO torna um documento alcancavel.
const GERADO = [
  /\/notion-sync\//,
  /^docs\/RELATORIOS\//,
  /^apps\/modulos\/status\//,
  /last-report\.json$/,
  /^docs\/ESTADO-DA-RETOMADA\.md$/,
];
const ehGerado = (p) => GERADO.some((re) => re.test(p));

const ha = (p) => existsSync(join(ROOT, p));
const ler = (p) => { try { return readFileSync(join(ROOT, p), "utf8"); } catch { return ""; } };

// Extrai caminhos de repo citados num texto: links markdown, crases e caminhos crus.
function caminhosCitados(texto) {
  const achados = new Set();
  const padroes = [
    /\[[^\]]*\]\(([^)\s#]+)\)/g,                              // [x](caminho)
    /`([^`\n]+\.(?:md|mjs|js|json|py|sh|yml|yaml))`/g,         // `caminho.ext`
    /(?:^|[\s(>])((?:docs|scripts|apps|infra|conexao-ia|\.agents|\.github|\.claude)\/[^\s`)"',;]+)/gm,
  ];
  for (const re of padroes) {
    let m;
    while ((m = re.exec(texto)) !== null) {
      let p = m[1].trim().replace(/^\.\//, "").replace(/[.,;:]+$/, "");
      if (!p || p.startsWith("http") || p.startsWith("#")) continue;
      // basename solto ("QUICKSTART.md") e mencao em prosa, nao caminho de repo.
      if (!p.includes("/") && !ENTRADAS.includes(p)) continue;
      achados.add(posix.normalize(p));
    }
  }
  return [...achados];
}

// Varre docs/ e .agents/ atras de frontmatter status: CANONICO / CANÔNICO.
function acharCanonicos() {
  const out = [];
  const walk = (dir) => {
    let entradas = [];
    try { entradas = readdirSync(join(ROOT, dir), { withFileTypes: true }); } catch { return; }
    for (const e of entradas) {
      const rel = posix.join(dir, e.name);
      if (e.isSymbolicLink()) continue;   // alias (ex: docs/LEIA-ME-IA.md -> ../LEIA-ME-IA.md)
      if (e.isDirectory()) { if (!/node_modules|\.git$/.test(e.name)) walk(rel); continue; }
      if (!e.name.endsWith(".md")) continue;
      if (ehGerado(rel)) continue;
      const head = ler(rel).slice(0, 600);
      if (/^status:\s*"?CAN[OÔ]NICO"?/im.test(head)) out.push(rel);
    }
  };
  walk("docs");
  walk(".agents");
  return out;
}

// Caminhos mortos que ja existiam quando este guardrail nasceu (2026-07-27).
// Divida declarada, nao perdao: cada um esta na issue de limpeza. Caminho morto
// NOVO falha o build na hora.
const DIVIDA_CONHECIDA = new Set([
  "CLAUDE.md::/status.json",
  "CLAUDE.md::infra/microsserviços",
  "CLAUDE.md::docs/AUDITORIAS/AUDITORIA-FLUXO-DE-OURO.md",
  "README.md::docs/CONSCIENCIA/ARSENAL/MAPA-SETORES.md",
]);

const erros = [];
const avisos = [];
const legado = [];

// ---- 1. a porta existe?
if (!ha(PORTA)) {
  erros.push(`PORTA_AUSENTE: ${PORTA} nao existe. O kit_boas_vindas do MCP lista este arquivo como item 1 e ler_regras_inviolaveis tenta le-lo: sem ele, as duas ferramentas de calibracao falham com 404.`);
}

// ---- 2. todo caminho citado nas entradas existe?
for (const ent of ENTRADAS) {
  if (!ha(ent)) { avisos.push(`ENTRADA_AUSENTE: ${ent}`); continue; }
  for (const c of caminhosCitados(ler(ent))) {
    if (/[*<>]/.test(c)) continue;                 // padrao/placeholder, nao caminho
    if (ha(c)) continue;
    const chave = `${ent}::${c}`;
    if (DIVIDA_CONHECIDA.has(chave)) legado.push(chave);
    else erros.push(`CAMINHO_MORTO: ${ent} aponta para ${c}, que nao existe`);
  }
}

// ---- 3. todo canonico e alcancavel a partir da porta (ate 2 saltos)?
const canonicos = acharCanonicos();
const alcancaveis = new Set();
let nivel = ENTRADAS.filter(ha);
for (let salto = 0; salto < 2; salto++) {
  const proximo = [];
  for (const doc of nivel) {
    for (const c of caminhosCitados(ler(doc))) {
      if (ehGerado(c) || alcancaveis.has(c) || !ha(c)) continue;
      alcancaveis.add(c);
      if (c.endsWith(".md")) proximo.push(c);
    }
  }
  nivel = proximo;
}
for (const c of canonicos) {
  if (!alcancaveis.has(c)) {
    erros.push(`CANONICO_ORFAO: ${c} esta marcado CANONICO mas nenhum ponto de entrada leva ate ele em 2 saltos. Regra escrita que ninguem alcanca nao governa nada.`);
  }
}

const rel = {
  guardrail: "validar-porta-de-entrada",
  porta: PORTA,
  porta_existe: ha(PORTA),
  entradas_encontradas: ENTRADAS.filter(ha),
  canonicos_encontrados: canonicos.length,
  canonicos_alcancaveis: canonicos.filter((c) => alcancaveis.has(c)).length,
  erros,
  avisos,
  caminhos_mortos_legado: legado,
  ok: erros.length === 0,
};

if (JSON_OUT) {
  console.log(JSON.stringify(rel, null, 2));
} else {
  for (const l of rel.caminhos_mortos_legado) console.log(`LEGADO CAMINHO_MORTO ${l}`);
  for (const a of rel.avisos) console.log(`AVISO ${a}`);
  for (const e of rel.erros) console.log(`ERRO  ${e}`);
  console.log(`PORTA_OK=${rel.ok ? 1 : 0} ENTRADAS=${rel.entradas_encontradas.length} CANONICOS=${rel.canonicos_encontrados} ALCANCAVEIS=${rel.canonicos_alcancaveis} LEGADO=${legado.length} ERROS=${erros.length}`);
}
process.exit(rel.ok ? 0 : 1);
