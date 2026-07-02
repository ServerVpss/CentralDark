// Edge function: admin-users
// Gestão completa de usuários do painel (só admins).
// Ações: list, create, update_password, send_reset, set_role, confirm_email, ban, unban, delete
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("HUB_SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("HUB_SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("HUB_SUPABASE_ANON_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "missing_auth" }, 401);

    // Cliente que valida o JWT do chamador
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) return json({ error: "invalid_token" }, 401);

    const callerId = userData.user.id;

    // Cliente admin (service role)
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Confirma que quem chama é admin
    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });
    if (roleErr || !isAdmin) return json({ error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? "");

    // Log de auditoria
    const logAudit = async (action: string, target: string | null, meta: Record<string, unknown>) => {
      try {
        await admin.from("audit_logs").insert({
          user_id: callerId,
          action,
          entity_type: "auth_user",
          entity_id: target,
          details: { ...meta, actor_email: userData.user.email ?? null },
        });
      } catch (_) { /* log opcional */ }
    };

    switch (action) {
      case "list": {
        // Lista todos via Admin API (até 1000 — suficiente)
        const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (error) return json({ error: error.message }, 500);

        const ids = data.users.map((u) => u.id);
        const [{ data: profiles }, { data: roles }] = await Promise.all([
          admin.from("profiles").select("user_id, full_name, avatar_url").in("user_id", ids),
          admin.from("user_roles").select("user_id, role").in("user_id", ids),
        ]);
        const pMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
        const rMap = new Map<string, string>();
        (roles ?? []).forEach((r: any) => {
          // se já tem admin, mantém admin (prioridade)
          if (rMap.get(r.user_id) === "admin") return;
          rMap.set(r.user_id, r.role);
        });

        const users = data.users.map((u) => ({
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          last_sign_in_at: u.last_sign_in_at,
          email_confirmed_at: u.email_confirmed_at,
          banned_until: (u as any).banned_until ?? null,
          full_name: pMap.get(u.id)?.full_name ?? null,
          avatar_url: pMap.get(u.id)?.avatar_url ?? null,
          role: rMap.get(u.id) ?? "user",
        }));
        return json({ users });
      }

      case "create": {
        const email = String(body.email ?? "").trim();
        const password = String(body.password ?? "");
        const full_name = String(body.full_name ?? "").trim();
        const role = body.role === "admin" ? "admin" : "user";
        if (!email || password.length < 6) return json({ error: "invalid_input" }, 400);

        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name },
        });
        if (error) return json({ error: error.message }, 400);

        // trigger handle_new_user já cria profile + role 'user'.
        // Se o admin escolheu admin, sobe pra admin:
        if (role === "admin" && data.user) {
          await admin.from("user_roles").delete().eq("user_id", data.user.id);
          await admin.from("user_roles").insert({ user_id: data.user.id, role: "admin" });
        }
        await logAudit("user_created", data.user?.id ?? null, { email, role });
        return json({ ok: true, user_id: data.user?.id });
      }

      case "update_password": {
        const target = String(body.user_id ?? "");
        const password = String(body.password ?? "");
        if (!target || password.length < 6) return json({ error: "invalid_input" }, 400);
        const { error } = await admin.auth.admin.updateUserById(target, { password });
        if (error) return json({ error: error.message }, 400);
        await logAudit("password_updated", target, {});
        return json({ ok: true });
      }

      case "send_reset": {
        const email = String(body.email ?? "").trim();
        if (!email) return json({ error: "invalid_input" }, 400);
        const { error } = await admin.auth.resetPasswordForEmail(email);
        if (error) return json({ error: error.message }, 400);
        await logAudit("password_reset_sent", null, { email });
        return json({ ok: true });
      }

      case "set_role": {
        const target = String(body.user_id ?? "");
        const newRole = body.role === "admin" ? "admin" : "user";
        if (!target) return json({ error: "invalid_input" }, 400);
        // Proteção: admin não pode rebaixar a si mesmo
        if (target === callerId && newRole !== "admin") {
          return json({ error: "cannot_demote_self" }, 400);
        }
        await admin.from("user_roles").delete().eq("user_id", target);
        const { error } = await admin.from("user_roles").insert({ user_id: target, role: newRole });
        if (error) return json({ error: error.message }, 400);
        await logAudit("role_changed", target, { role: newRole });
        return json({ ok: true });
      }

      case "confirm_email": {
        const target = String(body.user_id ?? "");
        if (!target) return json({ error: "invalid_input" }, 400);
        const { error } = await admin.auth.admin.updateUserById(target, { email_confirm: true });
        if (error) return json({ error: error.message }, 400);
        await logAudit("email_confirmed", target, {});
        return json({ ok: true });
      }

      case "ban": {
        const target = String(body.user_id ?? "");
        const hours = Number(body.hours ?? 24 * 365 * 10); // ~10 anos = bloqueio permanente
        if (!target) return json({ error: "invalid_input" }, 400);
        if (target === callerId) return json({ error: "cannot_ban_self" }, 400);
        const { error } = await admin.auth.admin.updateUserById(target, {
          ban_duration: `${hours}h`,
        } as any);
        if (error) return json({ error: error.message }, 400);
        await logAudit("user_banned", target, { hours });
        return json({ ok: true });
      }

      case "unban": {
        const target = String(body.user_id ?? "");
        if (!target) return json({ error: "invalid_input" }, 400);
        const { error } = await admin.auth.admin.updateUserById(target, {
          ban_duration: "none",
        } as any);
        if (error) return json({ error: error.message }, 400);
        await logAudit("user_unbanned", target, {});
        return json({ ok: true });
      }

      case "delete": {
        const target = String(body.user_id ?? "");
        if (!target) return json({ error: "invalid_input" }, 400);
        if (target === callerId) return json({ error: "cannot_delete_self" }, 400);
        const { error } = await admin.auth.admin.deleteUser(target);
        if (error) return json({ error: error.message }, 400);
        await logAudit("user_deleted", target, {});
        return json({ ok: true });
      }

      case "get_detail": {
        const target = String(body.user_id ?? "");
        if (!target) return json({ error: "invalid_input" }, 400);
        const { data: u, error: uErr } = await admin.auth.admin.getUserById(target);
        if (uErr || !u?.user) return json({ error: uErr?.message ?? "not_found" }, 404);

        const [{ data: profile }, { data: roles }, { data: audit }] = await Promise.all([
          admin.from("profiles").select("*").eq("user_id", target).maybeSingle(),
          admin.from("user_roles").select("role").eq("user_id", target),
          admin.from("audit_logs").select("id, action, entity_type, entity_id, details, created_at")
            .or(`user_id.eq.${target},entity_id.eq.${target}`)
            .order("created_at", { ascending: false }).limit(50),
        ]);

        const role = (roles ?? []).some((r: any) => r.role === "admin") ? "admin" : "user";

        return json({
          user: {
            id: u.user.id,
            email: u.user.email,
            phone: u.user.phone,
            created_at: u.user.created_at,
            last_sign_in_at: u.user.last_sign_in_at,
            email_confirmed_at: u.user.email_confirmed_at,
            banned_until: (u.user as any).banned_until ?? null,
            app_metadata: u.user.app_metadata,
            user_metadata: u.user.user_metadata,
            identities: u.user.identities,
            role,
          },
          profile: profile ?? null,
          audit: audit ?? [],
        });
      }

      default:
        return json({ error: "unknown_action" }, 400);
    }
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
