import { supabase } from "@/lib/supabase";

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface SystemLog {
  workspace_id?: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  level: LogLevel;
}

export const logService = {
  async log(log: SystemLog) {
    // 2026-05-31: RLS 403 bloqueando logs diretos do frontend.
    // Suspender insert. Logs críticos devem trafegar apenas server-side (Node Gateway/Edge Functions)
    // para evitar vazamentos de permissões RLS públicas.
    console.log(`[LogService/${log.level}]: ${log.action}`);
  },

  async info(action: string, details?: any, workspace_id?: string, user_id?: string) {
    return this.log({ action, details, workspace_id, user_id, level: 'info' });
  },

  async error(action: string, details?: any, workspace_id?: string, user_id?: string) {
    return this.log({ action, details, workspace_id, user_id, level: 'error' });
  },

  async warn(action: string, details?: any, workspace_id?: string, user_id?: string) {
    return this.log({ action, details, workspace_id, user_id, level: 'warn' });
  },

  async critical(action: string, details?: any, workspace_id?: string, user_id?: string) {
    return this.log({ action, details, workspace_id, user_id, level: 'critical' });
  }
};
