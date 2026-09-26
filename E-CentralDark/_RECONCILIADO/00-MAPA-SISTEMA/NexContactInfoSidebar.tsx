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
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const renameFn = useServerFn(updateContactName);

  useEffect(() => { if (!editing) setValue(name); }, [name, editing]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = useMutation({
    mutationFn: async (next: string) => renameFn({ data: { contactId, name: next } }),
    onSuccess: () => {
      toast.success("Nome atualizado");
      qc.invalidateQueries({ queryKey: ["nex-chat-tickets"] });
      qc.invalidateQueries({ queryKey: ["nex-inbox-tickets"] });
      setEditing(false);
    },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  function commit() {
    const trimmed = value.trim();
    if (!trimmed || trimmed === name) { setEditing(false); setValue(name); return; }
    save.mutate(trimmed);
  }

  if (!editing) {
    return (
      <h3
        className="nx-info-name"
        onClick={() => contactId && setEditing(true)}
        title={contactId ? "Clique para editar o nome" : undefined}
        style={{ cursor: contactId ? "pointer" : "default", display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        {name}
        {contactId && <Pencil size={13} style={{ opacity: 0.4 }} />}
      </h3>
    );
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setEditing(false); setValue(name); }
        }}
        onBlur={commit}
        disabled={save.isPending}
        maxLength={120}
        className="nx-info-name-input"
        style={{
          fontSize: 17, fontWeight: 800, textAlign: "center",
          background: "transparent", border: "1px solid var(--nx-border)",
          borderRadius: 8, padding: "4px 10px", color: "inherit", outline: "none",
          maxWidth: 220,
        }}
      />
    </div>
  );
}

function NexContactInfoSidebarTmpAnchor() { return null; } void NexContactInfoSidebarTmpAnchor;

export function NexContactInfoSidebar({
  contact,
  sector,
  assignee,
  tags,
  notes,
  mediaUrls,
  onClose,
  onOpenImage,
  onSeeAllMedia,
}: {
  contact: NexContact;
  sector?: string | null;
  assignee?: string | null;
  tags?: string[];
  notes?: string | null;
  mediaUrls?: string[];
  onClose?: () => void;
  onOpenImage?: (url: string) => void;
  onSeeAllMedia?: () => void;
}) {
  const initials = contact.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const currentTags = tags ?? [];
  const hasTags = currentTags.length > 0;
  const hasNotes = !!notes?.trim();
  const media = (mediaUrls ?? []).slice(0, 6);
  const hasMedia = media.length > 0;

  return (
    <aside className="nx-info-sidebar">
      {/* Header */}
      <div className="nx-info-header">
        <span className="nx-info-header-title">Informações do contato</span>
        {onClose && (
          <button type="button" className="nx-icon-btn" title="Fechar painel" onClick={onClose}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Profile */}
      <div className="nx-info-profile">
        <div className="nx-info-avatar">
          {contact.avatarUrl
            ? <img src={contact.avatarUrl} alt={contact.name} />
            : <span>{initials}</span>}
          {contact.isOnline && <span className="nx-info-avatar-dot" />}
        </div>
        <InlineEditableName contactId={contact.id} name={contact.name} />
        {contact.phone && (
          <p className="nx-info-phone">
            <Phone size={13} /> {contact.phone}
          </p>
        )}
        <div className="nx-info-badges">
          {contact.channel && <NexChannelBadge channel={contact.channel} />}
        </div>
      </div>

      <div className="nx-info-scroll">
        {/* Detalhes */}
        <Section icon={<Smartphone size={13} />} title="Detalhes do contato">
          <div className="nx-info-row">
            <span>Canal</span>
            <strong>{contact.channel ? CHANNEL_LABEL[contact.channel] : "—"}</strong>
          </div>
          <div className="nx-info-row">
            <span>Telefone</span>
            <strong>{contact.phone ?? "—"}</strong>
          </div>
        </Section>

        {/* Setor */}
        <Section icon={<Briefcase size={13} />} title="Setor">
          {sector ? <span className="nx-info-value">{sector}</span> : <EmptyHint>Sem setor definido</EmptyHint>}
        </Section>

        {/* Atendente */}
        <Section icon={<User size={13} />} title="Atendente">
          {assignee ? <span className="nx-info-value">{assignee}</span> : <EmptyHint>Não atribuído</EmptyHint>}
        </Section>

        {/* Etiquetas */}
        <Section
          icon={<Tag size={13} />}
          title="Etiquetas"
          action={contact.id ? <TagAdder contactId={contact.id} currentTags={currentTags} /> : undefined}
        >
          {hasTags ? (
            <div className="nx-info-tags">
              {currentTags.map((t) => <span key={t} className="nx-badge">{t}</span>)}
            </div>
          ) : <EmptyHint>Nenhuma etiqueta</EmptyHint>}
        </Section>

        {/* Mídia e arquivos */}
        <Section
          icon={<ImageIcon size={13} />}
          title="Mídia e arquivos"
          action={hasMedia && onSeeAllMedia ? (
            <button type="button" className="nx-info-link" onClick={onSeeAllMedia}>Ver tudo</button>
          ) : undefined}
        >
          {hasMedia ? (
            <div className="nx-info-media-grid">
              {media.map((url, i) => (
                <button
                  key={`${url}-${i}`} type="button" className="nx-info-media-item"
                  onClick={() => onOpenImage?.(url)} title="Ver mídia"
                >
                  <img src={url} alt={`mídia ${i + 1}`} loading="lazy" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyHint>Sem mídia compartilhada nesta conversa</EmptyHint>
          )}
        </Section>

        {/* Notas internas */}
        <Section icon={<StickyNote size={13} />} title="Notas internas">
          {hasNotes ? <div className="nx-info-notes">{notes}</div> : <EmptyHint>Sem notas internas</EmptyHint>}
        </Section>
      </div>
    </aside>
  );
}
