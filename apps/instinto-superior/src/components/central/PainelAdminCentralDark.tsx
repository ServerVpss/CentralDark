import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

import { CofreAdministrativo, HubSeguranca } from "@/components/central/AdminCofreSeguranca";
import { ConexoesCentralDark } from "@/components/central/ConexoesCentralDark";
import { CatalogoCapacidadesMcp } from "@/components/central/CatalogoCapacidadesMcp";
import { ObservabilidadeCentralDark } from "@/components/central/ObservabilidadeCentralDark";
import { CentralNotificacoes } from "@/components/central/CentralNotificacoes";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { EstadoCentralDark } from "@/lib/cockpit.functions";
import { supabase } from "@/integrations/supabase/client";


/**
 * Inventário da casca legada apps/modulos/hub/src/HubPage.tsx (12 abas).
 * Fonte/owner medido ≠ feature transferida ≠ deploy provado.
 * Mantido no próprio admin existente para conduzir a absorção sem segunda UI.
 */
const SETORES_HUB_LEGADO = [
  { setor: "Dashboard", destino: "Visão geral / One Heart", cobertura: "PARCIAL_SOURCE", pendente: "Readback de saúde e cards originais" },
  { setor: "Hermes", destino: "Hermes do cockpit", cobertura: "PARCIAL_SOURCE", pendente: "Histórico e ações do HermesTab" },
  { setor: "Inventário", destino: "Módulos / Sistema CentralDark", cobertura: "PARCIAL_SOURCE", pendente: "Inventário completo e sync" },
  { setor: "Boot", destino: "Sistema / Boot canônico", cobertura: "GAP_SOURCE", pendente: "Boot Studio com edição e rollback" },
  { setor: "Gateway", destino: "Roteador / Runtime", cobertura: "PARCIAL_SOURCE", pendente: "API keys e telemetria Gateway" },
  { setor: "Catálogo", destino: "Admin → Catálogo MCP", cobertura: "PARCIAL_SOURCE", pendente: "Busca OpenAPI integrada; runtime/reload de MCP e ações autenticadas exigem readback" },
  { setor: "Políticas", destino: "Segurança / Permissões", cobertura: "PARCIAL_SOURCE", pendente: "CRUD de políticas sob autorização" },
  { setor: "Conectores", destino: "Contas / Conexões", cobertura: "PARCIAL_SOURCE", pendente: "OAuth, multi-conta e broker com health vivo" },
  { setor: "Abacus", destino: "Roteador / Modelos", cobertura: "PARCIAL_SOURCE", pendente: "Ações e observabilidade Abacus" },
  { setor: "Auditoria", destino: "Observabilidade", cobertura: "PARCIAL_SOURCE", pendente: "Filtros, trilhas e exportação" },
  { setor: "Missões", destino: "Hermes / Runtime Fabric", cobertura: "GAP_SOURCE", pendente: "Missões, eventos, causação e controle de execução" },
  { setor: "Autonomia", destino: "Sistema CentralDark", cobertura: "PARCIAL_SOURCE", pendente: "Ações autônomas e contraprova de runtime" },
] as const;

type StatusModulo = "ativo" | "em processo";

type ModuloPortal = {
  id: string;
  slug: string;
  nome: string;
  icone: string;
  href: string;
  status: StatusModulo;
  ordem: number;
};
type UsuarioLinha = {
  user_id: string;
  full_name: string | null;
  papel: string;
};

function mensagemErro(valor: unknown) {
  if (valor instanceof Error) return valor.message;
  if (valor && typeof valor === "object" && "message" in valor) {
    return String((valor as { message: unknown }).message);
  }
  return String(valor ?? "erro desconhecido");
}

// O tipo gerado da app ainda nao contem modules/profiles.
// Reusar o cliente existente; a leitura segue os nomes REAIS do Supabase.
// Escritas continuam indisponiveis ate existir rota admin autorizada.
const banco = supabase as unknown as {
  // Tipos ainda nao refletem modules/profiles; owner continua o mesmo client.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (tabela: string) => any;
};

type ModuloPortalLinha = {
  id: unknown;
  slug?: unknown;
  name?: unknown;
  icon?: unknown;
  url?: unknown;
  is_active?: unknown;
  display_order?: unknown;
};

type ProfileLinha = {
  id: unknown;
  full_name?: unknown;
};

export function PainelAdminCentralDark({ estado, abaInicial = "visao" }: { estado?: EstadoCentralDark | undefined; abaInicial?: "visao" | "notificacoes" }) {
  const [modulos, setModulos] = useState<ModuloPortal[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioLinha[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const [m, p, r] = await Promise.all([
        banco
          .from("modules")
          .select("id, slug, name, icon, url, is_active, display_order")
          .order("display_order", { ascending: true }),
        banco.from("profiles").select("id, full_name"),
        banco.from("user_roles").select("user_id, role"),
      ]);

      if (m.error) throw m.error;
      if (p.error) throw p.error;
      if (r.error) throw r.error;

      const papeis = new Map<string, string>();
      for (const item of r.data ?? []) papeis.set(item.user_id, item.role);

      setModulos(
        (m.data ?? []).map((item: ModuloPortalLinha) => ({
          id: String(item.id),
          slug: String(item.slug ?? ""),
          nome: String(item.name ?? ""),
          icone: String(item.icon ?? ""),
          href: String(item.url ?? "/"),
          status: item.is_active === true ? "ativo" : "em processo",
          ordem: Number(item.display_order ?? 0),
        })),
      );
      setUsuarios(
        (p.data ?? []).map((item: ProfileLinha) => ({
          user_id: String(item.id),
          full_name: item.full_name ? String(item.full_name) : null,
          papel: papeis.get(String(item.id)) ?? "user",
        })),
      );
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const resumo = useMemo(() => {
    const ativos = modulos.filter((m) => m.status === "ativo").length;
    const processo = modulos.filter((m) => m.status === "em processo").length;
    return { total: modulos.length, ativos, processo, usuarios: usuarios.length };
  }, [modulos, usuarios]);

  function atualizarModulo(id: string, patch: Partial<ModuloPortal>) {
    setModulos((atual) => atual.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function novoModulo() {
    const id = "novo-" + Date.now();
    setModulos((atual) => [
      ...atual,
      {
        id,
        slug: "",
        nome: "",
        icone: "package",
        href: "/",
        status: "em processo",
        ordem: atual.length + 1,
      },
    ]);
  }

  async function salvarModulo(modulo: ModuloPortal) {
    setSalvandoId(modulo.id);
    setMensagem(null);
    setErro(null);
    try {
      const payload = {
        slug: modulo.slug.trim(),
        nome: modulo.nome.trim(),
        icone: modulo.icone.trim(),
        href: modulo.href.trim() || "/",
        status: modulo.status,
        ordem: modulo.ordem,
      };
      const resultado = modulo.id.startsWith("novo-")
        ? await banco.from("modulos_portal").insert(payload)
        : await banco.from("modulos_portal").update(payload).eq("id", modulo.id);

      if (resultado.error) throw resultado.error;
      setMensagem(`Módulo "${payload.nome}" salvo.`);
      await carregar();
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setSalvandoId(null);
    }
  }

  async function removerModulo(modulo: ModuloPortal) {
    if (modulo.id.startsWith("novo-")) {
      setModulos((atual) => atual.filter((m) => m.id !== modulo.id));
      return;
    }
    if (!window.confirm(`Remover o módulo "${modulo.nome}"?`)) return;

    setErro(null);
    const { error } = await banco.from("modulos_portal").delete().eq("id", modulo.id);
    if (error) {
      setErro(mensagemErro(error));
      return;
    }
    setMensagem(`Módulo "${modulo.nome}" removido.`);
    await carregar();
  }

  const cards = [
    { label: "Módulos totais", valor: resumo.total, icon: Package },
    { label: "Módulos ativos", valor: resumo.ativos, icon: CheckCircle2 },
    { label: "Em processo", valor: resumo.processo, icon: Clock3 },
    { label: "Perfis visíveis", valor: resumo.usuarios, icon: Users },
  ];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-gold uppercase">
            Owner administrativo
          </p>
          <h2 className="mt-3 text-3xl font-semibold">Admin CentralDark</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Administração absorvida do TelePainel para a sala autenticada do Instinto Superior.
          </p>
        </div>
        <Button variant="outline" onClick={() => void carregar()} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Atualizar
        </Button>
      </div>
      {erro ? (
        <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {erro}
        </div>
      ) : null}
      {mensagem ? (
        <div className="mt-6 rounded-lg border border-neon-green/30 bg-neon-green/5 p-3 text-sm text-foreground">
          {mensagem}
        </div>
      ) : null}

      <Tabs key={abaInicial} defaultValue={abaInicial} className="mt-8">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="visao">Visão geral</TabsTrigger>
          <TabsTrigger value="modulos">Módulos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="conexoes">Contas / Conexões</TabsTrigger>
          <TabsTrigger value="catalogo">🧩 Catálogo MCP</TabsTrigger>
          <TabsTrigger value="hub-inventario">Integração HUB (12)</TabsTrigger>
          <TabsTrigger value="observabilidade">Observabilidade</TabsTrigger>
          <TabsTrigger value="notificacoes">🔔 Notificações</TabsTrigger>
          <TabsTrigger value="cofre">Cofre / Credenciais</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança / Permissões</TabsTrigger>
        </TabsList>

        <TabsContent value="visao" className="mt-6">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Medindo Supabase…
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {cards.map(({ label, valor, icon: Icon }) => (
                <article key={label} className="panel p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                      {label}
                    </span>
                    <Icon className="size-4 text-gold" />
                  </div>
                  <strong className="mt-3 block text-3xl">{valor}</strong>
                </article>
              ))}
            </div>
          )}
          <div className="panel mt-6 p-5">
            <h3 className="text-sm font-semibold">Owner único</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              As ações administrativas vivem aqui. O portal público continua só consumindo o
              catálogo permitido, sem reabrir as rotas administrativas removidas.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="modulos" className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">Catálogo de módulos</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Fonte viva: <code>modules</code>. Leitura disponível; escrita aguarda permissão administrativa no servidor.
              </p>
            </div>
            <Button onClick={novoModulo} disabled title="Escrita administrativa ainda não autorizada no Supabase">
              <Plus /> Novo módulo
            </Button>
          </div>

          <div className="mt-5 space-y-4">
            {modulos.map((modulo) => (
              <article key={modulo.id} className="panel p-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <Campo label="Nome">
                    <input
                      value={modulo.nome}
                      disabled
                      onChange={(e) => atualizarModulo(modulo.id, { nome: e.target.value })}
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                    />
                  </Campo>
                  <Campo label="Slug">
                    <input
                      value={modulo.slug}
                      disabled
                      onChange={(e) => atualizarModulo(modulo.id, { slug: e.target.value })}
                      className="h-10 rounded-md border border-border bg-background px-3 font-mono text-xs"
                    />
                  </Campo>
                  <Campo label="Link">
                    <input
                      value={modulo.href}
                      disabled
                      onChange={(e) => atualizarModulo(modulo.id, { href: e.target.value })}
                      className="h-10 rounded-md border border-border bg-background px-3 font-mono text-xs"
                    />
                  </Campo>
                  <Campo label="Ícone">
                    <input
                      value={modulo.icone}
                      disabled
                      onChange={(e) => atualizarModulo(modulo.id, { icone: e.target.value })}
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                    />
                  </Campo>
                  <Campo label="Status">
                    <select
                      value={modulo.status}
                      disabled
                      onChange={(e) =>
                        atualizarModulo(modulo.id, { status: e.target.value as StatusModulo })
                      }
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                    >
                      <option value="ativo">ativo</option>
                      <option value="em processo">em processo</option>
                    </select>
                  </Campo>
                  <Campo label="Ordem">
                    <input
                      type="number"
                      value={modulo.ordem}
                      disabled
                      onChange={(e) =>
                        atualizarModulo(modulo.id, { ordem: Number(e.target.value || 0) })
                      }
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                    />
                  </Campo>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => void removerModulo(modulo)}
                    disabled
                    title="Remoção bloqueada até existir rota admin autorizada"
                  >
                    <Trash2 /> Remover
                  </Button>
                  <Button
                    onClick={() => void salvarModulo(modulo)}
                    disabled
                    title="Gravação bloqueada até existir rota admin autorizada"
                  >
                    {salvandoId === modulo.id ? <Loader2 className="animate-spin" /> : <Save />}
                    Salvar
                  </Button>
                </div>
              </article>
            ))}
            {!loading && modulos.length === 0 ? (
              <div className="panel p-6 text-sm text-muted-foreground">
                Nenhum módulo retornado pela fonte viva.
              </div>
            ) : null}
          </div>
        </TabsContent>
        <TabsContent value="conexoes" className="mt-6">
          <ConexoesCentralDark />
        </TabsContent>
        <TabsContent value="catalogo" className="mt-6">
          <CatalogoCapacidadesMcp />
        </TabsContent>
        <TabsContent value="hub-inventario" className="mt-6">
          <div className="panel p-5">
            <h3 className="text-lg font-semibold">Absorção do HUB legado no Instinto Superior</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Inventário das 12 abas da antiga casca HUB. A cobertura abaixo é somente
              mapeamento do código-fonte, não certificação de funcionamento no runtime.
              APIs, OAuth, cofre, logs e histórico permanecem nos owners canônicos;
              excluir a casca exige contraprova funcional de cada setor.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {SETORES_HUB_LEGADO.map((setor) => (
                <article key={setor.setor} className="rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-semibold">{setor.setor}</h4>
                    <code className="text-xs text-gold">{setor.cobertura}</code>
                  </div>
                  <p className="mt-2 text-sm">Dentro do cockpit: {setor.destino}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Para fechar: {setor.pendente}
                  </p>
                </article>
              ))}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              MAPPED_SOURCE != RUNTIME_PASS · NO_SECOND_ADMIN=true ·
              DELETE_LEGACY_ONLY_AFTER_ALL_FEATURES_COUNTERPROVEN=true
            </p>
          </div>
        </TabsContent>
        <TabsContent value="observabilidade" className="mt-6">
          <ObservabilidadeCentralDark />
        </TabsContent>
        <TabsContent value="notificacoes" className="mt-6">
          <CentralNotificacoes modo="painel" />
        </TabsContent>
        <TabsContent value="cofre" className="mt-6">
          <CofreAdministrativo estado={estado} />
        </TabsContent>
        <TabsContent value="seguranca" className="mt-6">
          <HubSeguranca estado={estado} />
        </TabsContent>
        <TabsContent value="usuarios" className="mt-6">
          <div>
            <h3 className="text-xl font-semibold">Usuários e papéis</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Leitura combinada de <code>profiles</code> e <code>user_roles</code>.
            </p>
          </div>
          <AdministracaoUsuariosCentralDark usuariosLocais={usuarios} carregandoLocal={loading} />

          <div className="panel mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="border-b border-border bg-surface-2/60">
                <tr className="text-left font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Papel</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.user_id} className="border-b border-border/60 last:border-0">
                    <td className="px-4 py-3">{usuario.full_name ?? "—"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {usuario.user_id.slice(0, 8)}…
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 font-mono text-[10px]">
                        {usuario.papel === "admin" ? <ShieldCheck className="size-3" /> : null}
                        {usuario.papel}
                      </span>
                    </td>
                  </tr>
                ))}
                {!loading && usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                      Nenhum usuário retornado pela fonte viva.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
}

type UsuarioAdminSeguro = { id: string; email?: string | null; full_name?: string | null; role?: string; plan_name?: string | null };
type PapelEditavel = "user" | "admin";

function AdministracaoUsuariosCentralDark({ usuariosLocais, carregandoLocal }: {
  usuariosLocais: UsuarioLinha[];
  carregandoLocal: boolean;
}) {
  const [usuariosAdmin, definirUsuariosAdmin] = useState<UsuarioAdminSeguro[]>([]);
  const [status, definirStatus] = useState("CONSULTANDO_ADMIN_USERS");
  const [processando, definirProcessando] = useState(false);
  const [selecionado, definirSelecionado] = useState("");
  const [papel, definirPapel] = useState<PapelEditavel>("user");
  const [nome, definirNome] = useState("");
  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");
  const [planos, definirPlanos] = useState<string[] | null>(null);

  async function chamarAdmin(action: string, payload: Record<string, unknown> = {}) {
    const { data: sessao, error: erroSessao } = await supabase.auth.getSession();
    if (erroSessao || !sessao.session) throw new Error("AUTH_REQUIRED");
    const { data, error } = await supabase.functions.invoke("admin-users", { body: { action, ...payload } });
    if (error || data?.error) throw new Error(data?.error || error?.message || "ADMIN_USERS_UNAVAILABLE");
    return data;
  }

  const carregarAdmin = useCallback(async () => {
    try {
      const { data: sessao } = await supabase.auth.getSession();
      if (!sessao.session) { definirStatus("AUTH_REQUIRED"); return; }
      const { data, error } = await supabase.functions.invoke("admin-users", { body: { action: "list" } });
      if (error || data?.error || !Array.isArray(data?.users)) {
        throw new Error(data?.error || error?.message || "ADMIN_USERS_UNAVAILABLE");
      }
      definirUsuariosAdmin(data.users as UsuarioAdminSeguro[]);
      definirStatus("FONTE_ADMIN_AUTORIZADA");
    } catch (erro) { definirStatus("ADMIN_USERS_INDISPONIVEL: " + mensagemErro(erro)); }
  }, []);
  useEffect(() => { void carregarAdmin(); }, [carregarAdmin]);

  const fonteAdmin = status === "FONTE_ADMIN_AUTORIZADA";
  const usuarioSelecionado = usuariosAdmin.find(usuario => usuario.id === selecionado);
  const contaSelecionavel = usuarioSelecionado?.role === "admin" || usuarioSelecionado?.role === "user";
  const roleWriteReleased = false; // Gate: publicar e provar a Edge corrigida antes de habilitar esta acao.

  async function criarUsuario(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!fonteAdmin || senha.length < 12 || !email.includes("@")) {
      definirStatus("VALIDACAO_PENDENTE: e-mail e senha inicial de ao menos 12 caracteres");
      return;
    }
    if (!window.confirm("Criar um novo usuário COMUM no Supabase CentralDark?")) return;
    definirProcessando(true);
    try {
      await chamarAdmin("create", { email: email.trim(), password: senha, full_name: nome.trim(), role: "user" });
      definirEmail(""); definirNome("");
      definirStatus("USER_CREATED: aguarda readback do cadastro");
      await carregarAdmin();
    } catch (erro) { definirStatus("CREATE_FAILED: " + mensagemErro(erro)); }
    finally { definirSenha(""); definirProcessando(false); }
  }

  async function aplicarPapel() {
    if (!fonteAdmin || !roleWriteReleased || !usuarioSelecionado || !contaSelecionavel) return;
    if (!window.confirm("Alterar o papel desta conta para " + papel + "? O servidor validará a autorização.")) return;
    definirProcessando(true);
    try {
      await chamarAdmin("set_role", { user_id: usuarioSelecionado.id, role: papel });
      definirStatus("ROLE_UPDATED: aguardando readback");
      await carregarAdmin();
    } catch (erro) { definirStatus("ROLE_FAILED: " + mensagemErro(erro)); }
    finally { definirProcessando(false); }
  }

  async function enviarReset() {
    if (!fonteAdmin || !usuarioSelecionado?.email || !window.confirm("Solicitar redefinição de senha para esta conta?")) return;
    definirProcessando(true);
    try {
      await chamarAdmin("send_reset", { email: usuarioSelecionado.email });
      definirStatus("RESET_REQUESTED");
    } catch (erro) { definirStatus("RESET_FAILED: " + mensagemErro(erro)); }
    finally { definirProcessando(false); }
  }

  async function lerPlanos() {
    const { data, error } = await banco.from("plans").select("name, slug, is_active").order("display_order");
    if (error) { definirStatus("PLANS_READ_FAILED: " + mensagemErro(error)); return; }
    definirPlanos((data ?? []).map((plano: { name: string; slug: string; is_active: boolean }) =>
      plano.name + " (" + plano.slug + ") · " + (plano.is_active ? "ativo" : "inativo")));
  }

  return (
    <div className="panel mt-5 space-y-4 p-4" data-cd-owner="instinto.admin.users">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <strong className="text-sm">Gestão autenticada · Supabase existente</strong>
        <Button type="button" size="sm" variant="outline" onClick={() => void carregarAdmin()}
          disabled={processando || carregandoLocal}>Atualizar usuários</Button>
      </div>
      <p className="font-mono text-xs text-muted-foreground" role="status">
        {status} · {fonteAdmin ? usuariosAdmin.length + " contas lidas via Edge Admin" :
          usuariosLocais.length + " perfis da listagem local (não equivalente a Admin API)"}
      </p>
      <form className="grid gap-3 sm:grid-cols-4" onSubmit={evento => void criarUsuario(evento)}>
        <label className="text-xs">Nome
          <input className="mt-1 w-full rounded border border-border bg-background p-2" value={nome}
            onChange={evento => definirNome(evento.target.value)} autoComplete="name" maxLength={120} />
        </label>
        <label className="text-xs">E-mail
          <input type="email" required className="mt-1 w-full rounded border border-border bg-background p-2"
            value={email} onChange={evento => definirEmail(evento.target.value)} autoComplete="off" maxLength={254} />
        </label>
        <label className="text-xs">Senha inicial
          <input type="password" required minLength={12} autoComplete="new-password"
            className="mt-1 w-full rounded border border-border bg-background p-2"
            value={senha} onChange={evento => definirSenha(evento.target.value)} />
        </label>
        <Button type="submit" className="self-end" disabled={!fonteAdmin || processando}>
          <Plus className="size-4" /> Adicionar usuário comum
        </Button>
      </form>
      <div className="grid gap-3 sm:grid-cols-4">
        <label className="text-xs">Conta para editar
          <select aria-label="Selecionar conta" className="mt-1 w-full rounded border border-border bg-background p-2"
            value={selecionado} onChange={evento => {
              const id = evento.target.value;
              definirSelecionado(id);
              definirPapel(usuariosAdmin.find(u => u.id === id)?.role === "admin" ? "admin" : "user");
            }} disabled={!fonteAdmin}>
            <option value="">Selecionar...</option>
            {usuariosAdmin.map(usuario => <option key={usuario.id} value={usuario.id}>
              {usuario.full_name || usuario.email || usuario.id.slice(0, 8)} · {usuario.role || "UNKNOWN"}
            </option>)}
          </select>
        </label>
        <label className="text-xs">Papel autorizado
          <select className="mt-1 w-full rounded border border-border bg-background p-2"
            value={papel} disabled={!fonteAdmin || !contaSelecionavel || processando}
            onChange={evento => definirPapel(evento.target.value as PapelEditavel)}>
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
            <option value="moderator" disabled>Moderador · backend pendente</option>
            <option value="support" disabled>Suporte · RBAC pendente</option>
            <option value="agent" disabled>Agente · RBAC pendente</option>
          </select>
        </label>
        <Button type="button" className="self-end" variant="outline" disabled={!fonteAdmin || !roleWriteReleased || !contaSelecionavel || processando}
          onClick={() => void aplicarPapel()}><ShieldCheck className="size-4" /> Alterar papel</Button>
        <Button type="button" className="self-end" variant="outline" disabled={!fonteAdmin || !usuarioSelecionado?.email || processando}
          onClick={() => void enviarReset()}>Solicitar redefinição</Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          Conta selecionada: {usuarioSelecionado?.role ?? "nenhuma"} · plano: {usuarioSelecionado?.plan_name || "ASSOCIAÇÃO NÃO MEDIDA"}.
          Troca de papel aguarda backend seguro publicado; suporte/agente e concessões por plano exigem PDP/PEP e RLS comprovados.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={() => void lerPlanos()}>
          Ver catálogo de planos
        </Button>
      </div>
      {planos !== null ? <p className="text-xs text-muted-foreground">
        {planos.length ? planos.join(" · ") : "Nenhum plano retornado."}
      </p> : null}
      <p className="text-[11px] text-muted-foreground">
        Autoridade: Edge admin-users → JWT + has_role(admin). Histórico: audit_logs.
        A listagem simples abaixo permanece disponível se a Edge estiver indisponível.
        Ligar o botão não concede privilégios no cliente.
      </p>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
