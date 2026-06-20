import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash2, RefreshCw, Loader2 } from "lucide-react";

interface CleanupRow {
  id: string;
  retention_days: number;
  enabled: boolean;
  last_run_at: string | null;
  last_deleted_count: number;
}

const OPCOES = [
  { v: 7, label: "7 dias" },
  { v: 15, label: "15 dias" },
  { v: 30, label: "30 dias" },
  { v: 60, label: "60 dias" },
  { v: 90, label: "90 dias" },
];

export function CleanupSettings() {
  const [row, setRow] = useState<CleanupRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  const carregar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cleanup_settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) toast.error("Erro ao carregar configuração");
    setRow(data as CleanupRow);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const salvar = async (patch: Partial<CleanupRow>) => {
    if (!row) return;
    setSaving(true);
    const { error } = await supabase
      .from("cleanup_settings")
      .update(patch)
      .eq("id", row.id);
    setSaving(false);
    if (error) { toast.error("Não foi possível salvar"); return; }
    setRow({ ...row, ...patch });
    toast.success("Configuração atualizada");
  };

  const rodarAgora = async () => {
    setRunning(true);
    const { data, error } = await supabase.rpc("run_data_cleanup");
    setRunning(false);
    if (error) { toast.error("Falha ao executar limpeza"); return; }
    toast.success(`Limpeza concluída — ${data ?? 0} registros apagados`);
    carregar();
  };

  if (loading || !row) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-primary" />
          Limpeza Automática
        </CardTitle>
        <CardDescription>
          Apaga automaticamente mensagens, consultas e logs antigos do banco para liberar espaço.
          Roda todo dia às 03:00.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-4">
          <div>
            <Label className="text-base">Ativar limpeza automática</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Quando ligado, dados mais antigos que o período escolhido serão removidos.
            </p>
          </div>
          <Switch
            checked={row.enabled}
            onCheckedChange={(v) => salvar({ enabled: v })}
            disabled={saving}
          />
        </div>

        <div className="space-y-2">
          <Label>Manter dados dos últimos</Label>
          <Select
            value={String(row.retention_days)}
            onValueChange={(v) => salvar({ retention_days: Number(v) })}
            disabled={saving || !row.enabled}
          >
            <SelectTrigger className="w-full md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPCOES.map((o) => (
                <SelectItem key={o.v} value={String(o.v)}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Tudo mais velho que isso será apagado das tabelas de mensagens, consultas, logs de API e health checks.
          </p>
        </div>

        <div className="rounded-lg border border-border/40 bg-muted/20 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-medium">Última execução</p>
              <p className="text-xs text-muted-foreground">
                {row.last_run_at
                  ? `${new Date(row.last_run_at).toLocaleString("pt-BR")} — ${row.last_deleted_count.toLocaleString("pt-BR")} registros apagados`
                  : "Ainda não executou"}
              </p>
            </div>
            <Button onClick={rodarAgora} disabled={running} size="sm" variant="outline">
              {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Executar agora
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
