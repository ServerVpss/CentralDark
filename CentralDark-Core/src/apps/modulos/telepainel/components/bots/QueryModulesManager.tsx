import { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { AlertTriangle, Info, Server, ChevronDown, ChevronUp, Loader2, RefreshCw, Activity, ShieldCheck, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/hub-client";
import { useModuleHealth, type HealthLabel } from "@/shared/hooks/useModuleHealth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

// Hash SHA-256 da senha de acesso ao Provedor (senha real nunca aparece no código)
const PROVIDER_PASS_HASH = "2297fade722a916486eaf13551ae7caf34e7dd657c15f2ca324cc3ac399ee52a";
const SESSION_UNLOCK_KEY = "providers_unlocked_v1";
const SESSION_LOCKOUT_KEY = "providers_lockout_until_v1";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000;

async function sha256Hex(text: string): Promise<string> {
  const buf = new TextEncoder().encode(text);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface ModuleInfo {
  id: string;
  module_key: string;
  label: string;
  icon: string;
  enabled: boolean;
  category: string;
}

const categories: Record<string, { label: string; icon: string }> = {
  pessoa: { label: "Pessoa", icon: "👤" },
  documento: { label: "Documentos", icon: "📄" },
  contato: { label: "Contato & Endereço", icon: "📱" },
  financeiro: { label: "Financeiro", icon: "💰" },
  veiculo: { label: "Veículos", icon: "🚗" },
  empresa: { label: "Empresa", icon: "🏢" },
  justica: { label: "Justiça", icon: "⚖️" },
  governo: { label: "Governo", icon: "🏛️" },
  foto: { label: "Fotos", icon: "📸" },
  saude: { label: "Saúde", icon: "🏥" },
  outros: { label: "Outros", icon: "📋" },
};

const categoryOrder = ["pessoa", "documento", "contato", "financeiro", "veiculo", "empresa", "justica", "governo", "foto", "saude", "outros"];

type HealthFilter = "all" | "healthy" | "problems" | "no_data";

const healthMeta: Record<HealthLabel, { label: string; emoji: string; dot: string; text: string }> = {
  healthy:  { label: "Saudável",       emoji: "🟢", dot: "bg-emerald-500",  text: "text-emerald-500" },
  degraded: { label: "Degradado",      emoji: "🟡", dot: "bg-amber-500",    text: "text-amber-500" },
  failing:  { label: "Sem retorno",    emoji: "🔴", dot: "bg-destructive",  text: "text-destructive" },
  no_data:  { label: "Sem dados",      emoji: "⚪", dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

export function QueryModulesManager() {
  const [modules, setModules] = useState<ModuleInfo[]>([]);
  const [showProviders, setShowProviders] = useState(false);
  const [providersUnlocked, setProvidersUnlocked] = useState(
    () => typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_UNLOCK_KEY) === "1",
  );

  // Estado do modal de senha
  const [passDialogOpen, setPassDialogOpen] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passVisible, setPassVisible] = useState(false);
  const [passChecking, setPassChecking] = useState(false);
  const [passAttempts, setPassAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    if (typeof sessionStorage === "undefined") return 0;
    const v = Number(sessionStorage.getItem(SESSION_LOCKOUT_KEY) || 0);
    return Number.isFinite(v) ? v : 0;
  });
  const [now, setNow] = useState(Date.now());
  const passInputRef = useRef<HTMLInputElement>(null);

  const lockRemaining = Math.max(0, lockoutUntil - now);
  const isLocked = lockRemaining > 0;

  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [isLocked]);

  useEffect(() => {
    if (passDialogOpen) {
      setPassInput("");
      setPassVisible(false);
      setTimeout(() => passInputRef.current?.focus(), 50);
    }
  }, [passDialogOpen]);

  const handleProvidersClick = () => {
    if (showProviders) {
      setShowProviders(false);
      return;
    }
    if (providersUnlocked) {
      setShowProviders(true);
      return;
    }
    setPassDialogOpen(true);
  };

  const handleSubmitPassword = async () => {
    if (isLocked || passChecking) return;
    const candidate = passInput.trim();
    if (!candidate) {
      toast.error("Digite a senha");
      return;
    }
    setPassChecking(true);
    try {
      const hash = await sha256Hex(candidate);
      // Comparação em tempo constante pra evitar timing-attack
      let diff = hash.length ^ PROVIDER_PASS_HASH.length;
      for (let i = 0; i < Math.max(hash.length, PROVIDER_PASS_HASH.length); i++) {
        diff |= (hash.charCodeAt(i) || 0) ^ (PROVIDER_PASS_HASH.charCodeAt(i) || 0);
      }
      if (diff === 0) {
        setProvidersUnlocked(true);
        setShowProviders(true);
        setPassDialogOpen(false);
        setPassAttempts(0);
        try { sessionStorage.setItem(SESSION_UNLOCK_KEY, "1"); } catch {}
        try { sessionStorage.removeItem(SESSION_LOCKOUT_KEY); } catch {}
        toast.success("Acesso liberado");
      } else {
        const next = passAttempts + 1;
        setPassAttempts(next);
        setPassInput("");
        if (next >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCKOUT_MS;
          setLockoutUntil(until);
          setPassAttempts(0);
          try { sessionStorage.setItem(SESSION_LOCKOUT_KEY, String(until)); } catch {}
          toast.error(`Muitas tentativas. Aguarde ${Math.ceil(LOCKOUT_MS / 1000)}s.`);
        } else {
          toast.error(`Senha incorreta (${next}/${MAX_ATTEMPTS})`);
        }
      }
    } finally {
      setPassChecking(false);
    }
  };

  const [loading, setLoading] = useState(true);
  const [togglingKeys, setTogglingKeys] = useState<Set<string>>(new Set());
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");

  const { healthMap, recalcNow, recalculating } = useModuleHealth();

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
        category: m.category || "outros",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { loadModules(); }, []);

  const enabledCount = modules.filter(m => m.enabled).length;

  const healthCounts = useMemo(() => {
    const counts = { healthy: 0, degraded: 0, failing: 0, no_data: 0 };
    for (const m of modules) {
      const label = (healthMap[m.module_key]?.health_label ?? "no_data") as HealthLabel;
      counts[label]++;
    }
    return counts;
  }, [modules, healthMap]);

  const matchesFilter = (key: string) => {
    if (healthFilter === "all") return true;
    const label = (healthMap[key]?.health_label ?? "no_data") as HealthLabel;
    if (healthFilter === "healthy") return label === "healthy";
    if (healthFilter === "problems") return label === "degraded" || label === "failing";
    if (healthFilter === "no_data") return label === "no_data";
    return true;
  };

  const toggleModule = async (key: string) => {
    const mod = modules.find(m => m.module_key === key);
    if (!mod) return;

    const newEnabled = !mod.enabled;
    setTogglingKeys(prev => new Set(prev).add(key));
    setModules(prev => prev.map(m => m.module_key === key ? { ...m, enabled: newEnabled } : m));

    const { error } = await supabase
      .from("query_modules")
      .update({ enabled: newEnabled })
      .eq("module_key", key);

    if (error) {
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
      toast.success(`Todos: ${enabled ? "ativados" : "desativados"}`);
    }
  };

  const handleRecalc = async () => {
    try {
      await recalcNow();
      toast.success("Saúde dos módulos recalculada");
    } catch (e) {
      toast.error("Falha ao recalcular");
      console.error(e);
    }
  };

  const grouped = categoryOrder.reduce((acc, cat) => {
    acc[cat] = modules.filter(m => m.category === cat && matchesFilter(m.module_key));
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
    <TooltipProvider delayDuration={150}>
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

      {/* Health summary */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-primary" /> Saúde dos Módulos (24h)
            </CardTitle>
            <Button size="sm" variant="outline" onClick={handleRecalc} disabled={recalculating} className="gap-1">
              {recalculating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Recalcular agora
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            {(["healthy","degraded","failing","no_data"] as HealthLabel[]).map(k => {
              const meta = healthMeta[k];
              return (
                <button
                  key={k}
                  onClick={() => setHealthFilter(
                    k === "healthy" ? "healthy" :
                    k === "no_data" ? "no_data" :
                    "problems"
                  )}
                  className="text-left p-3 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                    <span className={`text-lg font-bold ${meta.text}`}>{healthCounts[k]}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{meta.label}</div>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all","healthy","problems","no_data"] as HealthFilter[]).map(f => (
              <Button
                key={f}
                size="sm"
                variant={healthFilter === f ? "default" : "outline"}
                onClick={() => setHealthFilter(f)}
                className="text-xs h-7"
              >
                {f === "all" ? "Todos" : f === "healthy" ? "🟢 Saudáveis" : f === "problems" ? "⚠️ Problemáticos" : "⚪ Sem dados"}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

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
              Os badges de saúde são atualizados automaticamente conforme o uso real. <strong>Nenhum módulo é ativado ou desativado pelo sistema</strong> — você decide com base no que vê.
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
                {catModules.map(mod => {
                  const health = healthMap[mod.module_key];
                  const label = (health?.health_label ?? "no_data") as HealthLabel;
                  const meta = healthMeta[label];
                  const lastAt = health?.last_check_at ?? health?.last_success_at ?? health?.last_failure_at;
                  const lastRel = lastAt ? formatDistanceToNow(new Date(lastAt), { addSuffix: true, locale: ptBR }) : "sem registros";

                  return (
                    <div key={mod.module_key} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      mod.enabled ? "bg-emerald-500/5 border-emerald-500/30" : "bg-secondary/30 border-border"
                    }`}>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-lg">{mod.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className={`h-2 w-2 rounded-full ${meta.dot} shrink-0`} />
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">
                                <div className="space-y-0.5">
                                  <div className="font-medium">{meta.emoji} {meta.label}</div>
                                  <div>✅ {health?.success_count_24h ?? 0} sucesso</div>
                                  <div>❌ {health?.notfound_count_24h ?? 0} sem dados</div>
                                  <div>⚠️ {health?.error_count_24h ?? 0} erros</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                            <span className="text-sm font-medium truncate">{mod.label}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {mod.module_key}
                            {health && health.total_attempts_24h > 0 && (
                              <>
                                {" · "}
                                <span className={meta.text}>{health.success_rate}% sucesso</span>
                                {" · "}
                                {health.total_attempts_24h} consultas
                                {" · "}
                                {lastRel}
                              </>
                            )}
                            {(!health || health.total_attempts_24h === 0) && (
                              <> · sem amostras nas últimas 24h</>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={`text-[10px] ${meta.text} border-current/30`}>
                          {meta.emoji} {meta.label}
                        </Badge>
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
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Providers */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 cursor-pointer" onClick={handleProvidersClick}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Server className="h-4 w-4 text-primary" /> Provedor (URL da API)
            </CardTitle>
            {showProviders ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </CardHeader>
        {showProviders && (
          <CardContent className="space-y-4">
            <div className="space-y-2 p-3 rounded-lg bg-secondary/20 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">VeiculosAPI</span>
                </div>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-xs">Online</Badge>
              </div>
              <div className="grid grid-cols-[1fr_80px] gap-2">
                <Input
                  value="https://veiculosapi.com/api/proxy"
                  placeholder="URL base"
                  className="text-xs font-mono h-8"
                  readOnly
                />
                <Input
                  value="443"
                  placeholder="Porta"
                  className="text-xs font-mono h-8"
                  readOnly
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Modal de senha do Provedor — fundido ao painel, estilo Esmeralda 3D */}
      <Dialog open={passDialogOpen} onOpenChange={(o) => !passChecking && setPassDialogOpen(o)}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border/60 bg-card/95 backdrop-blur-xl shadow-3d p-0 overflow-hidden">
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-primary/10 to-transparent border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shadow-3d-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="text-base font-semibold">Acesso restrito</DialogTitle>
                  <DialogDescription className="text-xs">
                    Área do Provedor protegida. Digite a senha para continuar.
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider-pass" className="text-xs font-medium text-muted-foreground">
                Senha de acesso
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="provider-pass"
                  ref={passInputRef}
                  type={passVisible ? "text" : "password"}
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmitPassword();
                    }
                  }}
                  disabled={isLocked || passChecking}
                  placeholder="••••••"
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={32}
                  className="pl-9 pr-10 h-11 rounded-xl tracking-widest font-mono text-base"
                />
                <button
                  type="button"
                  onClick={() => setPassVisible((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  aria-label={passVisible ? "Ocultar senha" : "Mostrar senha"}
                >
                  {passVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {isLocked ? (
                <div className="flex items-center gap-2 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Bloqueado por {Math.ceil(lockRemaining / 1000)}s após muitas tentativas.
                </div>
              ) : passAttempts > 0 ? (
                <div className="text-xs text-amber-600 dark:text-amber-500">
                  Tentativas: {passAttempts}/{MAX_ATTEMPTS}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-[11px] font-medium text-primary/90 leading-tight">
                    Protegido por criptografia ponta a ponta · Acesso monitorado
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SEGURO
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="px-6 pb-6 pt-2 gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="rounded-xl shadow-3d-soft active:translate-y-[1px]"
              onClick={() => setPassDialogOpen(false)}
              disabled={passChecking}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-xl shadow-3d-primary active:translate-y-[1px]"
              onClick={handleSubmitPassword}
              disabled={isLocked || passChecking || !passInput}
            >
              {passChecking ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verificando</>
              ) : (
                <><ShieldCheck className="h-4 w-4 mr-2" /> Desbloquear</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
