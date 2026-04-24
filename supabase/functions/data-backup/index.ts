import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  console.log("[backup-manager] Request received:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      console.error("[backup-manager] Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = userData.user.id;

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "export";

    console.log(`[backup-manager] Action: ${action}, User: ${userId}`);

    if (req.method === "GET" && action === "export") {
      console.log(`[backup-manager] Exporting data for user ${userId}`);

      const [
        telegramBots,
        botSecuritySettings,
        subscriptionPlans,
        paymentGateways,
        paymentGatewaySettings,
        pixTransactions,
        pendingPayments,
        engagementMessages,
        profiles,
        queryHistory,
        botAnalytics,
        paymentHistory,
        telegramMessages,
      ] = await Promise.all([
        supabase.from("telegram_bots").select("*").eq("user_id", userId),
        supabase.from("bot_security_settings").select("*").eq("user_id", userId),
        supabase.from("subscription_plans").select("*").eq("user_id", userId),
        supabase.from("payment_gateways").select("*").eq("user_id", userId),
        supabase.from("payment_gateway_settings").select("*").eq("user_id", userId),
        supabase.from("pix_transactions").select("*").eq("user_id", userId),
        supabase.from("pending_payments").select("*").eq("user_id", userId),
        supabase.from("engagement_messages").select("*").eq("user_id", userId),
        supabase.from("profiles").select("*").eq("user_id", userId),
        supabase.from("query_history").select("*").eq("user_id", userId),
        supabase.from("bot_analytics").select("*").eq("user_id", userId),
        supabase.from("payment_history").select("*").eq("user_id", userId),
        supabase.from("telegram_messages").select("*").eq("user_id", userId),
      ]);

      const userBotIds = (telegramBots.data || []).map((b: any) => b.id);
      let filteredBotSettings: any[] = [];
      let filteredSubscriptions: any[] = [];
      
      if (userBotIds.length > 0) {
        const [bs, subs] = await Promise.all([
          supabase.from("bot_settings").select("*").in("bot_id", userBotIds),
          supabase.from("telegram_subscriptions").select("*").in("bot_id", userBotIds),
        ]);
        filteredBotSettings = bs.data || [];
        filteredSubscriptions = subs.data || [];
      }

      const tables = {
        telegram_bots: telegramBots.data || [],
        bot_settings: filteredBotSettings,
        bot_security_settings: botSecuritySettings.data || [],
        telegram_subscriptions: filteredSubscriptions,
        subscription_plans: subscriptionPlans.data || [],
        payment_gateways: paymentGateways.data || [],
        payment_gateway_settings: paymentGatewaySettings.data || [],
        pix_transactions: pixTransactions.data || [],
        pending_payments: pendingPayments.data || [],
        engagement_messages: engagementMessages.data || [],
        profiles: profiles.data || [],
        query_history: queryHistory.data || [],
        bot_analytics: botAnalytics.data || [],
        payment_history: paymentHistory.data || [],
        telegram_messages: telegramMessages.data || [],
      };

      const totalRecords = Object.values(tables).reduce(
        (sum, arr) => sum + arr.length,
        0
      );
      const tablesCount = Object.keys(tables).filter(
        (key) => tables[key as keyof typeof tables].length > 0
      ).length;

      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(tables));
      const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const checksum = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      const backup = {
        version: "1.0",
        created_at: new Date().toISOString(),
        user_id: userId,
        checksum,
        tables,
        metadata: {
          total_records: totalRecords,
          tables_count: tablesCount,
        },
      };

      console.log(`[backup-manager] Export complete: ${totalRecords} records from ${tablesCount} tables`);

      return new Response(JSON.stringify(backup), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "validate") {
      const body = await req.json();
      const backup = body.backup;

      if (!backup || !backup.version || !backup.tables || !backup.checksum) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: "Arquivo de backup inválido: estrutura incorreta",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(JSON.stringify(backup.tables));
      const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const newChecksum = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      if (backup.checksum !== newChecksum) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: "Checksum inválido: arquivo pode estar corrompido",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const preview = {
        valid: true,
        version: backup.version,
        created_at: backup.created_at,
        original_user_id: backup.user_id,
        metadata: backup.metadata,
        tables_summary: Object.entries(backup.tables).map(([name, data]) => ({
          name,
          records: (data as any[]).length,
        })),
      };

      return new Response(JSON.stringify(preview), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "restore") {
      const body = await req.json();
      const backup = body.backup;
      const mode = body.mode as "merge" | "replace";

      if (!backup || !backup.tables) {
        return new Response(
          JSON.stringify({ error: "Backup inválido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[backup-manager] Restoring data for user ${userId} in ${mode} mode`);

      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);

      const results: { table: string; inserted: number; errors: string[] }[] = [];

      const tableOrder = [
        "profiles",
        "telegram_bots",
        "bot_settings",
        "bot_security_settings",
        "subscription_plans",
        "payment_gateways",
        "payment_gateway_settings",
        "engagement_messages",
        "telegram_subscriptions",
        "pix_transactions",
        "pending_payments",
        "query_history",
        "bot_analytics",
        "payment_history",
        "telegram_messages",
      ];

      if (mode === "replace") {
        for (const tableName of [...tableOrder].reverse()) {
          try {
            if (tableName === "telegram_subscriptions" || tableName === "bot_settings") {
              const { data: bots } = await adminClient
                .from("telegram_bots")
                .select("id")
                .eq("user_id", userId);
              const botIds = (bots || []).map((b: any) => b.id);
              if (botIds.length > 0) {
                await adminClient.from(tableName).delete().in("bot_id", botIds);
              }
            } else {
              await adminClient.from(tableName).delete().eq("user_id", userId);
            }
          } catch (e) {
            console.error(`[backup-manager] Error deleting from ${tableName}:`, e);
          }
        }
      }

      for (const tableName of tableOrder) {
        const tableData = backup.tables[tableName] || [];
        if (tableData.length === 0) continue;

        const tableResult = { table: tableName, inserted: 0, errors: [] as string[] };

        for (const record of tableData) {
          try {
            const updatedRecord = { ...record };
            if ("user_id" in updatedRecord) {
              updatedRecord.user_id = userId;
            }
            if (tableName !== "profiles") {
              delete updatedRecord.id;
            }

            const { error } = await adminClient.from(tableName).upsert(updatedRecord, {
              onConflict: tableName === "profiles" ? "user_id" : undefined,
              ignoreDuplicates: mode === "merge",
            });

            if (error) {
              tableResult.errors.push(`${tableName}: ${error.message}`);
            } else {
              tableResult.inserted++;
            }
          } catch (e: any) {
            tableResult.errors.push(`${tableName}: ${e.message}`);
          }
        }

        results.push(tableResult);
      }

      const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
      const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

      console.log(`[backup-manager] Restore complete: ${totalInserted} inserted, ${totalErrors} errors`);

      return new Response(
        JSON.stringify({
          success: true,
          message: `Restauração concluída: ${totalInserted} registros importados`,
          results,
          total_inserted: totalInserted,
          total_errors: totalErrors,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Método ou ação não suportada" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[backup-manager] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
