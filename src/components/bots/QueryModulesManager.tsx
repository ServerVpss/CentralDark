import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search, FileText, Car, Phone, CreditCard,
  CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QueryModule {
  key: string;
  label: string;
  enabled: boolean;
  category: string;
  url: string;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; gradient: string }> = {
  documentos: { label: "Documentos", icon: FileText, gradient: "from-blue-500 to-cyan-500" },
  veiculos: { label: "Veículos", icon: Car, gradient: "from-amber-500 to-orange-500" },
  contato: { label: "Contato", icon: Phone, gradient: "from-emerald-500 to-green-500" },
  financeiro: { label: "Financeiro", icon: CreditCard, gradient: "from-violet-500 to-purple-500" },
};

// Módulos hardcoded - reflete o estado atual no edge function
// Para ativar/desativar de verdade, é preciso alterar o enabledQueryTypes no telegram-webhook
const defaultModules: QueryModule[] = [
  { key: "cpf", label: "CPF", enabled: false, category: "documentos", url: "nxf-2.nexfuture.com.br:25594/cpf" },
  { key: "cnpj", label: "CNPJ", enabled: false, category: "documentos", url: "nxf-2.nexfuture.com.br:25589/cnpj" },
  { key: "nome", label: "Nome", enabled: false, category: "documentos", url: "nxf-2.nexfuture.com.br:25589/nome" },
  { key: "rg", label: "RG", enabled: false, category: "documentos", url: "nxf-2.nexfuture.com.br:25589/rg" },
  { key: "cnh", label: "CNH", enabled: false, category: "documentos", url: "nxf-2.nexfuture.com.br:25589/cnh" },
  { key: "cns", label: "CNS", enabled: false, category: "documentos", url: "nxf-2.nexfuture.com.br:25589/cns" },
  { key: "foto", label: "Foto", enabled: false, category: "documentos", url: "node.tconect.xyz:3030/foto" },
  { key: "nacional", label: "Foto Nacional", enabled: false, category: "documentos", url: "node.tconect.xyz:3030/foto (todos estados)" },
  { key: "parentes", label: "Parentes", enabled: false, category: "documentos", url: "nxf-2.nexfuture.com.br:25589/parentes" },
  { key: "empregos", label: "Empregos", enabled: false, category: "documentos", url: "nxf-2.nexfuture.com.br:25589/empregos" },
  { key: "placa", label: "Placa", enabled: false, category: "veiculos", url: "nxf-2.nexfuture.com.br:25589/placa" },
  { key: "placa_completa", label: "Placa Completa", enabled: false, category: "veiculos", url: "node.tconect.xyz:3041/placa1" },
  { key: "chassi", label: "Chassi", enabled: false, category: "veiculos", url: "nxf-2.nexfuture.com.br:25589/chassi" },
  { key: "renavam", label: "Renavam", enabled: false, category: "veiculos", url: "nxf-2.nexfuture.com.br:25589/renavam" },
  { key: "motor", label: "Motor", enabled: false, category: "veiculos", url: "nxf-2.nexfuture.com.br:25589/motor" },
  { key: "frota", label: "Frota", enabled: false, category: "veiculos", url: "nxf-2.nexfuture.com.br:25589/frota" },
  { key: "telefone", label: "Telefone", enabled: false, category: "contato", url: "nxf-2.nexfuture.com.br:25589/telefone" },
  { key: "email", label: "Email", enabled: false, category: "contato", url: "nxf-2.nexfuture.com.br:25589/email" },
  { key: "cep", label: "CEP", enabled: false, category: "contato", url: "nxf-2.nexfuture.com.br:25589/cep" },
  { key: "score", label: "Score", enabled: false, category: "financeiro", url: "node.tconect.xyz:3036/score" },
  { key: "pix", label: "PIX", enabled: false, category: "financeiro", url: "nxf-2.nexfuture.com.br:25589/pix" },
  { key: "bin", label: "BIN", enabled: false, category: "financeiro", url: "nxf-2.nexfuture.com.br:25589/bin" },
];

export function QueryModulesManager() {
  const [modules] = useState<QueryModule[]>(defaultModules);

  const enabledCount = modules.filter(m => m.enabled).length;
  const grouped = modules.reduce<Record<string, QueryModule[]>>((acc, mod) => {
    (acc[mod.category] = acc[mod.category] || []).push(mod);
    return acc;
  }, {});

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
                Status de cada módulo de consulta do bot
              </CardDescription>
            </div>
            <Badge variant="outline" className={cn(
              "text-xs",
              enabledCount > 0 ? "border-success/50 text-success" : "border-destructive/50 text-destructive"
            )}>
              {enabledCount}/{modules.length} ativos
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Info Banner */}
      <Card className="bg-card border-warning/20">
        <CardContent className="flex items-start gap-3 pt-4 pb-4">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-warning mb-1">Módulos controlados pelo servidor</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Quando um módulo está <strong>desativado</strong>, o bot <strong>ignora silenciosamente</strong> o comando — 
              não envia nenhuma mensagem de erro. Isso evita confusão com outros bots no grupo.
              <br />
              Para ativar/desativar módulos, é necessário atualizar o código do webhook no servidor (edge function).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modules by Category */}
      {Object.entries(grouped).map(([category, catModules]) => {
        const config = categoryConfig[category] || categoryConfig.documentos;
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
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {catModules.map((mod, idx) => (
                <div key={mod.key}>
                  {idx > 0 && <Separator />}
                  <div className="px-4 py-3">
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
                              /{mod.key}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate font-mono mt-0.5">
                            {mod.url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Switch
                          checked={mod.enabled}
                          disabled
                          className="opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
