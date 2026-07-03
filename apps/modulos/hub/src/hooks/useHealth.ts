import { useState, useEffect } from 'react';

export function useHealth() {
  const [health, setHealth] = useState<any>(null);
  const [alerts, setAlerts] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch('https://mcp.centralldark.com/health');
        const data = await res.json();
        setHealth(data);
        // Mock de timeline e alertas para demonstração
        setTimeline(data.history || []);
        setAlerts(data.alerts || []);
      } catch (err) {
        console.error('Health check failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const timer = setInterval(fetchHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  return { health, alerts, timeline, loading };
}