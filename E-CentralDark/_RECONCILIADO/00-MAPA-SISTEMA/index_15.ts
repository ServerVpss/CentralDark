/**
 * Integrações — MultiZap Bot
 * 
 * Ponto de entrada central para todas as integrações.
 * Cada integração é independente e pode ser ativada/desativada.
 * 
 * Uso:
 *   import { telegram, whatsapp, ai, skills } from '@/integrations';
 */

export * as telegram from './telegram';
export * as whatsapp from './whatsapp';
export * as ai from './ai';
export * as githubDeploy from './github-deploy';
export * as payments from './payments';
export * as monitor from './monitor';
export * as skills from './skills';
