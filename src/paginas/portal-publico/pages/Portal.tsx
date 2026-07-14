import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LogOut, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { useAuthContext } from "@/compartilhado/auth/AuthProvider";
import { useIsAdmin } from "@/compartilhado/comportamentos/useIsAdmin";
import { useModulosPortal } from "@/paginas/centraldark-admin/hooks/useModulosPortal";
import { resolverIcone } from "@/paginas/centraldark-admin/lib/icones-modulos";

export default function Portal() {
  const { signOut, user } = useAuthContext();
  const navigate = useNavigate();
  const { modulos, loading } = useModulosPortal();
  const { isAdmin } = useIsAdmin();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <Helmet>
        <title>CentralDark — Portal</title>
        <meta name="description" content="Portal CentralDark — escolha o módulo." />
      </Helmet>

      {/* Halo verde sutil no topo */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px]"
        style={{ background: "radial-gradient(ellipse at top, hsl(var(--primary) / 0.10), transparent 60%)" }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-grid opacity-[0.15]" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 glass-subtle">
        <div className="mx-auto flex h-14 max-w-md items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
            <span className="grid h-7 w-7 place-items-center rounded-lg icon-glow">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            CentralDark
          </Link>
          <button
            onClick={handleSignOut}
            aria-label="Sair"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card text-foreground shadow-3d-soft active:translate-y-[1px]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="relative mx-auto max-w-md px-5 pb-10 pt-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-3 py-1 font-mono text-[11px] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            portal · escolha um módulo
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Sua central de <span className="text-gradient-gold">módulos</span>
          </h1>
          {user?.email && (
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">{user.email}</p>
          )}
        </div>

        {/* Grid 2 colunas estilo app */}
        <div className="mt-7 grid grid-cols-2 gap-4">
          {loading && modulos.length === 0 ? (
            <div className="col-span-2 flex justify-center py-10 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            modulos.map((m) => {
              const ativo = m.status === "ativo";
              const Card = (
                <div
                  className={
                    "relative aspect-square rounded-2xl border bg-card p-3 transition-all active:translate-y-[1px] " +
                    (ativo
                      ? "border-primary/40 shadow-3d-primary hover:border-primary/60"
                      : "border-border shadow-3d-soft opacity-90")
                  }
                >
                  {!ativo && (
                    <span className="absolute right-2 top-2 rounded-full border border-border bg-background/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-muted-foreground">
                      em processo
                    </span>
                  )}
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <img
                      src={resolverIcone(m.icone)}
                      alt={m.nome}
                      loading="lazy"
                      width={512}
                      height={512}
                      className="h-[58%] w-[58%] object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
                    />
                    <span className="text-center text-[13px] font-medium leading-tight text-foreground">
                      {m.nome}
                    </span>
                  </div>
                </div>
              );

              return (
                <Link key={m.id} to={m.href} className={ativo ? "block" : "block cursor-default"}>
                  {Card}
                </Link>
              );
            })
          )}
        </div>

        {isAdmin && (
          <Link
            to="/centraldark/admin"
            className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/40 bg-primary/[0.06] p-4 shadow-3d-primary transition-all hover:border-primary/60 active:translate-y-[1px]"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-primary/40 bg-background icon-glow">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </span>
            <span className="flex-1">
              <span className="block text-[13px] font-semibold text-foreground">
                Admin CentralDark
              </span>
              <span className="block font-mono text-[10px] text-muted-foreground">
                gerenciar módulos, usuários e ecossistema
              </span>
            </span>
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
              admin
            </span>
          </Link>
        )}

        <p className="mt-10 text-center font-mono text-[10px] text-muted-foreground">
          CentralDark · {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
}
