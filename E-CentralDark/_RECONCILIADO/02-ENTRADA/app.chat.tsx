import { createFileRoute } from "@tanstack/react-router";
import { NexInboxLayout } from "@/components/nexchat/NexInboxLayout";
import { MaintenanceBanner } from "@/components/maintenance-banner";

// /app/chat = NexChat unificado (histórico único por contato, badges META/QR,
// card "Baixe MultiZap Desktop"). Acesso público.
// A Central de Atendimentos clássica (tickets, abas Atendendo/Aguardando) vive em /app/inbox.
export const Route = createFileRoute("/app/chat")({
  component: ChatRoute,
  validateSearch: (search: Record<string, unknown>) => ({
    ticketId: typeof search.ticketId === "string" ? search.ticketId : undefined,
  }),
});

function ChatRoute() {
  return (
    <div className="flex h-full flex-col">
      <MaintenanceBanner />
      <div className="flex-1 min-h-0">
        <NexInboxLayout />
      </div>
    </div>
  );
}
