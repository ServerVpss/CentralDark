import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { api, type ToolsResponse, ApiError } from "@/lib/api";

// Aba "Ferramentas" — consome GET /admin/api/tools (real, retorna
// { total, categorias: { [categoria]: [{name, description}] } }).
export function ToolsTab() {
  const [data, setData] = useState<ToolsResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    setErro(null);
    try {
      setData(await api.tools());
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Falha ao carregar tools.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  if (loading) return <div className="text-sm text-muted-foreground p-4">Carregando ferramentas…</div>;
  if (erro) return <div className="text-sm text-destructive p-4">{erro}</div>;
  if (!data) return null;

  const categorias = Object.entries(data.categorias).sort((a, b) => b[1].length - a[1].length);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Catálogo de ferramentas MCP</CardTitle>
        <Badge className="border-primary/30 bg-primary/10 text-primary">{data.total} tools</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        {categorias.map(([cat, tools]) => (
          <div key={cat}>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              {cat} <span className="text-muted-foreground/70">({tools.length})</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((t) => (
                <span
                  key={t.name}
                  title={t.description ?? ""}
                  className="font-mono text-[11px] px-2 py-1 rounded-md bg-secondary border border-border text-foreground cursor-help"
                >
                  {t.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
