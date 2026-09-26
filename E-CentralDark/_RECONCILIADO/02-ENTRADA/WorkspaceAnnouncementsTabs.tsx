import { useState } from "react";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { AnnouncementsPanel } from "./AnnouncementsPanel";
import { cn } from "@/lib/utils";
import { Megaphone, Building2 } from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

/**
 * Tela usada em /app/notificacoes.
 * Mostra duas abas:
 *  - Oficiais → master_announcements (sempre só leitura).
 *  - Da empresa → workspace_announcements (CRUD se o usuário for admin/dono).
 */
export function WorkspaceAnnouncementsTabs() {
  const { data: ws, isLoading } = useCurrentWorkspace();
  const [tab, setTab] = useState<"master" | "workspace">("master");

  const isWorkspaceAdmin = ws?.role === "admin";

  return (
    <div className="flex h-full flex-col">
      {/* abas */}
      <div className="flex gap-1 border-b bg-card/30 px-4 pt-3 md:px-6">
        <TabButton
          active={tab === "master"}
          onClick={() => setTab("master")}
          icon={Megaphone}
          label="Oficiais"
          hint="Avisos da plataforma"
        />
        <TabButton
          active={tab === "workspace"}
          onClick={() => setTab("workspace")}
          icon={Building2}
          label="Da empresa"
          hint={isWorkspaceAdmin ? "Você pode publicar" : "Só leitura"}
        />
      </div>

      <div className="flex-1 min-h-0">
        {tab === "master" ? (
          <AnnouncementsPanel scope="master" canManage={false} />
        ) : isLoading ? (
          <p className="p-10 text-center text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
        ) : (
          <AnnouncementsPanel scope="workspace" canManage={!!isWorkspaceAdmin} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active, onClick, icon: Icon, label, hint,
}: {
  active: boolean; onClick: () => void; icon: any; label: string; hint: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-2 rounded-t-md border border-b-0 px-4 py-2 text-sm transition",
        active
          ? "border-border bg-background text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="font-medium">{label}</span>
      <span className="hidden text-[10px] uppercase tracking-wide opacity-60 md:inline">
        · {hint}
      </span>
    </button>
  );
}
