// Capacidade Windows Casa dentro do catálogo do MCP CentralDark já existente.
// HTTP interno: VPS MCP -> tailnet privada -> CentralDark Casa Agent (MIT engine).
import { z } from "zod";
import { auditStartupSnapshot } from "../../lib/admin-guard.js";
import { getDispatcherRuntimeTools } from "../core/mcp-admin.js";
const json = (value) => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] });
function url(path) {
    const host = process.env.CENTRALDARK_CASA_TAILSCALE_HOST || "windows-casa.tail6d7aa4.ts.net";
    if (!/^[a-zA-Z0-9.-]{1,100}$/.test(host))
        throw Error("CASA_TAILSCALE_HOST_INVALID");
    return "http://" + host + ":9100" + path;
}
async function callCasa(method, path, payload) {
    const token = process.env.CENTRALDARK_CASA_BRIDGE_TOKEN || "";
    if (token.length < 24)
        return { ok: false, status: "CASA_BRIDGE_TOKEN_NOT_CONFIGURED", executed: false };
    try {
        const response = await fetch(url(path), {
            method,
            headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
            ...(payload ? { body: JSON.stringify(payload) } : {}),
            signal: AbortSignal.timeout(30000)
        });
        const raw = await response.text();
        let data;
        try {
            data = JSON.parse(raw);
        }
        catch {
            return { ok: false, status: "CASA_RESPONSE_NOT_JSON", httpStatus: response.status, executed: false };
        }
        return { ...data, httpStatus: response.status, route: "CASA_TAILSCALE_NATIVE" };
    }
    catch (e) {
        return { ok: false, status: "CASA_ROUTE_UNAVAILABLE",
            reason: String(e?.cause?.code || e?.code || e?.message || e).slice(0, 220), executed: false };
    }
}
const annotations = (write, title) => ({
    readOnlyHint: !write, destructiveHint: write, idempotentHint: !write,
    openWorldHint: false, title
});
const filePath = z.string().min(1).max(2048);
export const casaPrivateTools = [
    { name: "centraldark_casa_status",
        description: "Estado atual do adapter CentralDark Casa Commander pelo Tailscale; online não substitui prova de comando.",
        annotations: annotations(false, "Casa — Estado"),
        inputSchema: z.object({}),
        handler: async () => json(await callCasa("GET", "/health"))
    },
    { name: "centraldark_casa_list_directory",
        description: "Lista diretório Windows da Casa SEGREDO por engine local do MCP CentralDark.",
        annotations: annotations(false, "Casa — Listar pasta"),
        inputSchema: z.object({ path: filePath }),
        handler: async ({ path }) => json(await callCasa("POST", "/tool", { name: "list_directory", arguments: { path } }))
    },
    { name: "centraldark_casa_read_file",
        description: "Lê arquivo da Casa SEGREDO pelo Tailscale privado e engine local.",
        annotations: annotations(false, "Casa — Ler arquivo"),
        inputSchema: z.object({ path: filePath }),
        handler: async ({ path }) => json(await callCasa("POST", "/tool", { name: "read_file", arguments: { path } }))
    },
    { name: "centraldark_casa_tool_call",
        description: "Capacidades administrativas da Casa. Requer OAuth admin, auditoria pronta, autorização e opt-in local.",
        annotations: annotations(true, "Casa — Ferramenta administrativa"),
        inputSchema: z.object({
            name: z.string().regex(/^[a-z_]{3,64}$/),
            arguments: z.record(z.string(), z.unknown()).default({}),
            confirm_admin: z.literal("PERMITO SEGREDO")
        }),
        handler: async (input, ctx) => {
            const scopes = new Set(String(ctx?.oauthScope || "").split(/\s+/));
            if (ctx?.admin !== true || !scopes.has("admin") || !ctx?.callerUser || !ctx?.correlationId ||
                ctx?.autoMission === true || ctx?.authProvenance !== "verified_oauth_admin")
                return json({ ok: false, status: "CASA_ADMIN_OAUTH_REQUIRED", executed: false });
            const audit = await auditStartupSnapshot(getDispatcherRuntimeTools());
            if (audit?.ready !== true)
                return json({ ok: false, status: "AUDITORIA_STARTUP_INDISPONIVEL", executed: false });
            return json(await callCasa("POST", "/tool", { name: input.name, arguments: input.arguments }));
        }
    }
];
//# sourceMappingURL=casa-private.js.map