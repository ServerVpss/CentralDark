# OUTRO - NexConversationList.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\nexchat\NexConversationList.tsx
**SHA:** df7284568f4d66b5
**Timestamp:** 2026-08-26T19:31:08.502761
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const gap = parseFloat(cs.gap) || parseFloat(cs.columnGap) || 12;

### Ouro Bruto (primeiros 5000 chars)
```
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NexConversation } from "./types";
import { NexConversationItem } from "./NexConversationItem";

type Filter = "all" | "unread" | "groups" | "channels";

export type NexStatusItem = {
  id: string;
  name: string;
  color?: string; // família do canal: meta | qr | web
  avatarUrl?: string | null;
};

export function NexConversationList({
  title = "Mensagens",
  conversations,
  selectedId,
  onSelect,
  emptyLabel = "Nenhuma conversa",
  statusItems,
  showAskAi = true,
  askAiHref = "/app/utilidades/agente-ia",
  onAddStatus,
  topSlot,
  headerMenu,
}: {
  title?: string;
  conversations: NexConversation[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  emptyLabel?: string;
  statusItems?: NexStatusItem[];
  showAskAi?: boolean;
  askAiHref?: string;
  onAddStatus?: () => void;
  topSlot?: React.ReactNode;
  headerMenu?: React.ReactNode;
}) {


  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const storiesRef = useRef<HTMLDivElement | null>(null);
  const [storiesCapacity, setStoriesCapacity] = useState(6);

  // Mede a largura real do container e do primeiro story pra calcular quantos
  // cabem no espaço — funciona em qualquer breakpoint (mobile/tablet/desktop)
  // sem hardcode. Reserva 1 slot pro botão "Meu status".
  useEffect(() => {
    const el = storiesRef.current;
    if (!el) return;
    const recompute = () => {
      const cs = getComputedStyle(el);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      const gap = parseFloat(cs.gap) || parseFloat(cs.columnGap) || 12;
      const inner = el.clientWidth - padL - padR;
      const firstChild = el.firstElementChild as HTMLElement | null;
      const storyW = firstChild?.offsetWidth || 60;
      if (inner <= 0 || storyW <= 0) return;
      const total = Math.max(1, Math.floor((inner + gap) / (storyW + gap)));
      setStoriesCapacity(Math.max(0, total - 1));
    };
    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);


  // Stories/Status: deriva das conversas se não vier explícito.
  // Mostra exatamente quantos cabem no espaço (sem scroll horizontal).
  const derivedStatus = useMemo<NexStatusItem[]>(() => {
    if (statusItems && statusItems.length > 0) return statusItems.slice(0, storiesCapacity);
    const seen = new Map<string, NexStatusItem>();
    for (const c of conversations) {
      const fam = c.channel === "meta" ? "meta" : c.channel === "webchat" ? "web" : c.channel ? "qr" : undefined;
      const label = c.contact.name?.trim();
      if (!label) continue;
      if (!seen.has(label)) {
        seen.set(label, { id: c.contact.id ?? label, name: label, color: fam, avatarUrl: c.contact.avatarUrl });
      }
      if (seen.size >= storiesCapacity) break;
    }
    return Array.from(seen.values());
  }, [conversations, statusItems, storiesCapacity]);

  const filtered = useMemo(() => {
    return conversations.filter((c) => {
      if (search && !c.contact.name.toLowerCase().includes(search.toLowerCase())) return false;
      const isGroup = c.channelType === "group";
      // HOTFIX: filtros fortes — grupo só aparece na aba "Grupos".
      if (filter === "all" && isGroup) return false;
      if (filter === "unread" && (isGroup || !(c.unread && c.unread > 0))) return false;
      if (filter === "groups" && !isGroup) return false;
      if (filter === "channels" && isGroup) return false;
      return true;
    });
  }, [conversations, filter, search]);

  return (
    <aside className="nx-list">
      <div className="nx-list-header">
        <div className="nx-list-title-row">
          <div className="nx-list-title">{title}</div>
          {headerMenu}
        </div>

        <div className="nx-search">
          <Search size={16} />
          <input
            placeholder="Buscar conversas…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Linha de status (stories) — fiel ao print do NexChat */}
        <div ref={storiesRef} className="nx-stories" role="list" aria-label="Status e conexões">
          <motion.button
            type="button"
            className="nx-story"
            onClick={onAddStatus}
            role="listitem"
            aria-label="Meu status"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.93 }}
          >
            <span className="nx-story-avatar nx-story-add-ring">
              <Plus size={22} />
            </span>
         
```