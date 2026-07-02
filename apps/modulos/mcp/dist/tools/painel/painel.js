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
                alteracoes.push(`progresso=${input.progresso}%`);
            }
            if (input.ultimo_commit !== undefined) {
                data.project.lastCommit = input.ultimo_commit;
                alteracoes.push("lastCommit");
            }
            if (input.nextia !== undefined) {
                data.nextIA = input.nextia;
                alteracoes.push("nextIA");
            }
            // Evento no feed
            if (input.evento) {
                if (!Array.isArray(data.events))
                    data.events = [];
                data.events.unshift({
                    time: nowISO(),
                    title: input.evento,
                    area: input.evento_area || "Projeto",
                    status: "feito",
                    detail: "",
                });
                data.events = data.events.slice(0, 30);
                alteracoes.push("evento");
            }
            // Fase nova ou atualizada
            if (input.fase_nova) {
                if (!Array.isArray(data.fases))
                    data.fases = [];
                const idx = data.fases.findIndex((f) => f.id === input.fase_nova.id);
                if (idx >= 0) {
                    data.fases[idx] = { ...data.fases[idx], ...input.fase_nova };
                }
                else {
                    data.fases.push(input.fase_nova);
                }
                alteracoes.push(`fase=${input.fase_nova.id}`);
            }
            // Salva
            writeFileSync(PAINEL_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
            // Git commit + push
            const resumo = alteracoes.length ? alteracoes.join(", ") : "atualização";
            const msg = input.commit_msg ||
                `chore(painel): IA atualiza painel — ${resumo}`;
            let pushed = false;
            let gitError = "";
            try {
                execSync(`git -C ${REPO_ROOT} add apps/modulos/status/painel-data.json`, {
                    stdio: "pipe",
                    timeout: 15000,
                });
                execSync(`git -C ${REPO_ROOT} commit -m ${JSON.stringify(msg)} -m "Co-Authored-By: SegredoiDev <segredounlock@users.noreply.github.com>"`, { stdio: "pipe", timeout: 15000 });
                // Rebase rápido pra evitar rejeição por push concorrente
                try {
                    execSync(`git -C ${REPO_ROOT} pull --rebase origin main`, {
                        stdio: "pipe",
                        timeout: 20000,
                    });
                }
                catch {
                    // Ignora falha no pull — tenta push mesmo assim
                }
                execSync(`git -C ${REPO_ROOT} push origin main`, {
                    stdio: "pipe",
                    timeout: 30000,
                });
                pushed = true;
            }
            catch (e) {
                gitError = (e.stderr || e.stdout || e.message || "")
                    .toString()
                    .slice(0, 300);
            }
            notifyTelegramPainel({
                evento: input.evento ?? input.commit_msg ?? "Painel atualizado via MCP",
                commit: msg,
                pushed,
            }).catch(() => { });
            return ok({
                ok: true,
                alteracoes,
                pushed,
                commitMsg: msg,
                ...(gitError ? { gitError, note: "painel-data.json salvo mas push falhou — commitar manualmente" } : {}),
            });
        },
    },
];
//# sourceMappingURL=painel.js.map