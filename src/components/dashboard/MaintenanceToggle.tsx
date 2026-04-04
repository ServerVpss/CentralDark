import { useState, useEffect, useCallback } from "react";
import { Wrench } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MaintenanceToggleProps {
  botId: string | null;
}

export function MaintenanceToggle({ botId }: MaintenanceToggleProps) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!botId) { setLoading(false); return; }
    const { data } = await supabase
      .from("bot_settings")
      .select("maintenance_mode")
      .eq("bot_id", botId)
      .single();
    setEnabled(data?.maintenance_mode ?? false);
    setLoading(false);
  }, [botId]);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  const toggle = async (value: boolean) => {
    if (!botId) return;
    setToggling(true);
    setEnabled(value);

    const { error } = await supabase
      .from("bot_settings")
      .update({ maintenance_mode: value })
      .eq("bot_id", botId);

    if (error) {
      setEnabled(!value);
      toast.error("Erro ao alterar modo manutenção");
    } else {
      toast.success(value ? "Manutenção ativada" : "Manutenção desativada");
    }
    setToggling(false);
  };

  if (!botId) return null;

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20">
            <Wrench className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm">Modo Manutenção</h2>
            <Badge
              variant={enabled ? "destructive" : "secondary"}
              className="mt-0.5 text-[10px] px-1.5 py-0"
            >
              {enabled ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={toggle}
          disabled={loading || toggling}
        />
      </div>
    </div>
  );
}
