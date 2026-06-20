import { useState, useEffect, useCallback } from "react";
import { Server, CheckCircle, XCircle, AlertCircle, RefreshCw, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FunctionHealth {
  name: string;
  status: 'online' | 'offline' | 'error';
  responseTime?: number;
  error?: string;
  checkedAt: string;
}

interface HealthCheckResult {
  all_healthy: boolean;
  checked_at: string;
  details: FunctionHealth[];
  online_count: number;
  offline_count: number;
  error_count: number;
  total_functions: number;
}

const AUTO_REFRESH_INTERVAL = 60000; // 1 minute

export function EdgeFunctionsStatus() {
  const [loading, setLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<HealthCheckResult | null>(null);
  const [nextRefresh, setNextRefresh] = useState(AUTO_REFRESH_INTERVAL / 1000);

  const runHealthCheck = useCallback(async (silent = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("health-check");
      
      if (error) throw error;
      
      if (data.success) {
        // Buscar último registro do banco
        const { data: dbRecord } = await supabase
          .from("edge_function_health")
          .select("*")
          .order("checked_at", { ascending: false })
          .limit(1)
          .single();
        
        if (dbRecord) {
          setLastCheck(dbRecord as unknown as HealthCheckResult);
        }
        
        if (!silent) {
          if (data.summary.allHealthy) {
            toast.success("Todas as funções estão online!");
          } else {
            toast.warning(`${data.summary.offline} função(ões) offline`);
          }
        }
      }
    } catch (err) {
      console.error("Health check error:", err);
      if (!silent) {
        toast.error("Erro ao verificar funções");
      }
    } finally {
      setLoading(false);
      setNextRefresh(AUTO_REFRESH_INTERVAL / 1000);
    }
  }, []);

  // Auto-refresh every 1 minute
  useEffect(() => {
    // Run initial check
    runHealthCheck(true);

    // Set up auto-refresh interval
    const refreshInterval = setInterval(() => {
      runHealthCheck(true);
    }, AUTO_REFRESH_INTERVAL);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setNextRefresh((prev) => (prev > 0 ? prev - 1 : AUTO_REFRESH_INTERVAL / 1000));
    }, 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [runHealthCheck]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "offline":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
        return <Badge variant="outline" className="bg-success/10 text-success border-success/30">Online</Badge>;
      case "offline":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Offline</Badge>;
      default:
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Erro</Badge>;
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          Edge Functions
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => runHealthCheck(false)}
          disabled={loading}
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {!lastCheck ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Clique para verificar status das funções
            </p>
            <Button onClick={() => runHealthCheck(false)} disabled={loading} variant="outline" size="sm">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Verificar Agora
            </Button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
              <div className="flex items-center gap-2">
                {lastCheck.all_healthy ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-warning" />
                )}
                <span className="font-medium">
                  {lastCheck.online_count}/{lastCheck.total_functions} online
                </span>
              </div>
              <Badge variant={lastCheck.all_healthy ? "default" : "destructive"}>
                {lastCheck.all_healthy ? "Saudável" : "Atenção"}
              </Badge>
            </div>

            {/* Function List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {lastCheck.details?.map((fn) => (
                <div
                  key={fn.name}
                  className="flex items-center justify-between p-2 rounded bg-secondary/10 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getStatusIcon(fn.status)}
                    <span className="truncate font-mono text-xs">{fn.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {fn.responseTime && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {fn.responseTime}ms
                      </span>
                    )}
                    {getStatusBadge(fn.status)}
                  </div>
                </div>
              ))}
            </div>

            {/* Last Check Time & Next Refresh */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Última: {new Date(lastCheck.checked_at).toLocaleTimeString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Próxima em {nextRefresh}s
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
