import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type RadarPulse = {
  id: string;
  source: string;
  status: string;
  http_code: number | null;
  error: string | null;
  false_green: boolean;
  regression: boolean;
  host: string;
  measured_at: string;
  ttl_seconds: number;
};

type RadarState = Map<string, RadarPulse>;

export function useRadarRealtime() {
  const [pulsos, setPulsos] = useState<RadarState>(new Map());
  const [conectado, setConectado] = useState(false);
  const canalRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const canal = supabase
      .channel("radar-pulses-realtime")
      .on<RadarPulse>(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "radar_pulses" },
        (payload) => {
          const novo = payload.new as RadarPulse;
          setPulsos((prev) => {
            const copia = new Map(prev);
            copia.set(novo.source, novo);
            return copia;
          });
        },
      )
      .subscribe((status) => {
        setConectado(status === "SUBSCRIBED");
      });

    canalRef.current = canal;

    return () => {
      canal.unsubscribe();
      canalRef.current = null;
    };
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setPulsos((prev) => {
        const agora = Date.now();
        let mudou = false;
        const copia = new Map(prev);
        for (const [source, pulso] of copia) {
          const expira =
            new Date(pulso.measured_at).getTime() +
            pulso.ttl_seconds * 1000;
          if (agora > expira) {
            copia.delete(source);
            mudou = true;
          }
        }
        return mudou ? copia : prev;
      });
    }, 10_000);
    return () => clearInterval(intervalo);
  }, []);

  return { pulsos, conectado };
}

export function corDoStatus(status: string): string {
  switch (status) {
    case "PASS":
      return "text-emerald-500";
    case "FAIL":
      return "text-red-500";
    case "RUNNING":
      return "text-blue-500";
    case "BLOCKED":
    case "AUTH_REQUIRED":
      return "text-amber-500";
    case "ANOMALY":
      return "text-orange-500";
    default:
      return "text-muted-foreground";
  }
}

export function corDoPulso(status: string): string {
  switch (status) {
    case "PASS":
      return "#10b981";
    case "FAIL":
      return "#ef4444";
    case "RUNNING":
      return "#3b82f6";
    case "BLOCKED":
    case "AUTH_REQUIRED":
      return "#f59e0b";
    case "ANOMALY":
      return "#f97316";
    default:
      return "#6b7280";
  }
}
