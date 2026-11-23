import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Wallet } from "lucide-react";
import { SeloEstado } from "@/components/central/EstadoCentralDark";
import { supabase } from "@/integrations/supabase/client";
import { lerConsumoPrivado } from "@/lib/admin.functions";

// Painel privado: só renderizado na sala de admin; valores ausentes aparecem como UNKNOWN.
export function PainelConsumo() {
  const ler = useServerFn(lerConsumoPrivado);
  const q = useQuery({
    queryKey: ["admin", "consumo"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (error || !token) throw new Error("Sessão Supabase ausente ou expirada.");
      return ler({ headers: { Authorization: `Bearer ${token}` } });
    },
    retry: false,
  });
  const d = q.data;
  return (
    <section className="panel-gold p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Wallet className="size-6 text-gold" />
          <h2 className="text-2xl font-semibold">Saldo e consumo</h2>
        </div>
        <SeloEstado estado={q.isError ? "UNKNOWN" : (d?.estado ?? "RUNNING")} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        {q.isError
          ? "Autorização ou fonte privada não pôde ser medida."
          : (d?.motivo ?? "Medindo…")}
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {(d?.itens ?? []).map((item) => (
          <div key={item.nome} className="rounded-lg border border-border bg-surface/60 p-4">
            <dt className="text-xs text-muted-foreground">{item.nome}</dt>
            <dd className="mt-2 font-mono text-2xl text-foreground">{item.valor ?? "UNKNOWN"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 font-mono text-[10px] text-muted-foreground">
        Fonte: nenhuma · Medido em: {d?.medidoEm ?? "UNKNOWN"}
      </p>
    </section>
  );
}
