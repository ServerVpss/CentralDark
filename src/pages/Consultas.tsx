import { useState } from "react";
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
  History,
  Star,
  AlertCircle,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ResultDisplay } from "@/components/consultation/ResultDisplay";
import { ConfettiCelebration } from "@/components/gamification/ConfettiCelebration";
import { MotionPage, MotionFadeIn } from "@/components/ui/motion";

interface QueryResult {
  success: boolean;
  data: any;
  duration_ms: number;
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
  const [selectedState, setSelectedState] = useState("SP");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<any[]>([]);
  const [networkBlockedHint, setNetworkBlockedHint] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

    setIsLoading(true);
    setResult(null);
    setNetworkBlockedHint(null);
    setShowConfetti(false);

    try {
      const maxRetries = 1; // total: 2 tentativas
      const retryDelayMs = 800;

      let lastError: any = null;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const { data, error } = await supabase.functions.invoke("api-query", {
          body: {
            queryType: selectedType,
            queryInput: queryInput.trim(),
            estado: selectedType === "foto" ? selectedState : undefined,
          },
        });

        if (!error) {
          setResult(data as QueryResult);

          if (data?.success) {
            // Trigger celebration!
            setShowConfetti(true);
            
            // Haptic feedback
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            
            toast.success(`Consulta realizada em ${data.duration_ms}ms`);
            setQueryHistory((prev) =>
              [
                {
                  type: selectedType,
                  input: queryInput,
                  timestamp: new Date().toISOString(),
                  success: true,
                },
                ...prev.slice(0, 9),
              ],
            );
          } else {
            toast.error("Consulta retornou erro");
          }

          return;
        }

        lastError = error;

        if (isNetworkBlockedError(error) && attempt < maxRetries) {
          toast.message("Falha de conexão — tentando novamente...");
          await sleep(retryDelayMs);
          continue;
        }

        console.error("Query error:", error);
        if (isNetworkBlockedError(error)) {
          setNetworkBlockedHint(
            "Uma extensão do navegador (VPN/AdBlock/Proxy) ou firewall pode estar bloqueando a requisição. Teste em aba anônima ou desative extensões temporariamente.",
          );
          toast.error("Erro na consulta: conexão bloqueada no navegador");
        } else {
          toast.error("Erro na consulta: " + (error.message || "Erro desconhecido"));
        }
        return;
      }

      // fallback (não deve acontecer)
      if (lastError) throw lastError;
    } catch (err) {
      console.error("Fetch error:", err);
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
                  <div className="space-y-2">
                    <Label htmlFor="queryInput">
                      {selectedQueryType?.label || "Valor"} para consultar
                    </Label>
                    <Input
                      id="queryInput"
                      placeholder={`Digite o ${selectedQueryType?.label.toLowerCase() || "valor"}...`}
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      className="bg-secondary/50"
                      onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                    />
                  </div>

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
                    disabled={isLoading}
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
                        {result.success ? "Sucesso" : "Erro"}
                      </Badge>
                    </div>
                    <CardDescription>
                      Consulta realizada em {result.duration_ms}ms
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
            {/* Providers Status */}
            <MotionFadeIn delay={0.2}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Provedores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "NexFuture", port: 25589, status: "online" },
                    { name: "TConect Score", port: 3029, status: "online" },
                    { name: "TConect Foto", port: 3030, status: "online" },
                  ].map((provider) => (
                    <div
                      key={provider.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
                    >
                      <div>
                        <p className="font-medium text-sm">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">Porta {provider.port}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/30"
                      >
                        Online
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </MotionFadeIn>

            {/* Recent Queries */}
            <MotionFadeIn delay={0.3}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Histórico Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {queryHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma consulta realizada
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {queryHistory.map((query, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-secondary/20 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="font-medium truncate">{query.type.toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {query.input}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              query.success
                                ? "bg-success/10 text-success border-success/30"
                                : "bg-destructive/10 text-destructive border-destructive/30"
                            }
                          >
                            {query.success ? "OK" : "Erro"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
