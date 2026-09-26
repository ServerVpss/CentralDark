import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "whatsapp-media";
// Cache em memória: path -> { url, expiresAt }
const cache = new Map<string, { url: string; expiresAt: number }>();
const TTL_SECONDS = 60 * 60; // 1h

/**
 * Extrai o path dentro do bucket whatsapp-media de uma URL pública ou assinada antiga.
 * Aceita ambos os formatos:
 *  - /storage/v1/object/public/whatsapp-media/<path>
 *  - /storage/v1/object/sign/whatsapp-media/<path>?token=...
 * Retorna null se não for uma URL do bucket.
 */
export function extractWhatsappMediaPath(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;
  try {
    const u = new URL(rawUrl);
    const marker = `/storage/v1/object/`;
    const idx = u.pathname.indexOf(marker);
    if (idx === -1) return null;
    const rest = u.pathname.slice(idx + marker.length); // public/<bucket>/<path> ou sign/<bucket>/<path>
    const parts = rest.split("/");
    if (parts.length < 3) return null;
    const bucket = parts[1];
    if (bucket !== BUCKET) return null;
    return decodeURIComponent(parts.slice(2).join("/"));
  } catch {
    return null;
  }
}

async function signPath(path: string): Promise<string | null> {
  const now = Date.now();
  const hit = cache.get(path);
  if (hit && hit.expiresAt > now + 30_000) return hit.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, TTL_SECONDS);
  if (error || !data?.signedUrl) return null;
  cache.set(path, { url: data.signedUrl, expiresAt: now + TTL_SECONDS * 1000 });
  return data.signedUrl;
}

/**
 * Hook que recebe uma media_url (pode ser pública antiga ou assinada) e devolve
 * uma URL utilizável agora. Para URLs do bucket whatsapp-media, gera URL assinada
 * temporária. Para URLs externas (ex: Meta direta), devolve igual.
 */
export function useSignedMediaUrl(rawUrl: string | null | undefined): string | null {
  const path = extractWhatsappMediaPath(rawUrl);
  const [signed, setSigned] = useState<string | null>(() => {
    if (!path) return rawUrl ?? null;
    const hit = cache.get(path);
    return hit && hit.expiresAt > Date.now() + 30_000 ? hit.url : null;
  });

  useEffect(() => {
    let cancelled = false;
    if (!rawUrl) { setSigned(null); return; }
    if (!path) { setSigned(rawUrl); return; }
    signPath(path).then((url) => {
      if (!cancelled) setSigned(url ?? rawUrl);
    });
    return () => { cancelled = true; };
  }, [rawUrl, path]);

  return signed;
}
