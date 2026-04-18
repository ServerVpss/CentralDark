import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Percent, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export function OperationalCostConfig() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rate, setRate] = useState<string>("3");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("payment_gateway_settings")
        .select("operational_cost_rate" as any)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        const v = Number((data as any)?.operational_cost_rate ?? 0.03);
        setRate((v * 100).toFixed(2).replace(/\.?0+$/, ""));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    const pct = parseFloat(rate.replace(",", "."));
    if (isNaN(pct) || pct < 0 || pct > 100) {
      toast({
        title: "Valor inválido",
        description: "Informe um percentual entre 0 e 100.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const decimal = pct / 100;

    const { data: existing } = await supabase
      .from("payment_gateway_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const { error } = existing
      ? await supabase
          .from("payment_gateway_settings")
          .update({ operational_cost_rate: decimal } as any)
          .eq("user_id", user.id)
      : await supabase
          .from("payment_gateway_settings")
          .insert({ user_id: user.id, operational_cost_rate: decimal } as any);

    setSaving(false);
    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Custo atualizado",
      description: `Custo operacional definido em ${pct}%.`,
    });
    queryClient.invalidateQueries({ queryKey: ["pix-transactions"] });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Percent className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Custo Operacional</CardTitle>
            <CardDescription>
              Percentual descontado da receita para calcular o lucro
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-md">
          <div className="flex-1">
            <Label htmlFor="op-cost-rate">Custo (%)</Label>
            <div className="relative mt-1.5">
              <Input
                id="op-cost-rate"
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                disabled={loading || saving}
                className="pr-9"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading || saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Exemplo: 3% significa que para cada R$ 100 recebidos, R$ 3,00 são considerados custo e R$ 97,00 lucro.
        </p>
      </CardContent>
    </Card>
  );
}
