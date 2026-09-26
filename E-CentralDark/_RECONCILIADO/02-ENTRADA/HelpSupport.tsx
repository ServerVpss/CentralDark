import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, ExternalLink } from "lucide-react";

export default function HelpSupport() {
    
  
  return (
    <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold font-display tracking-wide">Ajuda & Suporte</h1>
              <p className="text-muted-foreground text-sm font-mono mt-1">Documentação oficial e central de dúvidas.</p>
            </div>
            
          </div>
          <div className="max-w-3xl space-y-8"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-primary/5 border border-primary/20 p-6 rounded-xl border-glow shadow-[0_0_15px_hsl(var(--primary)/0.05)]"><BookOpen className="w-8 h-8 text-primary mb-4"/><h3 className="font-display font-bold text-lg mb-2">Documentação API</h3><p className="text-sm text-muted-foreground mb-6">Leia a documentação completa dos endpoints, requests e responses em formato cURL.</p><Button variant="outline" className="w-full gap-2 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">Acessar Docs <ExternalLink className="w-4 h-4"/></Button></div></div><div><h3 className="font-display font-bold text-lg mb-4 text-primary">Perguntas Frequentes (FAQ)</h3><Accordion type="single" collapsible className="w-full bg-card/40 border border-border rounded-xl px-5 py-2 backdrop-blur-sm"><AccordionItem value="item-1" className="border-border/50"><AccordionTrigger className="font-mono text-sm hover:text-primary hover:no-underline">Como reconectar uma instância?</AccordionTrigger><AccordionContent className="text-muted-foreground text-sm leading-relaxed">Vá até a aba Instâncias, clique no botão "Ler QR" e escaneie com seu aparelho celular logado no WhatsApp.</AccordionContent></AccordionItem><AccordionItem value="item-2" className="border-border/50"><AccordionTrigger className="font-mono text-sm hover:text-primary hover:no-underline">O que são Webhooks?</AccordionTrigger><AccordionContent className="text-muted-foreground text-sm leading-relaxed">Webhooks permitem que seu sistema receba eventos em tempo real (como novas mensagens ou mudança de status de conexão) via POST HTTP em uma URL de sua escolha.</AccordionContent></AccordionItem></Accordion></div></div>
        </div>
      );
}