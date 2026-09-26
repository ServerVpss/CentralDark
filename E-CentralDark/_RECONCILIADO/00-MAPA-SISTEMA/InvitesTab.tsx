import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listWorkspaceInvites,
  createWorkspaceInvite,
  revokeWorkspaceInvite,
  deleteWorkspaceInvite,
  type InviteRow,
} from "@/lib/workspace-invites.functions";
import { listAccessGroups } from "@/lib/access-groups.functions";
import { useCurrentWorkspace } from "@/hooks/use-workspace";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { friendlyError } from "@/lib/friendly-error";
import {
  Link2, Copy, Trash2, Ban, MessageSquare, Plus, Loader2, ExternalLink,
} from "lucide-react";
import { LoadingDots } from "@/components/ui/loading-dots";

function statusBadge(s: InviteRow["status"]) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Ativo", cls: "bg-emerald-500/15 text-emerald-600" },
    revoked: { label: "Revogado", cls: "bg-muted text-muted-foreground" },
    expired: { label: "Expirado", cls: "bg-orange-500/15 text-orange-600" },
    used: { label: "Usado", cls: "bg-blue-500/15 text-blue-600" },
  };
  const c = map[s] ?? map.active;
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${c.cls}`}>{c.label}</span>;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function InvitesTab() {
  const ws = useCurrentWorkspace().data;
  const isAdmin = ws?.role === "admin";
  const qc = useQueryClient();

  const listFn = useServerFn(listWorkspaceInvites);
  const revokeFn = useServerFn(revokeWorkspaceInvite);
  const deleteFn = useServerFn(deleteWorkspaceInvite);

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ["ws-invites", ws?.id],
    enabled: !!ws,
    queryFn: () => listFn(),
    refetchInterval: 30_000,
  });

  const [creating, setCreating] = useState(false);
  const [createdToken, setCreatedToken] = useState<{ token: string; prefix: string } | null>(null);

  const revokeMut = useMutation({
    mutationFn: (id: string) => revokeFn({ data: { invite_id: id } }),
    onSuccess: () => { toast.success("Convite revogado"); qc.invalidateQueries({ queryKey: ["ws-invites", ws?.id] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { invite_id: id } }),
    onSuccess: () => { toast.success("Convite excluído"); qc.invalidateQueries({ queryKey: ["ws-invites", ws?.id] }); },
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2"><Link2 className="h-5 w-5" /> Convites por link</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Gere links para o atendente criar a própria senha.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> Gerar convite
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Identificador</th>
              <th className="px-4 py-3 text-left font-medium">Grupo</th>
              <th className="px-4 py-3 text-left font-medium">Setores</th>
              <th className="px-4 py-3 text-left font-medium">Usos</th>
              <th className="px-4 py-3 text-left font-medium">Validade</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Criado por</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-6 py-10 text-center text-muted-foreground"><div className="flex justify-center py-2"><LoadingDots size="sm" label="Carregando" /></div></td></tr>
            ) : invites.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-10 text-center text-muted-foreground">Nenhum convite ainda. Gere um para convidar atendentes.</td></tr>
            ) : invites.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="px-4 py-3 font-mono text-xs">{i.token_prefix}…</td>
                <td className="px-4 py-3 text-muted-foreground">{i.access_group_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {i.sector_names.length === 0 && <span className="text-muted-foreground">—</span>}
                    {i.sector_names.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{i.used_count}/{i.max_uses}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(i.expires_at)}</td>
                <td className="px-4 py-3">{statusBadge(i.status)}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.invited_by_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {isAdmin && i.status === "active" && (
                      <Button variant="ghost" size="icon" title="Revogar" onClick={() => { if (confirm("Revogar este convite?")) revokeMut.mutate(i.id); }}>
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                    {isAdmin && (
                      <Button variant="ghost" size="icon" title="Excluir" onClick={() => { if (confirm("Excluir este convite permanentemente?")) deleteMut.mutate(i.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && (
        <CreateInviteDialog
          onClose={() => setCreating(false)}
          onCreated={(t) => { setCreatedToken(t); setCreating(false); qc.invalidateQueries({ queryKey: ["ws-invites", ws?.id] }); }}
        />
      )}
      {createdToken && <CreatedLinkDialog token={createdToken.token} prefix={createdToken.prefix} onClose={() => setCreatedToken(null)} />}
    </div>
  );
}

function CreateInviteDialog({ onClose, onCreated }: { onClose: () => void; onCreated: (t: { token: string; prefix: string }) => void }) {
  const ws = useCurrentWorkspace().data;
  const createFn = useServerFn(createWorkspaceInvite);
  const groupsFn = useServerFn(listAccessGroups);

  const { data: groups = [] } = useQuery({
    queryKey: ["access-groups", ws?.id], enabled: !!ws, queryFn: () => groupsFn(),
  });
  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors-list", ws?.id], enabled: !!ws,
    queryFn: async () => {
      const { data, error } = await supabase.from("sectors").select("id, name").eq("workspace_id", ws!.id).order("name");
      if (error) throw error;
      return data as { id: string; name: string }[];
    },
  });

  const [groupId, setGroupId] = useState<string>("none");
  const [sectorIds, setSectorIds] = useState<string[]>([]);
  const [validity, setValidity] = useState("168"); // 7 dias
  const [usesMode, setUsesMode] = useState<"single" | "multi">("single");
  const [maxUses, setMaxUses] = useState(5);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const mut = useMutation({
    mutationFn: () => createFn({
      data: {
        access_group_id: groupId === "none" ? null : groupId,
        sector_ids: sectorIds,
        validity_hours: parseInt(validity),
        max_uses: usesMode === "single" ? 1 : maxUses,
        email: email.trim() || null,
        phone: phone.trim() || null,
      },
    }),
    onSuccess: (res) => onCreated({ token: res.token, prefix: res.prefix }),
    onError: (e: Error) => toast.error(friendlyError(e)),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerar convite por link</DialogTitle>
          <DialogDescription>
            Crie um link único que o atendente abre pra criar a conta dele com e-mail e senha.
            Você define <strong>antes</strong> as permissões — quando ele entrar, já cai no sistema
            com tudo configurado.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border border-blue-500/30 bg-blue-500/5 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">Como funciona, passo a passo:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Você escolhe o grupo de acesso e os setores que o atendente vai ter.</li>
            <li>O sistema gera um link único (com validade e número de usos).</li>
            <li>Você manda o link pelo WhatsApp, e-mail ou do jeito que quiser.</li>
            <li>O atendente abre, cria a senha dele e já entra com as permissões certas.</li>
          </ol>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Grupo de acesso</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem grupo</SelectItem>
                {groups.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground mt-1">
              Define o que o atendente pode fazer (ver conversas, criar campanhas, etc.). Se deixar
              "Sem grupo", ele entra como atendente comum.
            </p>
          </div>
          <div>
            <Label>Setores</Label>
            <div className="border rounded-md p-2 max-h-32 overflow-y-auto space-y-1">
              {sectors.length === 0 && <p className="text-xs text-muted-foreground px-2 py-1">Nenhum setor cadastrado.</p>}
              {sectors.map((s) => (
                <label key={s.id} className="flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-accent cursor-pointer">
                  <Checkbox
                    checked={sectorIds.includes(s.id)}
                    onCheckedChange={(c) => setSectorIds(c ? [...sectorIds, s.id] : sectorIds.filter((x) => x !== s.id))}
                  />
                  {s.name}
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Marque quais setores ele vai atender (ex: Vendas, Suporte). Só vai ver conversas
              desses setores.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Validade</Label>
              <Select value={validity} onValueChange={setValidity}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 horas</SelectItem>
                  <SelectItem value="168">7 dias</SelectItem>
                  <SelectItem value="360">15 dias</SelectItem>
                  <SelectItem value="720">30 dias</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                Depois desse tempo o link para de funcionar sozinho.
              </p>
            </div>
            <div>
              <Label>Usos</Label>
              <Select value={usesMode} onValueChange={(v: any) => setUsesMode(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">1 uso</SelectItem>
                  <SelectItem value="multi">Múltiplos usos</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1">
                "1 uso" = só uma pessoa entra. "Múltiplos" = serve pra cadastrar uma equipe inteira
                com o mesmo link.
              </p>
            </div>
          </div>
          {usesMode === "multi" && (
            <div>
              <Label>Quantidade máxima</Label>
              <Input type="number" min={2} max={1000} value={maxUses} onChange={(e) => setMaxUses(Math.max(2, parseInt(e.target.value) || 2))} />
              <p className="text-[11px] text-muted-foreground mt-1">
                Quantas pessoas no máximo podem usar esse link pra criar conta.
              </p>
            </div>
          )}
          <div className="rounded-md border bg-muted/30 p-3 space-y-3">
            <p className="text-xs font-medium">Restringir quem pode usar <span className="text-muted-foreground font-normal">(opcional)</span></p>
            <div>
              <Label className="text-xs">E-mail esperado</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="atendente@empresa.com" />
            </div>
            <div>
              <Label className="text-xs">Telefone esperado</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Se preencher, fica registrado pra quem você espera mandar o link (auditoria). Se deixar
              em branco, qualquer pessoa que receber o link consegue usar — respeitando a validade e
              o número de usos.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreatedLinkDialog({ token, onClose }: { token: string; prefix: string; onClose: () => void }) {
  const url = `${window.location.origin}/convite/${token}`;
  const copy = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };
  const sendWa = () => {
    const txt = encodeURIComponent(`Olá! Você foi convidado para nossa equipe. Acesse: ${url}`);
    window.open(`https://wa.me/?text=${txt}`, "_blank");
  };
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convite criado com sucesso</DialogTitle>
          <DialogDescription className="text-orange-500">
            Copie agora — este link só aparece nesta tela.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-md border bg-muted/30 p-3 break-all font-mono text-xs">{url}</div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={copy} className="flex-1"><Copy className="mr-2 h-4 w-4" /> Copiar link</Button>
            <Button variant="outline" onClick={sendWa}><MessageSquare className="mr-2 h-4 w-4" /> WhatsApp</Button>
            <Button variant="outline" onClick={() => window.open(url, "_blank")}><ExternalLink className="mr-2 h-4 w-4" /> Abrir</Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
