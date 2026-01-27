import { useState } from "react";
import { AlertTriangle, Ban, Link, MessageSquare, Shield, ShieldCheck, Users } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: React.ElementType;
  iconColor: string;
}

export default function Security() {
  const [settings, setSettings] = useState<SecuritySetting[]>([
    {
      id: "anti-link",
      name: "Anti-Link",
      description: "Bloqueia automaticamente links externos nos grupos",
      enabled: true,
      icon: Link,
      iconColor: "text-warning",
    },
    {
      id: "anti-spam",
      name: "Anti-Spam",
      description: "Detecta e remove mensagens de spam",
      enabled: true,
      icon: MessageSquare,
      iconColor: "text-destructive",
    },
    {
      id: "anti-flood",
      name: "Anti-Flood",
      description: "Limita mensagens repetidas em curto período",
      enabled: false,
      icon: AlertTriangle,
      iconColor: "text-warning",
    },
    {
      id: "anti-bot",
      name: "Anti-Bot",
      description: "Bloqueia entrada de bots não autorizados",
      enabled: true,
      icon: Ban,
      iconColor: "text-destructive",
    },
    {
      id: "captcha",
      name: "Captcha de Entrada",
      description: "Requer verificação para novos membros",
      enabled: true,
      icon: ShieldCheck,
      iconColor: "text-success",
    },
    {
      id: "welcome-guard",
      name: "Proteção de Boas-vindas",
      description: "Remove mensagens de boas-vindas após tempo",
      enabled: false,
      icon: Users,
      iconColor: "text-primary",
    },
  ]);

  const [spamThreshold, setSpamThreshold] = useState([5]);
  const [floodLimit, setFloodLimit] = useState([3]);
  const [whitelistedDomains, setWhitelistedDomains] = useState("telegram.me, t.me");

  const toggleSetting = (id: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
      )
    );
    toast.success("Configuração atualizada");
  };

  const saveSettings = () => {
    toast.success("Todas as configurações foram salvas!");
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Segurança</h1>
            <p className="text-muted-foreground">
              Configure as proteções dos seus grupos e canais
            </p>
          </div>
          <Button variant="glow" onClick={saveSettings}>
            Salvar Alterações
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-destructive/10 p-3">
                  <Ban className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">847</p>
                  <p className="text-sm text-muted-foreground">Links bloqueados hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-warning/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">234</p>
                  <p className="text-sm text-muted-foreground">Spam removido hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-success/10 p-3">
                  <ShieldCheck className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">99.2%</p>
                  <p className="text-sm text-muted-foreground">Taxa de proteção</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Settings Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Toggle Settings */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Proteções Ativas
              </CardTitle>
              <CardDescription>
                Ative ou desative as proteções para seus grupos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4 transition-colors hover:bg-secondary/40"
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg bg-secondary p-2 ${setting.iconColor}`}>
                      <setting.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{setting.name}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => toggleSetting(setting.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <div className="space-y-6">
            {/* Anti-Spam Config */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Configurações Anti-Spam</CardTitle>
                <CardDescription>
                  Ajuste a sensibilidade do detector de spam
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Limite de mensagens por minuto</Label>
                    <span className="text-sm font-medium text-primary">{spamThreshold[0]}</span>
                  </div>
                  <Slider
                    value={spamThreshold}
                    onValueChange={setSpamThreshold}
                    max={20}
                    min={1}
                    step={1}
                    className="[&_[role=slider]]:bg-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Usuários que enviarem mais de {spamThreshold[0]} mensagens por minuto serão
                    silenciados
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Anti-Flood Config */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Configurações Anti-Flood</CardTitle>
                <CardDescription>
                  Previna inundação de mensagens repetidas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Mensagens idênticas permitidas</Label>
                    <span className="text-sm font-medium text-primary">{floodLimit[0]}</span>
                  </div>
                  <Slider
                    value={floodLimit}
                    onValueChange={setFloodLimit}
                    max={10}
                    min={1}
                    step={1}
                    className="[&_[role=slider]]:bg-primary"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Whitelist */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Domínios Permitidos</CardTitle>
                <CardDescription>
                  Links destes domínios não serão bloqueados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="domains">Domínios (separados por vírgula)</Label>
                  <Input
                    id="domains"
                    value={whitelistedDomains}
                    onChange={(e) => setWhitelistedDomains(e.target.value)}
                    className="bg-secondary/50"
                    placeholder="exemplo.com, site.com.br"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
