import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Wifi, WifiOff } from "lucide-react";
import { useProviderStatus, ProviderStatus } from "@/hooks/useProviderStatus";

function StatusBadge({ status, latency }: { status: ProviderStatus['status']; latency?: number }) {
  if (status === 'checking') {
    return (
      <Badge variant="outline" className="bg-muted/30 text-muted-foreground border-muted gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Verificando
      </Badge>
    );
  }
  
  if (status === 'online') {
    return (
      <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1">
        <Wifi className="h-3 w-3" />
        Online {latency && `(${latency}ms)`}
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
      <WifiOff className="h-3 w-3" />
      Offline
    </Badge>
  );
}

export function ProviderStatusList() {
  const { providers, isLoading, checkStatus } = useProviderStatus();

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Provedores</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={checkStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/20"
          >
            <div>
              <p className="font-medium text-sm">{provider.name}</p>
              {provider.port && (
                <p className="text-xs text-muted-foreground">Porta {provider.port}</p>
              )}
            </div>
            <StatusBadge status={provider.status} latency={provider.latency_ms} />
          </div>
        ))}
        
        {providers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum provedor configurado
          </p>
        )}
      </CardContent>
    </Card>
  );
}
