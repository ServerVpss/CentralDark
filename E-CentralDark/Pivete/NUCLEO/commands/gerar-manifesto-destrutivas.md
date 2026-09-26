# COMANDO - gerar-manifesto-destrutivas.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\scripts\gerar-manifesto-destrutivas.mjs
**SHA:** 2cfd7b0a3979370c
**Timestamp:** 2026-08-28T02:54:55.537811
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- throw new Error(`gate: nao consegui ler runtimeTools de ${alvo}. Sem a lista de grupos o gate seria cego.`);
- throw new Error(`gate: grupos usados em runtimeTools sem import correspondente: ${faltando.join(", ")}`);

### Gaps
- const CAMPOS_OBRIGATORIOS_PENDENTE = [

### Ouro Bruto (primeiros 5000 chars)
```
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
      gruposCom
```