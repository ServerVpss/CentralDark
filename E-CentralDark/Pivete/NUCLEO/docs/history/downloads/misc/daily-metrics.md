# OUTRO - daily-metrics.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\routes\api\public\cron\daily-metrics.ts
**SHA:** 1eba6a06e7feebf0
**Timestamp:** 2026-08-26T19:31:18.662598
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

### Ouro Bruto (primeiros 5000 chars)
```
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runJob, jobIsEnabled } from "@/lib/system-cron.server";
import { requireCronSecret } from "@/lib/cron-auth.server";

export const Route = createFileRoute("/api/public/cron/daily-metrics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        await requireCronSecret(request);
        return runJob("daily-metrics", async () => {
        if (!(await jobIsEnabled("daily-metrics"))) return { skipped: true };
        const today = new Date(); today.setUTCHours(0, 0, 0, 0);
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        // Agrega mensagens enviadas por workspace no dia anterior
        const { data: msgs, error: e1 } = await supabaseAdmin
          .from("whatsapp_message_log")
          .select("workspace_id")
          .gte("created_at", yesterday.toISOString())
          .lt("created_at", today.toISOString())
          .eq("direction", "out");
        if (e1) throw new Error(e1.message);

        const counts = new Map<string, number>();
        for (const m of msgs ?? []) counts.set(m.workspace_id, (counts.get(m.workspace_id) ?? 0) + 1);

        let upserted = 0;
        for (const [workspace_id, n] of counts) {
          const { error } = await supabaseAdmin.from("workspace_usage").upsert({
            workspace_id, month: monthStart.toISOString().slice(0, 10),
            messages_sent: n,
          } as never, { onConflict: "workspace_id,month" });
          if (!error) upserted++;
        }
        return { workspaces: counts.size, upserted };
      });
      },
    },
  },
});

```