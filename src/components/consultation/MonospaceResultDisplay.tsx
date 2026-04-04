import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, AlertCircle, User, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MonospaceResultDisplayProps {
  result: any;
  className?: string;
  showCopyButton?: boolean;
}

// Category definitions with emojis (Telegram style)
const categoryConfig: Record<string, { emoji: string; title: string }> = {
  dados_pessoais: { emoji: "👤", title: "DADOS PESSOAIS" },
  dados_tse: { emoji: "🗳️", title: "DADOS DO TSE" },
  dados_score: { emoji: "📊", title: "DADOS DE SCORE" },
  dados_renda: { emoji: "💰", title: "DADOS DE RENDA" },
  dados_contato: { emoji: "📞", title: "DADOS DE CONTATO" },
  dados_moradia: { emoji: "🏠", title: "DADOS DE MORADIA" },
  dados_familiares: { emoji: "👨‍👩‍👧", title: "DADOS DE FAMILIARES" },
  dados_profissional: { emoji: "💼", title: "DADOS PROFISSIONAIS" },
  dados_veiculos: { emoji: "🚗", title: "DADOS DE VEÍCULOS" },
  dados_outros: { emoji: "📋", title: "OUTROS DADOS" },
};

// Field emoji mappings (Telegram style)
const fieldEmojis: Record<string, string> = {
  nome: "👤",
  cpf: "🆔",
  nascimento: "📅",
  data_nascimento: "📅",
  sexo: "⚧",
  raca: "🎨",
  cor: "🎨",
  obito: "⚰️",
  óbito: "⚰️",
  status_receita: "📋",
  mae: "👩",
  nome_mae: "👩",
  pai: "👨",
  nome_pai: "👨",
  rg: "🪪",
  orgao_emissor: "🏛️",
  titulo_eleitor: "🗳️",
  zona: "📍",
  secao: "📍",
  sessao: "📍",
  csb8: "📊",
  csba: "📊",
  score_csb: "📊",
  score_csba: "📊",
  score: "⭐",
  score_serasa: "⭐",
  faixa_risco: "⚠️",
  faixa_risco_csb: "⚠️",
  faixa_risco_csba: "⚠️",
  classificacao: "📈",
  renda: "💵",
  poder_aquisitivo: "💎",
  classe_social: "🏆",
  telefone: "📱",
  telefones: "📱",
  celular: "📱",
  email: "📧",
  emails: "📧",
  endereco: "🏠",
  enderecos: "🏠",
  logradouro: "🛣️",
  numero: "🔢",
  complemento: "📝",
  bairro: "🏘️",
  cidade: "🌆",
  uf: "🗺️",
  estado: "🗺️",
  cep: "📮",
  municipio: "🏙️",
  parentes: "👨‍👩‍👧‍👦",
  irma: "👧",
  irmao: "👦",
  profissao: "💼",
  cargo: "👔",
  empresa: "🏢",
  escolaridade: "🎓",
  placa: "🚗",
  veiculo: "🚙",
  marca: "🏭",
  modelo: "📋",
  chassi: "🔧",
  renavam: "📄",
  pis: "📋",
  nis: "📋",
  cns: "🏥",
  cnh: "🪪",
  naturalidade: "🌍",
  nacionalidade: "🌐",
  estado_civil: "💍",
  tipo_sanguineo: "🩸",
};

// Field label mappings
const fieldLabels: Record<string, string> = {
  cpf: "CPF",
  nome: "Nome",
  sexo: "Sexo",
  nascimento: "Nascimento",
  data_nascimento: "Nascimento",
  mae: "Nome da Mãe",
  nome_mae: "Nome da Mãe",
  pai: "Nome do Pai",
  nome_pai: "Nome do Pai",
  rg: "RG",
  orgao_emissor: "Órgão Emissor",
  estado_emissao: "Estado de Emissão",
  obito: "Óbito",
  óbito: "Óbito",
  status_receita: "Status Receita",
  titulo_eleitor: "Título Eleitor",
  zona: "Zona",
  secao: "Seção",
  sessao: "Sessão",
  csb8: "Score CSB8",
  csba: "Score CSBA",
  score_csb: "Score CSB",
  score_csba: "Score CSBA",
  score: "Score",
  score_serasa: "Score Serasa",
  faixa_risco: "Faixa de Risco",
  faixa_risco_csb: "Faixa de Risco CSB",
  faixa_risco_csba: "Faixa de Risco CSBA",
  classificacao: "Classificação",
  renda: "Renda",
  poder_aquisitivo: "Poder Aquisitivo",
  classe_social: "Classe Social",
  telefone: "Telefone",
  telefones: "Telefones",
  email: "E-mail",
  emails: "E-mails",
  endereco: "Endereço",
  logradouro: "Logradouro",
  numero: "Número",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  uf: "UF",
  estado: "Estado",
  cep: "CEP",
  municipio: "Município",
  raca: "Raça",
  cor: "Cor",
  naturalidade: "Naturalidade",
  nacionalidade: "Nacionalidade",
  estado_civil: "Estado Civil",
  tipo_sanguineo: "Tipo Sanguíneo",
  profissao: "Profissão",
  escolaridade: "Escolaridade",
  pis: "PIS",
  nis: "NIS",
  cns: "CNS",
  cnh: "CNH",
  placa: "Placa",
  veiculo: "Veículo",
  marca: "Marca",
  modelo: "Modelo",
  chassi: "Chassi",
  renavam: "Renavam",
};

// Field categories mapping
const fieldCategories: Record<string, string[]> = {
  dados_pessoais: [
    "cpf", "nome", "sexo", "nascimento", "data_nascimento", "datanascimento",
    "rg", "orgao_emissor", "estado_emissao", "obito", "óbito", "naturalidade", 
    "nacionalidade", "raca", "cor", "tipo_sanguineo", "estado_civil", "status_receita"
  ],
  dados_tse: [
    "titulo_eleitor", "titulo", "eleitor", "zona", "secao", "sessao", "seção"
  ],
  dados_score: [
    "csb8", "csba", "csb8_faixa", "csba_faixa", "score", "score_serasa",
    "score_csb", "score_csba", "faixa_risco", "faixa_risco_csb", "faixa_risco_csba", "classificacao"
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
    "mae", "nome_mae", "pai", "nome_pai", "parentes", "irma", "irmao", 
    "filho", "filha", "conjuge", "esposa", "esposo"
  ],
  dados_profissional: [
    "profissao", "cargo", "empresa", "empresas", "emprego", "empregos",
    "cnpj", "razao_social", "escolaridade", "pis", "nis", "ctps", "cns", "cnh"
  ],
  dados_veiculos: [
    "placa", "veiculo", "veiculos", "marca", "modelo", "ano", "cor_veiculo",
    "chassi", "renavam", "combustivel"
  ],
};

// Field aliases for canonical key mapping
const fieldAliases: Record<string, string> = {
  nome_da_mae: "nome_mae",
  nome_da_mãe: "nome_mae",
  nome_do_pai: "nome_pai",
  data_de_nascimento: "data_nascimento",
  datanascimento: "data_nascimento",
  dt_nascimento: "data_nascimento",
  orgao_emissor_rg: "orgao_emissor",
  uf_rg: "estado_emissao",
  titulo_de_eleitor: "titulo_eleitor",
  titulo: "titulo_eleitor",
  secao_eleitoral: "secao",
  seção_eleitoral: "secao",
  seção: "secao",
  sessão: "secao",
  zona_eleitoral: "zona",
  mae: "nome_mae",
  pai: "nome_pai",
  fone: "telefone",
  tel: "telefone",
  cel: "celular",
  cid: "cidade",
  mun: "municipio",
  munic: "municipio",
  end: "endereco",
  log: "logradouro",
  num: "numero",
  comp: "complemento",
};

// Normalize key: remove accents, lowercase, replace spaces with underscores
function normalizeKey(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_") // Replace non-alphanumeric with underscore
    .replace(/_+/g, "_") // Collapse multiple underscores
    .replace(/^_|_$/g, ""); // Trim underscores
}

// Apply field alias if exists
function applyAlias(key: string): string {
  const normalized = normalizeKey(key);
  return fieldAliases[normalized] || normalized;
}

// Extract photo from data
function extractPhoto(data: any): string | null {
  if (!data) return null;
  
  // Check common photo field names
  const photoFields = ["foto", "image", "photo", "fotoBase64", "base64", "url"];
  
  for (const field of photoFields) {
    if (data[field] && typeof data[field] === "string") {
      let photo = data[field];
      // Add data URL prefix if it's raw base64
      if (photo.startsWith("/9j/") || photo.startsWith("iVBOR")) {
        photo = `data:image/jpeg;base64,${photo}`;
      }
      return photo;
    }
  }
  
  // Check nested data
  if (data.data && typeof data.data === "object") {
    return extractPhoto(data.data);
  }
  
  return null;
}

// Extract and flatten data from nested structures
function extractData(data: any): Record<string, any> {
  if (!data) return {};

  // Check if this looks like an enriched Score API response
  // It will have nome/nascimento at top level AND resposta nested inside
  if (data.consulta_tipo === "score_enriquecido" || (data.data?.resposta || data.resposta)) {
    const result: Record<string, any> = {};
    
    // First, extract enriched fields from top level (nome, nascimento, cpf)
    if (data.nome && !isCorruptedField(data.nome)) {
      result.nome = data.nome;
    }
    if (data.nascimento) {
      result.nascimento = data.nascimento;
    }
    if (data.cpf && typeof data.cpf === "string" && data.cpf.match(/^\d+$/)) {
      result.cpf = data.cpf;
    }
    
    // Then process the Score data from resposta
    const resposta = data.data?.resposta || data.resposta;
    if (resposta && typeof resposta === "object") {
      const scoreData = processScoreResponse(resposta);
      Object.assign(result, scoreData);
    }
    
    if (Object.keys(result).length > 0) {
      return result;
    }
  }

  // If data has a nested 'data' property that is a string (API text response)
  if (data.data && typeof data.data === "string") {
    const parsed = parseTextData(data.data);
    // Also include other fields like "comando", "valor"
    if (data.comando) parsed.comando = data.comando;
    if (data.valor) parsed.valor_consulta = data.valor;
    return parsed;
  }

  // If data has a nested 'data' property that is an object
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
    
    const keyLower = key.toLowerCase();
    
    // Skip photo fields in main data
    if (["foto", "image", "photo", "fotobase64", "base64"].includes(keyLower)) continue;
    
    // Skip junk fields
    if (keyLower === "atualizado_em" && typeof value === "string" && 
        (value.toLowerCase().includes("encodeuricomponent") || value.toLowerCase().includes("data:text"))) {
      continue;
    }
    
    // Check if this is a score-related field that needs parsing
    if (typeof value === "string" && (value.toUpperCase().includes("CSB") || value.toUpperCase().includes("SCORE"))) {
      const scoreData = parseScoreData(value);
      if (scoreData && Object.keys(scoreData).length > 0) {
        Object.assign(result, scoreData);
        continue;
      }
    }
    
    // Check if this is a "texto" field that should be parsed
    if (["texto", "text", "resultado", "resposta"].includes(keyLower) && typeof value === "string") {
      const textValue = value as string;
      // Only parse if it contains field patterns (colon-separated or multiple lines)
      if (textValue.includes(":") && (textValue.includes("\n") || textValue.includes("\\n") || (textValue.match(/[A-ZÀ-Ú\s]+:/gi) || []).length >= 2)) {
        const parsedFields = parseTextData(textValue);
        // Merge parsed fields into result
        for (const [parsedKey, parsedValue] of Object.entries(parsedFields)) {
          const normalizedKey = applyAlias(parsedKey);
          result[normalizedKey] = parsedValue;
        }
        // Skip adding the raw texto field since we parsed it
        continue;
      }
    }
    
    if (typeof value === "object" && !Array.isArray(value)) {
      const nested = extractData(value);
      Object.assign(result, nested);
    } else if (Array.isArray(value)) {
      // Handle arrays of objects by flattening them
      if (value.length > 0 && typeof value[0] === "object" && value[0] !== null) {
        value.forEach((item, idx) => {
          if (typeof item === "object" && item !== null) {
            const nested = extractData(item);
            for (const [nk, nv] of Object.entries(nested)) {
              const existingKey = applyAlias(nk);
              if (result[existingKey] && result[existingKey] !== nv) {
                // If key already exists, convert to array
                if (Array.isArray(result[existingKey])) {
                  (result[existingKey] as any[]).push(nv);
                } else {
                  result[existingKey] = [result[existingKey], nv];
                }
              } else {
                result[existingKey] = nv;
              }
            }
          }
        });
      } else {
        const normalizedKey = applyAlias(key);
        result[normalizedKey] = value;
      }
    } else {
      const normalizedKey = applyAlias(key);
      result[normalizedKey] = value;
    }
  }

  return result;
}

// Known field patterns for inline parsing
const knownFieldPatterns = [
  "NOME", "CPF", "RG", "DATA DE NASCIMENTO", "NASCIMENTO", "NOME DA MÃE", 
  "NOME DO PAI", "MAE", "PAI", "SEXO", "ORIGEM", "TITULO ELEITOR", 
  "ZONA", "SECAO", "SEÇÃO", "ENDERECO", "ENDEREÇO", "BAIRRO", "CIDADE", 
  "UF", "CEP", "TELEFONE", "CELULAR", "EMAIL", "RENDA", "SCORE",
  "NATURALIDADE", "NACIONALIDADE", "ESTADO CIVIL", "PROFISSAO", "PROFISSÃO",
  "ESCOLARIDADE", "PIS", "NIS", "CNS", "CNH", "PLACA", "CHASSI", "RENAVAM",
  "OBITO", "ÓBITO", "STATUS RECEITA", "PODER AQUISITIVO", "CLASSE SOCIAL",
  // Score-specific patterns
  "SCORE SERASA", "CSB", "CSB8", "CSBA", "FAIXA DE RISCO", "FAIXA SCORE",
  "SCORE CSB", "SCORE CSBA", "CLASSIFICACAO", "CLASSIFICAÇÃO", "ATUALIZADO EM"
];

// Score-specific field mappings
const scoreFieldAliases: Record<string, string> = {
  "score_serasa": "score",
  "score_csb": "csb8",
  "score_csba": "csba",
  "faixa_de_risco": "faixa_risco",
  "faixa_score": "faixa_risco",
  "classificacao": "faixa_risco",
  "classificação": "faixa_risco",
  "atualizado_em": "atualizacao",
};

// Parse inline text like "NOME: VALUE CPF: VALUE RG: VALUE"
// Also handles Score format: "SCORE SERASA:valueCSB:valueFAIXA DE RISCO:value"
function parseInlineFields(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  
  // Sort patterns by length descending to match longer patterns first
  const sortedPatterns = [...knownFieldPatterns].sort((a, b) => b.length - a.length);
  const fieldsPattern = sortedPatterns.map(p => p.replace(/\s+/g, "\\s*")).join("|");
  const regex = new RegExp(`(${fieldsPattern})\\s*:\\s*`, "gi");
  
  // Find all field positions
  const matches: { field: string; start: number; end: number; rawField: string }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const rawField = match[1];
    // Normalize the field name
    let normalizedField = applyAlias(rawField);
    
    // Apply score-specific aliases
    const scoreKey = normalizedField.toLowerCase().replace(/\s+/g, "_");
    if (scoreFieldAliases[scoreKey]) {
      normalizedField = scoreFieldAliases[scoreKey];
    }
    
    matches.push({
      field: normalizedField,
      rawField: rawField,
      start: match.index,
      end: match.index + match[0].length
    });
  }
  
  // Extract values between fields
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];
    
    const valueStart = currentMatch.end;
    const valueEnd = nextMatch ? nextMatch.start : text.length;
    let value = text.substring(valueStart, valueEnd).trim();
    
    // Clean up value - remove trailing field names that might have been captured
    value = value.replace(/^[:\s]+/, "").replace(/[:\s]+$/, "");
    
    // Skip empty, placeholder or uninformative values
    if (!value || 
        value === "-" || 
        value.toLowerCase().includes("não informad") || 
        value === "SEM INFORMAÇÃO" ||
        value.toLowerCase().includes("data:text") ||
        value.toLowerCase().includes("encodeuricomponent")) {
      continue;
    }
    
    // For score fields, clean up concatenated values
    if (["score", "csb8", "csba", "faixa_risco"].includes(currentMatch.field)) {
      // Remove numeric suffixes that might be from next field
      value = value.replace(/\d{3,}$/, "").trim();
    }
    
    result[currentMatch.field] = value;
  }
  
  return result;
}

// Parse Score-specific format (highly concatenated without spaces)
// Example input: "SCORE SERASASCORE CSB:484FAIXA DE RISCO CSB:MEDIOSCORE CSBA:368FAIXA DE RISCO CSBA:ALTO"
function parseScoreData(text: string): Record<string, any> | null {
  // Check if this looks like Score data
  const textUpper = text.toUpperCase();
  if (!textUpper.includes("SCORE") && !textUpper.includes("CSB")) {
    return null;
  }
  
  const result: Record<string, any> = {};
  
  // Method 1: Direct regex extraction from concatenated string
  // Pattern: "SCORE CSB:484" or "CSB:484"
  const scoreCsbMatch = text.match(/(?:SCORE\s*)?CSB(?!A)\s*:?\s*(\d+)/i);
  if (scoreCsbMatch && scoreCsbMatch[1]) {
    result.score_csb = scoreCsbMatch[1];
  }
  
  // Pattern: "SCORE CSBA:368" or "CSBA:368"
  const scoreCsbaMatch = text.match(/(?:SCORE\s*)?CSBA\s*:?\s*(\d+)/i);
  if (scoreCsbaMatch && scoreCsbaMatch[1]) {
    result.score_csba = scoreCsbaMatch[1];
  }
  
  // Pattern: "FAIXA DE RISCO CSB:MEDIO" - extract word(s) before next pattern
  const faixaCsbMatch = text.match(/FAIXA\s*(?:DE\s*)?RISCO\s*CSB(?!A)\s*:?\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ]+)/i);
  if (faixaCsbMatch && faixaCsbMatch[1]) {
    const val = faixaCsbMatch[1].trim();
    if (val && !val.toUpperCase().includes("SEM") && val !== "SCORE") {
      result.faixa_risco_csb = val;
    }
  }
  
  // Pattern: "FAIXA DE RISCO CSBA:ALTO"
  const faixaCsbaMatch = text.match(/FAIXA\s*(?:DE\s*)?RISCO\s*CSBA\s*:?\s*([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ]+)/i);
  if (faixaCsbaMatch && faixaCsbaMatch[1]) {
    const val = faixaCsbaMatch[1].trim();
    if (val && !val.toUpperCase().includes("SEM")) {
      result.faixa_risco_csba = val;
    }
  }
  
  // Pattern: "SCORE SERASA" followed by number (rare, usually at start)
  const serasaMatch = text.match(/SCORE\s*SERASA\s*:?\s*(\d+)/i);
  if (serasaMatch && serasaMatch[1]) {
    result.score_serasa = serasaMatch[1];
  }
  
  return Object.keys(result).length > 0 ? result : null;
}

// Process score response that may have multiple fields with concatenated data
function processScoreResponse(data: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  
  // Fields that may contain score data
  const scoreFields = ["score", "faixa_score", "classificacao", "resposta"];
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      const keyLower = key.toLowerCase();
      
      // Skip junk fields
      if (keyLower === "atualizado_em" || 
          value.toLowerCase().includes("encodeuricomponent") ||
          value.toLowerCase().includes("data:text")) {
        continue;
      }
      
      // Skip placeholder values
      if (value === "\\n';" || value.toLowerCase() === "copiar") {
        continue;
      }
      
      // Skip corrupted CPF/Nome fields (contain ENDEREÇO, DÉBITOS, etc.)
      if ((keyLower === "cpf" || keyLower === "nome") && isCorruptedField(value)) {
        continue;
      }
      
      // If it looks like score data, parse it
      if (value.toUpperCase().includes("CSB") || value.toUpperCase().includes("SCORE")) {
        const parsed = parseScoreData(value);
        if (parsed) {
          Object.assign(result, parsed);
        }
      }
    } else if (typeof value === "object" && value !== null) {
      // Recurse into nested objects
      const nested = processScoreResponse(value);
      Object.assign(result, nested);
    }
  }
  
  return result;
}

// Check if a field value is corrupted (contains unrelated data concatenated)
function isCorruptedField(value: string): boolean {
  const corruptionIndicators = [
    "ENDEREÇO", "ENDERECO", "DÉBITOS", "DEBITOS", "MULTA", "IPVA",
    "LICENCIAMENTO", "DPVAT", "RESTRIÇÕES", "RESTRICOES", "STATUS GERAL",
    "VEÍCULO", "VEICULO", "REGULAR", "CPF:", "CNPJ:",
    "RUA:", "RUA ", "NÚMERO:", "NUMERO:", "CIDADE:", "UF:", "CEP:"
  ];
  
  const upperValue = value.toUpperCase();
  
  // If the value contains multiple corruption indicators, it's corrupted
  let matches = 0;
  for (const indicator of corruptionIndicators) {
    if (upperValue.includes(indicator)) {
      matches++;
      if (matches >= 2) return true;
    }
  }
  
  // Also check if CPF/CNPJ appears in the middle of a nome field
  if (upperValue.includes("CPF:") || upperValue.includes("CNPJ:")) {
    return true;
  }
  
  return false;
}

// Parse text data with various formats
function parseTextData(text: string): Record<string, any> {
  const result: Record<string, any> = {};
  
  // Remove bot references and URLs
  let cleanText = text
    .replace(/@\w+/g, "")
    .replace(/https?:\/\/[^\s]+/g, "")
    // Remove data URL artifacts
    .replace(/STR\s*=\s*"DATA:TEXT\/PLAIN;CHARSET=UTF-8,"\s*\+\s*ENCODEURICOMPONENT\(CONTENT\);?/gi, "")
    .trim();

  // Try Score-specific parser first
  const scoreResult = parseScoreData(cleanText);
  if (scoreResult && Object.keys(scoreResult).length >= 2) {
    return scoreResult;
  }

  // Check if this is inline format (multiple KEY: VALUE on same line)
  const hasMultipleInlineFields = (cleanText.match(/[A-ZÀ-Ú\s]+:/g) || []).length >= 2 && !cleanText.includes("\n");
  if (hasMultipleInlineFields) {
    return parseInlineFields(cleanText);
  }

  // Split by actual newlines (both escaped and real)
  const lines = cleanText.split(/\\n|\n/).filter((l) => l.trim());

  // Track arrays for grouped data
  const arrays: Record<string, string[]> = {
    telefones: [],
    enderecos: [],
    emails: [],
    empresas: [],
    parentes: [],
    veiculos: [],
    bancos: [],
    empregos: [],
  };
  
  let currentArrayKey: string | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line has multiple inline fields
    const lineFieldCount = (trimmedLine.match(/[A-ZÀ-Ú\s]+:/g) || []).length;
    if (lineFieldCount >= 2) {
      const inlineResult = parseInlineFields(trimmedLine);
      Object.assign(result, inlineResult);
      continue;
    }
    
    // Check for section headers like "TELEFONES: ( 4 - Encontrados)"
    const sectionMatch = trimmedLine.match(/^(TELEFONES|ENDERECOS|EMAILS|EMPRESAS|PARENTES|VEÍCULOS|VEICULOS|BANCOS|EMPREGOS):\s*\(\s*(\d+)/i);
    if (sectionMatch) {
      currentArrayKey = sectionMatch[1].toLowerCase().replace("í", "i");
      continue;
    }
    
    // Check for list items (starting with •)
    if (trimmedLine.startsWith("•")) {
      const itemValue = trimmedLine.substring(1).trim();
      if (currentArrayKey && arrays[currentArrayKey] && itemValue) {
        arrays[currentArrayKey].push(itemValue);
      }
      continue;
    }
    
    // Check for "INTERESSES PESSOAIS:" section
    if (trimmedLine.includes("INTERESSES PESSOAIS")) {
      currentArrayKey = null;
      continue;
    }
    
    // Check for interest items like "- Turismo: Não"
    if (trimmedLine.startsWith("-") && trimmedLine.includes(":")) {
      const interestMatch = trimmedLine.match(/^-\s*([^:]+):\s*(.+)$/);
      if (interestMatch) {
        const interestKey = `interesse_${interestMatch[1].toLowerCase().replace(/\s+/g, "_")}`;
        result[interestKey] = interestMatch[2].trim();
      }
      continue;
    }

    // Parse key-value pairs with ⎯ separator (most common in this API)
    const dashMatch = trimmedLine.match(/^([A-ZÀ-Úa-zà-ú\s]+)\s*⎯\s*(.*)$/);
    if (dashMatch) {
      currentArrayKey = null;
      const rawKey = dashMatch[1].trim();
      const normalizedKey = applyAlias(rawKey);
      const value = dashMatch[2].trim();
      if (value && value !== "-" && !value.toLowerCase().includes("não informad") && value !== "SEM INFORMAÇÃO") {
        result[normalizedKey] = value;
      }
      continue;
    }

    // Parse key-value with colon separator
    const colonMatch = trimmedLine.match(/^([^:⎯—=>]+)[:\s⎯—=>]+\s*(.*)$/);
    if (colonMatch) {
      currentArrayKey = null;
      const rawKey = colonMatch[1].trim();
      const normalizedKey = applyAlias(rawKey);
      const value = colonMatch[2].trim();
      if (value && value !== "-" && !value.toLowerCase().includes("não informad") && value !== "SEM INFORMAÇÃO") {
        result[normalizedKey] = value;
      }
    }
  }

  // Add non-empty arrays to result
  for (const [key, arr] of Object.entries(arrays)) {
    if (arr.length > 0) {
      result[key] = arr;
    }
  }

  return result;
}

// Categorize data into sections
function categorizeData(data: Record<string, any>): Record<string, Record<string, any>> {
  const categorized: Record<string, Record<string, any>> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    
    const keyLower = key.toLowerCase();
    if (keyLower.includes("foto") || keyLower.includes("base64") || keyLower.includes("image")) {
      continue;
    }
    
    if (typeof value === "string" && (value.startsWith("/9j/") || value.startsWith("iVBOR"))) {
      continue;
    }

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

// Get field emoji
function getFieldEmoji(key: string): string {
  const normalized = key.toLowerCase().replace(/\s+/g, "_");
  return fieldEmojis[normalized] || "📌";
}

// Get field label
function getFieldLabel(key: string): string {
  const normalized = key.toLowerCase().replace(/\s+/g, "_");
  return fieldLabels[normalized] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
}

// Format value
function formatValue(value: any): string {
  if (value === null || value === undefined || value === "" || value === "-") {
    return "❌";
  }
  if (typeof value === "boolean") {
    return value ? "SIM" : "NÃO";
  }
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === "object" && item !== null) {
        return Object.entries(item)
          .filter(([, v]) => v !== null && v !== undefined && v !== "")
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
      }
      return String(item);
    }).join(", ");
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");
  }
  const strValue = String(value);
  if (strValue.toLowerCase().includes("não informad")) {
    return "❌";
  }
  return strValue.toUpperCase();
}

// Generate copy text for a category
function generateCategoryCopyText(category: string, fields: Record<string, any>): string {
  const config = categoryConfig[category] || { emoji: "📋", title: category.toUpperCase() };
  const lines: string[] = [];
  
  lines.push(`${config.emoji} ${config.title}`);
  lines.push("");

  for (const [key, value] of Object.entries(fields)) {
    const emoji = getFieldEmoji(key);
    const label = getFieldLabel(key);
    const formatted = formatValue(value);
    
    if (Array.isArray(value) && value.length > 0) {
      lines.push(`- ${label.toUpperCase()} -`);
      value.forEach((item, idx) => {
        lines.push(`${idx} => ${String(item)}`);
      });
    } else {
      lines.push(`${emoji} ${label}: ${formatted}`);
    }
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
  const config = categoryConfig[category] || { emoji: "📋", title: category.toUpperCase().replace(/_/g, " ") };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateCategoryCopyText(category, fields));
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
      className="rounded-lg border border-cyan-900/60 bg-[#0d1117] overflow-hidden"
    >
      {/* Copy button */}
      <div className="px-3 py-1.5 border-b border-cyan-900/40">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-5 px-2 text-[10px] text-cyan-600 hover:text-cyan-400 hover:bg-transparent p-0"
        >
          {copied ? <Check className="h-3 w-3 mr-1" /> : null}
          {copied ? "copiado!" : "copiar"}
        </Button>
      </div>

      {/* Category Header */}
      <div className="px-3 py-2 border-b border-cyan-900/40 bg-[#161b22]">
        <span className="font-mono text-sm text-cyan-300 font-medium">
          {config.emoji} {config.title}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 font-mono text-[13px] leading-relaxed space-y-1">
        {Object.entries(fields).map(([key, value]) => {
          const emoji = getFieldEmoji(key);
          const label = getFieldLabel(key);
          const formatted = formatValue(value);

          // Handle arrays
          if (Array.isArray(value) && value.length > 0) {
            return (
              <div key={key} className="space-y-0.5">
                <div className="text-cyan-500 text-xs">- {label.toUpperCase()} -</div>
                {value.map((item, itemIdx) => (
                  <div key={itemIdx} className="text-cyan-100 pl-2">
                    {itemIdx} {'=>'} {String(item).toUpperCase()}
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div key={key} className="text-cyan-100">
              <span>{emoji} </span>
              <span className="text-cyan-400">{label}:</span>
              <span className="text-cyan-50"> {formatted}</span>
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

  // Check for errors at various nesting levels
  const errorMessage = 
    result.error || 
    result.data?.error || 
    (result.success === false && result.data?.error) ||
    (result.status && result.status >= 400 && result.data?.error);

  // Handle error response
  if (errorMessage) {
    const errorStr = String(errorMessage);
    const is404 = errorStr.includes("404") || result.status === 404;
    const is500 = errorStr.includes("500") || result.status === 500;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex flex-col gap-3 p-4 rounded-lg border font-mono",
          is404 
            ? "bg-amber-500/10 border-amber-500/30" 
            : "bg-destructive/10 border-destructive/30",
          className
        )}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className={cn(
            "h-5 w-5 shrink-0",
            is404 ? "text-amber-500" : "text-destructive"
          )} />
          <span className={cn(
            "text-sm",
            is404 ? "text-amber-400" : "text-destructive"
          )}>
            {is404 ? "🔍 Nenhum dado encontrado para esta consulta" : errorStr}
          </span>
        </div>
        {is500 && (
          <span className="text-muted-foreground text-xs">
            ⚠️ O servidor externo está temporariamente indisponível. Tente novamente em alguns minutos.
          </span>
        )}
        {is404 && (
          <span className="text-muted-foreground text-xs">
            💡 Verifique se os dados inseridos estão corretos ou tente outro tipo de consulta.
          </span>
        )}
      </motion.div>
    );
  }

  // Extract photo if available
  const photoUrl = extractPhoto(result);
  
  const extractedData = extractData(result);
  const categorizedData = categorizeData(extractedData);

  const nonEmptyCategories = Object.entries(categorizedData).filter(
    ([_, fields]) => Object.keys(fields).length > 0
  );

  const categoryOrder = [
    "dados_pessoais",
    "dados_familiares",
    "dados_tse",
    "dados_score",
    "dados_renda",
    "dados_contato",
    "dados_moradia",
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
      const allText = sortedCategories
        .map(([cat, fields]) => generateCategoryCopyText(cat, fields))
        .join("\n\n");
      await navigator.clipboard.writeText(allText);
      setCopiedAll(true);
      toast.success("Resultado completo copiado!");
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {
      toast.error("Erro ao copiar");
    }
  };

  const handleDownloadPhoto = () => {
    if (!photoUrl) return;
    const link = document.createElement("a");
    link.href = photoUrl;
    link.download = `foto_${extractedData.cpf || extractedData.valor_consulta || "resultado"}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Foto baixada!");
  };

  if (sortedCategories.length === 0 && !photoUrl) {
    return (
      <div className={cn("text-muted-foreground text-center py-4 font-mono", className)}>
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
      {/* Photo Display */}
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

      {/* Copy All Button */}
      {showCopyButton && sortedCategories.length > 0 && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            className="gap-2 text-xs border-cyan-900/50 bg-[#0d1117] hover:bg-cyan-950/30 text-cyan-400"
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
      {sortedCategories.length > 0 && (
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
      )}
    </motion.div>
  );
}
