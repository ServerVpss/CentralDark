import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Search, FileText, Car, Phone, CreditCard, Loader2, Save, RefreshCw,
  ChevronDown, ChevronUp, Globe, Power, PowerOff, CheckCircle2, XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryModule {
  id: string;
  module_key: string;
  label: string;
  enabled: boolean;
  provider: string;
  base_url: string;
  port: number;
  endpoint: string;
  query_param: string;
  category: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; gradient: string }> = {
  documentos: { label: "Documentos", icon: FileText, gradient: "from-blue-500 to-cyan-500" },
  veiculos: { label: "Veículos", icon: Car, gradient: "from-amber-500 to-orange-500" },
  contato: { label: "Contato", icon: Phone, gradient: "from-emerald-500 to-green-500" },
  financeiro: { label: "Financeiro", icon: CreditCard, gradient: "from-violet-500 to-purple-500" },
  geral: { label: "Geral", icon: Search, gradient: "from-slate-400 to-slate-500" },
};

export function QueryModulesManager() {
  const [modules, setModules] = useState<QueryModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [editedUrls, setEditedUrls] = useState<Record<string, { base_url: string; port: string; endpoint: string }>>({});

  const fetchModules = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("query_modules")
      .select("*")
      .order("category", { ascending: true })
      .order("label", { ascending: true });

    if (error) {
      console.error("Error fetching modules:", error);
      toast.error("Erro ao carregar módulos");
    } else {
      setModules((data as QueryModule[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchModules(); }, []);

  const toggleModule = async (mod: QueryModule) => {
    const newValue = !mod.enabled;
    setSaving(mod.id);

    const { error } = await supabase
      .from("query_modules")
      .update({ enabled: newValue, updated_at: new Date().toISOString() })
      .eq("id", mod.id);

    if (error) {
      toast.error(`Erro ao ${newValue ? "ativar" : "desativar"} ${mod.label}`);
    } else {
      setModules(prev => prev.map(m => m.id === mod.id ? { ...m, enabled: newValue } : m));
      toast.success(`${mod.label} ${newValue ? "ativado" : "desativado"}`);
    }
    setSaving(null);
  };

  const saveUrl = async (mod: QueryModule) => {
    const edited = editedUrls[mod.id];
    if (!edited) return;

    setSaving(mod.id);
    const { error } = await supabase
      .from("query_modules")
      .update({
        base_url: edited.base_url,
        port: parseInt(edited.port) || mod.port,
        endpoint: edited.endpoint,
        updated_at: new Date().toISOString(),
      })
      .eq("id", mod.id);

    if (error) {
      toast.error(`Erro ao salvar URL de ${mod.label}`);
    } else {
      setModules(prev => prev.map(m => m.id === mod.id ? {
        ...m,
        base_url: edited.base_url,
        port: parseInt(edited.port) || m.port,
        endpoint: edited.endpoint,
      } : m));
      setEditedUrls(prev => { const next = { ...prev }; delete next[mod.id]; return next; });
      toast.success(`URL de ${mod.label} atualizada!`);
    }
    setSaving(null);
  };

  const toggleAllInCategory = async (category: string, enable: boolean) => {
    const categoryModules = modules.filter(m => m.category === category);
    setSaving(category);

    const { error } = await supabase
      .from("query_modules")
      .update({ enabled: enable, updated_at: new Date().toISOString() })
      .in("id", categoryModules.map(m => m.id));

    if (error) {
      toast.error("Erro ao atualizar módulos");
    } else {
      setModules(prev => prev.map(m =>
        m.category === category ? { ...m, enabled: enable } : m
      ));
      toast.success(`Todos ${enable ? "ativados" : "desativados"} em ${categoryConfig[category]?.label || category}`);
    }
    setSaving(null);
  };

  const startEditing = (mod: QueryModule) => {
    setExpandedModule(expandedModule === mod.id ? null : mod.id);
    if (!editedUrls[mod.id]) {
      setEditedUrls(prev => ({
        ...prev,
        [mod.id]: { base_url: mod.base_url, port: mod.port.toString(), endpoint: mod.endpoint },
      }));
    }
  };

  const enabledCount = modules.filter(m => m.enabled).length;
  const grouped = modules.reduce<Record<string, QueryModule[]>>((acc, mod) => {
    (acc[mod.category] = acc[mod.category] || []).push(mod);
    return acc;
  }, {});

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Módulos de Consulta
              </CardTitle>
              <CardDescription className="mt-1">
                Ative/desative cada módulo e configure as URLs das APIs
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={cn(
                "text-xs",
                enabledCount > 0 ? "border-success/50 text-success" : "border-destructive/50 text-destructive"
              )}>
                {enabledCount}/{modules.length} ativos
              </Badge>
              <Button variant="ghost" size="icon" onClick={fetchModules} className="h-8 w-8">
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Modules by Category */}
      {Object.entries(grouped).map(([category, catModules]) => {
        const config = categoryConfig[category] || categoryConfig.geral;
        const Icon = config.icon;
        const catEnabled = catModules.filter(m => m.enabled).length;

        return (
          <Card key={category} className="bg-card border-border overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm",
                    config.gradient
                  )}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{config.label}</CardTitle>
                    <CardDescription className="text-xs">
                      {catEnabled}/{catModules.length} módulos ativos
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => toggleAllInCategory(category, true)}
                    disabled={saving === category}
                  >
                    <Power className="h-3 w-3" />
                    Todos ON
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
                    onClick={() => toggleAllInCategory(category, false)}
                    disabled={saving === category}
                  >
                    <PowerOff className="h-3 w-3" />
                    Todos OFF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {catModules.map((mod, idx) => {
                const isExpanded = expandedModule === mod.id;
                const edited = editedUrls[mod.id];
                const hasChanges = edited && (
                  edited.base_url !== mod.base_url ||
                  edited.port !== mod.port.toString() ||
                  edited.endpoint !== mod.endpoint
                );

                return (
                  <div key={mod.id}>
                    {idx > 0 && <Separator />}
                    <div className="px-4 py-3">
                      {/* Module Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="relative">
                            {mod.enabled ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{mod.label}</span>
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono">
                                {mod.module_key}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                              {mod.base_url}:{mod.port}{mod.endpoint}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => startEditing(mod)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Switch
                            checked={mod.enabled}
                            onCheckedChange={() => toggleModule(mod)}
                            disabled={saving === mod.id}
                          />
                        </div>
                      </div>

                      {/* Expanded URL Editor */}
                      {isExpanded && (
                        <div className="mt-3 p-3 rounded-lg bg-secondary/50 space-y-3 animate-fade-in">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium text-primary">Configuração da API</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <Label className="text-[10px] text-muted-foreground">Base URL</Label>
                              <Input
                                value={edited?.base_url ?? mod.base_url}
                                onChange={(e) => setEditedUrls(prev => ({
                                  ...prev,
                                  [mod.id]: { ...(prev[mod.id] || { base_url: mod.base_url, port: mod.port.toString(), endpoint: mod.endpoint }), base_url: e.target.value },
                                }))}
                                className="h-8 text-xs font-mono bg-background"
                                placeholder="http://host.com"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground">Porta</Label>
                              <Input
                                value={edited?.port ?? mod.port.toString()}
                                onChange={(e) => setEditedUrls(prev => ({
                                  ...prev,
                                  [mod.id]: { ...(prev[mod.id] || { base_url: mod.base_url, port: mod.port.toString(), endpoint: mod.endpoint }), port: e.target.value },
                                }))}
                                className="h-8 text-xs font-mono bg-background"
                                placeholder="25589"
                              />
                            </div>
                            <div>
                              <Label className="text-[10px] text-muted-foreground">Endpoint</Label>
                              <Input
                                value={edited?.endpoint ?? mod.endpoint}
                                onChange={(e) => setEditedUrls(prev => ({
                                  ...prev,
                                  [mod.id]: { ...(prev[mod.id] || { base_url: mod.base_url, port: mod.port.toString(), endpoint: mod.endpoint }), endpoint: e.target.value },
                                }))}
                                className="h-8 text-xs font-mono bg-background"
                                placeholder="/cpf"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <p className="text-[10px] text-muted-foreground font-mono">
                              URL final: {edited?.base_url ?? mod.base_url}:{edited?.port ?? mod.port}{edited?.endpoint ?? mod.endpoint}?{mod.query_param}=valor
                            </p>
                            {hasChanges && (
                              <Button
                                size="sm"
                                className="h-7 text-xs gap-1"
                                onClick={() => saveUrl(mod)}
                                disabled={saving === mod.id}
                              >
                                {saving === mod.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                                Salvar URL
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
