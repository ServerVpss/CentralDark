import { Users } from "lucide-react";
import ModuleLanding from "@/components/landing/ModuleLanding";

export default function LandingCRM() {
  return (
    <ModuleLanding
      brand="CRM"
      tagline="clientes, funis e relacionamento"
      description="Gerencie contatos, oportunidades e funis num CRM leve, rápido e que conversa com os outros módulos da CentralDeck."
      status="em breve"
      accent="262 70% 60%"
      icon={Users}
      pageTitle="CRM — CentralDeck"
      pageDescription="CRM da CentralDeck. Em breve disponível."
      features={[
        { title: "Funil visual", desc: "Arraste oportunidades entre etapas e acompanhe a evolução em tempo real." },
        { title: "Ficha completa", desc: "Histórico, notas, tarefas e integrações no perfil de cada cliente." },
        { title: "Integra com tudo", desc: "Sincroniza com WhatsApp, Telegram e Financeiro automaticamente." },
      ]}
    />
  );
}
