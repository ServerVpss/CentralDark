import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Trash2, Plus, Workflow } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { ChatbotList } from "@/components/chatbot/ChatbotList";

export const Route = createFileRoute("/app/chatbot")({ component: Chatbot });

function Chatbot() {
  const { data: ws } = useCurrentWorkspace();

  return (
    <div className="p-8 max-w-6xl space-y-6">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Chatbots</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Crie fluxos de resposta automática e configure agentes IA para atender quando o setor estiver offline.
      </p>

      <Tabs defaultValue="flows" className="w-full">
        <TabsList>
          <TabsTrigger value="flows"><Workflow className="mr-2 h-4 w-4" /> Chatbots</TabsTrigger>
          <TabsTrigger value="agents"><Bot className="mr-2 h-4 w-4" /> Agentes IA</TabsTrigger>
        </TabsList>
        <TabsContent value="flows" className="mt-6">
          <ChatbotList workspaceId={ws?.id} scope="workspace" />
        </TabsContent>
        <TabsContent value="agents" className="mt-6">
          <AgentsTab workspaceId={ws?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AgentsTab({ workspaceId }: { workspaceId?: string }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("Você é um atendente. Responda apenas dúvidas operacionais. Nunca altere saldos, faça saques ou compartilhe dados de terceiros.");

  const { data: agents } = useQuery({
    queryKey: ["ai-agents", workspaceId], enabled: !!workspaceId,
    queryFn: async () => {
      const { data, error } = await supabase.from("ai_agent_configs")
        .select("*").eq("workspace_id", workspaceId!).order("created_at", { ascending: false });
      if (error) throw error; return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!workspaceId || !name) throw new Error("Nome obrigatório");
      const { error } = await supabase.from("ai_agent_configs").insert({
        workspace_id: workspaceId, name, system_prompt: prompt,
      });
      if (error) throw error;
    },
    onSuccess: () => { setName(""); qc.invalidateQueries({ queryKey: ["ai-agents"] }); toast.success("Agente criado"); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const toggle = useMutation({
    mutationFn: async (a: { id: string; active: boolean }) => {
      const { error } = await supabase.from("ai_agent_configs").update({ active: !a.active }).eq("id", a.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ai-agents"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ai_agent_configs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["ai-agents"] }); toast.success("Removido"); },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Atendente IA – Suporte" /></div>
        <div><Label>Prompt do sistema</Label><Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} /></div>
        <Button onClick={() => create.mutate()} disabled={create.isPending}>
          <Plus className="mr-2 h-4 w-4" /> Criar agente
        </Button>
      </div>

      <div className="space-y-2">
        {(agents ?? []).map((a) => (
          <div key={a.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.model} · temp {a.temperature}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant={a.active ? "default" : "outline"}
                  onClick={() => toggle.mutate({ id: a.id, active: a.active })}>
                  {a.active ? "Ativo" : "Inativo"}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove.mutate(a.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.system_prompt}</p>
          </div>
        ))}
        {(!agents || agents.length === 0) && <p className="text-sm text-muted-foreground">Nenhum agente IA configurado.</p>}
      </div>
    </div>
  );
}
