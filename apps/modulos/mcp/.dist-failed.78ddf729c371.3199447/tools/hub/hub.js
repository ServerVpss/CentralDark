// Tools de integração com o HUB CentralDark (broker de contas/keys).
// Fonte única: https://hub.centralldark.com — todas as contas e chaves
// dos providers vivem lá (AES-256-GCM, log auditável).
// Dá pro Hermes / IAs conectadas ao MCP enxergar tudo automaticamente.
import { z } from "zod";
const HUB_BASE = process.env.HUB_BASE_URL || "https://hub.centralldark.com";
function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}
function err(msg) {
    return { content: [{ type: "text", text: `❌ ${msg}` }], isError: true };
}
async function hubFetch(path, init = {}) {
    const res = await fetch(`${HUB_BASE}${path}`, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(init.headers || {}),
        },
    });
    const text = await res.text();
    let body;
    try {
        body = JSON.parse(text);
    }
    catch {
        body = { raw: text };
    }
    return { status: res.status, ok: res.ok, body };
}
export const hubTools = [
    {
        name: "hub_welcome_kit",
        description: "Kit de boas-vindas do HUB CentralDark: princípios, regras, endpoints e providers habilitados. Ponto de partida obrigatório pra qualquer IA que vá usar o HUB.",
        annotations: { title: "HUB — Welcome kit", readOnlyHint: true },
        inputSchema: z.object({}).strict(),
        async handler() {
            const r = await hubFetch("/api/welcome-kit");
            return r.ok ? ok(r.body) : err(`welcome-kit HTTP ${r.status}: ${JSON.stringify(r.body).slice(0, 400)}`);
        },
    },
    {
        name: "hub_list_providers",
        description: "Lista todos os providers suportados pelo HUB (Notion, Google Drive, GitHub, Claude, Gemini, etc.) com metadados de OAuth/API key.",
        annotations: { title: "HUB — Providers", readOnlyHint: true },
        inputSchema: z.object({}).strict(),
        async handler() {
            const r = await hubFetch("/api/providers");
            return r.ok ? ok(r.body) : err(`providers HTTP ${r.status}`);
        },
    },
    {
        name: "hub_list_accounts",
        description: "Lista TODAS as contas OAuth/API-key já conectadas no HUB (multi-conta por provider). Retorna id, provider, apelido, status, último teste. NUNCA retorna o token cru.",
        annotations: { title: "HUB — Minhas contas", readOnlyHint: true },
        inputSchema: z.object({
            provider: z.string().optional().describe("Filtra por provider (ex.: notion, gdrive, github)"),
        }).strict(),
        async handler({ provider }) {
            const qs = provider ? `?provider=${encodeURIComponent(provider)}` : "";
            const r = await hubFetch(`/api/keys/list${qs}`);
            return r.ok ? ok(r.body) : err(`accounts HTTP ${r.status}`);
        },
    },
    {
        name: "hub_test_account",
        description: "Testa uma conta específica do HUB (ping no provider) pra confirmar se o token/OAuth ainda está válido. Passe o id da conta retornado por hub_list_accounts.",
        annotations: { title: "HUB — Testar conta", readOnlyHint: true },
        inputSchema: z.object({
            account_id: z.string().min(1).describe("id da conta (uuid) retornado por hub_list_accounts"),
        }).strict(),
        async handler({ account_id }) {
            const r = await hubFetch(`/api/keys/test`, {
                method: "POST",
                body: JSON.stringify({ id: account_id }),
            });
            return r.ok ? ok(r.body) : err(`test HTTP ${r.status}: ${JSON.stringify(r.body).slice(0, 300)}`);
        },
    },
];
//# sourceMappingURL=hub.js.map
//# sourceMappingURL=hub.js.map