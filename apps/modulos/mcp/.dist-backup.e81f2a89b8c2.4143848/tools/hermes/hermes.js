// Tools do CentralDark-Hermes (orquestrador autônomo).
// Padrão idêntico ao elite-gateway.js — status via PM2 + logs por tail + dispatch de missão via arquivo.
import { z } from "zod";
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const HERMES_ROOT = "/root/CentralDark/apps/modulos/HERMES-CORE";
const HERMES_LOGS = `${HERMES_ROOT}/logs`;
const HERMES_MISSIONS = `${HERMES_ROOT}/missions`;
const PM2_NAME = "CentralDark-Hermes";

function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function tail(path, lines) {
    try {
        return execSync(`tail -n ${lines} "${path}" 2>/dev/null || echo "arquivo não encontrado"`, {
            encoding: "utf8",
            timeout: 5000,
        });
    }
    catch {
        return "erro ao ler arquivo";
    }
}

function listLogFiles() {
    try {
        return readdirSync(HERMES_LOGS)
            .filter((n) => n.endsWith(".log"))
            .map((n) => {
                const p = join(HERMES_LOGS, n);
                const st = statSync(p);
                return { nome: n, tamanho: st.size, modificado: st.mtime.toISOString() };
            });
    }
    catch {
        return [];
    }
}

export const hermesTools = [
    {
        name: "hermes_status",
        description: "Verifica saúde do CentralDark-Hermes (orquestrador autônomo): status PM2, uptime, restarts, memória e lista dos arquivos de log disponíveis. Fonte: PM2 + filesystem local.",
        annotations: { readOnlyHint: true, title: "Hermes — Status" },
        inputSchema: z.object({}),
        handler: async () => {
            let pm2 = { status: "desconhecido" };
            try {
                const out = execSync("pm2 jlist 2>/dev/null", { encoding: "utf8", timeout: 5000 });
                const list = JSON.parse(out);
                const proc = list.find((p) => p.name === PM2_NAME);
                if (proc) {
                    pm2 = {
                        status: proc.pm2_env?.status ?? "desconhecido",
                        uptimeMs: proc.pm2_env?.pm_uptime ? Date.now() - proc.pm2_env.pm_uptime : null,
                        restarts: proc.pm2_env?.restart_time ?? 0,
                        memMB: proc.monit?.memory ? Math.round(proc.monit.memory / 1024 / 1024) : null,
                        cpu: proc.monit?.cpu ?? null,
                    };
                }
                else { pm2.status = "não encontrado"; }
            }
            catch { pm2.status = "erro ao consultar PM2"; }
            return ok({ processo: PM2_NAME, pm2, root: HERMES_ROOT, logs: listLogFiles() });
        },
    },
    {
        name: "hermes_logs",
        description: "Lê as últimas linhas de um log do Hermes (mordomo, vigia, destravas, ou nome customizado). Útil pra auditar decisões do orquestrador e diagnosticar falhas.",
        annotations: { readOnlyHint: true, title: "Hermes — Logs" },
        inputSchema: z.object({
            arquivo: z.string().default("mordomo.log").optional().describe("Nome do arquivo dentro de HERMES-CORE/logs (padrão: mordomo.log)"),
            lines: z.number().int().min(10).max(500).default(80).optional().describe("Número de linhas (padrão: 80)"),
        }),
        handler: async (input) => {
            const arquivo = (input.arquivo ?? "mordomo.log").replace(/[^a-zA-Z0-9._-]/g, "");
            const n = input.lines ?? 80;
            const path = `${HERMES_LOGS}/${arquivo}`;
            return ok({ arquivo, linhas: n, conteudo: tail(path, n) });
        },
    },
    {
        name: "hermes_dispatch_mission",
        description: "Cria uma nova missão pro Hermes executar. Grava um JSON em HERMES-CORE/missions/ que o orquestrador consome no próximo ciclo. Retorna o caminho e o ID gerado.",
        annotations: { readOnlyHint: false, destructiveHint: false, title: "Hermes — Dispatch Mission" },
        inputSchema: z.object({
            titulo: z.string().min(1).describe("Título curto da missão"),
            descricao: z.string().min(1).describe("Descrição detalhada do que o Hermes deve fazer"),
            prioridade: z.enum(["baixa", "media", "alta", "critica"]).default("media").optional(),
            contexto: z.record(z.any()).optional().describe("Contexto adicional em JSON livre"),
        }),
        handler: async (input) => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const path = `${HERMES_MISSIONS}/${id}.json`;
            const payload = {
                id,
                titulo: input.titulo,
                descricao: input.descricao,
                prioridade: input.prioridade ?? "media",
                contexto: input.contexto ?? {},
                criadoEm: new Date().toISOString(),
                origem: "mcp:hermes_dispatch_mission",
            };
            try {
                mkdirSync(HERMES_MISSIONS, { recursive: true });
                writeFileSync(path, JSON.stringify(payload, null, 2), "utf8");
                return ok({ status: "ok", id, path, missao: payload });
            }
            catch (e) { return ok({ status: "erro", erro: e.message }); }
        },
    },
];
