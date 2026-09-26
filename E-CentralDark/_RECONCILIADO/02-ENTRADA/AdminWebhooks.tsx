import { AdminWrapper } from "@/components/dashboard/AdminWrapper";
import Webhooks from "@/pages/Webhooks";

export default function AdminWebhooks() {
  return (
    <AdminWrapper title="Webhooks — Integrações Globais">
      <Webhooks />
    </AdminWrapper>
  );
}
