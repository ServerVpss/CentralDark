# COMANDO - WhatsAppQrProviderCard.tsx
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\whatsapp\WhatsAppQrProviderCard.tsx
**SHA:** 67dc4730b765ba23
**Timestamp:** 2026-08-26T19:41:32.542121
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const lastAutoRestart = useRef<Record<string, number>>({});

### Ouro Bruto (primeiros 5000 chars)
```
// Card "WhatsApp QR" — opção alternativa à conexão Meta Cloud API.
// Lista conexões QR existentes do workspace e abre o modal de pareamento.

import { useState, useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Smartphone, RefreshCw, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  listQrConnections,
  restartQrConnection,
  logoutQrConnection,
  deleteQrConnection,
} from "@/lib/multizap-qr.functions";
import { WhatsAppQrConnectionModal } from "./WhatsAppQrConnectionModal";
import { cn } from "@/lib/utils";

interface QrConnection {
  connection_id: string;
  name?: string;
  label?: string | null;
  status: string;
  phone_number?: string | null;
  last_connected_at?: string | null;
}

interface Props {
  workspaceId: string;
}

export function WhatsAppQrProviderCard({ workspaceId }: Props) {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const listFn = useServerFn(listQrConnections);
  const restartFn = useServerFn(restartQrConnection);
  const logoutFn = useServerFn(logoutQrConnection);
  const delFn = useServerFn(deleteQrConnection);

  const { data, isLoading, error } = useQuery({
    queryKey: ["multizap-qr-connections", workspaceId],
    queryFn: () => listFn({ data: { workspace_id: workspaceId } }),
    refetchInterval: 15_000,
    retry: false,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["multizap-qr-connections", workspaceId] });

  const restartM = useMutation({
    mutationFn: (id: string) => restartFn({ data: { connection_id: id } }),
    onSuccess: () => {
      toast.success("Conexão reiniciada.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const logoutM = useMutation({
    mutationFn: (id: string) => logoutFn({ data: { connection_id: id } }),
    onSuccess: () => {
      toast.success("WhatsApp desconectado.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { connection_id: id } }),
    onSuccess: () => {
      toast.success("Conexão removida.");
      setModalOpen(false);
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const connections: QrConnection[] = (data?.connections as QrConnection[]) || [];
  const gatewayDown = !!error;

  // Remover/desconectar não pode disparar reconexão automática. Reconectar/QR
  // agora só roda por clique explícito no botão de reiniciar.
  const lastAutoRestart = useRef<Record<string, number>>({});
  useEffect(() => {
    lastAutoRestart.current = {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connections.map((c) => `${c.connection_id}:${c.status}`).join("|"), gatewayDown]);


  return (
    <>
      <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15">
                <QrCode className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg">WhatsApp QR MultiZap</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Conecte um WhatsApp normal escaneando QR Code.
                </CardDescription>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
              QR Code
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {gatewayDown && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700">
              Não consegui falar com o Gateway agora. Tente novamente em instantes.
            </div>
          )}

          {isLoading && !connections.length && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando conexões…
            </div>
          )}

          {connections.length > 0 && (
            <div className="space-y-2">
              {connections.map((c) => (
                <div
                  key={c.connection_id}
                  className="flex flex-col gap-2 rounded-lg border bg-background p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <div classNa
```