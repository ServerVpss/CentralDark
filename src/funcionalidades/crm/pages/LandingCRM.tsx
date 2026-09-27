import { Users } from "lucide-react";
import ModuleLanding from "@/funcionalidades/telepainel/components/landing/ModuleLanding";

export default function LandingCRM() {
  return (
    <ModuleLanding
      brand="CRM"
      tagline="clientes, funis e relacionamento"
      description="Gerencie contatos, oportunidades e funis num CRM leve, rápido e que conversa com os outros módulos da CentralDark."
      status="em processo"
      accent="262 70% 60%"
      icon={Users}
      pageTitle="CRM — CentralDark"
      pageDescription="CRM da CentralDark. Em processo."
      features={[
        { title: "Funil visual", desc: "Arraste oportunidades entre etapas e acompanhe a evolução em tempo real." },
        { title: "Ficha completa", desc: "Histórico, notas, tarefas e integrações no perfil de cada cliente." },
        { title: "Integra com tudo", desc: "Sincroniza com WhatsApp, Telegram e Financeiro automaticamente." },
      ]}
    />
  );
}
