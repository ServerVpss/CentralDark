import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DollarSign, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/components/auth/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";

export function OperationalCostConfig() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [cost, setCost] = useState<string>("500");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("payment_gateway_settings")
        .select("monthly_fixed_cost" as any)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        const v = Number((data as any)?.monthly_fixed_cost ?? 500);
        setCost(v.toFixed(2).replace(/\.?0+$/, ""));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    const value = parseFloat(cost.replace(",", "."));
    if (isNaN(value) || value < 0) {
      toast({
        title: "Valor inválido",
        description: "Informe um custo mensal igual ou maior que zero.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);

    const { data: existing } = await supabase
      .from("payment_gateway_settings")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    const { error } = existing
      ? await supabase
          .from("payment_gateway_settings")
          .update({ monthly_fixed_cost: value } as any)
          .eq("user_id", user.id)
      : await supabase
          .from("payment_gateway_settings")
          .insert({ user_id: user.id, monthly_fixed_cost: value } as any);

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
      description: `Custo fixo mensal definido em R$ ${value.toFixed(2)}.`,
    });
    queryClient.invalidateQueries({ queryKey: ["pix-transactions"] });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <DollarSign className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Custo Operacional Mensal</CardTitle>
            <CardDescription>
              Valor fixo pago por mês ao fornecedor da API (rateado proporcionalmente no período filtrado)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 max-w-md">
          <div className="flex-1">
            <Label htmlFor="op-cost-monthly">Custo mensal (R$)</Label>
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
              <Input
                id="op-cost-monthly"
                type="number"
                inputMode="decimal"
                min={0}
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                disabled={loading || saving}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={loading || saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Exemplo: R$ 500/mês. Em filtros de 7 dias, o custo aplicado será R$ {(500 * 7 / 30).toFixed(2)} (rateio proporcional ao período).
        </p>
      </CardContent>
    </Card>
  );
}
