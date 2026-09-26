import { NexContact } from "./types";
import { Phone, User, Tag, StickyNote, Briefcase } from "lucide-react";

function PanelEmpty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="nx-panel-empty">
      <span className="nx-panel-empty-icon">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export function NexContactPanel({
  contact,
  sector,
  assignee,
  tags,
  notes,
}: {
  contact: NexContact;
  sector?: string | null;
  assignee?: string | null;
  tags?: string[];
  notes?: string | null;
}) {
  const initials = contact.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const hasTags = (tags ?? []).length > 0;
  const hasNotes = !!notes?.trim();

  return (
    <aside className="nx-panel">
      <div className="nx-panel-header">
        <div className="nx-panel-avatar">
          {contact.avatarUrl
            ? <img src={contact.avatarUrl} alt={contact.name} style={{ width: "100%", height: "100%", borderRadius: 999, objectFit: "cover" }} />
            : initials}
        </div>
        <div style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.2 }}>{contact.name}</div>
        {contact.phone && (
          <div className="nx-panel-meta">
            <Phone size={12} /> {contact.phone}
          </div>
        )}
      </div>

      <div className="nx-panel-section">
        <h4><Briefcase size={11} /> Setor</h4>
        {sector ? <div className="nx-panel-value">{sector}</div> : <PanelEmpty icon={<Briefcase size={14} />} text="Sem setor definido" />}
      </div>

      <div className="nx-panel-section">
        <h4><User size={11} /> Atendente</h4>
        {assignee ? <div className="nx-panel-value">{assignee}</div> : <PanelEmpty icon={<User size={14} />} text="Não atribuído" />}
      </div>

      <div className="nx-panel-section">
        <h4><Tag size={11} /> Etiquetas</h4>
        {hasTags ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {tags!.map((t) => <span key={t} className="nx-badge">{t}</span>)}
          </div>
        ) : <PanelEmpty icon={<Tag size={14} />} text="Nenhuma etiqueta" />}
      </div>

      <div className="nx-panel-section">
        <h4><StickyNote size={11} /> Notas</h4>
        {hasNotes ? (
          <div className="nx-panel-notes">{notes}</div>
        ) : <PanelEmpty icon={<StickyNote size={14} />} text="Sem notas internas" />}
      </div>
    </aside>
  );
}
