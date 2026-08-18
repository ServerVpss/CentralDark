import { useState } from "react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useSecurity } from "@/shared/hooks/useSecurity";
import {
  HouseSecurityOverview,
  SecurityHeader,
  SecurityStats,
  SecurityToggles,
  SecurityAdvanced,
  SecurityHistory,
} from "@/apps/modulos/telepainel/components/security";
import type { BotSecuritySettings } from "@/shared/hooks/telegram/types";

export default function Security() {
  const {
    bots,
    selectedBotId,
    setSelectedBotId,
    stats,
    statsLoading,
    securitySettings,
    settingsLoading,
    blockedMessages,
    historyLoading,
    saveSettings,
    refreshStats,
    refreshHistory,
  } = useSecurity();

  const [pendingChanges, setPendingChanges] = useState<Partial<BotSecuritySettings>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = (key: keyof BotSecuritySettings, value: boolean) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = (key: keyof BotSecuritySettings, value: unknown) => {
    setPendingChanges((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (Object.keys(pendingChanges).length === 0) return;
    setIsSaving(true);
    const success = await saveSettings(pendingChanges);
    if (success) setPendingChanges({});
    setIsSaving(false);
  };

  const handleRefresh = () => {
    refreshStats();
    refreshHistory();
  };

  const displaySettings = securitySettings
    ? { ...securitySettings, ...pendingChanges }
    : null;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-[1400px] space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Center / Centro de Segurança</h1>
          <p className="text-sm text-muted-foreground">
            Defesa privada da Casa. Detectar, validar, conter, preservar evidência e endurecer — sem retaliação.
          </p>
        </div>

        <Tabs defaultValue="house" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="house">Casa / House</TabsTrigger>
            <TabsTrigger value="bots">Bots</TabsTrigger>
          </TabsList>

          <TabsContent value="house" className="mt-6">
            <HouseSecurityOverview />
          </TabsContent>

          <TabsContent value="bots" className="mt-6 space-y-5">
            <SecurityHeader
              bots={bots}
              selectedBotId={selectedBotId}
              onBotChange={setSelectedBotId}
              onRefresh={handleRefresh}
              onSave={handleSave}
              isSaving={isSaving}
            />

            <SecurityStats stats={stats} loading={statsLoading} />

            <Tabs defaultValue="protections" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="protections">Proteções</TabsTrigger>
                <TabsTrigger value="advanced">Avançado</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>

              <TabsContent value="protections" className="mt-6">
                <SecurityToggles
                  settings={displaySettings}
                  loading={settingsLoading}
                  onToggle={handleToggle}
                />
              </TabsContent>

              <TabsContent value="advanced" className="mt-6">
                <SecurityAdvanced
                  settings={displaySettings}
                  loading={settingsLoading}
                  onUpdate={handleUpdate}
                />
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <SecurityHistory messages={blockedMessages} loading={historyLoading} />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
