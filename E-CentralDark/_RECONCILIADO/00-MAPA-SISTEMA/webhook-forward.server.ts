import { createHmac } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Reenvia (fire-and-forget) o payload bruto do webhook da Meta para todos os
 * destinos configurados em `webhook_forward_targets` que casam com o
 * phone_number_id do evento (ou que estão configurados como "todos").
 *
 * - Não trava a resposta pra Meta — usa Promise.allSettled.
 * - Adiciona headers úteis pro destino identificar a origem.
 * - Se houver `secret`, assina o body com HMAC-SHA256 em x-forward-signature.
 * - Atualiza contadores e last_error em cada target.
 */
export async function forwardWebhookEvent(opts: {
  connectionId: string;
  phoneNumberId: string | null;
  rawBody: string;
  metaSignature: string | null;
}) {
  try {
    const { data: targets } = await supabaseAdmin
      .from("webhook_forward_targets" as never)
      .select("*")
      .eq("active", true);

    type Target = {
      id: string;
      name: string;
      phone_number_id: string | null;
      target_url: string;
      secret: string | null;
    };
    const list = ((targets ?? []) as Target[]).filter(
      (t) =>
        !t.phone_number_id ||
        (opts.phoneNumberId && t.phone_number_id === opts.phoneNumberId),
    );
    if (list.length === 0) return;

    await Promise.allSettled(
      list.map(async (t) => {
        const headers: Record<string, string> = {
          "content-type": "application/json",
          "x-forwarded-from": "multizap",
          "x-forwarded-connection-id": opts.connectionId,
        };
        if (opts.phoneNumberId) headers["x-forwarded-phone-number-id"] = opts.phoneNumberId;
        if (opts.metaSignature) headers["x-original-meta-signature"] = opts.metaSignature;
        if (t.secret) {
          headers["x-forward-signature"] =
            "sha256=" + createHmac("sha256", t.secret).update(opts.rawBody).digest("hex");
        }
        try {
          const res = await fetch(t.target_url, {
            method: "POST",
            headers,
            body: opts.rawBody,
          });
          if (!res.ok) {
            const txt = (await res.text().catch(() => "")).slice(0, 500);
            await supabaseAdmin
              .from("webhook_forward_targets" as never)
              .update({
                error_count: undefined,
                last_error: `HTTP ${res.status}: ${txt}`,
                last_error_at: new Date().toISOString(),
              } as never)
              .eq("id", t.id);
            const { data: cur } = await supabaseAdmin
              .from("webhook_forward_targets" as never)
              .select("error_count")
              .eq("id", t.id)
              .maybeSingle();
            const ec = ((cur as { error_count?: number } | null)?.error_count ?? 0) + 1;
            await supabaseAdmin
              .from("webhook_forward_targets" as never)
              .update({ error_count: ec } as never)
              .eq("id", t.id);
          } else {
            const { data: cur } = await supabaseAdmin
              .from("webhook_forward_targets" as never)
              .select("forward_count")
              .eq("id", t.id)
              .maybeSingle();
            const fc = ((cur as { forward_count?: number } | null)?.forward_count ?? 0) + 1;
            await supabaseAdmin
              .from("webhook_forward_targets" as never)
              .update({
                forward_count: fc,
                last_forward_at: new Date().toISOString(),
                last_error: null,
              } as never)
              .eq("id", t.id);
          }
        } catch (e) {
          const { data: cur } = await supabaseAdmin
            .from("webhook_forward_targets" as never)
            .select("error_count")
            .eq("id", t.id)
            .maybeSingle();
          const ec = ((cur as { error_count?: number } | null)?.error_count ?? 0) + 1;
          await supabaseAdmin
            .from("webhook_forward_targets" as never)
            .update({
              error_count: ec,
              last_error: String(e).slice(0, 500),
              last_error_at: new Date().toISOString(),
            } as never)
            .eq("id", t.id);
        }
      }),
    );
  } catch {
    // never break the webhook on forward errors
  }
}
