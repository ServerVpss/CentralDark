import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const SNIPPETS: { title: string; code: string }[] = [
  {
    title: "🖥️ Claude Desktop",
    code: `{
  "mcpServers": {
    "centraldark": {
      "type": "http",
      "url": "https://mcp.centralldark.com/mcp"
    }
  }
}`,
  },
  {
    title: "⚡ Cursor",
    code: `{
  "mcpServers": {
    "centraldark": {
      "url": "https://mcp.centralldark.com/mcp",
      "transport": "http"
    }
  }
}`,
  },
  {
    title: "🧠 Codex CLI",
    code: `[mcp.centraldark]
transport = "http"
url = "https://mcp.centralldark.com/mcp"`,
  },
  {
    title: "🔌 Outros (SSE / HTTP)",
    code: `endpoint: https://mcp.centralldark.com/mcp
transport: streamable-http
auth: bearer <TOKEN>  (opcional)`,
  },
];

// Aba "Conector" — réplica do conteúdo real já existente no painel NOC atual
// (apps/modulos/mcp/src/admin.js, seção #p-conector). Puramente estático,
// não depende de nenhum endpoint.
export function ConnectorTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Como conectar clientes MCP</CardTitle>
        <p className="text-sm text-muted-foreground">
          Cole os snippets abaixo no arquivo de config do cliente. Endpoint público oficial:{" "}
          <code className="font-mono text-primary">https://mcp.centralldark.com/mcp</code>
        </p>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        {SNIPPETS.map((s) => (
          <div key={s.title} className="rounded-lg border border-border bg-secondary/30 p-4">
            <h4 className="text-sm font-semibold mb-2">{s.title}</h4>
            <pre className="text-[11px] font-mono bg-background border border-border rounded-md p-3 overflow-x-auto">
              {s.code}
            </pre>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
