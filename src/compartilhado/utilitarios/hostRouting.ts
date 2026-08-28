/**
 * Roteamento por hostname — CentralDark / TelePainel / Landings
 *
 * Mesmo build SPA é servido em vários subdomínios na VPS, e o componente
 * renderizado na raiz "/" é decidido pelo hostname:
 *
 *   centralldark.com / www.            -> LandingCentralDark (home)
 *   telepainel.centralldark.com        -> redirect /dashboard (área logada)
 *   whatsapp.centralldark.com          -> LandingWhatsapp
 *   crm.centralldark.com               -> LandingCRM
 *   financeiro.centralldark.com        -> LandingFinanceiro
 *
 * O Caddy só serve os arquivos estáticos com fallback pra index.html;
 * quem decide o que mostrar é o React, com base em window.location.hostname.
 */

export type HostKind =
  | "portal"
  | "telepainel"
  | "whatsapp"
  | "crm"
  | "financeiro"
  | "outro";

const TELEPAINEL_HOSTS = new Set([
  "telepainel.centralldark.com",
  "www.telepainel.centralldark.com",
]);

const PORTAL_HOSTS = new Set([
  "centralldark.com",
  "www.centralldark.com",
]);

const WHATSAPP_HOSTS = new Set([
  "whatsapp.centralldark.com",
  "www.whatsapp.centralldark.com",
]);

const CRM_HOSTS = new Set([
  "crm.centralldark.com",
  "www.crm.centralldark.com",
]);

const FINANCEIRO_HOSTS = new Set([
  "financeiro.centralldark.com",
  "www.financeiro.centralldark.com",
]);

export function detectHostKind(host?: string): HostKind {
  if (typeof window === "undefined" && !host) return "outro";
  const h = (host ?? window.location.hostname).toLowerCase();
  if (TELEPAINEL_HOSTS.has(h)) return "telepainel";
  if (PORTAL_HOSTS.has(h)) return "portal";
  if (WHATSAPP_HOSTS.has(h)) return "whatsapp";
  if (CRM_HOSTS.has(h)) return "crm";
  if (FINANCEIRO_HOSTS.has(h)) return "financeiro";
  return "outro";
}

/**
 * Quando o usuário entra na raiz "/" do domínio telepainel, redireciona
 * direto pro dashboard (ou pra tela de login). Outros hosts não redirecionam:
 * o App escolhe qual landing renderizar pelo hostname.
 */
export function getRootRedirectFor(kind: HostKind): string | null {
  if (kind === "telepainel") return "/dashboard";
  return null;
}
