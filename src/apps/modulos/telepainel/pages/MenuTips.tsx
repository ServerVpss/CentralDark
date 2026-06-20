import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save, Lightbulb } from "lucide-react";
import { invalidateTipsCache } from "@/components/transitions/PageSplash";

interface Tip {
  id: string;
  route: string;
  title: string;
  content: string;
  icon: string;
  enabled: boolean;
  sort_order: number;
}

const ROUTE_PRESETS = [
  "/dashboard", "/bots", "/consultas", "/logs", "/telegram-users",
  "/plans", "/pix", "/settings", "/security", "/audit", "/",
];

export default function MenuTips() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("menu_tips")
      .select("*")
      .order("route", { ascending: true })
      .order("sort_order", { ascending: true });
    if (error) toast.error("Erro ao carregar: " + error.message);
    else setTips((data as Tip[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function saveTip(tip: Tip) {
    setSaving(tip.id);
    const { error } = await supabase
      .from("menu_tips")
      .update({
        route: tip.route,
        title: tip.title,
        content: tip.content,
        icon: tip.icon,
        enabled: tip.enabled,
        sort_order: tip.sort_order,
      })
      .eq("id", tip.id);
    setSaving(null);
    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success("Dica salva");
      invalidateTipsCache();
    }
  }

  async function addTip() {
    const { data, error } = await supabase
      .from("menu_tips")
      .insert({
        route: "/dashboard",
        title: "Nova dica",
        content: "Edite o conteúdo desta dica.",
        icon: "💡",
        enabled: true,
        sort_order: 0,
      })
      .select()
      .single();
    if (error) toast.error("Erro: " + error.message);
    else {
      setTips([data as Tip, ...tips]);
      invalidateTipsCache();
    }
  }

  async function removeTip(id: string) {
    if (!confirm("Remover esta dica?")) return;
    const { error } = await supabase.from("menu_tips").delete().eq("id", id);
    if (error) toast.error("Erro: " + error.message);
    else {
      setTips(tips.filter((t) => t.id !== id));
      invalidateTipsCache();
      toast.success("Removida");
    }
  }

  function updateLocal(id: string, patch: Partial<Tip>) {
    setTips(tips.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary mb-1 flex items-center gap-2">
              <Lightbulb className="h-3.5 w-3.5" /> Dicas do Splash
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Mensagens entre páginas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure o que aparece durante a transição de cada menu.
            </p>
          </div>
          <Button onClick={addTip} className="gap-2">
            <Plus className="h-4 w-4" /> Nova dica
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {tips.map((tip) => (
              <Card key={tip.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Input
                    value={tip.icon}
                    onChange={(e) => updateLocal(tip.id, { icon: e.target.value })}
                    className="w-16 text-center text-xl"
                    maxLength={4}
                  />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      list={`routes-${tip.id}`}
                      value={tip.route}
                      onChange={(e) => updateLocal(tip.id, { route: e.target.value })}
                      placeholder="Rota (ex: /dashboard)"
                    />
                    <datalist id={`routes-${tip.id}`}>
                      {ROUTE_PRESETS.map((r) => <option key={r} value={r} />)}
                    </datalist>
                    <Input
                      value={tip.title}
                      onChange={(e) => updateLocal(tip.id, { title: e.target.value })}
                      placeholder="Título"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={tip.enabled}
                      onCheckedChange={(v) => updateLocal(tip.id, { enabled: v })}
                    />
                  </div>
                </div>
                <Textarea
                  value={tip.content}
                  onChange={(e) => updateLocal(tip.id, { content: e.target.value })}
                  placeholder="Conteúdo da dica"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTip(tip.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Remover
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => saveTip(tip)}
                    disabled={saving === tip.id}
                  >
                    {saving === tip.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-1" />
                    )}
                    Salvar
                  </Button>
                </div>
              </Card>
            ))}
            {tips.length === 0 && (
              <p className="text-center text-muted-foreground py-10">
                Nenhuma dica cadastrada. Clique em "Nova dica".
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
