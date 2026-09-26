/**
 * Integração GitHub Deploy — MultiZap Bot
 * 
 * Gerencia deploys automáticos via GitHub.
 * Monitora status dos repos, PRs e workflows.
 * 
 * Funcionalidades:
 * - Listar repos conectados
 * - Ver status dos deploys
 * - Disparar deploy manual
 * - Logs de deploy
 */

export interface GitHubRepo {
  id: string;
  owner: string;
  name: string;
  branch: string;
  lastDeployAt: string | null;
  lastDeployStatus: 'success' | 'failure' | 'pending' | null;
}

export interface DeployLog {
  id: string;
  repoId: string;
  commitSha: string;
  status: 'success' | 'failure' | 'running';
  startedAt: string;
  finishedAt: string | null;
  logs: string;
}

// Placeholder — implementação via Supabase tables:
// github_integrations, github_deploys, github_deploy_packages
export async function listRepos(): Promise<GitHubRepo[]> {
  return [];
}

export async function getDeployLogs(repoId: string): Promise<DeployLog[]> {
  return [];
}

export async function triggerDeploy(repoId: string): Promise<{ ok: boolean }> {
  return { ok: false };
}
