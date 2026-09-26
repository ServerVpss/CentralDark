import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listFlows, upsertFlow } from "@/lib/flows.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";

type ChatbotSettings = {
  inactivity_alert?: "ativo" | "inativo";
  redirect_wrong_attempts?: "ativo" | "inativo";
  triggers?: { text: boolean; audio: boolean; attachments: boolean; reactions: boolean; gifs: boolean };
  end_keywords?: string[];
  messages?: Record<string, { enabled: boolean; text: string }>;
};

const DEFAULT_MESSAGES: { key: string; title: string; desc: string; placeholder: string }[] = [
  { key: "inactivity", title: "Mensagem de Inatividade", desc: "Mensagem que aparece quando o usuário ficar inativo durante a conversa", placeholder: "Olá! Percebemos que você está inativo. Podemos ajudar em algo mais?" },
  { key: "invalid_menu", title: "Mensagem de opção inválida em menu", desc: "Mensagem exibida quando o usuário seleciona uma opção inválida em um menu", placeholder: "Desculpe, não consegui identificar a opção escolhida. Por favor, selecione uma das opções disponíveis." },
  { key: "invalid_satisfaction", title: "Mensagem de opção inválida em satisfação", desc: "Mensagem exibida quando o usuário seleciona uma opção inválida em satisfação", placeholder: "Desculpe, não consegui identificar a opção escolhida. Por favor, informe o número correspondente à sua nota sobre o nosso atendimento." },
  { key: "invalid_cpf", title: "Mensagem de CPF inválido em dados", desc: "Mensagem exibida quando o CPF informado é inválido", placeholder: "CPF inválido" },
  { key: "invalid_cnpj", title: "Mensagem de CNPJ inválido em dados", desc: "Mensagem exibida quando o CNPJ informado é inválido", placeholder: "CNPJ inválido" },
  { key: "invalid_email", title: "Mensagem de email inválido em dados", desc: "Mensagem exibida quando o email informado é inválido", placeholder: "Formato de e-mail inválido." },
  { key: "finished", title: "Mensagem de atendimento finalizado", desc: "Mensagem exibida quando o atendimento é finalizado", placeholder: "Atendimento finalizado" },
  { key: "transfer_user", title: "Mensagem de transferência (Usuário)", desc: "Mensagem exibida quando acontece transferência para usuário no chatbot", placeholder: "Você foi transferido para o atendente {{ user }}, aguarde um momento que você já será atendido(a)." },
  { key: "transfer_sector", title: "Mensagem de transferência (Setor)", desc: "Mensagem exibida quando acontece transferência para setor no chatbot", placeholder: "Você foi transferido para o setor {{ sector }}, aguarde um momento que você já será atendido." },
  { key: "transfer_both", title: "Mensagem de transferência (Setor e Usuário)", desc: "Mensagem exibida quando acontece transferência para setor e usuário no chatbot", placeholder: "Você foi transferido para o atendente {{ user }} do setor {{ sector }}, aguarde um momento que você já será atendido." },
];

export function ChatbotSettingsModal({ flowId, open, onClose }: { flowId: string; open: boolean; onClose: () => void }) {
  const fnList = useServerFn(listFlows);
  const fnUpsert = useServerFn(upsertFlow);
  const qc = useQueryClient();

  const { data: flows = [] } = useQuery({
    queryKey: ["flows-all-for-settings"],
    queryFn: () => fnList({ data: { scope: "admin" } }),
    enabled: open,
  });
  const flow = useMemo(() => flows.find((f) => f.id === flowId), [flows, flowId]);

  const [settings, setSettings] = useState<ChatbotSettings>({});
  const [keywordDraft, setKeywordDraft] = useState("");

  useEffect(() => {
    if (flow) setSettings((flow.settings as ChatbotSettings) ?? {});
  }, [flow]);

  const triggers = settings.triggers ?? { text: true, audio: true, attachments: true, reactions: true, gifs: true };
  const messages = settings.messages ?? {};

  const save = useMutation({
    mutationFn: async () => {
      if (!flow) throw new Error("Fluxo não encontrado");
      return fnUpsert({
        data: {
          id: flow.id,
          workspace_id: flow.workspace_id,
          name: flow.name,
          trigger_type: (flow.trigger_type as "keyword" | "welcome" | "fallback") ?? "keyword",
          keywords: (flow.keywords as string[] | null) ?? [],
          match_mode: (flow.match_mode as "contains" | "exact" | "starts_with") ?? "contains",
          reply_message: flow.reply_message ?? "",
          active: flow.active ?? true,
          priority: flow.priority ?? 0,
          is_multi_step: flow.is_multi_step ?? true,
          steps: ((flow.steps as unknown) as never) ?? [],
          bot_type: (flow.bot_type as "entrada" | "saida") ?? "entrada",
          settings: settings as unknown as Record<string, unknown>,
          graph: (flow.graph as Record<string, unknown>) ?? {},
        },
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["flows"] }); toast.success("Configurações salvas"); onClose(); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  const addKeyword = () => {
    const v = keywordDraft.trim();
    if (!v) return;
    const list = settings.end_keywords ?? [];
    if (!list.includes(v)) setSettings({ ...settings, end_keywords: [...list, v] });
    setKeywordDraft("");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Configurações</DialogTitle></DialogHeader>

        <Tabs defaultValue="recursos">
          <TabsList>
            <TabsTrigger value="recursos">Recursos</TabsTrigger>
            <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
          </TabsList>

          <TabsContent value="recursos" className="space-y-5 mt-4">
            <Card title="Alerta de inatividade" desc="Configure alertas automáticos quando o usuário ficar inativo durante a conversa">
              <Label>Alerta de inatividade</Label>
              <Select value={settings.inactivity_alert ?? "inativo"} onValueChange={(v) => setSettings({ ...settings, inactivity_alert: v as "ativo" | "inativo" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            <Card title="Redirecionar tentativas erradas" desc="Redirecione automaticamente para atendimento humano após múltiplas tentativas incorretas">
              <Label>Redirecionar tentativas erradas</Label>
              <Select value={settings.redirect_wrong_attempts ?? "inativo"} onValueChange={(v) => setSettings({ ...settings, redirect_wrong_attempts: v as "ativo" | "inativo" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            <Card title="Acionamento do chatbot" desc="Escolha quais tipos de evento podem acionar o chatbot. Se um tipo estiver desmarcado, esse evento não inicia nem continua o fluxo.">
              <div className="space-y-2">
                {(["text", "audio", "attachments", "reactions", "gifs"] as const).map((k) => (
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={triggers[k]} onCheckedChange={(c) => setSettings({ ...settings, triggers: { ...triggers, [k]: !!c } })} />
                    {{ text: "Texto", audio: "Áudio", attachments: "Anexos", reactions: "Reações", gifs: "GIFs" }[k]}
                  </label>
                ))}
                <p className="text-xs text-muted-foreground pt-2">
                  Anexos incluem imagem, vídeo, recado de vídeo, documento, localização, contato, lista de contatos e visualização única. GIFs incluem GIFs, figurinhas e mensagens só com emoji. Texto cobre mensagens de texto normais.
                </p>
              </div>
            </Card>

            <Card title="Gatilho de encerramento" desc="Configure palavras que, quando mencionadas pelo usuário, encerram automaticamente o atendimento do chatbot. Cada palavra será tratada como um gatilho separado.">
              <Label>Palavras gatilho</Label>
              <Input
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                placeholder="Digite uma palavra ou frase (cada palavra vira um gatilho separado)"
              />
              <p className="text-xs text-muted-foreground mt-2">Pressione Enter para adicionar.</p>
              {(settings.end_keywords ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {(settings.end_keywords ?? []).map((k) => (
                    <Badge key={k} variant="secondary" className="gap-1">
                      {k}
                      <button onClick={() => setSettings({ ...settings, end_keywords: (settings.end_keywords ?? []).filter((x) => x !== k) })}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="mensagens" className="space-y-4 mt-4">
            {DEFAULT_MESSAGES.map((m) => {
              const cur = messages[m.key] ?? { enabled: true, text: "" };
              return (
                <Card key={m.key} title={m.title} desc={m.desc} headerRight={
                  <Switch checked={cur.enabled} onCheckedChange={(c) => setSettings({ ...settings, messages: { ...messages, [m.key]: { ...cur, enabled: c } } })} />
                }>
                  <Textarea
                    value={cur.text}
                    onChange={(e) => setSettings({ ...settings, messages: { ...messages, [m.key]: { ...cur, text: e.target.value } } })}
                    rows={3}
                    disabled={!cur.enabled}
                  />
                  <p className="text-xs text-muted-foreground mt-2"><span className="font-semibold">Padrão:</span> {m.placeholder}</p>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Card({ title, desc, children, headerRight }: { title: string; desc?: string; children: React.ReactNode; headerRight?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card/50 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  );
}
