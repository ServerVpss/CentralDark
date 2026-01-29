import { useState, useEffect } from "react";
import {
  Bell,
  Database,
  Key,
  Laptop,
  Moon,
  Palette,
  Save,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { BackupManager } from "@/components/backup/BackupManager";

export default function Settings() {
  const { user, profile, updateProfile } = useAuth();
  
  const [settings, setSettings] = useState({
    // Profile
    name: "",
    email: "",
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    
    // Notifications
    emailNotifications: true,
    telegramNotifications: true,
    securityAlerts: true,
    weeklyReport: false,
    
    // Security
    twoFactor: true,
    sessionTimeout: "30",
    ipWhitelist: "",
  });

  // Atualizar settings quando profile/user carregar
  useState(() => {
    if (profile?.full_name || user?.email) {
      setSettings(prev => ({
        ...prev,
        name: profile?.full_name || "",
        email: user?.email || "",
      }));
    }
  });

  // Effect para atualizar quando dados carregarem
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      name: profile?.full_name || "",
      email: user?.email || "",
    }));
  }, [profile, user]);

  const handleSave = async () => {
    if (settings.name && settings.name !== profile?.full_name) {
      await updateProfile({ full_name: settings.name });
    } else {
      toast.success("Configurações salvas com sucesso!");
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações gerais do sistema
            </p>
          </div>
          <Button variant="glow" className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1 flex-wrap h-auto gap-1">
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Palette className="h-4 w-4" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="backup" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Database className="h-4 w-4" />
              Backup
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e preferências
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                    >
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="America/Bahia">Bahia (GMT-3)</SelectItem>
                        <SelectItem value="America/Fortaleza">Fortaleza (GMT-3)</SelectItem>
                        <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => setSettings({ ...settings, language: value })}
                    >
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Preferências de Notificação</CardTitle>
                <CardDescription>
                  Configure como e quando você deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    id: "emailNotifications",
                    label: "Notificações por Email",
                    description: "Receba atualizações importantes por email",
                  },
                  {
                    id: "telegramNotifications",
                    label: "Notificações no Telegram",
                    description: "Receba alertas diretamente no Telegram",
                  },
                  {
                    id: "securityAlerts",
                    label: "Alertas de Segurança",
                    description: "Seja notificado sobre atividades suspeitas",
                  },
                  {
                    id: "weeklyReport",
                    label: "Relatório Semanal",
                    description: "Receba um resumo semanal do desempenho",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch
                      checked={settings[item.id as keyof typeof settings] as boolean}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, [item.id]: checked })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Configurações de Segurança</CardTitle>
                <CardDescription>
                  Proteja sua conta com configurações avançadas de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/20 p-4">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-success/10 p-3">
                      <Key className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Autenticação de Dois Fatores</p>
                      <p className="text-sm text-muted-foreground">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.twoFactor}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, twoFactor: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeout">Tempo limite da sessão (minutos)</Label>
                  <Select
                    value={settings.sessionTimeout}
                    onValueChange={(value) =>
                      setSettings({ ...settings, sessionTimeout: value })
                    }
                  >
                    <SelectTrigger className="bg-secondary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whitelist">IPs Permitidos (opcional)</Label>
                  <Textarea
                    id="whitelist"
                    placeholder="Digite um IP por linha&#10;192.168.1.1&#10;10.0.0.1"
                    value={settings.ipWhitelist}
                    onChange={(e) =>
                      setSettings({ ...settings, ipWhitelist: e.target.value })
                    }
                    className="bg-secondary/50 min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe vazio para permitir acesso de qualquer IP
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Appearance Tab */}
          <TabsContent value="appearance">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Preferências de Aparência</CardTitle>
                <CardDescription>
                  Personalize a aparência do painel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Tema</Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: "dark", label: "Escuro", icon: Moon },
                      { value: "light", label: "Claro", icon: Sun },
                      { value: "system", label: "Sistema", icon: Laptop },
                    ].map((theme) => (
                      <button
                        key={theme.value}
                        className="flex flex-col items-center gap-2 rounded-lg border border-border bg-secondary/20 p-4 transition-all hover:border-primary/50 focus:border-primary focus:outline-none"
                      >
                        <theme.icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Cor de Destaque</Label>
                  <div className="flex gap-3">
                    {[
                      "bg-[hsl(187,100%,50%)]",
                      "bg-[hsl(142,76%,45%)]",
                      "bg-[hsl(38,92%,50%)]",
                      "bg-[hsl(280,100%,60%)]",
                      "bg-[hsl(0,84%,60%)]",
                    ].map((color, idx) => (
                      <button
                        key={idx}
                        className={`h-10 w-10 rounded-full ${color} transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-background`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Tab */}
          <TabsContent value="backup">
            <BackupManager />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
