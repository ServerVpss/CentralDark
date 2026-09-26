# COMANDO - admin-guard.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\lib\admin-guard.js
**SHA:** 14bbb7750123509e
**Timestamp:** 2026-08-28T02:54:34.521710
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- //           apareceu no runtime e nao esta no manifesto aprovado; missing =
- let missing = [];
- missing = expected.filter((n) => !destructiveTools.includes(n));
- const desconhecidaDeTodo = !nomeValido || (!existeNoRuntime && !sumiuDoRuntime);

### Ouro Bruto (primeiros 5000 chars)
```
// admin-guard.js — módulo canônico de auditoria + reconciliação para tools destrutivas.
// Uso: importado pelo dispatcher `mcp_admin_call` (tools/core/mcp-admin.js) e pelos testes.
//
// Autolupa aplicada:
// - Baseline canônico único: CANONICAL_DESTRUCTIVE_TOOLS (nenhuma duplicação em teste/dispatcher).
// - Reconciliação com expectativa REAL passada pelo dispatcher (não mais falso verde).
// - Startup snapshot registra lista ordenada + verifyChain + version + fail marcado observável.
// - Mutex intra-processo (promise chain) só na escrita de auditoria. Sem lock global, sem daemon.
// - Append real com O_APPEND (fd.appendFile) e chain head atômico via temp+rename.
// - executionStatus distinto de decision: `authorized` só significa liberado, não executado.
// - Fail-closed: falha de auditoria bloqueia SÓ a destrutiva atual.
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
const AUDIT_DIR = process.env.MCP_AUDIT_DIR || "/root/CentralDark/logs";
const CHAIN_STATE = process.env.MCP_ADMIN_CHAIN_STATE
    || path.join(AUDIT_DIR, ".mcp-admin-chain.json");
const STARTUP_LOCK = process.env.MCP_ADMIN_STARTUP_LOCK
    || path.join(AUDIT_DIR, ".mcp-admin-startup.json");
const HOSTNAME = os.hostname();
const PID = process.pid;
// ─────────────────── manifesto aprovado de destrutivas ────────────────────
// MOTIVO  > antes existia aqui uma lista escrita a mao, e o comentario dela
//           confessava a origem: "derivada 1x do runtime real em 2026-07-21,
//           congelada aqui como baseline". Uma foto de um dia virou lei.
//           Quando o dispatcher ganhou grupos novos, o runtime passou a ter
//           mais destrutivas que a lista e o guard bloqueou TODAS por
//           divergencia — inclusive as que sempre foram legitimas.
//           A versao do catalogo tambem era uma string fixa ("v1-2026-07-21")
//           que nao mudava quando o conteudo mudava.
// ONDE    > apps/modulos/mcp/src/lib/admin-guard.js, linhas 26 e 37-50.
// RESOLVE > a lista aprovada mora em manifesto-destrutivas.json, versionado e
//           revisado no PR. Este modulo apenas LE. A versao passa a ser
//           derivada do conteudo, entao qualquer mudanca de lista muda a
//           versao sozinha — sem ninguem lembrar de atualizar numero nenhum.
const MANIFESTO_PATH = process.env.MCP_MANIFESTO_DESTRUTIVAS
    || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "manifesto-destrutivas.json");
function lerManifesto() {
    // Fail-closed no boot: um guard que nao consegue carregar a propria politica
    // NAO deve aceitar trafego. Mas o erro precisa dizer o que houve — um ENOENT
    // ou SyntaxError cru na pilha manda o operador cacar no escuro.
    let bruto;
    try {
        bruto = fs.readFileSync(MANIFESTO_PATH, "utf8");
    }
    catch (erro) {
        throw new Error(`admin-guard: manifesto de destrutivas ilegivel em ${MANIFESTO_PATH}. `
            + `O servico NAO sobe sem a politica de seguranca. Causa: ${erro?.code ?? erro?.message}`);
    }
    let cru;
    try {
        cru = JSON.parse(bruto);
    }
    catch (erro) {
        throw new Error(`admin-guard: manifesto de destrutivas com JSON invalido em ${MANIFESTO_PATH}. `
            + `O servico NAO sobe com politica corrompida. Causa: ${erro?.message}`);
    }
    // SO destrutivasAprovadas entra. destrutivasEmRevisao existe no arquivo de
    // proposito, para ficar visivel, mas NAO autoriza nada: essas tools caem em
    // quarentena pontual ate passarem nos gates.
    const entradas = Array.isArray(cru?.destrutivasAprovadas) ? cru.destrutivasAprovadas : [];
    const emRevisao = Array.isArray(cru?.destrutivasEmRevisao) ? cru.destrutivasEmRevisao : [];
    const nomes = [...new Set(entradas.map((e) => e?.nome).filter((n) => typeof n === "string" && n))].sort();
    if (nomes.length !== entradas.length) {
        throw new Error("manifesto-destrutivas.json tem entrada duplicada ou sem nome");
    }
    const cruzadas = nomes.filter((n) => emRevisao.some((e) => e?.nome === n));
    if (cruzadas.length) {
        throw new Error(`manifesto-destrutivas.json: ${cruzadas.join(", ")} esta em aprovadas E em revisao`);
    }
    return { revisadoEm: String(cru?.revisadoEm ?? "sem-data"), nomes, entradas, emRevisao };
}
const MANIFESTO = lerManifesto();
/** Hash do conteudo aprovado. Muda sozinho quando a lista muda. */
// MOTIVO  > a primeira versao deste hash incluia revisadoEm. Com isso, o
//           MESMO conjunto de destrutivas aprovadas produzia identificadores
//           diferentes so por ter sido revisado em outro dia. Dois builds no
//           mesmo dia batiam, o que parecia determinismo — mas era apenas
//           repetibilidade local: a data ainda mandava no identificador.
// ONDE    > apps/modulos/mcp/src/lib/admin-guard.js, MANIFEST_HASH.
// RESOLVE > o identific
```

---

# COMANDO - admin-guard.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\lib\admin-guard.js
**SHA:** 4511cb8263e5d52c
**Timestamp:** 2026-08-28T02:54:45.857759
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- //           apareceu no runtime e nao esta no manifesto aprovado; missing =
- let missing = [];
- missing = expected.filter((n) => !destructiveTools.includes(n));
- const desconhecidaDeTodo = !nomeValido || (!existeNoRuntime && !sumiuDoRuntime);

### Ouro Bruto (primeiros 5000 chars)
```
// admin-guard.js — módulo canônico de auditoria + reconciliação para tools destrutivas.
// Uso: importado pelo dispatcher `mcp_admin_call` (tools/core/mcp-admin.js) e pelos testes.
//
// Autolupa aplicada:
// - Baseline canônico único: CANONICAL_DESTRUCTIVE_TOOLS (nenhuma duplicação em teste/dispatcher).
// - Reconciliação com expectativa REAL passada pelo dispatcher (não mais falso verde).
// - Startup snapshot registra lista ordenada + verifyChain + version + fail marcado observável.
// - Mutex intra-processo (promise chain) só na escrita de auditoria. Sem lock global, sem daemon.
// - Append real com O_APPEND (fd.appendFile) e chain head atômico via temp+rename.
// - executionStatus distinto de decision: `authorized` só significa liberado, não executado.
// - Fail-closed: falha de auditoria bloqueia SÓ a destrutiva atual.
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { createHash, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const AUDIT_DIR = process.env.MCP_AUDIT_DIR || "/root/CentralDark/logs";
const CHAIN_STATE = process.env.MCP_ADMIN_CHAIN_STATE
  || path.join(AUDIT_DIR, ".mcp-admin-chain.json");
const STARTUP_LOCK = process.env.MCP_ADMIN_STARTUP_LOCK
  || path.join(AUDIT_DIR, ".mcp-admin-startup.json");
const HOSTNAME = os.hostname();
const PID = process.pid;

// ─────────────────── manifesto aprovado de destrutivas ────────────────────
// MOTIVO  > antes existia aqui uma lista escrita a mao, e o comentario dela
//           confessava a origem: "derivada 1x do runtime real em 2026-07-21,
//           congelada aqui como baseline". Uma foto de um dia virou lei.
//           Quando o dispatcher ganhou grupos novos, o runtime passou a ter
//           mais destrutivas que a lista e o guard bloqueou TODAS por
//           divergencia — inclusive as que sempre foram legitimas.
//           A versao do catalogo tambem era uma string fixa ("v1-2026-07-21")
//           que nao mudava quando o conteudo mudava.
// ONDE    > apps/modulos/mcp/src/lib/admin-guard.js, linhas 26 e 37-50.
// RESOLVE > a lista aprovada mora em manifesto-destrutivas.json, versionado e
//           revisado no PR. Este modulo apenas LE. A versao passa a ser
//           derivada do conteudo, entao qualquer mudanca de lista muda a
//           versao sozinha — sem ninguem lembrar de atualizar numero nenhum.
const MANIFESTO_PATH = process.env.MCP_MANIFESTO_DESTRUTIVAS
  || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "manifesto-destrutivas.json");

function lerManifesto() {
  // Fail-closed no boot: um guard que nao consegue carregar a propria politica
  // NAO deve aceitar trafego. Mas o erro precisa dizer o que houve — um ENOENT
  // ou SyntaxError cru na pilha manda o operador cacar no escuro.
  let bruto;
  try {
    bruto = fs.readFileSync(MANIFESTO_PATH, "utf8");
  } catch (erro) {
    throw new Error(
      `admin-guard: manifesto de destrutivas ilegivel em ${MANIFESTO_PATH}. `
      + `O servico NAO sobe sem a politica de seguranca. Causa: ${erro?.code ?? erro?.message}`);
  }
  let cru;
  try {
    cru = JSON.parse(bruto);
  } catch (erro) {
    throw new Error(
      `admin-guard: manifesto de destrutivas com JSON invalido em ${MANIFESTO_PATH}. `
      + `O servico NAO sobe com politica corrompida. Causa: ${erro?.message}`);
  }
  // SO destrutivasAprovadas entra. destrutivasEmRevisao existe no arquivo de
  // proposito, para ficar visivel, mas NAO autoriza nada: essas tools caem em
  // quarentena pontual ate passarem nos gates.
  const entradas = Array.isArray(cru?.destrutivasAprovadas) ? cru.destrutivasAprovadas : [];
  const emRevisao = Array.isArray(cru?.destrutivasEmRevisao) ? cru.destrutivasEmRevisao : [];
  const nomes = [...new Set(entradas.map((e) => e?.nome).filter((n) => typeof n === "string" && n))].sort();
  if (nomes.length !== entradas.length) {
    throw new Error("manifesto-destrutivas.json tem entrada duplicada ou sem nome");
  }
  const cruzadas = nomes.filter((n) => emRevisao.some((e) => e?.nome === n));
  if (cruzadas.length) {
    throw new Error(`manifesto-destrutivas.json: ${cruzadas.join(", ")} esta em aprovadas E em revisao`);
  }
  return { revisadoEm: String(cru?.revisadoEm ?? "sem-data"), nomes, entradas, emRevisao };
}

const MANIFESTO = lerManifesto();

/** Hash do conteudo aprovado. Muda sozinho quando a lista muda. */
// MOTIVO  > a primeira versao deste hash incluia revisadoEm. Com isso, o
//           MESMO conjunto de destrutivas aprovadas produzia identificadores
//           diferentes so por ter sido revisado em outro dia. Dois builds no
//           mesmo dia batiam, o que parecia determinismo — mas era apenas
//           repetibilidade local: a data ainda mandava no identificador.
// ONDE    > apps/modulos/mcp/src/lib/admin-guard.js, MANIFEST_HASH.
// RESOLVE > o identificador canonico passa a depender EXCLUSIVAMENTE do
//           conteudo aprova
```