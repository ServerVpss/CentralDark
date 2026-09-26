import { AdminWrapper } from "@/components/dashboard/AdminWrapper";
import Sessions from "@/pages/Sessions";

export default function AdminSessions() {
  return (
    <AdminWrapper title="Sessões Ativas — Todas as Contas">
      <Sessions />
    </AdminWrapper>
  );
}
