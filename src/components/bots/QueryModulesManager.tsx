import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Server, ChevronDown, ChevronUp, Loader2, RefreshCw, Filter } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ModuleInfo {
  id: string;
  module_key: string;
  label: string;
  icon: string;
  enabled: boolean;
  provider: string;
  category: string;
}

interface ProviderInfo {
  name: string;
  baseUrl: string;
  port: number;
  editable: boolean;
}

const initialProviders: ProviderInfo[] = [
  { name: "VeiculosAPI", baseUrl: "https://veiculosapi.com/api/proxy", port: 443, editable: false },
];

const categories: Record<string, { label: string; icon: string }> = {
  pessoa: { label: "Pessoa", icon: "👤" },
  documento: { label: "Documentos", icon: "📄" },
  contato: { label: "Contato & Endereço", icon: "📱" },
  financeiro: { label: "Financeiro", icon: "💰" },
  veiculo: { label: "Veículos", icon: "🚗" },
  empresa: { label: "Empresa", icon: "🏢" },
  justica: { label: "Justiça", icon: "⚖️" },
  governo: { label: "Governo", icon: "🏛️" },
  outros: { label: "Outros", icon: "📋" },
};

const categoryOrder = ["pessoa", "documento", "contato", "financeiro", "veiculo", "empresa", "justica", "governo", "outros"];

export function QueryModulesManager() {
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [providers, setProviders] = useState<ProviderInfo[]>(initialProviders);
  const [showProviders, setShowProviders] = useState(false);
  const [loading, setLoading] = useState(true);
  const [togglingKeys, setTogglingKeys] = useState<Set<string>>(new Set());
  const [providerFilter, setProviderFilter] = useState<"all" | "VeiculosAPI" | "iSeek">("all");

  const loadModules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("query_modules")
      .select("*")
      .order("category")
      .order("label");

    if (error) {
      toast.error("Erro ao carregar módulos");
      console.error(error);
    } else {
      setModules((data || []).map(m => ({
        id: m.id,
        module_key: m.module_key,
        label: m.label,
        icon: m.icon || "📋",
        enabled: m.enabled ?? true,
        provider: m.provider || "VeiculosAPI",
        category: m.category || "outros",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { loadModules(); }, []);

  const enabledCount = modules.filter(m => m.enabled).length;

  const toggleModule = async (key: string) => {
    const mod = modules.find(m => m.module_key === key);
    if (!mod) return;

    const newEnabled = !mod.enabled;
    setTogglingKeys(prev => new Set(prev).add(key));

    // Optimistic update
    setModules(prev => prev.map(m => m.module_key === key ? { ...m, enabled: newEnabled } : m));

    const { error } = await supabase
      .from("query_modules")
      .update({ enabled: newEnabled })
      .eq("module_key", key);

    if (error) {
      // Revert
      setModules(prev => prev.map(m => m.module_key === key ? { ...m, enabled: !newEnabled } : m));
      toast.error(`Erro ao atualizar ${mod.label}`);
    } else {
      toast.success(`${mod.label} ${newEnabled ? "ativado" : "desativado"}`);
    }

    setTogglingKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  const toggleAll = async (enabled: boolean) => {
    const prev = modules.map(m => ({ ...m }));
    setModules(modules.map(m => ({ ...m, enabled })));

    const keys = modules.map(m => m.module_key);
    const { error } = await supabase
      .from("query_modules")
      .update({ enabled })
      .in("module_key", keys);

    if (error) {
      setModules(prev);
      toast.error("Erro ao atualizar módulos");
    } else {
      toast.success(enabled ? "Todos ativados" : "Todos desativados");
    }
  };

  const updateProviderUrl = (index: number, field: "baseUrl" | "port", value: string) => {
    setProviders(prev => prev.map((p, i) => i === index ? { ...p, [field]: field === "port" ? parseInt(value) || 0 : value } : p));
  };

  const grouped = categoryOrder.reduce((acc, cat) => {
    acc[cat] = modules.filter(m => m.category === cat);
    return acc;
  }, {} as Record<string, ModuleInfo[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Módulos desativados = bot ignora silenciosamente
              </p>
              <p className="text-xs text-muted-foreground">
                Quando desativado, o bot <strong>não responde nada</strong> ao comando. As alterações são salvas automaticamente no banco e aplicadas em até 60 segundos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{modules.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-500">{enabledCount}</div>
            <div className="text-xs text-muted-foreground">Ativos</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{modules.length - enabledCount}</div>
            <div className="text-xs text-muted-foreground">Inativos</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => toggleAll(true)} className="flex-1">
          ✅ Ativar Todos
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleAll(false)} className="flex-1">
          ❌ Desativar Todos
        </Button>
        <Button size="sm" variant="outline" onClick={loadModules} className="gap-1">
          <RefreshCw className="h-3 w-3" /> Recarregar
        </Button>
      </div>

      {/* Info */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              As alterações são <strong>salvas automaticamente</strong> no banco de dados. O bot do Telegram atualiza em até 60 segundos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Module categories with toggles */}
      {categoryOrder.map(cat => {
        const catModules = grouped[cat];
        if (!catModules?.length) return null;
        const catInfo = categories[cat];
        const activeInCat = catModules.filter(m => m.enabled).length;

        return (
          <Card key={cat} className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span>{catInfo.icon}</span> {catInfo.label}
                </CardTitle>
                <Badge variant={activeInCat > 0 ? "default" : "secondary"} className="text-xs">
                  {activeInCat}/{catModules.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {catModules.map(mod => (
                  <div key={mod.module_key} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    mod.enabled ? "bg-emerald-500/5 border-emerald-500/30" : "bg-secondary/30 border-border"
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">{mod.icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{mod.label}</div>
                        <div className="text-[10px] text-muted-foreground">{mod.provider} • {mod.module_key}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={mod.enabled ? "default" : "outline"} className={`text-[10px] ${
                        mod.enabled ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/30" : "text-muted-foreground"
                      }`}>
                        {mod.enabled ? "ON" : "OFF"}
                      </Badge>
                      <Switch
                        checked={mod.enabled}
                        onCheckedChange={() => toggleModule(mod.module_key)}
                        disabled={togglingKeys.has(mod.module_key)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Providers */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowProviders(!showProviders)}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4 text-primary" /> Provedores (URLs da API)
            </CardTitle>
            {showProviders ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {showProviders && (
          <CardContent className="space-y-4">
            {providers.map((p, idx) => (
              <div key={p.name} className="space-y-2 p-3 rounded-lg bg-secondary/20 border border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-xs">Online</Badge>
                </div>
                <div className="grid grid-cols-[1fr_80px] gap-2">
                  <Input
                    value={p.baseUrl}
                    onChange={(e) => updateProviderUrl(idx, "baseUrl", e.target.value)}
                    placeholder="URL base"
                    className="text-xs font-mono h-8"
                    readOnly
                  />
                  <Input
                    value={String(p.port)}
                    onChange={(e) => updateProviderUrl(idx, "port", e.target.value)}
                    placeholder="Porta"
                    className="text-xs font-mono h-8"
                    type="number"
                    readOnly
                  />
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
