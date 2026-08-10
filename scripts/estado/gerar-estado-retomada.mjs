#!/usr/bin/env node
// Gerador do ESTADO DA RETOMADA.
//
// Cruza as fases do PLANO-MESTRE com evidencia real do repositorio e escreve
// docs/ESTADO-DA-RETOMADA.md. Ninguem edita esse arquivo a mao: ele e
// regenerado por workflow.
//
// Regra herdada da META LUPA: ausencia de resultado num instrumento nao e
// evidencia de ausencia no sistema. Por isso um item que este script nao
// consegue provar pelo Git NAO e marcado como "falta" -- vira
// SEM_EVIDENCIA_NO_REPO, com o canal que faltou nomeado.
//
// Uso: node scripts/estado/gerar-estado-retomada.mjs [--repo-root .] [--out <arquivo>]

import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { validarProvaConsolidacao } from "../../apps/modulos/mapeamento/core/validar-mapa.mjs";

const args = process.argv.slice(2);
function arg(name, def) {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}
const ROOT = resolve(arg("--repo-root", process.cwd()));
const OUT = join(ROOT, arg("--out", "docs/ESTADO-DA-RETOMADA.md"));
const MAPA = join(ROOT, "apps/modulos/mapeamento/config/mapa-canonico.json");

const ha = (p) => existsSync(join(ROOT, p));
const todos = (...ps) => ps.every(ha);
const algum = (...ps) => ps.some(ha);

// ---------------------------------------------------------------- fases
// prova: () => true | false | null   (null = nao provavel pelo Git)
const FASES = [
  {
    id: 0, nome: "Congelar a verdade atual",
    criterio: "mapa canonico versionado + validador deterministico + guard de drift",
    prova: () => todos(
      "apps/modulos/mapeamento/config/mapa-canonico.json",
      "apps/modulos/mapeamento/core/validar-mapa.mjs",
      ".github/workflows/lupa-drift-guard.yml",
    ),
  },
  {
    id: 1, nome: "Consolidar Jarvis da Casa",
    criterio: "SOUL instalado no profile da Casa e carregamento provado",
    prova: () => null,
    motivo: "vive no profile do Hermes na Casa, fora do Git",
  },
  {
    id: 2, nome: "Inventariar o Bolt na VPS",
    criterio: "modulo Bolt versionado e alcancavel",
    prova: () => ha("apps/modulos/Bolt"),
  },
  {
    id: 3, nome: "Ligar preview real",
    criterio: "URL por workspace + HMR + captura visual",
    prova: () => null,
    motivo: "estado de runtime; exige inventario na VPS, nao ha artefato no Git que prove",
  },
  {
    id: 4, nome: "Loop de agentes",
    criterio: "contrato de tarefa + correcao automatica com evidencia",
    prova: () => algum("apps/modulos/HERMES-CORE/agents", ".agents/skills"),
  },
  {
    id: 5, nome: "Publicar e voltar",
    criterio: "deploy com health check e rollback provado",
    prova: () => algum("scripts/deploy", "scripts/webhook"),
  },
  {
    id: 6, nome: "Ponte Casa <-> VPS",
    criterio: "contrato assinado, stream de eventos, cancelamento e auditoria",
    prova: () => null,
    motivo: "exige teste ponta a ponta com a Casa ligada",
  },
  {
    id: 7, nome: "Painel administrativo total",
    criterio: "inventario vivo com nome humano, dependencia, custo e ultima prova",
    prova: () => todos("apps/modulos/graph-panel", "apps/modulos/status"),
  },
  {
    id: 8, nome: "HUB e canais",
    criterio: "portal + Telegram + voz + notificacoes",
    prova: () => algum("apps/modulos/hub", "apps/bot-telegram"),
  },
  {
    id: 9, nome: "Migracao dos negocios",
    criterio: "cada modulo inventariado, rodando em workspace e publicado",
    prova: () => null,
    motivo: "depende das fases 3 a 6",
  },
  {
    id: 10, nome: "Operacao continua",
    criterio: "manutencao, custo, capacidade e incidente automatizados",
    prova: () => null,
    motivo: "so mensuravel depois da fase 5 fechada",
  },
];

// ------------------------------------------------------- mapa canonico
function auditarMapa() {
  if (!existsSync(MAPA)) return null;
  const m = JSON.parse(readFileSync(MAPA, "utf8"));
  const faltaSetor = [];
  for (const s of m.sectors || []) {
    for (const p of s.paths || []) if (!ha(p)) faltaSetor.push({ setor: s.label, path: p });
  }
  const faltaArea = [];
  const consolidacao = { proven: 0, protectedUnproven: 0, invalid: 0 };
  for (const a of m.consolidated_areas || []) {
    const proof = validarProvaConsolidacao(a);
    if (proof.status === "PROVEN") consolidacao.proven += 1;
    else if (proof.status === "PROTECTED_UNPROVEN") consolidacao.protectedUnproven += 1;
    else consolidacao.invalid += 1;
    if (!ha(a.path)) faltaArea.push({ path: a.path, reason: a.reason, proofStatus: proof.status });
  }
  return { m, faltaSetor, faltaArea, consolidacao };
}

// Areas cuja ausencia no Git e o comportamento correto, nao um defeito.
const AUSENCIA_ESPERADA = {
  "secrets/": "material sensivel proibido no Git — ausente por design, nao e lacuna",
};

// ------------------------------------------------------------- render
const mapa = auditarMapa();
const agora = new Date().toISOString();
const L = [];

L.push("# ESTADO DA RETOMADA");
L.push("");
L.push("> Gerado por `scripts/estado/gerar-estado-retomada.mjs`. **Nao edite a mao** —");
L.push("> a proxima execucao sobrescreve. Para mudar o que e medido, mude o script.");
L.push("");
L.push(`Ultima geracao: \`${agora}\``);
L.push("");
L.push("Fonte da intencao: `docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md`");
L.push("Fonte da verdade estrutural: `apps/modulos/mapeamento/config/mapa-canonico.json`");
L.push("");

const feitas = FASES.filter((f) => f.prova() === true).length;
const faltando = FASES.filter((f) => f.prova() === false).length;
const semProva = FASES.filter((f) => f.prova() === null).length;

L.push("## Resumo");
L.push("");
L.push(`- 🟢 fases com evidencia no repo: **${feitas}**`);
L.push(`- 🔴 fases sem o artefato exigido: **${faltando}**`);
L.push(`- 🟡 fases que o Git nao consegue provar: **${semProva}**`);
L.push("");
L.push("Fase com evidencia no repo nao significa fase concluida: significa que o");
L.push("artefato minimo existe e esta versionado. Conclusao exige teste operacional.");
L.push("");

L.push("## Fases");
L.push("");
L.push("| # | Fase | Estado | Criterio medido |");
L.push("|---|------|--------|-----------------|");
for (const f of FASES) {
  const r = f.prova();
  const estado = r === true ? "🟢 evidencia no repo"
    : r === false ? "🔴 artefato ausente"
    : `🟡 SEM_EVIDENCIA_NO_REPO — ${f.motivo}`;
  L.push(`| ${f.id} | ${f.nome} | ${estado} | ${f.criterio} |`);
}
L.push("");

if (mapa) {
  L.push("## Caminhos protegidos no mapa e ausentes no checkout");
  L.push("");
  const todasFaltas = [
    ...mapa.faltaSetor.map((x) => ({ path: x.path, ctx: `setor ${x.setor}` })),
    ...mapa.faltaArea.map((x) => ({
      path: x.path,
      ctx: x.proofStatus === "PROVEN"
        ? `consolidacao PROVEN — ${x.reason}`
        : `${x.proofStatus} — ${x.reason}`,
    })),
  ];
  const reais = todasFaltas.filter((x) => !AUSENCIA_ESPERADA[x.path]);
  const esperadas = todasFaltas.filter((x) => AUSENCIA_ESPERADA[x.path]);

  if (!reais.length) {
    L.push("Nenhum. Todo caminho declarado existe no checkout.");
  } else {
    L.push("| Caminho | Declarado como | Acao |");
    L.push("|---|---|---|");
    for (const x of reais) {
      L.push(`| \`${x.path}\` | ${x.ctx} | abrir PR: criar o modulo ou remover a declaracao |`);
    }
  }
  L.push("");
  if (esperadas.length) {
    L.push("### Ausencia esperada (nao e lacuna)");
    L.push("");
    for (const x of esperadas) {
      L.push(`- \`${x.path}\` — ${AUSENCIA_ESPERADA[x.path]}`);
    }
    L.push("");
    L.push("Estes caminhos geram aviso em todo PR. Aviso permanente treina o time a");
    L.push("ignorar aviso: ou o mapa passa a marcar `expected_absent: true`, ou a");
    L.push("declaracao sai. Enquanto isso, o ruido continua.");
    L.push("");
  }
  const totalSetores = (mapa.m.sectors || []).reduce((a, s) => a + (s.paths || []).length, 0);
  const totalProtegidas = (mapa.m.consolidated_areas || []).length;
  L.push(`Totais no mapa: ${totalSetores} caminhos de setor, ${totalProtegidas} areas protegidas.`);
  L.push(`Consolidacao evidencial: PROVEN=${mapa.consolidacao.proven}, PROTECTED_UNPROVEN=${mapa.consolidacao.protectedUnproven}, INVALID_PROOF=${mapa.consolidacao.invalid}.`);
  L.push("");
} else {
  L.push("## Modulos");
  L.push("");
  L.push("🔴 `apps/modulos/mapeamento/config/mapa-canonico.json` nao encontrado — sem mapa nao ha auditoria estrutural.");
  L.push("");
}

L.push("## O que este arquivo nao mede");
L.push("");
L.push("- estado de runtime da VPS (processo vivo, porta aberta, container saudavel)");
L.push("- estado da Casa (SOUL carregado, voz, telas, memoria pessoal)");
L.push("- se um modulo que existe realmente funciona");
L.push("");
L.push("Existir no Git e condicao necessaria, nunca suficiente. Um caminho presente");
L.push("aqui ainda pode estar quebrado em execucao.");
L.push("");

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, L.join("\n").replace(/\n+$/, "\n"), "utf8");
console.log(`ESTADO_GERADO out=${OUT} fases_ok=${feitas} fases_faltando=${faltando} sem_prova=${semProva}`);
