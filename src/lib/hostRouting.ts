/**
 * Roteamento por hostname — CentralDark vs TelePainel
 *
 * Mesmo build SPA é servido em dois domínios diferentes na VPS:
 *   - centralldark.com / www.centralldark.com  -> "porta" é a landing pública
 *   - telepainel.centralldark.com              -> "porta" é o dashboard logado
 *
 * Ambos hospedados pelo Caddy em /root/CentralDark/apps/{portal,Telepanel}/dist
 */

export type HostKind = "portal" | "telepainel" | "outro";

const TELEPAINEL_HOSTS = new Set([
  "telepainel.centralldark.com",
  "www.telepainel.centralldark.com",
]);

const PORTAL_HOSTS = new Set([
  "centralldark.com",
  "www.centralldark.com",
]);

export function detectHostKind(host?: string): HostKind {
  if (typeof window === "undefined" && !host) return "outro";
  const h = (host ?? window.location.hostname).toLowerCase();
  if (TELEPAINEL_HOSTS.has(h)) return "telepainel";
  if (PORTAL_HOSTS.has(h)) return "portal";
  return "outro";
}

/**
 * Quando o usuário entra na raiz "/" do domínio telepainel, redireciona
 * direto pro dashboard (ou pra tela de login). No domínio portal, mantém
 * a landing pública.
 */
export function getRootRedirectFor(kind: HostKind): string | null {
  if (kind === "telepainel") return "/dashboard";
  return null;
}
