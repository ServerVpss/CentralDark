import React, { useState } from "react";
import { 
  Save, 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  CheckCircle2, 
  RefreshCcw,
  Zap,
  Bot,
  Plug,
  Lock,
  Mail,
  Smartphone,
  Eye,
  EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<"general" | "security" | "notifications" | "billing">("general");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    setLoading(true);
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: 'Salvando alterações...',
      success: () => {
        setLoading(false);
        return 'Configurações atualizadas!';
      },
      error: 'Erro ao salvar configurações.',
    });
  };

  const tabs = [
    { id: "general", label: "Geral", icon: Globe },
    { id: "security", label: "Segurança", icon: Shield },
    { id: "notifications", label: "Notificações", icon: Bell },
    { id: "billing", label: "Assinatura", icon: Database },
  ];

  return (
    <div className="flex-1 p-4 md:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            Configurações
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie as preferências da sua conta e do workspace.</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="gap-2 shadow-lg shadow-primary/20 min-w-[140px]"
        >
          {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:w-full ${
                activeTab === tab.id 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-inner' 
                  : 'text-muted-foreground hover:bg-muted/50 border border-transparent'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* --- GENERAL TAB --- */}
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="bg-card/40 border border-border rounded-2xl p-6 backdrop-blur-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-4">
                      <Globe className="w-5 h-5 text-primary" /> Informações do Workspace
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Nome da Empresa</label>
                        <Input defaultValue="Minha Empresa LTDA" className="bg-background/50 border-border" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Domínio / Slug</label>
                        <div className="flex items-center gap-2 bg-background/50 border border-border rounded-md px-3 h-10">
                           <span className="text-xs text-muted-foreground font-mono">wabot.io/</span>
                           <Input defaultValue="minha-empresa" className="border-none bg-transparent h-full p-0 focus-visible:ring-0 shadow-none font-mono" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">E-mail Comercial</label>
                        <Input defaultValue="contato@empresa.com" className="bg-background/50 border-border" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Fuso Horário</label>
                        <Input defaultValue="America/Sao_Paulo" className="bg-background/50 border-border font-mono text-xs" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/40 border border-border rounded-2xl p-6 backdrop-blur-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-4">
                      <Bot className="w-5 h-5 text-primary" /> Preferências do WhatsApp
                    </h3>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-sm font-bold">Auto-Leitura de Mensagens</p>
                             <p className="text-xs text-muted-foreground">Marcar como lida automaticamente ao receber no painel.</p>
                          </div>
                          <Switch defaultChecked />
                       </div>
                       <Separator className="border-border/50" />
                       <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-sm font-bold">Simular Digitação</p>
                             <p className="text-xs text-muted-foreground">Exibir "digitando..." para o cliente ao responder via dashboard.</p>
                          </div>
                          <Switch defaultChecked />
                       </div>
                       <Separator className="border-border/50" />
                       <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-sm font-bold">Encerrar Conversas Inativas</p>
                             <p className="text-xs text-muted-foreground">Fechar atendimento automaticamente após 24h sem resposta.</p>
                          </div>
                          <Switch />
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- SECURITY TAB --- */}
              {activeTab === "security" && (
                <div className="space-y-6">
                   <div className="bg-card/40 border border-border rounded-2xl p-6 backdrop-blur-sm space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-4">
                      <Lock className="w-5 h-5 text-primary" /> Alterar Senha
                    </h3>
                    <div className="space-y-4 max-w-md">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Senha Atual</label>
                          <div className="relative">
                            <Input type={showPassword ? "text" : "password"} className="bg-background/50 border-border pr-10" />
                            <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                               {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Nova Senha</label>
                          <Input type="password" className="bg-background/50 border-border" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold font-mono uppercase text-muted-foreground tracking-wider">Confirmar Nova Senha</label>
                          <Input type="password" className="bg-background/50 border-border" />
                       </div>
                       <Button variant="outline" size="sm">Atualizar Credenciais</Button>
                    </div>
                  </div>

                  <div className="bg-card/40 border border-border rounded-2xl p-6 backdrop-blur-sm space-y-6">
                    <div className="flex justify-between items-start border-b border-border/50 pb-4">
                       <h3 className="text-lg font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" /> Segurança da Conta
                      </h3>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Protegido</Badge>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-sm font-bold flex items-center gap-2">
                               <Smartphone className="w-4 h-4" /> Autenticação em Duas Etapas (2FA)
                             </p>
                             <p className="text-xs text-muted-foreground">Exigir código OTP via App para realizar login.</p>
                          </div>
                          <Switch defaultChecked />
                       </div>
                       <Separator className="border-border/50" />
                       <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                             <p className="text-sm font-bold flex items-center gap-2">
                               <Globe className="w-4 h-4" /> Bloqueio de Região
                             </p>
                             <p className="text-xs text-muted-foreground">Permitir acesso apenas do Brasil (BR).</p>
                          </div>
                          <Switch />
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- NOTIFICATIONS TAB --- */}
              {activeTab === "notifications" && (
                <div className="bg-card/40 border border-border rounded-2xl p-6 backdrop-blur-sm space-y-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border/50 pb-4">
                    <Bell className="w-5 h-5 text-primary" /> Alertas & Avisos
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                       <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Notificações do Sistema</p>
                       <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Instância Desconectada</p>
                          <div className="flex gap-4">
                             <span className="text-[10px] text-muted-foreground uppercase font-bold">Browser</span>
                             <Switch defaultChecked />
                          </div>
                       </div>
                       <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Falha em Campanha</p>
                          <div className="flex gap-4">
                             <span className="text-[10px] text-muted-foreground uppercase font-bold">Email</span>
                             <Switch defaultChecked />
                          </div>
                       </div>
                    </div>
                    
                    <Separator className="border-border/50" />
                    
                    <div className="space-y-4">
                       <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Relatórios por E-mail</p>
                       <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Resumo Diário (Performance)</p>
                          <Switch />
                       </div>
                       <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">Relatório Financeiro Semanal</p>
                          <Switch defaultChecked />
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- BILLING TAB --- */}
              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <Zap className="w-24 h-24 text-primary" />
                    </div>
                    <div className="space-y-4 relative z-10">
                       <Badge className="bg-primary text-primary-foreground font-black tracking-widest px-3 py-1">PLANO PRO</Badge>
                       <h3 className="text-4xl font-black tracking-tighter">R$ 299,00 <span className="text-sm font-normal text-muted-foreground">/mês</span></h3>
                       <div className="flex gap-6 pt-2">
                          <div className="space-y-0.5">
                             <p className="text-[10px] uppercase font-bold text-muted-foreground">Próximo Vencimento</p>
                             <p className="text-sm font-mono font-bold">15 Jun 2026</p>
                          </div>
                          <div className="space-y-0.5">
                             <p className="text-[10px] uppercase font-bold text-muted-foreground">Forma de Pagto</p>
                             <p className="text-sm font-bold flex items-center gap-1.5"><CreditCard className="w-4 h-4" /> •••• 4242</p>
                          </div>
                       </div>
                       <div className="flex gap-2 pt-4">
                          <Button className="font-bold shadow-lg shadow-primary/20">Upgrade para Business</Button>
                          <Button variant="outline" className="font-bold border-primary/20 hover:bg-primary/10">Alterar Cartão</Button>
                       </div>
                    </div>
                  </div>

                  <div className="bg-card/40 border border-border rounded-2xl p-6 backdrop-blur-sm space-y-4">
                    <h4 className="font-bold">Limites do Plano</h4>
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs font-mono">
                             <span className="text-muted-foreground">Conexões WhatsApp</span>
                             <span className="text-foreground font-bold">5 / 10</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                             <div className="h-full bg-primary w-1/2 rounded-full" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-xs font-mono">
                             <span className="text-muted-foreground">Envios de Campanha / Mês</span>
                             <span className="text-foreground font-bold">12.5k / 50k</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                             <div className="h-full bg-primary w-1/4 rounded-full" />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Dummy components for credit card
function CreditCard(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}
