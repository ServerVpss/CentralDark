import { Sparkles, Github, Bot } from "lucide-react";

/**
 * Card de boas-vindas no topo da rota /ponte-mcp
 * Explica em linguagem leiga o que o painel faz e como o login OAuth ajuda.
 */
export function CardBoasVindas() {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-emerald-50 to-card dark:from-emerald-950/20 dark:to-card p-5 shadow-3d-soft">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-emerald-500/10 p-2 shrink-0">
          <Sparkles className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h2 className="font-semibold text-base">Boas-vindas à Ponte MCP 👋</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Aqui você gera <strong>chaves de acesso</strong> pra qualquer IA externa (Cline, Cursor,
            ChatGPT, Claude) conversar com a tua VPS CentralDark sem precisar passar credenciais
            sensíveis. A chave é um "passe" que a IA usa pra te identificar.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-700 dark:text-emerald-400">
              <Github className="w-3 h-3" /> Login rápido com GitHub
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-muted-foreground">
              <Bot className="w-3 h-3" /> 70+ ferramentas conectadas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
