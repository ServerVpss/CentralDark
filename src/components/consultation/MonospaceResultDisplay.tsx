import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, AlertCircle, User, Download, Camera, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MonospaceResultDisplayProps {
  result: any;
  className?: string;
  showCopyButton?: boolean;
}

// API metadata fields to hide (provider internal data)
const ignoredKeys = new Set([
  "sucesso", "protocolo", "usuario", "consumo_hoje", "consumo", "total_diario",
  "reset_em", "tipo", "inicio_uso", "vencimento", "tempo_restante",
  "tempo_restante_detalhado", "dias_totais_restantes", "dias_totais",
  "ddd", "classificacao", "modulo", "success", "duration_ms", "module_disabled",
  "error", "notfound", "fromcache", "cache_ttl_hours",
  "foto", "image", "photo", "fotobase64", "base64",
  "conta", "saldo", "tempo_segundos", "temposegundos", "cache", "cached_at",
  "expiracao", "limites", "plano",
]);

// Also filter keys that end with "_consultada" (e.g. fotorj_consultada)
const ignoredSuffixes = ["_consultada"];

function shouldIgnoreKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[\s-]/g, "_");
  if (ignoredKeys.has(normalized)) return true;
  return ignoredSuffixes.some(suffix => normalized.endsWith(suffix));
}

// Extract photo from data recursively
function extractPhoto(data: any): string | null {
  if (!data) return null;
  const photoFields = ["foto", "image", "photo", "fotoBase64", "base64"];
  for (const field of photoFields) {
    if (data[field] && typeof data[field] === "string") {
      let photo = data[field];
      if (photo.startsWith("/9j/") || photo.startsWith("iVBOR")) {
        photo = `data:image/jpeg;base64,${photo}`;
      }
      return photo;
    }
  }
  if (data.data && typeof data.data === "object") return extractPhoto(data.data);
  if (data.dados && typeof data.dados === "object") return extractPhoto(data.dados);
  return null;
}

// Filter metadata and render raw data as formatted JSON-like text
function filterData(obj: any, depth = 0): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(item => filterData(item, depth + 1)).filter(v => v !== null);

  const filtered: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (shouldIgnoreKey(key)) continue;
    if (value === null || value === undefined) continue;
    // Skip base64 image values
    if (typeof value === "string" && (value.startsWith("/9j/") || value.startsWith("iVBOR") || value.startsWith("data:image"))) continue;
    const filteredValue = filterData(value, depth + 1);
    if (filteredValue !== null && filteredValue !== undefined) {
      filtered[key] = filteredValue;
    }
  }
  return Object.keys(filtered).length > 0 ? filtered : null;
}

// Render value recursively as monospace text lines
function renderValue(value: any, indent = 0): string[] {
  const prefix = "  ".repeat(indent);
  
  if (value === null || value === undefined) return [];
  
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }
  
  if (Array.isArray(value)) {
    const lines: string[] = [];
    value.forEach((item, idx) => {
      if (typeof item === "object" && item !== null) {
        lines.push(`${prefix}[${idx}]`);
        const nested = renderObject(item, indent + 1);
        lines.push(...nested);
      } else {
        lines.push(`${prefix}• ${String(item)}`);
      }
    });
    return lines;
  }
  
  return renderObject(value, indent);
}

function renderObject(obj: Record<string, any>, indent = 0): string[] {
  const prefix = "  ".repeat(indent);
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      lines.push(`${prefix}${key.toUpperCase()}:`);
      lines.push(...renderObject(value, indent + 1));
    } else if (Array.isArray(value)) {
      lines.push(`${prefix}${key.toUpperCase()}:`);
      lines.push(...renderValue(value, indent + 1));
    } else {
      lines.push(`${prefix}${key.toUpperCase()} => ${value === null || value === undefined ? "—" : String(value)}`);
    }
  }
  
  return lines;
}

export function MonospaceResultDisplay({
  result,
  className,
  showCopyButton = true,
}: MonospaceResultDisplayProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  if (!result) return null;

  // Check for errors
  const errorMessage =
    result.error ||
    result.data?.error ||
    (result.success === false && result.data?.error);

  if (errorMessage) {
    const errorStr = String(errorMessage);
    const is404 = errorStr.includes("404") || result.status === 404 || result.data?.notFound;
    const is500 = errorStr.includes("500") || result.status === 500;

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex flex-col gap-3 p-4 rounded-lg border font-mono",
          is404 ? "bg-amber-500/10 border-amber-500/30" : "bg-destructive/10 border-destructive/30",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className={cn("h-5 w-5 shrink-0", is404 ? "text-amber-500" : "text-destructive")} />
          <span className={cn("text-sm", is404 ? "text-amber-400" : "text-destructive")}>
            {is404 ? "🔍 Nenhum dado encontrado para esta consulta" : errorStr}
          </span>
        </div>
        {is500 && (
          <span className="text-muted-foreground text-xs">
            ⚠️ O servidor externo está temporariamente indisponível. Tente novamente em alguns minutos.
          </span>
        )}
      </motion.div>
    );
  }

  // Get the actual data payload
  const rawData = result.data || result;
  const photoUrl = extractPhoto(rawData);
  const filtered = filterData(rawData);

  if (!filtered && !photoUrl) {
    return (
      <div className={cn("text-muted-foreground text-center py-4 font-mono", className)}>
        Nenhum dado encontrado para exibir.
      </div>
    );
  }

  const textLines = filtered ? renderObject(filtered) : [];
  const fullText = textLines.join("\n");

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopiedAll(true);
      toast.success("Resultado copiado!");
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleDownloadPhoto = () => {
    if (!photoUrl) return;
    const link = document.createElement("a");
    link.href = photoUrl;
    link.download = `foto_resultado.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Foto baixada!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-3", className)}
    >
      {/* Photo */}
      {photoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-cyan-900/60 bg-[#0d1117] overflow-hidden"
        >
          <div className="px-3 py-2 border-b border-cyan-900/40 bg-[#161b22] flex items-center justify-between">
            <span className="font-mono text-sm text-cyan-300 font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              📷 FOTO
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadPhoto}
              className="h-6 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30"
            >
              <Download className="h-3 w-3 mr-1" />
              Baixar
            </Button>
          </div>
          <div className="p-4 flex justify-center">
            <img
              src={photoUrl}
              alt="Foto do resultado"
              className="max-w-[200px] max-h-[250px] rounded-lg border-2 border-cyan-900/50 shadow-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Raw Data */}
      {textLines.length > 0 && (
        <div className="rounded-lg border border-cyan-900/60 bg-[#0d1117] overflow-hidden">
          {showCopyButton && (
            <div className="px-3 py-2 border-b border-cyan-900/40 bg-[#161b22] flex items-center justify-between">
              <span className="font-mono text-sm text-cyan-300 font-medium">📋 RESULTADO</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAll}
                className="h-6 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/30"
              >
                {copiedAll ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                {copiedAll ? "Copiado!" : "Copiar"}
              </Button>
            </div>
          )}
          <pre className="p-3 font-mono text-[12px] leading-relaxed text-cyan-100 whitespace-pre-wrap overflow-x-auto">
            {fullText}
          </pre>
        </div>
      )}
    </motion.div>
  );
}
