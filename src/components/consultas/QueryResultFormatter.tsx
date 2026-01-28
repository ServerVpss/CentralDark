import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  CreditCard,
  Calendar,
  FileText,
  Heart,
  Droplets,
  Star,
  AlertCircle,
  Camera,
} from "lucide-react";

interface QueryResultFormatterProps {
  data: any;
}

interface ParsedData {
  [key: string]: string | string[] | ParsedData[];
}

// Lista de chaves conhecidas para parsing de strings concatenadas (ordenadas por tamanho decrescente para evitar conflitos)
const KNOWN_KEYS = [
  // Chaves compostas (mais longas primeiro)
  'MUNICÍPIO DE NASCIMENTO', 'TIPO SANGÚINEO', 'STATUS NA RECEITA', 'RECEBE INSS',
  'TITULO ELEITOR', 'CLASSE SOCIAL', 'ESTADO CIVIL', 'NOME SOCIAL',
  'Orientação Sexual', 'Identidade de Gênero', 'Nome Social', 'Classe Social', 'Estado Civil',
  'Título Eleitor', 'Raça/Cor', 'Deficiência',
  // Chaves médias
  'NASCIMENTO', 'NATURALIDADE', 'NACIONALIDADE', 'ESCOLARIDADE', 'PROFISSÃO',
  'LOGRADOURO', 'COMPLEMENTO', 'MUNICÍPIO', 'ENDEREÇO', 'TELEFONE', 'ALCUNHA',
  'NOME MÃE', 'NOME PAI', 'PARENTES', 'VEICULOS', 'EMPREGOS', 'EMPRESAS',
  'BANCOS', 'EMAILS', 'TELEFONES', 'ENDERECOS',
  // Chaves simples
  'NOME', 'CPF', 'MÃE', 'PAI', 'SEXO', 'RG', 'CNH', 'PIS', 'NIS', 'CNS',
  'RAÇA', 'COR', 'ÓBITO', 'RENDA', 'SCORE', 'CLASSE',
  'ZONA', 'SEÇÃO', 'SECAO', 'EMAIL', 'CEP', 'BAIRRO', 'CIDADE', 'ESTADO', 'UF', 'NÚMERO',
  'Naturalidade', 'Nacionalidade', 'Escolaridade', 'Nascimento', 'Logradouro', 'Complemento',
  'Município', 'Profissão', 'Endereço', 'Telefone', 'Alcunha',
  'Nome', 'CPF', 'Mãe', 'Pai', 'Sexo', 'RG', 'CNH', 'PIS', 'NIS', 'CNS',
  'Raça', 'Cor', 'Óbito', 'Renda', 'Score', 'Classe',
  'Zona', 'Seção', 'Email', 'CEP', 'Bairro', 'Cidade', 'Estado', 'UF', 'Número'
].sort((a, b) => b.length - a.length); // Ordenar por tamanho decrescente

// Parse concatenated string like "Nome: X Mãe: Y CPF: Z"
function parseConcatenatedString(text: string): ParsedData {
  const result: ParsedData = {};
  
  // Remover prefixo "TEXTO:" se existir
  let cleanText = text.replace(/^TEXTO:\s*/i, '').trim();
  
  // Build regex to split by known keys (case insensitive)
  const keysPattern = KNOWN_KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`\\b(${keysPattern}):\\s*`, 'gi');
  
  // Find all matches with positions
  const matches: { key: string; index: number; length: number }[] = [];
  let match;
  while ((match = regex.exec(cleanText)) !== null) {
    matches.push({ 
      key: match[1], 
      index: match.index,
      length: match[0].length 
    });
  }
  
  // Extract values between keys
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];
    
    const valueStart = currentMatch.index + currentMatch.length;
    const valueEnd = nextMatch ? nextMatch.index : cleanText.length;
    
    let value = cleanText.substring(valueStart, valueEnd).trim();
    
    // Skip "Não informado", "Não informa" or empty values
    const lowerValue = value.toLowerCase();
    if (value && 
        !lowerValue.startsWith('não informad') && 
        !lowerValue.startsWith('não informa') &&
        value !== '-') {
      // Normalizar nome da chave (primeira letra maiúscula)
      const normalizedKey = currentMatch.key.charAt(0).toUpperCase() + currentMatch.key.slice(1).toLowerCase();
      result[normalizedKey] = value;
    }
  }
  
  return result;
}

// Parse data that comes in multiple "BASE" sections
function parseMultiBaseFormat(text: string): ParsedData {
  const result: ParsedData = {};
  
  // Remove bot references and URLs
  let cleanText = text
    .replace(/@\w+/g, '')
    .replace(/https?:\/\/[^\s]+/g, '')
    .trim();
  
  // Check if this is multi-base format
  if (!cleanText.includes('BASE')) {
    return result;
  }
  
  // Split by BASE sections
  const baseSections = cleanText.split(/BASE\s+\d+/i).filter(s => s.trim());
  
  // Arrays to collect multiple values
  const cpfs: string[] = [];
  const nomes: string[] = [];
  const otherData: Record<string, string[]> = {};
  
  for (const section of baseSections) {
    const lines = section.split(/\n/).filter(l => l.trim());
    
    for (const line of lines) {
      const match = line.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const key = match[1].trim().toUpperCase();
        const value = match[2].trim();
        
        if (!value || value === '-') continue;
        
        if (key === 'CPF' || key === 'CPF_CNPJ') {
          if (!cpfs.includes(value)) cpfs.push(value);
        } else if (key === 'NOME') {
          if (!nomes.includes(value)) nomes.push(value);
        } else {
          if (!otherData[key]) otherData[key] = [];
          if (!otherData[key].includes(value)) otherData[key].push(value);
        }
      }
    }
  }
  
  // Build result with unique values
  if (cpfs.length > 0) result['CPF'] = cpfs.length === 1 ? cpfs[0] : cpfs;
  if (nomes.length > 0) result['Nome'] = nomes.length === 1 ? nomes[0] : nomes;
  
  for (const [key, values] of Object.entries(otherData)) {
    const formattedKey = key.charAt(0) + key.slice(1).toLowerCase();
    result[formattedKey] = values.length === 1 ? values[0] : values;
  }
  
  return result;
}

// Parse CPF-style full response with sections
function parseCpfFullResponse(text: string): ParsedData {
  const result: ParsedData = {};
  
  // Clean text
  let cleanText = text
    .replace(/@\w+/g, '')
    .replace(/https?:\/\/[^\s]+/g, '')
    .trim();
  
  // Split by lines
  const lines = cleanText.split(/\\n|\n/).filter(line => line.trim());
  
  let currentSection = '';
  const sectionItems: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Check for section headers like "EMAILS: ( 5 - Encontrados)"
    const sectionMatch = trimmedLine.match(/^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s]+):\s*\(\s*(\d+)\s*-\s*Encontrados?\s*\)/i);
    if (sectionMatch) {
      // Save previous section if exists
      if (currentSection && sectionItems.length > 0) {
        result[currentSection] = [...sectionItems];
        sectionItems.length = 0;
      }
      currentSection = sectionMatch[1].trim();
      const count = parseInt(sectionMatch[2]);
      if (count > 0) {
        result[currentSection] = [];
      }
      continue;
    }
    
    // Check for bullet points
    if (trimmedLine.startsWith('•')) {
      const item = trimmedLine.replace(/^•\s*/, '').trim();
      if (currentSection && item) {
        sectionItems.push(item);
      }
      continue;
    }
    
    // Check for key ⎯ value format (common in NexFuture)
    const dashMatch = trimmedLine.match(/^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s]+)\s*⎯\s*(.*)$/i);
    if (dashMatch) {
      const key = dashMatch[1].trim();
      const value = dashMatch[2].trim();
      
      // Skip empty or placeholder values
      if (value && value !== '-' && !value.toLowerCase().startsWith('não informad')) {
        // Normalize key name
        const normalizedKey = normalizeKeyName(key);
        
        // Skip metadata
        if (['TEXTO', 'COMANDO', 'VALOR'].includes(key.toUpperCase())) continue;
        
        result[normalizedKey] = value;
      }
      continue;
    }
    
    // Check for simple key: value format
    const simpleMatch = trimmedLine.match(/^([^:]+):\s*(.+)$/);
    if (simpleMatch && !currentSection) {
      const key = simpleMatch[1].trim();
      const value = simpleMatch[2].trim();
      
      // Skip empty, placeholder, or section header values
      if (value && value !== '-' && 
          !value.toLowerCase().startsWith('não informad') &&
          !value.match(/^\(\s*\d+\s*-\s*Encontrados?\s*\)/i)) {
        const normalizedKey = normalizeKeyName(key);
        
        // Skip metadata
        if (['TEXTO', 'COMANDO', 'VALOR'].includes(key.toUpperCase())) continue;
        
        result[normalizedKey] = value;
      }
      continue;
    }
    
    // If we're in a section, add non-empty lines as items
    if (currentSection && trimmedLine && !trimmedLine.match(/^[A-Z\s]+:\s*$/)) {
      sectionItems.push(trimmedLine);
    }
  }
  
  // Save last section
  if (currentSection && sectionItems.length > 0) {
    result[currentSection] = [...sectionItems];
  }
  
  return result;
}

// Normalize key names
function normalizeKeyName(key: string): string {
  const keyMap: Record<string, string> = {
    'NOME MÃE': 'Mãe',
    'NOME PAI': 'Pai',
    'MUNICÍPIO DE NASCIMENTO': 'Naturalidade',
    'TIPO SANGÚINEO': 'Tipo Sanguíneo',
    'STATUS NA RECEITA': 'Status Receita',
    'RECEBE INSS': 'Recebe INSS',
    'TITULO ELEITOR': 'Título Eleitor',
    'CLASSE SOCIAL': 'Classe Social',
    'ESTADO CIVIL': 'Estado Civil',
  };
  
  const upperKey = key.toUpperCase().trim();
  if (keyMap[upperKey]) return keyMap[upperKey];
  
  // Title case for single words
  return key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
}

// Parse the raw text response into structured data
function parseRawText(text: string): ParsedData {
  const result: ParsedData = {};
  
  // Remove the bot reference if present
  let cleanText = text.replace(/@\w+\\n/g, '').replace(/@\w+\n/g, '').replace(/@\w+/g, '');
  // Remove URLs
  cleanText = cleanText.replace(/https?:\/\/[^\s]+/g, '');
  
  // Check if this looks like a full CPF response with sections
  if (cleanText.includes('⎯') || cleanText.includes('Encontrados)')) {
    const parsed = parseCpfFullResponse(cleanText);
    if (Object.keys(parsed).length > 0) {
      return parsed;
    }
  }
  
  // Try parsing multi-base format first (RESULTADOS ENCONTRADOS PARA...)
  if (cleanText.includes('BASE') || cleanText.includes('RESULTADOS ENCONTRADOS')) {
    const parsed = parseMultiBaseFormat(cleanText);
    if (Object.keys(parsed).length > 0) {
      return parsed;
    }
  }
  
  // Try to parse as concatenated string (no line breaks)
  if (!cleanText.includes('\n') && !cleanText.includes('\\n')) {
    const parsed = parseConcatenatedString(cleanText);
    if (Object.keys(parsed).length > 0) {
      return parsed;
    }
  }
  
  // Split by \n or actual newlines
  const lines = cleanText.split(/\\n|\n/).filter(line => line.trim());
  
  let currentSection = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Skip header lines
    if (trimmedLine.includes('RESULTADOS ENCONTRADOS') || trimmedLine.startsWith('BASE')) {
      continue;
    }
    
    // Try parsing each line as concatenated string
    const parsedLine = parseConcatenatedString(trimmedLine);
    if (Object.keys(parsedLine).length > 1) {
      // Merge arrays for duplicate keys
      for (const [key, value] of Object.entries(parsedLine)) {
        if (result[key]) {
          if (Array.isArray(result[key])) {
            (result[key] as string[]).push(String(value));
          } else if (result[key] !== value) {
            result[key] = [String(result[key]), String(value)];
          }
        } else {
          result[key] = value;
        }
      }
      continue;
    }
    
    // Check for section headers like "EMAILS: ( 2 - Encontrados)"
    const sectionMatch = trimmedLine.match(/^([A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s]+):\s*\(\s*(\d+)\s*-\s*Encontrados?\s*\)/i);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      const count = parseInt(sectionMatch[2]);
      if (count > 0) {
        result[currentSection] = [];
      }
      continue;
    }
    
    // Check for simple key: value format
    const simpleKvMatch = trimmedLine.match(/^([^:]+):\s*(.+)$/);
    if (simpleKvMatch) {
      const key = simpleKvMatch[1].trim();
      const value = simpleKvMatch[2].trim();
      const lowerValue = value.toLowerCase();
      
      // Skip unwanted values
      if (!value || value === '-' || lowerValue.startsWith('não informad') || lowerValue.startsWith('não informa')) {
        continue;
      }
      
      // Skip metadata keys
      if (key.toUpperCase() === 'TEXTO' || key.toUpperCase() === 'COMANDO' || key.toUpperCase() === 'VALOR') {
        continue;
      }
      
      // Handle duplicate keys by creating arrays
      if (result[key]) {
        if (Array.isArray(result[key])) {
          if (!(result[key] as string[]).includes(value)) {
            (result[key] as string[]).push(value);
          }
        } else if (result[key] !== value) {
          result[key] = [String(result[key]), value];
        }
      } else {
        result[key] = value;
      }
      continue;
    }
    
    // Check for bullet points or listed items
    if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
      const item = trimmedLine.replace(/^[•-]\s*/, '').trim();
      if (currentSection && Array.isArray(result[currentSection])) {
        (result[currentSection] as string[]).push(item);
      }
      continue;
    }
    
    // Handle items in current section
    if (currentSection && Array.isArray(result[currentSection]) && trimmedLine) {
      (result[currentSection] as string[]).push(trimmedLine);
    }
  }
  
  return result;
}

// Get icon for a field
function getFieldIcon(key: string) {
  const keyLower = key.toLowerCase();
  if (keyLower.includes('nome') || keyLower.includes('cpf')) return User;
  if (keyLower.includes('email')) return Mail;
  if (keyLower.includes('telefone') || keyLower.includes('whatsapp')) return Phone;
  if (keyLower.includes('empresa') || keyLower.includes('emprego') || keyLower.includes('cnpj')) return Building2;
  if (keyLower.includes('endereço') || keyLower.includes('municipio') || keyLower.includes('cep')) return MapPin;
  if (keyLower.includes('profissão') || keyLower.includes('cargo')) return Briefcase;
  if (keyLower.includes('escolaridade')) return GraduationCap;
  if (keyLower.includes('renda') || keyLower.includes('score') || keyLower.includes('banco')) return CreditCard;
  if (keyLower.includes('nascimento') || keyLower.includes('data') || keyLower.includes('admissão') || keyLower.includes('demissão')) return Calendar;
  if (keyLower.includes('rg') || keyLower.includes('cnh') || keyLower.includes('pis') || keyLower.includes('nis') || keyLower.includes('cns')) return FileText;
  if (keyLower.includes('civil') || keyLower.includes('mãe') || keyLower.includes('pai')) return Heart;
  if (keyLower.includes('sangue') || keyLower.includes('sanguíneo')) return Droplets;
  return Star;
}

// Format field label
function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Campos de foto que devem ser ocultados (já exibimos a imagem real)
const PHOTO_FIELDS = ['foto', 'fotobase64', 'image', 'photo', 'url', 'base64'];

// Group fields by category
function groupFields(data: ParsedData): Record<string, ParsedData> {
  const groups: Record<string, ParsedData> = {
    'Dados Pessoais': {},
    'Documentos': {},
    'Contatos': {},
    'Financeiro': {},
    'Profissional': {},
    'Família': {},
    'Localização': {},
    'Veículos': {},
    'Outros': {},
  };

  for (const [key, value] of Object.entries(data)) {
    const keyLower = key.toLowerCase();
    
    // Pular campos de foto (já exibimos a imagem real separadamente)
    if (PHOTO_FIELDS.includes(keyLower)) continue;
    
    // Pular valores que parecem ser Base64 (strings muito longas começando com /9j/ ou iVBOR)
    if (typeof value === 'string' && (value.startsWith('/9j/') || value.startsWith('iVBOR') || value.startsWith('data:image'))) {
      continue;
    }
    
    // Dados Pessoais
    if (keyLower.includes('nome') || keyLower.includes('sexo') || keyLower.includes('nascimento') || 
        keyLower.includes('civil') || keyLower.includes('raça') || keyLower.includes('sangue') || 
        keyLower.includes('sanguíneo') || keyLower.includes('obito') || keyLower.includes('óbito') ||
        keyLower.includes('naturalidade')) {
      groups['Dados Pessoais'][key] = value;
    } 
    // Documentos
    else if (keyLower.includes('cpf') || keyLower.includes('rg') || keyLower.includes('cnh') ||
               keyLower.includes('pis') || keyLower.includes('nis') || keyLower.includes('cns') ||
               keyLower.includes('titulo') || keyLower.includes('eleitor') || keyLower.includes('título')) {
      groups['Documentos'][key] = value;
    } 
    // Contatos (emails e telefones)
    else if (keyLower.includes('email') || keyLower === 'emails' || 
             keyLower.includes('telefone') || keyLower === 'telefones' || 
             keyLower.includes('whatsapp')) {
      groups['Contatos'][key] = value;
    } 
    // Financeiro
    else if (keyLower.includes('renda') || keyLower.includes('score') || keyLower.includes('banco') ||
               keyLower === 'bancos' || keyLower.includes('receita') || keyLower.includes('inss') ||
               keyLower.includes('status receita')) {
      groups['Financeiro'][key] = value;
    } 
    // Profissional
    else if (keyLower.includes('profissão') || keyLower.includes('emprego') || keyLower === 'empregos' ||
               keyLower.includes('empresa') || keyLower === 'empresas' ||
               keyLower.includes('escolaridade') || keyLower.includes('classe') || keyLower.includes('cnpj') ||
               keyLower.includes('admissão') || keyLower.includes('demissão') || keyLower.includes('razao')) {
      groups['Profissional'][key] = value;
    } 
    // Família (parentes)
    else if (keyLower.includes('mãe') || keyLower.includes('mae') || keyLower.includes('pai') || 
             keyLower.includes('parente') || keyLower === 'parentes') {
      groups['Família'][key] = value;
    }
    // Localização
    else if (keyLower.includes('município') || keyLower.includes('endereço') || keyLower === 'enderecos' ||
               keyLower.includes('cep') || keyLower.includes('cidade') || keyLower.includes('estado') || 
               keyLower.includes('zona') || keyLower.includes('bairro') || keyLower.includes('logradouro')) {
      groups['Localização'][key] = value;
    } 
    // Veículos
    else if (keyLower.includes('veiculo') || keyLower === 'veiculos' || keyLower.includes('placa') ||
             keyLower.includes('chassi') || keyLower.includes('renavam')) {
      groups['Veículos'][key] = value;
    }
    else {
      groups['Outros'][key] = value;
    }
  }

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([_, fields]) => Object.keys(fields).length > 0)
  );
}

// Extrair foto Base64 dos dados
function extractPhoto(data: any): string | null {
  if (!data || typeof data !== 'object') return null;
  
  const fotoData = data?.foto || data?.fotoBase64 || data?.image || data?.photo || data?.url;
  if (!fotoData || typeof fotoData !== 'string') return null;
  
  // Se é Base64 puro (começa com /9j/ para JPEG ou iVBOR para PNG), adicionar prefixo
  if (fotoData.startsWith('/9j/') || fotoData.startsWith('iVBOR')) {
    return `data:image/jpeg;base64,${fotoData}`;
  }
  
  // Se já é data URL ou HTTP URL
  if (fotoData.startsWith('data:image') || fotoData.startsWith('http')) {
    return fotoData;
  }
  
  return null;
}

export function QueryResultFormatter({ data }: QueryResultFormatterProps) {
  if (!data) return null;

  // Handle error responses
  if (data.error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-4 bg-destructive/10 rounded-lg">
        <AlertCircle className="h-5 w-5" />
        <span>{data.error}</span>
      </div>
    );
  }

  // If data is a string, parse it
  let parsedData: ParsedData;
  if (typeof data === 'string') {
    parsedData = parseRawText(data);
  } else if (typeof data === 'object') {
    // Check if there's a nested data field with string
    if (data.data && typeof data.data === 'string') {
      parsedData = parseRawText(data.data);
    } else if (data.TEXTO && typeof data.TEXTO === 'string') {
      // Parse TEXTO field and merge with other fields
      const textoData = parseConcatenatedString(data.TEXTO);
      // Get other fields from data (excluding TEXTO and photo fields)
      const otherFields: ParsedData = {};
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'TEXTO' && key !== 'fotoBase64' && key !== 'foto' && typeof value === 'string') {
          otherFields[key] = value;
        }
      }
      // Merge: texto parsed data takes precedence for rich data
      parsedData = { ...otherFields, ...textoData };
    } else {
      // Filter out TEXTO field from direct object assignment
      const filtered: ParsedData = {};
      for (const [key, value] of Object.entries(data)) {
        if (key !== 'TEXTO') {
          filtered[key] = value as string | string[];
        }
      }
      parsedData = filtered;
    }
  } else {
    return <pre className="text-sm text-muted-foreground">{JSON.stringify(data, null, 2)}</pre>;
  }

  // If parsing didn't find anything useful, show raw
  if (Object.keys(parsedData).length === 0) {
    const rawText = typeof data === 'string' ? data : (data.data || JSON.stringify(data, null, 2));
    return (
      <pre className="text-sm text-muted-foreground whitespace-pre-wrap break-all">
        {rawText}
      </pre>
    );
  }

  // Extrair foto dos dados originais ou parseados
  const photoUrl = extractPhoto(data) || extractPhoto(parsedData);
  
  const groupedData = groupFields(parsedData);

  return (
    <div className="space-y-4">
      {/* Card de Foto - exibido primeiro se houver foto */}
      {photoUrl && (
        <Card className="bg-secondary/30 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Foto
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <img 
              src={photoUrl} 
              alt="Foto do documento" 
              className="max-w-[200px] rounded-lg border border-border shadow-sm"
              onError={(e) => {
                // Esconder imagem se falhar o carregamento
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </CardContent>
        </Card>
      )}
      {Object.entries(groupedData).map(([groupName, fields]) => (
        <Card key={groupName} className="bg-secondary/30 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
              {groupName === 'Dados Pessoais' && <User className="h-4 w-4" />}
              {groupName === 'Documentos' && <FileText className="h-4 w-4" />}
              {groupName === 'Contatos' && <Phone className="h-4 w-4" />}
              {groupName === 'Financeiro' && <CreditCard className="h-4 w-4" />}
              {groupName === 'Profissional' && <Briefcase className="h-4 w-4" />}
              {groupName === 'Localização' && <MapPin className="h-4 w-4" />}
              {groupName === 'Outros' && <Star className="h-4 w-4" />}
              {groupName}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-2">
              {Object.entries(fields).map(([key, value]) => {
                const Icon = getFieldIcon(key);
                
                // Handle array values (like EMAILS, TELEFONES, EMPREGOS)
                if (Array.isArray(value)) {
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium uppercase">{formatLabel(key)}</span>
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
                    </div>
                  );
                }

                return (
                  <div key={key} className="flex items-start gap-2 py-1">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                      <span className="text-xs text-muted-foreground uppercase shrink-0">
                        {formatLabel(key)}:
                      </span>
                      <span className="text-sm font-medium break-all">
                        {String(value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
