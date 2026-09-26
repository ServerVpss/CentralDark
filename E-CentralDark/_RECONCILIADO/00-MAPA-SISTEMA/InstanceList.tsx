import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type Status = "Conectado" | "Desconectado";
type SubStatus = "Online" | "QR Code" | "Offline";

type Instance = {
  name: string;
  phone: string;
  status: Status;
  sub: SubStatus;
};

const instances: Instance[] = [
  { name: "Instância 01", phone: "+55 11 99999-0001", status: "Conectado", sub: "Online" },
  { name: "Instância 02", phone: "+55 11 99999-0002", status: "Conectado", sub: "Online" },
  { name: "Instância 03", phone: "+55 11 99999-0003", status: "Conectado", sub: "QR Code" },
  { name: "Instância 04", phone: "+55 11 99999-0004", status: "Desconectado", sub: "Offline" },
  { name: "Instância 05", phone: "+55 11 99999-0005", status: "Conectado", sub: "Online" },
];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const subDot: Record<SubStatus, string> = {
  Online: "bg-primary",
  "QR Code": "bg-primary",
  Offline: "bg-destructive",
};

const subText: Record<SubStatus, string> = {
  Online: "text-muted-foreground",
  "QR Code": "text-muted-foreground",
  Offline: "text-muted-foreground",
};

export function InstanceList() {
  return (
    <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-bold text-xs tracking-widest uppercase text-foreground">
          Status das Instâncias
        </h3>
        <button className="text-muted-foreground hover:text-primary transition">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="p-3 space-y-2">
        {instances.map((it) => (
          <button
            key={it.name}
            onClick={() => toast.info(it.name, { description: `${it.phone} • ${it.status} / ${it.sub}` })}
            className="w-full text-left flex items-center gap-3 p-2 rounded-lg border border-border/40 bg-background/30 hover:bg-background/50 hover:border-primary/30 transition"
          >
            {/* WhatsApp avatar */}
            <div className="w-9 h-9 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center shrink-0">
              <WhatsAppIcon className="w-5 h-5 text-primary" />
            </div>

            {/* Name + phone */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{it.name}</p>
              <p className="text-[10px] text-muted-foreground font-mono truncate">{it.phone}</p>
            </div>

            {/* Status column */}
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    it.status === "Conectado"
                      ? "bg-primary shadow-[0_0_6px_hsl(var(--primary))]"
                      : "bg-destructive",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-mono",
                    it.status === "Conectado" ? "text-primary" : "text-destructive",
                  )}
                >
                  {it.status}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full", subDot[it.sub])} />
                <span className={cn("text-[10px] font-mono", subText[it.sub])}>{it.sub}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-3 pb-3">
        <Link
          to="/instancias"
          className="block w-full text-center py-2.5 rounded-lg border border-border bg-background/30 text-muted-foreground text-[10px] font-mono tracking-widest uppercase hover:text-primary hover:border-primary/40 transition"
        >
          Ver Todas Instâncias
        </Link>
      </div>
    </div>
  );
}
