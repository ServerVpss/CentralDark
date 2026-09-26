// useLiveMessages — Fase 1 (polling incremental por cursor) + Fase 2 (SSE com fallback).
// Read-only, sem token, sem Supabase. Consome a API pública em api.centralldark.com.

import { useEffect, useRef, useState, useCallback } from "react";
import { API_BASE } from "@/lib/apiBase";

export type LiveMessage = {
  id: string;
  chat: string;
  from: string;
  fromMe: boolean;
  timestamp: string | null;
  type: string;
  text: string;
};

type MessagesPayload = {
  ok: boolean;
  jid?: string;
  count?: number;
  incremental?: boolean;
  cursor?: { sinceTs: number | null; sinceId: string | null } | null;
  messages?: LiveMessage[];
  error?: string;
  message?: string;
};

type Options = {
  jid?: string;
  enabled?: boolean;
  initialCount?: number;
  pollMs?: number;
  preferSse?: boolean;
};

export function useLiveMessages({
  jid,
  enabled = true,
  initialCount = 30,
  pollMs = 3000,
  preferSse = true,
}: Options) {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transport, setTransport] = useState<"sse" | "polling" | "idle">("idle");

  const cursorRef = useRef<{ sinceTs: number | null; sinceId: string | null }>({ sinceTs: null, sinceId: null });
  const seenIdsRef = useRef<Set<string>>(new Set());
  const pollTimerRef = useRef<number | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const visibleRef = useRef<boolean>(typeof document === "undefined" ? true : !document.hidden);

  const merge = useCallback((incoming: LiveMessage[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const next = [...prev];
      for (const m of incoming) {
        if (!m.id || seenIdsRef.current.has(m.id)) continue;
        seenIdsRef.current.add(m.id);
        next.push(m);
      }
      next.sort((a, b) => (new Date(a.timestamp || 0).getTime()) - (new Date(b.timestamp || 0).getTime()));
      return next.length > 500 ? next.slice(next.length - 500) : next;
    });
  }, []);

  const fetchPage = useCallback(async (incremental: boolean) => {
    if (!jid) return;
    const qs = new URLSearchParams();
    qs.set("jid", jid);
    qs.set("count", String(incremental ? 50 : initialCount));
    if (incremental && cursorRef.current.sinceTs) qs.set("sinceTs", String(cursorRef.current.sinceTs));
    if (incremental && cursorRef.current.sinceId) qs.set("sinceId", cursorRef.current.sinceId);

    const r = await fetch(`${API_BASE}/v1/whatsapp/messages?${qs.toString()}`, { cache: "no-store" });
    const payload = (await r.json()) as MessagesPayload;
    if (!r.ok || !payload.ok) throw new Error(payload.message || payload.error || `HTTP ${r.status}` || "Resposta inválida");

    if (payload.messages?.length) merge(payload.messages);
    if (payload.cursor) cursorRef.current = payload.cursor;
  }, [jid, initialCount, merge]);

  const startPolling = useCallback(() => {
    if (pollTimerRef.current) return;
    setTransport((t) => (t === "sse" ? t : "polling"));
    const tick = async () => {
      if (!visibleRef.current) return;
      try {
        await fetchPage(true);
        setError(null);
      } catch (e: any) {
        setError(e?.message || "Falha no polling");
      }
    };
    pollTimerRef.current = window.setInterval(tick, pollMs);
  }, [fetchPage, pollMs]);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startSse = useCallback(() => {
    if (esRef.current) return;
    try {
      const es = new EventSource(`${API_BASE}/v1/whatsapp/stream`);
      esRef.current = es;
      es.addEventListener("hello", () => {
        setTransport("sse");
        setError(null);
      });
      es.addEventListener("whatsapp.message", (ev) => {
        try {
          const data = JSON.parse((ev as MessageEvent).data);
          const synthetic: LiveMessage = {
            id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            chat: data.chat,
            from: data.from,
            fromMe: !!data.fromMe,
            timestamp: data.timestamp,
            type: data.type || "text",
            text: data.text || "",
          };
          merge([synthetic]);
        } catch {
          // ignora payload malformado
        }
      });
      es.onerror = () => {
        setTransport("polling");
        setError(null);
        try { es.close(); } catch { /* noop */ }
        esRef.current = null;
        setTimeout(() => { if (enabled && preferSse) startSse(); }, 10000);
      };
    } catch {
      setTransport("polling");
      setError(null);
    }
  }, [merge, enabled, preferSse]);

  useEffect(() => {
    if (!enabled || !jid) return;

    let cancelled = false;
    setLoading(true);
    setMessages([]);
    seenIdsRef.current = new Set();
    cursorRef.current = { sinceTs: null, sinceId: null };

    (async () => {
      try {
        await fetchPage(false);
        if (cancelled) return;
        setError(null);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Falha ao carregar mensagens");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    if (preferSse) startSse();
    startPolling();

    const onVisibility = () => {
      visibleRef.current = !document.hidden;
      if (visibleRef.current) fetchPage(true).catch(() => { /* polling cobre */ });
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      stopPolling();
      if (esRef.current) { try { esRef.current.close(); } catch { /* noop */ } esRef.current = null; }
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled, jid, fetchPage, startPolling, stopPolling, startSse, preferSse]);

  return { messages, loading, error, transport };
}
