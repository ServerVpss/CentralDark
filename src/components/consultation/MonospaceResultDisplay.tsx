import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MonospaceResultDisplayProps {
  result: any;
  className?: string;
  showCopyButton?: boolean;
}

// Category definitions with emojis
const categoryConfig: Record<string, { emoji: string; title: string }> = {
  dados_basicos: { emoji: "[✶]", title: "DADOS BÁSICOS" },
  dados_tse: { emoji: "[✶]", title: "DADOS DO TSE" },
  dados_score: { emoji: "[✶]", title: "DADOS DE SCORE" },
  dados_renda: { emoji: "[✶]", title: "DADOS DE RENDA" },
  dados_contato: { emoji: "[✶]", title: "DADOS DE CONTATO" },
  dados_moradia: { emoji: "[✶]", title: "DADOS DE MORADIA" },
  dados_familiares: { emoji: "[✶]", title: "DADOS DE FAMILIARES" },
  dados_profissional: { emoji: "[✶]", title: "DADOS PROFISSIONAIS" },
  dados_veiculos: { emoji: "[✶]", title: "DADOS DE VEÍCULOS" },
  dados_outros: { emoji: "[✶]", title: "OUTROS DADOS" },
};

// Field mappings per category
const fieldCategories: Record<string, string[]> = {
  dados_basicos: [
    "cpf", "nome", "sexo", "nascimento", "data_nascimento", "datanascimento",
    "nome_mae", "mae", "nome_mãe", "nome_pai", "pai", "rg", "orgao_emissor",
    "estado_emissao", "obito", "óbito", "naturalidade", "nacionalidade",
    "raca", "cor", "tipo_sanguineo", "estado_civil"
  ],
  dados_tse: [
    "titulo_eleitor", "titulo", "eleitor", "zona", "secao", "sessao", "seção"
  ],
  dados_score: [
    "csb8", "csba", "csb8_faixa", "csba_faixa", "score", "faixa_risco"
  ],
  dados_renda: [
    "renda", "poder_aquisitivo", "classe_social", "faixa_renda"
  ],
  dados_contato: [
    "telefone", "telefones", "celular", "whatsapp", "email", "emails"
  ],
  dados_moradia: [
    "endereco", "enderecos", "logradouro", "numero", "complemento",
    "bairro", "cidade", "uf", "estado", "cep", "municipio"
  ],
  dados_familiares: [
    "parentes", "irma", "irmao", "filho", "filha", "conjuge", "esposa", "esposo"
  ],
  dados_profissional: [
    "profissao", "cargo", "empresa", "empresas", "emprego", "empregos",
    "cnpj", "razao_social", "escolaridade", "pis", "nis", "ctps"
  ],
  dados_veiculos: [
    "placa", "veiculo", "veiculos", "marca", "modelo", "ano", "cor_veiculo",
    "chassi", "renavam", "combustivel"
  ],
};

// Friendly field labels
const fieldLabels: Record<string, string> = {
  cpf: "CPF",
  nome: "NOME",
  sexo: "SEXO",
  nascimento: "DATA DE NASCIMENTO",
  data_nascimento: "DATA DE NASCIMENTO",
  datanascimento: "DATA DE NASCIMENTO",
  mae: "NOME DA MÃE",
  nome_mae: "NOME DA MÃE",
  "nome_mãe": "NOME DA MÃE",
  pai: "NOME DO PAI",
  nome_pai: "NOME DO PAI",
  rg: "RG",
  orgao_emissor: "ORGÃO EMISSOR",
  estado_emissao: "ESTADO DE EMISSÃO",
  obito: "ÓBITO",
  óbito: "ÓBITO",
  titulo_eleitor: "TITULO DO ELEITOR",
  titulo: "TITULO DO ELEITOR",
  zona: "ZONA",
  secao: "SESSÃO",
  sessao: "SESSÃO",
  seção: "SESSÃO",
  csb8: "CSB8",
  csba: "CSBA",
  csb8_faixa: "CSB8 FAIXA DE RISCO",
  csba_faixa: "CSBA FAIXA DE RISCO",
  score: "SCORE",
  faixa_risco: "FAIXA DE RISCO",
  renda: "RENDA",
  poder_aquisitivo: "PODER AQUISITIVO",
  classe_social: "CLASSE SOCIAL",
  telefone: "TELEFONES/CELULARES",
  telefones: "TELEFONES/CELULARES",
  email: "E-MAILS",
  emails: "E-MAILS",
  endereco: "ENDEREÇO",
  enderecos: "ENDEREÇOS",
  logradouro: "LOGRADOURO",
  numero: "NÚMERO",
  complemento: "COMPLEMENTO",
  bairro: "BAIRRO",
  cidade: "CIDADE",
  uf: "UF",
  estado: "ESTADO",
  cep: "CEP",
  municipio: "MUNICÍPIO",
  parentes: "PARENTES",
  irma: "IRMÃ(O)",
  profissao: "PROFISSÃO",
  cargo: "CARGO",
  empresa: "EMPRESA",
  escolaridade: "ESCOLARIDADE",
  placa: "PLACA",
  veiculo: "VEÍCULO",
};

// Extract and flatten data from nested structures
function extractData(data: any): Record<string, any> {
  if (!data) return {};

  // If data has a nested 'data' property
  if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
    return extractData(data.data);
  }

  // If it's a string, try to parse it
  if (typeof data === "string") {
    return parseTextData(data);
  }

  // Flatten the object
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object" && !Array.isArray(value)) {
      // Flatten nested objects
      const nested = extractData(value);
      Object.assign(result, nested);
    } else {
      result[key.toLowerCase().replace(/\s+/g, "_")] = value;
    }
  }

  return result;
}

// Parse text data with various formats
function parseTextData(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  
  // Clean text
  let cleanText = text
    .replace(/@\w+/g, "")
    .replace(/https?:\/\/[^\s]+/g, "")
    .trim();

  // Split by lines
  const lines = cleanText.split(/\\n|\n/).filter((l) => l.trim());

  for (const line of lines) {
    // Try key: value, key => value, key ⎯ value, key — value
    const match = line.match(/^([^:⎯—=>]+)[:\s⎯—=>]+\s*(.*)$/);
    if (match) {
      const key = match[1].trim().toLowerCase().replace(/\s+/g, "_");
      const value = match[2].trim();
      if (value && value !== "-" && !value.toLowerCase().includes("não informad")) {
        result[key] = value;
      }
    }
  }

  return result;
}

// Categorize data into sections
function categorizeData(data: Record<string, any>): Record<string, Record<string, any>> {
  const categorized: Record<string, Record<string, any>> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    
    // Skip photo fields
    const keyLower = key.toLowerCase();
    if (keyLower.includes("foto") || keyLower.includes("base64") || keyLower.includes("image")) {
      continue;
    }
    
    // Skip base64 strings
    if (typeof value === "string" && (value.startsWith("/9j/") || value.startsWith("iVBOR"))) {
      continue;
    }

    // Find category
    let category = "dados_outros";
    for (const [cat, fields] of Object.entries(fieldCategories)) {
      if (fields.some((f) => keyLower.includes(f) || f.includes(keyLower))) {
        category = cat;
        break;
      }
    }

    if (!categorized[category]) {
      categorized[category] = {};
    }
    categorized[category][key] = value;
  }

  return categorized;
}

// Format value with status indicators
function formatValue(key: string, value: any): { text: string; hasX: boolean } {
  const keyLower = key.toLowerCase();

  // Empty or null values
  if (value === null || value === undefined || value === "" || value === "-") {
    return { text: "", hasX: true };
  }

  // Boolean handling
  if (typeof value === "boolean") {
    return value ? { text: "SIM", hasX: false } : { text: "NÃO", hasX: false };
  }

  // Array handling
  if (Array.isArray(value)) {
    return { text: value.join(", "), hasX: false };
  }

  const strValue = String(value);

  // Check for "não informado" type values
  if (strValue.toLowerCase().includes("não informad") || strValue === "Não informa") {
    return { text: "", hasX: true };
  }

  return { text: strValue, hasX: false };
}

// Get field label
function getFieldLabel(key: string): string {
  const normalized = key.toLowerCase().replace(/\s+/g, "_");
  return fieldLabels[normalized] || key.toUpperCase().replace(/_/g, " ");
}

// Generate copy text
function generateCopyText(categorizedData: Record<string, Record<string, any>>): string {
  const lines: string[] = [];

  for (const [category, fields] of Object.entries(categorizedData)) {
    const config = categoryConfig[category] || { emoji: "[✶]", title: category.toUpperCase() };
    lines.push(`${config.emoji} ${config.title}`);
    lines.push("");

    for (const [key, value] of Object.entries(fields)) {
      const formatted = formatValue(key, value);
      const label = getFieldLabel(key);
      if (formatted.hasX) {
        lines.push(`${label} => ❌`);
      } else {
        lines.push(`${label} => ${formatted.text}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

// Category section component
function CategorySection({
  category,
  fields,
  index,
}: {
  category: string;
  fields: Record<string, any>;
  index: number;
}) {
  const [copied, setCopied] = useState(false);
  const config = categoryConfig[category] || { emoji: "[✶]", title: category.toUpperCase().replace(/_/g, " ") };

  const handleCopy = async () => {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(fields)) {
      const formatted = formatValue(key, value);
      const label = getFieldLabel(key);
      if (formatted.hasX) {
        lines.push(`${label} => ❌`);
      } else if (Array.isArray(value)) {
        // Format arrays with index
        value.forEach((item, idx) => {
          lines.push(`${idx} => ${item}`);
        });
      } else {
        lines.push(`${label} => ${formatted.text}`);
      }
    }

    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      toast.success("Copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-lg border border-cyan-900/50 bg-slate-950/80 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-cyan-950/30 border-b border-cyan-900/50">
        <span className="font-mono text-sm text-cyan-400 font-semibold">
          {config.emoji} {config.title}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-6 px-2 text-xs text-cyan-500 hover:text-cyan-300 hover:bg-cyan-900/30"
        >
          {copied ? <Check className="h-3 w-3" /> : "copiar"}
        </Button>
      </div>

      {/* Content */}
      <div className="p-3 font-mono text-xs leading-relaxed">
        {Object.entries(fields).map(([key, value], idx) => {
          const formatted = formatValue(key, value);
          const label = getFieldLabel(key);

          // Handle arrays (telefones, endereços, etc)
          if (Array.isArray(value) && value.length > 0) {
            return (
              <div key={key} className="mb-2">
                <div className="text-cyan-500 mb-1">- {label} -</div>
                {value.map((item, itemIdx) => (
                  <div key={itemIdx} className="text-cyan-100 ml-2">
                    {itemIdx} {'=>'} {String(item)}
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div key={key} className="flex items-start gap-2 py-0.5">
              <span className="text-cyan-100 whitespace-pre-wrap break-all">
                {label} {'=>'} {formatted.hasX ? (
                  <span className="text-red-500">❌</span>
                ) : (
                  formatted.text
                )}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function MonospaceResultDisplay({
  result,
  className,
  showCopyButton = true,
}: MonospaceResultDisplayProps) {
  const [copiedAll, setCopiedAll] = useState(false);

  if (!result) return null;

  // Handle error response
  if (result.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-3 p-4 bg-red-950/30 rounded-lg border border-red-900/50 font-mono",
          className
        )}
      >
        <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
        <span className="text-red-400 text-sm">{String(result.error)}</span>
      </motion.div>
    );
  }

  const extractedData = extractData(result);
  const categorizedData = categorizeData(extractedData);

  // Filter empty categories
  const nonEmptyCategories = Object.entries(categorizedData).filter(
    ([_, fields]) => Object.keys(fields).length > 0
  );

  // Order categories
  const categoryOrder = [
    "dados_basicos",
    "dados_tse",
    "dados_score",
    "dados_renda",
    "dados_contato",
    "dados_moradia",
    "dados_familiares",
    "dados_profissional",
    "dados_veiculos",
    "dados_outros",
  ];

  const sortedCategories = nonEmptyCategories.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a[0]);
    const indexB = categoryOrder.indexOf(b[0]);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(generateCopyText(categorizedData));
      setCopiedAll(true);
      toast.success("Resultado completo copiado!");
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  if (sortedCategories.length === 0) {
    return (
      <div className={cn("text-muted-foreground text-center py-4", className)}>
        Nenhum dado encontrado para exibir.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-3", className)}
    >
      {/* Copy All Button */}
      {showCopyButton && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            className="gap-2 text-xs border-cyan-900/50 bg-slate-950/50 hover:bg-cyan-950/30 text-cyan-400"
          >
            {copiedAll ? (
              <>
                <Check className="h-3 w-3" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copiar Tudo
              </>
            )}
          </Button>
        </div>
      )}

      {/* Category Sections */}
      <div className="space-y-3">
        {sortedCategories.map(([category, fields], index) => (
          <CategorySection
            key={category}
            category={category}
            fields={fields}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}
