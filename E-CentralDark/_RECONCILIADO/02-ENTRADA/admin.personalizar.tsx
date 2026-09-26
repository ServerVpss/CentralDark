import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageScaffold } from "@/components/page-scaffold";
import { Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/admin/personalizar")({ component: AdminPersonalizar });

function AdminPersonalizar() {
  const { data: rows } = useQuery({
    queryKey: ["admin-branding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_branding")
        .select("workspace_id, brand_name, logo_url, primary_color, sidebar_bg, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <PageScaffold
      title="Master · Personalização (White-label)"
      description="Marca, logo e cores aplicadas em cada workspace."
      icon={Palette}
    >
      <div className="p-6">
        <Card>
          <CardHeader><CardTitle>Workspaces personalizados ({rows?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            {!rows?.length ? (
              <p className="text-sm text-muted-foreground">Nenhum workspace personalizou ainda.</p>
            ) : (
              <ul className="divide-y">
                {rows.map((r) => (
                  <li key={r.workspace_id} className="flex items-center gap-3 py-2 text-sm">
                    {r.logo_url ? (
                      <img src={r.logo_url} alt="" className="h-8 w-8 rounded object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded" style={{ backgroundColor: r.primary_color ?? "#888" }} />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{r.brand_name ?? "(sem nome)"}</p>
                      <p className="font-mono text-xs text-muted-foreground">{r.workspace_id}</p>
                    </div>
                    <div className="flex gap-1">
                      {r.primary_color && <span className="h-5 w-5 rounded border" style={{ backgroundColor: r.primary_color }} />}
                      {r.sidebar_bg && <span className="h-5 w-5 rounded border" style={{ backgroundColor: r.sidebar_bg }} />}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </PageScaffold>
  );
}
