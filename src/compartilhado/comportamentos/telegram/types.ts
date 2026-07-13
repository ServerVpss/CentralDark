// Tipos compartilhados para os hooks de Telegram

export interface TelegramBot {
  id: string;
  name: string;
  token: string;
  bot_username: string | null;
  bot_id: number | null;
  webhook_url: string | null;
  webhook_active: boolean;
  is_active: boolean;
  last_health_check: string | null;
  health_status: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  bot_photo_url?: string | null;
}

export interface BotSecuritySettings {
  id: string;
  bot_id: string;
  anti_link_enabled: boolean;
  anti_link_action: string;
  anti_spam_enabled: boolean;
  anti_spam_max_messages: number;
  anti_spam_interval_seconds: number;
  anti_spam_action: string;
  anti_flood_enabled: boolean;
  anti_flood_max_messages: number;
  anti_flood_interval_seconds: number;
  anti_flood_action: string;
  welcome_message_enabled: boolean;
  welcome_message: string | null;
  user_id: string | null;
  // Anti-rajada de consultas
  query_rate_limit_enabled?: boolean;
  query_cooldown_seconds?: number;
  query_max_per_minute?: number;
  query_mute_minutes?: number;
}

