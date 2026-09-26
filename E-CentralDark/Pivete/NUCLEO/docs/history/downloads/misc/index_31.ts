import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ponte-chave",
};

function res(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  const chave = req.headers.get("x-ponte-chave");
  if (!chave) return res(401, { erro: "Falta o header x-ponte-chave" });

  try {
    const supabase = createClient(
      Deno.env.get("HUB_SUPABASE_URL")!,
      Deno.env.get("HUB_SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Gera hash SHA-256 da chave recebida
    const encoder = new TextEncoder();
    const data = encoder.encode(chave);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    // Busca a chave no banco
    const { data: registro, error: errBusca } = await supabase
      .from("ponte_mcp_chaves")
      .select("id, ativa, usos, nome_agente")
      .eq("hash_chave", hashHex)
      .single();

    if (errBusca || !registro) return res(403, { erro: "Chave inválida ou não encontrada" });
    if (!registro.ativa) return res(403, { erro: "Chave revogada" });

    // Incrementa contador de uso
    await supabase
      .from("ponte_mcp_chaves")
      .update({ usos: registro.usos + 1, ultimo_uso_at: new Date().toISOString() })
      .eq("id", registro.id);

    // Pega a sessão mestre do MCP CentralDark (OAuth session de 12h)
    const sessionMestre = Deno.env.get("CENTRALDARK_MCP_SESSION") || Deno.env.get("CENTRALDARK_MCP_TOKEN") || Deno.env.get("MCP_CENTRALDARK_TOKEN");
    if (!sessionMestre) return res(500, { erro: "Sessão mestre não configurada no servidor (CENTRALDARK_MCP_SESSION)" });

    // Lê o corpo original
    let body;
    try {
      body = await req.text();
    } catch {
      body = "";
    }

    // Encaminha para o MCP CentralDark usando os DOIS esquemas de auth (cobre Bearer e x-mcp-session)
    const mcpUrl = Deno.env.get("MCP_CENTRALDARK_URL") || "https://mcp.centralldark.com/mcp";
    const mcpRes = await fetch(mcpUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Authorization": `Bearer ${sessionMestre}`,
        "x-mcp-session": sessionMestre,
        "X-Ponte-Agente": registro.nome_agente,
        "X-Ponte-Origem": "supabase-edge",
      },
      body: body || JSON.stringify({}),
    });

    const mcpBody = await mcpRes.text();

    return new Response(mcpBody, {
      status: mcpRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[ponte-mcp] erro:", e);
    return res(500, { erro: "Erro interno na ponte", detalhe: e.message });
  }
});
rs.map((u) => ({
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
