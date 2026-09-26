export type Intent =
  | "STATUS_READONLY"
  | "OPEN_MODULE"
  | "STOP_ALL"
  | "CHAT"
  | "UNKNOWN";

export interface ClassifiedIntent {
  intent: Intent;
  risk: "READ_ONLY" | "CONTROL" | "UNKNOWN";
  confidence: number;
  module?: "crm" | "builder" | "missions" | "agents" | "voice";
}

const normalized = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function classifyLocal(input: string): ClassifiedIntent {
  const text = normalized(input);
  if (!text) return { intent: "UNKNOWN", risk: "UNKNOWN", confidence: 0 };

  if (/\b(para tudo|parar tudo|cancela tudo|aborta|interrompe)\b/.test(text)) {
    return { intent: "STOP_ALL", risk: "CONTROL", confidence: 0.98 };
  }

  if (/\b(status|estado|head|branch|testes|bloqueador|missao delta)\b/.test(text)) {
    return { intent: "STATUS_READONLY", risk: "READ_ONLY", confidence: 0.92 };
  }

  const modules: Array<[RegExp, ClassifiedIntent["module"]]> = [
    [/\bcrm\b/, "crm"],
    [/\b(builder|bolt)\b/, "builder"],
    [/\b(missao|missoes)\b/, "missions"],
    [/\b(agente|agentes|swarm|enxame)\b/, "agents"],
    [/\b(voz|audio|microfone)\b/, "voice"],
  ];
  for (const [pattern, module] of modules) {
    if (pattern.test(text)) {
      return { intent: "OPEN_MODULE", risk: "READ_ONLY", confidence: 0.86, module };
    }
  }

  if (text.length >= 2) return { intent: "CHAT", risk: "UNKNOWN", confidence: 0.6 };
  return { intent: "UNKNOWN", risk: "UNKNOWN", confidence: 0.2 };
}
