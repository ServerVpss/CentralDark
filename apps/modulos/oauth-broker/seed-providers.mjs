import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import fs from "node:fs";
const d = (await import("dotenv")).default;
d.config({ path: "/root/CentralDark/apps/modulos/oauth-broker/.env" });

const sb = createClient(process.env.HUB_SUPABASE_URL, process.env.HUB_SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const providers = [
  { id: "claude", display_name: "Claude (Anthropic)", color: "#d97706", icon: "C", scopes: "messages", auth_type: "api_key", tier: 1, enabled: true },
  { id: "groq",   display_name: "Groq",               color: "#f55036", icon: "Gq", scopes: "chat.completions", auth_type: "api_key", tier: 1, enabled: true },
];

for (const p of providers) {
  const { error } = await sb.from("oauth_providers").upsert(p, { onConflict: "id" });
  console.log(`  ${p.id} →`, error ? "❌ " + error.message : "✅ ok");
}

const { data } = await sb.from("oauth_providers").select("id, display_name, enabled").order("display_name");
console.log("\n=== Catálogo final ===");
data?.forEach(r => console.log(`  ${r.enabled ? "🟢" : "⚫"} ${r.id} · ${r.display_name}`));
