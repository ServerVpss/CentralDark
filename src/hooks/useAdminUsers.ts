// Hook que conversa com a edge function `admin-users`
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

async function call(action: string, payload: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action, ...payload },
  });
  if (error) throw new Error(error.message);
  if (data?.error) throw new Error(data.error);
  return data;
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
