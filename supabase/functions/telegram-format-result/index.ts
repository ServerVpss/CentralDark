import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// =============== TXT FIELD LABELS ===============
const txtFieldLabels: Record<string, string> = {
  nome: "Nome", cpf: "CPF", nascimento: "Data de Nascimento",
  data_nascimento: "Data de Nascimento", data_de_nascimento: "Data de Nascimento",
  sexo: "Sexo", idade: "Idade", mae: "Nome da Mãe", nome_mae: "Nome da Mãe",
  nome_da_mae: "Nome da Mãe", pai: "Nome do Pai", nome_pai: "Nome do Pai",
  nome_do_pai: "Nome do Pai", rg: "RG", cnh: "CNH", pis: "PIS", nis: "NIS",
  cns: "CNS", titulo_eleitor: "Título de Eleitor", titulo: "Título de Eleitor",
  zona: "Zona Eleitoral", secao: "Seção", email: "E-mail", telefone: "Telefone",
  celular: "Celular", endereco: "Endereço", logradouro: "Logradouro",
  numero: "Número", complemento: "Complemento", bairro: "Bairro",
  cidade: "Cidade", uf: "UF", estado: "Estado", cep: "CEP",
  renda: "Renda Estimada", score: "Score", classe_social: "Classe Social",
  estado_civil: "Estado Civil", profissao: "Profissão", escolaridade: "Escolaridade",
  naturalidade: "Naturalidade", nacionalidade: "Nacionalidade",
  tipo_sanguineo: "Tipo Sanguíneo", obito: "Óbito", status_receita: "Status na Receita",
  placa: "Placa", chassi: "Chassi", renavam: "RENAVAM", marca: "Marca",
  modelo: "Modelo", ano: "Ano", cor: "Cor", cnpj: "CNPJ",
  razao_social: "Razão Social", nome_fantasia: "Nome Fantasia",
  raca: "Raça", signo: "Signo",
};

const txtCategories: Record<string, string[]> = {
  "DADOS PESSOAIS": ["nome", "cpf", "nascimento", "data_nascimento", "data_de_nascimento", "sexo", "idade", "naturalidade", "nacionalidade", "raca", "tipo_sanguineo", "estado_civil", "obito", "status_receita", "signo"],
  "DOCUMENTOS": ["rg", "cnh", "pis", "nis", "cns", "titulo_eleitor", "titulo", "zona", "secao", "ctps"],
  "CONTATO": ["email", "emails", "telefone", "telefones", "celular", "whatsapp", "ddd"],
  "ENDEREÇO": ["endereco", "logradouro", "numero", "complemento", "bairro", "cidade", "uf", "estado", "cep", "municipio"],
  "FINANCEIRO": ["renda", "score", "classe_social", "classe", "poder_aquisitivo", "bancos"],
  "FAMÍLIA": ["mae", "nome_mae", "nome_da_mae", "pai", "nome_pai", "nome_do_pai", "parentes", "conjuge", "filhos"],
  "PROFISSIONAL": ["profissao", "escolaridade", "emprego", "empregos", "cargo", "empresa"],
  "VEÍCULO": ["placa", "chassi", "renavam", "marca", "modelo", "ano", "cor", "combustivel", "tipo_veiculo"],
  "EMPRESA": ["cnpj", "razao_social", "nome_fantasia", "capital_social", "atividade", "porte"],
};

const txtCategoryOrder = [
  "DADOS PESSOAIS", "DOCUMENTOS", "CONTATO", "ENDEREÇO", "FINANCEIRO",
  "FAMÍLIA", "PROFISSIONAL", "VEÍCULO", "EMPRESA", "OUTROS"
];

const queryTypeLabels: Record<string, string> = {
  cpf: "👤 CPF", cnpj: "🏢 CNPJ", placa: "🚗 Placa", placa_completa: "🚗 Placa Completa",
  telefone: "📞 Telefone", email: "📧 Email", cep: "📍 CEP", nome: "📝 Nome",
  score: "📊 Score", foto: "📸 Foto", nacional: "🇧🇷 Foto Nacional",
  rg: "🪪 RG", cnh: "🪪 CNH", pix: "💳 PIX",
};

const txtIgnoredKeys = ["comando", "error", "fotobase64", "foto", "image", "photo", "base64", "raw", "status", "success", "notfound",
  "sucesso", "protocolo", "usuario", "consumo_hoje", "consumo", "total_diario", "reset_em", "tipo", "inicio_uso", "vencimento", "tempo_restante",
  "tempo_restante_detalhado", "dias_totais_restantes", "dias_totais", "ddd", "classificacao", "modulo",
  "conta", "saldo", "tempo_segundos", "temposegundos", "cache", "cached_at", "expiracao", "duration_ms", "limites", "plano"];
const txtBotReferences = ["@querybuscasbot", "querybuscasbot", "t.me/querybuscas", "https://t.me/querybuscas", "@QueryBuscasBot", "querybuscas"];

// =============== HELPERS ===============
function getTxtCategory(key: string): string {
  const keyLower = key.toLowerCase().replace(/\./g, '_');
  for (const [category, fields] of Object.entries(txtCategories)) {
    if (fields.some(f => keyLower.includes(f) || keyLower === f)) {
      return category;
    }
  }
  return "OUTROS";
}

function getTxtLabel(key: string): string {
  const keyLower = key.toLowerCase().replace(/\./g, '_');
  if (txtFieldLabels[keyLower]) return txtFieldLabels[keyLower];
  for (const [field, label] of Object.entries(txtFieldLabels)) {
    if (keyLower.includes(field)) return label;
  }
  return key.replace(/_/g, " ").replace(/\./g, " ").replace(/([A-Z])/g, " $1").trim()
    .split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

function shouldIgnoreTxtKey(key: string): boolean {
  const keyLower = key.toLowerCase();
  if (txtIgnoredKeys.some(ik => keyLower === ik || keyLower.endsWith('.' + ik))) return true;
  if (keyLower.endsWith('_consultada')) return true;
  return false;
}

function shouldIgnoreTxtSingleValue(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === "N/A" || trimmed === "null" || trimmed === "undefined") return true;
  if (trimmed.startsWith("/9j/") || trimmed.startsWith("iVBOR") || trimmed.startsWith("data:image")) return true;
  const valueLower = trimmed.toLowerCase();
  if (valueLower === "@querybuscasbot" || valueLower === "https://t.me/querybuscas" || valueLower === "querybuscas") return true;
  return false;
}

function cleanTxtBotReferences(str: string): string {
  if (!str) return str;
  let result = str;
  for (const ref of txtBotReferences) {
    result = result.replace(new RegExp(ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
  }
  return result;
}

function extractAllTxtData(obj: unknown, prefix = ""): Array<{ key: string; value: string }> {
  const items: Array<{ key: string; value: string }> = [];
  if (!obj || typeof obj !== "object") return items;
  const record = obj as Record<string, unknown>;

  for (const [key, value] of Object.entries(record)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (shouldIgnoreTxtKey(key)) continue;

    if (typeof value === "string") {
      const trimmedValue = value.trim();
      if (!trimmedValue || trimmedValue === "-" || trimmedValue === "N/A") continue;
      if (trimmedValue.startsWith("/9j/") || trimmedValue.startsWith("iVBOR") || trimmedValue.startsWith("data:image")) continue;
      
      // Handle multi-line strings: parse line by line to extract sub-items
      if (trimmedValue.includes('\n')) {
        const lines = trimmedValue.split('\n');
        let currentSection = "";
        const sectionItems: string[] = [];
        
        for (const line of lines) {
          const tl = line.trim();
          if (!tl) continue;
          
          // Try key-value parse
          const delimiters = [' ⎯ ', ' — ', ': '];
          let parsed = false;
          for (const delim of delimiters) {
            const idx = tl.indexOf(delim);
            if (idx > 0) {
              const k = tl.substring(0, idx).trim().toLowerCase().replace(/\s+/g, '_');
              const v = tl.substring(idx + delim.length).trim();
              if (k && v && !shouldIgnoreTxtSingleValue(v)) {
                const isCountHeader = /^\(?\s*\d+\s*-?\s*encontrados?\s*\)?$/i.test(v);
                if (isCountHeader) {
                  // Flush previous section
                  if (currentSection && sectionItems.length > 0) {
                    items.push({ key: currentSection, value: sectionItems.join(" | ") });
                    sectionItems.length = 0;
                  }
                  currentSection = k;
                  items.push({ key: k, value: v });
                } else {
                  if (currentSection && sectionItems.length > 0) {
                    items.push({ key: currentSection, value: sectionItems.join(" | ") });
                    currentSection = "";
                    sectionItems.length = 0;
                  }
                  items.push({ key: k, value: v });
                }
                parsed = true;
              }
              break;
            }
          }
          
          if (!parsed && tl.length > 2 && !shouldIgnoreTxtSingleValue(tl)) {
            if (currentSection) {
              sectionItems.push(tl);
            } else if (/\d/.test(tl) || tl.includes(' - ')) {
              sectionItems.push(tl);
            }
          }
        }
        
        if (currentSection && sectionItems.length > 0) {
          items.push({ key: currentSection, value: sectionItems.join(" | ") });
        }
        continue;
      }
      
      if (!shouldIgnoreTxtSingleValue(trimmedValue)) {
        items.push({ key: fullKey, value: cleanTxtBotReferences(trimmedValue) });
      }
      continue;
    }

    if (typeof value === "object" && !Array.isArray(value) && value !== null) {
      items.push(...extractAllTxtData(value, fullKey));
      continue;
    }

    if (Array.isArray(value)) {
      const validItems: string[] = [];
      for (const item of value) {
        if (typeof item === "string" && !shouldIgnoreTxtSingleValue(item)) {
          validItems.push(item);
        } else if (typeof item === "object" && item !== null) {
          const subItems = extractAllTxtData(item, "");
          for (const subItem of subItems) {
            validItems.push(`${getTxtLabel(subItem.key)}: ${subItem.value}`);
          }
        }
      }
      if (validItems.length > 0) {
        items.push({ key: fullKey, value: validItems.join(" | ") });
      }
      continue;
    }

    if (value !== null && value !== undefined) {
      items.push({ key: fullKey, value: String(value) });
    }
  }
  return items;
}

// =============== TXT GENERATION ===============
function generateTxtContent(queryType: string, queryInput: string, data: Record<string, unknown>): string {
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  let txt = `════════════════════════════════════════════════════════════\n`;
  txt += `                  RELATÓRIO DE CONSULTA\n`;
  txt += `════════════════════════════════════════════════════════════\n\n`;
  txt += `Tipo: ${queryType.toUpperCase()}\n`;
  txt += `Consulta: ${queryInput}\n`;
  txt += `Gerado em: ${dateStr}\n\n`;
  txt += `════════════════════════════════════════════════════════════\n\n`;

  const items = extractAllTxtData(data);

  if (items.length === 0) {
    txt += `┌─────────────────────────────────────────────────────────────\n`;
    txt += `│ DADOS BRUTOS\n`;
    txt += `├─────────────────────────────────────────────────────────────\n`;
    for (const [key, value] of Object.entries(data)) {
      if (shouldIgnoreTxtKey(key)) continue;
      const label = getTxtLabel(key);
      let displayValue: string;
      if (typeof value === "string") {
        displayValue = cleanTxtBotReferences(value).trim();
      } else if (typeof value === "object") {
        displayValue = JSON.stringify(value, null, 2).replace(/[{}[\]"]/g, '').replace(/,\n/g, '\n').trim();
      } else {
        displayValue = String(value);
      }
      if (displayValue && displayValue.length > 2) {
        txt += `│ ${label}: ${displayValue}\n`;
      }
    }
    txt += `└─────────────────────────────────────────────────────────────\n\n`;
  } else {
    // Merge duplicates instead of dropping them
    const mergedMap = new Map<string, { key: string; values: string[] }>();
    for (const item of items) {
      const keyNorm = item.key.toLowerCase().replace(/[.\s]/g, '_');
      if (mergedMap.has(keyNorm)) {
        const existing = mergedMap.get(keyNorm)!;
        if (!existing.values.includes(item.value)) {
          existing.values.push(item.value);
        }
      } else {
        mergedMap.set(keyNorm, { key: item.key, values: [item.value] });
      }
    }
    const uniqueItems = Array.from(mergedMap.values()).map(entry => ({
      key: entry.key,
      value: entry.values.join(" | "),
    }));

    const grouped: Record<string, Array<{ key: string; value: string }>> = {};
    for (const item of uniqueItems) {
      const cat = getTxtCategory(item.key);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    }

    for (const category of txtCategoryOrder) {
      const catItems = grouped[category];
      if (!catItems || catItems.length === 0) continue;

      txt += `┌─────────────────────────────────────────────────────────────\n`;
      txt += `│ ${category}\n`;
      txt += `├─────────────────────────────────────────────────────────────\n`;

      for (const item of catItems) {
        const label = getTxtLabel(item.key.split(".").pop() || item.key);
        txt += `│ ${label}: ${item.value}\n`;
      }
      txt += `└─────────────────────────────────────────────────────────────\n\n`;
    }
  }

  txt += `════════════════════════════════════════════════════════════\n`;
  txt += `                  Documento Oficial\n`;
  txt += `                  Uso Restrito\n`;
  txt += `════════════════════════════════════════════════════════════\n`;

  return txt;
}

// =============== TELEGRAM FORMAT ===============
function formatQueryResult(queryType: string, data: Record<string, unknown>, botUsername?: string, telegramUserName?: string): string {
  if (data.error) {
    // Sanitize error: never expose raw URLs or technical details
    let errorMsg = String(data.error);
    if (errorMsg.includes('Connection refused') || errorMsg.includes('connect error') || errorMsg.includes('tcp connect') || errorMsg.includes('error sending request')) {
      errorMsg = "⚠️ Servidor temporariamente indisponível. Tente novamente em alguns minutos.";
    } else if (errorMsg.includes('http://') || errorMsg.includes('https://')) {
      // Strip URLs from error messages
      errorMsg = errorMsg.replace(/https?:\/\/[^\s)]+/g, '[servidor]');
    }
    return `❌ <b>Erro:</b> ${errorMsg}`;
  }

  const botTag = botUsername ? `@${botUsername.replace('@', '')}` : '@Bot';
  
  const categories: Record<string, { icon: string; label: string; fields: string[] }> = {
    personal: { icon: "👤", label: "DADOS PESSOAIS", fields: ["nome", "cpf", "nascimento", "sexo", "idade", "raca", "signo", "naturalidade", "nacionalidade"] },
    documents: { icon: "🪪", label: "DOCUMENTOS", fields: ["rg", "cnh", "pis", "titulo", "ctps", "cns"] },
    contact: { icon: "📞", label: "CONTATO", fields: ["telefone", "celular", "email", "whatsapp"] },
    address: { icon: "🏠", label: "ENDEREÇO", fields: ["endereco", "logradouro", "numero", "complemento", "bairro", "cidade", "uf", "cep", "municipio"] },
    financial: { icon: "💰", label: "FINANCEIRO", fields: ["renda", "score", "classe", "poder_aquisitivo", "banco"] },
    family: { icon: "👨‍👩‍👧‍👦", label: "FAMÍLIA", fields: ["mae", "pai", "conjuge", "parente", "filho"] },
    professional: { icon: "💼", label: "PROFISSIONAL", fields: ["profissao", "escolaridade", "emprego", "cargo", "empresa"] },
    vehicle: { icon: "🚗", label: "VEÍCULO", fields: ["placa", "chassi", "renavam", "marca", "modelo", "ano", "cor", "combustivel"] },
    company: { icon: "🏢", label: "EMPRESA", fields: ["cnpj", "razao", "fantasia", "capital", "atividade", "porte", "situacao"] },
  };

  const ignoredKeys = ["comando", "error", "fotobase64", "foto", "image", "photo", "base64", "raw", "status", "success", "notfound", "data",
    "sucesso", "protocolo", "usuario", "consumo_hoje", "consumo", "total_diario", "reset_em", "tipo", "inicio_uso", "vencimento", "tempo_restante",
    "tempo_restante_detalhado", "dias_totais_restantes", "dias_totais", "ddd", "classificacao", "modulo",
    "conta", "saldo", "tempo_segundos", "cache", "cached_at"];
  const shouldIgnore = (val: unknown) => {
    if (val === null || val === undefined || val === '') return true;
    if (typeof val === 'string') {
      const trimmed = val.trim().toLowerCase();
      if (trimmed === '-' || trimmed === 'n/a' || trimmed === 'null' || trimmed === 'não informado') return true;
      if (val.includes('@querybuscas') || val.includes('t.me/querybuscas')) return true;
    }
    return false;
  };

  // Parse text format with multiple CPF/NOME entries (supports both colon and BASE formats)
  const parseTextMultiplePersons = (text: string): Array<Record<string, unknown>> | null => {
    if (!text || typeof text !== 'string') return null;
    
    // Clean the text
    const cleanText = text
      .replace(/@\w+/g, '')
      .replace(/https?:\/\/[^\s]+/g, '')
      .trim();
    
    // Check if this has BASE sections (phone query format)
    const hasBaseSections = /BASE\s+\d+/i.test(cleanText);
    
    if (hasBaseSections) {
      const persons: Array<Record<string, unknown>> = [];
      const baseSections = cleanText.split(/(?=BASE\s+\d+)/gi).filter(s => s.trim());
      
      for (const section of baseSections) {
        // Skip header section (before first BASE)
        if (!section.match(/BASE\s+\d+/i)) continue;
        
        const person: Record<string, unknown> = {};
        const lines = section.split(/\n/).map(l => l.trim()).filter(Boolean);
        
        for (const line of lines) {
          // Skip the BASE header line
          if (line.match(/^BASE\s+\d+$/i)) continue;
          
          // Match "KEY: value" format
          const match = line.match(/^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\w\s_]+)[:\s]+[`]?(.+)$/i);
          if (match) {
            const key = match[1].trim().toUpperCase();
            let value = match[2].trim().replace(/^`/, '');
            
            if (!value || value === '-' || value.toLowerCase().startsWith('não informad')) continue;
            if (key.includes('RESULTADO') || key.includes('ENCONTRADO')) continue;
            
            person[key.toLowerCase().replace(/_/g, '')] = value;
          }
        }
        
        if (person['cpf'] || person['nome']) {
          persons.push(person);
        }
      }
      
      return persons.length > 1 ? persons : null;
    }
    
    // Check if this looks like multiple person data with CPF entries
    const cpfMatches = cleanText.match(/CPF[:\s`]+[\d.-]+/gi);
    if (!cpfMatches || cpfMatches.length < 2) return null;
    
    const persons: Array<Record<string, unknown>> = [];
    
    // Split by CPF entries to separate each person
    const sections = cleanText.split(/(?=CPF[:\s`]+[\d.-]+)/gi).filter(s => s.trim());
    
    for (const section of sections) {
      const person: Record<string, unknown> = {};
      const lines = section.split(/\n/).map(l => l.trim()).filter(Boolean);
      
      for (const line of lines) {
        const match = line.match(/^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\w\s]+)[:\s]+[`]?(.+)$/i);
        if (match) {
          const key = match[1].trim().toUpperCase();
          let value = match[2].trim().replace(/^`/, '');
          
          if (!value || value === '-' || value.toLowerCase().startsWith('não informad')) continue;
          if (key.includes('RESULTADO') || key.includes('BASE') || key.includes('ENCONTRADO')) continue;
          
          person[key.toLowerCase()] = value;
        }
      }
      
      if (person['cpf'] || person['nome']) {
        persons.push(person);
      }
    }
    
    return persons.length > 1 ? persons : null;
  };

  // Check if data contains multiple person records (array of objects with cpf/nome)
  const detectMultiplePersons = (obj: unknown): Array<Record<string, unknown>> | null => {
    if (!obj || typeof obj !== 'object') return null;
    
    const record = obj as Record<string, unknown>;
    
    // FIRST: Check if data field contains text with multiple persons
    if (record['data'] && typeof record['data'] === 'string') {
      const parsed = parseTextMultiplePersons(record['data']);
      if (parsed) return parsed;
    }
    
    // Check if it's directly an array of person objects
    if (Array.isArray(obj)) {
      if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null) {
        const firstItem = obj[0] as Record<string, unknown>;
        if ('cpf' in firstItem || 'nome' in firstItem || 'CPF' in firstItem || 'NOME' in firstItem) {
          return obj as Array<Record<string, unknown>>;
        }
      }
    }
    
    // Check nested properties for arrays of person objects
    for (const [key, value] of Object.entries(record)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        const firstItem = value[0] as Record<string, unknown>;
        if ('cpf' in firstItem || 'nome' in firstItem || 'CPF' in firstItem || 'NOME' in firstItem) {
          return value as Array<Record<string, unknown>>;
        }
      }
    }
    
    // Check if parallel arrays exist (cpf: [...], nome: [...])
    const arrayFields: Record<string, unknown[]> = {};
    let maxArrayLength = 0;
    
    for (const [key, value] of Object.entries(record)) {
      if (Array.isArray(value) && value.length > 0) {
        if (typeof value[0] === 'object' && value[0] !== null) continue;
        arrayFields[key] = value;
        if (value.length > maxArrayLength) maxArrayLength = value.length;
      }
    }
    
    const hasCpfArray = arrayFields['cpf'] || arrayFields['CPF'] || arrayFields['cpfs'];
    const hasNomeArray = arrayFields['nome'] || arrayFields['NOME'] || arrayFields['nomes'];
    
    if ((hasCpfArray || hasNomeArray) && maxArrayLength > 1) {
      const persons: Array<Record<string, unknown>> = [];
      
      for (let i = 0; i < maxArrayLength; i++) {
        const person: Record<string, unknown> = {};
        
        for (const [key, value] of Object.entries(record)) {
          if (Array.isArray(value)) {
            if (value.length === maxArrayLength) {
              const item = value[i];
              if (item !== null && item !== undefined && item !== '' && item !== '-') {
                person[key] = item;
              }
            } else if (value.length === 1) {
              person[key] = value[0];
            }
          } else if (!Array.isArray(value)) {
            person[key] = value;
          }
        }
        
        if (Object.keys(person).length > 0) {
          persons.push(person);
        }
      }
      
      if (persons.length > 1) {
        return persons;
      }
    }
    
    return null;
  };

  const multiplePersons = detectMultiplePersons(data);
  
  // If multiple persons detected, format each one separately
  if (multiplePersons && multiplePersons.length > 1) {
    const lines: string[] = [];
    const typeLabel = queryTypeLabels[queryType]?.replace(/[^\w\s]/g, '').trim() || queryType.toUpperCase();
    
    lines.push(`${queryTypeLabels[queryType] || '📋'} ${typeLabel} RESULTADO`);
    lines.push(``);
    lines.push(`👥 ${multiplePersons.length} pessoas encontradas`);
    lines.push(``);
    
    multiplePersons.forEach((person, index) => {
      lines.push(`┌─────────────────────────────`);
      lines.push(`│ 👤 PESSOA ${index + 1}`);
      lines.push(`├─────────────────────────────`);
      
      // Extract and display person data
      for (const [key, value] of Object.entries(person)) {
        if (ignoredKeys.includes(key.toLowerCase())) continue;
        if (shouldIgnore(value)) continue;
        
        const label = getTxtLabel(key);
        const displayValue = String(value).toUpperCase();
        
        if (displayValue && displayValue.length > 0 && displayValue !== '-') {
          lines.push(`│ ▷ ${label.toUpperCase()}: ${displayValue}`);
        }
      }
      
      lines.push(`└─────────────────────────────`);
      lines.push(``);
    });
    
    lines.push(`❤️ OBRIGADO POR USAR ❤️`);
    lines.push(`🤖 ${botTag}`);
    
    return `<pre>${lines.join('\n')}</pre>`;
  }

  // Single record formatting (original logic)
  const categorizedData: Record<string, Array<{ key: string; value: unknown }>> = {};
  const uncategorized: Array<{ key: string; value: unknown }> = [];

  const flattenObject = (obj: unknown, prefix = ""): Array<{ key: string; value: unknown }> => {
    const items: Array<{ key: string; value: unknown }> = [];
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return items;

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const keyLower = key.toLowerCase();

      if (ignoredKeys.includes(keyLower)) continue;
      if (typeof value === 'string' && value.length > 100 && !value.includes(' ') && (value.startsWith('/9j/') || value.startsWith('iVBOR') || value.startsWith('data:image'))) continue;
      if (shouldIgnore(value)) continue;

      if (typeof value === 'object' && !Array.isArray(value)) {
        items.push(...flattenObject(value, fullKey));
      } else if (Array.isArray(value)) {
        if (value.length > 0 && typeof value[0] === 'object') {
          value.forEach((item, i) => items.push(...flattenObject(item, `${fullKey}[${i}]`)));
        } else {
          // For simple arrays, show each item on its own line if it's a list of values
          const validItems = value.filter(v => !shouldIgnore(v));
          if (validItems.length === 1) {
            items.push({ key: fullKey, value: validItems[0] });
          } else if (validItems.length > 1) {
            items.push({ key: fullKey, value: validItems.join(', ') });
          }
        }
      } else {
        items.push({ key: fullKey, value });
      }
    }
    return items;
  };

  const allItems = flattenObject(data);

  for (const item of allItems) {
    const keyLower = item.key.toLowerCase().split('.').pop() || item.key.toLowerCase();
    let found = false;

    for (const [catKey, catInfo] of Object.entries(categories)) {
      if (catInfo.fields.some(f => keyLower.includes(f.toLowerCase()))) {
        if (!categorizedData[catKey]) categorizedData[catKey] = [];
        categorizedData[catKey].push(item);
        found = true;
        break;
      }
    }

    if (!found) uncategorized.push(item);
  }

  const formatKey = (key: string): string => {
    const lastPart = key.split('.').pop() || key;
    return lastPart.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\[(\d+)\]/g, ' $1').trim().toUpperCase();
  };

  const typeLabel = queryTypeLabels[queryType]?.replace(/[^\w\s]/g, '').trim() || queryType.toUpperCase();
  const lines: string[] = [];

  lines.push(`${queryTypeLabels[queryType] || '📋'} ${typeLabel} RESULTADO`);
  lines.push(``);

  for (const [catKey, catInfo] of Object.entries(categories)) {
    const items = categorizedData[catKey];
    if (!items || items.length === 0) continue;

    lines.push(`┌─────────────────────────────`);
    lines.push(`│ ${catInfo.icon} ${catInfo.label}`);
    lines.push(`├─────────────────────────────`);

    for (const item of items) {
      const displayKey = formatKey(item.key);
      const displayValue = String(item.value).toUpperCase();
      if (!shouldIgnore(displayValue)) {
        lines.push(`│ ▷ ${displayKey}: ${displayValue}`);
      }
    }

    lines.push(`└─────────────────────────────`);
    lines.push(``);
  }

  if (uncategorized.length > 0) {
    lines.push(`┌─────────────────────────────`);
    lines.push(`│ 📋 OUTROS DADOS`);
    lines.push(`├─────────────────────────────`);

    for (const item of uncategorized) {
      const displayKey = formatKey(item.key);
      const displayValue = String(item.value).toUpperCase();
      if (!shouldIgnore(displayValue)) {
        lines.push(`│ ▷ ${displayKey}: ${displayValue}`);
      }
    }

    lines.push(`└─────────────────────────────`);
    lines.push(``);
  }

  lines.push(`❤️ OBRIGADO POR USAR ❤️`);
  lines.push(`🤖 ${botTag}`);

  return `<pre>${lines.join('\n')}</pre>`;
}

// =============== MULTI-PERSON FORMAT (CEP) ===============
interface PersonRecord {
  cpf?: string;
  nome?: string;
  nascimento?: string;
  email?: string;
  renda?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  [key: string]: string | undefined;
}

function parseMultiplePersonRecords(dataStr: string): PersonRecord[] {
  const records: PersonRecord[] = [];
  const cleaned = dataStr.replace(/@\w+/g, '').replace(/https?:\/\/[^\s]+/g, '').trim();
  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);

  let currentRecord: PersonRecord = {};
  let hasData = false;

  for (const line of lines) {
    const match = line.match(/^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s]+)\s*[⎯—-]\s*(.*)$/i);

    if (match) {
      const key = match[1].trim().toUpperCase();
      const value = match[2].trim();

      if (!value || value === '-' || value.toLowerCase().startsWith('não informad')) continue;

      if (key === 'CPF' && hasData && currentRecord.cpf) {
        records.push({ ...currentRecord });
        currentRecord = {};
        hasData = false;
      }

      const keyMap: Record<string, string> = {
        'CPF': 'cpf', 'NOME': 'nome', 'NASCIMENTO': 'nascimento',
        'EMAIL': 'email', 'RENDA': 'renda', 'BAIRRO': 'bairro',
        'CIDADE': 'cidade', 'UF': 'uf', 'CEP': 'cep',
      };

      const mappedKey = keyMap[key] || key.toLowerCase().replace(/\s+/g, '_');
      currentRecord[mappedKey] = value;
      hasData = true;
    }
  }

  if (hasData && Object.keys(currentRecord).length > 0) {
    records.push(currentRecord);
  }

  return records;
}

function formatMultiPersonPage(records: PersonRecord[], page: number, totalPages: number, botUsername?: string): string {
  const botTag = botUsername ? `@${botUsername.replace('@', '')}` : '@Bot';
  const RECORDS_PER_PAGE = 10;

  const startIdx = page * RECORDS_PER_PAGE;
  const endIdx = Math.min(startIdx + RECORDS_PER_PAGE, records.length);
  const pageRecords = records.slice(startIdx, endIdx);

  const lines: string[] = [];

  lines.push(`📍 CONSULTA DE CEP`);
  lines.push(``);
  lines.push(`👥 ${records.length} pessoas encontradas`);
  if (totalPages > 1) {
    lines.push(`📄 Página ${page + 1}/${totalPages} (${startIdx + 1}-${endIdx})`);
  }
  lines.push(``);

  pageRecords.forEach((record, index) => {
    const globalIndex = startIdx + index;
    lines.push(`┌─────────────────────────────`);
    lines.push(`│ 👤 PESSOA ${globalIndex + 1}`);
    lines.push(`├─────────────────────────────`);

    if (record.nome) lines.push(`│ 📛 Nome: ${record.nome.toUpperCase()}`);
    if (record.cpf) lines.push(`│ 🆔 CPF: ${record.cpf}`);
    if (record.nascimento) lines.push(`│ 📅 Nasc: ${record.nascimento}`);
    if (record.renda) lines.push(`│ 💰 Renda: R$ ${record.renda}`);
    if (record.email && record.email.toLowerCase() !== 'não informado') {
      lines.push(`│ 📧 Email: ${record.email.toUpperCase()}`);
    }

    const addressParts = [];
    if (record.bairro) addressParts.push(record.bairro);
    if (record.cidade) addressParts.push(record.cidade);
    if (record.uf) addressParts.push(record.uf);

    if (addressParts.length > 0) {
      lines.push(`│ 📍 Local: ${addressParts.join(' - ').toUpperCase()}`);
    }
    if (record.cep) lines.push(`│ 📮 CEP: ${record.cep}`);

    lines.push(`└─────────────────────────────`);
    lines.push(``);
  });

  lines.push(`💡 Clique no CPF para consultar`);
  lines.push(`🤖 ${botTag}`);

  return `<pre>${lines.join('\n')}</pre>`;
}

// =============== MAIN HANDLER ===============
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, queryType, queryInput, data, botUsername, telegramUserName, records, page, totalPages } = body;

    let result: string;

    switch (action) {
      case 'formatTxt':
        result = generateTxtContent(queryType, queryInput, data);
        break;

      case 'formatQueryResult':
        result = formatQueryResult(queryType, data, botUsername, telegramUserName);
        break;

      case 'formatMultiPerson':
        result = formatMultiPersonPage(records, page || 0, totalPages || 1, botUsername);
        break;

      case 'parseMultiPerson':
        const parsed = parseMultiplePersonRecords(data);
        return new Response(JSON.stringify({ success: true, records: parsed }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Format result error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
