import { useAdminClient } from "@/layouts/AdminLayout";
import { Crown, Eye, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export function AdminWrapper({ children, title }: { children: React.ReactNode; title: string }) {
  const { selectedClient, clients } = useAdminClient();
  const clientName = clients.find(c => c.id === selectedClient)?.name || "Todos os Clientes";
  const isAll = selectedClient === "all";

  return (
    <div className="flex-1 overflow-auto">
      {/* Admin banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 md:mx-8 mt-4 mb-0 bg-warning/5 border border-warning/20 rounded-xl px-4 py-2.5 flex items-center gap-3"
      >
        <Crown className="w-4 h-4 text-warning shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-warning">Modo Admin</span>
            <span className="text-[10px] font-mono text-muted-foreground">·</span>
            <span className="text-[10px] font-mono text-muted-foreground">{title}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-background/50 border border-warning/20 rounded-lg px-2.5 py-1">
          <Eye className="w-3 h-3 text-warning" />
          <span className="text-[10px] font-mono font-bold text-warning truncate max-w-[150px]">
            {isAll ? "Todos" : clientName}
          </span>
        </div>
      </motion.div>
      {children}
    </div>
  );
}
