// Callback público do OAuth GitHub — troca o code por access_token
// e salva na linha singleton de github_integrations.
import { createFileRoute } from "@tanstack/react-router";
import { getCookie, deleteCookie } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function htmlRedirect(to: string, message: string) {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><title>GitHub</title>
<meta http-equiv="refresh" content="1;url=${to}">
<style>body{font-family:system-ui;background:#0a0a0a;color:#fafafa;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}div{text-align:center}</style>
</head><body><div><h2>${message}</h2><p>Redirecionando…</p></div></body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

export const Route = createFileRoute("/api/public/github/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const errorParam = url.searchParams.get("error_description") || url.searchParams.get("error");

        const back = "/admin/integracao?tab=github";

        if (errorParam) {
          return htmlRedirect(`${back}&github=error&msg=${encodeURIComponent(errorParam)}`, "Falhou no GitHub");
        }
        if (!code || !state) {
          return htmlRedirect(`${back}&github=error&msg=missing_code`, "Parâmetros faltando");
        }

        const cookieVal = getCookie("gh_oauth_state");
        if (!cookieVal) {
          return htmlRedirect(`${back}&github=error&msg=expired`, "Sessão expirou");
        }
        const [savedState, userId] = cookieVal.split("::");
        if (savedState !== state || !userId) {
          return htmlRedirect(`${back}&github=error&msg=state_mismatch`, "State inválido");
        }
        deleteCookie("gh_oauth_state", { path: "/" });

        // valida que ainda é super admin
        const { data: isAdmin } = await supabaseAdmin.rpc("is_super_admin", { _user_id: userId });
        if (!isAdmin) {
          return htmlRedirect(`${back}&github=error&msg=forbidden`, "Acesso negado");
        }

        // troca code por access_token
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
            client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
            code,
          }),
        });
        const tokenJson = (await tokenRes.json()) as {
          access_token?: string;
          error?: string;
          error_description?: string;
        };
        if (!tokenJson.access_token) {
          const msg = tokenJson.error_description || tokenJson.error || "no_token";
          return htmlRedirect(`${back}&github=error&msg=${encodeURIComponent(msg)}`, "Falha ao trocar token");
        }

        // valida e pega user
        const userRes = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${tokenJson.access_token}`,
            Accept: "application/vnd.github+json",
            "User-Agent": "MultiZap-Master/1.0",
          },
        });
        if (!userRes.ok) {
          return htmlRedirect(`${back}&github=error&msg=user_fetch`, "Token inválido");
        }
        const ghUser = (await userRes.json()) as { login: string; id: number };

        // upsert singleton
        const { data: existing } = await supabaseAdmin
          .from("github_integrations")
          .select("id")
          .limit(1)
          .maybeSingle();

        const payload = {
          auth_type: "app" as const,
          access_token: tokenJson.access_token,
          status: "connected" as const,
          connected_by: userId,
          connected_at: new Date().toISOString(),
          last_error: null,
          permissions: { user: ghUser.login, via: "oauth" },
        };

        if (existing) {
          await supabaseAdmin.from("github_integrations").update(payload).eq("id", existing.id);
        } else {
          await supabaseAdmin.from("github_integrations").insert(payload);
        }

        await supabaseAdmin.from("github_integration_logs").insert({
          actor_user_id: userId,
          action: "oauth_connect",
          status: "ok",
          message: `Conectado via OAuth como ${ghUser.login}`,
          payload: { gh_login: ghUser.login },
        });

        return htmlRedirect(`${back}&github=ok&user=${encodeURIComponent(ghUser.login)}`, `Conectado como @${ghUser.login}`);
      },
    },
  },
});
