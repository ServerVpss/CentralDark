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
import { ObservabilidadeCentralDark } from "@/components/central/ObservabilidadeCentralDark";
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
  { setor: "Catálogo", destino: "Ferramentas / MCP", cobertura: "GAP_SOURCE", pendente: "Pesquisa, sync e catálogo operacional" },
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

// O Database gerado do Instinto ainda não contém profiles/modulos_portal.
// Acesso pontual mantém o owner Supabase existente sem duplicar cliente.
const banco = supabase as unknown as {
  // Database gerado ainda não conhece profiles/modulos_portal; owner continua o mesmo client.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: (tabela: string) => any;
};

type ModuloPortalLinha = {
  id: unknown;
  slug?: unknown;
  nome?: unknown;
  icone?: unknown;
  href?: unknown;
  status?: unknown;
  ordem?: unknown;
};

type ProfileLinha = {
  id: unknown;
  full_name?: unknown;
};

export function PainelAdminCentralDark({ estado }: { estado?: EstadoCentralDark | undefined }) {
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
          .from("modulos_portal")
          .select("id, slug, nome, icone, href, status, ordem")
          .order("ordem", { ascending: true }),
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
          nome: String(item.nome ?? ""),
          icone: String(item.icone ?? ""),
          href: String(item.href ?? "/"),
          status: item.status === "ativo" ? "ativo" : "em processo",
          ordem: Number(item.ordem ?? 0),
        })),
      );
      setUsuarios(
        (p.data ?? []).map((item: ProfileLinha) => ({
          user_id: String(item.id),
          full_name: item.full_name ? String(item.full_name) : null,
          papel: papeis.get(String(item.user_id)) ?? "user",
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
    { label: "Usuários", valor: resumo.usuarios, icon: Users },
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

      <Tabs defaultValue="visao" className="mt-8">
        <TabsList className="h-auto flex-wrap justify-start">
          <TabsTrigger value="visao">Visão geral</TabsTrigger>
          <TabsTrigger value="modulos">Módulos</TabsTrigger>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="conexoes">Contas / Conexões</TabsTrigger>
          <TabsTrigger value="hub-inventario">Integração HUB (12)</TabsTrigger>
          <TabsTrigger value="observabilidade">Observabilidade</TabsTrigger>
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
                Fonte viva: tabela <code>modulos_portal</code>.
              </p>
            </div>
            <Button onClick={novoModulo}>
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
                      onChange={(e) => atualizarModulo(modulo.id, { nome: e.target.value })}
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                    />
                  </Campo>
                  <Campo label="Slug">
                    <input
                      value={modulo.slug}
                      onChange={(e) => atualizarModulo(modulo.id, { slug: e.target.value })}
                      className="h-10 rounded-md border border-border bg-background px-3 font-mono text-xs"
                    />
                  </Campo>
                  <Campo label="Link">
                    <input
                      value={modulo.href}
                      onChange={(e) => atualizarModulo(modulo.id, { href: e.target.value })}
                      className="h-10 rounded-md border border-border bg-background px-3 font-mono text-xs"
                    />
                  </Campo>
                  <Campo label="Ícone">
                    <input
                      value={modulo.icone}
                      onChange={(e) => atualizarModulo(modulo.id, { icone: e.target.value })}
                      className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                    />
                  </Campo>
                  <Campo label="Status">
                    <select
                      value={modulo.status}
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
                    disabled={salvandoId === modulo.id}
                  >
                    <Trash2 /> Remover
                  </Button>
                  <Button
                    onClick={() => void salvarModulo(modulo)}
                    disabled={salvandoId === modulo.id}
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
