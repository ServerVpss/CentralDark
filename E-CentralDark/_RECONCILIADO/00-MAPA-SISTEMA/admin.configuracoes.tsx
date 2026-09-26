import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Settings, Save, ExternalLink, KeyRound } from "lucide-react";
import { adminGetMasterSettings, adminUpdateMasterSettings } from "@/lib/master-settings.functions";
import { adminListConnectionsByWaba } from "@/lib/whatsapp.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import { SegredoPasswordCard } from "@/components/segredo-ia/SegredoPasswordCard";
import { LoadingDots } from "@/components/ui/loading-dots";

export const Route = createFileRoute("/admin/configuracoes")({ component: Page });

function Page() {
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetMasterSettings);
  const saveFn = useServerFn(adminUpdateMasterSettings);
  const listConnFn = useServerFn(adminListConnectionsByWaba);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-master-settings"],
    queryFn: () => getFn(),
  });

  const { data: connGroups } = useQuery({
    queryKey: ["admin-conn-groups"],
    queryFn: () => listConnFn(),
  });

  const [form, setForm] = useState({
    meta_app_id: "",
    meta_config_id: "",
    meta_app_secret: "",
    embedded_signup_enabled: false,
    manual_mode_enabled: true,
    public_signup_enabled: true,
    default_trial_days: 7,
    super_admin_phone_e164: "",
    super_admin_notify_connection_id: "",
    segredo_block_after_attempts: 3,
    segredo_block_minutes: 10,
  });

  useEffect(() => {
    if (data) {
      setForm({
        meta_app_id: data.meta_app_id ?? "",
        meta_config_id: data.meta_config_id ?? "",
        meta_app_secret: "",
        embedded_signup_enabled: !!data.embedded_signup_enabled,
        manual_mode_enabled: !!data.manual_mode_enabled,
        public_signup_enabled: data.public_signup_enabled === undefined ? true : !!data.public_signup_enabled,
        default_trial_days: data.default_trial_days ?? 7,
        super_admin_phone_e164: data.super_admin_phone_e164 ?? "",
        super_admin_notify_connection_id: data.super_admin_notify_connection_id ?? "",
        segredo_block_after_attempts: data.segredo_block_after_attempts ?? 3,
        segredo_block_minutes: data.segredo_block_minutes ?? 10,
      });
    }
  }, [data]);

  const saveM = useMutation({
    mutationFn: () => saveFn({ data: form }),
    onSuccess: () => {
      toast.success("Configurações salvas.");
      qc.invalidateQueries({ queryKey: ["admin-master-settings"] });
      setForm((f) => ({ ...f, meta_app_secret: "" }));
    },
    onError: (e: Error) => toast.error("Não consegui salvar", { description: friendlyError(e) }),
  });

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configurações Globais</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>App da Meta (Conexão WhatsApp em 1 clique)</CardTitle>
          <CardDescription>
            Para o cliente conectar o WhatsApp dele com o botão verde "Conectar meu WhatsApp", você
            precisa cadastrar o App ID e o Config ID do seu App Meta com Embedded Signup. Sem isso, só
            o modo manual fica disponível.{" "}
            <a
              href="https://developers.facebook.com/docs/whatsapp/embedded-signup"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 underline"
            >
              Como obter <ExternalLink className="h-3 w-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground"><LoadingDots size="sm" label="Carregando" /></p>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Meta App ID</Label>
                  <Input
                    value={form.meta_app_id}
                    onChange={(e) => setForm({ ...form, meta_app_id: e.target.value })}
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <Label>Embedded Signup Config ID</Label>
                  <Input
                    value={form.meta_config_id}
                    onChange={(e) => setForm({ ...form, meta_config_id: e.target.value })}
                    placeholder="abc123…"
                  />
                </div>
              </div>
              <div>
                <Label>Meta App Secret {data?.meta_app_secret_set && <span className="text-xs text-emerald-500">(já salvo)</span>}</Label>
                <Input
                  type="password"
                  value={form.meta_app_secret}
                  onChange={(e) => setForm({ ...form, meta_app_secret: e.target.value })}
                  placeholder={data?.meta_app_secret_set ? "deixe em branco para manter" : "cole o app secret"}
                />
                <p className="mt-1 text-xs text-muted-foreground">Guardado criptografado. Usado pra trocar o código do popup pela chave do WhatsApp.</p>
              </div>

              <div className="grid gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Botão "Conectar meu WhatsApp" (Embedded)</Label>
                    <p className="text-xs text-muted-foreground">Quando ligado e App ID + Config ID preenchidos, aparece para o cliente.</p>
                  </div>
                  <Switch
                    checked={form.embedded_signup_enabled}
                    onCheckedChange={(v) => setForm({ ...form, embedded_signup_enabled: v })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Modo manual (colar credenciais)</Label>
                    <p className="text-xs text-muted-foreground">Pra clientes técnicos que já têm WABA configurado.</p>
                  </div>
                  <Switch
                    checked={form.manual_mode_enabled}
                    onCheckedChange={(v) => setForm({ ...form, manual_mode_enabled: v })}
                  />
                </div>
              </div>

              <div className="grid gap-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Cadastro público de novas empresas</Label>
                    <p className="text-xs text-muted-foreground">
                      Quando ligado, qualquer pessoa pode criar uma empresa em /auth. Quando desligado,
                      só quem tem convite consegue entrar.
                    </p>
                  </div>
                  <Switch
                    checked={form.public_signup_enabled}
                    onCheckedChange={(v) => setForm({ ...form, public_signup_enabled: v })}
                  />
                </div>
              </div>

              <div>
                <Label>Trial padrão (dias)</Label>
                <Input
                  type="number"
                  min={0}
                  max={90}
                  className="max-w-[120px]"
                  value={form.default_trial_days}
                  onChange={(e) => setForm({ ...form, default_trial_days: Number(e.target.value) || 0 })}
                />
                <p className="mt-1 text-xs text-muted-foreground">Quantos dias de teste ao criar uma empresa nova (ainda não automático).</p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => saveM.mutate()} disabled={saveM.isPending}>
                  <Save className="mr-2 h-4 w-4" /> Salvar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <SegredoPasswordCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-500" /> Acesso remoto ao Modo Segredo
          </CardTitle>
          <CardDescription>
            Configure como o atalho global (Ctrl+K) e o WhatsApp podem ativar o Modo Segredo. Só o número
            cadastrado aqui pode disparar pelo Zap, e tentativas erradas geram alerta + bloqueio temporário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Seu WhatsApp (E.164, sem o +)</Label>
              <Input
                value={form.super_admin_phone_e164}
                onChange={(e) => setForm({ ...form, super_admin_phone_e164: e.target.value.replace(/\D/g, "") })}
                placeholder="5511999999999"
                inputMode="numeric"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Só este número pode mandar <code>ativar modo segredo</code> no chat do Zap.
              </p>
            </div>
            <div>
              <Label>Conexão WhatsApp para te avisar</Label>
              <Select
                value={form.super_admin_notify_connection_id || "__none__"}
                onValueChange={(v) => setForm({ ...form, super_admin_notify_connection_id: v === "__none__" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha uma conexão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Nenhuma (só toast/auditoria) —</SelectItem>
                  {(connGroups ?? []).flatMap((g) => g.numbers).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.display_phone_number ?? c.phone ?? c.name} {c.status !== "connected" ? `(${c.status})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Por onde o sistema te manda confirmação/alerta. Precisa estar dentro da janela de 24h do seu próprio número.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>Bloquear após (tentativas erradas)</Label>
              <Input
                type="number" min={1} max={10}
                value={form.segredo_block_after_attempts}
                onChange={(e) => setForm({ ...form, segredo_block_after_attempts: Number(e.target.value) || 3 })}
              />
            </div>
            <div>
              <Label>Tempo de bloqueio (minutos)</Label>
              <Input
                type="number" min={1} max={1440}
                value={form.segredo_block_minutes}
                onChange={(e) => setForm({ ...form, segredo_block_minutes: Number(e.target.value) || 10 })}
              />
            </div>
          </div>

          <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
            <p><strong>Como usar pelo Zap:</strong> mande para qualquer conexão sua a mensagem <code>ativar modo segredo: SUA_SENHA</code> a partir do número cadastrado acima.</p>
            <p><strong>Atalho global:</strong> em qualquer página, aperte <kbd className="rounded border bg-background px-1">Ctrl</kbd>+<kbd className="rounded border bg-background px-1">K</kbd>, digite <em>ativar modo segredo</em> e informe a senha.</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => saveM.mutate()} disabled={saveM.isPending}>
              <Save className="mr-2 h-4 w-4" /> Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
