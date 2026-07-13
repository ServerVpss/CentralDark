import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/hub-client";
import { toast } from "@/shared/hooks/use-toast";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string | null;
  status: "pendente" | "em_andamento" | "concluido" | string;
  priority: number;
  auto_generated: boolean;
  completed_at: string | null;
  created_at: string;
}

export function useRoadmap() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("project_roadmap")
      .select("*")
      .order("status", { ascending: true })
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as RoadmapItem[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("project_roadmap_rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "project_roadmap" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  const add = useCallback(
    async (title: string, description?: string, priority = 3) => {
      if (!title.trim()) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const { error } = await supabase.from("project_roadmap").insert({
        title: title.trim(),
        description: description?.trim() || null,
        priority,
        created_by: user?.id ?? null,
      });
      if (error)
        toast({
          title: "Não deu pra adicionar",
          description: error.message,
          variant: "destructive",
        });
    },
    [],
  );

  const setStatus = useCallback(
    async (id: string, status: RoadmapItem["status"]) => {
      const patch: any = { status };
      if (status === "concluido") patch.completed_at = new Date().toISOString();
      else patch.completed_at = null;
      const { error } = await supabase
        .from("project_roadmap")
        .update(patch)
        .eq("id", id);
      if (error)
        toast({
          title: "Erro",
          description: error.message,
          variant: "destructive",
        });
    },
    [],
  );

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("project_roadmap")
      .delete()
      .eq("id", id);
    if (error)
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
  }, []);

  return { items, loading, add, setStatus, remove, reload: load };
}
