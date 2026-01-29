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

// Flatten nested objects
function flattenData(obj: unknown, prefix = ""): Array<{ key: string; value: string }> {
  const items: Array<{ key: string; value: string }> = [];
  if (!obj || typeof obj !== "object") return items;

  const ignoredKeys = ["comando", "valor", "error", "fotobase64", "foto", "image", "photo", "base64", "data", "texto"];

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const keyLower = key.toLowerCase();
    if (ignoredKeys.includes(keyLower)) continue;
    if (value === null || value === undefined || value === "" || value === "-") continue;
    
    // Skip base64 data
    if (typeof value === "string" && (value.startsWith("/9j/") || value.startsWith("iVBOR") || value.startsWith("data:image"))) continue;

    if (typeof value === "object" && !Array.isArray(value)) {
      items.push(...flattenData(value, prefix ? `${prefix}.${key}` : key));
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        const strValues = value.map(v => typeof v === "string" ? v : JSON.stringify(v)).join(", ");
        items.push({ key: prefix ? `${prefix}.${key}` : key, value: strValues });
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

  const botName = queryData.botName || "Sistema de Consultas";
  page.drawText(sanitizeText(`Documento gerado por ${botName}`), {
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

    if (!body.data) {
      return new Response(
        JSON.stringify({ error: "Dados nao fornecidos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pdfBytes = await generatePDF(body);
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
