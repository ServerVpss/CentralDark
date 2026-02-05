import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSecurity } from "@/hooks/useSecurity";
import {
  SecurityHeader,
  SecurityStats,
  SecurityToggles,
  SecurityAdvanced,
  SecurityHistory,
} from "@/components/security";
import type { BotSecuritySettings } from "@/hooks/telegram/types";

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
    isLoading,
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
    if (success) {
      setPendingChanges({});
    }
    setIsSaving(false);
  };

  const handleRefresh = () => {
    refreshStats();
    refreshHistory();
  };

  // Merge pending changes with current settings for display
  const displaySettings = securitySettings
    ? { ...securitySettings, ...pendingChanges }
    : null;

  if (isLoading && !selectedBotId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
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
            <SecurityHistory
              messages={blockedMessages}
              loading={historyLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
