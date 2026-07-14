// Hook central da Sala de Controle. Hoje devolve MOCK estruturado no formato
// que o Grok vai entregar. Quando o dossiê chegar, trocar a fonte por fetch
// real (HUB /cockpit/state ou WebSocket) sem mexer no visual.
import { useEffect, useState } from "react";

export type NoStatus = "ok" | "warn" | "down" | "idle";

export interface CockpitNo {
  id: string;
  nome: string;
  grupo: "vps" | "pm2" | "edge" | "bot" | "gateway" | "mcp" | "hub";
  status: NoStatus;
  detalhe?: string;
  x: number; // 0..100
  y: number; // 0..100
}

export interface CockpitLink {
  de: string;
  para: string;
}

export interface CockpitEvento {
  id: string;
  ts: string;
  fonte: string;
  texto: string;
  tom: "info" | "ok" | "warn" | "err";
}

export interface CockpitLog {
  id: string;
  ts: string;
  linha: string;
}

export interface CockpitState {
  online: boolean;
  atualizadoEm: string;
  nos: CockpitNo[];
  links: CockpitLink[];
  eventos: CockpitEvento[];
  console: CockpitLog[];
}

const MOCK: CockpitState = {
  online: true,
  atualizadoEm: new Date().toISOString(),
  nos: [
    { id: "vps",     nome: "VPS Hostinger",   grupo: "vps",     status: "ok",   detalhe: "load 0.42", x: 50, y: 12 },
    { id: "pm2",     nome: "PM2 (24 procs)",  grupo: "pm2",     status: "ok",   detalhe: "24 online", x: 20, y: 38 },
    { id: "gateway", nome: "Gateway",         grupo: "gateway", status: "ok",   detalhe: "api.centralldark.com", x: 80, y: 38 },
    { id: "hub",     nome: "HUB Supabase",    grupo: "hub",     status: "ok",   detalhe: "lyoigs…", x: 50, y: 50 },
    { id: "hermes",  nome: "Hermes-Core",     grupo: "pm2",     status: "ok",   detalhe: "loop 24h", x: 15, y: 68 },
    { id: "arsenal", nome: "Arsenal Adapter", grupo: "pm2",     status: "ok",   detalhe: "20 IAs",   x: 85, y: 68 },
    { id: "bot1",    nome: "@srver1bot",      grupo: "bot",     status: "ok",   detalhe: "webhook OK", x: 35, y: 88 },
    { id: "bot2",    nome: "@SEGREDOPUXADAS", grupo: "bot",     status: "warn", detalhe: "puxadas fila 3", x: 65, y: 88 },
    { id: "mcp",     nome: "MCP",             grupo: "mcp",     status: "idle", detalhe: "aguardando dossiê", x: 92, y: 12 },
  ],
  links: [
    { de: "vps", para: "pm2" },
    { de: "vps", para: "gateway" },
    { de: "pm2", para: "hermes" },
    { de: "pm2", para: "arsenal" },
    { de: "gateway", para: "hub" },
    { de: "hub", para: "bot1" },
    { de: "hub", para: "bot2" },
    { de: "hermes", para: "hub" },
    { de: "arsenal", para: "gateway" },
  ],
  eventos: [
    { id: "e1", ts: agora(-2),  fonte: "Hermes",          texto: "Executor verificando PM2 id 27", tom: "info" },
    { id: "e2", ts: agora(-5),  fonte: "Deploy-Watcher",  texto: "SHA aprovado sincronizado",       tom: "ok" },
    { id: "e3", ts: agora(-9),  fonte: "Arsenal",         texto: "Debate rodada 3 · consenso 82%", tom: "info" },
    { id: "e4", ts: agora(-14), fonte: "Bot @SEGREDO",    texto: "Fila de puxadas subiu pra 3",    tom: "warn" },
    { id: "e5", ts: agora(-22), fonte: "Gateway",         texto: "134 modelos disponíveis",         tom: "ok" },
    { id: "e6", ts: agora(-31), fonte: "Hermes-Critic",   texto: "Auto-diagnóstico OK",             tom: "ok" },
  ],
  console: [
    { id: "c1", ts: agora(-1),  linha: "$ pm2 status | grep -c online → 24" },
    { id: "c2", ts: agora(-4),  linha: "$ curl -s api.centralldark.com/status → 200" },
    { id: "c3", ts: agora(-8),  linha: "$ hermes-core::executor.run(id=27) OK" },
    { id: "c4", ts: agora(-12), linha: "$ arsenal::debate.round(3) consensus=0.82" },
    { id: "c5", ts: agora(-18), linha: "$ hub.select('hub_events') rows=142" },
  ],
};

function agora(offsetSeg: number) {
  return new Date(Date.now() + offsetSeg * 1000).toISOString();
}

export function useCockpitLive() {
  const [state, setState] = useState<CockpitState>(MOCK);

  // Simula pulsação viva (só troca timestamp + rotaciona um evento)
  useEffect(() => {
    const t = setInterval(() => {
      setState((s) => ({
        ...s,
        atualizadoEm: new Date().toISOString(),
      }));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return state;
}
