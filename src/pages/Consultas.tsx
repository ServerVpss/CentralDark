import { useState, useCallback } from "react";
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
  AlertCircle,
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
  duration_ms: number;
  fromCache?: boolean;
}

const queryTypes = [
  { value: "cpf", label: "CPF", icon: User, provider: "NexFuture" },
  { value: "cnpj", label: "CNPJ", icon: Building2, provider: "NexFuture" },
  { value: "placa", label: "Placa (Básica)", icon: Car, provider: "NexFuture" },
  { value: "placa_completa", label: "Placa Completa", icon: Car, provider: "TConect" },
  { value: "telefone", label: "Telefone", icon: Phone, provider: "NexFuture" },
  { value: "email", label: "Email", icon: Mail, provider: "NexFuture" },
  { value: "cep", label: "CEP", icon: MapPin, provider: "NexFuture" },
  { value: "nome", label: "Nome", icon: User, provider: "NexFuture" },
  { value: "score", label: "Score de Crédito", icon: Star, provider: "TConect" },
  { value: "foto", label: "Foto por Estado", icon: Camera, provider: "TConect Foto" },
  { value: "nacional", label: "Foto Nacional", icon: Camera, provider: "TConect Foto" },
  { value: "rg", label: "RG", icon: FileText, provider: "NexFuture" },
  { value: "cnh", label: "CNH", icon: FileText, provider: "NexFuture" },
  { value: "pix", label: "PIX", icon: CreditCard, provider: "NexFuture" },
];

const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

export default function Consultas() {
  const [selectedType, setSelectedType] = useState("cpf");
  const [queryInput, setQueryInput] = useState("");
  const [cleanQueryInput, setCleanQueryInput] = useState("");
  const [isInputValid, setIsInputValid] = useState(true);
  const [selectedState, setSelectedState] = useState("SP");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [networkBlockedHint, setNetworkBlockedHint] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleInputChange = useCallback((value: string, cleanValue: string, isValid: boolean) => {
    setQueryInput(value);
    setCleanQueryInput(cleanValue);
    setIsInputValid(isValid);
  }, []);

  const textModules = ["nome", "mae", "endereco", "email", "pix"];
  
  const handleHistorySelect = useCallback((type: string, input: string) => {
    setSelectedType(type);
    setQueryInput(input);
    // For text-based modules, preserve the original input (letters, spaces)
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

    const inputToQuery = cleanQueryInput || queryInput.trim();
    const requestBody = {
      queryType: selectedType,
      queryInput: inputToQuery,
      estado: selectedType === "foto" ? selectedState : undefined,
    };

    // Fallback direto via fetch caso supabase.functions.invoke falhe
    const directFetch = async (): Promise<QueryResult | null> => {
      const EDGE_URL = "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/api-query";
      try {
        const response = await fetch(EDGE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
      } catch (err) {
        console.error("Direct fetch fallback error:", err);
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

          if (data?.success) {
            setShowConfetti(true);
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            toast.success(`Consulta realizada em ${data.duration_ms}ms`);
          } else {
            toast.error("Consulta retornou erro");
          }
          return;
        }

        lastError = error;

        // Se for erro de rede, tenta fallback direto
        if (isNetworkBlockedError(error)) {
          if (attempt < maxRetries) {
            toast.message("Falha de conexão — tentando novamente...");
            await sleep(retryDelayMs);
            continue;
          }

          // Última tentativa: fallback com fetch direto
          toast.message("Tentando conexão alternativa...");
          const fallbackResult = await directFetch();
          
          if (fallbackResult) {
            setResult(fallbackResult);
            if (fallbackResult.success) {
              setShowConfetti(true);
              if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
              }
              toast.success(`Consulta realizada em ${fallbackResult.duration_ms}ms (via fallback)`);
            } else {
              toast.error("Consulta retornou erro");
            }
            return;
          }

          // Fallback também falhou
          setNetworkBlockedHint(
            "Uma extensão do navegador (VPN/AdBlock/Proxy) ou firewall pode estar bloqueando a requisição. Teste em aba anônima ou desative extensões temporariamente.",
          );
          toast.error("Erro na consulta: conexão bloqueada no navegador");
          return;
        }

        console.error("Query error:", error);
        toast.error("Erro na consulta: " + (error.message || "Erro desconhecido"));
        return;
      }

      if (lastError) throw lastError;
    } catch (err) {
      console.error("Fetch error:", err);
      
      // Tenta fallback mesmo no catch
      const fallbackResult = await directFetch();
      if (fallbackResult) {
        setResult(fallbackResult);
        if (fallbackResult.success) {
          setShowConfetti(true);
          toast.success(`Consulta realizada em ${fallbackResult.duration_ms}ms (via fallback)`);
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

  const selectedQueryType = queryTypes.find(q => q.value === selectedType);

  return (
    <DashboardLayout>
      <ConfettiCelebration
        isActive={showConfetti}
        onComplete={() => setShowConfetti(false)}
        message="Consulta Concluída!"
        subMessage="Resultado encontrado com sucesso."
        icon="check"
      />
      
      <MotionPage className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Consultas</h1>
          <p className="text-muted-foreground">
            Sistema integrado de consulta de dados via APIs
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
                    Selecione o tipo de consulta e insira os dados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Query Type Selection */}
                  <div className="space-y-2">
                    <Label>Tipo de Consulta</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {queryTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setSelectedType(type.value)}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                            selectedType === type.value
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-secondary/20 hover:border-primary/50"
                          }`}
                        >
                          <type.icon className="h-4 w-4 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{type.label}</p>
                            <p className="text-xs text-muted-foreground truncate">{type.provider}</p>
                          </div>
                        </button>
                      ))}
                    </div>
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
                      <div className="flex items-center gap-2">
                        {result.fromCache && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1">
                            <Zap className="h-3 w-3" />
                            Cache
                          </Badge>
                        )}
                        <Badge variant={result.success ? "default" : "destructive"}>
                          {result.success ? "Sucesso" : "Erro"}
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>
                      Consulta realizada em {result.duration_ms}ms
                      {result.fromCache && " (do índice)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResultDisplay result={result.data} showCopyButton={true} />
                  </CardContent>
                </Card>
              </MotionFadeIn>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cache Stats */}
            <MotionFadeIn delay={0.15}>
              <CacheStats />
            </MotionFadeIn>

            {/* Providers Status */}
            <MotionFadeIn delay={0.2}>
              <ProviderStatusList />
            </MotionFadeIn>

            {/* Recent Queries - Persistent from Database */}
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
                  <p>• CPF: Digite apenas números (11 dígitos)</p>
                  <p>• CNPJ: Digite apenas números (14 dígitos)</p>
                  <p>• Placa: Formato ABC1234 ou ABC1D23</p>
                  <p>• Telefone: DDD + número (11 dígitos)</p>
                  <p>• CEP: Digite apenas números (8 dígitos)</p>
                </CardContent>
              </Card>
            </MotionFadeIn>
          </div>
        </div>
      </MotionPage>
    </DashboardLayout>
  );
}
