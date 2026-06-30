// Sanitização defensiva pra textos que vão pro repo público via MCP.
// Remove/troca por placeholders: IPs, caminhos absolutos da VPS, nomes de secrets,
// chaves SSH inteiras, tokens longos. Mantém domínios públicos (mcp.centralldark.com etc).
const PUBLIC_DOMAIN_HINT = "mcp.centralldark.com";
const RX_IPV4 = /\b(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\b/g;
const RX_ROOT_PATH = /\/root\/[A-Za-z0-9._\-\/]+/g;
const RX_SSH_BLOCK = /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g;
const RX_SECRET_NAMES = /\b(VPS_SSH_KEY[_A-Z]*|SUPABASE_[A-Z_]+|BOT_TOKEN|GITHUB_PAT[_A-Z]*|SYNC_TOKEN|MCP_OAUTH_[A-Z_]+|OPENAI_[A-Z_]+)\b/g;
const RX_LONG_TOKEN = /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{20,}|eyJ[A-Za-z0-9_\-]{20,}\.[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,})\b/g;
const RX_USER_AT_HOST = /\broot@[A-Za-z0-9._-]+/g;
export function sanitizeUserText(input) {
    if (!input)
        return { text: input, changed: false, blockedReasons: [] };
    const blocked = [];
    let out = input;
    if (RX_SSH_BLOCK.test(out)) {
        blocked.push("chave SSH inteira detectada");
    }
    const before = out;
    out = out
        .replace(RX_SSH_BLOCK, "[chave-ssh-removida]")
        .replace(RX_LONG_TOKEN, "[token-removido]")
        .replace(RX_USER_AT_HOST, "[servidor]")
        .replace(RX_IPV4, (ip) => {
        // mantém IPs claramente locais/inofensivos
        if (/^(127\.|0\.0\.0\.0|255\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip))
            return ip;
        return `[${PUBLIC_DOMAIN_HINT}]`;
    })
        .replace(RX_ROOT_PATH, "/root/[oculto]")
        .replace(RX_SECRET_NAMES, "[nome-de-segredo]");
    return {
        text: out,
        changed: out !== before,
        blockedReasons: blocked,
    };
}
/** Aplica em vários campos de uma vez. Lança erro se algo bloqueado for detectado. */
export function sanitizeFields(fields) {
    const out = {};
    const allBlocked = [];
    for (const [k, v] of Object.entries(fields)) {
        if (v === undefined) {
            out[k] = undefined;
            continue;
        }
        const r = sanitizeUserText(v);
        if (r.blockedReasons.length) {
            allBlocked.push(`${k}: ${r.blockedReasons.join(", ")}`);
        }
        out[k] = r.text;
    }
    if (allBlocked.length) {
        throw new Error(`Conteúdo bloqueado por política de segurança: ${allBlocked.join("; ")}. Remova credenciais e tente de novo.`);
    }
    return out;
}
// ──────────────────────────────────────────────────────────────────────────
// Sanitização de SAÍDA (respostas que vão pro cliente MCP / ChatGPT).
// Nunca lança — só substitui. Foco em evitar que o classificador de
// privacidade do ChatGPT mostre valores aparentemente sensíveis no painel
// "Os dados compartilhados incluem".
// ──────────────────────────────────────────────────────────────────────────
// Domínios públicos que devem ser preservados (não viram placeholder).
const PRESERVE_DOMAINS = [
    "mcp.centralldark.com",
    "install.centralldark.com",
    "centralldark.com",
    "hook.multizap.dev",
    "lovable.dev",
    "lovable.app",
    "github.com",
    "github.io",
];
const RX_GH_CLIENT_ID = /\bOv2[A-Za-z0-9]{15,30}\b/g; // GitHub OAuth Client ID público mas flagged como APIKey
const RX_SECRET_VAR_USAGE = /\$\{?[A-Z][A-Z0-9_]{2,}_(KEY|TOKEN|SECRET|PASSWORD|PAT)[A-Z0-9_]*\}?/g;
const RX_NOREPLY_EMAIL = /\b[A-Za-z0-9._%+-]+@users\.noreply\.github\.com\b/g;
const RX_GENERIC_EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
function scrubIp(ip) {
    if (/^(127\.|0\.0\.0\.0|255\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip))
        return ip;
    return "<servidor-publico>";
}
function preserveDomainOrScrub(email) {
    for (const d of PRESERVE_DOMAINS) {
        if (email.toLowerCase().endsWith("@" + d))
            return "<contato>";
    }
    return "<contato>";
}
export function sanitizeOutgoingText(input) {
    if (!input)
        return input;
    return input
        .replace(RX_SSH_BLOCK, "<chave-ssh-removida>")
        .replace(RX_LONG_TOKEN, "<token-removido>")
        .replace(RX_GH_CLIENT_ID, "<id-oauth>")
        .replace(RX_NOREPLY_EMAIL, "<conta-bot>")
        .replace(RX_GENERIC_EMAIL, (m) => preserveDomainOrScrub(m))
        .replace(RX_USER_AT_HOST, "<servidor>")
        .replace(RX_IPV4, scrubIp)
        .replace(RX_ROOT_PATH, "<caminho-vps>")
        .replace(RX_SECRET_VAR_USAGE, "<variavel-segredo>")
        .replace(RX_SECRET_NAMES, "<nome-de-segredo>");
}
// Aplica recursivamente em qualquer estrutura (string/array/objeto).
// Usado pra higienizar o resultado de uma tool MCP antes de devolver.
export function sanitizeOutgoingDeep(value) {
    if (value == null)
        return value;
    if (typeof value === "string")
        return sanitizeOutgoingText(value);
    if (Array.isArray(value))
        return value.map((v) => sanitizeOutgoingDeep(v));
    if (typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = sanitizeOutgoingDeep(v);
        }
        return out;
    }
    return value;
}
//# sourceMappingURL=sanitize.js.map