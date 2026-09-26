# OUTRO - ChatbotSettingsModal.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\clone-deck\apps\crm\src\components\chatbot\ChatbotSettingsModal.tsx
**SHA:** 96ed0f9f76337fcf
**Timestamp:** 2026-08-26T19:31:45.421925
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- <p className="text-xs text-muted-foreground mt-2"><span className="font-semibold">Padrão:</span> {m.placeholder}</p>

### Ouro Bruto (primeiros 5000 chars)
```
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
          keywords: (flow.keywo
```