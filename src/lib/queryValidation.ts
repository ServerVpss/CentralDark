// Validation utilities for query inputs
import { z } from "zod";

// CPF validation and formatting
export const cpfSchema = z.string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 11, { message: "CPF deve ter 11 dígitos" })
  .refine((val) => !['00000000000', '11111111111', '22222222222', '33333333333', 
    '44444444444', '55555555555', '66666666666', '77777777777', '88888888888', '99999999999'].includes(val), 
    { message: "CPF inválido" });

// CNPJ validation
export const cnpjSchema = z.string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 14, { message: "CNPJ deve ter 14 dígitos" });

// Telefone validation
export const telefoneSchema = z.string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length >= 10 && val.length <= 11, { message: "Telefone deve ter 10 ou 11 dígitos" });

// CEP validation
export const cepSchema = z.string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 8, { message: "CEP deve ter 8 dígitos" });

// Placa validation (both old and Mercosul formats)
export const placaSchema = z.string()
  .transform((val) => val.replace(/[^A-Za-z0-9]/g, '').toUpperCase())
  .refine((val) => /^[A-Z]{3}[0-9]{4}$/.test(val) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(val), 
    { message: "Placa inválida. Use ABC1234 ou ABC1D23" });

// Email validation
export const emailSchema = z.string()
  .email({ message: "Email inválido" })
  .max(255, { message: "Email muito longo" });

// Nome validation
export const nomeSchema = z.string()
  .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
  .max(100, { message: "Nome muito longo" })
  .transform((val) => val.trim().toUpperCase());

// RG validation
export const rgSchema = z.string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length >= 5 && val.length <= 15, { message: "RG inválido" });

// CNH validation
export const cnhSchema = z.string()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 11, { message: "CNH deve ter 11 dígitos" });

// PIX validation (CPF, CNPJ, email, telefone ou chave aleatória)
export const pixSchema = z.string()
  .min(1, { message: "Chave PIX não pode estar vazia" })
  .max(100, { message: "Chave PIX muito longa" })
  .transform((val) => val.trim());

// Score validation (CPF)
export const scoreSchema = cpfSchema;

// Foto validation (CPF)
export const fotoSchema = cpfSchema;

// Nacional validation (CPF)
export const nacionalSchema = cpfSchema;

// Map query types to their schemas
// Using z.ZodType<string, any, string> for flexibility with nested transforms/refines
const schemaMap: Record<string, z.ZodType<string, z.ZodTypeDef, string>> = {
  cpf: cpfSchema,
  cnpj: cnpjSchema,
  telefone: telefoneSchema,
  cep: cepSchema,
  placa: placaSchema,
  placa_completa: placaSchema,
  email: emailSchema,
  nome: nomeSchema,
  rg: rgSchema,
  cnh: cnhSchema,
  pix: pixSchema,
  score: scoreSchema,
  foto: fotoSchema,
  nacional: nacionalSchema,
};

export interface ValidationResult {
  isValid: boolean;
  cleanValue: string;
  error?: string;
}

/**
 * Validates and cleans input based on query type
 */
export function validateQueryInput(queryType: string, input: string): ValidationResult {
  const schema = schemaMap[queryType.toLowerCase()];
  
  if (!schema) {
    return { isValid: true, cleanValue: input.trim() };
  }

  const result = schema.safeParse(input);
  
  if (result.success) {
    return { isValid: true, cleanValue: result.data };
  }
  
  return {
    isValid: false,
    cleanValue: input,
    error: result.error.errors[0]?.message || "Entrada inválida",
  };
}

/**
 * Formats a value for display
 */
export function formatForDisplay(queryType: string, value: string): string {
  const cleanValue = value.replace(/\D/g, '');
  
  switch (queryType.toLowerCase()) {
    case 'cpf':
      if (cleanValue.length === 11) {
        return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      }
      break;
    case 'cnpj':
      if (cleanValue.length === 14) {
        return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      }
      break;
    case 'telefone':
      if (cleanValue.length === 11) {
        return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      }
      if (cleanValue.length === 10) {
        return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      break;
    case 'cep':
      if (cleanValue.length === 8) {
        return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
      }
      break;
    case 'placa':
    case 'placa_completa':
      const upperPlaca = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (upperPlaca.length === 7) {
        return upperPlaca.replace(/(\w{3})(\w{4})/, '$1-$2');
      }
      break;
  }
  
  return value;
}

/**
 * Get placeholder text based on query type
 */
export function getPlaceholder(queryType: string): string {
  const placeholders: Record<string, string> = {
    cpf: 'Ex: 123.456.789-00 ou 12345678900',
    cnpj: 'Ex: 12.345.678/0001-00 ou 12345678000100',
    telefone: 'Ex: (11) 99999-9999 ou 11999999999',
    cep: 'Ex: 01310-100 ou 01310100',
    placa: 'Ex: ABC-1234 ou ABC1D23',
    placa_completa: 'Ex: ABC-1234 ou ABC1D23',
    email: 'Ex: usuario@email.com',
    nome: 'Ex: JOÃO DA SILVA',
    rg: 'Ex: 12.345.678-9',
    cnh: 'Ex: 12345678901',
    pix: 'CPF, CNPJ, email, telefone ou chave aleatória',
    score: 'Ex: 12345678900 (CPF)',
    foto: 'Ex: 12345678900 (CPF)',
    nacional: 'Ex: 12345678900 (CPF)',
  };
  
  return placeholders[queryType.toLowerCase()] || 'Digite o valor...';
}
