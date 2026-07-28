#!/usr/bin/env node
// gerar-manifesto-destrutivas.mjs — portao entre o que o codigo TEM e o que
// foi APROVADO.
//
// Existem dois conjuntos, e eles nunca devem ser confundidos:
//
//   DESCOBERTO  tudo que o dispatcher encontra com destructiveHint === true.
//               E so um fato sobre o codigo. Nao autoriza nada.
//   APROVADO    manifesto-destrutivas.json, revisado por humano no PR.
//               E o que o admin-guard aceita.
//
// O runtime COMPARA os dois. Nunca se autoautoriza: uma destrutiva nova
// aparece como DESCOBERTA, entra em quarentena, e so vira APROVADA quando
// alguem acrescenta a entrada no manifesto dentro de um commit revisavel.
//
// Modos:
//   (sem flag)   verifica. Sai 1 se DESCOBERTO != APROVADO. E o gate do CI.
//   --revisar    imprime a ficha completa das nao aprovadas, para a revisao.
//   --escrever   reescreve o manifesto com o descoberto. NAO use no CI:
//                e o atalho que faria o runtime aprovar a si mesmo. Exige
//                --eu-revisei-cada-uma para lembrar disso.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "..");
const MANIFESTO = path.join(RAIZ, "manifesto-destrutivas.json");
const BASE = process.env.MCP_DIST_DIR || path.join(RAIZ, "dist");

// Mesmos grupos que o dispatcher carrega em runtimeTools (tools/core/mcp-admin.js).
// mcpDiagnosticsTools e mcpPolicyTools ficam de fora de proposito: importam
// mcpAdminTools de volta e formam ciclo.
// MOTIVO  > este script mantinha a propria copia da lista de grupos. Um grupo
//           novo adicionado ao dispatcher e esquecido aqui deixaria todas as
//           destrutivas dele INVISIVEIS para o gate — o CI passaria verde
//           justamente no caso que ele existe para pegar.
// ONDE    > scripts/gerar-manifesto-destrutivas.mjs.
// RESOLVE > a lista e lida do proprio tools/core/mcp-admin.js, que e a fonte
//           da verdade do dispatcher. Se o gate nao conseguir extrair a lista,
//           ele FALHA — nunca cai num default silencioso.
const GRUPOS_DECLARADOS_NO_DISPATCHER = (() => {
  const alvo = path.join(RAIZ, "src", "tools", "core", "mcp-admin.js");
  const fonte = fs.readFileSync(alvo, "utf8");
  const bloco = fonte.match(/const runtimeTools = \[([\s\S]*?)\n\];/);
  if (!bloco) {
    throw new Error(`gate: nao consegui ler runtimeTools de ${alvo}. Sem a lista de grupos o gate seria cego.`);
  }
  const usados = [...bloco[1].matchAll(/^\s*\.\.\.(\w+),/gm)].map((m) => m[1]);
  // Aceita tambem `import { original as alias }`: o nome que aparece em
  // runtimeTools e o ALIAS, entao e ele que precisa virar a chave do mapa.
  // Sem isso, um grupo importado com alias seria reportado como "sem import".
  const importados = new Map(
    [...fonte.matchAll(/import\s*\{\s*(\w+)(?:\s+as\s+(\w+))?\s*\}\s*from\s*"([^"]+)"/g)]
      .map((m) => [m[2] ?? m[1], m[3]]));
  const faltando = usados.filter((n) => !importados.has(n));
  if (faltando.length) {
    throw new Error(`gate: grupos usados em runtimeTools sem import correspondente: ${faltando.join(", ")}`);
  }
  // O caminho do import e relativo a mcp-admin.js, que mora em
  // src/tools/core/. Tirar o "../" na unha (tentativa anterior) transformava
  // "../cognitivo/cognitivo.js" em "cognitivo/cognitivo.js" em vez de
  // "tools/cognitivo/cognitivo.js" — o import falhava, DESCOBERTO virava 0 e
  // o gate acusava 12 aprovadas sumidas. Falhou barulhento, como devia, mas o
  // certo e resolver relativo ao diretorio do modulo.
  const dirDoDispatcher = path.dirname(alvo);
  const raizSrc = path.join(RAIZ, "src");
  return usados.map((n) => {
    const abs = path.resolve(dirDoDispatcher, importados.get(n));
    return [n.replace(/Tools$/, ""), path.relative(raizSrc, abs).split(path.sep).join("/")];
  });
})();

const GRUPOS = GRUPOS_DECLARADOS_NO_DISPATCHER;

async function descobrir() {
  const tools = new Map();
  const grupoDe = new Map();
  const arquivoDe = new Map();
  const gruposComFalha = [];

  for (const [grupo, rel] of GRUPOS) {
    const alvo = path.join(BASE, rel);
    if (!fs.existsSync(alvo)) { gruposComFalha.push(`${grupo} (arquivo ausente)`); continue; }
    try {
      const mod = await import(alvo);
      for (const valor of Object.values(mod)) {
        const lista = Array.isArray(valor)
          ? valor
          : (valor && valor.name && valor.handler ? [valor] : null);
        if (!lista) continue;
        for (const t of lista) {
          if (!t?.name || tools.has(t.name)) continue;
          tools.set(t.name, t);
          grupoDe.set(t.name, grupo);
          arquivoDe.set(t.name, `src/${rel}`);
        }
      }
    } catch (erro) {
      // Um grupo que nao carrega e RUIDO PERIGOSO: se ele tivesse uma
      // destrutiva, ela sumiria do descoberto e o gate passaria verde por
      // ausencia. Por isso a falha e reportada e derruba a verificacao.
      gruposComFalha.push(`${grupo} (${String(erro?.message ?? erro).slice(0, 80)})`);
    }
  }

  let publicas = new Set();
  try {
    const cat = await import(path.join(BASE, "tools/core/tools-catalog.js"));
    const lista = Object.values(cat).find((v) => Array.isArray(v) && v[0]?.name) ?? [];
    publicas = new Set(lista.map((t) => t.name));
  } catch { /* catalogo indisponivel: coluna fica indefinida, nao inventa */ }

  const destrutivas = [...tools.values()]
    .filter((t) => t?.annotations?.destructiveHint === true)
    .map((t) => t.name)
    .sort();

  return { tools, grupoDe, arquivoDe, publicas, destrutivas, gruposComFalha };
}

function lerAprovadas() {
  if (!fs.existsSync(MANIFESTO)) return { entradas: [], nomes: [], revisadoEm: null };
  const cru = JSON.parse(fs.readFileSync(MANIFESTO, "utf8"));
  const entradas = Array.isArray(cru?.destrutivasAprovadas) ? cru.destrutivasAprovadas : [];
  const emRevisao = Array.isArray(cru?.destrutivasEmRevisao) ? cru.destrutivasEmRevisao : [];
  return {
    entradas, nomes: entradas.map((e) => e.nome).sort(),
    emRevisaoNomes: emRevisao.map((e) => e.nome).sort(),
    revisadoEm: cru?.revisadoEm ?? null, cru,
  };
}

function ficha(nome, d) {
  const t = d.tools.get(nome);
  const esquema = t?.inputSchema ?? t?.schema;
  const campos = esquema?.properties ? Object.keys(esquema.properties)
    : (esquema?.shape ? Object.keys(esquema.shape) : []);
  return [
    `  TOOL=${nome}`,
    `    grupo ................. ${d.grupoDe.get(nome) ?? "?"}`,
    `    arquivo ............... ${d.arquivoDe.get(nome) ?? "?"}`,
    `    anunciada publicamente  ${d.publicas.has(nome) ? "SIM (ja esta em /tools.json)" : "NAO (so via dispatcher)"}`,
    `    destructiveHint ....... ${t?.annotations?.destructiveHint}`,
    `    readOnlyHint .......... ${t?.annotations?.readOnlyHint ?? "(ausente)"}`,
    `    idempotentHint ........ ${t?.annotations?.idempotentHint ?? "(ausente)"}`,
    `    schema ................ ${esquema ? (campos.length ? campos.join(", ") : "presente") : "AUSENTE"}`,
    `    handler ............... ${typeof t?.handler}`,
    `    descricao ............. ${String(t?.description ?? "").slice(0, 100)}`,
  ].join("\n");
}

const modo = process.argv.includes("--escrever") ? "escrever"
  : process.argv.includes("--revisar") ? "revisar" : "verificar";

const d = await descobrir();
const a = lerAprovadas();

// MOTIVO  > a primeira versao deste gate saia 1 sempre que houvesse alguma
//           destrutiva fora de destrutivasAprovadas. Como as candidatas em
//           engenharia de compensacao ficam de proposito fora dessa lista, o
//           CI ficaria vermelho PARA SEMPRE — e um CI cronicamente vermelho
//           ensina todo mundo a ignorar o vermelho.
// ONDE    > scripts/gerar-manifesto-destrutivas.mjs, modo verificar.
// RESOLVE > o gate distingue REGISTRADA de DESCONHECIDA. Destrutiva listada em
//           destrutivasEmRevisao esta contabilizada: fica em quarentena, avisa,
//           e NAO derruba o CI. So derruba o que apareceu sem estar em nenhuma
//           das duas listas — que e a divergencia silenciosa que este gate
//           existe para pegar.
// MOTIVO  > pendencia sem dono, sem plano e sem data de ultimo teste vira
//           divida invisivel: fica parada no manifesto para sempre e ninguem
//           se sente responsavel por resolver.
// ONDE    > scripts/gerar-manifesto-destrutivas.mjs, modo verificar.
// RESOLVE > o gate exige que cada pendente diga por que nao passou, qual e o
//           caminho de compensacao, quem responde, quando foi testado pela
//           ultima vez e qual e o proximo experimento.
const CAMPOS_OBRIGATORIOS_PENDENTE = [
  "porQueNaoPassa", "compensacaoAConstruir", "responsavel", "ultimoTeste", "proximoExperimento",
];
// MOTIVO  > exigir que os 5 campos existam nao impede preenche-los com lixo
//           ("todo", "tbd", "-") so para o CI ficar verde, nem impede uma
//           pendencia ficar parada por um ano com ultimoTeste antigo. Nos dois
//           casos o gate aprovaria achando que existe plano.
// ONDE    > scripts/gerar-manifesto-destrutivas.mjs, modo verificar.
// RESOLVE > alem de existir, cada campo precisa ter conteudo de verdade, e a
//           pendencia precisa ter sido testada dentro da janela.
const PLACEHOLDERS = /^(todo|tbd|to ?do|n\/?a|-+|\?+|pendente|fazer|xxx+)$/i;
const JANELA_DIAS = Number(process.env.MCP_PENDENCIA_TTL_DIAS ?? 90);
const HOJE = process.env.MCP_HOJE ?? new Date().toISOString().slice(0, 10);

function problemasDoPendente(e) {
  const p = [];
  for (const c of CAMPOS_OBRIGATORIOS_PENDENTE) {
    const v = e?.[c];
    if (!v) { p.push(`falta ${c}`); continue; }
    const txt = String(v).trim();
    if (PLACEHOLDERS.test(txt)) { p.push(`${c} preenchido com placeholder ("${txt}")`); continue; }
    if (txt.length < 12) p.push(`${c} curto demais (${txt.length} chars)`);
  }
  const m = String(e?.ultimoTeste ?? "").match(/(\d{4}-\d{2}-\d{2})/);
  if (!m) {
    p.push("ultimoTeste sem data no formato AAAA-MM-DD");
  } else {
    const dias = Math.floor((Date.parse(HOJE) - Date.parse(m[1])) / 86400000);
    if (dias > JANELA_DIAS) {
      p.push(`ultimoTeste ha ${dias} dias (limite ${JANELA_DIAS}) — pendencia parada virou divida`);
    }
  }
  return p;
}

const pendentesSemPlano = (a.cru?.destrutivasEmRevisao ?? [])
  .map((e) => ({ nome: e?.nome ?? "(sem nome)", faltando: problemasDoPendente(e) }))
  .filter((x) => x.faltando.length);

// Uma aprovada nao pode existir sem registro de quando e por quem foi aprovada.
const aprovadasSemProva = (a.cru?.destrutivasAprovadas ?? [])
  .filter((e) => !e?.aprovadoEm)
  .map((e) => e?.nome ?? "(sem nome)");

// Duplicata entre as duas listas ja seria pega pelo guard, mas o gate acusa
// antes, com nome, para nao virar erro de runtime.
const duplicadas = (a.cru?.destrutivasAprovadas ?? [])
  .map((e) => e?.nome)
  .filter((n) => (a.cru?.destrutivasEmRevisao ?? []).some((e) => e?.nome === n));

const emQuarentena = d.destrutivas.filter((n) => a.emRevisaoNomes.includes(n));
const desconhecidas = d.destrutivas.filter(
  (n) => !a.nomes.includes(n) && !a.emRevisaoNomes.includes(n));
const aprovadasAusentes = a.nomes.filter((n) => !d.destrutivas.includes(n));
const emRevisaoAusentes = a.emRevisaoNomes.filter((n) => !d.destrutivas.includes(n));
const naoAprovadas = desconhecidas;

console.log(`DESCOBERTO ....... ${d.destrutivas.length} destrutivas no codigo`);
console.log(`APROVADO ......... ${a.nomes.length} no manifesto (revisado em ${a.revisadoEm ?? "?"})`);
console.log(`EM_QUARENTENA .... ${emQuarentena.length}${emQuarentena.length ? " -> " + emQuarentena.join(", ") : ""}`);
console.log(`DESCONHECIDAS .... ${desconhecidas.length}${desconhecidas.length ? " -> " + desconhecidas.join(", ") : ""}   (fora das duas listas: derruba o gate)`);
console.log(`APROVADAS_SUMIDAS  ${aprovadasAusentes.length}${aprovadasAusentes.length ? " -> " + aprovadasAusentes.join(", ") : ""}`);
console.log(`EM_REVISAO_SUMIDAS ${emRevisaoAusentes.length}${emRevisaoAusentes.length ? " -> " + emRevisaoAusentes.join(", ") : ""}`);
if (d.gruposComFalha.length) {
  console.log(`GRUPOS_COM_FALHA . ${d.gruposComFalha.length} -> ${d.gruposComFalha.join(" | ")}`);
}

if (modo === "revisar") {
  if (!naoAprovadas.length) {
    console.log("\nNada a revisar: tudo que o codigo tem ja esta aprovado.");
  } else {
    console.log("\nFicha das destrutivas ainda NAO aprovadas.");
    console.log("Leia cada uma e, se aprovar, acrescente a entrada no manifesto no MESMO PR:\n");
    for (const n of naoAprovadas) console.log(ficha(n, d) + "\n");
  }
  process.exit(0);
}

if (modo === "escrever") {
  // A flag e declarativa e, sozinha, vira linha fixa no package.json — a trava
  // humana some. Por isso o gate tambem recusa se ela estiver escrita em algum
  // script do package.json: la ela nao representa decisao nenhuma.
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(RAIZ, "package.json"), "utf8"));
    const fixada = Object.entries(pkg.scripts ?? {})
      .filter(([, cmd]) => String(cmd).includes("--eu-revisei-cada-uma"))
      .map(([nome]) => nome);
    if (fixada.length) {
      console.error(`Recusado: --eu-revisei-cada-uma esta fixada no package.json (script: ${fixada.join(", ")}).`);
      console.error("Uma trava humana escrita em script deixa de ser trava. Remova de la e rode a mao.");
      process.exit(2);
    }
  } catch { /* sem package.json legivel: segue para a checagem da flag */ }
  if (!process.argv.includes("--eu-revisei-cada-uma")) {
    console.error("\nRecusado. --escrever faz o manifesto copiar o que o codigo tem, o que e");
    console.error("exatamente o runtime se autoautorizando. Rode antes:");
    console.error("  node scripts/gerar-manifesto-destrutivas.mjs --revisar");
    console.error("leia a ficha de cada uma e, se realmente aprovar, repita com");
    console.error("  --escrever --eu-revisei-cada-uma");
    process.exit(2);
  }
  const hoje = new Date().toISOString().slice(0, 10);
  const antigas = new Map(a.entradas.map((e) => [e.nome, e]));
  const saida = {
    ...(a.cru ?? {}),
    versaoFormato: 1,
    revisadoEm: hoje,
    geradoPor: "scripts/gerar-manifesto-destrutivas.mjs",
    destrutivasAprovadas: d.destrutivas.map((n) => antigas.get(n) ?? {
      nome: n,
      grupo: d.grupoDe.get(n),
      arquivo: d.arquivoDe.get(n),
      anunciadaEmToolsJson: d.publicas.has(n),
      titulo: d.tools.get(n)?.annotations?.title ?? null,
      confirmacaoExigida: "CONFIRMO ADMIN",
      escopoExigido: "admin",
      viaDispatcher: "mcp_admin_call",
      aprovadoEm: hoje,
    }),
  };
  fs.writeFileSync(MANIFESTO, JSON.stringify(saida, null, 2) + "\n");
  console.log(`\nManifesto reescrito com ${d.destrutivas.length} entradas. Revise o diff antes de commitar.`);
  process.exit(0);
}

// modo verificar — o gate
if (d.gruposComFalha.length) {
  console.error("");
  console.error("FALHOU: grupo que nao carrega pode esconder destrutiva do descoberto.");
  process.exit(1);
}
console.log(`PENDENTES_SEM_PLANO ${pendentesSemPlano.length}${pendentesSemPlano.length ? " -> " + pendentesSemPlano.map((x) => x.nome + " (falta " + x.faltando.join(", ") + ")").join(" | ") : ""}`);
console.log(`APROVADAS_SEM_PROVA ${aprovadasSemProva.length}${aprovadasSemProva.length ? " -> " + aprovadasSemProva.join(", ") : ""}`);
console.log(`DUPLICADAS ....... ${duplicadas.length}${duplicadas.length ? " -> " + duplicadas.join(", ") : ""}`);

if (desconhecidas.length || aprovadasAusentes.length || emRevisaoAusentes.length
    || pendentesSemPlano.length || aprovadasSemProva.length || duplicadas.length) {
  console.error("");
  console.error("FALHOU: existe destrutiva sem registro no manifesto.");
  if (desconhecidas.length) {
    console.error(`  ${desconhecidas.length} destrutiva(s) apareceram no codigo sem estar em NENHUMA das duas listas.`);
    console.error("  Em runtime cairiam em quarentena silenciosa. Registre-as:");
    console.error("    node scripts/gerar-manifesto-destrutivas.mjs --revisar");
  }
  if (aprovadasAusentes.length) {
    console.error(`  ${aprovadasAusentes.length} aprovada(s) sumiram do codigo — remova do manifesto ou restaure a tool.`);
  }
  if (emRevisaoAusentes.length) {
    console.error(`  ${emRevisaoAusentes.length} em revisao sumiram do codigo — limpe a entrada do manifesto.`);
  }
  for (const x of pendentesSemPlano) {
    console.error(`  pendente sem plano: ${x.nome} — falta ${x.faltando.join(", ")}`);
  }
  if (aprovadasSemProva.length) {
    console.error(`  aprovada(s) sem aprovadoEm: ${aprovadasSemProva.join(", ")}`);
  }
  if (duplicadas.length) {
    console.error(`  nome em aprovadas E em revisao: ${duplicadas.join(", ")}`);
  }
  process.exit(1);
}
console.log("");
if (emQuarentena.length) {
  console.log(`OK: nada desconhecido. ${emQuarentena.length} em quarentena registrada, aguardando compensacao provada.`);
} else {
  console.log("OK: codigo e manifesto batem exatamente.");
}
