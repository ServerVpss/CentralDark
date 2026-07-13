import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Separator } from "@/shared/ui/separator";
import {
  Car,
  Hash,
  MapPin,
  Settings2,
  ShieldAlert,
  Fuel,
  Gauge,
  Calendar,
  Palette,
  Users,
  Weight,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/lib/utils";

interface VehicleResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  queryInput?: string;
}

// Recursively flatten an object to find values regardless of nesting
function flattenAll(obj: any, out: Record<string, any> = {}): Record<string, any> {
  if (!obj || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "object" && !Array.isArray(v)) {
      flattenAll(v, out);
    } else {
      const key = k.toLowerCase().replace(/[\s_-]/g, "");
      if (!(key in out)) out[key] = v;
    }
  }
  return out;
}

// Look up value by trying multiple key variants
function pick(flat: Record<string, any>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const norm = key.toLowerCase().replace(/[\s_-]/g, "");
    const val = flat[norm];
    if (val !== undefined && val !== null && val !== "" && val !== "NULL" && val !== "null") {
      return String(val);
    }
  }
  return undefined;
}

function isEmpty(v: string | undefined): boolean {
  if (!v) return true;
  const t = v.trim().toLowerCase();
  return !t || t === "null" || t === "0" || t === "-" || t === "—";
}

// Field row component
function Field({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  highlight?: boolean;
}) {
  if (isEmpty(value)) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      {Icon && (
        <div className="mt-0.5 shrink-0 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
        <p
          className={cn(
            "text-sm font-medium break-words",
            highlight ? "text-amber-400" : "text-foreground"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  variant = "default",
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "warning" | "success";
  children: React.ReactNode;
}) {
  const variantStyles = {
    default: "border-border/50 bg-card",
    warning: "border-amber-500/30 bg-amber-500/5",
    success: "border-emerald-500/30 bg-emerald-500/5",
  };
  const iconStyles = {
    default: "bg-primary/10 text-primary",
    warning: "bg-amber-500/10 text-amber-400",
    success: "bg-emerald-500/10 text-emerald-400",
  };
  return (
    <div className={cn("rounded-xl border p-4", variantStyles[variant])}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-wide">{title}</h3>
      </div>
      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function VehicleResultModal({ open, onOpenChange, data, queryInput }: VehicleResultModalProps) {
  const [copied, setCopied] = useState(false);

  const flat = useMemo(() => flattenAll(data?.data || data), [data]);

  const placa = pick(flat, "placa", "placanacional", "placa1");
  const placaMercosul = pick(flat, "placamercosul", "placa2");
  const marcaModelo = pick(flat, "marcamodelo", "modelo", "marca");
  const cor = pick(flat, "corveiculo", "cor");
  const ano = pick(flat, "anomodelo", "ano");
  const anoFab = pick(flat, "anofabricacao", "anofab");
  const tipo = pick(flat, "tipoveiculo", "tipo", "especieveiculo");
  const especie = pick(flat, "especieveiculo", "especie");
  const combustivel = pick(flat, "combustivel");
  const potencia = pick(flat, "potencia");
  const cilindradas = pick(flat, "cilindradas", "cilindrada");
  const passageiros = pick(flat, "capacidpassageiros", "capacidadepassageiros", "passageiros");
  const peso = pick(flat, "pesobruto", "peso");

  const chassi = pick(flat, "chassi");
  const renavam = pick(flat, "renavam");
  const motor = pick(flat, "motor", "numeromotor");
  const linha = pick(flat, "linha");
  const numeroDi = pick(flat, "numerodi", "numdi");
  const caixaCambio = pick(flat, "caixacambio", "cambio");

  const uf = pick(flat, "uf", "estado");
  const municipio = pick(flat, "municipio", "cidade");

  const situacaoVeiculo = pick(flat, "situacaoveiculo", "situacao");
  const situacaoChassi = pick(flat, "situacaochassi");

  // Restricoes can be array or string
  const restricoes: string[] = useMemo(() => {
    const raw = (data?.data?.restricoes ?? data?.restricoes ?? flat["restricoes"]) as any;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
    if (typeof raw === "string") {
      return raw.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
    }
    if (typeof raw === "object") return Object.values(raw).filter(Boolean).map(String);
    return [];
  }, [data, flat]);

  const hasRestricoes = restricoes.length > 0;

  const handleCopy = async () => {
    try {
      const text = JSON.stringify(data?.data || data, null, 2);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Dados copiados!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shrink-0">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 flex-wrap">
                  {marcaModelo || "Veículo"}
                  {placa && (
                    <Badge variant="outline" className="font-mono text-sm">
                      {placa}
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-2 flex-wrap">
                  {hasRestricoes ? (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {restricoes.length} Restrição(ões)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Sem Restrições
                    </Badge>
                  )}
                  {situacaoVeiculo && (
                    <span className="text-xs text-muted-foreground">
                      Situação: <span className="text-foreground font-medium">{situacaoVeiculo}</span>
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2 shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Restricoes (highlight first) */}
          {hasRestricoes && (
            <Section title="Restrições" icon={ShieldAlert} variant="warning">
              <div className="sm:col-span-2 space-y-1.5">
                {restricoes.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    <span className="text-sm text-amber-100 font-medium">{r}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Identificação */}
          <Section title="Identificação" icon={Hash}>
            <Field icon={Hash} label="Placa Nacional" value={placa} />
            <Field icon={Hash} label="Placa Mercosul" value={placaMercosul} />
            <Field icon={FileText} label="Chassi" value={chassi} />
            <Field icon={FileText} label="Renavam" value={renavam} />
            <Field icon={Settings2} label="Motor" value={motor} />
            <Field icon={Hash} label="Linha" value={linha} />
            {!isEmpty(caixaCambio) && <Field icon={Settings2} label="Caixa de Câmbio" value={caixaCambio} />}
            {!isEmpty(numeroDi) && <Field icon={Hash} label="Número DI" value={numeroDi} />}
          </Section>

          {/* Especificações */}
          <Section title="Especificações" icon={Settings2}>
            <Field icon={Car} label="Marca / Modelo" value={marcaModelo} />
            <Field icon={Palette} label="Cor" value={cor} />
            <Field icon={Calendar} label="Ano Modelo" value={ano} />
            <Field icon={Calendar} label="Ano Fabricação" value={anoFab} />
            <Field icon={Car} label="Tipo" value={tipo} />
            <Field icon={Car} label="Espécie" value={especie} />
            <Field icon={Fuel} label="Combustível" value={combustivel} />
            <Field icon={Gauge} label="Potência" value={potencia} />
            <Field icon={Gauge} label="Cilindradas" value={cilindradas} />
            <Field icon={Users} label="Passageiros" value={passageiros} />
            <Field icon={Weight} label="Peso Bruto" value={peso} />
          </Section>

          {/* Localização & Situação */}
          {(uf || municipio || situacaoVeiculo || situacaoChassi) && (
            <Section title="Localização e Situação" icon={MapPin}>
              <Field icon={MapPin} label="UF" value={uf} />
              <Field icon={Building2} label="Município" value={municipio} />
              <Field icon={CheckCircle2} label="Situação Veículo" value={situacaoVeiculo} />
              <Field icon={CheckCircle2} label="Situação Chassi" value={situacaoChassi} />
            </Section>
          )}

          {queryInput && (
            <>
              <Separator />
              <p className="text-xs text-muted-foreground text-center">
                Consulta realizada para: <span className="font-mono text-foreground">{queryInput}</span>
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
