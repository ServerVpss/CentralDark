// Resolve o branding white-label a partir do header Host do request (SSR).
// Não exige autenticação — é usado no shell raiz pra entregar a página já
// com a marca do cliente (logo, cor, favicon, título da aba).
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type HostBranding = {
  workspace_id: string;
  workspace_name: string | null;
  workspace_slug: string | null;
  brand_name: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  login_background_url: string | null;
  primary_color: string | null;
  sidebar_bg: string | null;
  hide_lovable_brand: boolean;
  white_label_active: boolean;
};

// Cache em memória por host (TTL 60s). Reduz consultas em todo request SSR.
const cache = new Map<string, { value: HostBranding | null; expiresAt: number }>();
const TTL_MS = 60_000;

function normalizeHost(host: string | undefined | null): string | null {
  if (!host) return null;
  const trimmed = host.trim().toLowerCase().split(":")[0];
  if (!trimmed) return null;
  // Domínios internos do Lovable não têm white-label
  if (trimmed.endsWith(".lovable.app") || trimmed.endsWith(".lovable.dev") || trimmed === "localhost") {
    return null;
  }
  return trimmed;
}

export const resolveBrandingForCurrentHost = createServerFn({ method: "GET" }).handler(async () => {
  const rawHost = getRequestHeader("host") ?? getRequestHeader("x-forwarded-host") ?? null;
  const host = normalizeHost(rawHost);
  if (!host) return null;

  const cached = cache.get(host);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  try {
    const { data, error } = await supabaseAdmin.rpc("resolve_branding_by_host", { _host: host });
    if (error) {
      console.error("[resolveBrandingForCurrentHost]", error);
      cache.set(host, { value: null, expiresAt: Date.now() + 10_000 });
      return null;
    }
    const value = (data ?? null) as HostBranding | null;
    cache.set(host, { value, expiresAt: Date.now() + TTL_MS });
    return value;
  } catch (e) {
    console.error("[resolveBrandingForCurrentHost] failed:", e);
    return null;
  }
});
