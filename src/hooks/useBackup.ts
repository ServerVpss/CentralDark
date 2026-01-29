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

export interface TableResult {
  table: string;
  count: number;
  errors: string[];
}

export interface RestoreResult {
  success: boolean;
  message: string;
  results: TableResult[];
  total_inserted: number;
  total_errors: number;
}

export interface ExportResult {
  success: boolean;
  results: TableResult[];
  total_records: number;
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

  const exportBackup = async (): Promise<ExportResult | null> => {
    setIsExporting(true);
    setProgress({ current: 0, total: 100, step: "Iniciando backup...", percentage: 0 });

    const results: TableResult[] = [];

    try {
      // Get current user
      updateProgress(5, 100, "Autenticando usuário...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Usuário não autenticado");
      }
      const userId = user.id;

      console.log("[backup] Exporting data for user:", userId);

      // Fetch all user data with individual tracking
      const tableQueries = [
        { name: "telegram_bots", query: supabase.from("telegram_bots").select("*").eq("user_id", userId), progress: 10 },
        { name: "bot_security_settings", query: supabase.from("bot_security_settings").select("*").eq("user_id", userId), progress: 15 },
        { name: "subscription_plans", query: supabase.from("subscription_plans").select("*").eq("user_id", userId), progress: 20 },
        { name: "payment_gateways", query: supabase.from("payment_gateways").select("*").eq("user_id", userId), progress: 25 },
        { name: "payment_gateway_settings", query: supabase.from("payment_gateway_settings").select("*").eq("user_id", userId), progress: 30 },
        { name: "pix_transactions", query: supabase.from("pix_transactions").select("*").eq("user_id", userId), progress: 35 },
        { name: "pending_payments", query: supabase.from("pending_payments").select("*").eq("user_id", userId), progress: 40 },
        { name: "engagement_messages", query: supabase.from("engagement_messages").select("*").eq("user_id", userId), progress: 45 },
        { name: "profiles", query: supabase.from("profiles").select("*").eq("user_id", userId), progress: 50 },
        { name: "query_history", query: supabase.from("query_history").select("*").eq("user_id", userId), progress: 55 },
        { name: "bot_analytics", query: supabase.from("bot_analytics").select("*").eq("user_id", userId), progress: 60 },
        { name: "payment_history", query: supabase.from("payment_history").select("*").eq("user_id", userId), progress: 65 },
        { name: "telegram_messages", query: supabase.from("telegram_messages").select("*").eq("user_id", userId), progress: 70 },
      ];

      const tableData: Record<string, any[]> = {};

      for (const { name, query, progress: prog } of tableQueries) {
        updateProgress(prog, 100, `Buscando ${TABLE_NAMES[name] || name}...`);
        const { data, error } = await query;
        
        const tableResult: TableResult = {
          table: name,
          count: data?.length || 0,
          errors: error ? [error.message] : [],
        };
        results.push(tableResult);
        tableData[name] = data || [];
      }

      // Get bot_settings and subscriptions filtered by user's bots
      updateProgress(75, 100, "Buscando configurações dos bots...");
      const userBotIds = (tableData.telegram_bots || []).map((b: any) => b.id);
      
      if (userBotIds.length > 0) {
        updateProgress(78, 100, "Buscando configurações dos bots...");
        const { data: botSettingsData, error: bsError } = await supabase.from("bot_settings").select("*").in("bot_id", userBotIds);
        results.push({
          table: "bot_settings",
          count: botSettingsData?.length || 0,
          errors: bsError ? [bsError.message] : [],
        });
        tableData.bot_settings = botSettingsData || [];

        updateProgress(80, 100, "Buscando assinaturas...");
        const { data: subsData, error: subsError } = await supabase.from("telegram_subscriptions").select("*").in("bot_id", userBotIds);
        results.push({
          table: "telegram_subscriptions",
          count: subsData?.length || 0,
          errors: subsError ? [subsError.message] : [],
        });
        tableData.telegram_subscriptions = subsData || [];
      } else {
        results.push({ table: "bot_settings", count: 0, errors: [] });
        results.push({ table: "telegram_subscriptions", count: 0, errors: [] });
        tableData.bot_settings = [];
        tableData.telegram_subscriptions = [];
      }

      updateProgress(85, 100, "Montando backup...");
      const tables = {
        telegram_bots: tableData.telegram_bots || [],
        bot_settings: tableData.bot_settings || [],
        bot_security_settings: tableData.bot_security_settings || [],
        telegram_subscriptions: tableData.telegram_subscriptions || [],
        subscription_plans: tableData.subscription_plans || [],
        payment_gateways: tableData.payment_gateways || [],
        payment_gateway_settings: tableData.payment_gateway_settings || [],
        pix_transactions: tableData.pix_transactions || [],
        pending_payments: tableData.pending_payments || [],
        engagement_messages: tableData.engagement_messages || [],
        profiles: tableData.profiles || [],
        query_history: tableData.query_history || [],
        bot_analytics: tableData.bot_analytics || [],
        payment_history: tableData.payment_history || [],
        telegram_messages: tableData.telegram_messages || [],
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
      
      const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
      
      toast.success(
        `Backup criado com sucesso! ${totalRecords} registros exportados.`
      );

      return {
        success: true,
        results,
        total_records: totalRecords,
        total_errors: totalErrors,
      };
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

      const results: TableResult[] = [];

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

        const tableResult: TableResult = { table: tableName, count: 0, errors: [] as string[] };

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
              tableResult.errors.push(error.message);
            } else {
              tableResult.count++;
            }
          } catch (e: any) {
            tableResult.errors.push(e.message);
          }
        }

        results.push(tableResult);
      }

      updateProgress(100, 100, "Restauração concluída!");

      const totalInserted = results.reduce((sum, r) => sum + r.count, 0);
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
