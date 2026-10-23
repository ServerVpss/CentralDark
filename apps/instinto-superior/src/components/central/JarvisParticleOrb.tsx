import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, MicOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * CentralDark • Jarvis Particle Orb: canvas particle shell, no new agent/runtime.
 * Audio input: centraldark:jarvis:audio (CustomEvent<{ mode, stream? }>).
 * Speech/TTS owners may supply their REAL MediaStream; no fake waveform on a label.
 * Mic access occurs ONLY after a user clicks "Ativar microfone".
 */
export type JarvisOrbMode = "idle" | "listening" | "speaking" | "processing";
export type JarvisOrbAudioDetail = { mode: JarvisOrbMode; stream?: MediaStream | null };
export const JARVIS_ORB_AUDIO_EVENT = "centraldark:jarvis:audio";

type Dot = { x: number; y: number; z: number; phase: number; weight: number };
type AudioLink = {
  context: AudioContext;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
};

function pointsOnSphere(count: number): Dot[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const y = 1 - (2 * (i + 0.5)) / count;
    const radial = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * golden;
    return {
      x: Math.cos(theta) * radial,
      y,
      z: Math.sin(theta) * radial,
      phase: ((i * 0.61803398875) % 1) * Math.PI * 2,
      weight: 0.6 + ((i * 37) % 97) / 240,
    };
  });
}

export function JarvisParticleOrb({
  size = 240,
  interactive = false,
  label = "JARVIS",
}: {
  size?: number;
  interactive?: boolean;
  label?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<AudioLink | null>(null);
  const ownedMicRef = useRef<MediaStream | null>(null);
  const modeRef = useRef<JarvisOrbMode>("idle");
  const [mode, setMode] = useState<JarvisOrbMode>("idle");
  const [micOn, setMicOn] = useState(false);
  const [error, setError] = useState("");
  const [inputs, setInputs] = useState<MediaDeviceInfo[]>([]);
  const [inputId, setInputId] = useState("");
  const [activeInput, setActiveInput] = useState("");
  const [devicesChecked, setDevicesChecked] = useState(false);
  const [transport, setTransport] = useState<"wifi" | "usb" | "bluetooth" | "direct">("wifi");

  async function refreshInputs() {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setError("Este navegador não oferece seleção de entradas de áudio.");
      return;
    }
    try {
      const found = (await navigator.mediaDevices.enumerateDevices()).filter(
        (device) => device.kind === "audioinput",
      );
      setInputs(found);
      setDevicesChecked(true);
      setError("");
    } catch {
      setError("Não foi possível consultar os dispositivos de áudio.");
    }
  }

  useEffect(() => {
    if (!interactive || !navigator.mediaDevices?.enumerateDevices) return;
    void refreshInputs();
    const onDeviceChange = () => {
      void refreshInputs();
    };
    navigator.mediaDevices.addEventListener?.("devicechange", onDeviceChange);
    return () => navigator.mediaDevices.removeEventListener?.("devicechange", onDeviceChange);
  }, [interactive]);
  const dots = useMemo(() => pointsOnSphere(size < 150 ? 620 : 1350), [size]);

  useEffect(() => {
    const setActivity = (next: JarvisOrbMode) => {
      modeRef.current = next;
      setMode(next);
    };
    const releaseAudio = () => {
      const link = runtimeRef.current;
      runtimeRef.current = null;
      if (link) {
        try {
          link.source.disconnect();
        } catch {
          /* source already released */
        }
        void link.context.close().catch(() => {});
      }
    };
    const onAudio = (event: Event) => {
      const { mode: next, stream } = (event as CustomEvent<JarvisOrbAudioDetail>).detail ?? {
        mode: "idle" as const,
      };
      releaseAudio();
      if (!stream?.active || (next !== "listening" && next !== "speaking")) {
        setActivity(next ?? "idle");
        return;
      }
      try {
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.78;
        source.connect(analyser); // Not connected to speakers: never echo the microphone.
        runtimeRef.current = { context, source, analyser };
        setActivity(next);
        void context.resume().catch(() => setError("Áudio bloqueado pelo navegador."));
      } catch {
        setActivity("idle");
        setError("Não foi possível analisar esta fonte de áudio.");
      }
    };
    window.addEventListener(JARVIS_ORB_AUDIO_EVENT, onAudio);
    return () => {
      window.removeEventListener(JARVIS_ORB_AUDIO_EVENT, onAudio);
      releaseAudio();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let box = 240;
    let dpr = 1;
    let raf = 0;
    let last = -1;
    let energy = 0;
    let bands = new Float32Array(12);
    const resize = () => {
      box = Math.max(80, Math.round(parent.getBoundingClientRect().width));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(box * dpr);
      canvas.height = Math.round(box * dpr);
      canvas.style.width = box + "px";
      canvas.style.height = box + "px";
    };
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    resize();

    const paint = (now: number) => {
      raf = requestAnimationFrame(paint);
      if (document.hidden || (!reduce.matches && now - last < 32)) return;
      if (reduce.matches && last >= 0) return;
      last = now;
      const live = runtimeRef.current;
      let target = 0;
      if (live?.context.state === "running") {
        const data = new Uint8Array(live.analyser.frequencyBinCount);
        live.analyser.getByteFrequencyData(data);
        const region = Math.max(1, Math.floor(data.length / bands.length));
        let total = 0;
        for (let i = 0; i < bands.length; i++) {
          let bandTotal = 0;
          for (let j = i * region; j < Math.min(data.length, (i + 1) * region); j++) {
            bandTotal += data[j] ?? 0;
          }
          bands[i] = bands[i]! * 0.65 + (bandTotal / region / 255) * 0.35;
          total += bands[i]!;
        }
        target = Math.min(1, (total / bands.length) * 2.6);
      } else {
        bands = new Float32Array(12);
      }
      energy += (target - energy) * 0.15;
      const t = reduce.matches ? 0 : now / 1000;
      const center = box / 2;
      const radius = center * 0.66;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, box, box);

      const glow = ctx.createRadialGradient(
        center,
        center,
        radius * 0.06,
        center,
        center,
        radius * 1.55,
      );
      glow.addColorStop(0, "rgba(0, 95, 220, 0.15)");
      glow.addColorStop(0.55, "rgba(0, 90, 255, 0.12)");
      glow.addColorStop(1, "rgba(0, 140, 255, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, box, box);
      ctx.globalCompositeOperation = "lighter";

      const cy = Math.cos(t * 0.18);
      const sy = Math.sin(t * 0.18);
      const cx = Math.cos(t * 0.08);
      const sx = Math.sin(t * 0.08);
      for (let i = 0; i < dots.length; i++) {
        const p = dots[i]!;
        const band = bands[(i * 7) % bands.length] ?? 0;
        const turbulence =
          Math.sin(p.x * 7.1 + t * 0.91 + p.phase) *
            Math.sin(p.y * 5.9 - t * 0.73 + p.phase * 0.35) +
          0.5 * Math.sin(p.z * 10.2 + p.y * 6.7 - t * 0.46);
        const ripple = Math.sin(p.phase * 3 + t * 6.3 + p.y * 13) * (band * 0.29 + energy * 0.09);
        const magnitude = 1 + turbulence * 0.075 + ripple;
        const x = p.x * magnitude;
        const y = p.y * magnitude;
        const z = p.z * magnitude;
        const rx = x * cy - z * sy;
        const rz = x * sy + z * cy;
        const ry = y * cx - rz * sx;
        const depth = y * sx + rz * cx;
        const perspective = 2.5 / (2.5 - depth * 0.38);
        const px = center + rx * radius * perspective;
        const py = center + ry * radius * perspective;
        const opacity = Math.min(0.9, Math.max(0.1, (0.26 + (depth + 1) * 0.23) * p.weight));
        const dotRadius = (box < 150 ? 0.5 : 0.75) * (0.73 + perspective * 0.5 + band * 1.2);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${Math.round(28 + band * 80)}, ${Math.round(121 + band * 105)}, 255, ${opacity})`;
        ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };
    raf = requestAnimationFrame(paint);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [dots]);

  useEffect(
    () => () => {
      ownedMicRef.current?.getTracks().forEach((track) => track.stop());
      if (ownedMicRef.current) {
        window.dispatchEvent(
          new CustomEvent<JarvisOrbAudioDetail>(JARVIS_ORB_AUDIO_EVENT, {
            detail: { mode: "idle", stream: null },
          }),
        );
      }
    },
    [],
  );

  async function toggleMicrophone() {
    if (ownedMicRef.current) {
      ownedMicRef.current.getTracks().forEach((track) => track.stop());
      ownedMicRef.current = null;
      setMicOn(false);
      setActiveInput("");
      window.dispatchEvent(
        new CustomEvent<JarvisOrbAudioDetail>(JARVIS_ORB_AUDIO_EVENT, {
          detail: { mode: "idle", stream: null },
        }),
      );
      return;
    }
    try {
      setError("");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("NOT_SUPPORTED");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          ...(inputId ? { deviceId: { exact: inputId } } : {}),
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      const track = stream.getAudioTracks()[0];
      if (!track) {
        stream.getTracks().forEach((item) => item.stop());
        throw new Error("NO_AUDIO_TRACK");
      }
      ownedMicRef.current = stream;
      setActiveInput(track.label || "Microfone selecionado");
      track.addEventListener(
        "ended",
        () => {
          if (ownedMicRef.current !== stream) return;
          ownedMicRef.current = null;
          setMicOn(false);
          setActiveInput("");
          window.dispatchEvent(
            new CustomEvent<JarvisOrbAudioDetail>(JARVIS_ORB_AUDIO_EVENT, {
              detail: { mode: "idle", stream: null },
            }),
          );
        },
        { once: true },
      );
      setMicOn(true);
      void refreshInputs();
      window.dispatchEvent(
        new CustomEvent<JarvisOrbAudioDetail>(JARVIS_ORB_AUDIO_EVENT, {
          detail: { mode: "listening", stream },
        }),
      );
    } catch {
      setMicOn(false);
      setActiveInput("");
      setError(
        "Microfone indisponível, desconectado ou permissão recusada. Confira o WO Mic no Windows.",
      );
    }
  }
  const woMicInputs = inputs.filter((device) => /wo\s*mic/i.test(device.label));
  const stateName: Record<JarvisOrbMode, string> = {
    idle: "RESPIRANDO",
    listening: "OUVINDO",
    speaking: "FALANDO",
    processing: "PROCESSANDO",
  };

  return (
    <div
      data-jarvis-particle-orb
      className="flex flex-col items-center gap-2"
      aria-label={`${label}, orbe de partículas ${stateName[mode].toLowerCase()}`}
    >
      <div className="relative w-full max-w-full" style={{ width: size, aspectRatio: "1" }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`Orbe de partículas de ${label}, estado: ${stateName[mode]}`}
        />
        <span className="pointer-events-none absolute inset-x-0 bottom-[11%] text-center font-mono text-[9px] tracking-[0.23em] text-sky-300/80">
          {interactive ? `${label} · ${stateName[mode]}` : ""}
        </span>
      </div>
      {interactive ? (
        <div className="flex max-w-80 flex-col items-center gap-2">
          <div className="w-full rounded-md border border-sky-500/20 p-2 text-xs">
            <label className="mb-1 block text-sky-200" htmlFor="jarvis-audio-input">
              Entrada de microfone
            </label>
            <select
              id="jarvis-audio-input"
              aria-label="Escolher microfone para o JARVIS"
              className="w-full rounded border border-sky-500/30 bg-background p-2 text-foreground"
              value={inputId}
              onChange={(event) => setInputId(event.target.value)}
              disabled={micOn}
            >
              <option value="">Microfone padrão do Windows</option>
              {inputs
                .filter((device) => device.deviceId && device.deviceId !== "default")
                .map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || "Entrada de áudio " + (index + 1)}
                  </option>
                ))}
            </select>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span role="status" className="text-muted-foreground">
                {micOn
                  ? "Captura ativa: " + activeInput
                  : woMicInputs.length
                    ? "WO Mic detectado no Windows — transmissão não verificada"
                    : devicesChecked
                      ? "WO Mic não identificado nesta lista"
                      : "Dispositivos ainda não verificados"}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => void refreshInputs()}
                aria-label="Atualizar entradas de áudio"
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>
            {micOn ? (
              <p className="mt-1 text-amber-300">Desligue o microfone antes de trocar a entrada.</p>
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            aria-pressed={micOn}
            onClick={() => void toggleMicrophone()}
          >
            {micOn ? <MicOff className="mr-2 size-4" /> : <Mic className="mr-2 size-4" />}
            {micOn ? "Desligar microfone" : "Ativar microfone"}
          </Button>
          <p className="max-w-64 text-center text-[11px] leading-relaxed text-muted-foreground">
            Ocioso: animação. Ouvindo: FFT da entrada selecionada, apenas neste navegador. Falando:
            requer o áudio real do motor de voz. O indicador não prova conexão celular → PC.
          </p>
          <details className="w-full rounded-md border border-sky-500/20 p-2 text-xs">
            <summary className="cursor-pointer font-medium text-sky-200">
              Conectar WO Mic (celular → Windows)
            </summary>
            <label className="mt-2 block" htmlFor="jarvis-wo-mic-transport">
              Transporte
            </label>
            <select
              id="jarvis-wo-mic-transport"
              className="mt-1 w-full rounded border border-sky-500/30 bg-background p-2 text-foreground"
              value={transport}
              onChange={(event) => setTransport(event.target.value as typeof transport)}
            >
              <option value="wifi">Wi-Fi (Android / iPhone)</option>
              <option value="usb">USB (Android)</option>
              <option value="bluetooth">Bluetooth (Android)</option>
              <option value="direct">Wi-Fi Direct (Android)</option>
            </select>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-muted-foreground">
              <li>Abra WO Mic no telefone, selecione o mesmo transporte e inicie o servidor.</li>
              <li>
                {transport === "wifi"
                  ? "Com os dois aparelhos na mesma rede Wi-Fi, anote o IP exibido no TELEFONE."
                  : transport === "usb"
                    ? "Conecte o telefone Android por USB e conclua a configuração exigida pelo aplicativo."
                    : transport === "bluetooth"
                      ? "Emparelhe o telefone Android e o PC pelo Bluetooth."
                      : "Conecte o Windows à rede Wi-Fi Direct criada pelo telefone Android."}
              </li>
              <li>
                No WO Mic Client do Windows, vá em Connection → Connect e use o transporte e destino
                do telefone.
              </li>
              <li>
                Quando o cliente indicar Connected, atualize as entradas acima e escolha WO Mic
                Device.
              </li>
              <li>
                Clique em Ativar microfone e conceda permissão ao navegador para testar a esfera.
              </li>
            </ol>
            <a
              className="mt-2 inline-block text-sky-300 underline underline-offset-2"
              href="https://wolicheng.com/womic/tutorial.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instruções do fabricante
            </a>
            <p className="mt-2 text-muted-foreground">
              O navegador não controla o aplicativo WO Mic nem instala drivers. Nenhum áudio é
              enviado para a VPS por este controle.
            </p>
          </details>
          {error ? (
            <p role="status" className="text-xs text-amber-400">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
