import { getSystemPrompt } from './prompts';
import type { DesignScheme } from '~/types/design-scheme';

export function getFineTunedPrompt(
  cwd: string,
  supabase?: { isConnected: boolean; hasSelectedProject: boolean; credentials?: { anonKey?: string; supabaseUrl?: string } },
  designScheme?: DesignScheme
): string {
  return getSystemPrompt(cwd, supabase, designScheme);
}
