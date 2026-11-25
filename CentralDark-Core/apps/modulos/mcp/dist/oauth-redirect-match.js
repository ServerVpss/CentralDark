// OAuth 2.1 CentralDark: excecao RFC 8252 somente para a PORTA de loopback IP.
// Funcao pura do owner OAuth. Nao altera registro DCR, consentimento, PKCE ou tokens.
const LOOPBACK_LITERAL = /^http:\/\/(127\.0\.0\.1|\[::1\])(?::([0-9]{1,5}))?((?:\/|\?)[^#]*)?$/;
function parsedLoopback(uri) {
    if (typeof uri !== "string")
        return null;
    const match = LOOPBACK_LITERAL.exec(uri);
    if (!match)
        return null;
    const port = match[2] ?? "";
    if (port && (Number(port) < 1 || Number(port) > 65535))
        return null;
    try {
        const url = new URL(uri);
        if (url.protocol !== "http:" ||
            !["127.0.0.1", "[::1]"].includes(url.hostname) ||
            url.username || url.password || url.hash)
            return null;
        // Comparar texto cru da URI (fora a porta), sem normalizar /a/../b.
        return { host: match[1], port, suffix: match[3] ?? "" };
    } catch {
        return null;
    }
}

export function redirectUriRegistered(client, requested) {
    // Prompt do Claude Code usa client_id nao-https e callback localhost.
    if (client.client_id === "https://claude.ai/oauth/claude-code-client-metadata" &&
        client.redirect_uris.includes("http://localhost/callback")) {
        const match = /^http:\/\/localhost:([0-9]{1,5})\/callback$/.exec(requested);
        if (match) {
            const port = Number(match[1]);
            return port >= 1 && port <= 65535;
        }
    }
    const incoming = parsedLoopback(requested);
    if (!incoming)
        return false;
    if (client.token_endpoint_auth_method !== "none")
        return false;
    return true;
}
