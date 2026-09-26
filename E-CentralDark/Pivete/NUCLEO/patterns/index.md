# PADRAO - index.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\supabase\functions\api-query\index.ts
**SHA:** 6972770cb7f5fc2d
**Timestamp:** 2026-08-28T02:55:36.435364
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const providerStart = Date.now();

### Ouro Bruto (primeiros 5000 chars)
```
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// =============== WHITELIST EXATA DOS 75 MÓDULOS ===============
const MODULE_WHITELIST = new Set([
  // Pessoa
  "cpf", "cpfbasico", "nome", "rg", "titulo", "parentes", "mae", "cnh", "pis",
  "pai", "nasc", "nis", "obito", "registro", "nomeabreviadofiltros",
  // Documentos
  "cnham", "cnhrs", "cnhrr", "cnhnc", "oab",
  "advogadooab", "advogadocpf", "advogadooabuf",
  "catcpf", "catnumero",
  // Contato
  "telefone", "email", "cep", "endereco",
  // Financeiro
  "pix", "score", "renda", "credilink", "poderaquisitivo",
  "dividas", "bens", "irpf", "score2", "cheque", "assessoria", "iptu",
  // Veículos
  "placa", "chassi", "renavam", "motor",
  "veiculos", "crlvto", "crlvmt", "crlvto-foto", "crlvmt-foto",
  // Empresa
  "cnpj",
  // Justiça
  "processos", "siel", "mandado", "certidoes", "processo",
  // Governo
  "vacinas", "beneficios", "faculdades", "func", "matricula",
  // Trabalho
  "rais",
  // SUS
  // TSE
  "tse-3",
  // Fotos por estado
  "fotomg", "fotosp", "fotorj", "fotoce",
  "fotopr", "fotoma", "fotoes", "fotodf",
  "fototo", "fotoms", "fotoro", "fotopi",
  "fotoal", "fotogo", "fotopb", "fotope", "fotorn",
  "fotonc", "fotocnh", "fotodetran", "fotomapresos",
]);

// Mapeamento de módulo interno → nome real na VeiculosAPI
// Todos os 75 módulos passam pela mesma API com nomes iseek-*
const MODULE_API_NAME: Record<string, string> = {
  // Pessoa
  "cpf": "iseek-cpf",
  "cpfbasico": "iseek-cpfbasico",
  "nome": "iseek-dados---nomeabreviadofiltros",
  "rg": "iseek-dados---rg",
  "titulo": "iseek-dados---titulo",
  "parentes": "iseek-dados---parentes",
  "mae": "iseek-dados---mae",
  "cnh": "iseek-dados---cnh",
  "pis": "iseek-dados---pis",
  "pai": "iseek-dados---pai",
  "nasc": "iseek-dados---nasc",
  "nis": "iseek-dados---nis",
  "obito": "iseek-dados---obito",
  "registro": "iseek-dados---registro",
  "nomeabreviadofiltros": "iseek-dados---nomeabreviadofiltros",
  // Documentos
  "cnham": "iseek-dados---cnham",
  "cnhrs": "iseek-dados---cnhrs",
  "cnhrr": "iseek-dados---cnhrr",
  "cnhnc": "iseek-dados---cnhnc",
  "oab": "iseek-dados---oab",
  "advogadooab": "iseek-dados---advogadooab",
  "advogadocpf": "iseek-dados---advogadocpf",
  "advogadooabuf": "iseek-dados---advogadooabuf",
  "catcpf": "iseek-dados---catcpf",
  "catnumero": "iseek-dados---catnumero",
  // Contato
  "telefone": "iseek-dados---telefone",
  "email": "iseek-dados---email",
  "cep": "iseek-dados---cep",
  "endereco": "iseek-dados---endereco",
  // Financeiro
  "pix": "iseek-dados---pix",
  "score": "iseek-dados---score",
  "renda": "iseek-dados---renda",
  "credilink": "iseek-dados---credilink",
  "poderaquisitivo": "iseek-dados---poderaquisitivo",
  "dividas": "iseek-dados---dividas",
  "bens": "iseek-dados---bens",
  "irpf": "iseek-dados---irpf",
  "score2": "iseek-dados---score2",
  "cheque": "iseek-dados---cheque",
  "assessoria": "iseek-dados---assessoria",
  "iptu": "iseek-dados---iptu",
  // Veículos
  "placa": "iseek-dados---placa",
  "chassi": "iseek-dados---chassi",
  "renavam": "iseek-dados---renavam",
  "motor": "iseek-dados---motor",
  "veiculos": "iseek-dados---veiculos",
  "crlvto": "iseek-dados---crlvto",
  "crlvmt": "iseek-dados---crlvmt",
  "crlvto-foto": "iseek-fotos---crlvto",
  "crlvmt-foto": "iseek-fotos---crlvmt",
  // Empresa
  "cnpj": "iseek-dados---cnpj",
  // Justiça
  "processos": "iseek-dados---processos",
  "siel": "iseek-dados---siel",
  "mandado": "iseek-dados---mandado",
  "certidoes": "iseek-dados---certidoes",
  "processo": "iseek-dados---processo",
  // Governo
  "vacinas": "iseek-dados---vacinas",
  "beneficios": "iseek-dados---beneficios",
  "faculdades": "iseek-dados---faculdades",
  "func": "iseek-dados---func",
  "matricula": "iseek-dados---matricula",
  // Trabalho
  "rais": "iseek-dados---rais",
  // TSE
  "tse-3": "iseek-dados---tse-3",
  // Fotos por estado
  "fotomg": "iseek-fotos---fotomg",
  "fotosp": "iseek-fotos---fotosp",
  "fotorj": "iseek-fotos---fotorj",
  "fotoce": "iseek-fotos---fotoce",
  "fotopr": "iseek-fotos---fotopr",
  "fotoma": "iseek-fotos---fotoma",
  "fotoes": "iseek-fotos---fotoes",
  "fotodf": "iseek-fotos---fotodf",
  "fototo": "iseek-fotos---fototo",
  "fotoms": "iseek-fotos---fotoms",
  "fotoro": "iseek-fotos---fotoro",
  "fotopi": "iseek-fotos---fotopi",
  "fotoal": "iseek-fotos---fotoal",
  "fotogo": "iseek-fotos---fotogo",
  "fotopb": "iseek-fotos---fotopb",
  "fotope": "iseek-fotos---fotope",
  "fotorn": "iseek-fotos---fotorn",
  "fotonc": "iseek-fotos---fotonc",
  "fotocnh": "iseek-fotos---fotocnh",
  "fotodetran": "iseek-dados---fotodetran",
  "fo
```