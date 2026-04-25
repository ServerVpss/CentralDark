import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Car, Hash, MapPin, Settings2, ShieldAlert, Fuel, Gauge, Calendar,
  Palette, Users, Weight, Building2, CheckCircle2, AlertTriangle,
  Copy, Check, FileText, User, Phone, Mail, CreditCard, Heart,
  Briefcase, GraduationCap, Home, DollarSign, Scale, Vote,
  Camera, Fingerprint, IdCard, UserCheck, Cake, Globe,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UniversalResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any;
  queryType: string;
  queryInput?: string;
}

// ============= UTILS =============
function flattenAll(obj: any, out: Record<string, any> = {}, prefix = ""): Record<string, any> {
  if (!obj || typeof obj !== "object") return out;
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === "object" && !Array.isArray(v)) {
      flattenAll(v, out, prefix);
    } else {
      const key = k.toLowerCase().replace(/[\s_-]/g, "");
      if (!(key in out)) out[key] = v;
    }
  }
  return out;
}

function pick(flat: Record<string, any>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const norm = key.toLowerCase().replace(/[\s_-]/g, "");
    const val = flat[norm];
    if (val !== undefined && val !== null && val !== "" && String(val).toLowerCase() !== "null") {
      return String(val);
    }
  }
  return undefined;
}

function isEmpty(v: string | undefined): boolean {
  if (!v) return true;
  const t = v.trim().toLowerCase();
  return !t || t === "null" || t === "undefined" || t === "-" || t === "—";
}

function pickArray(data: any, ...paths: string[]): any[] {
  for (const path of paths) {
    const parts = path.split(".");
    let cur: any = data;
    for (const p of parts) {
      if (cur && typeof cur === "object") cur = cur[p];
      else { cur = null; break; }
    }
    if (Array.isArray(cur) && cur.length > 0) return cur;
  }
  return [];
}

// Format date BR
function formatDate(s?: string): string | undefined {
  if (!s) return undefined;
  // Try ISO date
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return s;
}

// Format a snake_case / camelCase key into Title Case label
function formatLabel(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Detect if a string is a base64 image / huge blob we should hide
function isBase64Image(v: any): boolean {
  if (typeof v !== "string") return false;
  if (v.startsWith("data:image/")) return true;
  if (v.startsWith("/9j/") || v.startsWith("iVBOR")) return true;
  if (v.length > 500 && /^[A-Za-z0-9+/=]+$/.test(v.substring(0, 200))) return true;
  return false;
}

// Keys that are technical metadata and should NEVER be shown
const HIDDEN_KEYS = new Set([
  "sucesso", "success", "protocolo", "usuario", "consumo_hoje", "consumo",
  "total_diario", "reset_em", "inicio_uso", "vencimento", "tempo_restante",
  "tempo_restante_detalhado", "dias_totais_restantes", "dias_totais",
  "modulo", "duration_ms", "module_disabled", "error", "notfound",
  "fromcache", "cache_ttl_hours", "foto", "image", "photo", "fotobase64",
  "base64", "conta", "saldo", "tempo_segundos", "temposegundos", "cache",
  "cached_at", "expiracao", "limites", "plano", "requests_used",
  "requests_remaining", "daily_limit", "fallback_provider", "apikey",
  "prioridade", "comando", "raw", "request_id", "channel", "status",
]);

function shouldHideKey(key: string): boolean {
  const k = key.toLowerCase();
  if (HIDDEN_KEYS.has(k)) return true;
  if (k.endsWith("_consultada") || k.endsWith("_consultado")) return true;
  return false;
}

// Render any value safely as string for display
function valueToString(v: any): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "boolean") return v ? "Sim" : "Não";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

// Recursively render ALL data — used as a "catch-all" so nothing is lost.
// Arrays of objects become subsections; primitive arrays become bullet lists.
function RawDataTree({ data, depth = 0 }: { data: any; depth?: number }) {
  if (data === null || data === undefined) return null;
  if (typeof data !== "object") {
    return <span className="text-sm">{valueToString(data)}</span>;
  }

  const entries = Object.entries(data).filter(([k, v]) => {
    if (shouldHideKey(k)) return false;
    if (v === null || v === undefined || v === "") return false;
    if (isBase64Image(v)) return false;
    return true;
  });

  if (entries.length === 0) return null;

  return (
    <div className={cn("space-y-2", depth > 0 && "pl-3 border-l border-border/40")}>
      {entries.map(([key, value]) => {
        const label = formatLabel(key);

        // Array
        if (Array.isArray(value)) {
          if (value.length === 0) return null;
          const allPrimitive = value.every((v) => typeof v !== "object" || v === null);
          return (
            <div key={key} className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                {label} <span className="text-muted-foreground/60">({value.length})</span>
              </p>
              {allPrimitive ? (
                <ul className="space-y-0.5 pl-3">
                  {value.map((v, i) => (
                    <li key={i} className="text-sm text-foreground">• {valueToString(v)}</li>
                  ))}
                </ul>
              ) : (
                <div className="space-y-2">
                  {value.map((item, i) => (
                    <div key={i} className="rounded-md bg-secondary/30 border border-border/40 p-2">
                      <p className="text-[10px] text-muted-foreground mb-1">[{i}]</p>
                      <RawDataTree data={item} depth={depth + 1} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        // Nested object
        if (typeof value === "object") {
          return (
            <div key={key} className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
              <RawDataTree data={value} depth={depth + 1} />
            </div>
          );
        }

        // Primitive
        return (
          <div key={key} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 py-1 border-b border-border/20 last:border-0">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium min-w-[140px]">
              {label}
            </span>
            <span className="text-sm text-foreground break-words flex-1">{valueToString(value)}</span>
          </div>
        );
      })}
    </div>
  );
}

// "Complete data" section — shows the entire structured payload so nothing is lost
function CompleteDataSection({ data }: { data: any }) {
  if (!data || typeof data !== "object") return null;
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-wide flex-1">Dados Completos</h3>
        <Badge variant="outline" className="text-xs">Completo</Badge>
      </div>
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <RawDataTree data={data} />
      </div>
    </div>
  );
}

// ============= CATEGORIZATION =============
type ResultCategory = "vehicle" | "person" | "company" | "phone" | "address" | "score" | "photo" | "generic";

function categorize(queryType: string): { cat: ResultCategory; label: string; gradient: string; icon: any } {
  const t = queryType.toLowerCase();
  if (/(placa|chassi|motor|renavam|veiculo)/.test(t))
    return { cat: "vehicle", label: "Veículo", gradient: "from-blue-500 to-cyan-500", icon: Car };
  if (/(cnpj|empresa)/.test(t))
    return { cat: "company", label: "Empresa", gradient: "from-amber-500 to-orange-500", icon: Building2 };
  if (/(telefone|tel|whatsapp|celular)/.test(t))
    return { cat: "phone", label: "Telefone", gradient: "from-green-500 to-emerald-500", icon: Phone };
  if (/(cep|endereco|address)/.test(t))
    return { cat: "address", label: "Endereço", gradient: "from-purple-500 to-violet-500", icon: Home };
  if (/(score|credilink|spc|poderaquisitivo|renda)/.test(t))
    return { cat: "score", label: "Score / Crédito", gradient: "from-indigo-500 to-blue-500", icon: DollarSign };
  if (/(foto|photo|nacional)/.test(t))
    return { cat: "photo", label: "Foto", gradient: "from-pink-500 to-rose-500", icon: Camera };
  if (/(cpf|nome|mae|rg|cnh|titulo|pis|sus|nacional|tse|siel|bnmp|processos|parentes)/.test(t))
    return { cat: "person", label: "Pessoa", gradient: "from-violet-500 to-purple-500", icon: User };
  return { cat: "generic", label: "Resultado", gradient: "from-slate-500 to-zinc-500", icon: FileText };
}

// ============= COMPONENTS =============
function Field({
  icon: Icon, label, value, highlight = false, mono = false,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  highlight?: boolean;
  mono?: boolean;
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
        <p className={cn(
          "text-sm font-medium break-words",
          mono && "font-mono",
          highlight ? "text-amber-400" : "text-foreground"
        )}>
          {value}
        </p>
      </div>
    </div>
  );
}

function Section({
  title, icon: Icon, variant = "default", children, count,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: "default" | "warning" | "success" | "info";
  children: React.ReactNode;
  count?: number;
}) {
  // Skip empty sections
  const hasContent = useMemo(() => {
    const arr = Array.isArray(children) ? children : [children];
    return arr.some((c) => c !== null && c !== undefined && c !== false);
  }, [children]);
  if (!hasContent) return null;

  const variantStyles = {
    default: "border-border/50 bg-card",
    warning: "border-amber-500/30 bg-amber-500/5",
    success: "border-emerald-500/30 bg-emerald-500/5",
    info: "border-blue-500/30 bg-blue-500/5",
  };
  const iconStyles = {
    default: "bg-primary/10 text-primary",
    warning: "bg-amber-500/10 text-amber-400",
    success: "bg-emerald-500/10 text-emerald-400",
    info: "bg-blue-500/10 text-blue-400",
  };
  return (
    <div className={cn("rounded-xl border p-4", variantStyles[variant])}>
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", iconStyles[variant])}>
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-wide flex-1">{title}</h3>
        {count !== undefined && (
          <Badge variant="outline" className="text-xs">{count}</Badge>
        )}
      </div>
      <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-secondary/40 border border-border/40 mb-1.5">
      {children}
    </div>
  );
}

// ============= RENDERERS =============
function VehicleView({ data }: { data: any }) {
  const flat = useMemo(() => flattenAll(data), [data]);
  const restricoesRaw = data?.restricoes ?? flat["restricoes"];
  const restricoes: string[] = Array.isArray(restricoesRaw)
    ? restricoesRaw.filter(Boolean).map(String)
    : typeof restricoesRaw === "string"
      ? restricoesRaw.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
      : [];

  return (
    <>
      {restricoes.length > 0 && (
        <Section title="Restrições" icon={ShieldAlert} variant="warning" count={restricoes.length}>
          <div className="sm:col-span-2 space-y-1.5">
            {restricoes.map((r, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-sm text-amber-100 font-medium">{r}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
      <Section title="Identificação" icon={Hash}>
        <Field icon={Hash} label="Placa Nacional" value={pick(flat, "placa", "placanacional", "placa1")} mono />
        <Field icon={Hash} label="Placa Mercosul" value={pick(flat, "placamercosul", "placa2")} mono />
        <Field icon={FileText} label="Chassi" value={pick(flat, "chassi")} mono />
        <Field icon={FileText} label="Renavam" value={pick(flat, "renavam")} mono />
        <Field icon={Settings2} label="Motor" value={pick(flat, "motor", "numeromotor")} mono />
        <Field icon={Hash} label="Linha" value={pick(flat, "linha")} />
      </Section>
      <Section title="Especificações" icon={Settings2}>
        <Field icon={Car} label="Marca / Modelo" value={pick(flat, "marcamodelo", "modelo", "marca")} />
        <Field icon={Palette} label="Cor" value={pick(flat, "corveiculo", "cor")} />
        <Field icon={Calendar} label="Ano Modelo" value={pick(flat, "anomodelo", "ano")} />
        <Field icon={Calendar} label="Ano Fabricação" value={pick(flat, "anofabricacao", "anofab")} />
        <Field icon={Car} label="Tipo" value={pick(flat, "tipoveiculo", "tipo")} />
        <Field icon={Car} label="Espécie" value={pick(flat, "especieveiculo", "especie")} />
        <Field icon={Fuel} label="Combustível" value={pick(flat, "combustivel")} />
        <Field icon={Gauge} label="Potência" value={pick(flat, "potencia")} />
        <Field icon={Gauge} label="Cilindradas" value={pick(flat, "cilindradas")} />
        <Field icon={Users} label="Passageiros" value={pick(flat, "capacidpassageiros", "passageiros")} />
        <Field icon={Weight} label="Peso Bruto" value={pick(flat, "pesobruto", "peso")} />
      </Section>
      <Section title="Localização e Situação" icon={MapPin}>
        <Field icon={MapPin} label="UF" value={pick(flat, "uf", "estado")} />
        <Field icon={Building2} label="Município" value={pick(flat, "municipio", "cidade")} />
        <Field icon={CheckCircle2} label="Situação Veículo" value={pick(flat, "situacaoveiculo", "situacao")} />
        <Field icon={CheckCircle2} label="Situação Chassi" value={pick(flat, "situacaochassi")} />
      </Section>
    </>
  );
}

function PersonView({ data }: { data: any }) {
  const flat = useMemo(() => flattenAll(data), [data]);
  const enderecos = pickArray(data, "enderecos", "data.enderecos", "addresses");
  const telefones = pickArray(data, "telefones", "data.telefones", "phones");
  const emails = pickArray(data, "emails", "data.emails");
  const parentes = pickArray(data, "parentes", "data.parentes", "familiares", "data.familiares");

  return (
    <>
      <Section title="Dados Pessoais" icon={User}>
        <Field icon={User} label="Nome" value={pick(flat, "nome", "nomecompleto", "name")} />
        <Field icon={Fingerprint} label="CPF" value={pick(flat, "cpf")} mono />
        <Field icon={IdCard} label="RG" value={pick(flat, "rg")} mono />
        <Field icon={Cake} label="Nascimento" value={formatDate(pick(flat, "nascimento", "datanascimento", "dtnascimento", "birthday"))} />
        <Field icon={UserCheck} label="Sexo" value={pick(flat, "sexo", "genero")} />
        <Field icon={Heart} label="Mãe" value={pick(flat, "mae", "nomemae")} />
        <Field icon={User} label="Pai" value={pick(flat, "pai", "nomepai")} />
        <Field icon={Globe} label="Nacionalidade" value={pick(flat, "nacionalidade")} />
        <Field icon={Heart} label="Estado Civil" value={pick(flat, "estadocivil")} />
        <Field icon={GraduationCap} label="Escolaridade" value={pick(flat, "escolaridade")} />
        <Field icon={Briefcase} label="Profissão" value={pick(flat, "profissao", "ocupacao")} />
        <Field icon={Vote} label="Título Eleitor" value={pick(flat, "titulo", "tituloeleitor")} mono />
        <Field icon={IdCard} label="CNH" value={pick(flat, "cnh")} mono />
        <Field icon={Heart} label="CNS / SUS" value={pick(flat, "cns", "cnssus")} mono />
        <Field icon={Briefcase} label="PIS" value={pick(flat, "pis", "nis")} mono />
      </Section>

      {telefones.length > 0 && (
        <Section title="Telefones" icon={Phone} variant="info" count={telefones.length}>
          <div className="sm:col-span-2">
            {telefones.slice(0, 30).map((t: any, i: number) => {
              const num = typeof t === "string" ? t : (t?.telefone || t?.numero || t?.phone || JSON.stringify(t));
              return (
                <ListItem key={i}>
                  <Phone className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span className="text-sm font-mono">{num}</span>
                  {typeof t === "object" && t?.operadora && (
                    <Badge variant="outline" className="ml-auto text-xs">{t.operadora}</Badge>
                  )}
                </ListItem>
              );
            })}
          </div>
        </Section>
      )}

      {emails.length > 0 && (
        <Section title="Emails" icon={Mail} count={emails.length}>
          <div className="sm:col-span-2">
            {emails.slice(0, 20).map((e: any, i: number) => {
              const em = typeof e === "string" ? e : (e?.email || JSON.stringify(e));
              return (
                <ListItem key={i}>
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <span className="text-sm break-all">{em}</span>
                </ListItem>
              );
            })}
          </div>
        </Section>
      )}

      {enderecos.length > 0 && (
        <Section title="Endereços" icon={Home} variant="info" count={enderecos.length}>
          <div className="sm:col-span-2">
            {enderecos.slice(0, 15).map((e: any, i: number) => {
              if (typeof e === "string") {
                return <ListItem key={i}><MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" /><span className="text-sm">{e}</span></ListItem>;
              }
              const logradouro = e?.logradouro || e?.endereco || e?.rua || "";
              const numero = e?.numero ? `, ${e.numero}` : "";
              const bairro = e?.bairro ? ` - ${e.bairro}` : "";
              const cidade = e?.cidade || e?.municipio || "";
              const uf = e?.uf || e?.estado || "";
              const cep = e?.cep ? ` (CEP ${e.cep})` : "";
              return (
                <ListItem key={i}>
                  <MapPin className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-sm flex-1 min-w-0">
                    <p className="font-medium">{logradouro}{numero}{bairro}</p>
                    <p className="text-xs text-muted-foreground">{cidade}{uf && ` - ${uf}`}{cep}</p>
                  </div>
                </ListItem>
              );
            })}
          </div>
        </Section>
      )}

      {parentes.length > 0 && (
        <Section title="Parentes / Vínculos" icon={Users} count={parentes.length}>
          <div className="sm:col-span-2">
            {parentes.slice(0, 20).map((p: any, i: number) => {
              const nome = typeof p === "string" ? p : (p?.nome || p?.name || JSON.stringify(p));
              const parentesco = typeof p === "object" ? (p?.parentesco || p?.vinculo || p?.tipo) : null;
              const cpf = typeof p === "object" ? p?.cpf : null;
              return (
                <ListItem key={i}>
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm flex-1 min-w-0">
                    <p className="font-medium">{nome}</p>
                    {(parentesco || cpf) && (
                      <p className="text-xs text-muted-foreground font-mono">
                        {parentesco}{parentesco && cpf && " • "}{cpf}
                      </p>
                    )}
                  </div>
                </ListItem>
              );
            })}
          </div>
        </Section>
      )}

      {/* Score / Renda inline */}
      {(pick(flat, "score", "scorebrl", "csb8", "csba") || pick(flat, "renda", "rendapresumida")) && (
        <Section title="Crédito e Renda" icon={DollarSign} variant="info">
          <Field icon={DollarSign} label="Score" value={pick(flat, "score", "scorebrl", "csb8", "csba")} highlight />
          <Field icon={DollarSign} label="Renda Presumida" value={pick(flat, "renda", "rendapresumida")} />
          <Field icon={DollarSign} label="Poder Aquisitivo" value={pick(flat, "poderaquisitivo")} />
        </Section>
      )}
    </>
  );
}

function CompanyView({ data }: { data: any }) {
  const flat = useMemo(() => flattenAll(data), [data]);
  const socios = pickArray(data, "socios", "data.socios", "qsa", "data.qsa");
  const cnaes = pickArray(data, "cnaes", "atividades", "data.atividades");

  return (
    <>
      <Section title="Dados Cadastrais" icon={Building2}>
        <Field icon={Hash} label="CNPJ" value={pick(flat, "cnpj")} mono />
        <Field icon={Building2} label="Razão Social" value={pick(flat, "razaosocial", "razao", "nome")} />
        <Field icon={Building2} label="Nome Fantasia" value={pick(flat, "nomefantasia", "fantasia")} />
        <Field icon={CheckCircle2} label="Situação" value={pick(flat, "situacao", "situacaocadastral")} />
        <Field icon={Calendar} label="Abertura" value={formatDate(pick(flat, "abertura", "dataabertura", "datafundacao"))} />
        <Field icon={DollarSign} label="Capital Social" value={pick(flat, "capitalsocial", "capital")} />
        <Field icon={Briefcase} label="Porte" value={pick(flat, "porte")} />
        <Field icon={Briefcase} label="Natureza Jurídica" value={pick(flat, "naturezajuridica", "natureza")} />
      </Section>
      <Section title="Contato e Endereço" icon={MapPin}>
        <Field icon={Mail} label="Email" value={pick(flat, "email")} />
        <Field icon={Phone} label="Telefone" value={pick(flat, "telefone", "fone")} />
        <Field icon={MapPin} label="Logradouro" value={pick(flat, "logradouro", "endereco")} />
        <Field icon={Hash} label="Número" value={pick(flat, "numero")} />
        <Field icon={Building2} label="Bairro" value={pick(flat, "bairro")} />
        <Field icon={Building2} label="Município" value={pick(flat, "municipio", "cidade")} />
        <Field icon={MapPin} label="UF" value={pick(flat, "uf", "estado")} />
        <Field icon={Hash} label="CEP" value={pick(flat, "cep")} mono />
      </Section>
      {socios.length > 0 && (
        <Section title="Sócios" icon={Users} count={socios.length}>
          <div className="sm:col-span-2">
            {socios.map((s: any, i: number) => {
              const nome = typeof s === "string" ? s : (s?.nome || s?.name);
              const cargo = typeof s === "object" ? (s?.qual || s?.cargo || s?.qualificacao) : null;
              const cpf = typeof s === "object" ? (s?.cpf || s?.cnpj_cpf_socio) : null;
              return (
                <ListItem key={i}>
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm flex-1 min-w-0">
                    <p className="font-medium">{nome}</p>
                    {(cargo || cpf) && (
                      <p className="text-xs text-muted-foreground">{cargo}{cargo && cpf && " • "}<span className="font-mono">{cpf}</span></p>
                    )}
                  </div>
                </ListItem>
              );
            })}
          </div>
        </Section>
      )}
      {cnaes.length > 0 && (
        <Section title="Atividades (CNAE)" icon={Briefcase} count={cnaes.length}>
          <div className="sm:col-span-2">
            {cnaes.slice(0, 15).map((c: any, i: number) => {
              const cod = typeof c === "object" ? (c?.code || c?.codigo) : null;
              const desc = typeof c === "string" ? c : (c?.text || c?.descricao || c?.description);
              return (
                <ListItem key={i}>
                  <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm flex-1 min-w-0">
                    {cod && <span className="font-mono text-xs text-primary mr-2">{cod}</span>}
                    <span>{desc}</span>
                  </div>
                </ListItem>
              );
            })}
          </div>
        </Section>
      )}
    </>
  );
}

function PhoneView({ data }: { data: any }) {
  const flat = useMemo(() => flattenAll(data), [data]);
  const owners = pickArray(data, "owners", "data.owners", "proprietarios", "results");
  return (
    <>
      <Section title="Dados do Telefone" icon={Phone}>
        <Field icon={Phone} label="Número" value={pick(flat, "telefone", "numero", "phone")} mono />
        <Field icon={Globe} label="Operadora" value={pick(flat, "operadora", "carrier")} />
        <Field icon={Phone} label="Tipo" value={pick(flat, "tipo", "type")} />
        <Field icon={MapPin} label="Estado" value={pick(flat, "uf", "estado")} />
        <Field icon={Building2} label="Cidade" value={pick(flat, "cidade", "municipio")} />
      </Section>
      {owners.length > 0 && (
        <Section title="Proprietários / Vínculos" icon={Users} count={owners.length}>
          <div className="sm:col-span-2">
            {owners.slice(0, 20).map((o: any, i: number) => {
              const nome = typeof o === "string" ? o : (o?.nome || o?.name);
              const cpf = typeof o === "object" ? o?.cpf : null;
              return (
                <ListItem key={i}>
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm flex-1 min-w-0">
                    <p className="font-medium">{nome}</p>
                    {cpf && <p className="text-xs text-muted-foreground font-mono">CPF: {cpf}</p>}
                  </div>
                </ListItem>
              );
            })}
          </div>
        </Section>
      )}
    </>
  );
}

function AddressView({ data }: { data: any }) {
  const flat = useMemo(() => flattenAll(data), [data]);
  const moradores = pickArray(data, "moradores", "data.moradores", "ocupantes");
  return (
    <>
      <Section title="Endereço" icon={Home}>
        <Field icon={Hash} label="CEP" value={pick(flat, "cep")} mono />
        <Field icon={MapPin} label="Logradouro" value={pick(flat, "logradouro", "rua", "endereco")} />
        <Field icon={Building2} label="Bairro" value={pick(flat, "bairro")} />
        <Field icon={Building2} label="Cidade" value={pick(flat, "cidade", "municipio", "localidade")} />
        <Field icon={MapPin} label="UF" value={pick(flat, "uf", "estado")} />
        <Field icon={Globe} label="DDD" value={pick(flat, "ddd")} />
        <Field icon={Hash} label="IBGE" value={pick(flat, "ibge")} mono />
      </Section>
      {moradores.length > 0 && (
        <Section title="Moradores" icon={Users} count={moradores.length}>
          <div className="sm:col-span-2">
            {moradores.slice(0, 20).map((m: any, i: number) => {
              const nome = typeof m === "string" ? m : (m?.nome || m?.name);
              const cpf = typeof m === "object" ? m?.cpf : null;
              return (
                <ListItem key={i}>
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-sm flex-1 min-w-0">
                    <p className="font-medium">{nome}</p>
                    {cpf && <p className="text-xs text-muted-foreground font-mono">CPF: {cpf}</p>}
                  </div>
                </ListItem>
              );
            })}
          </div>
        </Section>
      )}
    </>
  );
}

function ScoreView({ data }: { data: any }) {
  const flat = useMemo(() => flattenAll(data), [data]);
  return (
    <Section title="Score e Crédito" icon={DollarSign} variant="info">
      <Field icon={User} label="Nome" value={pick(flat, "nome", "nomecompleto")} />
      <Field icon={Fingerprint} label="CPF" value={pick(flat, "cpf")} mono />
      <Field icon={DollarSign} label="Score" value={pick(flat, "score", "scorebrl", "csb8")} highlight />
      <Field icon={DollarSign} label="Score CSB8" value={pick(flat, "csb8")} />
      <Field icon={DollarSign} label="Score CSBA" value={pick(flat, "csba")} />
      <Field icon={DollarSign} label="Renda Presumida" value={pick(flat, "renda", "rendapresumida")} />
      <Field icon={DollarSign} label="Poder Aquisitivo" value={pick(flat, "poderaquisitivo", "classe")} />
      <Field icon={DollarSign} label="Faixa Renda" value={pick(flat, "faixarenda")} />
    </Section>
  );
}

function PhotoView({ data }: { data: any }) {
  // Find any base64 / url photo deeply
  const findPhoto = (obj: any): string | null => {
    if (!obj) return null;
    if (typeof obj === "string") {
      if (obj.startsWith("data:image/") || obj.startsWith("http") && /\.(jpg|jpeg|png|webp)/i.test(obj)) return obj;
      if (obj.length > 200 && /^[A-Za-z0-9+/=]+$/.test(obj.substring(0, 100))) return `data:image/jpeg;base64,${obj}`;
      return null;
    }
    if (typeof obj === "object") {
      for (const [k, v] of Object.entries(obj)) {
        if (/foto|photo|imagem|image/i.test(k)) {
          const found = findPhoto(v);
          if (found) return found;
        }
      }
      for (const v of Object.values(obj)) {
        const found = findPhoto(v);
        if (found) return found;
      }
    }
    return null;
  };
  const photo = findPhoto(data);
  const flat = useMemo(() => flattenAll(data), [data]);

  return (
    <>
      {photo && (
        <Section title="Foto" icon={Camera} variant="info">
          <div className="sm:col-span-2 flex justify-center">
            <img src={photo} alt="Foto" className="max-h-96 rounded-xl border-2 border-border shadow-xl" />
          </div>
        </Section>
      )}
      <Section title="Identificação" icon={User}>
        <Field icon={User} label="Nome" value={pick(flat, "nome")} />
        <Field icon={Fingerprint} label="CPF" value={pick(flat, "cpf")} mono />
        <Field icon={IdCard} label="RG" value={pick(flat, "rg")} mono />
        <Field icon={MapPin} label="Estado" value={pick(flat, "uf", "estado")} />
      </Section>
    </>
  );
}

function GenericView({ data }: { data: any }) {
  // Render top-level object as fields, recursing one level
  if (!data || typeof data !== "object") {
    return (
      <Section title="Resultado" icon={FileText}>
        <div className="sm:col-span-2">
          <pre className="text-xs whitespace-pre-wrap font-mono">{String(data)}</pre>
        </div>
      </Section>
    );
  }
  const entries = Object.entries(data).filter(([_, v]) => v !== null && v !== undefined && v !== "");
  return (
    <Section title="Dados" icon={FileText}>
      {entries.map(([k, v]) => {
        if (typeof v === "object") return null;
        return <Field key={k} label={k} value={String(v)} />;
      })}
      {entries.some(([_, v]) => typeof v === "object") && (
        <div className="sm:col-span-2 mt-2">
          <pre className="text-xs whitespace-pre-wrap font-mono p-3 rounded-lg bg-secondary/30 border border-border/40 max-h-96 overflow-y-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </Section>
  );
}

// ============= MAIN =============
export function UniversalResultModal({ open, onOpenChange, data, queryType, queryInput }: UniversalResultModalProps) {
  const [copied, setCopied] = useState(false);
  const payload = data?.data || data;
  const meta = categorize(queryType);
  const Icon = meta.icon;

  const flat = useMemo(() => flattenAll(payload), [payload]);
  const headerName =
    pick(flat, "nome", "nomecompleto", "razaosocial", "marcamodelo", "modelo") ||
    queryInput || "Resultado da Consulta";

  const headerBadge =
    pick(flat, "cpf", "cnpj", "placa", "telefone", "cep") || queryType.toUpperCase();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopied(true);
      toast.success("Dados copiados!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const renderView = () => {
    switch (meta.cat) {
      case "vehicle": return <VehicleView data={payload} />;
      case "person": return <PersonView data={payload} />;
      case "company": return <CompanyView data={payload} />;
      case "phone": return <PhoneView data={payload} />;
      case "address": return <AddressView data={payload} />;
      case "score": return <ScoreView data={payload} />;
      case "photo": return <PhotoView data={payload} />;
      default: return <GenericView data={payload} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border/50">
        <DialogHeader className="pb-4 border-b border-border/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shrink-0",
                meta.gradient
              )}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl font-bold flex items-center gap-2 flex-wrap">
                  <span className="truncate">{headerName}</span>
                </DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="font-mono text-xs">{headerBadge}</Badge>
                  <Badge variant="outline" className="text-xs bg-primary/5">
                    {meta.label}
                  </Badge>
                </DialogDescription>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 shrink-0">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {renderView()}

          {/* Catch-all: full structured data so nothing is lost */}
          <CompleteDataSection data={payload} />

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
