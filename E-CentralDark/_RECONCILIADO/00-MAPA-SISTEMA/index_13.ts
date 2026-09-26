/**
 * Skills Manager — MultiZap Bot
 * 
 * Gerencia skills plugáveis do sistema.
 * Skills podem ser ativadas/desativadas pelo painel.
 * 
 * Fontes de skills:
 * 1. Built-in (integrações locais)
 * 2. skills.sh (marketplace — https://www.skills.sh/docs)
 * 3. Custom (criadas pelo usuário)
 * 
 * Uso: import { getSkills, toggleSkill, getSkillsByCategory } from '@/integrations/skills';
 */

import type { Skill, SkillCategory, SkillsRegistry } from './types';

// ══════════════════════════════════════
// CATEGORIAS
// ══════════════════════════════════════

export const SKILL_CATEGORIES: SkillsRegistry['categories'] = [
  { key: 'communication', label: 'Comunicação', icon: '💬' },
  { key: 'ai', label: 'Inteligência Artificial', icon: '🤖' },
  { key: 'automation', label: 'Automação', icon: '⚡' },
  { key: 'payments', label: 'Pagamentos', icon: '💰' },
  { key: 'monitoring', label: 'Monitoramento', icon: '📊' },
  { key: 'deploy', label: 'Deploy & CI/CD', icon: '🚀' },
  { key: 'analytics', label: 'Relatórios', icon: '📈' },
  { key: 'security', label: 'Segurança', icon: '🔒' },
  { key: 'custom', label: 'Customizadas', icon: '🔧' },
];

// ══════════════════════════════════════
// SKILLS BUILT-IN (integrações locais)
// ══════════════════════════════════════

export const BUILTIN_SKILLS: Skill[] = [
  {
    id: 'telegram-alerts',
    slug: 'telegram-alerts',
    name: 'Telegram Alertas',
    description: 'Enviar alertas e notificações para Telegram. Fire-and-forget com throttle.',
    category: 'communication',
    icon: '📨',
    version: '1.0.0',
    source: 'built-in',
    enabled: true,
  },
  {
    id: 'telegram-bot',
    slug: 'telegram-bot',
    name: 'Telegram Bot Conversacional',
    description: 'Bot Telegram com webhook receptor, comandos e integração com IA.',
    category: 'communication',
    icon: '🤖',
    version: '1.0.0',
    source: 'built-in',
    enabled: false,
  },
  {
    id: 'whatsapp-wuzapi',
    slug: 'whatsapp-wuzapi',
    name: 'WhatsApp via WuzAPI',
    description: 'Conexão WhatsApp via WuzAPI/Whatsmeow. QR code, envio e recebimento.',
    category: 'communication',
    icon: '📱',
    version: '1.0.0',
    source: 'built-in',
    enabled: true,
  },
  {
    id: 'ai-central',
    slug: 'ai-central',
    name: 'Central de IA',
    description: 'Router multi-provider para IA. OpenAI, Anthropic, Gemini, Lovable, custom.',
    category: 'ai',
    icon: '🧠',
    version: '1.0.0',
    source: 'built-in',
    enabled: false,
  },
  {
    id: 'ai-assistant',
    slug: 'ai-assistant',
    name: 'Assistente IA',
    description: 'Assistente integrada com modos Master/User/Anon. Responde perguntas sobre o sistema.',
    category: 'ai',
    icon: '💡',
    version: '1.0.0',
    source: 'built-in',
    enabled: false,
  },
  {
    id: 'auto-replies',
    slug: 'auto-replies',
    name: 'Auto Respostas',
    description: 'Respostas automáticas por keyword. Exact match, contains, starts_with, regex.',
    category: 'automation',
    icon: '⚡',
    version: '1.0.0',
    source: 'built-in',
    enabled: true,
  },
  {
    id: 'chatbot-flows',
    slug: 'chatbot-flows',
    name: 'Fluxos de Chatbot',
    description: 'Fluxos visuais de atendimento com nós e condições.',
    category: 'automation',
    icon: '🔀',
    version: '1.0.0',
    source: 'built-in',
    enabled: false,
  },
  {
    id: 'campaigns',
    slug: 'campaigns',
    name: 'Campanhas de Disparo',
    description: 'Envio em massa com controle de rate limit e relatórios.',
    category: 'automation',
    icon: '📢',
    version: '1.0.0',
    source: 'built-in',
    enabled: true,
  },
  {
    id: 'pix-payments',
    slug: 'pix-payments',
    name: 'Pagamentos PIX',
    description: 'Gerar cobranças PIX, confirmar pagamentos, ledger financeiro.',
    category: 'payments',
    icon: '💳',
    version: '1.0.0',
    source: 'built-in',
    enabled: false,
  },
  {
    id: 'monitor-heartbeat',
    slug: 'monitor-heartbeat',
    name: 'Monitor & Heartbeat',
    description: 'Health check de serviços com alertas automáticos.',
    category: 'monitoring',
    icon: '💓',
    version: '1.0.0',
    source: 'built-in',
    enabled: true,
  },
  {
    id: 'github-deploy',
    slug: 'github-deploy',
    name: 'GitHub Deploy',
    description: 'Deploy automático via GitHub Actions e webhooks.',
    category: 'deploy',
    icon: '🚀',
    version: '1.0.0',
    source: 'built-in',
    enabled: true,
  },
];

// ══════════════════════════════════════
// FUNÇÕES
// ══════════════════════════════════════

export function getAllSkills(): Skill[] {
  return [...BUILTIN_SKILLS];
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return BUILTIN_SKILLS.filter(s => s.category === category);
}

export function getEnabledSkills(): Skill[] {
  return BUILTIN_SKILLS.filter(s => s.enabled);
}

export function getSkill(slug: string): Skill | undefined {
  return BUILTIN_SKILLS.find(s => s.slug === slug);
}

export function toggleSkill(slug: string, enabled: boolean): Skill | undefined {
  const skill = BUILTIN_SKILLS.find(s => s.slug === slug);
  if (skill) skill.enabled = enabled;
  return skill;
}

export function getRegistry(): SkillsRegistry {
  return {
    skills: getAllSkills(),
    categories: SKILL_CATEGORIES,
  };
}

// Re-export
export type { Skill, SkillCategory, SkillsRegistry, SkillToggleEvent } from './types';
