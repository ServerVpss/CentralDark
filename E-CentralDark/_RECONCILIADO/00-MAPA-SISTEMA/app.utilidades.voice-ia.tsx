import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mic, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";

export const Route = createFileRoute("/app/utilidades/voice-ia")({ component: Page });

type Settings = {
  workspace_id: string;
  active: boolean;
  provider: string;
  language: string;
  voice: string;
  opening_message: string | null;
  max_seconds: number;
  transcribe_incoming: boolean;
  reply_with_voice: boolean;
  status_note: string | null;
};

function Page() {
  const { data: ws } = useCurrentWorkspace();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: cfg, isLoading } = useQuery({
    queryKey: ["voice-ia", ws?.id],
    enabled: !!ws?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workspace_voice_ai_settings")
        .select("*")
        .eq("workspace_id", ws!.id)
        .maybeSingle();
      if (error) throw error;
      return data as Settings | null;
    },
  });

  const [form, setForm] = useState<Settings | null>(null);
  useEffect(() => {
    if (cfg) setForm(cfg);
    else if (ws?.id) setForm({ workspace_id: ws.id, active: false, provider: "none", language: "pt-BR", voice: "female_warm", opening_message: "Olá! Posso te ajudar?", max_seconds: 60, transcribe_incoming: true, reply_with_voice: false, status_note: null });
  }, [cfg, ws?.id]);

  const save = useMutation({
    mutationFn: async () => {
      if (!form || !ws?.id) throw new Error("Sem workspace");
      const payload = { ...form, workspace_id: ws.id, updated_by: user?.id ?? null };
      const { error } = await supabase.from("workspace_voice_ai_settings").upsert(payload, { onConflict: "workspace_id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Configuração salva"); qc.invalidateQueries({ queryKey: ["voice-ia", ws?.id] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  if (isLoading || !form) return <div className="p-6"><p className="text-sm text-muted-foreground">Carregando...</p></div>;

  const providerOk = form.provider !== "none";

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Mic className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-semibold">Voice IA</h1>
            <p className="text-xs text-muted-foreground">Transcrição de áudios recebidos e respostas por voz.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 max-w-3xl space-y-6">
        <div className={`flex items-start gap-3 rounded-lg border p-4 ${providerOk ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}`}>
          {providerOk ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-amber-500" />}
          <div className="text-sm">
            {providerOk
              ? <>Provedor <strong>{form.provider}</strong> configurado. Voice IA está {form.active ? "ATIVA" : "desativada"} pra esse workspace.</>
              : <>Nenhum provedor de voz conectado ainda. Configure abaixo. Sem provedor, a transcrição e a resposta por voz não funcionam.</>}
          </div>
        </div>

        <section className="rounded-xl border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Ativar Voice IA</Label>
              <p className="text-xs text-muted-foreground">Liga/desliga geral pra esse workspace.</p>
            </div>
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Provedor</Label>
              <Select value={form.provider} onValueChange={(v) => setForm({ ...form, provider: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem value="lovable">Lovable AI (padrão)</SelectItem>
                  <SelectItem value="openai">OpenAI (Whisper + TTS)</SelectItem>
                  <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Idioma</Label>
              <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">Português (BR)</SelectItem>
                  <SelectItem value="en-US">Inglês (US)</SelectItem>
                  <SelectItem value="es-ES">Espanhol</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Voz</Label>
              <Select value={form.voice} onValueChange={(v) => setForm({ ...form, voice: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female_warm">Feminina (calma)</SelectItem>
                  <SelectItem value="female_pro">Feminina (profissional)</SelectItem>
                  <SelectItem value="male_warm">Masculina (calma)</SelectItem>
                  <SelectItem value="male_pro">Masculina (profissional)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duração máx. por áudio (s)</Label>
              <Input type="number" min={10} max={300} value={form.max_seconds} onChange={(e) => setForm({ ...form, max_seconds: Number(e.target.value) || 60 })} />
            </div>
          </div>

          <div>
            <Label>Mensagem de abertura (quando responde por voz)</Label>
            <Textarea value={form.opening_message ?? ""} onChange={(e) => setForm({ ...form, opening_message: e.target.value })} rows={2} />
          </div>

          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div>
                <Label>Transcrever áudios recebidos</Label>
                <p className="text-xs text-muted-foreground">Converte áudio do cliente em texto pro atendente ler.</p>
              </div>
              <Switch checked={form.transcribe_incoming} onCheckedChange={(v) => setForm({ ...form, transcribe_incoming: v })} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Responder por voz quando o cliente mandar áudio</Label>
                <p className="text-xs text-muted-foreground">Gera resposta em áudio em vez de texto.</p>
              </div>
              <Switch checked={form.reply_with_voice} onCheckedChange={(v) => setForm({ ...form, reply_with_voice: v })} />
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={() => save.mutate()} disabled={save.isPending}>
              <Save className="mr-2 h-4 w-4" /> {save.isPending ? "Salvando..." : "Salvar configuração"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
