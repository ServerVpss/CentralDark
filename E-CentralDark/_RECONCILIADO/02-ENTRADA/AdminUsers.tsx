import Users from "./Users";
import { AdminWrapper } from "@/components/dashboard/AdminWrapper";

export default function AdminUsers() {
  return (
    <AdminWrapper title="Gestão de Usuários — Visão Global">
      <Users />
    </AdminWrapper>
  );
}
