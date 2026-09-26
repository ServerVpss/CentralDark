// Pré-visualização ao vivo das últimas mensagens da sessão conectada.
// Read-only, sem envio, sem Supabase. Usa SSE quando possível e polling incremental como fallback.

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Radio, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useLiveMessages } from "@/hooks/useLiveMessages";
import { API_BASE } from "@/lib/apiBase";

type Chat = {
  jid: string;
  messageKey?: string;
  name: string;
  type: "contact" | "group";
};

type RawChat = {
  jid?: string;
  chatId?: string;
  messageKey?: string;
  name?: string;
  title?: string;
  type?: "contact" | "group";
  kind?: "contact" | "group" | "unknown";
};

function normalizeChat(raw: RawChat): Chat | null {
  const jid = raw.jid || raw.chatId || "";
  const type = raw.type || (raw.kind === "group" ? "group" : "contact");
  if (!jid && !raw.messageKey) return null;
  return {
    jid,
    messageKey: raw.messageKey,
    name: raw.name || raw.title || jid || "Conversa",
    type,
  };
}

export function LiveMessagesPreview() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [erroChats, setErroChats] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErroChats(null);
        const r = await fetch(`${API_BASE}/v1/whatsapp/chats`, { cache: "no-store" });
        const payload = await r.json();
        if (!alive) return;

        const raw = Array.isArray(payload.items) ? payload.items : Array.isArray(payload.chats) ? payload.chats : [];
        const items = raw.map(normalizeChat).filter(Boolean).slice(0, 25) as Chat[];

        if (r.ok && payload.ok) {
          setChats(items);
          if (items[0]) setSelected(items[0].messageKey || items[0].jid);
        } else {
          setErroChats(payload.error || `HTTP ${r.status}` || "Sem chats");
        }
      } catch (e: any) {
        if (alive) setErroChats(e?.message || "Falha ao carregar chats");
      }
    })();
    return () => { alive = false; };
  }, []);

  const { messages, loading, error, transport } = useLiveMessages({
    jid: selected ?? undefined,
    enabled: !!selected,
    pollMs: 3000,
    preferSse: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/40 border border-border rounded-2xl p-5 backdrop-blur-sm shadow-lg mt-4"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl border bg-primary/10 border-primary/30 text-primary">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm tracking-wide uppercase">
              Mensagens ao vivo
            </h3>
            <p className="text-[11px] text-muted-foreground font-mono">
              Polling incremental + SSE • read-only
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-md border ${
              transport === "sse"
                ? "text-green-500 border-green-500/30 bg-green-500/10"
                : transport === "polling"
                ? "text-amber-500 border-amber-500/30 bg-amber-500/10"
                : "text-muted-foreground border-border bg-background/30"
            }`}
            title="Transporte ativo"
          >
            {transport === "sse" ? <Radio className="w-3 h-3" /> :
             transport === "polling" ? <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} /> :
             <WifiOff className="w-3 h-3" />}
            {transport.toUpperCase()}
          </span>
        </div>
      </div>

      {erroChats && (
        <div className="flex items-center gap-2 text-red-500 text-xs font-mono mb-2">
          <WifiOff className="w-4 h-4" /> {erroChats}
        </div>
      )}

      {chats.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {chats.map((c) => {
            const key = c.messageKey || c.jid;
            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={`text-[10px] font-mono px-2 py-1 rounded-md border transition ${
                  selected === key
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "border-border/60 text-muted-foreground hover:border-primary/30"
                }`}
                title={c.jid}
              >
                {c.type === "group" ? "👥 " : "👤 "}
                {c.name?.slice(0, 22) || c.jid}
              </button>
            );
          })}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs font-mono mb-2">
          <Wifi className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
        {messages.length === 0 ? (
          <div className="text-xs text-muted-foreground font-mono py-6 text-center">
            {loading ? "Carregando…" : "Sem mensagens recentes."}
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col p-2 rounded-md border text-xs ${
                m.fromMe
                  ? "border-primary/30 bg-primary/5 self-end"
                  : "border-border/60 bg-background/40"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="font-mono text-[10px] text-muted-foreground truncate">
                  {m.fromMe ? "eu" : m.from} • {m.type}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {m.timestamp ? new Date(m.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                </span>
              </div>
              <p className="text-foreground/90 break-words whitespace-pre-wrap">
                {m.text || <span className="italic text-muted-foreground">(sem texto)</span>}
              </p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
