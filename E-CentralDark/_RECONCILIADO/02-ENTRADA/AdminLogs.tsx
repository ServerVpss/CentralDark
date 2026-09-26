import SystemLogs from "./SystemLogs";
import { AdminWrapper } from "@/components/dashboard/AdminWrapper";

export default function AdminLogs() {
  return (
    <AdminWrapper title="Logs Globais do Sistema">
      <SystemLogs />
    </AdminWrapper>
  );
}
