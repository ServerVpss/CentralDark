import { MessageCircle } from "lucide-react";
import ModuleLanding from "@/components/landing/ModuleLanding";

export default function LandingWhatsapp() {
  return (
    <ModuleLanding
      brand="Bot WhatsApp"
      tagline="atendimento e consultas no WhatsApp"
      description="Um bot completo de WhatsApp pra atender clientes, responder consultas e automatizar fluxos — com a mesma pegada profissional do TelePainel."
      status="em breve"
      accent="142 70% 45%"
      icon={MessageCircle}
      pageTitle="Bot WhatsApp — CentralDark"
      pageDescription="Bot WhatsApp da CentralDark. Em breve disponível."
      features={[
        { title: "Atendimento 24/7", desc: "Respostas automáticas, filas e transferência humana quando preciso." },
        { title: "Consultas integradas", desc: "Mesmas fontes de dados do TelePainel, agora direto no WhatsApp." },
        { title: "Múltiplos números", desc: "Conecte vários números e separe por equipe ou produto." },
      ]}
    />
  );
}
