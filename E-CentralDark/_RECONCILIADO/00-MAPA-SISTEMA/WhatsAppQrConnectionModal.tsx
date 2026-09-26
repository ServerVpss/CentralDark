// Modal de conexão WhatsApp via QR (MultiZap-Gateway).
// Fluxo explícito de 8 passos: checking_gateway → gateway_online →
// creating_connection → generating_qr → qr_ready/waiting_scan → connected.
// Health é checado UMA vez ao abrir (e em retry manual). O polling contínuo
// é em /status da conexão, não em /health. Token nunca toca o frontend:
// tudo passa por server functions.

import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  QrCode,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  createQrConnection,
  getQrCode,
  getQrConnectionStatus,
  listQrConnections,
  logoutQrConnection,
  pingQrGateway,
} from "@/lib/multizap-qr.functions";
import { cn } from "@/lib/utils";

type Step =
  | "checking_gateway"
  | "gateway_online"
  | "creating_connection"
  | "generating_qr"
  | "qr_ready"
  | "waiting_scan"
  | "connected"
  | "expired"
  | "error";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  workspaceId: string;
  name?: string;
  onConnected?: () => void;
}

// Log leve no console do navegador — útil pra suporte, sem nenhum dado sensível.
function log(event: string, extra?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.log(`[qr-modal] ${event}`, extra ?? {});
}

export function WhatsAppQrConnectionModal({
  open,
  onOpenChange,
  workspaceId,
  name = "WhatsApp QR",
  onConnected,
}: Props) {
  const [step, setStep] = useState<Step>("checking_gateway");
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [gatewayInfo, setGatewayInfo] = useState<{ latency_ms: number } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qrExpireRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRemovingRef = useRef(false);

  const pingFn = useServerFn(pingQrGateway);
  const createFn = useServerFn(createQrConnection);
  const qrFn = useServerFn(getQrCode);
  const statusFn = useServerFn(getQrConnectionStatus);
  const logoutFn = useServerFn(logoutQrConnection);
  const listFn = useServerFn(listQrConnections);

  const stopAllTimers = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (qrExpireRef.current) clearTimeout(qrExpireRef.current);
    if (startDelayRef.current) clearTimeout(startDelayRef.current);
    pollRef.current = null;
    qrExpireRef.current = null;
    startDelayRef.current = null;
  };

  const setRemovingMode = (value: boolean) => {
    isRemovingRef.current = value;
    setIsRemoving(value);
  };

  const clearConnectionState = () => {
    setConnectionId(null);
    setQrData(null);
    setErrorMsg(null);
    setStep("checking_gateway");
    setPhoneNumber(null);
    setGatewayInfo(null);
  };

  // 1) Checa Gateway uma vez ao abrir. NUNCA fica em loop de /health
  //    e NUNCA cria conexão sozinho só porque o modal abriu.
  const checkGateway = async (opts: { autoAdvance?: boolean } = { autoAdvance: false }) => {
    if (isRemovingRef.current) return;
    setStep("checking_gateway");
    setErrorMsg(null);
    try {
      const r = await pingFn();
      if (isRemovingRef.current) return;
      if (r.reachable) {
        log("health_ok", { latency_ms: r.latency_ms });
        setGatewayInfo({ latency_ms: r.latency_ms });
        setStep("gateway_online");
        if (opts.autoAdvance) {
          startDelayRef.current = setTimeout(() => {
            if (isRemovingRef.current) return;
            void startConnection();
          }, 500);
        }
      } else {
        log("health_fail", { kind: r.error?.kind });
        setErrorMsg(
          `${r.error?.message ?? "Não consegui falar com o Gateway."} (tipo: ${r.error?.kind})`,
        );
        setStep("error");
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Falha ao verificar Gateway.");
      setStep("error");
    }
  };


  // 2) Cria conexão (ou reaproveita existente) + gera QR.
  //    Antes de POST /connections, lista as conexões do workspace:
  //    - se já existir uma `connected` → pula direto pra connected
  //    - se existir `qr`/`disconnected`/`unknown` → reaproveita o id
  //    - só cria nova se não houver nenhuma reutilizável
  const startConnection = async () => {
    if (isRemovingRef.current) return;
    stopAllTimers();
    setStep("creating_connection");
    setErrorMsg(null);
    setQrData(null);
    setPhoneNumber(null);
    try {
      log("listing_existing", { workspaceId });
      const existing = await listFn({ data: { workspace_id: workspaceId } }).catch(() => ({
        connections: [] as Array<{ connection_id: string; status: string; phone_number: string | null }>,
      }));
      if (isRemovingRef.current) return;
      const conns = existing.connections ?? [];
      const alreadyConnected = conns.find((c) => c.status === "connected");
      if (alreadyConnected) {
        log("reuse_connected", { connection_id: alreadyConnected.connection_id });
        const saved = await statusFn({
          data: { connection_id: alreadyConnected.connection_id, workspace_id: workspaceId },
        });
        setConnectionId(alreadyConnected.connection_id);
        setPhoneNumber(saved.phone_number ?? alreadyConnected.phone_number ?? null);
        setStep("connected");
        onConnected?.();
        toast.success("WhatsApp já está conectado.");
        return;
      }
      const reusable = conns.find(
        (c) => c.status === "qr" || c.status === "disconnected" || c.status === "unknown",
      );
      let cid: string;
      if (reusable) {
        log("reuse_pending", { connection_id: reusable.connection_id, status: reusable.status });
        cid = reusable.connection_id;
      } else {
        log("creating_connection", { workspaceId, name });
        const created = await createFn({
          data: {
            workspace_id: workspaceId,
            name,
            user_initiated: true,
            action: "connect_new_channel",
          },
        });
        const newId = (created as { connection_id?: string })?.connection_id;
        if (!newId) throw new Error("Gateway não devolveu connection_id.");
        log("connection_created", { connection_id: newId });
        cid = newId;
      }
      if (isRemovingRef.current) return;
      setConnectionId(cid);
      await fetchQr(cid);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Falha ao criar conexão.";
      // Erro controlado de duplicidade: mostra mensagem limpa, sem prefixo técnico.
      const msg = raw.startsWith("QR_CONNECTION_EXISTS:")
        ? raw.slice("QR_CONNECTION_EXISTS:".length).trim()
        : raw;
      setErrorMsg(msg);
      setStep("error");
    }
  };

  const fetchQr = async (cid: string) => {
    if (isRemovingRef.current) return;
    setStep("generating_qr");
    try {
      log("qr_requested", { connection_id: cid });
      const r = await qrFn({ data: { connection_id: cid } });
      if (isRemovingRef.current) return;
      const qr = r.qr_base64 || r.qr || null;
      if (!qr) {
        // NUNCA inferir connected a partir do /qr. Sem QR = ainda preparando.
        throw new Error("QR Code ainda não disponível. Tente novamente.");
      }
      log("qr_ready", { connection_id: cid, expires_in: r.expires_in });
      setQrData(qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`);
      setStep("waiting_scan");
      log("waiting_scan", { connection_id: cid });
      startStatusPolling(cid);
      const ttl = (r.expires_in ?? 60) * 1000;
      qrExpireRef.current = setTimeout(() => {
        setStep((curr) => (curr === "waiting_scan" ? "expired" : curr));
      }, ttl);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Falha ao gerar QR.");
      setStep("error");
    }
  };

  // 3) Polling de /status a cada 3s. Connected SÓ se backend disser status==="connected"
  //    E vier phone_number. Qualquer outro shape = continua aguardando scan.
  const startStatusPolling = (cid: string) => {
    if (isRemovingRef.current) return;
    if (pollRef.current) clearInterval(pollRef.current);
    log("status_polling", { connection_id: cid, interval_ms: 3000 });
    pollRef.current = setInterval(async () => {
      if (isRemovingRef.current) {
        stopAllTimers();
        return;
      }
      try {
        const s = await statusFn({ data: { connection_id: cid, workspace_id: workspaceId } });
        if (isRemovingRef.current) return;
        // Auto-reconhece: assim que o backend confirma status=connected,
        // já avança. phone_number é bônus (alguns provedores demoram a popular).
        const isConnected = s.status === "connected";
        if (isConnected) {
          log("connected_confirmed", { connection_id: cid, phone: s.phone_number, saved: s.saved_connection_id });
          setPhoneNumber(s.phone_number ?? null);
          setStep("connected");
          stopAllTimers();
          onConnected?.();
          toast.success("WhatsApp conectado!");
        } else if (s.status === "error") {
          setErrorMsg("Erro de conexão no Gateway.");
          setStep("error");
          stopAllTimers();
        }
        // status "qr" | "disconnected" | "unknown" | connected sem phone:
        // NÃO mudar pra connected. Mantém waiting_scan.
      } catch {
        // ignora falhas pontuais de polling
      }
    }, 3000);
  };

  // Ciclo de vida do modal.
  useEffect(() => {
    if (open) {
      if (isRemovingRef.current) return;
      void checkGateway({ autoAdvance: false });
    } else {
      stopAllTimers();
      clearConnectionState();
      setRemovingMode(false);
    }
    return () => stopAllTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const logoutM = useMutation({
    mutationFn: () => logoutFn({ data: { connection_id: connectionId! } }),
    onSuccess: () => {
      toast.success("WhatsApp desconectado.");
      stopAllTimers();
      setStep("gateway_online");
      setQrData(null);
      setPhoneNumber(null);
      onConnected?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const regenerateQr = async () => {
    if (isRemovingRef.current) return;
    if (!connectionId) {
      void startConnection();
      return;
    }
    setQrData(null);
    await fetchQr(connectionId);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      stopAllTimers();
      clearConnectionState();
      setRemovingMode(false);
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="h-[100dvh] w-screen max-w-none rounded-none border-0 p-0 sm:h-auto sm:max-h-[90vh] sm:w-[95vw] sm:max-w-md sm:rounded-lg sm:border overflow-y-auto"
      >
        <div className="border-b bg-gradient-to-br from-emerald-500/10 to-transparent p-5 pt-6 sm:pt-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <QrCode className="h-5 w-5 text-emerald-600" /> Conectar WhatsApp por QR
            </DialogTitle>
            <DialogDescription className="text-sm">
              Escaneie o código com o seu celular para vincular o WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <Stepper step={step} />
        </div>


        <div className="p-5">
          {step === "checking_gateway" && (
            <CenteredState>
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Verificando Gateway…</p>
            </CenteredState>
          )}

          {step === "gateway_online" && (
            <CenteredState>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Wifi className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-base font-semibold">Gateway online</p>
              {gatewayInfo && (
                <p className="text-xs text-muted-foreground">
                  Respondeu em {gatewayInfo.latency_ms}ms
                </p>
              )}
              <Button size="lg" className="mt-2 h-12 w-full" onClick={startConnection} disabled={isRemoving}>
                Conectar WhatsApp
              </Button>

            </CenteredState>
          )}

          {step === "creating_connection" && (
            <CenteredState>
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Criando conexão…</p>
            </CenteredState>
          )}

          {step === "generating_qr" && (
            <CenteredState>
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              <p className="text-sm font-medium">Gerando QR Code…</p>
            </CenteredState>
          )}

          {(step === "qr_ready" || step === "waiting_scan") && qrData && (
            <div className="space-y-4">
              <div className="mx-auto flex aspect-square w-full max-w-[20rem] items-center justify-center rounded-xl border bg-white p-3 shadow-sm sm:max-w-[16rem]">
                <img src={qrData} alt="QR Code WhatsApp" className="h-full w-full object-contain" />
              </div>
              <ol className="space-y-2 rounded-lg border bg-muted/30 p-3 text-sm">
                <li>1. Abra o <strong>WhatsApp</strong> no celular</li>
                <li>2. Toque em <strong>Aparelhos conectados</strong></li>
                <li>3. Toque em <strong>Conectar aparelho</strong></li>
                <li>4. Escaneie o QR Code acima</li>
              </ol>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Aguardando leitura do QR Code…
              </div>
              <Button variant="outline" size="lg" className="h-12 w-full" onClick={regenerateQr} disabled={isRemoving}>
                <RefreshCw className="mr-2 h-4 w-4" /> Gerar novo QR
              </Button>
            </div>
          )}


          {step === "expired" && (
            <CenteredState>
              <AlertTriangle className="h-10 w-10 text-amber-500" />
              <p className="font-medium">QR Code expirou</p>
              <Button size="lg" className="h-12 w-full" onClick={regenerateQr} disabled={isRemoving}>
                <RefreshCw className="mr-2 h-4 w-4" /> Gerar novo QR
              </Button>
            </CenteredState>
          )}

          {step === "connected" && (
            <CenteredState>
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <p className="text-lg font-semibold">WhatsApp conectado!</p>
              {phoneNumber && (
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm">
                  <Smartphone className="h-4 w-4 text-emerald-600" /> {phoneNumber}
                </div>
              )}
              <div className="flex w-full flex-col gap-2 pt-2">
                <Button size="lg" className="h-12" onClick={() => onOpenChange(false)}>Concluir</Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => logoutM.mutate()}
                  disabled={logoutM.isPending}
                >
                  Desconectar
                </Button>
              </div>
            </CenteredState>
          )}

          {step === "error" && (
            <CenteredState>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <WifiOff className="h-6 w-6 text-red-500" />
              </div>
              <p className="font-medium">Não consegui conectar</p>
              {errorMsg && (
                <p className="text-center text-sm text-muted-foreground">{errorMsg}</p>
              )}
              <div className="flex w-full flex-col gap-2 pt-2 sm:flex-row">
                <Button variant="outline" size="lg" className="h-12 flex-1" onClick={() => onOpenChange(false)}>
                  Fechar
                </Button>
                <Button size="lg" className="h-12 flex-1" onClick={() => checkGateway()}>
                  Tentar de novo
                </Button>
              </div>
            </CenteredState>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}

function CenteredState({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-center gap-3 py-6">{children}</div>;
}

function Stepper({ step }: { step: Step }) {
  const items = useMemo(
    () => [
      {
        id: "health",
        label: "Gateway",
        active: ["checking_gateway", "gateway_online"].includes(step),
        done: ["creating_connection", "generating_qr", "qr_ready", "waiting_scan", "expired", "connected"].includes(step),
      },
      {
        id: "create",
        label: "Conexão",
        active: step === "creating_connection",
        done: ["generating_qr", "qr_ready", "waiting_scan", "expired", "connected"].includes(step),
      },
      {
        id: "qr",
        label: "QR",
        active: ["generating_qr", "qr_ready", "waiting_scan", "expired"].includes(step),
        done: step === "connected",
      },
      {
        id: "done",
        label: "Conectado",
        active: step === "connected",
        done: step === "connected",
      },
    ],
    [step],
  );
  return (
    <div className="mt-4 flex items-center justify-between gap-1">
      {items.map((it, i) => (
        <div key={it.id} className="flex flex-1 items-center gap-1">
          <div
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
              it.done
                ? "border-emerald-500 bg-emerald-500 text-white"
                : it.active
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-700"
                  : "border-muted-foreground/30 bg-background text-muted-foreground",
            )}
          >
            {i + 1}
          </div>
          <span
            className={cn(
              "truncate text-[11px]",
              it.active || it.done ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            {it.label}
          </span>
          {i < items.length - 1 && <div className="h-px flex-1 bg-border" />}
        </div>
      ))}
    </div>
  );
}
