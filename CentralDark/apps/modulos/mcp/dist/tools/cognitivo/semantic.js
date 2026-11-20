import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";
import readline from "node:readline";
import { z } from "zod";
import { config } from "../../config.js";
export const SEMANTIC_MANIFEST_URI = "semantic://nilc/glove-50d/manifest";
const SEMANTIC_MODEL_ID = "nilc-glove-50d@9296f6537f6b0a24d449a2677c21c18c2c0c3bdd";
const SEMANTIC_REVISION = "9296f6537f6b0a24d449a2677c21c18c2c0c3bdd";
const SEMANTIC_SOURCE = "nilc-nlp/glove-50d";
const SEMANTIC_LICENSE = "CC-BY-4.0";
const SEMANTIC_DIMENSION = 50;
const READ_ONLY = Object.freeze({
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
});
const DEFAULT_TIMEOUT_MS = Number(process.env.SEMANTIC_BRIDGE_TIMEOUT_MS || 60000);
let bridge = null;
let rl = null;
const pending = new Map();
function textResult(payload, isError = false) {
    return {
        ...(isError ? { isError: true } : {}),
        content: [{ type: "text", text: JSON.stringify(payload) }],
    };
}
function repoRoot() {
    return process.env.CENTRALDARK_REPO_ROOT || config?.vps?.repoPath || process.cwd();
}
function pythonExecutable() {
    return process.env.SEMANTIC_PYTHON || (process.platform === "win32" ? "python" : "python3");
}
function bridgePath() {
    return process.env.SEMANTIC_BRIDGE_PATH || path.join(repoRoot(), "infra", "mcp", "semantic_bridge.py");
}
function rejectAll(error) {
    for (const { reject, timer } of pending.values()) {
        clearTimeout(timer);
        reject(error);
    }
    pending.clear();
}
function stopBridge() {
    if (rl) {
        rl.close();
        rl = null;
    }
    if (bridge && !bridge.killed)
        bridge.kill();
    bridge = null;
}
function ensureBridge() {
    if (bridge && !bridge.killed)
        return bridge;
    const child = spawn(pythonExecutable(), [bridgePath(), "--serve"], {
        cwd: repoRoot(),
        env: process.env,
        stdio: ["pipe", "pipe", "pipe"],
        windowsHide: true,
    });
    bridge = child;
    rl = readline.createInterface({ input: child.stdout });
    rl.on("line", (line) => {
        let payload;
        try {
            payload = JSON.parse(line);
        }
        catch {
            return;
        }
        const request = pending.get(payload?.id);
        if (!request)
            return;
        pending.delete(payload.id);
        clearTimeout(request.timer);
        if (payload.ok === true)
            request.resolve(payload.result);
        else
            request.reject(new Error(`${payload.error || "SEMANTIC_ERROR"}: ${payload.message || ""}`.trim()));
    });
    child.stderr.on("data", () => { });
    child.on("error", (error) => {
        rejectAll(error);
        bridge = null;
    });
    child.on("exit", (code, signal) => {
        rejectAll(new Error(`SEMANTIC_BRIDGE_EXIT code=${code ?? "null"} signal=${signal ?? "null"}`));
        bridge = null;
        rl = null;
    });
    return child;
}
async function callSemantic(operation, args = {}) {
    const child = ensureBridge();
    const id = randomUUID();
    const payload = JSON.stringify({ id, operation, args });
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            pending.delete(id);
            reject(new Error(`SEMANTIC_BRIDGE_TIMEOUT operation=${operation}`));
        }, DEFAULT_TIMEOUT_MS);
        pending.set(id, { resolve, reject, timer });
        child.stdin.write(payload + "\n", (error) => {
            if (!error)
                return;
            pending.delete(id);
            clearTimeout(timer);
            reject(error);
        });
    });
}
export async function readSemanticManifest() {
    const health = await callSemantic("semantic_health", {});
    const base = {
        model_id: health?.model_id || SEMANTIC_MODEL_ID,
        revision: health?.revision || SEMANTIC_REVISION,
        dimension: health?.dimension ?? SEMANTIC_DIMENSION,
        vocab_size: health?.vocab_size ?? null,
        license: SEMANTIC_LICENSE,
        health,
        provenance: {
            source: SEMANTIC_SOURCE,
            revision: SEMANTIC_REVISION,
            source_is_authority: false,
        },
    };
    if (health?.ok !== true)
        return base;
    const info = await callSemantic("semantic_model_info", {});
    return {
        ...base,
        model_id: info?.model_id || base.model_id,
        revision: info?.revision || base.revision,
        dimension: info?.dimension ?? base.dimension,
        vocab_size: info?.vocab_size ?? base.vocab_size,
        license: info?.license || base.license,
        provenance: {
            source: info?.source || SEMANTIC_SOURCE,
            revision: info?.revision || SEMANTIC_REVISION,
            sha256_embeddings: info?.sha256_embeddings ?? null,
            sha256_vocab: info?.sha256_vocab ?? null,
            normalization_version: info?.normalization_version ?? null,
            source_is_authority: false,
        },
    };
}
function semanticTool(name, description, inputSchema, operation = name) {
    return {
        name,
        description,
        annotations: { ...READ_ONLY, title: name },
        inputSchema,
        handler: async (input) => {
            try {
                return textResult(await callSemantic(operation, input));
            }
            catch (error) {
                return textResult({
                    ok: false,
                    error: String(error?.message || error),
                    operation,
                    authority: "PERCEPTION_ONLY",
                }, true);
            }
        },
    };
}
const lookup = semanticTool("semantic_lookup", "Consulta um termo no NILC GloVe-50d local fixado. Percepção somente: vetor/similaridade não viram fato, autorização ou ouro.", z.object({ term: z.string().min(1).max(512) }));
const neighbors = semanticTool("semantic_neighbors", "Retorna vizinhos lexicais candidatos do core semântico local. Resultado é ranking heurístico, nunca identidade de intenção.", z.object({ term: z.string().min(1).max(4096), top_k: z.number().int().min(1).max(100).optional() }));
const similarity = semanticTool("semantic_similarity", "Mede similaridade cosseno lexical entre termos/frases usando agregação heurística local. Similaridade alta não prova mesma intenção.", z.object({ left: z.string().min(1).max(4096), right: z.string().min(1).max(4096) }));
const expand = semanticTool("semantic_expand", "Expande texto em termos candidatos para busca/mineração antes de LLM. Não promove candidatos automaticamente.", z.object({ text: z.string().min(1).max(8192), top_k: z.number().int().min(1).max(100).optional() }));
const rank = semanticTool("semantic_rank", "Rankeia candidatos pelo core lexical local para reduzir contexto antes da próxima etapa. O rank não é decisão final.", z.object({ query: z.string().min(1).max(8192), candidates: z.array(z.string().min(1).max(4096)).min(1).max(500) }));
const dedupe = semanticTool("semantic_dedupe", "Gera pares candidatos a dedupe sem fusão automática. Sem threshold calibrado por evidência retorna UNPROVEN_THRESHOLD.", z.object({ items: z.array(z.string().min(1).max(4096)).min(2).max(200), threshold: z.number().min(-1).max(1).optional() }));
const modelInfo = {
    name: "semantic_model_info",
    description: "Expõe manifesto semântico seguro do modelo local fixado, sem caminhos físicos do host.",
    annotations: { ...READ_ONLY, title: "semantic_model_info" },
    inputSchema: z.object({}),
    handler: async () => {
        try {
            return textResult(await readSemanticManifest());
        }
        catch (error) {
            return textResult({
                ok: false,
                error: String(error?.message || error),
                operation: "semantic_model_info",
                authority: "PERCEPTION_ONLY",
            }, true);
        }
    },
};
const health = semanticTool("semantic_health", "Health read-only do core semântico local; falha fechado se modelo, revisão, dimensão ou hashes não forem válidos.", z.object({}));
export const semanticTools = [lookup, neighbors, similarity, expand, rank, dedupe, modelInfo, health];
export { callSemantic, stopBridge };
//# sourceMappingURL=semantic.js.map