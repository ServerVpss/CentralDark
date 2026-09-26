# DECISAO - cognitivo.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\cognitivo\cognitivo.js
**SHA:** 6ca65c903cfb0e1c
**Timestamp:** 2026-08-28T02:54:38.033711
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- relevancia: z.enum(["alta", "media", "baixa"]).optional().describe("Padrão: media"),
- eixo: z.enum(["passado", "presente", "futuro"]).optional().describe("Eixo temporal (padrão: presente)"),

### Ouro Bruto (primeiros 5000 chars)
```
// ============================================================================
//  Tools COGNITIVAS do MCP CentralDark — Governança Cognitiva + Memória Cruzada
// ----------------------------------------------------------------------------
//  Qualquer IA conectada ao MCP usa o mesmo owner cognitivo para:
//    - personal_context_*               → lembrar e cruzar sessões/superfícies
//    - consultar_memoria_reserva        → ler as "Lembranças" promovidas
//    - consolidar_pensamento            → gravar um insight nas Lembranças
//    - injetar_consciencia_centraldark  → receber as regras de conduta
//    - analise_de_estado_cognitivo      → inferir o foco atual do Pivete
//
//  "Lembranças" = memória de CURTO PRAZO (30 dias) em docs/CONSCIENCIA/LEMBRANCAS/.
//  Toda IA passa por aqui PRIMEIRO ao conectar (o Pivete troca muito de IA via
//  conector e não quer perder o jeito dele). O que for valioso é promovido pra
//  consciência oficial; o resto expira em 30 dias. Git é a fonte da verdade e
//  sincroniza pro Notion automaticamente.
//
//  Segue exatamente o padrão das outras tools (ver consciencia.js): leitura/
//  escrita via GitHub API (com fallback local), validação Zod, ctx.token.
// ============================================================================
import path from "path";
import { readFile } from "fs/promises";
import { z } from "zod";
import { config } from "../../config.js";
import * as gh from "../github/github.js";
import { sanitizeFields } from "../../lib/sanitize.js";
import { defaultPersonalContextOwner, personalContextStats, rememberPersonalContext, searchPersonalContext, } from "../../lib/personal-context-store.js";
// Caminho único das Lembranças (relativo à raiz do repo).
const LEMBRANCAS_PATH = "docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md";
// Marcador que separa o cabeçalho explicativo das entradas reais.
const MARCADOR = "## 📌 Entradas";
// Validade padrão de uma lembrança, em dias.
const TTL_DIAS = 30;
const CO_AUTHOR = "SegredoDev <segredounlock@users.noreply.github.com>";
function textBlock(text) {
    return { content: [{ type: "text", text }] };
}
function structuredBlock(payload) {
    return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
    };
}
const READ_ANNOT = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
};
const WRITE_ANNOT = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
};
const PRIVATE_READ_ANNOT = { ...READ_ANNOT, openWorldHint: false };
const PRIVATE_WRITE_ANNOT = { ...WRITE_ANNOT, openWorldHint: false };
/* ─────────── Datas (America/Sao_Paulo) ─────────── */
function hojeSP() {
    return new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Sao_Paulo",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date()); // YYYY-MM-DD
}
function agoraSP() {
    const d = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Sao_Paulo",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date()); // "YYYY-MM-DD HH:MM"
    return d.replace(" ", "T");
}
function addDias(isoDate, n) {
    const d = new Date(`${isoDate}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}
/* ─────────── Leitura/escrita no repo (GitHub + fallback local) ─────────── */
async function lerLembrancas(token) {
    try {
        const file = await gh.getFileContent(token, config.github.owner, config.github.repo, LEMBRANCAS_PATH);
        if (typeof file === "string")
            return file;
        const f = file;
        if (f.decoded)
            return f.decoded;
        if (f.content)
            return Buffer.from(f.content, "base64").toString("utf-8");
        return JSON.stringify(file);
    }
    catch (err) {
        // Fallback local quando o GitHub está indisponível ou o arquivo não existe.
        try {
            const localPath = path.join(config.vps.repoPath, LEMBRANCAS_PATH);
            return await readFile(localPath, "utf-8");
        }
        catch {
            return baseVazia();
        }
    }
}
async function escreverLembrancas(token, conteudo, mensagem) {
    const result = await gh.createOrUpdateFile(token, config.github.owner, config.github.repo, {
        path: LEMBRANCAS_PATH,
        content: conteudo,
        message: mensagem,
        coAuthor: CO_AUTHOR,
    });
    const r = result;
    return { sha: r?.commit?.sha ?? null, url: r?.commit?.html_url ?? null };
}
// Esqueleto mínimo caso o arquivo não exista (não deve acontecer — criado na Fase 2).
function baseVazia() {
    return [
        "---",
        'title: "LEMBRANÇAS (curto prazo · 30 dias)"',
        `updated: ${hojeSP()}`,
        "---",
        "",
        "# 🧠 Lembranças",
        "",
        MARCADOR,
        "",
    ].join("\n");
}
/* ────────
```

---

# DECISAO - cognitivo.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\tools\cognitivo\cognitivo.js
**SHA:** 6de78f0d6081b7d4
**Timestamp:** 2026-08-28T02:54:49.934469
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- relevancia: z.enum(["alta", "media", "baixa"]).optional().describe("Padrão: media"),
- eixo: z.enum(["passado", "presente", "futuro"]).optional().describe("Eixo temporal (padrão: presente)"),

### Ouro Bruto (primeiros 5000 chars)
```
// ============================================================================
//  Tools COGNITIVAS do MCP CentralDark — Governança Cognitiva + Memória Cruzada
// ----------------------------------------------------------------------------
//  Qualquer IA conectada ao MCP usa o mesmo owner cognitivo para:
//    - personal_context_*               → lembrar e cruzar sessões/superfícies
//    - consultar_memoria_reserva        → ler as "Lembranças" promovidas
//    - consolidar_pensamento            → gravar um insight nas Lembranças
//    - injetar_consciencia_centraldark  → receber as regras de conduta
//    - analise_de_estado_cognitivo      → inferir o foco atual do Pivete
//
//  "Lembranças" = memória de CURTO PRAZO (30 dias) em docs/CONSCIENCIA/LEMBRANCAS/.
//  Toda IA passa por aqui PRIMEIRO ao conectar (o Pivete troca muito de IA via
//  conector e não quer perder o jeito dele). O que for valioso é promovido pra
//  consciência oficial; o resto expira em 30 dias. Git é a fonte da verdade e
//  sincroniza pro Notion automaticamente.
//
//  Segue exatamente o padrão das outras tools (ver consciencia.js): leitura/
//  escrita via GitHub API (com fallback local), validação Zod, ctx.token.
// ============================================================================
import path from "path";
import { readFile } from "fs/promises";
import { z } from "zod";
import { config } from "../../config.js";
import * as gh from "../github/github.js";
import { sanitizeFields } from "../../lib/sanitize.js";
import {
    defaultPersonalContextOwner,
    personalContextStats,
    rememberPersonalContext,
    searchPersonalContext,
} from "../../lib/personal-context-store.js";

// Caminho único das Lembranças (relativo à raiz do repo).
const LEMBRANCAS_PATH = "docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md";
// Marcador que separa o cabeçalho explicativo das entradas reais.
const MARCADOR = "## 📌 Entradas";
// Validade padrão de uma lembrança, em dias.
const TTL_DIAS = 30;
const CO_AUTHOR = "SegredoDev <segredounlock@users.noreply.github.com>";

function textBlock(text) {
    return { content: [{ type: "text", text }] };
}

function structuredBlock(payload) {
    return {
        content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
        structuredContent: payload,
    };
}

const READ_ANNOT = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
};
const WRITE_ANNOT = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
};
const PRIVATE_READ_ANNOT = { ...READ_ANNOT, openWorldHint: false };
const PRIVATE_WRITE_ANNOT = { ...WRITE_ANNOT, openWorldHint: false };

/* ─────────── Datas (America/Sao_Paulo) ─────────── */

function hojeSP() {
    return new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Sao_Paulo",
        year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date()); // YYYY-MM-DD
}
function agoraSP() {
    const d = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "America/Sao_Paulo",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date()); // "YYYY-MM-DD HH:MM"
    return d.replace(" ", "T");
}
function addDias(isoDate, n) {
    const d = new Date(`${isoDate}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}

/* ─────────── Leitura/escrita no repo (GitHub + fallback local) ─────────── */

async function lerLembrancas(token) {
    try {
        const file = await gh.getFileContent(token, config.github.owner, config.github.repo, LEMBRANCAS_PATH);
        if (typeof file === "string") return file;
        const f = file;
        if (f.decoded) return f.decoded;
        if (f.content) return Buffer.from(f.content, "base64").toString("utf-8");
        return JSON.stringify(file);
    } catch (err) {
        // Fallback local quando o GitHub está indisponível ou o arquivo não existe.
        try {
            const localPath = path.join(config.vps.repoPath, LEMBRANCAS_PATH);
            return await readFile(localPath, "utf-8");
        } catch {
            return baseVazia();
        }
    }
}

async function escreverLembrancas(token, conteudo, mensagem) {
    const result = await gh.createOrUpdateFile(token, config.github.owner, config.github.repo, {
        path: LEMBRANCAS_PATH,
        content: conteudo,
        message: mensagem,
        coAuthor: CO_AUTHOR,
    });
    const r = result;
    return { sha: r?.commit?.sha ?? null, url: r?.commit?.html_url ?? null };
}

// Esqueleto mínimo caso o arquivo não exista (não deve acontecer — criado na Fase 2).
function baseVazia() {
    return [
        "---",
        'title: "LEMBRANÇAS (curto prazo · 30 dias)"',
        `updated: ${hojeSP()}`,
        "---",
        "",
        "# 🧠 Lembranças",
        "",
        MARCADOR,
        "",
    ].join("\n");
}

/* ─────────── Parsing das entra
```