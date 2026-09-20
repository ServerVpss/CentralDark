import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TELEGRAM_API = "https://api.telegram.org/bot";
const MAX_BATCH = 20;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("HUB_SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("HUB_SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch pending messages ready for retry
    const { data: pendingMessages, error: fetchError } = await supabase
      .from("telegram_message_queue")
      .select("*, telegram_bots!telegram_message_queue_bot_id_fkey(token)")
      .eq("status", "pending")
      .lte("retry_after", new Date().toISOString())
      .order("created_at", { ascending: true })
      .limit(MAX_BATCH);

    if (fetchError) {
      console.error("[RETRY-QUEUE] Fetch error:", fetchError);
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!pendingMessages || pendingMessages.length === 0) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[RETRY-QUEUE] Processing ${pendingMessages.length} queued messages`);

    let successCount = 0;
    let failedCount = 0;
    let requeuedCount = 0;

    for (const msg of pendingMessages) {
      // Mark as processing
      await supabase
        .from("telegram_message_queue")
        .update({ status: "processing", updated_at: new Date().toISOString() })
        .eq("id", msg.id);

      // Get bot token
      const botToken = msg.telegram_bots?.token;
      if (!botToken) {
        // Try to find token from payload hash
        if (!msg.bot_id) {
          await supabase
            .from("telegram_message_queue")
            .update({ status: "failed", error_message: "No bot token found", updated_at: new Date().toISOString() })
            .eq("id", msg.id);
          failedCount++;
          continue;
        }

        const { data: bot } = await supabase
          .from("telegram_bots")
          .select("token")
          .eq("id", msg.bot_id)
          .maybeSingle();

        if (!bot?.token) {
          await supabase
            .from("telegram_message_queue")
            .update({ status: "failed", error_message: "Bot not found", updated_at: new Date().toISOString() })
            .eq("id", msg.id);
          failedCount++;
          continue;
        }

        // Use found token
        await processMessage(supabase, msg, bot.token);
      } else {
        await processMessage(supabase, msg, botToken);
      }
    }

    async function processMessage(supabase: any, msg: any, token: string) {
      const url = `${TELEGRAM_API}${token}/${msg.method}`;
      const body = msg.payload?.body || {};

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await response.json();

        if (response.status === 429) {
          // Still rate limited
          const retryAfterSec = data?.parameters?.retry_after || 10;
          const newRetryCount = (msg.retry_count || 0) + 1;

          if (newRetryCount >= (msg.max_retries || 5)) {
            await supabase
              .from("telegram_message_queue")
              .update({
                status: "failed",
                retry_count: newRetryCount,
                error_message: `Max retries reached (429). Last retry_after: ${retryAfterSec}s`,
                updated_at: new Date().toISOString(),
              })
              .eq("id", msg.id);
            failedCount++;
            console.log(`[RETRY-QUEUE] Message ${msg.id} failed after ${newRetryCount} retries`);
          } else {
            // Exponential backoff: retry_after * 2^retry_count
            const backoffSec = retryAfterSec * Math.pow(2, newRetryCount - 1);
            const nextRetry = new Date(Date.now() + backoffSec * 1000).toISOString();

            await supabase
              .from("telegram_message_queue")
              .update({
                status: "pending",
                retry_count: newRetryCount,
                retry_after: nextRetry,
                error_message: `429 - retry #${newRetryCount}, next in ${backoffSec}s`,
                updated_at: new Date().toISOString(),
              })
              .eq("id", msg.id);
            requeuedCount++;
            console.log(`[RETRY-QUEUE] Message ${msg.id} requeued, retry #${newRetryCount} in ${backoffSec}s`);
          }
          return;
        }

        if (data.ok) {
          await supabase
            .from("telegram_message_queue")
            .update({
              status: "done",
              updated_at: new Date().toISOString(),
            })
            .eq("id", msg.id);
          successCount++;
          console.log(`[RETRY-QUEUE] Message ${msg.id} sent successfully`);
        } else {
          // Non-429 error
          const newRetryCount = (msg.retry_count || 0) + 1;
          if (newRetryCount >= (msg.max_retries || 5)) {
            await supabase
              .from("telegram_message_queue")
              .update({
                status: "failed",
                retry_count: newRetryCount,
                error_message: `API error: ${data.description || "Unknown"}`,
                updated_at: new Date().toISOString(),
              })
              .eq("id", msg.id);
            failedCount++;
          } else {
            const backoffSec = 10 * Math.pow(2, newRetryCount - 1);
            const nextRetry = new Date(Date.now() + backoffSec * 1000).toISOString();
            await supabase
              .from("telegram_message_queue")
              .update({
                status: "pending",
                retry_count: newRetryCount,
                retry_after: nextRetry,
                error_message: `Error: ${data.description || "Unknown"}`,
                updated_at: new Date().toISOString(),
              })
              .eq("id", msg.id);
            requeuedCount++;
          }
        }
      } catch (e) {
        const newRetryCount = (msg.retry_count || 0) + 1;
        await supabase
          .from("telegram_message_queue")
          .update({
            status: newRetryCount >= (msg.max_retries || 5) ? "failed" : "pending",
            retry_count: newRetryCount,
            retry_after: new Date(Date.now() + 30000).toISOString(),
            error_message: `Fetch error: ${(e as Error).message}`,
            updated_at: new Date().toISOString(),
          })
          .eq("id", msg.id);
        if (newRetryCount >= (msg.max_retries || 5)) failedCount++;
        else requeuedCount++;
      }
    }

    // Cleanup old done/failed messages (older than 24h)
    await supabase
      .from("telegram_message_queue")
      .delete()
      .in("status", ["done", "failed"])
      .lt("updated_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const result = {
      ok: true,
      processed: pendingMessages.length,
      success: successCount,
      failed: failedCount,
      requeued: requeuedCount,
    };

    console.log(`[RETRY-QUEUE] Done:`, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[RETRY-QUEUE] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
