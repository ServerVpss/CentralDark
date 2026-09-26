import { Info, Phone, Search, Video, ArrowLeft } from "lucide-react";
import { NexContact } from "./types";
import { NexChannelBadge } from "./NexChannelBadge";
import { NexConnectionStatusBadge } from "./NexConnectionStatusBadge";

export function NexChatHeader({
  contact,
  subtitle,
  channel,
  status,
  onBack,
  onToggleInfo,
  rightActions,
}: {
  contact: NexContact;
  subtitle?: string;
  channel?: NexContact["channel"];
  status?: "connected" | "disconnected" | "error" | "pending";
  onBack?: () => void;
  onToggleInfo?: () => void;
  rightActions?: React.ReactNode;
}) {
  const initials = contact.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  return (
    <header className="nx-chat-header">
      <div className="nx-chat-user" onClick={onToggleInfo} style={{ cursor: onToggleInfo ? "pointer" : "default" }}>
        {onBack && (
          <button
            type="button"
            className="nx-icon-btn nx-back-mobile-only"
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            aria-label="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="nx-avatar nx-chat-user-avatar">
          {contact.avatarUrl ? <img src={contact.avatarUrl} alt={contact.name} /> : initials.toUpperCase()}
          {contact.isOnline && <span className="nx-avatar-dot" />}
        </div>
        <div className="nx-chat-user-info">
          <h3>{contact.name}</h3>
          <p
            className="nx-chat-user-subtitle"
            style={{ color: contact.isOnline ? "var(--nx-success)" : "var(--nx-text-muted)" }}
          >
            {subtitle ?? (contact.isOnline ? "Conversando agora" : "Sem atividade no momento")}
          </p>
        </div>
        <div className="nx-chat-user-badges">
          {channel && <NexChannelBadge channel={channel} />}
          {status && <NexConnectionStatusBadge status={status} />}
        </div>
      </div>
      <div className="nx-chat-header-actions">
        {rightActions ?? (
          <>
            <button type="button" className="nx-icon-btn"><Search size={18} /></button>
            <button type="button" className="nx-icon-btn"><Phone size={18} /></button>
            <button type="button" className="nx-icon-btn"><Video size={18} /></button>
            <button type="button" className="nx-icon-btn" onClick={onToggleInfo} aria-label="Informações"><Info size={18} /></button>
          </>
        )}
      </div>
    </header>

  );
}
