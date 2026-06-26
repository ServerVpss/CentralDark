// Cofre criptografado: AES-256-GCM com chave-mestra em VAULT_MASTER_KEY
// Ações: put | get | list | delete
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MASTER = Deno.env.get("VAULT_MASTER_KEY")!;

function b64(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = ""; for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}
function unb64(s: string) {
  const bin = atob(s); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(): Promise<CryptoKey> {
  // Deriva chave de 256 bits via SHA-256 da master
  const raw = new TextEncoder().encode(MASTER);
  const hash = await crypto.subtle.digest("SHA-256", raw);
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function encrypt(plain: string) {
  const key = await deriveKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain));
  // GCM já inclui tag nos últimos 16 bytes — separamos para clareza
  const ctBytes = new Uint8Array(ct);
  const body = ctBytes.slice(0, ctBytes.length - 16);
  const tag = ctBytes.slice(ctBytes.length - 16);
  return { ciphertext: b64(body), iv: b64(iv), auth_tag: b64(tag) };
}

async function decrypt(ciphertext: string, iv: string, tag: string) {
  const key = await deriveKey();
  const body = unb64(ciphertext); const tagBytes = unb64(tag);
  const combined = new Uint8Array(body.length + tagBytes.length);
  combined.set(body, 0); combined.set(tagBytes, body.length);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(iv) }, key, combined);
  return new TextDecoder().decode(plain);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Sem autorização" }, 401);

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Token inválido" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: isAdmin } = await admin.rpc("has_role", { _user_id: userData.user.id, _role: "admin" });
    if (!isAdmin) return json({ error: "Apenas administradores" }, 403);

    const { action, name, kind, description, value } = await req.json();

    if (action === "put") {
      if (!name || !value) return json({ error: "name e value obrigatórios" }, 400);
      const enc = await encrypt(String(value));
      const { error } = await admin.from("vault_secrets").upsert({
        name, kind: kind || "generic", description: description || null,
        ciphertext: enc.ciphertext, iv: enc.iv, auth_tag: enc.auth_tag,
        created_by: userData.user.id,
      }, { onConflict: "name" });
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true, name });
    }

    if (action === "get") {
      if (!name) return json({ error: "name obrigatório" }, 400);
      const { data, error } = await admin.from("vault_secrets")
        .select("name,kind,description,ciphertext,iv,auth_tag").eq("name", name).maybeSingle();
      if (error || !data) return json({ error: "Não encontrado" }, 404);
      const plain = await decrypt(data.ciphertext, data.iv, data.auth_tag);
      return json({ name: data.name, kind: data.kind, description: data.description, value: plain });
    }

    if (action === "list") {
      const { data, error } = await admin.from("vault_secrets")
        .select("id,name,kind,description,created_at,updated_at").order("name");
      if (error) return json({ error: error.message }, 500);
      return json({ items: data });
    }

    if (action === "delete") {
      if (!name) return json({ error: "name obrigatório" }, 400);
      const { error } = await admin.from("vault_secrets").delete().eq("name", name);
      if (error) return json({ error: error.message }, 500);
      return json({ ok: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (e) {
    return json({ error: String(e?.message || e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
