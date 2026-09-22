import { Sparkles, Plug, Github } from "lucide-react";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { OperationalHud } from "./OperationalHud";

// Aba "Visão geral" — mantém os cards da Ponte MCP e incorpora o HUD operacional
// no mesmo owner existente. HUD é projeção, não nova autoridade nem segundo sistema.
export function OverviewTab({ toolCount }: { toolCount: number }) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">Boas-vindas à Ponte MCP 👋</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Este painel conecta ferramentas (tools) do servidor MCP CentralDark a agentes de IA
            externos via OAuth 2.1 + PKCE. Acompanhe status, catálogo, auditoria e conectores
            num só lugar.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-primary/30 bg-primary/10 text-primary">
              Login rápido com GitHub
            </Badge>
            <Badge className="border-border bg-secondary text-secondary-foreground">
              {toolCount > 0 ? `${toolCount}+` : "70+"} ferramentas conectadas
            </Badge>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Plug className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">Conectar IA externa (1 clique)</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Autorize um agente (Claude, ChatGPT, Cursor, etc.) a usar as tools do MCP CentralDark
            em nome desta conta, via fluxo OAuth 2.1 com PKCE — o mesmo usado pelos clientes MCP
            reais.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <a href="/authorize?response_type=code&client_id=mcp-admin-ui&scope=mcp%20admin">
                <Github className="h-4 w-4" /> Entrar com GitHub
              </a>
            </Button>
            <Button variant="outline" disabled className="flex-1">
              Entrar com OpenAI (em breve)
            </Button>
          </div>
        </Card>
      </div>

      <OperationalHud />
    </div>
  );
}
