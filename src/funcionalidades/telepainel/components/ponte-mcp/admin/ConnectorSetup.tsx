import { useMemo, useState } from "react";
import { Card } from "@/compartilhado/ui/card";
import { Button } from "@/compartilhado/ui/button";
import { Input } from "@/compartilhado/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/compartilhado/ui/tabs";
import { Copy, Plug, Link2, Terminal, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  MCP_ENDPOINT,
  buildClaudeDesktopConfig,
  buildCursorConfig,
  buildCodexConfig,
} from "./mcp-adapter";

/**
 * Página de configuração do conector MCP.
 * Mostra URL, header OAuth e JSON pronto pra colar em cada cliente (Claude Desktop, Cursor, Codex).
 */
export function ConnectorSetup() {
  const [chave, setChave] = useState("");

  const configs = useMemo(() => ({
    claude: JSON.stringify(buildClaudeDesktopConfig(chave), null, 2),
    cursor: JSON.stringify(buildCursorConfig(chave), null, 2),
    codex:  JSON.stringify(buildCodexConfig(chave), null, 2),
  }), [chave]);

  const copiar = (v: string, label: string) => {
    navigator.clipboard.writeText(v);
    toast.success(`${label} copiado!`);
  };

  return (
    <Card className="p-4 md:p-6 space-y-6">
      <header className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Plug className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Configurar conector MCP</h2>
          <p className="text-sm text-muted-foreground">
            Cole isso no cliente (Claude Desktop, Cursor ou Codex) pra ele enxergar as ~100 tools do CentralDark.
          </p>
        </div>
      </header>

      {/* Dados base */}
      <div className="grid gap-3 md:grid-cols-2">
        <FieldReadonly
          label="URL do endpoint MCP"
          value={MCP_ENDPOINT}
          icon={<Link2 className="w-3.5 h-3.5" />}
          onCopy={() => copiar(MCP_ENDPOINT, "URL")}
        />
        <FieldReadonly
          label="Cabeçalho de autenticação"
          value="x-ponte-chave: <SUA_CHAVE>"
          icon={<Terminal className="w-3.5 h-3.5" />}
          onCopy={() => copiar("x-ponte-chave", "Nome do header")}
        />
      </div>

      {/* Chave */}
      <div className="space-y-2">
        <label htmlFor="chave-input" className="text-sm font-medium flex items-center gap-2">
          Sua chave de acesso
          <span className="text-xs text-muted-foreground font-normal">
            (opcional aqui — só pra embutir no JSON copiado)
          </span>
        </label>
        <Input
          id="chave-input"
          value={chave}
          onChange={(e) => setChave(e.target.value)}
          placeholder="Cole aqui a chave gerada em 'Chaves emitidas' (ou deixe vazio pra usar placeholder)"
          className="font-mono text-xs"
          aria-describedby="chave-hint"
        />
        <p id="chave-hint" className="text-xs text-muted-foreground">
          A chave é usada apenas no navegador pra montar o JSON — não é enviada a lugar nenhum.
        </p>
      </div>

      {/* JSON por cliente */}
      <Tabs defaultValue="claude" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="claude">Claude Desktop</TabsTrigger>
          <TabsTrigger value="cursor">Cursor</TabsTrigger>
          <TabsTrigger value="codex">Codex/Outros</TabsTrigger>
        </TabsList>

        <TabsContent value="claude" className="mt-3">
          <JsonBlock
            title="claude_desktop_config.json"
            hint="Arquivo: ~/Library/Application Support/Claude/claude_desktop_config.json (macOS) · %APPDATA%\\Claude\\claude_desktop_config.json (Windows)"
            value={configs.claude}
            onCopy={() => copiar(configs.claude, "JSON Claude Desktop")}
          />
        </TabsContent>
        <TabsContent value="cursor" className="mt-3">
          <JsonBlock
            title="~/.cursor/mcp.json"
            hint="Cursor > Settings > MCP Servers > Add. Cursor aceita conexão HTTP direta."
            value={configs.cursor}
            onCopy={() => copiar(configs.cursor, "JSON Cursor")}
          />
        </TabsContent>
        <TabsContent value="codex" className="mt-3">
          <JsonBlock
            title="mcp-config.json (Codex / genérico)"
            hint="Formato compatível com clientes MCP que aceitam header customizado."
            value={configs.codex}
            onCopy={() => copiar(configs.codex, "JSON Codex")}
          />
        </TabsContent>
      </Tabs>

      {/* Docs */}
      <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
        <div className="font-medium flex items-center gap-2">
          <ExternalLink className="w-4 h-4" /> Como aplicar
        </div>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
          <li>Vai na aba <strong>Chaves</strong> e gera uma chave nova pro cliente.</li>
          <li>Cole a chave no campo acima pra ela já entrar no JSON.</li>
          <li>Copia o JSON da aba do seu cliente e cola no arquivo indicado.</li>
          <li>Reinicia o cliente. Deve aparecer ~100 tools do CentralDark.</li>
        </ol>
      </div>
    </Card>
  );
}

function FieldReadonly({
  label, value, icon, onCopy,
}: { label: string; value: string; icon: React.ReactNode; onCopy: () => void }) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
        {icon} {label}
      </div>
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
        <code className="text-xs font-mono flex-1 break-all">{value}</code>
        <Button variant="ghost" size="sm" onClick={onCopy} aria-label={`Copiar ${label}`}>
          <Copy className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function JsonBlock({
  title, hint, value, onCopy,
}: { title: string; hint: string; value: string; onCopy: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-xs font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy className="w-3.5 h-3.5 mr-1" /> Copiar
        </Button>
      </div>
      <pre className="text-xs font-mono bg-muted/40 border rounded-lg p-3 overflow-auto max-h-80 whitespace-pre">
{value}
      </pre>
    </div>
  );
}
