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
      const validItems = value
        .filter(v => !shouldIgnoreValue(v))
        .map(v => typeof v === "string" ? v : JSON.stringify(v));
      
      if (validItems.length > 0) {
        items.push({ key: fullKey, value: validItems.join(", ") });
      }
      continue;
    }
    
    // Handle other primitives
    items.push({ key: fullKey, value: String(value) });
  }
  
  return items;
}

// Remove accents and special characters for PDF compatibility
function sanitizeText(text: string): string {
  return text
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[ÀÁÂÃÄÅ]/g, 'A')
    .replace(/[ÈÉÊË]/g, 'E')
    .replace(/[ÌÍÎÏ]/g, 'I')
    .replace(/[ÒÓÔÕÖ]/g, 'O')
    .replace(/[ÙÚÛÜ]/g, 'U')
    .replace(/[Ç]/g, 'C')
    .replace(/[Ñ]/g, 'N')
    .replace(/[—–⎯]/g, '-')
    .replace(/[📛🆔👤📅🏠📍💰👨‍👩‍👧‍👦📞📧📄🗑️]/g, '');
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

    // Draw items
    for (const item of catItems) {
      const label = getLabel(item.key.split(".").pop() || item.key);
      const sanitizedValue = sanitizeText(item.value);
      
      // Word wrap long values
      const maxChars = photoEmbedded ? effectiveMaxChars : valueMaxChars;
      const valueLines = sanitizedValue.length > maxChars 
        ? wrapText(sanitizedValue, maxChars) 
        : [sanitizedValue];
      
      const neededHeight = valueLines.length * lineHeight + 5;
      checkNewPage(neededHeight);

      // Label
      page.drawText(sanitizeText(label + ":"), {
        x: margin + 10,
        y: y,
        size: 9,
        font: fontBold,
        color: rgb(0.4, 0.4, 0.4),
      });

      // Value (possibly multi-line)
      for (let i = 0; i < valueLines.length; i++) {
        page.drawText(valueLines[i], {
          x: margin + labelWidth,
          y: y - (i * lineHeight),
          size: 10,
          font: font,
          color: rgb(0.1, 0.1, 0.1),
        });
      }

      y -= neededHeight;
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
