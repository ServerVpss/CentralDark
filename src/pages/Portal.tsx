import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { LogOut } from "lucide-react";
import { useAuthContext } from "@/components/auth/AuthProvider";
import iconWhatsapp from "@/assets/icon-whatsapp.png";
import iconCrm from "@/assets/icon-crm.png";
import iconTelegram from "@/assets/icon-telegram.png";
import iconFinanceiro from "@/assets/icon-financeiro.png";

type Module = {
  id: string;
  name: string;
  icon: string;
  href: string;
  status: "ativo" | "em breve";
};

const modules: Module[] = [
  { id: "whatsapp", name: "Bot WhatsApp", icon: iconWhatsapp, href: "/whatsapp", status: "em breve" },
  { id: "crm", name: "CRM", icon: iconCrm, href: "/crm", status: "em breve" },
  { id: "telegram", name: "TelePainel", icon: iconTelegram, href: "/dashboard", status: "ativo" },
  { id: "financeiro", name: "Financeiro", icon: iconFinanceiro, href: "/financeiro", status: "em breve" },
];

export default function Portal() {
  const { signOut, user } = useAuthContext();

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <Helmet>
        <title>CentralDark — Portal</title>
        <meta name="description" content="Portal CentralDark — escolha o módulo." />
      </Helmet>

      {/* Header minimalista */}
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <div className="w-9" />
        <h1 className="font-mono text-[15px] font-semibold tracking-[0.2em] text-white">
          PORTAL
        </h1>
        <button
          onClick={signOut}
          aria-label="Sair"
          className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-500/40 bg-emerald-500/[0.05] text-emerald-400 active:translate-y-[1px]"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {user?.email && (
        <p className="px-5 pb-4 text-center font-mono text-[10px] text-white/40">
          {user.email}
        </p>
      )}

      {/* Grid 2 colunas */}
      <main className="mx-auto max-w-md px-5 pb-10 pt-2">
        <div className="grid grid-cols-2 gap-4">
          {modules.map((m) => {
            const ativo = m.status === "ativo";
            const Card = (
              <div
                className={
                  "relative aspect-square rounded-2xl border-2 bg-black/60 p-3 transition-all active:translate-y-[1px] " +
                  (ativo
                    ? "border-emerald-500 shadow-[0_0_18px_-2px_rgba(34,197,94,0.55),inset_0_0_18px_-8px_rgba(34,197,94,0.4)] hover:shadow-[0_0_28px_-2px_rgba(34,197,94,0.75)]"
                    : "border-emerald-500/40 opacity-80")
                }
              >
                {!ativo && (
                  <span className="absolute right-2 top-2 rounded-full border border-emerald-500/40 bg-black/70 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-emerald-400/80">
                    em breve
                  </span>
                )}
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <img
                    src={m.icon}
                    alt={m.name}
                    loading="lazy"
                    width={512}
                    height={512}
                    className="h-[58%] w-[58%] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                  />
                  <span className="text-center text-[13px] font-medium leading-tight text-white">
                    {m.name}
                  </span>
                </div>
              </div>
            );

            return ativo ? (
              <Link key={m.id} to={m.href} className="block">
                {Card}
              </Link>
            ) : (
              <div key={m.id}>{Card}</div>
            );
          })}
        </div>

        <p className="mt-8 text-center font-mono text-[10px] text-white/30">
          CentralDark · {new Date().getFullYear()}
        </p>
      </main>
    </div>
  );
}
