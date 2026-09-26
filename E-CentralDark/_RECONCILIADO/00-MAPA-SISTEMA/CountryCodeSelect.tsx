import { useMemo, useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Country {
  iso: string;
  name: string;
  dial: string;
}

// Lista enxuta dos principais países (cobre os mais comuns + alguns que aparecem na imagem)
export const COUNTRIES: Country[] = [
  { iso: "AC", name: "Ilha de Ascensão", dial: "+247" },
  { iso: "AD", name: "Andorra", dial: "+376" },
  { iso: "AE", name: "Emirados Árabes Unidos", dial: "+971" },
  { iso: "AF", name: "Afeganistão", dial: "+93" },
  { iso: "AG", name: "Antígua e Barbuda", dial: "+1" },
  { iso: "AI", name: "Anguilla", dial: "+1" },
  { iso: "AL", name: "Albânia", dial: "+355" },
  { iso: "AM", name: "Armênia", dial: "+374" },
  { iso: "AO", name: "Angola", dial: "+244" },
  { iso: "AR", name: "Argentina", dial: "+54" },
  { iso: "AT", name: "Áustria", dial: "+43" },
  { iso: "AU", name: "Austrália", dial: "+61" },
  { iso: "BE", name: "Bélgica", dial: "+32" },
  { iso: "BO", name: "Bolívia", dial: "+591" },
  { iso: "BR", name: "Brasil", dial: "+55" },
  { iso: "CA", name: "Canadá", dial: "+1" },
  { iso: "CH", name: "Suíça", dial: "+41" },
  { iso: "CL", name: "Chile", dial: "+56" },
  { iso: "CN", name: "China", dial: "+86" },
  { iso: "CO", name: "Colômbia", dial: "+57" },
  { iso: "CR", name: "Costa Rica", dial: "+506" },
  { iso: "CU", name: "Cuba", dial: "+53" },
  { iso: "DE", name: "Alemanha", dial: "+49" },
  { iso: "DK", name: "Dinamarca", dial: "+45" },
  { iso: "DO", name: "República Dominicana", dial: "+1" },
  { iso: "EC", name: "Equador", dial: "+593" },
  { iso: "EG", name: "Egito", dial: "+20" },
  { iso: "ES", name: "Espanha", dial: "+34" },
  { iso: "FI", name: "Finlândia", dial: "+358" },
  { iso: "FR", name: "França", dial: "+33" },
  { iso: "GB", name: "Reino Unido", dial: "+44" },
  { iso: "GR", name: "Grécia", dial: "+30" },
  { iso: "GT", name: "Guatemala", dial: "+502" },
  { iso: "HK", name: "Hong Kong", dial: "+852" },
  { iso: "HN", name: "Honduras", dial: "+504" },
  { iso: "ID", name: "Indonésia", dial: "+62" },
  { iso: "IE", name: "Irlanda", dial: "+353" },
  { iso: "IL", name: "Israel", dial: "+972" },
  { iso: "IN", name: "Índia", dial: "+91" },
  { iso: "IT", name: "Itália", dial: "+39" },
  { iso: "JP", name: "Japão", dial: "+81" },
  { iso: "KR", name: "Coreia do Sul", dial: "+82" },
  { iso: "MX", name: "México", dial: "+52" },
  { iso: "NG", name: "Nigéria", dial: "+234" },
  { iso: "NL", name: "Países Baixos", dial: "+31" },
  { iso: "NO", name: "Noruega", dial: "+47" },
  { iso: "NZ", name: "Nova Zelândia", dial: "+64" },
  { iso: "PA", name: "Panamá", dial: "+507" },
  { iso: "PE", name: "Peru", dial: "+51" },
  { iso: "PH", name: "Filipinas", dial: "+63" },
  { iso: "PL", name: "Polônia", dial: "+48" },
  { iso: "PT", name: "Portugal", dial: "+351" },
  { iso: "PY", name: "Paraguai", dial: "+595" },
  { iso: "RO", name: "Romênia", dial: "+40" },
  { iso: "RU", name: "Rússia", dial: "+7" },
  { iso: "SA", name: "Arábia Saudita", dial: "+966" },
  { iso: "SE", name: "Suécia", dial: "+46" },
  { iso: "SG", name: "Singapura", dial: "+65" },
  { iso: "TH", name: "Tailândia", dial: "+66" },
  { iso: "TR", name: "Turquia", dial: "+90" },
  { iso: "TW", name: "Taiwan", dial: "+886" },
  { iso: "UA", name: "Ucrânia", dial: "+380" },
  { iso: "US", name: "Estados Unidos", dial: "+1" },
  { iso: "UY", name: "Uruguai", dial: "+598" },
  { iso: "VE", name: "Venezuela", dial: "+58" },
  { iso: "VN", name: "Vietnã", dial: "+84" },
  { iso: "ZA", name: "África do Sul", dial: "+27" },
];

interface Props {
  value: Country;
  onChange: (c: Country) => void;
}

export function CountryCodeSelect({ value, onChange }: Props) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
        setBusca("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.iso.toLowerCase().includes(q) ||
        c.dial.includes(q),
    );
  }, [busca]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="h-10 px-3 rounded-md border bg-background flex items-center gap-1.5 text-sm hover:bg-accent transition-colors w-full"
      >
        <span className="text-xs text-muted-foreground font-medium">{value.iso}</span>
        <span className="font-medium">{value.dial}</span>
        <ChevronDown className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
      </button>

      {aberto && (
        <div className="absolute z-50 mt-1 w-72 rounded-md border bg-popover shadow-lg overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Pesquise"
                className="w-full h-8 pl-7 pr-2 text-sm rounded border bg-background focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtrados.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                Nenhum país encontrado
              </div>
            ) : (
              filtrados.map((c) => (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => {
                    onChange(c);
                    setAberto(false);
                    setBusca("");
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center gap-2",
                    value.iso === c.iso && "bg-accent",
                  )}
                >
                  <span className="text-xs text-muted-foreground font-medium w-6">{c.iso}</span>
                  <span className="text-muted-foreground">{c.dial}</span>
                  <span className="truncate">{c.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
