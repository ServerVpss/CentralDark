import { useState } from "react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Activity, Smartphone, Rocket, ListChecks } from "lucide-react";
import { VpsDeployPlugin } from "@/apps/modulos/telepainel/components/devops/VpsDeployPlugin";
import { DeployHistoryList } from "@/apps/modulos/telepainel/components/devops/DeployHistoryList";
import { RoadmapList } from "@/apps/modulos/telepainel/components/devops/RoadmapList";
import { IPhonePreviewModal } from "@/apps/modulos/telepainel/components/devops/IPhonePreviewModal";
import { McpStatusCard } from "@/apps/modulos/telepainel/components/devops/McpStatusCard";
import { useVpsDeploy } from "@/shared/hooks/useVpsDeploy";

export default function Status() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { history, loading } = useVpsDeploy();

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              Central de Status
            </h1>
            <p className="text-sm text-muted-foreground">
              Saúde do sistema, histórico de deploys, roadmap auto-construído e preview da VPS.
            </p>
          </div>
          <Button onClick={() => setPreviewOpen(true)} variant="outline" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Preview VPS (iPhone)
          </Button>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Plugin de deploy — plugável em qualquer tela */}
          <VpsDeployPlugin showHistory={false} />

          {/* Status ao vivo do MCP */}
          <McpStatusCard />

          {/* Roadmap */}
          <RoadmapList className="lg:col-span-2" />
        </div>

        {/* Histórico completo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Rocket className="h-4 w-4 text-primary" />
              Histórico completo de deploys
            </CardTitle>
            <CardDescription className="text-xs">
              Últimas 20 execuções do sync com a VPS.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeployHistoryList history={history} loading={loading} />
          </CardContent>
        </Card>

        {/* Aviso pedagógico */}
        <Card className="border-dashed">
          <CardContent className="p-4 text-xs text-muted-foreground flex items-start gap-2">
            <ListChecks className="h-4 w-4 mt-0.5 text-primary" />
            <div>
              Esta página é <strong>auto-construída</strong>: à medida que novas features ou
              pendências aparecem, vão sendo listadas no roadmap acima. Quando uma tarefa fica
              100%, marca como concluída — o histórico fica registrado.
            </div>
          </CardContent>
        </Card>
      </div>

      <IPhonePreviewModal open={previewOpen} onOpenChange={setPreviewOpen} />
    </DashboardLayout>
  );
}
