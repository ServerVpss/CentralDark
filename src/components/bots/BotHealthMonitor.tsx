import { useEffect, useState } from "react";
import { Activity, CheckCircle, XCircle, AlertCircle, RefreshCw, Wifi } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TelegramBot, useTelegramBots } from "@/hooks/useTelegramBots";
import { cn } from "@/lib/utils";

interface BotHealthMonitorProps {
  bots: TelegramBot[];
}

export function BotHealthMonitor({ bots }: BotHealthMonitorProps) {
  const { healthCheck } = useTelegramBots();
  const [checking, setChecking] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<Record<string, unknown>>({});

  const runHealthCheck = async (botId: string) => {
    setChecking(botId);
    const result = await healthCheck(botId);
    setHealthData((prev) => ({ ...prev, [botId]: result }));
    setChecking(null);
  };

  const runAllHealthChecks = async () => {
    for (const bot of bots) {
      await runHealthCheck(bot.id);
    }
  };

  useEffect(() => {
    // Run initial health check for all bots
    if (bots.length > 0) {
      runAllHealthChecks();
    }

    // Set up interval for periodic health checks
    const interval = setInterval(() => {
      runAllHealthChecks();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [bots.length]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "offline":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <AlertCircle className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success/10 text-success border-success/30";
      case "offline":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-warning/10 text-warning border-warning/30";
    }
  };

  const onlineCount = bots.filter((b) => b.health_status === "online").length;
  const healthPercentage = bots.length > 0 ? (onlineCount / bots.length) * 100 : 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Health Monitor
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={runAllHealthChecks}
          disabled={checking !== null}
        >
          <RefreshCw className={cn("h-4 w-4", checking && "animate-spin")} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sistema</span>
            <span className="font-medium">
              {onlineCount}/{bots.length} online
            </span>
          </div>
          <Progress
            value={healthPercentage}
            className="h-2"
          />
        </div>

        {/* Individual Bot Status */}
        <div className="space-y-2">
          {bots.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum bot configurado
            </p>
          ) : (
            bots.map((bot) => (
              <div
                key={bot.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getStatusIcon(bot.health_status)}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{bot.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      @{bot.bot_username || "não sincronizado"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {bot.webhook_active && (
                    <Wifi className="h-4 w-4 text-success" />
                  )}
                  <Badge
                    variant="outline"
                    className={getStatusColor(bot.health_status)}
                  >
                    {checking === bot.id ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      bot.health_status
                    )}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Last Check Time */}
        {bots.length > 0 && bots[0].last_health_check && (
          <p className="text-xs text-muted-foreground text-center">
            Última verificação:{" "}
            {new Date(bots[0].last_health_check).toLocaleTimeString("pt-BR")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
