// Fila de envio de mensagens do chat — modelo WhatsApp Web.
//
// Ideia: a UI nunca espera a resposta da Meta. A mensagem aparece na hora
// (optimistic), entra numa fila local por ticket, e um worker em background
// processa em série (uma de cada vez por ticket, em ordem). Falhas têm retry
// exponencial. A fila é persistida em localStorage pra sobreviver a reload.
//
// O backend (sendMessage) já grava em ticket_messages e dispara pela Meta.
// Aqui só desacoplamos o "apertou enter" do "Meta respondeu".

import type { QueryClient } from "@tanstack/react-query";

export type QueuedMessage = {
  /** id local da mensagem otimista (não é o id do banco) */
  localId: string;
  ticketId: string;
  body: string;
  isInternalNote: boolean;
  /** autoriza fallback Meta→QR (já confirmado pelo atendente no composer) */
  confirmFallbackToQr?: boolean;
  createdAt: string;
  attempts: number;
  /** "pending" enquanto na fila, "failed" depois de esgotar tentativas */
  status: "pending" | "failed";
  lastError?: string;
};

type SendFn = (vars: { ticketId: string; body: string; isInternalNote: boolean; confirmFallbackToQr?: boolean }) => Promise<unknown>;

const STORAGE_KEY = "multizap.chat.sendqueue.v1";
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [1_000, 3_000, 9_000];

type TicketQueue = {
  items: QueuedMessage[];
  processing: boolean;
};

// Estado em memória, chaveado por ticketId. Tickets diferentes rodam em paralelo.
const queues = new Map<string, TicketQueue>();
const listeners = new Set<() => void>();
const EMPTY_QUEUE: QueuedMessage[] = [];

// ----------------------------------------------------------------------------
// Persistência (localStorage) — sobrevive a reload do navegador.
// ----------------------------------------------------------------------------

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function persist() {
  if (!isBrowser()) return;
  try {
    const flat: QueuedMessage[] = [];
    for (const q of queues.values()) flat.push(...q.items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flat));
  } catch {
    // localStorage pode estar cheio ou bloqueado — fila continua em memória.
  }
}

export function hydrateQueueFromStorage(): QueuedMessage[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as QueuedMessage[];
    for (const m of arr) {
      const q = queues.get(m.ticketId) ?? { items: [], processing: false };
      q.items.push({ ...m, status: m.status === "failed" ? "failed" : "pending" });
      queues.set(m.ticketId, q);
    }
    return arr;
  } catch {
    return [];
  }
}

// ----------------------------------------------------------------------------
// API pública
// ----------------------------------------------------------------------------

export function getQueueSnapshot(ticketId: string): QueuedMessage[] {
  return queues.get(ticketId)?.items ?? EMPTY_QUEUE;
}

export function getEmptyQueueSnapshot(): QueuedMessage[] {
  return EMPTY_QUEUE;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  for (const l of listeners) {
    try { l(); } catch { /* listener com problema não derruba a fila */ }
  }
}

/**
 * Adiciona uma mensagem à fila e dispara o processamento em background.
 * Retorna na hora — a UI não espera a Meta.
 */
export function enqueueMessage(
  msg: Omit<QueuedMessage, "attempts" | "status">,
  sendFn: SendFn,
  qc: QueryClient,
): void {
  const q = queues.get(msg.ticketId) ?? { items: [], processing: false };
  q.items.push({ ...msg, attempts: 0, status: "pending" });
  queues.set(msg.ticketId, q);
  persist();
  notify();
  void processQueue(msg.ticketId, sendFn, qc);
}

/** Reenviar manualmente uma mensagem que falhou. */
export function retryMessage(ticketId: string, localId: string, sendFn: SendFn, qc: QueryClient): void {
  const q = queues.get(ticketId);
  if (!q) return;
  const item = q.items.find((i) => i.localId === localId);
  if (!item) return;
  item.status = "pending";
  item.attempts = 0;
  item.lastError = undefined;
  persist();
  notify();
  void processQueue(ticketId, sendFn, qc);
}

/** Remove uma mensagem da fila (ex: usuário descartou ou foi confirmada). */
export function removeFromQueue(ticketId: string, localId: string): void {
  const q = queues.get(ticketId);
  if (!q) return;
  q.items = q.items.filter((i) => i.localId !== localId);
  if (q.items.length === 0) queues.delete(ticketId);
  persist();
  notify();
}

// ----------------------------------------------------------------------------
// Worker — processa em série por ticket
// ----------------------------------------------------------------------------

async function processQueue(ticketId: string, sendFn: SendFn, qc: QueryClient): Promise<void> {
  const q = queues.get(ticketId);
  if (!q || q.processing) return;
  q.processing = true;

  try {
    while (true) {
      const next = q.items.find((i) => i.status === "pending");
      if (!next) break;

      const startedAt = typeof performance !== "undefined" ? performance.now() : Date.now();
      console.log("[chat-send] ▶ tentativa", {
        ticketId: next.ticketId,
        localId: next.localId,
        attempt: next.attempts + 1,
        bodyPreview: next.body.slice(0, 80),
        isInternalNote: next.isInternalNote,
      });

      try {
        const result = await sendFn({
          ticketId: next.ticketId,
          body: next.body,
          isInternalNote: next.isInternalNote,
          confirmFallbackToQr: next.confirmFallbackToQr,
        });
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        console.log("[chat-send] ✅ enviado", {
          ticketId: next.ticketId,
          localId: next.localId,
          tookMs: Math.round(now - startedAt),
          result,
        });
        // Sucesso — tira da fila e pede refresh da lista de mensagens.
        q.items = q.items.filter((i) => i.localId !== next.localId);
        persist();
        notify();
        qc.invalidateQueries({ queryKey: ["messages", ticketId] });
        qc.invalidateQueries({ queryKey: ["tickets"] });
      } catch (err) {
        const now = typeof performance !== "undefined" ? performance.now() : Date.now();
        next.attempts += 1;
        const rawMsg = (err as Error)?.message ?? "Falha ao enviar";
        next.lastError = rawMsg;
        console.error("[chat-send] ❌ falhou", {
          ticketId: next.ticketId,
          localId: next.localId,
          attempt: next.attempts,
          maxAttempts: MAX_ATTEMPTS,
          tookMs: Math.round(now - startedAt),
          error: rawMsg,
          errObj: err,
        });
        // Toast a partir da 2ª falha — evita ruído em flutuação curta de rede.
        if (next.attempts >= 2 && typeof window !== "undefined") {
          try {
            const { toast } = await import("sonner");
            toast.error(`Envio falhou (${next.attempts}/${MAX_ATTEMPTS}): ${rawMsg}`);
          } catch { /* sonner indisponível */ }
        }
        if (next.attempts >= MAX_ATTEMPTS) {
          next.status = "failed";
          persist();
          notify();
          // Marca falha e segue pra próxima — não bloqueia a fila inteira.
          continue;
        }
        // Backoff antes de tentar de novo.
        const wait = BACKOFF_MS[Math.min(next.attempts - 1, BACKOFF_MS.length - 1)];
        notify();
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  } finally {
    q.processing = false;
    if (q.items.length === 0) queues.delete(ticketId);
    notify();
  }
}
