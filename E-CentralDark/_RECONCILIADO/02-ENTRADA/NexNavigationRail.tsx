import { MessageSquare, Users, Phone, Circle, Settings, type LucideIcon } from "lucide-react";

export type NexNavTab = "chat" | "groups" | "calls" | "status" | "settings";

const ITEMS: { id: NexNavTab; icon: LucideIcon; label: string }[] = [
  { id: "chat", icon: MessageSquare, label: "Chats" },
  { id: "groups", icon: Users, label: "Grupos" },
  { id: "calls", icon: Phone, label: "Chamadas" },
  { id: "status", icon: Circle, label: "Status" },
  { id: "settings", icon: Settings, label: "Config" },
];

export function NexNavigationRail({
  active,
  onChange,
  onSettings,
  avatarFallback,
}: {
  active: NexNavTab;
  onChange?: (tab: NexNavTab) => void;
  onSettings?: () => void;
  avatarFallback?: string;
}) {
  return (
    <nav className="nx-rail">
      {/* Logo só aparece no desktop (rail vertical) */}
      <div className="nx-rail-group nx-rail-top">
        <div className="nx-rail-logo" title="MultiZap">M</div>
      </div>

      {/* Itens principais — viram bottom nav no mobile */}
      <div className="nx-rail-group nx-rail-main">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const isSettings = it.id === "settings";
          return (
            <button
              key={it.id}
              type="button"
              className="nx-rail-btn"
              data-active={active === it.id}
              onClick={() => {
                if (isSettings && onSettings) {
                  onSettings();
                } else {
                  onChange?.(it.id);
                }
              }}
              title={it.label}
            >
              <Icon size={20} />
              <span className="nx-rail-label">{it.label}</span>
            </button>

          );
        })}
      </div>

      {/* Avatar só desktop */}
      <div className="nx-rail-group nx-rail-bottom">
        <div className="nx-avatar" style={{ width: 40, height: 40 }}>
          {avatarFallback ?? "U"}
        </div>
      </div>
    </nav>
  );
}
