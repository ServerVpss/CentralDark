// OAuth 2.1 CentralDark: excecao RFC 8252 somente para a PORTA de loopback IP.
// Funcao pura do owner OAuth. Nao altera registro DCR, consentimento, PKCE ou tokens.
const LOOPBACK_LITERAL = /^http:\/\/(127\.0\.0\.1|\[::1\])(?::([0-9]{1,5}))?((?:\/|\?)[^#]*)?$/;

function parsedLoopback(uri) {
  if (typeof uri !== "string") return null;
  const match = LOOPBACK_LITERAL.exec(uri);
  if (!match) return null;
  const port = match[2] ?? "";
  if (port && (Number(port) < 1 || Number(port) > 65535)) return null;
  try {
    const url = new URL(uri);
    if (url.protocol !== "http:" ||
        !["127.0.0.1", "[::1]"].includes(url.hostname) ||
        url.username || url.password || url.hash) return null;
    // Comparar texto cru da URI (fora a porta), sem normalizar /a/../b.
    return { host: match[1], port, suffix: match[3] ?? "" };
  } catch {
    return null;
  }
}

/**
 * Igualdade literal por padrao. Cliente publico nativo pode variar SOMENTE
 * a porta no redirect de loopback IP; host, caminho e query sao exatos.
 * Em /token segue obrigatorio o redirect_uri literal usado no /authorize.
 */
export function redirectUriRegistered(client, requested) {
  if (!client || !Array.isArray(client.redirect_uris) ||
      typeof requested !== "string") return false;
  if (client.redirect_uris.includes(requested)) return true;
  if (client.token_endpoint_auth_method !== "none") return false;
  const incoming = parsedLoopback(requested);
  if (!incoming) return false;
  return client.redirect_uris.some((registered) => {
    const known = parsedLoopback(registered);
    return !!known &&
      known.host === incoming.host &&
      known.suffix === incoming.suffix &&
      known.port !== incoming.port;
  });
}
