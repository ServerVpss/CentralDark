// Edge function: ponte-mcp-oauth-github
// Fluxo OAuth do GitHub que registra automaticamente uma chave pk_ na Ponte MCP
// e (opcionalmente) injeta a sessão no MCP da VPS (porta 9100).
//
// Rotas:
//   GET ?action=start          → redireciona pro github.com/login/oauth/authorize
//   GET ?action=callback&code= → troca code por token, gera pk_, devolve HTML que
//                                manda postMessage pro opener e fecha o popup.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ----- helpers -----
function gerarChave() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let key = "pk_";
  for (let i = 0; i < 48; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function gerarState() {
  return crypto.randomUUID().replace(/-/g, "");
}

function htmlResposta(payload: Record<string, unknown>) {
  // HTML que o popup renderiza pra avisar o opener (painel) que terminou
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  return new Response(
    `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Conectado!</title>
<style>
  body{font-family:system-ui,sans-serif;background:#0a0f14;color:#e6f4ea;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
  .card{background:#0f1a14;border:1px solid #1f3a2a;border-radius:16px;padding:32px;max-width:420px;text-align:center;box-shadow:0 4px 20px rgba(0,0,0,.4)}
  h1{margin:0 0 8px;font-size:20px;color:#34d399}
  p{margin:6px 0 0;color:#94a3b8;font-size:14px}
  .ok{font-size:48px;margin-bottom:8px}
</style>
</head>
<body>
  <div class="card">
    <div class="ok">✅</div>
    <h1>Conectado!</h1>
    <p>Pode fechar essa janela. O painel já recebeu a chave.</p>
  </div>
  <script>
    try {
      var payload = ${json};
      if (window.opener) {
        window.opener.postMessage({ tipo: 'ponte-mcp-oauth', ...payload }, '*');
      }
      setTimeout(function(){ window.close(); }, 1500);
    } catch(e) { console.error(e); }
  </script>
</body>
</html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

function htmlErro(msg: string) {
  const safe = msg.replace(/</g, "&lt;");
  return new Response(
    `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Erro</title>
<style>body{font-family:system-ui,sans-serif;background:#1a0a0a;color:#fecaca;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}.card{background:#2a0e0e;border:1px solid #5a1f1f;border-radius:16px;padding:32px;max-width:480px;text-align:center}h1{color:#f87171;margin:0 0 8px}</style>
</head>
<body><div class="card"><div style="font-size:48px;margin-bottom:8px">⚠️</div><h1>Não deu certo</h1><p>${safe}</p><p style="font-size:12px;opacity:.7;margin-top:16px">Pode fechar essa janela e tentar de novo.</p></div>
<script>
  try { if (window.opener) window.opener.postMessage({ tipo: 'ponte-mcp-oauth', ok: false, erro: ${JSON.stringify(msg)} }, '*'); } catch(e){}
</script>
</body></html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

// Injeção opcional na VPS — falha em silêncio se MCP não tiver o endpoint
async function injetarNoMcpVps(chave: string, nomeAgente: string) {
  const url = Deno.env.get("MCP_SET_TOKEN_URL") || "https://mcp.centralldark.com/set-token";
  const adminToken = Deno.env.get("MCP_TOKEN") || Deno.env.get("MCP_CENTRALDARK_TOKEN");
  if (!adminToken) return { ok: false, motivo: "MCP_TOKEN ausente" };

  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ token: chave, agente: nomeAgente }),
      signal: AbortSignal.timeout(5000),
    });
    return { ok: r.ok, status: r.status };
  } catch (e) {
    return { ok: false, motivo: (e as Error).message };
  }
}

// ----- main -----
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  const CLIENT_ID = Deno.env.get("GITHUB_CLIENT_ID");
  const CLIENT_SECRET = Deno.env.get("GITHUB_CLIENT_SECRET");
  if (!CLIENT_ID || !CLIENT_SECRET) {
    return htmlErro("GITHUB_CLIENT_ID/SECRET não configurados nos secrets.");
  }

  // URL de callback = a própria edge function com ?action=callback
  const callbackUrl = `${url.origin}${url.pathname}?action=callback`;

  // ===== START =====
  if (action === "start" || !action) {
    const state = gerarState();
    const scope = "read:user";
    const ghUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${encodeURIComponent(CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${state}` +
      `&allow_signup=false`;

    // state vai em cookie httpOnly de 5 min pra validar no callback
    return new Response(null, {
      status: 302,
      headers: {
        Location: ghUrl,
        "Set-Cookie": `oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=300`,
      },
    });
  }

  // ===== CALLBACK =====
  if (action === "callback") {
    const code = url.searchParams.get("code");
    const stateRecebido = url.searchParams.get("state");
    const erroGh = url.searchParams.get("error");

    if (erroGh) return htmlErro(`GitHub recusou: ${erroGh}`);
    if (!code) return htmlErro("Faltou o code do GitHub.");

    // Valida state (anti-CSRF)
    const cookies = req.headers.get("cookie") || "";
    const stateCookie = cookies.split(";").map((c) => c.trim()).find((c) => c.startsWith("oauth_state="))?.split("=")[1];
    if (!stateCookie || stateCookie !== stateRecebido) {
      return htmlErro("State inválido (possível ataque CSRF). Tenta de novo.");
    }

    try {
      // 1) Troca code por access_token
      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          redirect_uri: callbackUrl,
        }),
      });
      const tokenJson = await tokenRes.json();
      if (!tokenJson.access_token) {
        return htmlErro(`GitHub não devolveu token: ${tokenJson.error_description || "erro desconhecido"}`);
      }

      // 2) Busca dados do usuário
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenJson.access_token}`,
          "User-Agent": "CentralDark-PonteMCP",
          Accept: "application/vnd.github+json",
        },
      });
      if (!userRes.ok) return htmlErro(`Não consegui ler /user (${userRes.status}).`);
      const ghUser = await userRes.json();

      // 3) Gera chave + grava no banco (com service role)
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );

      const chavePlena = gerarChave();
      const hash = await sha256(chavePlena);
      const prefixo = chavePlena.slice(0, 7) + "…" + chavePlena.slice(-4);
      const nomeAgente = `GitHub: @${ghUser.login}`;

      // Se já existe conexão ativa pro mesmo GitHub user, revoga antes
      await supabase
        .from("ponte_mcp_chaves")
        .update({ ativa: false, revogada_em: new Date().toISOString() })
        .eq("provider", "github")
        .eq("external_user_id", String(ghUser.id))
        .eq("ativa", true);

      const { data: chaveDb, error: insErr } = await supabase
        .from("ponte_mcp_chaves")
        .insert({
          nome_agente: nomeAgente,
          hash_chave: hash,
          prefixo,
          provider: "github",
          external_user_id: String(ghUser.id),
          external_username: ghUser.login,
          external_avatar_url: ghUser.avatar_url,
        })
        .select("id, prefixo, criada_em")
        .single();

      if (insErr) return htmlErro(`Falha ao salvar chave: ${insErr.message}`);

      // 4) Tenta injetar no MCP da VPS (silencioso se falhar)
      const injecao = await injetarNoMcpVps(chavePlena, nomeAgente);

      // 5) Responde HTML que avisa o opener
      return htmlResposta({
        ok: true,
        provider: "github",
        username: ghUser.login,
        avatar_url: ghUser.avatar_url,
        chave_plena: chavePlena,
        prefixo: chaveDb.prefixo,
        chave_id: chaveDb.id,
        injetado_na_vps: injecao.ok,
        injecao_motivo: injecao.ok ? null : injecao.motivo || `status ${injecao.status}`,
      });
    } catch (e) {
      console.error("[ponte-mcp-oauth-github] erro callback:", e);
      return htmlErro(`Erro interno: ${(e as Error).message}`);
    }
  }

  return htmlErro("Ação desconhecida. Use ?action=start ou ?action=callback.");
});
