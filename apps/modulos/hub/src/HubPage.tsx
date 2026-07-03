import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { CatalogTab } from './components/catalog/CatalogTab';
import { PoliciesTab } from './components/policies/PoliciesTab';
import { AuditTab } from './components/audit/AuditTab';
import { ConnectorsTab } from './components/connectors/ConnectorsTab';
import { RoleGuard } from './components/shared/RoleGuard';

export default function HubPage() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">CentralDark HUB v2</h1>
        <p className="text-muted-foreground">Orquestração de MCP, Políticas de Segurança e Auditoria Imutável.</p>
      </header>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="catalog">Catálogo</TabsTrigger>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
          <TabsTrigger value="connectors">Conectores</TabsTrigger>
          <TabsTrigger value="audit">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab />
        </TabsContent>

        <TabsContent value="catalog">
          <CatalogTab />
        </TabsContent>

        <TabsContent value="policies">
          <RoleGuard requiredRole="admin">
            <PoliciesTab />
          </RoleGuard>
        </TabsContent>

        <TabsContent value="connectors">
          <ConnectorsTab />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}