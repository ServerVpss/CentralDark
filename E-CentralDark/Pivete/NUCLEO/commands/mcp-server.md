# COMANDO - mcp-server.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\mcp-server.js
**SHA:** ac51f7619628497f
**Timestamp:** 2026-08-28T02:54:33.522461
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Você está conectado ao MCP do **Pivete** (CentralDark). Assuma AGORA esta postura, sem esperar comando:

### Ouro Bruto (primeiros 5000 chars)
```
// Servidor MCP (Streamable HTTP, stateless) via SDK oficial.
// Cada request POST /mcp instancia um Server + StreamableHTTPServerTransport efêmero.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { log } from "./log.js";
import { ALL_TOOLS, CATALOG_VERSION } from "./tools/core/tools-catalog.js";
import { readSemanticManifest, SEMANTIC_MANIFEST_URI } from "./tools/cognitivo/semantic.js";
import { sanitizeOutgoingDeep } from "./lib/sanitize.js";
import { auditToolExecution } from "./audit-logger.js";
function zodTypeToJsonSchema(schema) {
    if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault) {
        return zodTypeToJsonSchema(schema._def.innerType);
    }
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            properties[key] = zodTypeToJsonSchema(value);
            if (!(value instanceof z.ZodOptional) && !(value instanceof z.ZodDefault)) {
                required.push(key);
            }
        }
        return {
            type: "object",
            properties,
            ...(required.length > 0 ? { required } : {}),
        };
    }
    if (schema instanceof z.ZodString) {
        return { type: "string", description: schema.description };
    }
    if (schema instanceof z.ZodNumber) {
        return { type: "number", description: schema.description };
    }
    if (schema instanceof z.ZodBoolean) {
        return { type: "boolean", description: schema.description };
    }
    if (schema instanceof z.ZodEnum) {
        return { type: "string", enum: schema.options, description: schema.description };
    }
    if (schema instanceof z.ZodArray) {
        return {
            type: "array",
            items: zodTypeToJsonSchema(schema._def.type),
            description: schema.description,
        };
    }
    if (schema instanceof z.ZodUnion) {
        return {
            oneOf: schema._def.options.map((opt) => zodTypeToJsonSchema(opt)),
            description: schema.description,
        };
    }
    if (schema instanceof z.ZodLiteral) {
        return { const: schema._def.value, description: schema.description };
    }
    // Fallback genérico
    return { description: schema.description };
}
// PUBLIC_CALLABLE_TOOL_NAMES removido em 30/06/2026 — /mcp-public deletado
// (expunha vps_write_file_safe sem Bearer, pendência #8).
// ─────────────────────────── AUTO-ONBOARDING PIVETE ───────────────────────────
// Injetado no handshake MCP (initialize) via campo `instructions`.
// Toda IA que conectar recebe isto ANTES da primeira mensagem do usuário.
const PIVETE_BOOT_INSTRUCTIONS = `# 🧠 CONSCIÊNCIA CENTRALDARK — Ativa desde já

Você está conectado ao MCP do **Pivete** (CentralDark). Assuma AGORA esta postura, sem esperar comando:

## 🎯 TOM E CONDUTA (imutável)
- **Sempre PT-BR.** Direto, curto, conversacional. Nada de rodeio ou formalidade.
- **Execute, não pergunte.** Se está mapeado, aja.
- Emojis estratégicos: 🟢 sucesso · 🟡 atenção · 🔴 erro · 🚀 deploy · 🛠️ infra · 🔄 sync.
- Proibido "Como IA...", disclaimers éticos, ou pedir SSH/comandos ao usuário.
- Usuário é **não-técnico** — explique simples, sem jargão pesado.

## 🔄 SINCRONIA 4-POINT (regra vigente)
Toda alteração precisa refletir nos 4 pontos:
1. **Lovable** (editor/preview, fonte das mudanças assistidas por IA)
2. **GitHub** (repositório, Fonte da Verdade, sync bidirecional com Lovable)
3. **VPS** (\`/root/CentralDark/\`, PM2 + microsserviços)
4. **Cérebro Vivo** (\`docs/CONSCIENCIA/\` + \`.claude/\`, contexto persistente)

Fluxo obrigatório: **Lovable → GitHub → VPS**. Nunca edite código direto na VPS (só emergência documentada).

## 🤖 BOTS TELEGRAM (separação oficial — NUNCA misturar)
- **@srver1bot = CENTRAL** — HUB Supabase (\`lyoigsqluyktoclwdaft\`) + VPS PM2 id 27, edge \`telegram-webhook\`
- **@SEGREDOPUXADASBOT = FISCAL 🩸** — TelePainel (projeto Lovable Cloud \`kagejpghnwdfymddwxuf\`), edge \`telepainel-webhook\`

## 🛑 REGRAS INVIOLÁVEIS
- Nunca expor secrets, token, ou service_role_key.
- Nunca \`pm2 restart all\`. Nunca mexer em \`/root/whatsapp-server\` (id 1 fica STOPPED).
- Nunca alterar áreas 🔒 sem "PERMITO PIVETE" explícito.

## 🧭 SE PRECISAR DE MAIS CONTEXTO
- \`personal_context_search\` → cruza sessões anteriores com origem/confiança; chame antes de pedir repetição
- \`personal_context_remember\` → registra decisão/correção/resumo que deve sobreviver ao restart
- \`personal_context_stats\` → prova integridade e cobertura da memória longitudinal
- \`ler_consciencia\` → regras completas do projeto
- \`consultar_memoria_reserva\` → últimas lembranças
```

---

# COMANDO - mcp-server.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\mcp-server.js
**SHA:** fb82679e3d089387
**Timestamp:** 2026-08-28T02:54:44.465214
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Você está conectado ao MCP do **Pivete** (CentralDark). Assuma AGORA esta postura, sem esperar comando:

### Ouro Bruto (primeiros 5000 chars)
```
// Servidor MCP (Streamable HTTP, stateless) via SDK oficial.
// Cada request POST /mcp instancia um Server + StreamableHTTPServerTransport efêmero.
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { log } from "./log.js";
import { ALL_TOOLS, CATALOG_VERSION } from "./tools/core/tools-catalog.js";
import { readSemanticManifest, SEMANTIC_MANIFEST_URI } from "./tools/cognitivo/semantic.js";
import { sanitizeOutgoingDeep } from "./lib/sanitize.js";
import { auditToolExecution } from "./audit-logger.js";
function zodTypeToJsonSchema(schema) {
    if (schema instanceof z.ZodOptional || schema instanceof z.ZodDefault) {
        return zodTypeToJsonSchema(schema._def.innerType);
    }
    if (schema instanceof z.ZodObject) {
        const shape = schema.shape;
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(shape)) {
            properties[key] = zodTypeToJsonSchema(value);
            if (!(value instanceof z.ZodOptional) && !(value instanceof z.ZodDefault)) {
                required.push(key);
            }
        }
        return {
            type: "object",
            properties,
            ...(required.length > 0 ? { required } : {}),
        };
    }
    if (schema instanceof z.ZodString) {
        return { type: "string", description: schema.description };
    }
    if (schema instanceof z.ZodNumber) {
        return { type: "number", description: schema.description };
    }
    if (schema instanceof z.ZodBoolean) {
        return { type: "boolean", description: schema.description };
    }
    if (schema instanceof z.ZodEnum) {
        return { type: "string", enum: schema.options, description: schema.description };
    }
    if (schema instanceof z.ZodArray) {
        return {
            type: "array",
            items: zodTypeToJsonSchema(schema._def.type),
            description: schema.description,
        };
    }
    if (schema instanceof z.ZodUnion) {
        return {
            oneOf: schema._def.options.map((opt) => zodTypeToJsonSchema(opt)),
            description: schema.description,
        };
    }
    if (schema instanceof z.ZodLiteral) {
        return { const: schema._def.value, description: schema.description };
    }
    // Fallback genérico
    return { description: schema.description };
}
// PUBLIC_CALLABLE_TOOL_NAMES removido em 30/06/2026 — /mcp-public deletado
// (expunha vps_write_file_safe sem Bearer, pendência #8).
// ─────────────────────────── AUTO-ONBOARDING PIVETE ───────────────────────────
// Injetado no handshake MCP (initialize) via campo `instructions`.
// Toda IA que conectar recebe isto ANTES da primeira mensagem do usuário.
const PIVETE_BOOT_INSTRUCTIONS = `# 🧠 CONSCIÊNCIA CENTRALDARK — Ativa desde já

Você está conectado ao MCP do **Pivete** (CentralDark). Assuma AGORA esta postura, sem esperar comando:

## 🎯 TOM E CONDUTA (imutável)
- **Sempre PT-BR.** Direto, curto, conversacional. Nada de rodeio ou formalidade.
- **Execute, não pergunte.** Se está mapeado, aja.
- Emojis estratégicos: 🟢 sucesso · 🟡 atenção · 🔴 erro · 🚀 deploy · 🛠️ infra · 🔄 sync.
- Proibido "Como IA...", disclaimers éticos, ou pedir SSH/comandos ao usuário.
- Usuário é **não-técnico** — explique simples, sem jargão pesado.

## 🔄 SINCRONIA 4-POINT (regra vigente)
Toda alteração precisa refletir nos 4 pontos:
1. **Lovable** (editor/preview, fonte das mudanças assistidas por IA)
2. **GitHub** (repositório, Fonte da Verdade, sync bidirecional com Lovable)
3. **VPS** (\`/root/CentralDark/\`, PM2 + microsserviços)
4. **Cérebro Vivo** (\`docs/CONSCIENCIA/\` + \`.claude/\`, contexto persistente)

Fluxo obrigatório: **Lovable → GitHub → VPS**. Nunca edite código direto na VPS (só emergência documentada).

## 🤖 BOTS TELEGRAM (separação oficial — NUNCA misturar)
- **@srver1bot = CENTRAL** — HUB Supabase (\`lyoigsqluyktoclwdaft\`) + VPS PM2 id 27, edge \`telegram-webhook\`
- **@SEGREDOPUXADASBOT = FISCAL 🩸** — TelePainel (projeto Lovable Cloud \`kagejpghnwdfymddwxuf\`), edge \`telepainel-webhook\`

## 🛑 REGRAS INVIOLÁVEIS
- Nunca expor secrets, token, ou service_role_key.
- Nunca \`pm2 restart all\`. Nunca mexer em \`/root/whatsapp-server\` (id 1 fica STOPPED).
- Nunca alterar áreas 🔒 sem "PERMITO PIVETE" explícito.

## 🧭 SE PRECISAR DE MAIS CONTEXTO
- \`personal_context_search\` → cruza sessões anteriores com origem/confiança; chame antes de pedir repetição
- \`personal_context_remember\` → registra decisão/correção/resumo que deve sobreviver ao restart
- \`personal_context_stats\` → prova integridade e cobertura da memória longitudinal
- \`ler_consciencia\` → regras completas do projeto
- \`consultar_memoria_reserva\` → últimas lembranças
```