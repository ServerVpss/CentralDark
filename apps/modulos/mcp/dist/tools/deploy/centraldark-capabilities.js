import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { config } from "../../config.js";
import { runShell } from "../vps/vps.js";
const APPLY_CONFIRM = "APLICAR APRENDIZADO VPS";
const MICRO_CONFIRM = "EXECUTAR MICRODEPLOY";
const RECIPE_REL = "docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json";
const ROOT_GATE_REL = ".githooks/pre-commit-root-contract.sh";
const APPLY_SCRIPT_REL = "scripts/vps/apply-current-learning.sh";
const MICRO_SCRIPT_REL = "scripts/vps/main-pinned-microdeploy.sh";
const OWNER_PROFILES = Object.freeze({
    mcp: {
        prefixes: ["apps/modulos/mcp/"],
        apps: ["CentralDark-MCP"],
        health: "http://127.0.0.1:9100/health",
    },
    hub_bot: {
        prefixes: ["apps/bot-telegram/"],
        apps: ["CentralDark-HubBot-Srver1", "CentralDark-HubBot-Guardiao"],
        health: null,
    },
    hermes: {
        prefixes: [
            "apps/modulos/HERMES-CORE/",
            "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/",
            ".agents/skills/centraldark-operational-method/",
        ],
        apps: ["CentralDark-Hermes"],
        health: null,
    },
    oauth_broker: {
        prefixes: ["apps/modulos/oauth-broker/"],
        apps: ["CentralDark-OAuthBroker"],
        health: "http://127.0.0.1:8098/health",
    },
});
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function repoRoot() {
    return path.resolve(config.vps.repoPath);
}
function scratchRoot() {
    return path.join(repoRoot(), "_worktrees", "main-pinned-runtime-fastpath");
}
function abs(rel) {
    return path.join(repoRoot(), rel);
}
function shq(value) {
    return "'" + String(value).replace(/'/g, "'\\''") + "'";
}
async function exists(rel) {
    try {
        await fs.access(abs(rel));
        return true;
    }
    catch {
        return false;
    }
}
async function readJson(rel) {
    return JSON.parse(await fs.readFile(abs(rel), "utf8"));
}
function normalizeRel(raw) {
    const rel = String(raw || "").replaceAll("\\", "/").replace(/^\/+/, "").trim();
    if (!rel || rel.includes("\0"))
        throw new Error("FILESET_PATH_INVALID");
    const parts = rel.split("/");
    if (parts.some((p) => !p || p === "." || p === ".."))
        throw new Error("FILESET_PATH_INVALID");
    if (/(^|\/)(\.env|secrets?|credentials?|tokens?|sessions?)(\/|$)/i.test(rel)) {
        throw new Error("FILESET_SENSITIVE_PATH_BLOCKED");
    }
    return rel;
}
function validateOwnerFile(owner, raw) {
    const rel = normalizeRel(raw);
    const profile = OWNER_PROFILES[owner];
    if (!profile)
        throw new Error("OWNER_PROFILE_UNKNOWN");
    if (!profile.prefixes.some((prefix) => rel.startsWith(prefix))) {
        throw new Error(`FILE_OUTSIDE_OWNER_SCOPE:${rel}`);
    }
    return rel;
}
async function rootGate() {
    const gate = abs(ROOT_GATE_REL);
    if (!(await exists(ROOT_GATE_REL))) {
        return { ok: false, status: "ROOT_GATE_MISSING", gate };
    }
    const res = await runShell(`bash ${shq(gate)}`, { cwd: repoRoot(), timeoutMs: 30_000 });
    const expected = [
        "ROOT_FILE_REGISTRY_MD=PASS",
        "ROOT_FILE_REGISTRY_JSON=PASS",
        "ROOT_FILE_BINDING_YAML=PASS",
        "ROOT_FILE_ROUTER_SKILL=PASS",
        "ROOT_FILE_PRECOMMIT_HOOK=PASS",
        "LIBRARY_INDEX_V1_2_0=PASS",
        "ROOT_FILE_CONTRACT=PASS",
    ];
    const lines = String(res.stdout || "").split(/\r?\n/).filter(Boolean);
    const missing = expected.filter((line) => !lines.includes(line));
    return {
        ok: res.exitCode === 0 && missing.length === 0,
        status: res.exitCode === 0 && missing.length === 0 ? "PASS" : "FAIL",
        exitCode: res.exitCode,
        expected,
        missing,
        receipt: lines.filter((line) => /=PASS$/.test(line)),
        stderr: String(res.stderr || "").slice(-2000),
    };
}
export const centraldarkCapabilityTools = [
    {
        name: "centraldark_deploy_capabilities",
        description: "Inventário vivo das capacidades operacionais CentralDark: fallback MAIN-PINNED, scratch único, gate raiz, recipe replay e aplicação de aprendizado na VPS.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Capacidades CentralDark" },
        inputSchema: z.object({}),
        handler: async () => {
            const required = [
                RECIPE_REL,
                "docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.yml",
                ".agents/skills/main-pinned-runtime-fast-path/SKILL.md",
                ROOT_GATE_REL,
                ".agents/library-index.json",
                APPLY_SCRIPT_REL,
                MICRO_SCRIPT_REL,
            ];
            const presence = Object.fromEntries(await Promise.all(required.map(async (rel) => [rel, await exists(rel)])));
            return ok({
                ok: Object.values(presence).every(Boolean),
                status: Object.values(presence).every(Boolean) ? "PASS" : "INCOMPLETE",
                capabilities: centraldarkCapabilityTools.map((tool) => ({
                    name: tool.name,
                    destructive: tool.annotations?.destructiveHint === true,
                })),
                contracts: presence,
                scratch: scratchRoot(),
                replayBeforeRediscovery: true,
            });
        },
    },
    {
        name: "centraldark_deploy_root_gate",
        description: "Executa o gate cruzado das 5 superfícies do ROOT-FILE contract e library-index v1.2.0; somente leitura.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Gate raiz CentralDark" },
        inputSchema: z.object({}),
        handler: async () => ok(await rootGate()),
    },
    {
        name: "centraldark_deploy_scratch_status",
        description: "Mede o Single Reusable WorkTree: existência, SHA, dirty state e convergência com origin/main. Não limpa nem reseta.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Scratch CentralDark" },
        inputSchema: z.object({}),
        handler: async () => {
            const scratch = scratchRoot();
            try {
                await fs.access(scratch);
            }
            catch {
                return ok({ ok: false, status: "SCRATCH_MISSING", scratch });
            }
            const cmd = [
                `git -C ${shq(scratch)} rev-parse HEAD`,
                `git -C ${shq(repoRoot())} rev-parse origin/main`,
                `git -C ${shq(scratch)} status --porcelain`,
            ].join("; echo ---; ");
            const res = await runShell(cmd, { cwd: repoRoot(), timeoutMs: 15_000 });
            const chunks = String(res.stdout || "").split(/\r?\n---\r?\n/);
            const scratchSha = String(chunks[0] || "").trim().split(/\r?\n/).at(-1) || null;
            const mainSha = String(chunks[1] || "").trim().split(/\r?\n/).at(-1) || null;
            const dirty = String(chunks[2] || "").trim();
            return ok({
                ok: res.exitCode === 0 && Boolean(scratchSha) && scratchSha === mainSha && !dirty,
                status: res.exitCode !== 0 ? "ERROR" : (!dirty && scratchSha === mainSha ? "PASS" : "DRIFT"),
                scratch,
                scratchSha,
                originMainSha: mainSha,
                dirty: Boolean(dirty),
                dirtyPreview: dirty ? dirty.split(/\r?\n/).slice(0, 20) : [],
            });
        },
    },
    {
        name: "centraldark_deploy_recipe_status",
        description: "Lê a receita machine-consumable MAIN-PINNED e devolve status, bindings, sequência, locks e fingerprint sem redescobrir o caminho.",
        annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false, title: "Receita MAIN-PINNED" },
        inputSchema: z.object({}),
        handler: async () => {
            try {
                const recipe = await readJson(RECIPE_REL);
                return ok({
                    ok: true,
                    status: recipe.status || "LOADED",
                    schema: recipe.schema || null,
                    owner: recipe.owner || null,
                    primaryPath: recipe.primary_path || null,
                    activation: recipe.activation || null,
                    locks: recipe.locks || null,
                    sequence: recipe.sequence || [],
                    bindings: recipe.bindings || [],
                    fingerprint: recipe.fingerprint || recipe.scratch_worktree || null,
                    consumers: recipe.consumers || null,
                });
            }
            catch (error) {
                return ok({ ok: false, status: "RECIPE_INVALID", error: String(error?.message || error) });
            }
        },
    },
    {
        name: "centraldark_deploy_apply_learning",
        description: "Aplica aprendizado CURRENT da main na VPS pelo scratch canônico: lock, reset/clean somente do scratch, promoção do fileset controlado, validação, restart isolado dos bots, receipt e cleanup.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false, title: "Aplicar aprendizado na VPS" },
        inputSchema: z.object({
            dryRun: z.boolean().optional().default(true),
            confirm: z.string().optional().describe(`Execução real exige: ${APPLY_CONFIRM}`),
        }),
        handler: async (input) => {
            const gate = await rootGate();
            if (!gate.ok)
                return ok({ ok: false, status: "ROOT_GATE_BLOCKED", gate });
            if ((input.dryRun ?? true) || input.confirm !== APPLY_CONFIRM) {
                return ok({
                    ok: true,
                    status: "DRY_RUN",
                    wouldRun: APPLY_SCRIPT_REL,
                    requiredConfirm: APPLY_CONFIRM,
                    scratch: scratchRoot(),
                    gate,
                });
            }
            if (!(await exists(APPLY_SCRIPT_REL)))
                return ok({ ok: false, status: "APPLY_SCRIPT_MISSING" });
            const res = await runShell(`bash ${shq(abs(APPLY_SCRIPT_REL))}`, { cwd: repoRoot(), timeoutMs: 300_000 });
            return ok({
                ok: res.exitCode === 0,
                status: res.exitCode === 0 ? "PASS" : "FAIL",
                exitCode: res.exitCode,
                stdoutTail: String(res.stdout || "").slice(-12000),
                stderrTail: String(res.stderr || "").slice(-6000),
            });
        },
    },
    {
        name: "centraldark_deploy_micro_fallback",
        description: "Executa microdeploy MAIN-PINNED do fileset causal de um owner aprovado, com scratch único, backup/rollback, restart isolado, health e receipt.",
        annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false, title: "Microdeploy fallback MAIN-PINNED" },
        inputSchema: z.object({
            owner: z.enum(["mcp", "hub_bot", "hermes", "oauth_broker"]),
            sourceSha: z.string().regex(/^[0-9a-f]{40}$/i).optional(),
            files: z.array(z.string().min(1)).min(1).max(30),
            dryRun: z.boolean().optional().default(true),
            confirm: z.string().optional().describe(`Execução real exige: ${MICRO_CONFIRM}`),
        }),
        handler: async (input) => {
            let files;
            try {
                files = [...new Set(input.files.map((file) => validateOwnerFile(input.owner, file)))];
            }
            catch (error) {
                return ok({ ok: false, status: "FILESET_BLOCKED", error: String(error?.message || error) });
            }
            const profile = OWNER_PROFILES[input.owner];
            const plan = {
                owner: input.owner,
                sourceSha: input.sourceSha || "origin/main",
                files,
                apps: profile.apps,
                health: profile.health,
                scratch: scratchRoot(),
            };
            if ((input.dryRun ?? true) || input.confirm !== MICRO_CONFIRM) {
                return ok({ ok: true, status: "DRY_RUN", plan, requiredConfirm: MICRO_CONFIRM });
            }
            if (!(await exists(MICRO_SCRIPT_REL)))
                return ok({ ok: false, status: "MICRODEPLOY_SCRIPT_MISSING", plan });
            const args = [
                "bash",
                shq(abs(MICRO_SCRIPT_REL)),
                "--owner", shq(input.owner),
                ...(input.sourceSha ? ["--source", shq(input.sourceSha)] : []),
                ...files.flatMap((file) => ["--file", shq(file)]),
            ];
            const res = await runShell(args.join(" "), { cwd: repoRoot(), timeoutMs: 300_000 });
            return ok({
                ok: res.exitCode === 0,
                status: res.exitCode === 0 ? "PASS" : "FAIL",
                plan,
                exitCode: res.exitCode,
                stdoutTail: String(res.stdout || "").slice(-12000),
                stderrTail: String(res.stderr || "").slice(-6000),
            });
        },
    },
];
export const __centraldarkCapabilityTest = Object.freeze({
    APPLY_CONFIRM,
    MICRO_CONFIRM,
    OWNER_PROFILES,
    normalizeRel,
    validateOwnerFile,
});
//# sourceMappingURL=centraldark-capabilities.js.map