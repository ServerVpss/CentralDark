import { useEffect, useMemo, useRef, useState } from "react";
import idleJson from "./hermes/idle.png.asset.json";
import acenandoJson from "./hermes/acenando.png.asset.json";
import pensandoJson from "./hermes/pensando.png.asset.json";
import felizJson from "./hermes/feliz.png.asset.json";
import dormindoJson from "./hermes/dormindo.png.asset.json";
import comemorandoJson from "./hermes/comemorando.png.asset.json";
import trabalhandoJson from "./hermes/trabalhando.png.asset.json";
import alertaJson from "./hermes/alerta.png.asset.json";
import investigandoJson from "./hermes/investigando.png.asset.json";
import aprovandoJson from "./hermes/aprovando.png.asset.json";
import entregandoJson from "./hermes/entregando.png.asset.json";

export type PoseHermes =
  | "idle"
  | "acenando"
  | "pensando"
  | "feliz"
  | "dormindo"
  | "comemorando"
  | "trabalhando"
  | "alerta"
  | "investigando"
  | "aprovando"
  | "entregando";

const POSES: Record<PoseHermes, string> = {
  idle: idleJson.url,
  acenando: acenandoJson.url,
  pensando: pensandoJson.url,
  feliz: felizJson.url,
  dormindo: dormindoJson.url,
  comemorando: comemorandoJson.url,
  trabalhando: trabalhandoJson.url,
  alerta: alertaJson.url,
  investigando: investigandoJson.url,
  aprovando: aprovandoJson.url,
  entregando: entregandoJson.url,
};

interface Props {
  /** ID do último log emitido no cockpit (muda → mascote reage) */
  ultimoEvento?: { id: number; texto: string; pane: string } | null;
}

/** Traduz o prefixo do log pra pose do Hermes. */
function poseParaLog(texto: string): PoseHermes {
  if (texto.startsWith("✓")) return Math.random() > 0.5 ? "feliz" : "aprovando";
  if (texto.startsWith("✗")) return "alerta";
  if (texto.startsWith("⚠")) return "alerta";
  if (texto.startsWith("→")) return "trabalhando";
  if (texto.startsWith("$")) return "investigando";
  if (texto.startsWith("[")) return "pensando";
  return "idle";
}

export function HermesMascote({ ultimoEvento }: Props) {
  const [pose, setPose] = useState<PoseHermes>("idle");
  const [balao, setBalao] = useState<string | null>(null);
  const [ocioso, setOcioso] = useState(false);
  const ocioTimer = useRef<number | null>(null);

  // Reage a novo log
  useEffect(() => {
    if (!ultimoEvento) return;
    const novaPose = poseParaLog(ultimoEvento.texto);
    setPose(novaPose);
    setOcioso(false);
    setBalao(`[${ultimoEvento.pane}] ${ultimoEvento.texto.slice(0, 48)}`);

    // volta pra idle depois de 2.4s
    const t1 = window.setTimeout(() => setPose("idle"), 2400);
    const t2 = window.setTimeout(() => setBalao(null), 3200);

    // reinicia o timer de ócio (dorme depois de 12s sem evento)
    if (ocioTimer.current) window.clearTimeout(ocioTimer.current);
    ocioTimer.current = window.setTimeout(() => {
      setPose("dormindo");
      setOcioso(true);
    }, 12000);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [ultimoEvento]);

  // Pisca aleatório (troca micro-pose só quando idle) — puramente decorativo
  const decorativo = useMemo(() => Math.random(), [pose]);
  void decorativo;

  return (
    <div className={`hermes-wrap ${ocioso ? "hermes-ocioso" : ""}`}>
      {balao && (
        <div className="hermes-balao">
          <span>{balao}</span>
        </div>
      )}
      <div className={`hermes-glow pose-${pose}`}>
        <img src={POSES[pose]} alt={`Hermes ${pose}`} draggable={false} />
      </div>
      <div className="hermes-plaqueta">
        <span className="hermes-pt">●</span> hermes <em>{pose}</em>
      </div>
    </div>
  );
}
