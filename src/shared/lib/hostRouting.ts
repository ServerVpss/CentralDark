/**
 * Roteamento por hostname — CentralDark vs TelePainel
 *
 * Mesmo build SPA é servido em dois domínios diferentes na VPS:
 *   - centralldark.com / www.centralldark.com  -> "porta" é a landing pública
 *   - portal.centralldark.com                 -> "porta" é o portal de módulos
 *   - telepainel.centralldark.com              -> "porta" é o dashboard logado
 */

export type HostKind = "portal" | "telepainel" | "outro";

const TELEPAINEL_HOSTS = new Set([
  "telepainel.centralldark.com",
  "www.telepainel.centralldark.com",
]);

const PORTAL_HOSTS = new Set([
  "centralldark.com",
  "www.centralldark.com",
  "portal.centralldark.com",
]);

export function detectHostKind(host?: string): HostKind {
  if (typeof window === "undefined" && !host) return "outro";
  const h = (host ?? window.location.hostname).toLowerCase();
  if (TELEPAINEL_HOSTS.has(h)) return "telepainel";
  if (PORTAL_HOSTS.has(h)) return "portal";
  return "outro";
}

export function getRootRedirectFor(kind: HostKind): string | null {
  if (kind === "telepainel") return "/dashboard";
  return null;
}
