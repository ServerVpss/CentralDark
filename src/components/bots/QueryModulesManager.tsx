import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Server } from "lucide-react";

interface ModuleInfo {
  key: string;
  label: string;
  icon: string;
  enabled: boolean;
  provider: string;
  category: string;
}

const modules: ModuleInfo[] = [
  { key: "cpf", label: "CPF", icon: "👤", enabled: false, provider: "NexFuture", category: "pessoa" },
  { key: "nome", label: "Nome", icon: "📝", enabled: false, provider: "NexFuture", category: "pessoa" },
  { key: "foto", label: "Foto", icon: "📸", enabled: false, provider: "TConect", category: "pessoa" },
  { key: "nacional", label: "Foto Nacional", icon: "🇧🇷", enabled: false, provider: "TConect", category: "pessoa" },
  { key: "parentes", label: "Parentes", icon: "👨‍👩‍👧‍👦", enabled: false, provider: "NexFuture", category: "pessoa" },
  { key: "empregos", label: "Empregos", icon: "💼", enabled: false, provider: "NexFuture", category: "pessoa" },
  { key: "rg", label: "RG", icon: "🪪", enabled: false, provider: "NexFuture", category: "documento" },
  { key: "cnh", label: "CNH", icon: "🪪", enabled: false, provider: "NexFuture", category: "documento" },
  { key: "cns", label: "CNS", icon: "🏥", enabled: false, provider: "NexFuture", category: "documento" },
  { key: "telefone", label: "Telefone", icon: "📞", enabled: false, provider: "NexFuture", category: "contato" },
  { key: "email", label: "Email", icon: "📧", enabled: false, provider: "NexFuture", category: "contato" },
  { key: "cep", label: "CEP", icon: "📍", enabled: false, provider: "NexFuture", category: "contato" },
  { key: "pix", label: "PIX", icon: "💳", enabled: false, provider: "NexFuture", category: "financeiro" },
  { key: "score", label: "Score", icon: "📊", enabled: false, provider: "TConect", category: "financeiro" },
  { key: "bin", label: "BIN", icon: "💳", enabled: false, provider: "NexFuture", category: "financeiro" },
  { key: "placa", label: "Placa", icon: "🚗", enabled: false, provider: "NexFuture", category: "veiculo" },
  { key: "placa_completa", label: "Placa Completa", icon: "🚗", enabled: false, provider: "TConect", category: "veiculo" },
  { key: "chassi", label: "Chassi", icon: "🔧", enabled: false, provider: "NexFuture", category: "veiculo" },
  { key: "renavam", label: "RENAVAM", icon: "📋", enabled: false, provider: "NexFuture", category: "veiculo" },
  { key: "motor", label: "Motor", icon: "⚙️", enabled: false, provider: "NexFuture", category: "veiculo" },
  { key: "frota", label: "Frota", icon: "🚛", enabled: false, provider: "NexFuture", category: "veiculo" },
  { key: "cnpj", label: "CNPJ", icon: "🏢", enabled: false, provider: "NexFuture", category: "empresa" },
];

const categories: Record<string, { label: string; icon: string }> = {
  pessoa: { label: "Pessoa", icon: "👤" },
  documento: { label: "Documentos", icon: "📄" },
  contato: { label: "Contato & Endereço", icon: "📱" },
  financeiro: { label: "Financeiro", icon: "💰" },
  veiculo: { label: "Veículos", icon: "🚗" },
  empresa: { label: "Empresa", icon: "🏢" },
};

const categoryOrder = ["pessoa", "documento", "contato", "financeiro", "veiculo", "empresa"];

export function QueryModulesManager() {
  const enabledCount = modules.filter(m => m.enabled).length;

  const grouped = categoryOrder.reduce((acc, cat) => {
    acc[cat] = modules.filter(m => m.category === cat);
    return acc;
  }, {} as Record<string, ModuleInfo[]>);

  return (
    <div className="space-y-6">
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Todos os servidores de consulta estão offline
              </p>
              <p className="text-xs text-muted-foreground">
                Módulos desativados fazem o bot <strong>ignorar silenciosamente</strong> o comando — sem resposta alguma.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{modules.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{enabledCount}</div>
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

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-primary" />
            Como ativar módulos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Altere <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">enabledQueryTypes</code> no 
            arquivo <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">telegram-webhook/index.ts</code> de{" "}
            <code className="text-destructive">false</code> para <code className="text-success">true</code>.
          </p>
        </CardContent>
      </Card>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {catModules.map(mod => (
                  <div key={mod.key} className={`flex items-center justify-between p-3 rounded-lg border ${
                    mod.enabled ? "bg-success/5 border-success/30" : "bg-secondary/30 border-border"
                  }`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{mod.icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{mod.label}</div>
                        <div className="text-[10px] text-muted-foreground">{mod.provider}</div>
                      </div>
                    </div>
                    <Badge variant={mod.enabled ? "default" : "outline"} className={`text-[10px] shrink-0 ${
                      mod.enabled ? "bg-success/20 text-success border-success/30" : "text-muted-foreground"
                    }`}>
                      {mod.enabled ? "ON" : "OFF"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Server className="h-4 w-4 text-primary" /> Provedores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "NexFuture", host: "nxf-2.nexfuture.com.br:25589" },
            { name: "TConect", host: "node.tconect.xyz:3029-3041" },
          ].map(p => (
            <div key={p.name} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                <div>
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{p.host}</div>
                </div>
              </div>
              <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">Offline</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
