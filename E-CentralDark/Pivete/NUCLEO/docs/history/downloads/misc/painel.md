# OUTRO - painel.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\painel.js
**SHA:** 43b496e11d87cc5b
**Timestamp:** 2026-08-28T02:54:48.101056
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- .brand{display:flex;align-items:center;gap:12px;margin-bottom:18px}
- .row{display:flex;flex-wrap:wrap;gap:14px}
- .grid{display:grid;gap:14px}
- .badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;border:1px solid transparent}
- .btn{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:var(--radius-btn);border:1px solid var(--border);background:var(--surface);color:var(--text);font:600 13px/1 inherit;
- .stat{display:flex;flex-direction:column;gap:4px;padding:12px 14px;background:var(--surface-2);border-radius:12px;border:1px solid var(--border)}
- .conn{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2)}
- details.group>summary{list-style:none;cursor:pointer;padding:12px 14px;display:flex;align-items:center;gap:10px;font-weight:600}
- details.group .tools{padding:8px 14px 14px;display:flex;flex-wrap:wrap;gap:6px}
- .hdr-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}

### Ouro Bruto (primeiros 5000 chars)
```
// Painel visual do MCP CentralDark.
// Servido em GET / e GET /painel.
// HTML autocontido (CSS + JS inline). Sem dependências novas.
// Tema inspirado no "Esmeralda" (light default, esmeralda hsl(160 84% 39%),
// sombras 3D táteis, cantos arredondados).
//
// Fonte de dados: GET /status.json (mesmo servidor, sem CORS, sem auth).
// Atualização automática a cada 30s. Tokens/IDs mascarados na UI.
const HTML = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MCP CentralDark — Painel</title>
<meta name="description" content="Painel ao vivo do servidor MCP CentralDark: status, conectores, catálogo de tools, OAuth e tokens." />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2310b981'/%3E%3Cpath d='M16 40V24l8 10 8-10v16M40 24v16M40 24l8 8 8-8' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E" />
<style>
:root{
  --bg: hsl(150 20% 98%);
  --surface: #ffffff;
  --surface-2: hsl(150 18% 96%);
  --border: hsl(150 14% 90%);
  --text: hsl(160 20% 14%);
  --muted: hsl(160 8% 45%);
  --primary: hsl(160 84% 39%);
  --primary-soft: hsl(160 84% 95%);
  --warn: hsl(38 92% 50%);
  --warn-soft: hsl(38 92% 95%);
  --error: hsl(0 78% 56%);
  --error-soft: hsl(0 78% 96%);
  --radius-card: 14px;
  --radius-btn: 10px;
  --shadow-soft: 0 1px 0 rgba(255,255,255,.9) inset, 0 1px 2px rgba(16,24,40,.04), 0 6px 14px -8px rgba(16,24,40,.10);
  --shadow-primary: 0 1px 0 rgba(255,255,255,.25) inset, 0 6px 14px -4px hsl(160 84% 39% / .45);
  --shadow-pressed: 0 1px 1px rgba(16,24,40,.08) inset;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
a{color:var(--primary);text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:1180px;margin:0 auto;padding:24px 20px 80px}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.brand .logo{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,hsl(160 84% 45%),hsl(160 84% 32%));display:grid;place-items:center;color:#fff;font-weight:800;box-shadow:var(--shadow-primary)}
.brand h1{font-size:18px;margin:0;font-weight:700;letter-spacing:-.01em}
.brand .sub{color:var(--muted);font-size:12px}
.row{display:flex;flex-wrap:wrap;gap:14px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);box-shadow:var(--shadow-soft);padding:18px}
.card h2{font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:700}
.grid{display:grid;gap:14px}
.grid.cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid.cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid.cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
@media (max-width:780px){.grid.cols-2,.grid.cols-3,.grid.cols-4{grid-template-columns:1fr}}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;border:1px solid transparent}
.badge.ok{background:var(--primary-soft);color:hsl(160 84% 22%);border-color:hsl(160 60% 80%)}
.badge.warn{background:var(--warn-soft);color:hsl(38 92% 28%);border-color:hsl(38 80% 80%)}
.badge.error{background:var(--error-soft);color:hsl(0 70% 38%);border-color:hsl(0 60% 85%)}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.dot.ok{background:var(--primary)}
.dot.warn{background:var(--warn)}
.dot.error{background:var(--error)}
.btn{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:var(--radius-btn);border:1px solid var(--border);background:var(--surface);color:var(--text);font:600 13px/1 inherit;cursor:pointer;box-shadow:var(--shadow-soft);transition:transform .12s,box-shadow .12s}
.btn:hover{background:var(--surface-2)}
.btn:active{transform:translateY(1px);box-shadow:var(--shadow-pressed)}
.btn.primary{background:var(--primary);color:#fff;border-color:transparent;box-shadow:var(--shadow-primary)}
.btn.primary:hover{filter:brightness(.97)}
.btn.danger{background:var(--error);color:#fff;border-color:transparent;box-shadow:0 1px 0 rgba(255,255,255,.25) inset, 0 6px 14px -4px hsl(0 78% 56% / .45)}
.stat{display:flex;flex-direction:column;gap:4px;padding:12px 14px;background:var(--surface-2);border-radius:12px;border:1px solid var(--border)}
.stat .k{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600}
.stat .v{font-size:22px;font-weight:700;letter-spacing:-.02em}
.conn{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2)}
.conn .name{font-weight:600;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.conn .meta{font-
```

---

# OUTRO - painel.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\painel\painel.js
**SHA:** aa8556839b6e8d58
**Timestamp:** 2026-08-28T02:54:55.518783
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- .describe("Novo status da pendência (padrão: concluido)"),
- .describe("Mensagem personalizada para o commit git (padrão: automático)"),

### Ouro Bruto (primeiros 5000 chars)
```
// Tool atualizar_painel — edita painel-data.json na VPS e faz git commit+push.
// Qualquer IA deve chamar isso ao concluir uma tarefa para manter o Mega Painel atualizado.
import { z } from "zod";
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { notifyTelegramPainel } from "./telegram-notify.js";
const PAINEL_PATH = "/root/CentralDark/apps/modulos/status/painel-data.json";
const REPO_ROOT = "/root/CentralDark";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function nowISO() {
    return new Date().toISOString();
}
function nowBRT() {
    return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) + " BRT";
}
export const painelTools = [
    {
        name: "atualizar_painel",
        description: "Atualiza o Mega Painel do projeto (status.centralldark.com) editando painel-data.json na VPS e fazendo git commit+push automático. OBRIGATÓRIO chamar ao concluir qualquer tarefa — o painel reflete em menos de 30 segundos.",
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
            title: "Atualizar Mega Painel",
        },
        inputSchema: z.object({
            pendencia_id: z
                .string()
                .optional()
                .describe("ID da pendência a atualizar, ex: 'P7'"),
            pendencia_status: z
                .enum(["concluido", "em_andamento", "pendente"])
                .optional()
                .describe("Novo status da pendência (padrão: concluido)"),
            fase_texto: z
                .string()
                .optional()
                .describe("Novo texto para project.phase, ex: 'P7 Concluído — MCP tool atualizar_painel'"),
            tarefa_texto: z
                .string()
                .optional()
                .describe("Novo texto para project.currentTask"),
            progresso: z
                .number()
                .int()
                .min(0)
                .max(100)
                .optional()
                .describe("Progresso geral do projeto 0-100"),
            ultimo_commit: z
                .string()
                .optional()
                .describe("Descrição curta do último commit realizado"),
            evento: z
                .string()
                .optional()
                .describe("Texto do novo evento para aparecer no feed do painel"),
            evento_area: z
                .string()
                .optional()
                .describe("Área do evento: Telegram, MCP, Infra, GitHub, Painel, etc."),
            nextia: z
                .string()
                .optional()
                .describe("Instrução resumida para a próxima IA que abrir o projeto"),
            fase_nova: z
                .object({
                id: z.string().describe("ID da fase, ex: 'F9'"),
                titulo: z.string().describe("Título da fase"),
                status: z.enum(["concluido", "em_andamento", "pendente"]),
                commit: z.string().optional().describe("Hash curto do commit associado"),
            })
                .optional()
                .describe("Adicionar ou atualizar uma fase no array fases[]"),
            commit_msg: z
                .string()
                .optional()
                .describe("Mensagem personalizada para o commit git (padrão: automático)"),
        }),
        handler: async (input) => {
            let data;
            try {
                data = JSON.parse(readFileSync(PAINEL_PATH, "utf8"));
            }
            catch (e) {
                return ok({ ok: false, error: `Não consegui ler ${PAINEL_PATH}: ${e.message}` });
            }
            const alteracoes = [];
            data.updatedAt = nowISO();
            data.updatedAtBR = nowBRT();
            data.project = data.project || {};
            // Pendência
            if (input.pendencia_id) {
                const novoStatus = input.pendencia_status ?? "concluido";
                const p = data.pendencias?.find((x) => x.id === input.pendencia_id);
                if (p) {
                    p.status = novoStatus;
                    alteracoes.push(`${input.pendencia_id}=${novoStatus}`);
                }
                else {
                    alteracoes.push(`${input.pendencia_id} não encontrado`);
                }
            }
            // Campos do projeto
            if (input.fase_texto !== undefined) {
                data.project.phase = input.fase_texto;
                alteracoes.push("phase");
            }
            if (input.tarefa_texto !== undefined) {
                data.project.currentTask = input.tarefa_texto;
                alteracoes.push("currentTask");
            }
            if (input.progresso !== undefined) {
                data.project.overallProgress = input.progresso;
                alteracoes.
```

---

# OUTRO - painel.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\painel.js
**SHA:** a782e165eef610f8
**Timestamp:** 2026-08-28T02:54:59.932077
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- .brand{display:flex;align-items:center;gap:12px;margin-bottom:18px}
- .row{display:flex;flex-wrap:wrap;gap:14px}
- .grid{display:grid;gap:14px}
- .badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;border:1px solid transparent}
- .btn{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:var(--radius-btn);border:1px solid var(--border);background:var(--surface);color:var(--text);font:600 13px/1 inherit;
- .stat{display:flex;flex-direction:column;gap:4px;padding:12px 14px;background:var(--surface-2);border-radius:12px;border:1px solid var(--border)}
- .conn{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2)}
- details.group>summary{list-style:none;cursor:pointer;padding:12px 14px;display:flex;align-items:center;gap:10px;font-weight:600}
- details.group .tools{padding:8px 14px 14px;display:flex;flex-wrap:wrap;gap:6px}
- .hdr-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}

### Ouro Bruto (primeiros 5000 chars)
```
// Painel visual do MCP CentralDark.
// Servido em GET / e GET /painel.
// HTML autocontido (CSS + JS inline). Sem dependências novas.
// Tema inspirado no "Esmeralda" (light default, esmeralda hsl(160 84% 39%),
// sombras 3D táteis, cantos arredondados).
//
// Fonte de dados: GET /status.json (mesmo servidor, sem CORS, sem auth).
// Atualização automática a cada 30s. Tokens/IDs mascarados na UI.
const HTML = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>MCP CentralDark — Painel</title>
<meta name="description" content="Painel ao vivo do servidor MCP CentralDark: status, conectores, catálogo de tools, OAuth e tokens." />
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2310b981'/%3E%3Cpath d='M16 40V24l8 10 8-10v16M40 24v16M40 24l8 8 8-8' stroke='white' stroke-width='4' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E" />
<style>
:root{
  --bg: hsl(150 20% 98%);
  --surface: #ffffff;
  --surface-2: hsl(150 18% 96%);
  --border: hsl(150 14% 90%);
  --text: hsl(160 20% 14%);
  --muted: hsl(160 8% 45%);
  --primary: hsl(160 84% 39%);
  --primary-soft: hsl(160 84% 95%);
  --warn: hsl(38 92% 50%);
  --warn-soft: hsl(38 92% 95%);
  --error: hsl(0 78% 56%);
  --error-soft: hsl(0 78% 96%);
  --radius-card: 14px;
  --radius-btn: 10px;
  --shadow-soft: 0 1px 0 rgba(255,255,255,.9) inset, 0 1px 2px rgba(16,24,40,.04), 0 6px 14px -8px rgba(16,24,40,.10);
  --shadow-primary: 0 1px 0 rgba(255,255,255,.25) inset, 0 6px 14px -4px hsl(160 84% 39% / .45);
  --shadow-pressed: 0 1px 1px rgba(16,24,40,.08) inset;
}
*{box-sizing:border-box}
html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
a{color:var(--primary);text-decoration:none}
a:hover{text-decoration:underline}
.wrap{max-width:1180px;margin:0 auto;padding:24px 20px 80px}
.brand{display:flex;align-items:center;gap:12px;margin-bottom:18px}
.brand .logo{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,hsl(160 84% 45%),hsl(160 84% 32%));display:grid;place-items:center;color:#fff;font-weight:800;box-shadow:var(--shadow-primary)}
.brand h1{font-size:18px;margin:0;font-weight:700;letter-spacing:-.01em}
.brand .sub{color:var(--muted);font-size:12px}
.row{display:flex;flex-wrap:wrap;gap:14px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-card);box-shadow:var(--shadow-soft);padding:18px}
.card h2{font-size:13px;margin:0 0 12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:700}
.grid{display:grid;gap:14px}
.grid.cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
.grid.cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
.grid.cols-4{grid-template-columns:repeat(4,minmax(0,1fr))}
@media (max-width:780px){.grid.cols-2,.grid.cols-3,.grid.cols-4{grid-template-columns:1fr}}
.badge{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;padding:4px 10px;border-radius:999px;border:1px solid transparent}
.badge.ok{background:var(--primary-soft);color:hsl(160 84% 22%);border-color:hsl(160 60% 80%)}
.badge.warn{background:var(--warn-soft);color:hsl(38 92% 28%);border-color:hsl(38 80% 80%)}
.badge.error{background:var(--error-soft);color:hsl(0 70% 38%);border-color:hsl(0 60% 85%)}
.dot{width:8px;height:8px;border-radius:50%;display:inline-block}
.dot.ok{background:var(--primary)}
.dot.warn{background:var(--warn)}
.dot.error{background:var(--error)}
.btn{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:var(--radius-btn);border:1px solid var(--border);background:var(--surface);color:var(--text);font:600 13px/1 inherit;cursor:pointer;box-shadow:var(--shadow-soft);transition:transform .12s,box-shadow .12s}
.btn:hover{background:var(--surface-2)}
.btn:active{transform:translateY(1px);box-shadow:var(--shadow-pressed)}
.btn.primary{background:var(--primary);color:#fff;border-color:transparent;box-shadow:var(--shadow-primary)}
.btn.primary:hover{filter:brightness(.97)}
.btn.danger{background:var(--error);color:#fff;border-color:transparent;box-shadow:0 1px 0 rgba(255,255,255,.25) inset, 0 6px 14px -4px hsl(0 78% 56% / .45)}
.stat{display:flex;flex-direction:column;gap:4px;padding:12px 14px;background:var(--surface-2);border-radius:12px;border:1px solid var(--border)}
.stat .k{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;font-weight:600}
.stat .v{font-size:22px;font-weight:700;letter-spacing:-.02em}
.conn{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--border);border-radius:12px;background:var(--surface-2)}
.conn .name{font-weight:600;flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.conn .meta{font-
```

---

# OUTRO - painel.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\src\tools\painel\painel.js
**SHA:** 66f29ec47f0f4d53
**Timestamp:** 2026-08-28T02:55:06.686033
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- .describe("Novo status da pendência (padrão: concluido)"),
- .describe("Mensagem personalizada para o commit git (padrão: automático)"),

### Ouro Bruto (primeiros 5000 chars)
```
// Tool atualizar_painel — edita painel-data.json na VPS e faz git commit+push.
// Qualquer IA deve chamar isso ao concluir uma tarefa para manter o Mega Painel atualizado.
import { z } from "zod";
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { notifyTelegramPainel } from "./telegram-notify.js";
const PAINEL_PATH = "/root/CentralDark/apps/modulos/status/painel-data.json";
const REPO_ROOT = "/root/CentralDark";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function nowISO() {
    return new Date().toISOString();
}
function nowBRT() {
    return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) + " BRT";
}
export const painelTools = [
    {
        name: "atualizar_painel",
        description: "Atualiza o Mega Painel do projeto (status.centralldark.com) editando painel-data.json na VPS e fazendo git commit+push automático. OBRIGATÓRIO chamar ao concluir qualquer tarefa — o painel reflete em menos de 30 segundos.",
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
            openWorldHint: false,
            title: "Atualizar Mega Painel",
        },
        inputSchema: z.object({
            pendencia_id: z
                .string()
                .optional()
                .describe("ID da pendência a atualizar, ex: 'P7'"),
            pendencia_status: z
                .enum(["concluido", "em_andamento", "pendente"])
                .optional()
                .describe("Novo status da pendência (padrão: concluido)"),
            fase_texto: z
                .string()
                .optional()
                .describe("Novo texto para project.phase, ex: 'P7 Concluído — MCP tool atualizar_painel'"),
            tarefa_texto: z
                .string()
                .optional()
                .describe("Novo texto para project.currentTask"),
            progresso: z
                .number()
                .int()
                .min(0)
                .max(100)
                .optional()
                .describe("Progresso geral do projeto 0-100"),
            ultimo_commit: z
                .string()
                .optional()
                .describe("Descrição curta do último commit realizado"),
            evento: z
                .string()
                .optional()
                .describe("Texto do novo evento para aparecer no feed do painel"),
            evento_area: z
                .string()
                .optional()
                .describe("Área do evento: Telegram, MCP, Infra, GitHub, Painel, etc."),
            nextia: z
                .string()
                .optional()
                .describe("Instrução resumida para a próxima IA que abrir o projeto"),
            fase_nova: z
                .object({
                id: z.string().describe("ID da fase, ex: 'F9'"),
                titulo: z.string().describe("Título da fase"),
                status: z.enum(["concluido", "em_andamento", "pendente"]),
                commit: z.string().optional().describe("Hash curto do commit associado"),
            })
                .optional()
                .describe("Adicionar ou atualizar uma fase no array fases[]"),
            commit_msg: z
                .string()
                .optional()
                .describe("Mensagem personalizada para o commit git (padrão: automático)"),
        }),
        handler: async (input) => {
            let data;
            try {
                data = JSON.parse(readFileSync(PAINEL_PATH, "utf8"));
            }
            catch (e) {
                return ok({ ok: false, error: `Não consegui ler ${PAINEL_PATH}: ${e.message}` });
            }
            const alteracoes = [];
            data.updatedAt = nowISO();
            data.updatedAtBR = nowBRT();
            data.project = data.project || {};
            // Pendência
            if (input.pendencia_id) {
                const novoStatus = input.pendencia_status ?? "concluido";
                const p = data.pendencias?.find((x) => x.id === input.pendencia_id);
                if (p) {
                    p.status = novoStatus;
                    alteracoes.push(`${input.pendencia_id}=${novoStatus}`);
                }
                else {
                    alteracoes.push(`${input.pendencia_id} não encontrado`);
                }
            }
            // Campos do projeto
            if (input.fase_texto !== undefined) {
                data.project.phase = input.fase_texto;
                alteracoes.push("phase");
            }
            if (input.tarefa_texto !== undefined) {
                data.project.currentTask = input.tarefa_texto;
                alteracoes.push("currentTask");
            }
            if (input.progresso !== undefined) {
                data.project.overallProgress = input.progresso;
                alteracoes.
```