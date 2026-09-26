// Hook que retorna status da janela 24h pra um ticket e atualiza o cronômetro a cada segundo.
// Usa Intl com timezone America/Sao_Paulo pra exibir hora correta brasileira.
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getTicketWindowStatus } from "@/lib/security-pause.functions";

export type WindowStatus = "open" | "warning" | "closed" | "no_channel" | "unknown";

export function useWindowStatus(ticketId: string | null | undefined) {
  const fn = useServerFn(getTicketWindowStatus);
  const q = useQuery({
    queryKey: ["ticket-window", ticketId],
    enabled: !!ticketId,
    queryFn: () => fn({ data: { ticketId: ticketId! } }),
    refetchInterval: 60_000, // revalida do servidor a cada 1min
    staleTime: 30_000,
  });

  // Tick local a cada segundo pra atualizar o cronômetro suavemente.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const data = q.data;
  if (!data) {
    return {
      status: "unknown" as WindowStatus,
      label: "",
      color: "var(--nx-text-muted)",
      canSend: false,
      isLoading: q.isLoading,
    };
  }

  const status = data.status as WindowStatus;
  const canSend = status === "open" || status === "warning";

  if (status === "no_channel") {
    return { status, label: "Sem canal WhatsApp", color: "#ef4444", canSend: false, isLoading: false };
  }
  if (status === "closed") {
    return {
      status,
      label: "⛔ Fora da janela 24h — só template Meta",
      color: "#ef4444",
      canSend: false,
      isLoading: false,
    };
  }

  // Tem inbound: calcula tempo restante em tempo real
  if (data.lastInboundAt) {
    const expiresAt = new Date(data.lastInboundAt).getTime() + 24 * 3_600_000;
    const remainingMs = Math.max(0, expiresAt - Date.now());
    if (remainingMs === 0) {
      return {
        status: "closed" as WindowStatus,
        label: "⛔ Janela 24h expirou",
        color: "#ef4444",
        canSend: false,
        isLoading: false,
      };
    }
    const totalMin = Math.floor(remainingMs / 60_000);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const s = Math.floor((remainingMs % 60_000) / 1000);
    const expiresBR = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(expiresAt));
    const color = totalMin < 60 ? "#ef4444" : totalMin < 360 ? "#f59e0b" : "#22c55e";
    const label =
      h > 0
        ? `⏱ ${h}h ${m}min pra responder · expira ${expiresBR}`
        : `⏱ ${m}min ${s}s pra responder · expira ${expiresBR}`;
    return { status, label, color, canSend, isLoading: false };
  }

  return { status, label: "", color: "var(--nx-text-muted)", canSend, isLoading: false };
}
