import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface QueryData {
  queryType?: string;
  queryInput?: string;
  data: Record<string, unknown>;
  userName?: string;
  botName?: string;
  photoBase64?: string;
}

// Field labels in Portuguese
const fieldLabels: Record<string, string> = {
  nome: "Nome",
  cpf: "CPF",
  nascimento: "Data de Nascimento",
  data_nascimento: "Data de Nascimento",
  data_de_nascimento: "Data de Nascimento",
  sexo: "Sexo",
  mae: "Nome da Mãe",
  nome_mae: "Nome da Mãe",
  nome_da_mae: "Nome da Mãe",
  pai: "Nome do Pai",
  nome_pai: "Nome do Pai",
  nome_do_pai: "Nome do Pai",
  rg: "RG",
  cnh: "CNH",
  pis: "PIS",
  nis: "NIS",
  cns: "CNS",
  titulo_eleitor: "Título de Eleitor",
  titulo: "Título de Eleitor",
  zona: "Zona Eleitoral",
  secao: "Seção",
  email: "E-mail",
  telefone: "Telefone",
  celular: "Celular",
  endereco: "Endereço",
  logradouro: "Logradouro",
  numero: "Número",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  uf: "UF",
  estado: "Estado",
  estado_encontrado: "Estado Encontrado",
  cep: "CEP",
  renda: "Renda Estimada",
  score: "Score",
  classe_social: "Classe Social",
  estado_civil: "Estado Civil",
  profissao: "Profissão",
  escolaridade: "Escolaridade",
  naturalidade: "Naturalidade",
  nacionalidade: "Nacionalidade",
  tipo_sanguineo: "Tipo Sanguíneo",
  obito: "Óbito",
  status_receita: "Status na Receita",
  placa: "Placa",
  chassi: "Chassi",
  renavam: "RENAVAM",
  marca: "Marca",
  modelo: "Modelo",
  ano: "Ano",
  cor: "Cor",
  cnpj: "CNPJ",
  razao_social: "Razão Social",
  nome_fantasia: "Nome Fantasia",
  idade: "Idade",
  raca: "Raça",
  signo: "Signo",
};

// Category mapping with priority order
const categoryOrder = [
  "DADOS PESSOAIS",
  "DOCUMENTOS", 
  "CONTATO",
  "ENDEREÇO",
  "FINANCEIRO",
  "FAMÍLIA",
  "PROFISSIONAL",
  "VEÍCULO",
  "EMPRESA",
  "OUTROS"
];

const categories: Record<string, string[]> = {
  "DADOS PESSOAIS": ["nome", "cpf", "nascimento", "data_nascimento", "data_de_nascimento", "sexo", "idade", "naturalidade", "nacionalidade", "raca", "tipo_sanguineo", "estado_civil", "obito", "status_receita", "signo"],
  "DOCUMENTOS": ["rg", "cnh", "pis", "nis", "cns", "titulo_eleitor", "titulo", "zona", "secao", "ctps"],
  "CONTATO": ["email", "emails", "telefone", "telefones", "celular", "whatsapp", "ddd"],
  "ENDEREÇO": ["endereco", "logradouro", "numero", "complemento", "bairro", "cidade", "uf", "estado", "estado_encontrado", "cep", "municipio"],
  "FINANCEIRO": ["renda", "score", "classe_social", "classe", "poder_aquisitivo", "bancos"],
  "FAMÍLIA": ["mae", "nome_mae", "nome_da_mae", "pai", "nome_pai", "nome_do_pai", "parentes", "conjuge", "filhos"],
  "PROFISSIONAL": ["profissao", "escolaridade", "emprego", "empregos", "cargo", "empresa"],
  "VEÍCULO": ["placa", "chassi", "renavam", "marca", "modelo", "ano", "cor", "combustivel", "tipo_veiculo"],
  "EMPRESA": ["cnpj", "razao_social", "nome_fantasia", "capital_social", "atividade", "porte"],
};

function getCategory(key: string): string {
  const keyLower = key.toLowerCase().replace(/\./g, '_');
  for (const [category, fields] of Object.entries(categories)) {
    if (fields.some(f => keyLower.includes(f) || keyLower === f)) {
      return category;
    }
  }
  return "OUTROS";
}

function getLabel(key: string): string {
  const keyLower = key.toLowerCase().replace(/\./g, '_');
  
  // Check exact match first
  if (fieldLabels[keyLower]) return fieldLabels[keyLower];
  
  // Check if key contains any known field
  for (const [field, label] of Object.entries(fieldLabels)) {
    if (keyLower.includes(field)) return label;
  }
  
  // Format key as readable label
  return key
    .replace(/_/g, " ")
    .replace(/\./g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// Keys to completely ignore
const ignoredKeys = [
  "comando", "valor", "error", "fotobase64", "foto", "image", "photo", "base64",
  "texto", "info", "text", "raw", "status", "success", "message",
  "sucesso", "protocolo", "usuario", "consumo_hoje", "consumo", "total_diario",
  "reset_em", "tipo", "inicio_uso", "vencimento", "tempo_restante",
  "tempo_restante_detalhado", "dias_totais_restantes", "dias_totais",
  "ddd", "classificacao", "modulo",
  "conta", "saldo", "tempo_segundos", "temposegundos", "cache", "cached_at",
  "expiracao", "duration_ms", "limites", "plano"
];

// Bot references to filter out
const botReferences = [
  "@querybuscasbot", "querybuscasbot", "t.me/querybuscas", 
  "https://t.me/querybuscas", "@QueryBuscasBot", "querybuscas"
];

function shouldIgnoreKey(key: string): boolean {
  const keyLower = key.toLowerCase();
  if (ignoredKeys.some(ik => keyLower === ik || keyLower.endsWith('.' + ik))) return true;
  if (keyLower.endsWith('_consultada')) return true;
  return false;
}

function shouldIgnoreValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "" || value === "-" || value === "N/A") {
    return true;
  }
  
  if (typeof value === "string") {
    // Skip base64 data
    if (value.startsWith("/9j/") || value.startsWith("iVBOR") || value.startsWith("data:image")) {
      return true;
    }
    // Skip bot references
    const valueLower = value.toLowerCase();
    if (botReferences.some(ref => valueLower.includes(ref.toLowerCase()))) {
      return true;
    }
    // Skip very short meaningless values
    if (value.trim().length < 2) {
      return true;
    }
  }
  
  return false;
}

// Parse "NOME ⎯ VALOR" format from keys
function parseDelimitedKey(key: string): { realKey: string; realValue: string } | null {
  const delimiters = [' ⎯ ', ' — ', ': '];
  for (const delim of delimiters) {
    const idx = key.indexOf(delim);
    if (idx > 0) {
      const realKey = key.substring(0, idx).trim().toLowerCase().replace(/\s+/g, '_');
      const realValue = key.substring(idx + delim.length).trim();
      if (realKey && realValue && realValue !== '-' && realValue !== 'N/A') {
        return { realKey, realValue };
      }
    }
  }
  return null;
}

// Parse string data with multiple lines
function parseStringData(str: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!str || typeof str !== "string") return result;
  
  const lines = str.split('\n');
  
  for (const line of lines) {
    const delimiters = [' ⎯ ', ' — ', ': ', ' - '];
    
    for (const delim of delimiters) {
      const idx = line.indexOf(delim);
      if (idx > 0) {
        const key = line.substring(0, idx).trim()
          .replace(/^[•\-\s📛🆔👤📅🏠📍💰👨‍👩‍👧‍👦📞📧]+/, '')
          .toLowerCase()
          .replace(/\s+/g, '_');
        const value = line.substring(idx + delim.length).trim();
        
        if (key && value && value !== '-' && value !== 'N/A' && !shouldIgnoreValue(value)) {
          result[key] = value;
        }
        break;
      }
    }
  }
  
  return result;
}

// Recursively extract all data into flat key-value pairs
function extractAllData(obj: unknown, prefix = ""): Array<{ key: string; value: string }> {
  const items: Array<{ key: string; value: string }> = [];
  
  if (!obj || typeof obj !== "object") return items;
  
  const record = obj as Record<string, unknown>;
  
  for (const [key, value] of Object.entries(record)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    // Skip ignored keys
    if (shouldIgnoreKey(key)) continue;
    
    // Check if key contains embedded value (NexFuture format)
    const parsed = parseDelimitedKey(key);
    if (parsed && !shouldIgnoreValue(parsed.realValue)) {
      items.push({ key: parsed.realKey, value: parsed.realValue });
      continue;
    }
    
    // Skip ignored values
    if (shouldIgnoreValue(value)) continue;
    
    // Handle string values (might be formatted text or JSON)
    if (typeof value === "string") {
      // Try to parse JSON strings
      const trimmed = value.trim();
      if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
        try {
          const parsed = JSON.parse(trimmed);
          if (typeof parsed === 'object' && parsed !== null) {
            items.push(...extractAllData(parsed, prefix));
            continue;
          }
        } catch { /* not valid JSON, continue as string */ }
      }
      // Check if it's multi-line formatted data
      if (value.includes('\n') && value.includes(':')) {
        const parsedLines = parseStringData(value);
        for (const [pk, pv] of Object.entries(parsedLines)) {
          if (!shouldIgnoreKey(pk) && !shouldIgnoreValue(pv)) {
            items.push({ key: pk, value: pv });
          }
        }
      } else {
        items.push({ key: fullKey, value: value });
      }
      continue;
    }
    
    // Handle nested objects
    if (typeof value === "object" && !Array.isArray(value)) {
      items.push(...extractAllData(value, fullKey));
      continue;
    }
    
    // Handle arrays
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (shouldIgnoreValue(item)) continue;
        if (typeof item === "object" && item !== null) {
          // Recursively extract each object in the array
          const arrayPrefix = value.length > 1 ? `${fullKey}_${i + 1}` : fullKey;
          items.push(...extractAllData(item, arrayPrefix));
        } else if (typeof item === "string") {
          items.push({ key: fullKey, value: item });
        } else {
          items.push({ key: fullKey, value: String(item) });
        }
      }
      continue;
    }
    
    // Handle other primitives
    items.push({ key: fullKey, value: String(value) });
  }
  
  return items;
}

// WinAnsi (code page 1252) safe character set for pdf-lib StandardFonts.
// Any character outside this range will crash drawText, so we aggressively
// transliterate accented chars and strip everything else.
function sanitizeText(text: string): string {
  if (!text) return '';

  // Step 1: Normalize Unicode and transliterate common accented characters
  let result = text
    // Latin accented → ASCII
    .replace(/[àáâãäåāăą]/gi, (m) => m === m.toUpperCase() ? 'A' : 'a')
    .replace(/[èéêëēĕėęě]/gi, (m) => m === m.toUpperCase() ? 'E' : 'e')
    .replace(/[ìíîïīĭįı]/gi, (m) => m === m.toUpperCase() ? 'I' : 'i')
    .replace(/[òóôõöōŏő]/gi, (m) => m === m.toUpperCase() ? 'O' : 'o')
    .replace(/[ùúûüūŭůűų]/gi, (m) => m === m.toUpperCase() ? 'U' : 'u')
    .replace(/[çćĉċč]/gi, (m) => m === m.toUpperCase() ? 'C' : 'c')
    .replace(/[ñńņň]/gi, (m) => m === m.toUpperCase() ? 'N' : 'n')
    .replace(/[ýÿŷ]/gi, (m) => m === m.toUpperCase() ? 'Y' : 'y')
    .replace(/[šśŝş]/gi, (m) => m === m.toUpperCase() ? 'S' : 's')
    .replace(/[žźż]/gi, (m) => m === m.toUpperCase() ? 'Z' : 'z')
    .replace(/[đ]/gi, (m) => m === m.toUpperCase() ? 'D' : 'd')
    .replace(/[ğ]/gi, (m) => m === m.toUpperCase() ? 'G' : 'g')
    .replace(/[ř]/gi, (m) => m === m.toUpperCase() ? 'R' : 'r')
    .replace(/[ť]/gi, (m) => m === m.toUpperCase() ? 'T' : 't')
    .replace(/[łĺļľ]/gi, (m) => m === m.toUpperCase() ? 'L' : 'l')
    // Ligatures
    .replace(/[æ]/gi, 'ae')
    .replace(/[œ]/gi, 'oe')
    .replace(/[ß]/g, 'ss')
    // Dashes and quotes
    .replace(/[—–⎯―‒]/g, '-')
    .replace(/[''‚]/g, "'")
    .replace(/[""„]/g, '"')
    .replace(/[…]/g, '...')
    .replace(/[•·]/g, '-')
    .replace(/[\u00A0]/g, ' '); // non-breaking space

  // Step 2: NFD decomposition to strip remaining combining marks
  result = result.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Step 3: Keep ONLY printable ASCII (0x20-0x7E) plus tab and newline.
  // This is the safest approach — WinAnsi is a superset of ASCII but
  // rather than risk edge cases we stick to pure ASCII.
  result = result.replace(/[^\x20-\x7E\t\n\r]/g, '');

  return result;
}

// Extract photo from data object
function extractPhotoBase64(data: Record<string, unknown>): string | null {
  const photoKeys = ["fotobase64", "foto", "image", "photo", "base64", "fotoBase64", "photoBase64"];
  
  const findPhoto = (obj: unknown, depth = 0): string | null => {
    if (!obj || typeof obj !== "object" || depth > 5) return null;
    
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const keyLower = key.toLowerCase();
      
      // Check if this key is a photo key
      if (photoKeys.some(pk => keyLower.includes(pk))) {
        if (typeof value === "string" && value.length > 100) {
          return value;
        }
      }
      
      // Check if value looks like base64 image
      if (typeof value === "string" && value.length > 100) {
        if (value.startsWith("/9j/") || value.startsWith("iVBOR") || value.startsWith("data:image")) {
          return value;
        }
      }
      
      // Recurse into nested objects
      if (typeof value === "object" && value !== null) {
        const found = findPhoto(value, depth + 1);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findPhoto(data);
}

// Word wrap for long text
function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  
  return lines;
}

async function generatePDF(queryData: QueryData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 50;
  const lineHeight = 16;
  const contentWidth = pageWidth - 2 * margin;
  const labelWidth = 140;
  const valueMaxChars = 55; // Max chars per line for values

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  
  // Extract photo
  const photoBase64 = queryData.photoBase64 || extractPhotoBase64(queryData.data);
  let photoEmbedded = false;
  let photoHeight = 0;

  const addPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  };

  const checkNewPage = (neededHeight: number) => {
    if (y - neededHeight < margin) {
      addPage();
    }
  };

  // Header
  page.drawRectangle({
    x: 0,
    y: pageHeight - 80,
    width: pageWidth,
    height: 80,
    color: rgb(0.15, 0.15, 0.2),
  });

  page.drawText(sanitizeText("RELATORIO DE CONSULTA"), {
    x: margin,
    y: pageHeight - 50,
    size: 22,
    font: fontBold,
    color: rgb(0.96, 0.76, 0.1),
  });

  const queryLabel = queryData.queryType?.toUpperCase() || "DADOS";
  const queryInput = queryData.queryInput || "";
  page.drawText(sanitizeText(`${queryLabel}: ${queryInput}`), {
    x: margin,
    y: pageHeight - 70,
    size: 11,
    font: font,
    color: rgb(0.8, 0.8, 0.8),
  });

  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  page.drawText(`Gerado em: ${dateStr}`, {
    x: pageWidth - margin - 150,
    y: pageHeight - 70,
    size: 9,
    font: font,
    color: rgb(0.7, 0.7, 0.7),
  });

  y = pageHeight - 100;
  
  // Add photo if available (only once, in top right)
  if (photoBase64) {
    try {
      let cleanBase64 = photoBase64;
      if (cleanBase64.startsWith("data:image")) {
        cleanBase64 = cleanBase64.split(",")[1];
      }
      
      const photoBytes = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0));
      
      let embeddedImage;
      try {
        embeddedImage = await pdfDoc.embedJpg(photoBytes);
      } catch {
        try {
          embeddedImage = await pdfDoc.embedPng(photoBytes);
        } catch (e) {
          console.log("Could not embed image:", e);
        }
      }
      
      if (embeddedImage) {
        const maxWidth = 120;
        const maxHeight = 150;
        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;
        
        let drawWidth = maxWidth;
        let drawHeight = (imgHeight / imgWidth) * drawWidth;
        
        if (drawHeight > maxHeight) {
          drawHeight = maxHeight;
          drawWidth = (imgWidth / imgHeight) * drawHeight;
        }
        
        const photoX = pageWidth - margin - drawWidth;
        const photoY = y - drawHeight - 10;
        
        // Photo border
        page.drawRectangle({
          x: photoX - 4,
          y: photoY - 4,
          width: drawWidth + 8,
          height: drawHeight + 8,
          borderColor: rgb(0.3, 0.3, 0.35),
          borderWidth: 1.5,
          color: rgb(0.98, 0.98, 0.98),
        });
        
        page.drawImage(embeddedImage, {
          x: photoX,
          y: photoY,
          width: drawWidth,
          height: drawHeight,
        });
        
        photoEmbedded = true;
        photoHeight = drawHeight + 30;
        
        console.log("Photo embedded successfully");
      }
    } catch (e) {
      console.log("Error embedding photo:", e);
    }
  }

  // Extract and organize data
  const items = extractAllData(queryData.data);
  console.log(`Extracted ${items.length} data items`);
  
  // Remove duplicates (keep first occurrence)
  const seen = new Set<string>();
  const uniqueItems = items.filter(item => {
    const keyNorm = item.key.toLowerCase().replace(/\./g, '_');
    if (seen.has(keyNorm)) return false;
    seen.add(keyNorm);
    return true;
  });
  
  // Group by category
  const grouped: Record<string, Array<{ key: string; value: string }>> = {};
  for (const item of uniqueItems) {
    const cat = getCategory(item.key);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  // Sub-group labels for numbered items
  const subGroupLabels: Record<string, string> = {
    "ENDEREÇO": "Endereco",
    "CONTATO": "Contato",
    "FAMÍLIA": "Familiar",
    "PROFISSIONAL": "Emprego",
    "VEÍCULO": "Veiculo",
    "EMPRESA": "Empresa",
  };

  // Detect numbered sub-groups within category items
  // Keys like "enderecos_1.logradouro", "enderecos_2.logradouro" or "telefones_1", "telefones_2"
  function organizeIntoSubGroups(catItems: Array<{ key: string; value: string }>, category: string): Array<{ subHeader: string | null; items: Array<{ key: string; value: string }> }> {
    const groups: Array<{ subHeader: string | null; items: Array<{ key: string; value: string }> }> = [];
    const ungrouped: Array<{ key: string; value: string }> = [];
    const numbered: Record<number, Array<{ key: string; value: string }>> = {};
    
    // Detect pattern: key contains _N. or ends with _N (where N is a number)
    const numberPattern = /[_.](\d+)(?:\.|$)/;
    
    for (const item of catItems) {
      const match = item.key.match(numberPattern);
      if (match) {
        const num = parseInt(match[1]);
        if (num >= 1 && num <= 50) {
          if (!numbered[num]) numbered[num] = [];
          numbered[num].push(item);
          continue;
        }
      }
      ungrouped.push(item);
    }
    
    const numKeys = Object.keys(numbered).map(Number).sort((a, b) => a - b);
    
    // If we have numbered groups, organize them
    if (numKeys.length > 0) {
      // First add ungrouped items (no sub-header)
      if (ungrouped.length > 0) {
        groups.push({ subHeader: null, items: ungrouped });
      }
      
      const label = subGroupLabels[category] || category;
      for (const num of numKeys) {
        groups.push({
          subHeader: `${label} ${num}`,
          items: numbered[num],
        });
      }
    } else {
      // No numbered groups, just return all items without sub-headers
      groups.push({ subHeader: null, items: catItems });
    }
    
    return groups;
  }

  // Adjust content width if photo is present
  const effectiveContentWidth = photoEmbedded ? contentWidth - 140 : contentWidth;
  const effectiveMaxChars = photoEmbedded ? 40 : valueMaxChars;

  // Draw categories in order
  for (const category of categoryOrder) {
    const catItems = grouped[category];
    if (!catItems || catItems.length === 0) continue;

    checkNewPage(60);

    // Reset to full width after photo section
    if (photoEmbedded && y < (pageHeight - 100 - photoHeight)) {
      photoEmbedded = false;
    }

    // Category header
    y -= 20;
    page.drawRectangle({
      x: margin,
      y: y - 3,
      width: photoEmbedded ? effectiveContentWidth : contentWidth,
      height: 20,
      color: rgb(0.2, 0.2, 0.25),
    });

    page.drawText(sanitizeText(category), {
      x: margin + 8,
      y: y + 2,
      size: 11,
      font: fontBold,
      color: rgb(0.96, 0.76, 0.1),
    });

    y -= 25;

    // Organize items into sub-groups
    const subGroups = organizeIntoSubGroups(catItems, category);

    for (const subGroup of subGroups) {
      // Draw sub-header if present
      if (subGroup.subHeader) {
        checkNewPage(30);
        y -= 5;
        
        // Draw sub-header line
        page.drawLine({
          start: { x: margin + 10, y: y + 8 },
          end: { x: margin + (photoEmbedded ? effectiveContentWidth - 10 : contentWidth - 10), y: y + 8 },
          thickness: 0.5,
          color: rgb(0.75, 0.75, 0.75),
        });
        
        try {
          page.drawText(sanitizeText(subGroup.subHeader), {
            x: margin + 12,
            y: y - 5,
            size: 9,
            font: fontBold,
            color: rgb(0.3, 0.3, 0.5),
          });
        } catch { /* skip */ }
        
        y -= 18;
      }

      // Draw items
      for (const item of subGroup.items) {
        // Clean up the key: remove numbered prefix for display
        const rawKey = item.key.split(".").pop() || item.key;
        // Remove trailing _N from the display label
        const cleanKey = rawKey.replace(/_\d+$/, '');
        const label = getLabel(cleanKey);
        const sanitizedValue = sanitizeText(item.value);
        
        // Word wrap long values
        const maxChars = photoEmbedded ? effectiveMaxChars : valueMaxChars;
        const valueLines = sanitizedValue.length > maxChars 
          ? wrapText(sanitizedValue, maxChars) 
          : [sanitizedValue];
        
        const neededHeight = valueLines.length * lineHeight + 5;
        checkNewPage(neededHeight);

        // Label
        try {
          page.drawText(sanitizeText(label + ":"), {
            x: margin + 10,
            y: y,
            size: 9,
            font: fontBold,
            color: rgb(0.4, 0.4, 0.4),
          });
        } catch {
          try {
            const safeLabel = (label + ":").replace(/[^\x20-\x7E]/g, '');
            page.drawText(safeLabel || 'Campo:', {
              x: margin + 10,
              y: y,
              size: 9,
              font: fontBold,
              color: rgb(0.4, 0.4, 0.4),
            });
          } catch { /* skip */ }
        }

        // Value
        for (let i = 0; i < valueLines.length; i++) {
          try {
            page.drawText(valueLines[i], {
              x: margin + labelWidth,
              y: y - (i * lineHeight),
              size: 10,
              font: font,
              color: rgb(0.1, 0.1, 0.1),
            });
          } catch {
            const safeText = valueLines[i].replace(/[^\x20-\x7E]/g, '');
            try {
              page.drawText(safeText || '(dados indisponiveis)', {
                x: margin + labelWidth,
                y: y - (i * lineHeight),
                size: 10,
                font: font,
                color: rgb(0.1, 0.1, 0.1),
              });
            } catch { /* skip */ }
          }
        }

        y -= neededHeight;
      }
    }

    y -= 10;
  }

  // Footer on last page
  const footerY = 35;
  page.drawLine({
    start: { x: margin, y: footerY + 12 },
    end: { x: pageWidth - margin, y: footerY + 12 },
    thickness: 0.5,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText("Documento Oficial - Uso Restrito", {
    x: margin,
    y: footerY,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText(dateStr, {
    x: pageWidth - margin - 100,
    y: footerY,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // 🔒 Auth obrigatória: aceita JWT de usuário OU service_role
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  const serviceRoleKey = Deno.env.get("HUB_SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (token !== serviceRoleKey) {
    try {
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.57.4");
      const sb = createClient(
        Deno.env.get("HUB_SUPABASE_URL")!,
        Deno.env.get("HUB_SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      );
      const { data, error } = await sb.auth.getClaims(token);
      if (error || !data?.claims?.sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } catch {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }



  try {
    const body: QueryData = await req.json();
    console.log("=== PDF Generation Request ===");
    console.log("Query type:", body.queryType);
    console.log("Query input:", body.queryInput);
    console.log("Data keys:", Object.keys(body.data || {}));
    console.log("Data preview:", JSON.stringify(body.data).substring(0, 800));

    if (!body.data) {
      return new Response(
        JSON.stringify({ error: "Dados nao fornecidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pdfBytes = await generatePDF(body);
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));

    console.log("PDF generated successfully, size:", pdfBytes.length);

    return new Response(
      JSON.stringify({
        success: true,
        pdf: base64Pdf,
        filename: `consulta_${body.queryType || "dados"}_${body.queryInput || Date.now()}.pdf`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err as Error;
    console.error("PDF generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro ao gerar PDF" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
