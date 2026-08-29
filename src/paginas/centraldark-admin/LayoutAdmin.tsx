// Shell do Admin CentralDark. Guardado por AdminRoute lá nas rotas.
import { Outlet, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ExternalLink } from "lucide-react";
import { SidebarAdmin } from "./componentes/SidebarAdmin";

export default function LayoutAdmin() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Admin · CentralDark</title>
        <meta name="description" content="Painel administrativo do ecossistema CentralDark." />
      </Helmet>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[420px]"
        style={{ background: "radial-gradient(ellipse at top, hsl(var(--primary) / 0.10), transparent 60%)" }}
      />
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-grid opacity-[0.10]" />

      <div className="relative flex min-h-screen">
        <SidebarAdmin />

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border/60 bg-background/70 px-5 backdrop-blur">
            <span className="font-mono text-[11px] text-muted-foreground">
              /centraldark/admin
            </span>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
            >
              ver portal <ExternalLink className="h-3 w-3" />
            </Link>
          </header>

          <main className="flex-1 p-5 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
