import { useState } from "react";
import { Plug, Copy, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { BotaoOAuth, type ResultadoOAuth } from "./BotaoOAuth";
import { toast } from "sonner";

interface Props {
  onChaveCriada?: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

/**
 * Bloco "Conectar IA externa" — botões OAuth GitHub/OpenAI
 * + card mostrando a chave gerada na hora.
 */
export function CardConectarIA({ onChaveCriada }: Props) {
  const [resultado, setResultado] = useState<ResultadoOAuth | null>(null);

  const handleConectado = (info: ResultadoOAuth) => {
    setResultado(info);
    onChaveCriada?.();
  };

  const copiar = (texto: string, label: string) => {
    navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado!`);
  };

  const endpointMcp = `${SUPABASE_URL}/functions/v1/ponte-mcp`;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-3d-soft space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold flex items-center gap-2">
          <Plug className="w-4 h-4 text-emerald-600" />
          Conectar IA externa (1 clique)
        </h2>
      </div>

      <p className="text-sm text-muted-foreground">
        Faz login no provedor e a chave pra Cline / Cursor / Claude é gerada automaticamente.
        Sem precisar criar manualmente.
      </p>

      <div className="flex flex-wrap gap-2">
        <BotaoOAuth provider="github" onConectado={handleConectado} />
        <BotaoOAuth provider="openai" />
      </div>

      {resultado?.ok && resultado.chave_plena && (
        <div className="mt-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 space-y-3">
          <div className="flex items-center gap-3">
            {resultado.avatar_url && (
              <img
                src={resultado.avatar_url}
                alt={resultado.username}
                className="w-10 h-10 rounded-full border-2 border-emerald-500"
              />
            )}
            <div>
              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium text-sm">
                <CheckCircle2 className="w-4 h-4" /> Conectado como @{resultado.username}
              </div>
              <div className="text-xs text-muted-foreground">
                Chave salva: {resultado.prefixo}
              </div>
            </div>
          </div>

          <div className="bg-background border rounded p-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Sua chave (copia agora — só aparece uma vez)</span>
              <Button variant="ghost" size="sm" onClick={() => copiar(resultado.chave_plena!, "Chave")}>
                <Copy className="w-4 h-4 mr-1" /> Copiar
              </Button>
            </div>
            <code className="block text-xs font-mono break-all">{resultado.chave_plena}</code>
          </div>

          <div className="bg-background border rounded p-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">URL do MCP (pra colar no Cline)</span>
              <Button variant="ghost" size="sm" onClick={() => copiar(endpointMcp, "URL do MCP")}>
                <Copy className="w-4 h-4 mr-1" /> Copiar
              </Button>
            </div>
            <code className="block text-xs font-mono break-all text-emerald-700 dark:text-emerald-400">
              {endpointMcp}
            </code>
          </div>

          {resultado.injetado_na_vps && (
            <div className="text-xs text-emerald-700 dark:text-emerald-400">
              ✨ Sessão injetada direto no MCP da VPS — Cline conecta sem mais nada.
            </div>
          )}
          {resultado.injetado_na_vps === false && (
            <div className="text-xs text-amber-700 dark:text-amber-400">
              ⚠️ Auto-injeção na VPS falhou ({resultado.injecao_motivo}). Cola a chave manualmente
              no header <code>x-ponte-chave</code> do Cline.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
