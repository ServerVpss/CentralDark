import { Wallet } from "lucide-react";
import ModuleLanding from "@/apps/modulos/telepainel/components/landing/ModuleLanding";

export default function LandingFinanceiro() {
  return (
    <ModuleLanding
      brand="Financeiro"
      tagline="cobranças, PIX e relatórios"
      description="Cobranças automáticas, PIX integrado e relatórios financeiros prontos. Tudo num módulo só, conectado aos demais."
      status="em breve"
      accent="38 95% 55%"
      icon={Wallet}
      pageTitle="Financeiro — CentralDark"
      pageDescription="Módulo financeiro da CentralDark. Em breve disponível."
      features={[
        { title: "PIX nativo", desc: "Cobranças geradas e confirmadas automaticamente via webhook." },
        { title: "Recorrências", desc: "Assinaturas, mensalidades e renovações sem dor de cabeça." },
        { title: "Relatórios prontos", desc: "Receita, inadimplência e ticket médio em dashboards visuais." },
      ]}
    />
  );
}
