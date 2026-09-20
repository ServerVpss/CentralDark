import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { KeyRound } from "lucide-react";

// Aba "Chaves" — não há endpoint real de emissão/listagem de chaves de API
// hoje (o servidor emite apenas access/refresh tokens via fluxo OAuth 2.1,
// gerenciados internamente em sessions.js, sem rota de leitura externa).
// Estado vazio explícito + modal explicando o que falta, sem simular dado.
export function KeysTab() {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>Chaves de API</CardTitle>
        <Button size="sm" onClick={() => setOpen(true)}>
          <KeyRound className="h-4 w-4" /> Nova chave
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-8 flex flex-col items-center text-center gap-2">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <KeyRound className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium">Nenhuma chave ainda</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            A emissão de chaves de API dedicadas ainda não está conectada no backend.
          </p>
        </div>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emissão de chave — em construção</DialogTitle>
            <DialogDescription>
              O MCP CentralDark hoje emite tokens de acesso apenas via fluxo OAuth 2.1 + PKCE
              (endpoints <code className="font-mono">/authorize</code> e{" "}
              <code className="font-mono">/token</code>, já em produção). Uma rota dedicada de
              "API keys" pessoais (emitir, listar, revogar) ainda está sendo conectada ao painel.
              Assim que existir, este botão passa a criar uma chave de verdade — nada aqui é
              simulado.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
