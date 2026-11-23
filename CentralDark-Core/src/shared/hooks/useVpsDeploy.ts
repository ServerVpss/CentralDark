import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/hub-client";
import { toast } from "@/shared/hooks/use-toast";

export interface DeployRow {
  id: string;
  commit_hash: string | null;
  environment: string;
  status: "running" | "success" | "error" | string;
  workflow_run_id: string | null;
  log_summary: string | null;
  started_at: string;
  finished_at: string | null;
  triggered_by: string | null;
}

const SYNC_COMMAND =
  "bash /root/Multizap/apps/clone-deck/scripts/sync-para-centraldark-monorepo.sh";
const CHECK_COMMAND =
  "tail -n 60 /var/log/centraldark-sync.log 2>/dev/null || echo 'sem log ainda'";

export function useVpsDeploy() {
  const [history, setHistory] = useState<DeployRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [lastCheckLog, setLastCheckLog] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vps_deploy_history")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(20);
    if (!error && data) setHistory(data as DeployRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // Realtime simples — recarrega ao detectar mudanças
    const channel = supabase
      .channel("vps_deploy_history_rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vps_deploy_history" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const runSync = useCallback(async () => {
    setRunning(true);
    try {
      // 1) Registra "running" no histórico (RLS exige admin no front)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { data: inserted, error: insertErr } = await supabase
        .from("vps_deploy_history")
        .insert({
          environment: "web+portal",
          status: "running",
          triggered_by: user?.id ?? null,
          log_summary: "Disparando workflow GitHub Actions…",
        })
        .select()
        .single();
      if (insertErr) throw insertErr;

      // 2) Dispara o workflow
      const { data, error } = await supabase.functions.invoke("vps-exec", {
        body: { commands: [SYNC_COMMAND], deploy_id: inserted?.id },
      });
      if (error) throw error;

      // 3) Marca como sucesso parcial (workflow agendado)
      if (inserted?.id) {
        await supabase
          .from("vps_deploy_history")
          .update({
            status: "success",
            finished_at: new Date().toISOString(),
            log_summary: `Workflow disparado. ${JSON.stringify(data).slice(0, 500)}`,
          })
          .eq("id", inserted.id);
      }

      toast({
        title: "Sync disparado",
        description: "O workflow está rodando na VPS. Acompanhe pelo histórico.",
      });
    } catch (e: any) {
      toast({
        title: "Falhou ao disparar sync",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setRunning(false);
      load();
    }
  }, [load]);

  const checkCron = useCallback(async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("vps-exec", {
        body: { commands: [CHECK_COMMAND], mode: "check" },
      });
      if (error) throw error;
      setLastCheckLog(
        typeof data === "string" ? data : JSON.stringify(data, null, 2),
      );
      toast({
        title: "Verificação enviada",
        description: "Log será exibido em alguns segundos.",
      });
    } catch (e: any) {
      toast({
        title: "Erro ao verificar cron",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  }, []);

  return {
    history,
    loading,
    running,
    checking,
    lastCheckLog,
    runSync,
    checkCron,
    reload: load,
  };
}
