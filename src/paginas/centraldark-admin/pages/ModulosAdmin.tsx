// CRUD dos módulos do Portal. Edita nome, status, link, ícone, ordem.
import { useState } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useModulosPortal, type ModuloPortal } from "../hooks/useModulosPortal";
import { OPCOES_ICONE, resolverIcone } from "../lib/icones-modulos";

export default function ModulosAdmin() {
  const { modulos, loading, erro, recarregar } = useModulosPortal();
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [novo, setNovo] = useState(false);

  async function salvar(m: ModuloPortal) {
    setSalvandoId(m.id);
    const payload = {
      slug: m.slug,
      nome: m.nome,
      icone: m.icone,
      href: m.href,
      status: m.status,
      ordem: m.ordem,
    };
    const ehNovo = m.id.startsWith("fb-") || m.id.startsWith("novo-");
    const { error } = ehNovo
      ? await supabase.from("modulos_portal").insert(payload)
      : await supabase.from("modulos_portal").update(payload).eq("id", m.id);

    setSalvandoId(null);
    if (error) {
      toast.error("Não deu pra salvar: " + error.message);
      return;
    }
    toast.success(`Módulo "${m.nome}" salvo.`);
    setNovo(false);
    recarregar();
  }

  async function remover(m: ModuloPortal) {
    if (!confirm(`Remover o módulo "${m.nome}"?`)) return;
    const { error } = await supabase.from("modulos_portal").delete().eq("id", m.id);
    if (error) {
      toast.error("Erro ao remover: " + error.message);
      return;
    }
    toast.success("Removido.");
    recarregar();
  }

  const linhas: ModuloPortal[] = novo
    ? [
        ...modulos,
        {
          id: "novo-" + Date.now(),
          slug: "",
          nome: "",
          icone: "telegram",
          href: "/",
          status: "em processo",
          ordem: modulos.length + 1,
        },
      ]
    : modulos;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Módulos do Portal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aqui você edita o que aparece na página <code className="text-foreground">/portal</code>.
          </p>
        </div>
        <button
          onClick={() => setNovo(true)}
          disabled={novo}
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/[0.08] px-3 py-1.5 font-mono text-[12px] text-primary shadow-3d-primary active:translate-y-[1px] disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" /> novo
        </button>
      </div>

      {erro && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {erro}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> carregando…
        </div>
      ) : (
        <div className="space-y-3">
          {linhas.map((m) => (
            <LinhaModulo
              key={m.id}
              modulo={m}
              salvando={salvandoId === m.id}
              onSalvar={salvar}
              onRemover={remover}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LinhaModulo({
  modulo,
  salvando,
  onSalvar,
  onRemover,
}: {
  modulo: ModuloPortal;
  salvando: boolean;
  onSalvar: (m: ModuloPortal) => void;
  onRemover: (m: ModuloPortal) => void;
}) {
  const [m, setM] = useState<ModuloPortal>(modulo);
  const ehTemp = m.id.startsWith("fb-") || m.id.startsWith("novo-");

  return (
    <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-card p-4 shadow-3d-soft md:grid-cols-[64px_1fr_1fr_1fr_140px_80px_auto]">
      <div className="flex items-center justify-center">
        <img
          src={resolverIcone(m.icone)}
          alt={m.nome}
          className="h-12 w-12 rounded-lg object-contain"
        />
      </div>

      <Campo label="Nome">
        <input
          value={m.nome}
          onChange={(e) => setM({ ...m, nome: e.target.value })}
          className="h-9 rounded-lg border border-border bg-background px-2.5 font-mono text-[12px] text-foreground focus:border-primary focus:outline-none"
        />
      </Campo>

      <Campo label="Slug (chave)">
        <input
          value={m.slug}
          onChange={(e) => setM({ ...m, slug: e.target.value })}
          className="h-9 rounded-lg border border-border bg-background px-2.5 font-mono text-[12px] text-foreground focus:border-primary focus:outline-none"
        />
      </Campo>

      <Campo label="Link">
        <input
          value={m.href}
          onChange={(e) => setM({ ...m, href: e.target.value })}
          className="h-9 rounded-lg border border-border bg-background px-2.5 font-mono text-[12px] text-foreground focus:border-primary focus:outline-none"
        />
      </Campo>

      <Campo label="Ícone">
        <select
          value={m.icone}
          onChange={(e) => setM({ ...m, icone: e.target.value })}
          className="h-9 rounded-lg border border-border bg-background px-2.5 font-mono text-[12px] text-foreground focus:border-primary focus:outline-none"
        >
          {OPCOES_ICONE.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </Campo>

      <Campo label="Status">
        <select
          value={m.status}
          onChange={(e) => setM({ ...m, status: e.target.value as ModuloPortal["status"] })}
          className="h-9 rounded-lg border border-border bg-background px-2.5 font-mono text-[12px] text-foreground focus:border-primary focus:outline-none"
        >
          <option value="ativo">ativo</option>
          <option value="em processo">em processo</option>
        </select>
      </Campo>

      <div className="flex items-end gap-2">
        <button
          onClick={() => onSalvar(m)}
          disabled={salvando}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-primary/40 bg-primary/[0.08] px-3 font-mono text-[12px] text-primary active:translate-y-[1px] disabled:opacity-50"
        >
          {salvando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          salvar
        </button>
        {!ehTemp && (
          <button
            onClick={() => onRemover(m)}
            className="inline-flex h-9 items-center rounded-lg border border-border px-2 text-muted-foreground hover:border-destructive/50 hover:text-destructive"
            aria-label="Remover"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
