// Perfil 360 de um usuário do painel (admin only).
// 4 abas: Dados, Atividade (audit_logs), Permissões e Sessões.
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { fetchUserDetail } from "@/shared/hooks/useAdminUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import {
  ArrowLeft, Loader2, ShieldCheck, Eye, Mail, Calendar, Clock,
  Activity, KeyRound, User as UserIcon, Settings as SettingsIcon, Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { startViewAs } from "@/shared/lib/viewAsMode";
import { clearAdminCache } from "@/shared/hooks/useIsAdmin";

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

interface DetailData {
  user: any;
  profile: any;
  audit: any[];
}

export default function UsuarioPerfil() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchUserDetail(id)
      .then(setData)
      .catch((e) => { setErr((e as Error).message); toast.error("Falha: " + (e as Error).message); })
      .finally(() => setLoading(false));
  }, [id]);

  const enterMirror = () => {
    if (!data?.user) return;
    startViewAs({
      userId: data.user.id,
      email: data.user.email,
      name: data.profile?.full_name ?? null,
    });
    clearAdminCache();
    toast.success("Modo espelho ativado — recarregando…");
    setTimeout(() => { window.location.href = "/portal"; }, 400);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (err || !data) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
          <p className="text-destructive">{err ?? "Usuário não encontrado."}</p>
          <Button asChild variant="outline"><Link to="/usuarios-painel">Voltar</Link></Button>
        </div>
      </DashboardLayout>
    );
  }

  const u = data.user;
  const initials = (u.email ?? "?").slice(0, 2).toUpperCase();
  const banned = u.banned_until && new Date(u.banned_until) > new Date();
  const isAdmin = u.role === "admin";

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Topo */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/usuarios-painel")} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold flex-1">Perfil 360</h1>
          <Button onClick={enterMirror} className="rounded-xl shadow-3d-primary">
            <Eye className="h-4 w-4 mr-2" />
            Ver como este usuário
          </Button>
        </div>

        {/* Card de identidade */}
        <Card className="rounded-2xl shadow-3d-soft">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-5">
              <Avatar className="h-20 w-20 shadow-3d-soft">
                {data.profile?.avatar_url && <AvatarImage src={data.profile.avatar_url} />}
                <AvatarFallback className="text-lg bg-primary/15 text-primary">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold">
                    {data.profile?.full_name ?? u.user_metadata?.full_name ?? "Sem nome"}
                  </h2>
                  {isAdmin && (
                    <Badge className="bg-primary/15 text-primary border-primary/30 rounded-lg">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Admin
                    </Badge>
                  )}
                  {!isAdmin && <Badge variant="secondary" className="rounded-lg">Usuário</Badge>}
                  {banned && <Badge variant="destructive" className="rounded-lg">Bloqueado</Badge>}
                  {!u.email_confirmed_at && (
                    <Badge variant="outline" className="rounded-lg text-amber-600 border-amber-300">
                      E-mail pendente
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-mono">{u.email}</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Criado:</span>
                    <span>{fmt(u.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Último login:</span>
                    <span>{fmt(u.last_sign_in_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Confirmado:</span>
                    <span>{fmt(u.email_confirmed_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Abas */}
        <Tabs defaultValue="dados" className="space-y-4">
          <TabsList className="rounded-xl shadow-3d-soft">
            <TabsTrigger value="dados" className="rounded-lg"><UserIcon className="h-4 w-4 mr-2" />Dados</TabsTrigger>
            <TabsTrigger value="atividade" className="rounded-lg"><Activity className="h-4 w-4 mr-2" />Atividade</TabsTrigger>
            <TabsTrigger value="permissoes" className="rounded-lg"><KeyRound className="h-4 w-4 mr-2" />Permissões</TabsTrigger>
            <TabsTrigger value="sessoes" className="rounded-lg"><Smartphone className="h-4 w-4 mr-2" />Sessões</TabsTrigger>
          </TabsList>

          {/* Dados */}
          <TabsContent value="dados">
            <Card className="rounded-2xl shadow-3d-soft">
              <CardHeader><CardTitle className="text-base">Informações cadastrais</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="ID do usuário" value={<span className="font-mono text-xs">{u.id}</span>} />
                <Row label="E-mail" value={u.email ?? "—"} />
                <Row label="Telefone" value={u.phone ?? "—"} />
                <Row label="Nome completo" value={data.profile?.full_name ?? u.user_metadata?.full_name ?? "—"} />
                <Row label="Provedor" value={(u.identities ?? []).map((i: any) => i.provider).join(", ") || "email"} />
                <Row label="Bloqueado até" value={u.banned_until ? fmt(u.banned_until) : "Não"} />
                {data.profile && (
                  <>
                    <Row label="Perfil criado" value={fmt(data.profile.created_at)} />
                    <Row label="Perfil atualizado" value={fmt(data.profile.updated_at)} />
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-3d-soft mt-4">
              <CardHeader><CardTitle className="text-base">Metadados</CardTitle></CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted rounded-xl p-3 overflow-auto max-h-72">
{JSON.stringify({ user_metadata: u.user_metadata, app_metadata: u.app_metadata }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Atividade */}
          <TabsContent value="atividade">
            <Card className="rounded-2xl shadow-3d-soft">
              <CardHeader>
                <CardTitle className="text-base">Últimas 50 ações registradas</CardTitle>
              </CardHeader>
              <CardContent>
                {data.audit.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    Nenhum registro de auditoria envolvendo este usuário ainda.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {data.audit.map((a) => (
                      <li key={a.id} className="border rounded-xl p-3 shadow-3d-soft">
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-mono font-semibold">{a.action}</span>
                          <span className="text-xs text-muted-foreground">{fmt(a.created_at)}</span>
                        </div>
                        {a.entity_type && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {a.entity_type} · {a.entity_id ?? "—"}
                          </div>
                        )}
                        {a.details && (
                          <pre className="text-[11px] bg-muted rounded-lg p-2 mt-2 overflow-auto max-h-32">
{JSON.stringify(a.details, null, 2)}
                          </pre>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Permissões */}
          <TabsContent value="permissoes">
            <Card className="rounded-2xl shadow-3d-soft">
              <CardHeader><CardTitle className="text-base">Papel e acesso</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row
                  label="Papel atual"
                  value={isAdmin
                    ? <Badge className="bg-primary/15 text-primary border-primary/30">Admin</Badge>
                    : <Badge variant="secondary">Usuário</Badge>}
                />
                <Row label="E-mail confirmado" value={u.email_confirmed_at ? "Sim" : "Não"} />
                <Row label="Bloqueado" value={banned ? "Sim" : "Não"} />
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">
                    Para alterar papel, bloquear ou redefinir senha use o menu de ações na lista de usuários.
                  </p>
                  <Button variant="outline" asChild className="rounded-xl">
                    <Link to="/usuarios-painel"><SettingsIcon className="h-4 w-4 mr-2" />Voltar à lista</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sessões */}
          <TabsContent value="sessoes">
            <Card className="rounded-2xl shadow-3d-soft">
              <CardHeader><CardTitle className="text-base">Sessões ativas</CardTitle></CardHeader>
              <CardContent className="text-sm space-y-3">
                <Row label="Último acesso" value={fmt(u.last_sign_in_at)} />
                <p className="text-xs text-muted-foreground">
                  O provedor de autenticação não expõe sessões detalhadas via API.
                  Para revogar todas as sessões, bloqueie o acesso na lista — isso
                  invalida os tokens automaticamente.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 py-1.5 border-b last:border-0">
      <span className="text-muted-foreground sm:w-48 text-xs sm:text-sm">{label}</span>
      <span className="flex-1">{value}</span>
    </div>
  );
}
