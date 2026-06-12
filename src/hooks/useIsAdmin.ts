import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { isViewAsActive } from "@/lib/viewAsMode";

// Cache global por user.id — evita re-validar admin a cada navegação
// (era a causa principal do flash "Validando permissão…" entre menus).
const adminCache = new Map<string, boolean>();
const inflight = new Map<string, Promise<boolean>>();

export function checkAdminCached(userId: string): Promise<boolean> {
  if (adminCache.has(userId)) return Promise.resolve(adminCache.get(userId)!);
  if (inflight.has(userId)) return inflight.get(userId)!;
  const p = (async () => {
    const { data, error } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    const ok = !error && data === true;
    adminCache.set(userId, ok);
    inflight.delete(userId);
    return ok;
  })();
  inflight.set(userId, p);
  return p;
}

export function clearAdminCache() {
  adminCache.clear();
  inflight.clear();
}

export function useIsAdmin() {
  const { user, loading: authLoading } = useAuthContext();
  // Modo espelho: força não-admin pra simular visão de usuário comum.
  const mirror = isViewAsActive();
  const cached = user ? adminCache.get(user.id) : undefined;
  const [isAdmin, setIsAdmin] = useState<boolean>(mirror ? false : (cached ?? false));
  const [loading, setLoading] = useState<boolean>(mirror ? false : (cached === undefined));

  useEffect(() => {
    const ac = new AbortController();
    if (authLoading) return;
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    const c = adminCache.get(user.id);
    if (c !== undefined) {
      setIsAdmin(c);
      setLoading(false);
      return;
    }
    setLoading(true);
    checkAdminCached(user.id).then((ok) => {
      if (ac.signal.aborted) return;
      setIsAdmin(ok);
      setLoading(false);
    });
    return () => ac.abort();
  }, [user, authLoading]);

  return { isAdmin, loading };
}
