import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { CatalogTab } from './components/catalog/CatalogTab';
import { PoliciesTab } from './components/policies/PoliciesTab';
import { AuditTab } from './components/audit/AuditTab';
import { ConnectorsTab } from './components/connectors/ConnectorsTab';
import { AbacusTab } from './components/abacus/AbacusTab';
import { GatewayTab } from './components/gateway/GatewayTab';
import { HermesTab } from './components/hermes/HermesTab';
import { RoleGuard } from './components/shared/RoleGuard';
import { Sparkles, LogIn, LogOut } from 'lucide-react';
import { ButtonLogDrawer } from './components/ButtonLogDrawer';
import { logButton, trackAction } from './lib/buttonLog';
import { hubAuth } from './integrations/supabase/hub-client';


export default function HubPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    hubAuth.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email ?? null));
    const { data: sub } = hubAuth.auth.onAuthStateChange((_evt, session) => {
      setUserEmail(session?.user.email ?? null);
      logButton('hub.auth-state-change', { user: session?.user.email ?? null });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function sair() {
    await trackAction('hub.logout', async () => {
      const { error } = await hubAuth.auth.signOut();
      if (error) throw error;
      return { status: 200 };
    });
    window.location.replace('/login');
  }

  return (
    <div className="min-h-screen">
      {/* Header estilo landing CentralDark */}
      <header className="border-b border-border/50 bg-background/60 backdrop-blur-xl sticky top-0 z-10">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg gradient-emerald flex items-center justify-center shadow-3d-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight leading-none">
                CentralDark <span className="text-gradient-emerald">HUB</span>
              </h1>
              <p className="text-xs text-muted-foreground mt-1">Orquestração · Políticas · Auditoria</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>mcp.centralldark.com</span>
            </span>
            {userEmail ? (
              <button
                onClick={sair}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:border-primary/60 hover:bg-primary/5 transition text-foreground"
                title={userEmail}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline max-w-[140px] truncate">{userEmail}</span>
                <span className="sm:hidden">Sair</span>
              </button>
            ) : (
              <a
                href="/login"
                onClick={() => logButton('hub.click-login-link')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md gradient-emerald text-primary-foreground shadow-3d-primary hover:opacity-90 transition"
              >
                <LogIn className="h-3.5 w-3.5" /> Entrar
              </a>
            )}
          </div>
        </div>
      </header>


      <main className="container mx-auto p-6 space-y-6">
        <Tabs defaultValue="dashboard" className="space-y-6" onValueChange={(v) => logButton('hub.tab-change', { tab: v })}>
          <TabsList className="grid w-full grid-cols-4 sm:grid-cols-8 h-auto sm:h-11 p-1 card-premium gap-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:gradient-emerald data-[state=active]:text-primary-foreground data-[state=active]:shadow-3d-primary transition-all">Dashboard</TabsTrigger>
            <TabsTrigger value="hermes" className="data-[state=active]:gradient-emerald data-[state=active]:text-primary-foreground data-[state=active]:shadow-3d-primary transition-all">🧠 Hermes</TabsTrigger>
            <TabsTrigger value="gateway" className="data-[state=active]:gradient-emerald data-[state=active]:text-primary-foreground data-[state=active]:shadow-3d-primary transition-all">🔌 Gateway</TabsTrigger>
            <TabsTrigger value="catalog" className="data-[state=active]:gradient-emerald data-[state=active]:text-primary-foreground data-[state=active]:shadow-3d-primary transition-all">Catálogo</TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:gradient-emerald data-[state=active]:text-primary-foreground data-[state=active]:shadow-3d-primary transition-all">Políticas</TabsTrigger>
            <TabsTrigger value="connectors" className="data-[state=active]:gradient-emerald data-[state=active]:text-primary-foreground data-[state=active]:shadow-3d-primary transition-all">Conectores</TabsTrigger>
            <TabsTrigger value="abacus" className="data-[state=active]:gradient-emerald data-[state=active]:text-primary-foreground data-[state=active]:shadow-3d-primary transition-all">Abacus</TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:gradient-emerald data-[state=active]:text-primary-foreground data-[state=active]:shadow-3d-primary transition-all">Auditoria</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab /></TabsContent>
          <TabsContent value="hermes"><HermesTab /></TabsContent>
          <TabsContent value="gateway"><GatewayTab /></TabsContent>
          <TabsContent value="catalog"><CatalogTab /></TabsContent>
          <TabsContent value="policies">
            <RoleGuard requiredRole="admin"><PoliciesTab /></RoleGuard>
          </TabsContent>
          <TabsContent value="connectors"><ConnectorsTab /></TabsContent>
          <TabsContent value="abacus"><AbacusTab /></TabsContent>
          <TabsContent value="audit"><AuditTab /></TabsContent>
        </Tabs>
      </main>
      <ButtonLogDrawer />
    </div>
  );
}
