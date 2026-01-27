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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  const handleQuery = async () => {
    if (!queryInput.trim()) {
      toast.error("Digite um valor para consultar");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("api-query", {
        body: {
          queryType: selectedType,
          queryInput: queryInput.trim(),
          estado: selectedType === "foto" ? selectedState : undefined,
        },
      });

      if (error) {
        console.error("Query error:", error);
        toast.error("Erro na consulta: " + error.message);
        return;
      }

      setResult(data as QueryResult);
      
      if (data?.success) {
        toast.success(`Consulta realizada em ${data.duration_ms}ms`);
        setQueryHistory(prev => [{
          type: selectedType,
          input: queryInput,
          timestamp: new Date().toISOString(),
          success: true,
        }, ...prev.slice(0, 9)]);
      } else {
        toast.error("Consulta retornou erro");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Falha na comunicação com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedQueryType = queryTypes.find(q => q.value === selectedType);

  const renderResultData = (data: any) => {
    if (!data) return null;

    if (typeof data === "string") {
      return <p className="text-muted-foreground">{data}</p>;
    }

    if (data.error) {
      return (
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>{data.error}</span>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {Object.entries(data).map(([key, value]) => {
          if (key === "foto" && typeof value === "string" && value.startsWith("http")) {
            return (
              <div key={key} className="space-y-2">
                <Label className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</Label>
                <img 
                  src={value} 
                  alt="Foto" 
                  className="max-w-xs rounded-lg border border-border"
                />
              </div>
            );
          }

          if (typeof value === "object" && value !== null) {
            return (
              <div key={key} className="space-y-2">
                <Label className="text-muted-foreground capitalize font-semibold">{key.replace(/_/g, " ")}</Label>
                <div className="pl-4 border-l-2 border-primary/30">
                  {renderResultData(value)}
                </div>
              </div>
            );
          }

          return (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
              <Label className="text-muted-foreground capitalize min-w-[150px]">{key.replace(/_/g, " ")}:</Label>
              <span className="font-medium break-all">{String(value)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
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

            {/* Results */}
            {result && (
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
                  <div className="bg-secondary/30 rounded-lg p-4 overflow-auto max-h-[500px]">
                    {renderResultData(result.data)}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Providers Status */}
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

            {/* Recent Queries */}
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

            {/* Quick Tips */}
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
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
