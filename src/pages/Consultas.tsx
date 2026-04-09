import { useState, useCallback, useEffect } from "react";
import {
  CreditCard,
  Search,
  User,
  Building2,
  Car,
  Phone,
  Mail,
  MapPin,
  Camera,
  FileText,
  Loader2,
  Star,
  AlertCircle,
  Shield,
  Hash,
  Fingerprint,
  Scale,
  Heart,
  Users,
  Wallet,
  Cog,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ResultDisplay } from "@/components/consultation/ResultDisplay";
import { QueryInput } from "@/components/consultation/QueryInput";
import { QueryHistoryList } from "@/components/consultation/QueryHistoryList";
import { ProviderStatusList } from "@/components/consultation/ProviderStatusList";

import { ConfettiCelebration } from "@/components/gamification/ConfettiCelebration";
import { MotionPage, MotionFadeIn } from "@/components/ui/motion";

interface QueryResult {
  success: boolean;
  data: any;
  meta?: {
    request_id: string;
    modulo: string;
    channel: string;
    duration_ms: number;
    provider_duration_ms: number;
    internal_duration_ms: number;
    status: string;
  };
  errors?: string[];
  // Legacy fields for backwards compat
  duration_ms?: number;
}

// =============== SUGESTÃO DE CORREÇÃO ORTOGRÁFICA ===============
const NAME_CORRECTIONS: Record<string, string[]> = {
  gertudes: ['gertrudes'], gertrude: ['gertrudes'],
  goncalves: ['gonçalves'], gonsalves: ['gonçalves'],
  conceicao: ['conceição'], conseicao: ['conceição'],
  aparesida: ['aparecida'], aparessida: ['aparecida'],
  tereza: ['tereza', 'theresa', 'teresa'],
  rodriges: ['rodrigues'], ferrera: ['ferreira'], fereira: ['ferreira'],
  olivera: ['oliveira'], oliviera: ['oliveira'],
  fransisco: ['francisco'], sebastiao: ['sebastião'], sabastiao: ['sebastião'],
  joaqim: ['joaquim'], lusio: ['lúcio'],
  anthonio: ['antônio'], joze: ['josé'],
  teixera: ['teixeira'], perera: ['pereira'],
  riberio: ['ribeiro'], riveiro: ['ribeiro'],
  mashado: ['machado'], carvalhu: ['carvalho'],
  mendonca: ['mendonça'], araujo: ['araújo'], arauho: ['araújo'],
  alvez: ['alves'], nunez: ['nunes'], lopez: ['lopes'], ramoz: ['ramos'],
  soussa: ['souza', 'sousa'], almeyda: ['almeida'],
};

function normalizeForComparison(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function suggestNameCorrections(input: string): string[] {
  const words = input.trim().split(/\s+/);
  if (words.length === 0) return [];
  const suggestions = new Set<string>();
  const inputNormalized = normalizeForComparison(input);

  for (let i = 0; i < words.length; i++) {
    const wordNorm = normalizeForComparison(words[i]);
    const corrections = NAME_CORRECTIONS[wordNorm];
    if (corrections) {
      for (const correction of corrections) {
        const corrected = correction.charAt(0).toUpperCase() + correction.slice(1);
        const newWords = [...words];
        newWords[i] = corrected;
        const suggestion = newWords.join(' ');
        if (normalizeForComparison(suggestion) !== inputNormalized) {
          suggestions.add(suggestion);
        }
      }
    }
  }

  // Insert common missing letters
  for (let i = 0; i < words.length; i++) {
    const wordNorm = normalizeForComparison(words[i]);
    if (wordNorm.length < 4) continue;
    const inserts: [string, string][] = [['rt', 'rtr'], ['gu', 'gue'], ['ei', 'eir']];
    for (const [pattern, replacement] of inserts) {
      if (wordNorm.includes(pattern) && !wordNorm.includes(replacement)) {
        const variant = words[i].replace(new RegExp(pattern, 'i'), replacement);
        const cap = variant.charAt(0).toUpperCase() + variant.slice(1).toLowerCase();
        if (normalizeForComparison(cap) !== wordNorm) {
          const newWords = [...words];
          newWords[i] = cap;
          suggestions.add(newWords.join(' '));
        }
      }
    }
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const s of suggestions) {
    const norm = normalizeForComparison(s);
    if (norm === inputNormalized || seen.has(norm)) continue;
    seen.add(norm);
    unique.push(s);
    if (unique.length >= 3) break;
  }
  return unique;
}

interface QueryModule {
  module_key: string;
  label: string;
  icon: string;
  category: string;
  enabled: boolean;
  provider: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "👤": User, "🏢": Building2, "🚗": Car, "📞": Phone, "📧": Mail,
  "📍": MapPin, "📸": Camera, "📝": FileText, "📊": Star, "🪪": Fingerprint,
  "💳": CreditCard, "📜": FileText, "💰": Wallet, "⚖️": Scale, "🔍": Search,
  "🔎": Search, "🗳️": FileText, "👩": Users, "💎": Star, "🏥": Heart,
  "📋": FileText, "👨‍👩‍👧‍👦": Users, "🔧": Cog, "⚙️": Cog, "🇧🇷": Camera,
  "🛡️": Shield, "📦": Hash,
};

const brazilianStates = [
  "SP", "RJ", "MG", "PR", "CE", "MA", "ES", "DF", "TO", "MS", "RO", "PI"
];

// Fallback modules if DB load fails
const fallbackModules: QueryModule[] = [
  { module_key: "cpf", label: "CPF", icon: "👤", category: "pessoa", enabled: true, provider: "VeiculosAPI" },
  { module_key: "cpffull", label: "CPF Full", icon: "👤", category: "pessoa", enabled: true, provider: "VeiculosAPI" },
  { module_key: "nome", label: "Nome", icon: "📝", category: "pessoa", enabled: true, provider: "VeiculosAPI" },
  { module_key: "placa", label: "Placa", icon: "🚗", category: "veiculo", enabled: true, provider: "VeiculosAPI" },
  { module_key: "telefone", label: "Telefone", icon: "📞", category: "contato", enabled: true, provider: "VeiculosAPI" },
  { module_key: "email", label: "Email", icon: "📧", category: "contato", enabled: true, provider: "VeiculosAPI" },
  { module_key: "cep", label: "CEP", icon: "📍", category: "contato", enabled: true, provider: "VeiculosAPI" },
  { module_key: "foto", label: "Foto por Estado", icon: "📸", category: "foto", enabled: true, provider: "VeiculosAPI" },
  { module_key: "nacional", label: "Foto Nacional", icon: "🇧🇷", category: "foto", enabled: true, provider: "VeiculosAPI" },
];

export default function Consultas() {
  const [modules, setModules] = useState<QueryModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [selectedType, setSelectedType] = useState("cpf");
  const [queryInput, setQueryInput] = useState("");
  const [cleanQueryInput, setCleanQueryInput] = useState("");
  const [isInputValid, setIsInputValid] = useState(true);
  const [selectedState, setSelectedState] = useState("SP");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [networkBlockedHint, setNetworkBlockedHint] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Load modules from DB
  useEffect(() => {
    const loadModules = async () => {
      try {
        const { data, error } = await supabase
          .from("query_modules")
          .select("module_key, label, icon, category, enabled, provider")
          .order("category")
          .order("label");

        if (error || !data || data.length === 0) {
          setModules(fallbackModules);
        } else {
          setModules(data.filter(m => m.enabled) as QueryModule[]);
        }
      } catch {
        setModules(fallbackModules);
      } finally {
        setLoadingModules(false);
      }
    };
    loadModules();
  }, []);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleInputChange = useCallback((value: string, cleanValue: string, isValid: boolean) => {
    setQueryInput(value);
    setCleanQueryInput(cleanValue);
    setIsInputValid(isValid);
  }, []);

  const textModules = ["nome", "nomefull", "nome-3", "mae", "maefull", "endereco", "email", "emailfull", "email-3", "pix"];
  
  const handleHistorySelect = useCallback((type: string, input: string) => {
    setSelectedType(type);
    setQueryInput(input);
    const clean = textModules.includes(type) ? input.trim() : (input.replace(/\D/g, '') || input);
    setCleanQueryInput(clean);
    setIsInputValid(true);
  }, []);

  const isNetworkBlockedError = (err: unknown) => {
    const e = err as any;
    const name = String(e?.name || "");
    const message = String(e?.message || "");
    const contextMessage = String(e?.context?.message || e?.context?.value?.message || "");
    const combined = `${name} ${message} ${contextMessage}`.toLowerCase();
    return (
      name === "FunctionsFetchError" ||
      combined.includes("failed to send a request to the edge function") ||
      combined.includes("failed to fetch")
    );
  };

  const handleQuery = async () => {
    if (!queryInput.trim()) {
      toast.error("Digite um valor para consultar");
      return;
    }

    if (!isInputValid) {
      toast.error("Corrija o valor antes de consultar");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setNetworkBlockedHint(null);
    setShowConfetti(false);
    setNameSuggestions([]);

    const inputToQuery = cleanQueryInput || queryInput.trim();
    const requestBody = {
      queryType: selectedType,
      queryInput: inputToQuery,
      estado: selectedType === "foto" ? selectedState : undefined,
      channel: "admin_panel",
    };

    const directFetch = async (): Promise<QueryResult | null> => {
      const EDGE_URL = `https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/api-query`;
      try {
        const response = await fetch(EDGE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch {
        return null;
      }
    };

    try {
      const maxRetries = 1;
      const retryDelayMs = 800;
      let lastError: any = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const { data, error } = await supabase.functions.invoke("api-query", {
          body: requestBody,
        });

        if (!error) {
          setResult(data as QueryResult);
          const d = data as QueryResult;
          const durationMs = d.meta?.duration_ms || d.duration_ms || 0;
          const providerMs = d.meta?.provider_duration_ms;

          if (d.success) {
            setShowConfetti(true);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
            const timeInfo = providerMs !== undefined
              ? `${durationMs}ms (provedor: ${providerMs}ms)`
              : `${durationMs}ms`;
            toast.success(`Consulta realizada em ${timeInfo}`);
          } else {
            // Para módulos de nome sem resultado, gerar sugestões
            const nameModules = ['nome', 'nomefull', 'nome-3', 'nomeabreviadofiltros', 'mae', 'maefull'];
            if (nameModules.includes(selectedType)) {
              const suggestions = suggestNameCorrections(inputToQuery);
              setNameSuggestions(suggestions);
            }
            const errMsg = d.errors?.[0] || "Consulta retornou erro";
            toast.error(errMsg);
          }
          return;
        }

        lastError = error;

        if (isNetworkBlockedError(error)) {
          if (attempt < maxRetries) {
            toast.message("Falha de conexão — tentando novamente...");
            await sleep(retryDelayMs);
            continue;
          }

          toast.message("Tentando conexão alternativa...");
          const fallbackResult = await directFetch();
          if (fallbackResult) {
            setResult(fallbackResult);
            if (fallbackResult.success) {
              setShowConfetti(true);
              if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
              toast.success(`Consulta realizada (via fallback)`);
            } else {
              toast.error(fallbackResult.errors?.[0] || "Consulta retornou erro");
            }
            return;
          }

          setNetworkBlockedHint(
            "Uma extensão do navegador (VPN/AdBlock/Proxy) ou firewall pode estar bloqueando a requisição. Teste em aba anônima ou desative extensões temporariamente.",
          );
          toast.error("Erro na consulta: conexão bloqueada no navegador");
          return;
        }

        toast.error("Erro na consulta: " + (error.message || "Erro desconhecido"));
        return;
      }

      if (lastError) throw lastError;
    } catch (err) {
      const fallbackResult = await directFetch();
      if (fallbackResult) {
        setResult(fallbackResult);
        if (fallbackResult.success) {
          setShowConfetti(true);
          toast.success(`Consulta realizada (via fallback)`);
        }
        return;
      }

      if (isNetworkBlockedError(err)) {
        setNetworkBlockedHint(
          "Uma extensão do navegador (VPN/AdBlock/Proxy) ou firewall pode estar bloqueando a requisição. Teste em aba anônima ou desative extensões temporariamente.",
        );
        toast.error("Falha na comunicação: conexão bloqueada no navegador");
      } else {
        toast.error("Falha na comunicação com o servidor");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModule = modules.find(m => m.module_key === selectedType);
  const durationMs = result?.meta?.duration_ms || result?.duration_ms || 0;
  const providerMs = result?.meta?.provider_duration_ms;
  const internalMs = result?.meta?.internal_duration_ms;
  const requestId = result?.meta?.request_id;

  return (
    <DashboardLayout>
      <ConfettiCelebration
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
        message="Consulta Concluída!"
        subMessage="Resultado encontrado com sucesso."
        icon="check"
      />
      
      <MotionPage className="space-y-5 max-w-[1400px] mx-auto">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Consultas</h1>
          <p className="text-sm text-muted-foreground">
            Sistema integrado de consulta de dados via API
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Query Form */}
          <div className="lg:col-span-2 space-y-6">
            <MotionFadeIn delay={0.1}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Nova Consulta
                  </CardTitle>
                  <CardDescription>
                    Selecione o módulo exato e insira os dados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Module Selection */}
                  <div className="space-y-2">
                    <Label>Módulo de Consulta</Label>
                    {loadingModules ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando módulos...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto pr-1">
                        {modules.map((mod) => {
                          const IconComp = iconMap[mod.icon] || FileText;
                          return (
                            <button
                              key={mod.module_key}
                              onClick={() => setSelectedType(mod.module_key)}
                              className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left relative ${
                                selectedType === mod.module_key
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border bg-secondary/20 hover:border-primary/50"
                              }`}
                            >
                              <IconComp className="h-4 w-4 shrink-0" />
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-sm truncate">{mod.label}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{mod.module_key}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Input Field */}
                  <QueryInput
                    queryType={selectedType}
                    value={queryInput}
                    onChange={handleInputChange}
                    onSubmit={handleQuery}
                    disabled={isLoading}
                  />

                  {/* State Selection for Foto */}
                  {selectedType === "foto" && (
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select value={selectedState} onValueChange={setSelectedState}>
                        <SelectTrigger className="bg-secondary/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {brazilianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {networkBlockedHint && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <div>
                        <AlertTitle>Não foi possível conectar</AlertTitle>
                        <AlertDescription>
                          <p>{networkBlockedHint}</p>
                          <p className="mt-2">Dica rápida: tente em uma janela anônima/privada.</p>
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    variant="glow"
                    className="w-full gap-2"
                    onClick={handleQuery}
                    disabled={isLoading || !isInputValid}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Consultando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Realizar Consulta
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </MotionFadeIn>

            {/* Results */}
            {result && (
              <MotionFadeIn delay={0.2}>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Resultado</CardTitle>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.meta?.status || (result.success ? "Sucesso" : "Erro")}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex flex-wrap gap-3 text-xs">
                        <span>⏱️ Total: <b>{durationMs}ms</b></span>
                        {providerMs !== undefined && (
                          <span>🌐 Provedor: <b>{providerMs}ms</b></span>
                        )}
                        {internalMs !== undefined && (
                          <span>⚙️ Interno: <b>{internalMs}ms</b></span>
                        )}
                      </div>
                      {requestId && (
                        <p className="text-xs text-muted-foreground font-mono">
                          ID: {requestId.substring(0, 8)}...
                        </p>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result.errors && result.errors.length > 0 && !result.success && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {result.errors.join(". ")}
                        </AlertDescription>
                      </Alert>
                    )}
                    <ResultDisplay result={result.data} showCopyButton={true} />
                  </CardContent>
                </Card>
              </MotionFadeIn>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Providers Status */}
            <MotionFadeIn delay={0.2}>
              <ProviderStatusList />
            </MotionFadeIn>

            {/* Recent Queries */}
            <MotionFadeIn delay={0.3}>
              <QueryHistoryList onSelectQuery={handleHistorySelect} />
            </MotionFadeIn>

            {/* Quick Tips */}
            <MotionFadeIn delay={0.4}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Dicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• <b>CPF:</b> apenas números (11 dígitos)</p>
                  <p>• <b>CNPJ:</b> apenas números (14 dígitos)</p>
                  <p>• <b>Placa:</b> formato ABC1234 ou ABC1D23</p>
                  <p>• <b>Telefone:</b> DDD + número (10-11 dígitos)</p>
                  <p>• <b>CEP:</b> apenas números (8 dígitos)</p>
                  <p>• O módulo executado é <b>exatamente</b> o selecionado</p>
                  <p>• Resultados incluem métricas de tempo</p>
                </CardContent>
              </Card>
            </MotionFadeIn>
          </div>
        </div>
      </MotionPage>
    </DashboardLayout>
  );
}
