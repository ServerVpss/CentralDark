import React from 'react';
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
import { Sparkles } from 'lucide-react';

export default function HubPage() {
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
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>mcp.centralldark.com</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
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
    </div>
  );
}
