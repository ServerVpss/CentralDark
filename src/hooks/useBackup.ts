import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BackupData {
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

export interface BackupPreview {
  valid: boolean;
  error?: string;
  version?: string;
  created_at?: string;
  original_user_id?: string;
  metadata?: {
    total_records: number;
    tables_count: number;
  };
  tables_summary?: { name: string; records: number }[];
}

export interface RestoreResult {
  success: boolean;
  message: string;
  results: { table: string; inserted: number; errors: string[] }[];
  total_inserted: number;
  total_errors: number;
}

export interface ProgressState {
  current: number;
  total: number;
  step: string;
  percentage: number;
}

async function generateChecksum(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const TABLE_NAMES: Record<string, string> = {
  telegram_bots: "Bots do Telegram",
  bot_settings: "Configurações dos Bots",
  bot_security_settings: "Configurações de Segurança",
  telegram_subscriptions: "Assinaturas",
  subscription_plans: "Planos",
  payment_gateways: "Gateways de Pagamento",
  payment_gateway_settings: "Config. de Gateway",
  pix_transactions: "Transações PIX",
  pending_payments: "Pagamentos Pendentes",
  engagement_messages: "Mensagens de Engajamento",
  profiles: "Perfis",
  query_history: "Histórico de Consultas",
  bot_analytics: "Análises",
  payment_history: "Histórico de Pagamentos",
  telegram_messages: "Mensagens do Telegram",
};

export function useBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupPreview, setBackupPreview] = useState<BackupPreview | null>(null);
  const [progress, setProgress] = useState<ProgressState | null>(null);

  const updateProgress = (current: number, total: number, step: string) => {
    setProgress({
      current,
      total,
      step,
      percentage: Math.round((current / total) * 100),
    });
  };

  const exportBackup = async (): Promise<BackupData | null> => {
    setIsExporting(true);
    setProgress({ current: 0, total: 100, step: "Iniciando backup...", percentage: 0 });

    try {
      // Get current user
      updateProgress(5, 100, "Autenticando usuário...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Usuário não autenticado");
      }
      const userId = user.id;

      console.log("[backup] Exporting data for user:", userId);

      // Fetch all user data
      updateProgress(10, 100, "Buscando bots...");
      const telegramBots = await supabase.from("telegram_bots").select("*").eq("user_id", userId);

      updateProgress(15, 100, "Buscando configurações de segurança...");
      const botSecuritySettings = await supabase.from("bot_security_settings").select("*").eq("user_id", userId);

      updateProgress(20, 100, "Buscando planos...");
      const subscriptionPlans = await supabase.from("subscription_plans").select("*").eq("user_id", userId);

      updateProgress(25, 100, "Buscando gateways de pagamento...");
      const paymentGateways = await supabase.from("payment_gateways").select("*").eq("user_id", userId);

      updateProgress(30, 100, "Buscando configurações de gateway...");
      const paymentGatewaySettings = await supabase.from("payment_gateway_settings").select("*").eq("user_id", userId);

      updateProgress(35, 100, "Buscando transações PIX...");
      const pixTransactions = await supabase.from("pix_transactions").select("*").eq("user_id", userId);

      updateProgress(40, 100, "Buscando pagamentos pendentes...");
      const pendingPayments = await supabase.from("pending_payments").select("*").eq("user_id", userId);

      updateProgress(45, 100, "Buscando mensagens de engajamento...");
      const engagementMessages = await supabase.from("engagement_messages").select("*").eq("user_id", userId);

      updateProgress(50, 100, "Buscando perfis...");
      const profiles = await supabase.from("profiles").select("*").eq("user_id", userId);

      updateProgress(55, 100, "Buscando histórico de consultas...");
      const queryHistory = await supabase.from("query_history").select("*").eq("user_id", userId);

      updateProgress(60, 100, "Buscando análises...");
      const botAnalytics = await supabase.from("bot_analytics").select("*").eq("user_id", userId);

      updateProgress(65, 100, "Buscando histórico de pagamentos...");
      const paymentHistory = await supabase.from("payment_history").select("*").eq("user_id", userId);

      updateProgress(70, 100, "Buscando mensagens do Telegram...");
      const telegramMessages = await supabase.from("telegram_messages").select("*").eq("user_id", userId);

      // Get bot_settings and subscriptions filtered by user's bots
      updateProgress(75, 100, "Buscando configurações dos bots...");
      const userBotIds = (telegramBots.data || []).map((b) => b.id);
      let filteredBotSettings: any[] = [];
      let filteredSubscriptions: any[] = [];

      if (userBotIds.length > 0) {
        updateProgress(80, 100, "Buscando assinaturas...");
        const [bs, subs] = await Promise.all([
          supabase.from("bot_settings").select("*").in("bot_id", userBotIds),
          supabase.from("telegram_subscriptions").select("*").in("bot_id", userBotIds),
        ]);
        filteredBotSettings = bs.data || [];
        filteredSubscriptions = subs.data || [];
      }

      updateProgress(85, 100, "Montando backup...");
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
      updateProgress(90, 100, "Gerando checksum de integridade...");
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

      // Trigger download
      updateProgress(95, 100, "Preparando download...");
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      updateProgress(100, 100, "Backup concluído!");
      console.log(`[backup] Export complete: ${totalRecords} records from ${tablesCount} tables`);
      toast.success(
        `Backup criado com sucesso! ${backup.metadata.total_records} registros exportados.`
      );

      return backup;
    } catch (error: any) {
      console.error("Erro ao exportar backup:", error);
      toast.error(`Erro ao criar backup: ${error.message}`);
      return null;
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setProgress(null);
      }, 1000);
    }
  };

  const validateBackup = async (file: File): Promise<BackupPreview | null> => {
    setIsValidating(true);
    setBackupPreview(null);

    try {
      const text = await file.text();
      let backup: BackupData;

      try {
        backup = JSON.parse(text);
      } catch {
        const preview = { valid: false, error: "Arquivo JSON inválido" };
        setBackupPreview(preview);
        return preview;
      }

      // Validate structure
      if (!backup || !backup.version || !backup.tables || !backup.checksum) {
        const preview = { valid: false, error: "Arquivo de backup inválido: estrutura incorreta" };
        setBackupPreview(preview);
        return preview;
      }

      // Verify checksum
      const newChecksum = await generateChecksum(JSON.stringify(backup.tables));
      if (backup.checksum !== newChecksum) {
        const preview = { valid: false, error: "Checksum inválido: arquivo pode estar corrompido" };
        setBackupPreview(preview);
        toast.error(preview.error);
        return preview;
      }

      // Return preview
      const preview: BackupPreview = {
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

      setBackupPreview(preview);
      toast.success("Backup validado com sucesso!");

      return preview;
    } catch (error: any) {
      console.error("Erro ao validar backup:", error);
      const preview = { valid: false, error: error.message };
      setBackupPreview(preview);
      toast.error(`Erro ao validar: ${error.message}`);
      return preview;
    } finally {
      setIsValidating(false);
    }
  };

  const restoreBackup = async (
    file: File,
    mode: "merge" | "replace"
  ): Promise<RestoreResult | null> => {
    setIsRestoring(true);
    setProgress({ current: 0, total: 100, step: "Iniciando restauração...", percentage: 0 });

    try {
      // Get current user
      updateProgress(5, 100, "Autenticando usuário...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Usuário não autenticado");
      }
      const userId = user.id;

      updateProgress(10, 100, "Lendo arquivo de backup...");
      const text = await file.text();
      const backup = JSON.parse(text) as BackupData;

      // Verify checksum
      updateProgress(15, 100, "Verificando integridade...");
      const newChecksum = await generateChecksum(JSON.stringify(backup.tables));
      if (backup.checksum !== newChecksum) {
        throw new Error("Checksum inválido");
      }

      console.log(`[backup] Restoring data for user ${userId} in ${mode} mode`);

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
      ] as const;

      // If replace mode, delete existing data first (reverse order for FK)
      if (mode === "replace") {
        updateProgress(20, 100, "Removendo dados existentes...");
        const reverseOrder = [...tableOrder].reverse();
        for (let i = 0; i < reverseOrder.length; i++) {
          const tableName = reverseOrder[i];
          const progressPercent = 20 + Math.round((i / reverseOrder.length) * 15);
          updateProgress(progressPercent, 100, `Limpando ${TABLE_NAMES[tableName] || tableName}...`);
          
          try {
            if (tableName === "telegram_subscriptions" || tableName === "bot_settings") {
              const { data: bots } = await supabase
                .from("telegram_bots")
                .select("id")
                .eq("user_id", userId);
              const botIds = (bots || []).map((b) => b.id);
              if (botIds.length > 0) {
                await supabase.from(tableName).delete().in("bot_id", botIds);
              }
            } else if (tableName !== "profiles") {
              await supabase.from(tableName).delete().eq("user_id", userId);
            }
          } catch (e) {
            console.error(`[backup] Error deleting from ${tableName}:`, e);
          }
        }
      }

      // Insert data
      const startPercent = mode === "replace" ? 35 : 20;
      const endPercent = 95;
      const progressRange = endPercent - startPercent;

      for (let i = 0; i < tableOrder.length; i++) {
        const tableName = tableOrder[i];
        const tableData = backup.tables[tableName] || [];
        const progressPercent = startPercent + Math.round((i / tableOrder.length) * progressRange);
        
        updateProgress(
          progressPercent,
          100,
          `Restaurando ${TABLE_NAMES[tableName] || tableName} (${tableData.length} registros)...`
        );

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

            const { error } = await supabase.from(tableName).upsert(updatedRecord as any, {
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

      updateProgress(100, 100, "Restauração concluída!");

      const totalInserted = results.reduce((sum, r) => sum + r.inserted, 0);
      const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

      const result: RestoreResult = {
        success: true,
        message: `Restauração concluída: ${totalInserted} registros importados`,
        results,
        total_inserted: totalInserted,
        total_errors: totalErrors,
      };

      console.log(`[backup] Restore complete: ${totalInserted} inserted, ${totalErrors} errors`);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error("Erro durante a restauração");
      }

      return result;
    } catch (error: any) {
      console.error("Erro ao restaurar backup:", error);
      toast.error(`Erro ao restaurar: ${error.message}`);
      return null;
    } finally {
      setTimeout(() => {
        setIsRestoring(false);
        setProgress(null);
        setBackupPreview(null);
      }, 1500);
    }
  };

  const clearPreview = () => {
    setBackupPreview(null);
  };

  return {
    isExporting,
    isValidating,
    isRestoring,
    backupPreview,
    progress,
    exportBackup,
    validateBackup,
    restoreBackup,
    clearPreview,
  };
}
