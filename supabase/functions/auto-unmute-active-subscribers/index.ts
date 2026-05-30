// Verifica a cada minuto quem tem plano ativo mas está mutado no grupo, e desmuta automaticamente
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_API = "https://api.telegram.org/bot";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const stats = {
    bots_processed: 0,
    active_checked: 0,
    already_ok: 0,
    unmuted: 0,
    not_in_group: 0,
    errors: 0,
    details: [] as any[],
  };

  try {
    // Pega todos os bots com grupo configurado
    const { data: bots, error: botsErr } = await supabase
      .from("telegram_bots")
      .select("id, token, bot_settings:bot_settings(group_chat_id)")
      .eq("is_active", true);

    if (botsErr) throw botsErr;

    for (const bot of bots ?? []) {
      const settings = Array.isArray((bot as any).bot_settings)
        ? (bot as any).bot_settings[0]
        : (bot as any).bot_settings;
      const groupChatId = settings?.group_chat_id;
      if (!groupChatId || !bot.token) continue;

      stats.bots_processed++;

      // Pega assinaturas ativas do grupo desse bot
      const { data: subs, error: subsErr } = await supabase
        .from("telegram_subscriptions")
        .select("telegram_user_id, username, first_name, expires_at")
        .eq("bot_id", bot.id)
        .eq("status", "active")
        .eq("context", "group")
        .gt("expires_at", new Date().toISOString());

      if (subsErr) {
        stats.errors++;
        stats.details.push({ bot_id: bot.id, erro: subsErr.message });
        continue;
      }

      // Remove duplicados (mesmo user_id)
      const uniqueUsers = new Map<number, any>();
      for (const s of subs ?? []) {
        if (!uniqueUsers.has(Number(s.telegram_user_id))) {
          uniqueUsers.set(Number(s.telegram_user_id), s);
        }
      }

      for (const [userId, sub] of uniqueUsers) {
        stats.active_checked++;
        try {
          // Verifica status do membro
          const memberResp = await fetch(
            `${TELEGRAM_API}${bot.token}/getChatMember?chat_id=${groupChatId}&user_id=${userId}`,
          );
          const memberData = await memberResp.json();

          if (!memberData.ok) {
            // Não é membro do grupo ou erro — pula
            stats.not_in_group++;
            continue;
          }

          const status = memberData.result?.status;
          const canSend = memberData.result?.can_send_messages !== false;

          // Se está mutado (restricted sem permissão de enviar mensagem), desmuta
          if (status === "restricted" && !canSend) {
            const unmuteResp = await fetch(
              `${TELEGRAM_API}${bot.token}/restrictChatMember`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: groupChatId,
                  user_id: userId,
                  permissions: {
                    can_send_messages: true,
                    can_send_audios: true,
                    can_send_documents: true,
                    can_send_photos: true,
                    can_send_videos: true,
                    can_send_video_notes: true,
                    can_send_voice_notes: true,
                    can_send_polls: true,
                    can_send_other_messages: true,
                    can_add_web_page_previews: true,
                  },
                }),
              },
            );
            const unmuteData = await unmuteResp.json();
            if (unmuteData.ok) {
              stats.unmuted++;
              stats.details.push({
                acao: "desmutado",
                telegram_user_id: userId,
                username: sub.username,
                first_name: sub.first_name,
              });
              console.log(
                `[auto-unmute] Desmutado: ${userId} (@${sub.username ?? "?"})`,
              );
            } else {
              stats.errors++;
              stats.details.push({
                telegram_user_id: userId,
                erro: unmuteData.description,
              });
            }
          } else {
            stats.already_ok++;
          }
        } catch (e: any) {
          stats.errors++;
          stats.details.push({
            telegram_user_id: userId,
            erro: String(e?.message ?? e),
          });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, stats }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[auto-unmute] erro geral:", err);
    return new Response(
      JSON.stringify({ ok: false, erro: String(err?.message ?? err), stats }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
