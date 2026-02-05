import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BotSecuritySettings } from "@/hooks/telegram/types";

interface SecurityAdvancedProps {
  settings: BotSecuritySettings | null;
  loading?: boolean;
  onUpdate: (key: keyof BotSecuritySettings, value: unknown) => void;
}

const actionOptions = [
  { value: "warn", label: "Avisar usuário" },
  { value: "delete", label: "Apagar mensagem" },
  { value: "mute", label: "Silenciar usuário" },
  { value: "ban", label: "Banir usuário" },
];

export function SecurityAdvanced({ settings, loading, onUpdate }: SecurityAdvancedProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Anti-Spam Config */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Configurações Anti-Spam</CardTitle>
          <CardDescription>
            Ajuste a sensibilidade do detector de spam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Máximo de mensagens</Label>
              <span className="text-sm font-medium text-primary tabular-nums">
                {settings?.anti_spam_max_messages || 5}
              </span>
            </div>
            <Slider
              value={[settings?.anti_spam_max_messages || 5]}
              onValueChange={([value]) => onUpdate("anti_spam_max_messages", value)}
              max={20}
              min={1}
              step={1}
              className="[&_[role=slider]]:bg-primary"
            />
            <p className="text-xs text-muted-foreground">
              Usuários que enviarem mais de {settings?.anti_spam_max_messages || 5} mensagens
              em {settings?.anti_spam_interval_seconds || 60} segundos serão penalizados
            </p>
          </div>

          <div className="space-y-2">
            <Label>Ação ao detectar spam</Label>
            <Select
              value={settings?.anti_spam_action || "delete"}
              onValueChange={(value) => onUpdate("anti_spam_action", value)}
            >
              <SelectTrigger className="bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Anti-Flood Config */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Configurações Anti-Flood</CardTitle>
          <CardDescription>
            Previna inundação de mensagens repetidas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Mensagens idênticas permitidas</Label>
              <span className="text-sm font-medium text-primary tabular-nums">
                {settings?.anti_flood_max_messages || 3}
              </span>
            </div>
            <Slider
              value={[settings?.anti_flood_max_messages || 3]}
              onValueChange={([value]) => onUpdate("anti_flood_max_messages", value)}
              max={10}
              min={1}
              step={1}
              className="[&_[role=slider]]:bg-primary"
            />
          </div>

          <div className="space-y-2">
            <Label>Ação ao detectar flood</Label>
            <Select
              value={settings?.anti_flood_action || "delete"}
              onValueChange={(value) => onUpdate("anti_flood_action", value)}
            >
              <SelectTrigger className="bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Anti-Link Config */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Configurações Anti-Link</CardTitle>
          <CardDescription>
            Configure ações para links externos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Ação ao detectar link</Label>
            <Select
              value={settings?.anti_link_action || "delete"}
              onValueChange={(value) => onUpdate("anti_link_action", value)}
            >
              <SelectTrigger className="bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Mensagem de Boas-vindas</CardTitle>
          <CardDescription>
            Personalize a mensagem para novos membros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              value={settings?.welcome_message || ""}
              onChange={(e) => onUpdate("welcome_message", e.target.value)}
              placeholder="Olá {nome}! Bem-vindo ao grupo..."
              className="min-h-[100px] bg-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              Use {"{nome}"} para incluir o nome do usuário
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
