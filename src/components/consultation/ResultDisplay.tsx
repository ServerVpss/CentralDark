import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  Check,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  CreditCard,
  FileText,
  Car,
  Calendar,
  Star,
  Heart,
  Droplets,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ResultDisplayProps {
  result: any;
  className?: string;
  showCopyButton?: boolean;
}

// Field label mappings
const fieldLabels: Record<string, string> = {
  imei: "IMEI",
  serial: "Serial",
  fmiON: "Find My iPhone",
  fmi: "Find My iPhone",
  model: "Modelo",
  modelName: "Nome do Modelo",
  color: "Cor",
  storage: "Armazenamento",
  carrier: "Operadora",
  country: "País",
  blacklistStatus: "Status Blacklist",
  blacklist: "Blacklist",
  warranty: "Garantia",
  purchaseDate: "Data de Compra",
  activationDate: "Data de Ativação",
  nome: "Nome",
  cpf: "CPF",
  rg: "RG",
  cnh: "CNH",
  nascimento: "Data de Nascimento",
  dataNascimento: "Data de Nascimento",
  sexo: "Sexo",
  mae: "Nome da Mãe",
  pai: "Nome do Pai",
  email: "E-mail",
  telefone: "Telefone",
  endereco: "Endereço",
  cep: "CEP",
  cidade: "Cidade",
  estado: "Estado",
  bairro: "Bairro",
  logradouro: "Logradouro",
  numero: "Número",
  complemento: "Complemento",
  renda: "Renda",
  score: "Score de Crédito",
  situacao: "Situação",
  obito: "Óbito",
  placa: "Placa",
  renavam: "Renavam",
  chassi: "Chassi",
  marca: "Marca",
  anoFabricacao: "Ano de Fabricação",
  anoModelo: "Ano do Modelo",
  combustivel: "Combustível",
  cnpj: "CNPJ",
  razaoSocial: "Razão Social",
  nomeFantasia: "Nome Fantasia",
  porte: "Porte",
  naturezaJuridica: "Natureza Jurídica",
};

// Friendly error messages
const friendlyErrorMessages: Record<string, string> = {
  "not found": "Nenhum resultado encontrado para esta consulta.",
  "invalid input": "O valor informado é inválido. Verifique e tente novamente.",
  "timeout": "A consulta demorou muito. Tente novamente.",
  "rate limit": "Muitas consultas em pouco tempo. Aguarde um momento.",
  "unauthorized": "Sua sessão expirou. Faça login novamente.",
  "server error": "Erro no servidor. Tente novamente em instantes.",
};

// Get icon for field
function getFieldIcon(key: string) {
  const keyLower = key.toLowerCase();
  if (keyLower.includes("nome") || keyLower.includes("cpf")) return User;
  if (keyLower.includes("email")) return Mail;
  if (keyLower.includes("telefone") || keyLower.includes("phone") || keyLower.includes("whatsapp")) return Phone;
  if (keyLower.includes("empresa") || keyLower.includes("cnpj") || keyLower.includes("razao")) return Building2;
  if (keyLower.includes("endereco") || keyLower.includes("cep") || keyLower.includes("cidade") || keyLower.includes("bairro")) return MapPin;
  if (keyLower.includes("profissao") || keyLower.includes("cargo")) return Briefcase;
  if (keyLower.includes("escolaridade")) return GraduationCap;
  if (keyLower.includes("renda") || keyLower.includes("score") || keyLower.includes("banco")) return CreditCard;
  if (keyLower.includes("nascimento") || keyLower.includes("data") || keyLower.includes("admissao")) return Calendar;
  if (keyLower.includes("rg") || keyLower.includes("cnh") || keyLower.includes("pis") || keyLower.includes("nis")) return FileText;
  if (keyLower.includes("civil") || keyLower.includes("mae") || keyLower.includes("pai")) return Heart;
  if (keyLower.includes("sangue")) return Droplets;
  if (keyLower.includes("placa") || keyLower.includes("veiculo") || keyLower.includes("carro")) return Car;
  return Star;
}

// Format field label
function formatFieldLabel(key: string): string {
  if (fieldLabels[key]) return fieldLabels[key];
  
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

// Format field value with special handling
function formatValue(key: string, value: any): { text: string; icon?: React.ReactNode; color?: string } {
  const lowerKey = key.toLowerCase();

  // Boolean fields with special formatting
  if (lowerKey.includes("fmi") || lowerKey === "fmion") {
    return value
      ? { text: "ATIVO", icon: <Lock className="h-4 w-4" />, color: "text-destructive" }
      : { text: "DESLIGADO", icon: <Unlock className="h-4 w-4" />, color: "text-success" };
  }

  if (lowerKey.includes("blacklist")) {
    return value
      ? { text: "BLOQUEADO", icon: <XCircle className="h-4 w-4" />, color: "text-destructive" }
      : { text: "LIMPO", icon: <CheckCircle className="h-4 w-4" />, color: "text-success" };
  }

  if (lowerKey === "obito") {
    return value
      ? { text: "SIM", color: "text-destructive" }
      : { text: "NÃO", color: "text-success" };
  }

  if (lowerKey.includes("situacao") || lowerKey.includes("status")) {
    const isPositive = String(value).toLowerCase().includes("regular") || 
                       String(value).toLowerCase().includes("ativ");
    return {
      text: String(value).toUpperCase(),
      icon: isPositive ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />,
      color: isPositive ? "text-success" : "text-warning",
    };
  }

  // Default formatting
  if (typeof value === "boolean") {
    return { text: value ? "Sim" : "Não" };
  }

  return { text: String(value) };
}

// Get friendly error message
function getFriendlyError(error: any): string {
  if (!error) return "";
  
  const errorStr = String(error).toLowerCase();
  
  for (const [key, message] of Object.entries(friendlyErrorMessages)) {
    if (errorStr.includes(key)) {
      return message;
    }
  }
  
  return String(error);
}

// Extract main data from nested structures
function extractMainData(data: any): Record<string, any> {
  if (!data) return {};
  
  // If data has a nested 'data' property, use that
  if (data.data && typeof data.data === "object") {
    return extractMainData(data.data);
  }
  
  // If data has a 'result' property, use that
  if (data.result && typeof data.result === "object") {
    return extractMainData(data.result);
  }
  
  return data;
}

// Generate copy text
function generateCopyText(data: Record<string, any>): string {
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object" && !Array.isArray(value)) continue;
    
    const label = formatFieldLabel(key);
    const formatted = formatValue(key, value);
    lines.push(`${label}: ${formatted.text}`);
  }
  
  return lines.join("\n");
}

// Group fields by category
function groupFields(data: Record<string, any>): Record<string, Record<string, any>> {
  const groups: Record<string, Record<string, any>> = {
    "Dados Pessoais": {},
    "Documentos": {},
    "Contatos": {},
    "Financeiro": {},
    "Localização": {},
    "Veículo": {},
    "Outros": {},
  };

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object" && !Array.isArray(value)) continue;
    
    const keyLower = key.toLowerCase();
    
    if (keyLower.includes("nome") || keyLower.includes("sexo") || keyLower.includes("nascimento") ||
        keyLower.includes("mae") || keyLower.includes("pai") || keyLower.includes("civil") ||
        keyLower.includes("obito") || keyLower.includes("raca") || keyLower.includes("sangue")) {
      groups["Dados Pessoais"][key] = value;
    } else if (keyLower.includes("cpf") || keyLower.includes("rg") || keyLower.includes("cnh") ||
               keyLower.includes("pis") || keyLower.includes("nis") || keyLower.includes("titulo") ||
               keyLower.includes("imei") || keyLower.includes("serial")) {
      groups["Documentos"][key] = value;
    } else if (keyLower.includes("email") || keyLower.includes("telefone") || keyLower.includes("whatsapp") ||
               keyLower.includes("phone")) {
      groups["Contatos"][key] = value;
    } else if (keyLower.includes("renda") || keyLower.includes("score") || keyLower.includes("banco") ||
               keyLower.includes("receita") || keyLower.includes("inss") || keyLower.includes("fmi") ||
               keyLower.includes("blacklist") || keyLower.includes("warranty") || keyLower.includes("garantia")) {
      groups["Financeiro"][key] = value;
    } else if (keyLower.includes("endereco") || keyLower.includes("cep") || keyLower.includes("cidade") ||
               keyLower.includes("estado") || keyLower.includes("bairro") || keyLower.includes("logradouro") ||
               keyLower.includes("pais") || keyLower.includes("country")) {
      groups["Localização"][key] = value;
    } else if (keyLower.includes("placa") || keyLower.includes("veiculo") || keyLower.includes("chassi") ||
               keyLower.includes("renavam") || keyLower.includes("combustivel") || keyLower.includes("marca") ||
               keyLower.includes("modelo") || keyLower.includes("ano")) {
      groups["Veículo"][key] = value;
    } else {
      groups["Outros"][key] = value;
    }
  }

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, fields]) => Object.keys(fields).length > 0)
  );
}

export function ResultDisplay({ result, className, showCopyButton = true }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  // Handle error response
  if (result.error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive/30", className)}
      >
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <span className="text-destructive">{getFriendlyError(result.error)}</span>
      </motion.div>
    );
  }

  const extractedData = extractMainData(result);
  const groupedData = groupFields(extractedData);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateCopyText(extractedData));
      setCopied(true);
      toast.success("Resultado copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const groupIcons: Record<string, React.ReactNode> = {
    "Dados Pessoais": <User className="h-4 w-4" />,
    "Documentos": <FileText className="h-4 w-4" />,
    "Contatos": <Phone className="h-4 w-4" />,
    "Financeiro": <CreditCard className="h-4 w-4" />,
    "Localização": <MapPin className="h-4 w-4" />,
    "Veículo": <Car className="h-4 w-4" />,
    "Outros": <Star className="h-4 w-4" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("space-y-4", className)}
    >
      {showCopyButton && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-success" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar Resultado
              </>
            )}
          </Button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {Object.entries(groupedData).map(([groupName, fields], groupIndex) => (
          <motion.div
            key={groupName}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { delay: groupIndex * 0.1 }
            }}
          >
            <Card className="bg-secondary/30 border-border/50 overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                  {groupIcons[groupName]}
                  {groupName}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-2">
                  {Object.entries(fields).map(([key, value], index) => {
                    const Icon = getFieldIcon(key);
                    const formatted = formatValue(key, value);

                    // Handle array values
                    if (Array.isArray(value)) {
                      return (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: 1, 
                            x: 0,
                            transition: { delay: groupIndex * 0.1 + index * 0.05 }
                          }}
                          className="space-y-2"
                        >
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Icon className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium uppercase">{formatFieldLabel(key)}</span>
                            <Badge variant="outline" className="text-xs">
                              {value.length}
                            </Badge>
                          </div>
                          <div className="pl-5 space-y-1">
                            {value.map((item, idx) => (
                              <div key={idx} className="text-sm bg-background/50 px-2 py-1 rounded border border-border/30">
                                {String(item)}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          transition: { delay: groupIndex * 0.1 + index * 0.05 }
                        }}
                        className="flex items-start gap-2 py-1"
                      >
                        <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                          <span className="text-xs text-muted-foreground uppercase shrink-0">
                            {formatFieldLabel(key)}:
                          </span>
                          <span className={cn("text-sm font-medium break-all flex items-center gap-1", formatted.color)}>
                            {formatted.icon}
                            {formatted.text}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
