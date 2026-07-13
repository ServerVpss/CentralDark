// Lista read-only de usuários + papéis. Edição fica pra fase seguinte.
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Linha = {
  user_id: string;
  full_name: string | null;
  papel: string;
};

export default function UsuariosAdmin() {
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: perfis, error: e1 }, { data: papeis, error: e2 }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (e1 || e2) {
        setErro((e1 ?? e2)?.message ?? "erro");
        setLoading(false);
        return;
      }
      const mapaPapel = new Map<string, string>();
      (papeis ?? []).forEach((r: any) => mapaPapel.set(r.user_id, r.role));
      setLinhas(
        (perfis ?? []).map((p: any) => ({
          user_id: p.user_id,
          full_name: p.full_name,
          papel: mapaPapel.get(p.user_id) ?? "user",
        })),
      );
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Usuários</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quem tem conta no ecossistema e qual o papel de cada um.
        </p>
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
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-3d-soft">
          <table className="w-full text-sm">
            <thead className="bg-background/50">
              <tr className="text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Papel</th>
              </tr>
            </thead>
            <tbody>
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground">
                    Nenhum usuário ainda.
                  </td>
                </tr>
              )}
              {linhas.map((l) => (
                <tr key={l.user_id} className="border-t border-border/60">
                  <td className="px-4 py-3">{l.full_name ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">
                    {l.user_id.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] " +
                        (l.papel === "admin"
                          ? "border-primary/40 bg-primary/[0.08] text-primary"
                          : "border-border text-muted-foreground")
                      }
                    >
                      {l.papel === "admin" ? <ShieldCheck className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                      {l.papel}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
