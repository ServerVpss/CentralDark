import { AdminWrapper } from "@/components/dashboard/AdminWrapper";
import ApiIntegrations from "@/pages/ApiIntegrations";

export default function AdminApi() {
  return (
    <AdminWrapper title="API & Tokens — Gestão Global">
      <ApiIntegrations />
    </AdminWrapper>
  );
}
