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

// Lista de chaves conhecidas para parsing de strings concatenadas
const KNOWN_KEYS = [
  'Nome', 'CPF', 'Mãe', 'Pai', 'Nascimento', 'Sexo', 'RG', 'CNH', 'PIS', 'NIS', 'CNS',
  'Alcunha', 'Nome Social', 'Orientação Sexual', 'Identidade de Gênero', 'Deficiência',
  'Raça/Cor', 'Raça', 'Cor', 'Estado Civil', 'Naturalidade', 'Nacionalidade', 'Óbito',
  'Escolaridade', 'Profissão', 'Renda', 'Score', 'Classe', 'Classe Social', 'Título Eleitor',
  'Zona', 'Seção', 'Email', 'Telefone', 'Endereço', 'CEP', 'Bairro', 'Cidade', 'Estado', 'UF',
  'Município', 'Logradouro', 'Número', 'Complemento', 'TEXTO'
];

// Parse concatenated string like "Nome: X Mãe: Y CPF: Z"
function parseConcatenatedString(text: string): ParsedData {
  const result: ParsedData = {};
  
  // Build regex to split by known keys
  const keysPattern = KNOWN_KEYS.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const regex = new RegExp(`(${keysPattern}):\\s*`, 'gi');
  
  // Find all matches with positions
  const matches: { key: string; index: number }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push({ key: match[1], index: match.index });
  }
  
  // Extract values between keys
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i];
    const nextMatch = matches[i + 1];
    
    const valueStart = currentMatch.index + currentMatch.key.length + 1; // +1 for ':'
    const valueEnd = nextMatch ? nextMatch.index : text.length;
    
    let value = text.substring(valueStart, valueEnd).trim();
    
    // Remove trailing space before next key
    value = value.replace(/\s+$/, '');
    
    // Skip "Não informado" or empty values
    if (value && value.toLowerCase() !== 'não informado' && value !== '-') {
      // Skip TEXTO field as it's just a wrapper
      if (currentMatch.key.toUpperCase() !== 'TEXTO') {
        result[currentMatch.key] = value;
      }
    }
  }
  
  return result;
}

// Parse the raw text response into structured data
function parseRawText(text: string): ParsedData {
  const result: ParsedData = {};
  
  // Remove the bot reference if present
  let cleanText = text.replace(/@\w+\\n/g, '').replace(/@\w+\n/g, '');
  
  // First, try to parse as concatenated string (no line breaks)
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
    
    // Try parsing each line as concatenated string
    const parsedLine = parseConcatenatedString(trimmedLine);
    if (Object.keys(parsedLine).length > 1) {
      Object.assign(result, parsedLine);
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
    
    // Check for key-value pairs
    const kvMatch = trimmedLine.match(/^([^:–\-]+)\s*[–\-]\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1].trim();
      const value = kvMatch[2].trim();
      
      if (currentSection && Array.isArray(result[currentSection])) {
        (result[currentSection] as string[]).push(`${key}: ${value}`);
      } else if (value && value.toLowerCase() !== 'não informado') {
        result[key] = value;
      }
      continue;
    }
    
    // Check for simple key: value format
    const simpleKvMatch = trimmedLine.match(/^([^:]+):\s*(.+)$/);
    if (simpleKvMatch) {
      const key = simpleKvMatch[1].trim();
      const value = simpleKvMatch[2].trim();
      if (value && value.toLowerCase() !== 'não informado' && key.toUpperCase() !== 'TEXTO') {
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
    'Localização': {},
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
    
    if (keyLower.includes('nome') || keyLower.includes('sexo') || keyLower.includes('nascimento') || 
        keyLower.includes('civil') || keyLower.includes('mãe') || keyLower.includes('pai') ||
        keyLower.includes('raça') || keyLower.includes('sangue') || keyLower.includes('obito')) {
      groups['Dados Pessoais'][key] = value;
    } else if (keyLower.includes('cpf') || keyLower.includes('rg') || keyLower.includes('cnh') ||
               keyLower.includes('pis') || keyLower.includes('nis') || keyLower.includes('cns') ||
               keyLower.includes('titulo') || keyLower.includes('eleitor')) {
      groups['Documentos'][key] = value;
    } else if (keyLower.includes('email') || keyLower.includes('telefone') || keyLower.includes('whatsapp')) {
      groups['Contatos'][key] = value;
    } else if (keyLower.includes('renda') || keyLower.includes('score') || keyLower.includes('banco') ||
               keyLower.includes('receita') || keyLower.includes('inss')) {
      groups['Financeiro'][key] = value;
    } else if (keyLower.includes('profissão') || keyLower.includes('emprego') || keyLower.includes('empresa') ||
               keyLower.includes('escolaridade') || keyLower.includes('classe') || keyLower.includes('cnpj') ||
               keyLower.includes('admissão') || keyLower.includes('demissão') || keyLower.includes('razao')) {
      groups['Profissional'][key] = value;
    } else if (keyLower.includes('município') || keyLower.includes('endereço') || keyLower.includes('cep') ||
               keyLower.includes('cidade') || keyLower.includes('estado') || keyLower.includes('zona')) {
      groups['Localização'][key] = value;
    } else {
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
    } else {
      parsedData = data;
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
