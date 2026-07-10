import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Info } from "lucide-react";

// Aba "Clientes OAuth" — não existe endpoint real de listagem de clients
// registrados via DCR (/register) no backend hoje. Deixado como estado
// vazio explícito, sem dado simulado, até o backend expor
// GET /admin/api/oauth-clients (ou similar).
export function OAuthClientsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes OAuth (DCR)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-8 flex flex-col items-center text-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Info className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium">Listagem ainda não disponível</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            O servidor MCP já registra clientes via DCR (<code className="font-mono">POST /register</code>),
            mas ainda não expõe um endpoint para listar os clientes registrados.
            Assim que <code className="font-mono">GET /admin/api/oauth-clients</code> (ou equivalente)
            existir no backend, esta aba passa a consumi-lo automaticamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
