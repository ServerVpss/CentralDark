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

export function useBackup() {
  const [isExporting, setIsExporting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupPreview, setBackupPreview] = useState<BackupPreview | null>(null);

  const exportBackup = async (): Promise<BackupData | null> => {
    setIsExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("backup-manager?action=export", {
        method: "GET",
      });

      if (error) throw error;

      const backup = data as BackupData;

      // Trigger download
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

      toast.success(
        `Backup criado com sucesso! ${backup.metadata.total_records} registros exportados.`
      );

      return backup;
    } catch (error: any) {
      console.error("Erro ao exportar backup:", error);
      toast.error(`Erro ao criar backup: ${error.message}`);
      return null;
    } finally {
      setIsExporting(false);
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

      const { data, error } = await supabase.functions.invoke("backup-manager?action=validate", {
        method: "POST",
        body: { backup },
      });

      if (error) throw error;

      const preview = data as BackupPreview;
      setBackupPreview(preview);

      if (!preview.valid) {
        toast.error(preview.error || "Backup inválido");
      } else {
        toast.success("Backup validado com sucesso!");
      }

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

    try {
      const text = await file.text();
      const backup = JSON.parse(text) as BackupData;

      const { data, error } = await supabase.functions.invoke("backup-manager?action=restore", {
        method: "POST",
        body: { backup, mode },
      });

      if (error) throw error;

      const result = data as RestoreResult;

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
      setIsRestoring(false);
      setBackupPreview(null);
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
    exportBackup,
    validateBackup,
    restoreBackup,
    clearPreview,
  };
}
