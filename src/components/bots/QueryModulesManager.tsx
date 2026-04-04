import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Server, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface ModuleInfo {
  key: string;
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

const initialModules: ModuleInfo[] = [
  // Pessoa
  { key: "cpf", label: "CPF", icon: "👤", enabled: true, provider: "VeiculosAPI", category: "pessoa" },
  { key: "nome", label: "Nome", icon: "📝", enabled: true, provider: "VeiculosAPI", category: "pessoa" },
  { key: "foto", label: "Foto", icon: "📸", enabled: true, provider: "VeiculosAPI", category: "pessoa" },
  { key: "nacional", label: "Foto Nacional", icon: "🇧🇷", enabled: true, provider: "VeiculosAPI", category: "pessoa" },
  { key: "parentes", label: "Parentes", icon: "👨‍👩‍👧‍👦", enabled: true, provider: "VeiculosAPI", category: "pessoa" },
  { key: "mae", label: "Nome da Mãe", icon: "👩", enabled: true, provider: "VeiculosAPI", category: "pessoa" },
  // Documentos
  { key: "rg", label: "RG", icon: "🪪", enabled: true, provider: "VeiculosAPI", category: "documento" },
  { key: "cnh", label: "CNH", icon: "🪪", enabled: true, provider: "VeiculosAPI", category: "documento" },
  { key: "titulo", label: "Título Eleitor", icon: "📜", enabled: true, provider: "VeiculosAPI", category: "documento" },
  { key: "pis", label: "PIS", icon: "📋", enabled: true, provider: "VeiculosAPI", category: "documento" },
  // Contato
  { key: "telefone", label: "Telefone", icon: "📞", enabled: true, provider: "VeiculosAPI", category: "contato" },
  { key: "email", label: "Email", icon: "📧", enabled: true, provider: "VeiculosAPI", category: "contato" },
  { key: "cep", label: "CEP", icon: "📍", enabled: true, provider: "VeiculosAPI", category: "contato" },
  { key: "endereco", label: "Endereço", icon: "🏠", enabled: true, provider: "VeiculosAPI", category: "contato" },
  // Financeiro
  { key: "pix", label: "PIX", icon: "💳", enabled: true, provider: "VeiculosAPI", category: "financeiro" },
  { key: "score", label: "Score", icon: "📊", enabled: true, provider: "VeiculosAPI", category: "financeiro" },
  { key: "renda", label: "Renda", icon: "💰", enabled: true, provider: "VeiculosAPI", category: "financeiro" },
  { key: "credilink", label: "Credilink", icon: "📊", enabled: true, provider: "VeiculosAPI", category: "financeiro" },
  { key: "cpf_spc", label: "SPC", icon: "📋", enabled: true, provider: "VeiculosAPI", category: "financeiro" },
  { key: "poderaquisitivo", label: "Poder Aquisitivo", icon: "💎", enabled: true, provider: "VeiculosAPI", category: "financeiro" },
  // Veículos
  { key: "placa", label: "Placa", icon: "🚗", enabled: true, provider: "VeiculosAPI", category: "veiculo" },
  { key: "placa_completa", label: "Placa Completa", icon: "🚗", enabled: true, provider: "VeiculosAPI", category: "veiculo" },
  { key: "chassi", label: "Chassi", icon: "🔧", enabled: true, provider: "VeiculosAPI", category: "veiculo" },
  { key: "renavam", label: "RENAVAM", icon: "📋", enabled: true, provider: "VeiculosAPI", category: "veiculo" },
  { key: "motor", label: "Motor", icon: "⚙️", enabled: true, provider: "VeiculosAPI", category: "veiculo" },
  // Empresa
  { key: "cnpj", label: "CNPJ", icon: "🏢", enabled: true, provider: "VeiculosAPI", category: "empresa" },
  // Justiça
  { key: "processos", label: "Processos", icon: "⚖️", enabled: true, provider: "VeiculosAPI", category: "justica" },
  { key: "bnmp", label: "BNMP", icon: "🔍", enabled: true, provider: "VeiculosAPI", category: "justica" },
  { key: "siel", label: "SIEL", icon: "🔎", enabled: true, provider: "VeiculosAPI", category: "justica" },
  // Outros
  { key: "tse", label: "TSE", icon: "🗳️", enabled: true, provider: "VeiculosAPI", category: "governo" },
  { key: "cpfsus", label: "SUS", icon: "🏥", enabled: true, provider: "VeiculosAPI", category: "governo" },
];

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
};

const categoryOrder = ["pessoa", "documento", "contato", "financeiro", "veiculo", "empresa", "justica", "governo"];

export function QueryModulesManager() {
  const [modules, setModules] = useState<ModuleInfo[]>(initialModules);
  const [providers, setProviders] = useState<ProviderInfo[]>(initialProviders);
  const [copied, setCopied] = useState(false);
  const [showProviders, setShowProviders] = useState(false);

  const enabledCount = modules.filter(m => m.enabled).length;

  const toggleModule = (key: string) => {
    setModules(prev => prev.map(m => m.key === key ? { ...m, enabled: !m.enabled } : m));
  };

  const toggleAll = (enabled: boolean) => {
    setModules(prev => prev.map(m => ({ ...m, enabled })));
  };

  const updateProviderUrl = (index: number, field: "baseUrl" | "port", value: string) => {
    setProviders(prev => prev.map((p, i) => i === index ? { ...p, [field]: field === "port" ? parseInt(value) || 0 : value } : p));
  };

  const generateCode = () => {
    const lines = modules.map(m => `  ${m.key}: ${m.enabled},`);
    return `const enabledQueryTypes: Record<string, boolean> = {\n${lines.join("\n")}\n};`;
  };

  const generateProviderCode = () => {
    const p = providers;
    return `const providers: Record<string, ApiProvider> = {\n  nexfuture: { baseUrl: "${p[0].baseUrl}", port: ${p[0].port} },\n  tconect_score: { baseUrl: "${p[1].baseUrl}", port: ${p[1].port} },\n  tconect_foto: { baseUrl: "${p[2].baseUrl}", port: ${p[2].port} },\n};`;
  };

  const copyToClipboard = () => {
    const code = generateCode() + "\n\n" + generateProviderCode();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Código copiado! Cole no telegram-webhook/index.ts");
    setTimeout(() => setCopied(false), 2000);
  };

  const grouped = categoryOrder.reduce((acc, cat) => {
    acc[cat] = modules.filter(m => m.category === cat);
    return acc;
  }, {} as Record<string, ModuleInfo[]>);

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
                Quando desativado, o bot <strong>não responde nada</strong> ao comando — evita confusão com outros bots no grupo.
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
        <Button size="sm" onClick={copyToClipboard} className="flex-1 gap-1">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copiado!" : "Copiar Código"}
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-primary" />
            Como aplicar as alterações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Ative/desative os módulos abaixo</li>
            <li>Altere as URLs dos provedores se necessário</li>
            <li>Clique em <strong>"Copiar Código"</strong></li>
            <li>Cole no arquivo <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs">telegram-webhook/index.ts</code></li>
            <li>Faça deploy da edge function</li>
          </ol>
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
                  <div key={mod.key} className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    mod.enabled ? "bg-emerald-500/5 border-emerald-500/30" : "bg-secondary/30 border-border"
                  }`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">{mod.icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{mod.label}</div>
                        <div className="text-[10px] text-muted-foreground">{mod.provider}</div>
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
                        onCheckedChange={() => toggleModule(mod.key)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Providers with editable URLs */}
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
                    <div className="h-2.5 w-2.5 rounded-full bg-destructive" />
                    <span className="text-sm font-medium">{p.name}</span>
                  </div>
                  <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">Offline</Badge>
                </div>
                <div className="grid grid-cols-[1fr_80px] gap-2">
                  <Input
                    value={p.baseUrl}
                    onChange={(e) => updateProviderUrl(idx, "baseUrl", e.target.value)}
                    placeholder="URL base"
                    className="text-xs font-mono h-8"
                  />
                  <Input
                    value={String(p.port)}
                    onChange={(e) => updateProviderUrl(idx, "port", e.target.value)}
                    placeholder="Porta"
                    className="text-xs font-mono h-8"
                    type="number"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Generated code preview */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>📋 Código Gerado</span>
            <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-1 h-7">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              Copiar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs font-mono bg-secondary/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all text-foreground">
            {generateCode()}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
