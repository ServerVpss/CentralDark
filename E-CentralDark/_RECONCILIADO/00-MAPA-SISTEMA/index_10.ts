/**
 * Integração Monitor — MultiZap Bot
 * 
 * Monitoramento de serviços: Gateway, WuzAPI, Supabase, DNS.
 * Heartbeat periódico com alertas via Telegram.
 * 
 * Funcionalidades:
 * - Health check de todos os serviços
 * - Heartbeat periódico
 * - Alertas automáticos (Telegram + in-app)
 * - Dashboard de status
 */
import { isoBR } from "@/lib/datetime";

export interface HealthCheck {
  target: string;
  label: string;
  status: 'ok' | 'warn' | 'down';
  latencyMs: number;
  details?: string;
  checkedAt: string;
}

export interface HeartbeatRecord {
  id: string;
  target: string;
  status: 'ok' | 'warn' | 'down';
  latencyMs: number;
  alertSent: boolean;
  createdAt: string;
}

// Targets monitorados
export const MONITOR_TARGETS = [
  { key: 'gateway', label: 'MultiZap Gateway', url: 'https://proxy.multizap.dev/health' },
  { key: 'webhook', label: 'GitHub Webhook', url: 'https://hook.multizap.dev/health' },
  { key: 'supabase', label: 'Supabase REST', url: '' }, // URL vem do .env
  { key: 'bot', label: 'Bot Frontend', url: 'https://bot.multizap.dev' },
  { key: 'crm', label: 'CRM Frontend', url: 'https://crm.multizap.dev' },
];

export async function runHealthCheck(target: typeof MONITOR_TARGETS[0]): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const res = await fetch(target.url, { signal: AbortSignal.timeout(5000) });
    return {
      target: target.key,
      label: target.label,
      status: res.ok ? 'ok' : 'warn',
      latencyMs: Date.now() - start,
      checkedAt: isoBR(),
    };
  } catch {
    return {
      target: target.key,
      label: target.label,
      status: 'down',
      latencyMs: Date.now() - start,
      checkedAt: isoBR(),
    };
  }
}

export async function runAllChecks(): Promise<HealthCheck[]> {
  return Promise.all(MONITOR_TARGETS.filter(t => t.url).map(runHealthCheck));
}
