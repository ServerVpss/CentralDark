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
  sexo: "Sexo",
  mae: "Nome da Mãe",
  nome_mae: "Nome da Mãe",
  pai: "Nome do Pai",
  nome_pai: "Nome do Pai",
  rg: "RG",
  cnh: "CNH",
  pis: "PIS",
  nis: "NIS",
  cns: "CNS",
  titulo_eleitor: "Título de Eleitor",
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
};

// Category mapping
const categories: Record<string, string[]> = {
  "DADOS PESSOAIS": ["nome", "cpf", "nascimento", "data_nascimento", "sexo", "idade", "naturalidade", "nacionalidade", "raca", "tipo_sanguineo", "estado_civil", "obito", "status_receita"],
  "DOCUMENTOS": ["rg", "cnh", "pis", "nis", "cns", "titulo_eleitor", "zona", "secao", "ctps"],
  "CONTATO": ["email", "emails", "telefone", "telefones", "celular", "whatsapp"],
  "ENDEREÇO": ["endereco", "logradouro", "numero", "complemento", "bairro", "cidade", "uf", "estado", "cep", "municipio"],
  "FINANCEIRO": ["renda", "score", "classe_social", "classe", "poder_aquisitivo", "bancos"],
  "FAMÍLIA": ["mae", "nome_mae", "pai", "nome_pai", "parentes", "conjuge", "filhos"],
  "PROFISSIONAL": ["profissao", "escolaridade", "emprego", "empregos", "cargo", "empresa"],
  "VEÍCULO": ["placa", "chassi", "renavam", "marca", "modelo", "ano", "cor", "combustivel", "tipo_veiculo"],
  "EMPRESA": ["cnpj", "razao_social", "nome_fantasia", "capital_social", "atividade", "porte"],
};

function getCategory(key: string): string {
  const keyLower = key.toLowerCase();
  for (const [category, fields] of Object.entries(categories)) {
    if (fields.some(f => keyLower.includes(f))) {
      return category;
    }
  }
  return "OUTROS";
}

function getLabel(key: string): string {
  const keyLower = key.toLowerCase();
  return fieldLabels[keyLower] || key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// Parse object keys in format "NOME ⎯ VALOR" from NexFuture
function parseObjectWithDelimitedKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const delimiters = [' ⎯ ', ' — ', ': ', ' - '];
  
  for (const [key, value] of Object.entries(obj)) {
    // Se a chave contém delimitador, extrair key/value dela
    let parsed = false;
    for (const delim of delimiters) {
      const idx = key.indexOf(delim);
      if (idx > 0) {
        const realKey = key.substring(0, idx).trim().toLowerCase().replace(/\s+/g, '_');
        const realValue = key.substring(idx + delim.length).trim();
        if (realKey && realValue) {
          result[realKey] = realValue;
          parsed = true;
          break;
        }
      }
    }
    
    // Se não foi parsed da chave, e valor é string/número válido, usar normalmente
    if (!parsed && value !== null && value !== undefined && value !== '') {
      // Se é o campo "data" com string formatada, parsear
      if (key.toLowerCase() === 'data' && typeof value === 'string') {
        const parsedData = parseStringData(value);
        Object.assign(result, parsedData);
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursão para objetos aninhados
        const nested = parseObjectWithDelimitedKeys(value as Record<string, unknown>);
        Object.assign(result, nested);
      } else {
        result[key.toLowerCase().replace(/\s+/g, '_')] = value;
      }
    }
  }
  
  return result;
}

// Flatten nested objects
function flattenData(obj: unknown, prefix = ""): Array<{ key: string; value: string }> {
  const items: Array<{ key: string; value: string }> = [];
  if (!obj || typeof obj !== "object") return items;

  // Keys to ignore - remove photo keys as we handle them separately
  const ignoredKeys = ["comando", "valor", "error", "fotobase64", "foto", "image", "photo", "base64"];
  
  // Bot references to filter out
  const botReferences = ["@querybuscasbot", "querybuscasbot", "t.me/querybuscas", "https://t.me/querybuscas", "@QueryBuscasBot"];

  // Primeiro, verificar se precisa parsear chaves delimitadas
  let processedObj = obj as Record<string, unknown>;
  const hasDelimitedKeys = Object.keys(processedObj).some(k => 
    k.includes(' ⎯ ') || k.includes(' — ') || k.includes(': ')
  );
  if (hasDelimitedKeys || (processedObj.data && typeof processedObj.data === 'string')) {
    processedObj = parseObjectWithDelimitedKeys(processedObj);
  }

  for (const [key, value] of Object.entries(processedObj)) {
    const keyLower = key.toLowerCase();
    if (ignoredKeys.includes(keyLower)) continue;
    if (value === null || value === undefined || value === "" || value === "-") continue;
    
    // Skip base64 data (handled separately for photo)
    if (typeof value === "string" && (value.startsWith("/9j/") || value.startsWith("iVBOR") || value.startsWith("data:image"))) continue;
    
    // Skip bot references
    if (typeof value === "string") {
      const valueLower = value.toLowerCase();
      if (botReferences.some(ref => valueLower.includes(ref.toLowerCase()))) continue;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      items.push(...flattenData(value, prefix ? `${prefix}.${key}` : key));
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        // Filter out bot references from arrays
        const filteredValues = value
          .filter(v => {
            if (typeof v === "string") {
              const vLower = v.toLowerCase();
              return !botReferences.some(ref => vLower.includes(ref.toLowerCase()));
            }
            return true;
          })
          .map(v => typeof v === "string" ? v : JSON.stringify(v));
        if (filteredValues.length > 0) {
          items.push({ key: prefix ? `${prefix}.${key}` : key, value: filteredValues.join(", ") });
        }
      }
    } else {
      items.push({ key: prefix ? `${prefix}.${key}` : key, value: String(value) });
    }
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
    .replace(/[—–⎯]/g, '-');
}

// Parse string data (formato NexFuture) para objeto
function parseStringData(str: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (!str || typeof str !== "string") return result;
  
  // Detectar múltiplas linhas
  const lines = str.split('\n');
  
  for (const line of lines) {
    // Tentar diferentes delimitadores: ":", "⎯", "—", "-"
    const delimiters = [' ⎯ ', ' — ', ': ', ' - '];
    let matched = false;
    
    for (const delim of delimiters) {
      const idx = line.indexOf(delim);
      if (idx > 0) {
        const key = line.substring(0, idx).trim()
          .replace(/^[•\-\s]+/, '') // Remover marcadores
          .toLowerCase()
          .replace(/\s+/g, '_');
        const value = line.substring(idx + delim.length).trim();
        
        if (key && value && value !== '-' && value !== 'N/A') {
          // Se já existe a chave, converter para array
          if (result[key]) {
            if (Array.isArray(result[key])) {
              (result[key] as string[]).push(value);
            } else {
              result[key] = [result[key] as string, value];
            }
          } else {
            result[key] = value;
          }
          matched = true;
          break;
        }
      }
    }
    
    // Se não encontrou delimitador, verificar se é um texto formatado simples
    if (!matched && line.trim()) {
      const cleanLine = line.trim().replace(/^[•\-\s]+/, '');
      if (cleanLine.length > 3 && !cleanLine.startsWith('===') && !cleanLine.startsWith('---')) {
        // Adicionar como campo "info" se não for header
        if (!result["info"]) result["info"] = [];
        (result["info"] as string[]).push(cleanLine);
      }
    }
  }
  
  return result;
}

// Extract photo from data object
function extractPhotoBase64(data: Record<string, unknown>): string | null {
  const photoKeys = ["fotobase64", "foto", "image", "photo", "base64", "fotoBase64"];
  
  const findPhoto = (obj: unknown): string | null => {
    if (!obj || typeof obj !== "object") return null;
    
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const keyLower = key.toLowerCase();
      
      // Check if this key is a photo key
      if (photoKeys.some(pk => keyLower.includes(pk))) {
        if (typeof value === "string" && value.length > 100) {
          return value;
        }
      }
      
      // Check if value looks like base64 image
      if (typeof value === "string" && (value.startsWith("/9j/") || value.startsWith("iVBOR") || value.startsWith("data:image"))) {
        return value;
      }
      
      // Recurse into nested objects
      if (typeof value === "object" && value !== null) {
        const found = findPhoto(value);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findPhoto(data);
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

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;
  
  // Try to extract photo from data or use provided photoBase64
  let photoBase64 = queryData.photoBase64 || extractPhotoBase64(queryData.data);

  const addPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  };

  const checkNewPage = (neededHeight: number) => {
    if (y - neededHeight < margin) {
      addPage();
    }
  };

  const drawText = (text: string, x: number, yPos: number, size: number, useFont = font, color = rgb(0.1, 0.1, 0.1)) => {
    // Sanitize and truncate long text
    const sanitized = sanitizeText(text);
    const maxWidth = contentWidth - (x - margin);
    const avgCharWidth = size * 0.5;
    const maxChars = Math.floor(maxWidth / avgCharWidth);
    const displayText = sanitized.length > maxChars ? sanitized.substring(0, maxChars - 3) + "..." : sanitized;
    
    page.drawText(displayText, { x, y: yPos, size, font: useFont, color });
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
  
  // Add photo if available
  if (photoBase64) {
    try {
      // Clean up base64 string
      let cleanBase64 = photoBase64;
      if (cleanBase64.startsWith("data:image")) {
        cleanBase64 = cleanBase64.split(",")[1];
      }
      
      // Decode base64 to bytes
      const photoBytes = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0));
      
      // Try to embed as JPEG first, then PNG
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
        // Calculate dimensions to fit nicely (max 150x180)
        const maxWidth = 150;
        const maxHeight = 180;
        const imgWidth = embeddedImage.width;
        const imgHeight = embeddedImage.height;
        
        let drawWidth = maxWidth;
        let drawHeight = (imgHeight / imgWidth) * drawWidth;
        
        if (drawHeight > maxHeight) {
          drawHeight = maxHeight;
          drawWidth = (imgWidth / imgHeight) * drawHeight;
        }
        
        // Draw photo frame
        const photoX = pageWidth - margin - drawWidth - 10;
        const photoY = y - drawHeight - 20;
        
        // Photo border
        page.drawRectangle({
          x: photoX - 5,
          y: photoY - 5,
          width: drawWidth + 10,
          height: drawHeight + 10,
          borderColor: rgb(0.3, 0.3, 0.35),
          borderWidth: 2,
          color: rgb(0.95, 0.95, 0.95),
        });
        
        // Draw the image
        page.drawImage(embeddedImage, {
          x: photoX,
          y: photoY,
          width: drawWidth,
          height: drawHeight,
        });
        
        // Add "FOTO" label
        page.drawText("FOTO", {
          x: photoX + drawWidth / 2 - 15,
          y: photoY - 18,
          size: 10,
          font: fontBold,
          color: rgb(0.4, 0.4, 0.4),
        });
        
        console.log("Photo embedded successfully");
      }
    } catch (e) {
      console.log("Error embedding photo:", e);
    }
  }

  // Parse data
  const items = flattenData(queryData.data);
  
  // Group by category
  const grouped: Record<string, Array<{ key: string; value: string }>> = {};
  for (const item of items) {
    const cat = getCategory(item.key);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  // Draw categories
  for (const [category, catItems] of Object.entries(grouped)) {
    if (catItems.length === 0) continue;

    checkNewPage(60);

    // Category header
    y -= 25;
    page.drawRectangle({
      x: margin,
      y: y - 5,
      width: contentWidth,
      height: 22,
      color: rgb(0.2, 0.2, 0.25),
    });

    page.drawText(sanitizeText(category), {
      x: margin + 10,
      y: y,
      size: 12,
      font: fontBold,
      color: rgb(0.96, 0.76, 0.1),
    });

    y -= 25;

    // Draw items
    for (const item of catItems) {
      checkNewPage(lineHeight + 5);

      const label = getLabel(item.key.split(".").pop() || item.key);
      
      drawText(`${label}:`, margin + 10, y, 10, fontBold, rgb(0.4, 0.4, 0.4));
      drawText(item.value, margin + 140, y, 10, font, rgb(0.1, 0.1, 0.1));

      y -= lineHeight;
    }

    y -= 10;
  }

  // Footer on last page
  const footerY = 40;
  page.drawLine({
    start: { x: margin, y: footerY + 15 },
    end: { x: pageWidth - margin, y: footerY + 15 },
    thickness: 1,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Generic footer without bot references
  page.drawText("Relatorio de Consulta - Documento Oficial", {
    x: margin,
    y: footerY,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  page.drawText("Documento confidencial - Uso restrito", {
    x: pageWidth - margin - 150,
    y: footerY,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: QueryData = await req.json();
    console.log("Generating PDF for query:", body.queryType, body.queryInput);
    console.log("Data received type:", typeof body.data);
    console.log("Data preview:", JSON.stringify(body.data).substring(0, 500));

    if (!body.data) {
      return new Response(
        JSON.stringify({ error: "Dados nao fornecidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Se data vier como string (formato NexFuture), tentar parsear
    let dataToProcess = body.data;
    if (typeof body.data === "string") {
      console.log("Data is a string, attempting to parse...");
      dataToProcess = parseStringData(body.data);
      console.log("Parsed data:", JSON.stringify(dataToProcess).substring(0, 300));
    }

    const pdfBytes = await generatePDF({ ...body, data: dataToProcess as Record<string, unknown> });
    const base64Pdf = btoa(String.fromCharCode(...pdfBytes));

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
