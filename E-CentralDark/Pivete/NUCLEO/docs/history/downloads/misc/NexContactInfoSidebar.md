# OUTRO - NexContactInfoSidebar.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\nexchat\NexContactInfoSidebar.tsx
**SHA:** 06d5a52b0a94110b
**Timestamp:** 2026-08-26T19:31:47.863992
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- style={{ cursor: contactId ? "pointer" : "default", display: "inline-flex", alignItems: "center", gap: 6 }}
- <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>

### Ouro Bruto (primeiros 5000 chars)
```
// Painel direito fiel à .chat-info-sidebar do ChatWindow.tsx (template NexChat).
// Substitui o NexContactPanel no /app/chat. Mostra avatar grande, detalhes,
// etiquetas (com botão "+" pra adicionar), notas e grid de mídia compartilhada.

import { useMemo, useState, useRef, useEffect } from "react";
import { X, Phone, Smartphone, Briefcase, User, Tag, StickyNote, Image as ImageIcon, Plus, Check, Pencil } from "lucide-react";
import type { NexContact, NexChannelKind } from "./types";
import { NexChannelBadge } from "./NexChannelBadge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { updateContactName } from "@/lib/contacts.functions";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";

const CHANNEL_LABEL: Record<NexChannelKind, string> = {
  meta: "WhatsApp Meta Cloud",
  multizap_qr: "WhatsApp QR (MultiZap)",
  wuzapi: "WhatsApp QR (WuzAPI)",
  webchat: "Webchat",
};

type TagRow = { id: string; name: string; color: string };

function Section({
  icon, title, action, children,
}: { icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="nx-info-section">
      <div className="nx-info-section-head">
        <span className="nx-info-section-title">{icon} {title}</span>
        {action}
      </div>
      <div className="nx-info-section-body">{children}</div>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <span className="nx-info-empty">{children}</span>;
}

function TagAdder({
  contactId, currentTags,
}: { contactId: string; currentTags: string[] }) {
  const { data: ws } = useCurrentWorkspace();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const tagsQ = useQuery({
    queryKey: ["workspace-tags", ws?.id],
    enabled: !!ws?.id && open,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("id, name, color")
        .eq("workspace_id", ws!.id)
        .order("name");
      if (error) throw error;
      return (data ?? []) as TagRow[];
    },
  });

  const addTag = useMutation({
    mutationFn: async (name: string) => {
      const next = Array.from(new Set([...(currentTags ?? []), name]));
      const { error } = await supabase.from("contacts").update({ tags: next }).eq("id", contactId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Etiqueta adicionada");
      qc.invalidateQueries({ queryKey: ["nex-chat-tickets"] });
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const available = useMemo(
    () => (tagsQ.data ?? []).filter((t) => !(currentTags ?? []).includes(t.name)),
    [tagsQ.data, currentTags],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="nx-tag-add-btn" title="Adicionar etiqueta" aria-label="Adicionar etiqueta">
          <Plus size={14} strokeWidth={2.6} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="nx-tag-popover w-64 p-2">
        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Etiquetas disponíveis
        </div>
        {tagsQ.isLoading ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">Carregando…</div>
        ) : available.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            {(tagsQ.data ?? []).length === 0
              ? "Nenhuma etiqueta criada ainda. Crie em Utilidades → Etiquetas."
              : "Todas as etiquetas já foram adicionadas."}
          </div>
        ) : (
          <div className="flex flex-col">
            {available.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={addTag.isPending}
                onClick={() => { addTag.mutate(t.name); setOpen(false); }}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent transition-colors"
              >
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ background: t.color }}
                />
                <span className="flex-1 truncate">{t.name}</span>
                <Check size={14} className="opacity-0 group-hover:opacity-60" />
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

function InlineEditableName({ contactId, name }: { contactId: string; name: string }) {
  const [editing, setEditing] = useState(false);
  con
```