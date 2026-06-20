import { Link, MessageSquare, AlertTriangle, Ban, ShieldCheck, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import type { BotSecuritySettings } from "@/hooks/telegram/types";

interface ToggleSetting {
  id: string;
  name: string;
  description: string;
  settingKey: keyof BotSecuritySettings;
  icon: React.ElementType;
  iconColor: string;
}

const toggleSettings: ToggleSetting[] = [
  {
    id: "anti-link",
    name: "Anti-Link",
    description: "Bloqueia automaticamente links externos nos grupos",
    settingKey: "anti_link_enabled",
    icon: Link,
    iconColor: "text-warning",
  },
  {
    id: "anti-spam",
    name: "Anti-Spam",
    description: "Detecta e remove mensagens de spam",
    settingKey: "anti_spam_enabled",
    icon: MessageSquare,
    iconColor: "text-destructive",
  },
  {
    id: "anti-flood",
    name: "Anti-Flood",
    description: "Limita mensagens repetidas em curto período",
    settingKey: "anti_flood_enabled",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  {
    id: "welcome",
    name: "Mensagem de Boas-vindas",
    description: "Envia mensagem automática para novos membros",
    settingKey: "welcome_message_enabled",
    icon: Users,
    iconColor: "text-primary",
  },
];

interface SecurityTogglesProps {
  settings: BotSecuritySettings | null;
  loading?: boolean;
  onToggle: (key: keyof BotSecuritySettings, value: boolean) => void;
}

export function SecurityToggles({ settings, loading, onToggle }: SecurityTogglesProps) {
  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Proteções Ativas
        </CardTitle>
        <CardDescription>
          Ative ou desative as proteções para seus grupos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {toggleSettings.map((setting) => {
          const Icon = setting.icon;
          const isEnabled = settings?.[setting.settingKey] ?? false;

          return (
            <div
              key={setting.id}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/20 p-4 transition-all hover:bg-secondary/40 hover:border-primary/20"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-secondary ${setting.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">{setting.name}</p>
                  <p className="text-sm text-muted-foreground">{setting.description}</p>
                </div>
              </div>
              <Switch
                checked={isEnabled as boolean}
                onCheckedChange={(checked) => onToggle(setting.settingKey, checked)}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
