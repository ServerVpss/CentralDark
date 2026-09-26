// Cliente HTTP fino pro backend real do MCP CentralDark.
// Todas as rotas abaixo já existem em apps/modulos/mcp/src/{index,admin}.js —
// nenhuma foi inventada. Endpoints /admin/api/* exigem cookie cd_admin (HttpOnly),
// obtido via POST /admin/login (credentials: "include").

export interface ToolInfo {
  name: string;
  description?: string;
}

export interface ToolsResponse {
  total: number;
  categorias: Record<string, ToolInfo[]>;
}

export interface MetricasResponse {
  janelaMin: number;
  erros: number;
  warns: number;
  requests: number;
  sseAtivas: number;
}

export interface LogLine {
  t: string;
  level: "debug" | "info" | "warn" | "error";
  msg: string;
  meta?: Record<string, unknown>;
  rota?: string;
  cid?: string;
}

export interface LogsResponse {
  total: number;
  logs: LogLine[];
}

export interface HealthResponse {
  ok: boolean;
  service: string;
  version: string;
  catalogVersion: string;
  toolCount: number;
  time: string;
}

export interface HealthDeepResponse {
  score?: number;
  status?: string;
  uptimeSec?: number;
  uptimeLegivel?: string;
  memoryMb?: { rss: number; heap: number };
  loadavg?: number[];
  dependencias?: Array<{ nome?: string; key?: string; ok: boolean }>;
  checks?: Array<{ nome?: string; key?: string; ok: boolean }>;
  sse?: { eventosPorMinuto?: number; ultimoEventoHaMs?: number | null };
  sseAtivas?: number;
  versao?: string;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, { credentials: "include", ...init });
  if (r.status === 401) throw new ApiError(401, "não autenticado");
  if (!r.ok) throw new ApiError(r.status, `HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

export const api = {
  async login(password: string): Promise<boolean> {
    const r = await fetch("/admin/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ password }).toString(),
      redirect: "manual",
    });
    // backend responde 302 redirect pro /admin em sucesso; em falha, 401 com HTML.
    return r.status === 0 || r.status === 302 || r.ok;
  },
  async logout(): Promise<void> {
    await fetch("/admin/logout", { credentials: "include", redirect: "manual" });
  },
  tools: () => req<ToolsResponse>("/admin/api/tools"),
  metricas: () => req<MetricasResponse>("/admin/api/metricas"),
  logs: (params?: { rota?: string; cid?: string; level?: string; q?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.rota) qs.set("rota", params.rota);
    if (params?.cid) qs.set("cid", params.cid);
    if (params?.level) qs.set("level", params.level);
    if (params?.q) qs.set("q", params.q);
    qs.set("limit", String(params?.limit ?? 200));
    return req<LogsResponse>(`/admin/api/logs?${qs.toString()}`);
  },
  health: () => req<HealthResponse>("/health"),
  healthDeep: () => req<HealthDeepResponse>("/health/deep"),
};

export { ApiError };
