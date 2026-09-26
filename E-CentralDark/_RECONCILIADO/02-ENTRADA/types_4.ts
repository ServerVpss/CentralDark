export interface Skill {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: SkillCategory;
  icon: string;
  version: string;
  source: string; // ex: 'built-in', 'skills.sh', 'custom'
  sourceRepo?: string; // ex: 'vercel-labs/agent-skills'
  enabled: boolean;
  config?: Record<string, unknown>;
}

export type SkillCategory =
  | 'communication'  // Telegram, WhatsApp, Email
  | 'ai'             // OpenAI, Anthropic, Gemini
  | 'automation'     // Fluxos, Auto-respostas, Chatbot
  | 'payments'       // PIX, Boleto, Cartão
  | 'monitoring'     // Health, Heartbeat, Alertas
  | 'deploy'         // GitHub, CI/CD
  | 'analytics'      // Relatórios, Dashboards
  | 'security'       // Auth, Vault, Audit
  | 'custom';        // Skills customizadas

export interface SkillToggleEvent {
  skillId: string;
  enabled: boolean;
  toggledBy: string;
  toggledAt: string;
}

export interface SkillsRegistry {
  skills: Skill[];
  categories: { key: SkillCategory; label: string; icon: string }[];
}
