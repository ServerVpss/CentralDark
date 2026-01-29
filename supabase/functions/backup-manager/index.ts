import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BackupData {
  version: string;
  created_at: string;
  user_id: string;
  checksum: string;
  tables: {
    telegram_bots: any[];
    bot_settings: any[];
    bot_security_settings: any[];
    telegram_subscriptions: any[];
    subscription_plans: any[];
    payment_gateways: any[];
    payment_gateway_settings: any[];
    pix_transactions: any[];
    pending_payments: any[];
    engagement_messages: any[];
    profiles: any[];
    query_history: any[];
    bot_analytics: any[];
    payment_history: any[];
    telegram_messages: any[];
  };
  metadata: {
    total_records: number;
    tables_count: number;
  };
}

// Simple hash function for checksum
async function generateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyChecksum(backup: BackupData): Promise<boolean> {
  const originalChecksum = backup.checksum;
  const dataWithoutChecksum = { ...backup, checksum: "" };
  const newChecksum = await generateChecksum(JSON.stringify(dataWithoutChecksum.tables));
  return originalChecksum === newChecksum;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const userId = claimsData.claims.sub as string;

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "export";

    // EXPORT: Get all user data
    if (req.method === "GET" && action === "export") {
      console.log(`[backup-manager] Exporting data for user ${userId}`);

      // Fetch all tables in parallel
      const [
        telegramBots,
        botSettings,
        botSecuritySettings,
        telegramSubscriptions,
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
        supabase.from("bot_settings").select("*"),
        supabase.from("bot_security_settings").select("*").eq("user_id", userId),
        supabase.from("telegram_subscriptions").select("*"),
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

      // Get bot_settings filtered by user's bots
      const userBotIds = (telegramBots.data || []).map((b) => b.id);
      let filteredBotSettings: any[] = [];
      if (userBotIds.length > 0) {
        const { data: bs } = await supabase
          .from("bot_settings")
          .select("*")
          .in("bot_id", userBotIds);
        filteredBotSettings = bs || [];
      }

      // Filter telegram_subscriptions by user's bots
      let filteredSubscriptions: any[] = [];
      if (userBotIds.length > 0) {
        const { data: subs } = await supabase
          .from("telegram_subscriptions")
          .select("*")
          .in("bot_id", userBotIds);
        filteredSubscriptions = subs || [];
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

      // Calculate metadata
      const totalRecords = Object.values(tables).reduce(
        (sum, arr) => sum + arr.length,
        0
      );
      const tablesCount = Object.keys(tables).filter(
        (key) => tables[key as keyof typeof tables].length > 0
      ).length;

      // Generate checksum
      const checksum = await generateChecksum(JSON.stringify(tables));

      const backup: BackupData = {
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

    // VALIDATE: Check backup file structure
    if (req.method === "POST" && action === "validate") {
      const body = await req.json();
      const backup = body.backup as BackupData;

      if (!backup || !backup.version || !backup.tables || !backup.checksum) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: "Arquivo de backup inválido: estrutura incorreta",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify checksum
      const isValid = await verifyChecksum(backup);
      if (!isValid) {
        return new Response(
          JSON.stringify({
            valid: false,
            error: "Checksum inválido: arquivo pode estar corrompido",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return preview
      const preview = {
        valid: true,
        version: backup.version,
        created_at: backup.created_at,
        original_user_id: backup.user_id,
        metadata: backup.metadata,
        tables_summary: Object.entries(backup.tables).map(([name, data]) => ({
          name,
          records: data.length,
        })),
      };

      return new Response(JSON.stringify(preview), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // RESTORE: Import data from backup
    if (req.method === "POST" && action === "restore") {
      const body = await req.json();
      const backup = body.backup as BackupData;
      const mode = body.mode as "merge" | "replace"; // merge = keep existing, replace = delete first

      if (!backup || !backup.tables) {
        return new Response(
          JSON.stringify({ error: "Backup inválido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify checksum
      const isValid = await verifyChecksum(backup);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "Checksum inválido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`[backup-manager] Restoring data for user ${userId} in ${mode} mode`);

      // Use service role for restore operations
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);

      const results: { table: string; inserted: number; errors: string[] }[] = [];

      // Order matters for foreign keys
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

      // If replace mode, delete existing data first (reverse order for FK)
      if (mode === "replace") {
        for (const tableName of [...tableOrder].reverse()) {
          try {
            if (tableName === "telegram_subscriptions" || tableName === "bot_settings") {
              // These need special handling - delete by bot_id
              const { data: bots } = await adminClient
                .from("telegram_bots")
                .select("id")
                .eq("user_id", userId);
              const botIds = (bots || []).map((b) => b.id);
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

      // Insert data
      for (const tableName of tableOrder) {
        const tableData = backup.tables[tableName as keyof typeof backup.tables] || [];
        if (tableData.length === 0) continue;

        const tableResult = { table: tableName, inserted: 0, errors: [] as string[] };

        for (const record of tableData) {
          try {
            // Update user_id to current user
            const updatedRecord = { ...record };
            if ("user_id" in updatedRecord) {
              updatedRecord.user_id = userId;
            }
            // Remove id to let DB generate new ones (except for profiles which may need it)
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
