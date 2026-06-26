// Hook que conversa com a edge function `admin-users`
// Usa fetch direto como fallback (adblocker costuma bloquear functions.invoke).
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AdminUser {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "admin" | "user";
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
  avatar_url: string | null;
}

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function call(action: string, payload: Record<string, unknown> = {}) {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("Sessão expirada — faça login novamente.");

  // 1) Tenta invoke padrão
  try {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action, ...payload },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  } catch (primaryErr) {
    // 2) Fallback: fetch direto (bypass adblocker/CORS quirks)
    try {
      const res = await fetch(FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: ANON,
        },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.error) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      return data;
    } catch (fallbackErr) {
      throw new Error((fallbackErr as Error).message || (primaryErr as Error).message);
    }
  }
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await call("list");
      setUsers((data?.users ?? []) as AdminUser[]);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      toast.error("Erro ao carregar usuários: " + msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const wrap = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      toast.success(label);
      await fetchUsers();
      return true;
    } catch (e) {
      toast.error(label + " falhou: " + (e as Error).message);
      return false;
    }
  };

  return {
    users,
    loading,
    error,
    refresh: fetchUsers,
    createUser: (p: { email: string; password: string; full_name: string; role: "admin" | "user" }) =>
      wrap("Usuário criado", () => call("create", p)),
    updatePassword: (user_id: string, password: string) =>
      wrap("Senha atualizada", () => call("update_password", { user_id, password })),
    sendReset: (email: string) =>
      wrap("E-mail de reset enviado", () => call("send_reset", { email })),
    setRole: (user_id: string, role: "admin" | "user") =>
      wrap("Papel atualizado", () => call("set_role", { user_id, role })),
    confirmEmail: (user_id: string) =>
      wrap("E-mail confirmado", () => call("confirm_email", { user_id })),
    ban: (user_id: string) =>
      wrap("Usuário bloqueado", () => call("ban", { user_id })),
    unban: (user_id: string) =>
      wrap("Usuário desbloqueado", () => call("unban", { user_id })),
    remove: (user_id: string) =>
      wrap("Usuário excluído", () => call("delete", { user_id })),
  };
}

// Busca o perfil 360 de um usuário específico (não usa o estado da lista).
export async function fetchUserDetail(user_id: string) {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  if (!token) throw new Error("Sessão expirada.");
  try {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "get_detail", user_id },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  } catch (e1) {
    const res = await fetch(FN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: ANON,
      },
      body: JSON.stringify({ action: "get_detail", user_id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) throw new Error(data?.error || `HTTP ${res.status}`);
    return data;
  }
}
