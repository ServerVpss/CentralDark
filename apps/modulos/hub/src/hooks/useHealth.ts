import { useState, useEffect } from 'react';

// Mapeia payload real do /health do MCP (mcp.centralldark.com)
// que responde: { ok: true, service, version, catalogVersion, toolCount, time }
// para o formato que o HealthCard espera.
export function useHealth() {
  const [health, setHealth] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const startedAt = Date.now();

    const fetchHealth = async () => {
      try {
        const t0 = performance.now();
        const res = await fetch('https://mcp.centralldark.com/health', { cache: 'no-store' });
        const latency = Math.round(performance.now() - t0);
        const raw = await res.json();

        // Normaliza para o formato interno
        const status: 'healthy' | 'degraded' | 'down' =
          raw?.ok === true ? 'healthy' : res.ok ? 'degraded' : 'down';

        const mapped = {
          status,
          service: raw?.service ?? 'mcp-centraldark',
          version: raw?.version ?? '—',
          catalogVersion: raw?.catalogVersion ?? '—',
          toolCount: raw?.toolCount ?? 0,
          latency,
          lastCheck: new Date(raw?.time ?? Date.now()).toLocaleTimeString('pt-BR'),
          uptime: Math.floor((Date.now() - startedAt) / 1000),
          // MCP /health não expõe CPU/RAM ainda — mantemos placeholders
          cpu: null,
          memory: null,
          services: [
            { name: 'MCP Gateway', status },
            { name: `Catálogo (${raw?.toolCount ?? 0} tools)`, status },
          ],
        };

        if (!alive) return;
        setHealth(mapped);
        setTimeline(raw?.history ?? []);
        setAlerts(raw?.alerts ?? []);
      } catch (err) {
        console.error('Health check failed', err);
        if (!alive) return;
        setHealth({ status: 'down', lastCheck: new Date().toLocaleTimeString('pt-BR') });
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchHealth();
    const timer = setInterval(fetchHealth, 30000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return { health, alerts, timeline, loading };
}
