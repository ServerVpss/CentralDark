
import { Construction } from "lucide-react";

export default function Placeholder({ title, subtitle }: { title: string; subtitle?: string }) {
      
  return (
    <div className="flex-1 overflow-auto p-3 md:p-6">
          <div className="bg-card/40 border border-border rounded-xl backdrop-blur-sm p-6 md:p-12 flex flex-col items-center justify-center text-center min-h-[60vh]">
            <Construction className="w-12 h-12 text-primary mb-4" />
            <h1 className="font-display text-2xl font-bold text-foreground mb-2 tracking-wide">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground font-mono max-w-md">
              {subtitle ?? "Módulo em construção. Em breve disponível no console."}
            </p>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-mono text-primary uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Status: Aguardando deploy
            </div>
          </div>
        </div>
      );
}
