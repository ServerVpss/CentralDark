import { useEffect, useId, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Headphones, Mic2, Radio, Volume2, Wifi, WifiOff, X } from "lucide-react";

type Role = "listener" | "broadcaster";
type Signal =
  | { type: "hello"; role: Role; peerId: string }
  | { type: "offer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; to: string; candidate: RTCIceCandidateInit };

const ROOM = "centraldark-audio-relay";
const SECURE_PLAYER_URL = "https://windows-casa.tail6d7aa4.ts.net:8443/audio-player.html";

export function PlayerLocalJarvis({ onClose }: { onClose?: () => void } = {}) {
  const peerId = useId();
  const [role, setRole] = useState<Role>("listener");
  const [connected, setConnected] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [secureContext, setSecureContext] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef(new Map<string, RTCPeerConnection>());
  const pendingIceRef = useRef(new Map<string, RTCIceCandidateInit[]>());
  const statsTimerRef = useRef<number | null>(null);
  const meterContextRef = useRef<AudioContext | null>(null);
  const meterSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const meterFrameRef = useRef<number | null>(null);

  useEffect(() => setSecureContext(window.isSecureContext), []);

  const closePeer = (id: string) => {
    peersRef.current.get(id)?.close();
    peersRef.current.delete(id);
    pendingIceRef.current.delete(id);
  };

  const addIceCandidate = async (
    id: string,
    peer: RTCPeerConnection,
    candidate: RTCIceCandidateInit,
  ) => {
    if (peer.remoteDescription) {
      await peer.addIceCandidate(candidate);
      return;
    }
    const waiting = pendingIceRef.current.get(id) ?? [];
    waiting.push(candidate);
    pendingIceRef.current.set(id, waiting);
  };

  const flushIceCandidates = async (id: string, peer: RTCPeerConnection) => {
    const waiting = pendingIceRef.current.get(id) ?? [];
    pendingIceRef.current.delete(id);
    for (const candidate of waiting) await peer.addIceCandidate(candidate);
  };

  const stopMeter = () => {
    if (meterFrameRef.current !== null) window.cancelAnimationFrame(meterFrameRef.current);
    meterFrameRef.current = null;
    meterSourceRef.current?.disconnect();
    meterSourceRef.current = null;
    const context = meterContextRef.current;
    meterContextRef.current = null;
    if (context && context.state !== "closed") void context.close();
    setAudioLevel(0);
  };

  const startMeter = (stream: MediaStream) => {
    stopMeter();
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
    meterContextRef.current = context;
    meterSourceRef.current = source;
    void context.resume();

    const samples = new Uint8Array(analyser.fftSize);
    let lastPaint = 0;
    const measure = (timestamp: number) => {
      analyser.getByteTimeDomainData(samples);
      let energy = 0;
      for (const sample of samples) {
        const centered = (sample - 128) / 128;
        energy += centered * centered;
      }
      if (timestamp - lastPaint >= 80) {
        const rms = Math.sqrt(energy / samples.length);
        setAudioLevel(Math.min(1, rms * 4.5));
        lastPaint = timestamp;
      }
      meterFrameRef.current = window.requestAnimationFrame(measure);
    };
    meterFrameRef.current = window.requestAnimationFrame(measure);
  };

  const closeAll = () => {
    peersRef.current.forEach((peer) => peer.close());
    peersRef.current.clear();
    pendingIceRef.current.clear();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (audioRef.current) audioRef.current.srcObject = null;
    if (statsTimerRef.current !== null) window.clearInterval(statsTimerRef.current);
    statsTimerRef.current = null;
    stopMeter();
    setConnected(false);
    setReceiving(false);
    setLatencyMs(null);
  };

  useEffect(() => {
    const channel = supabase.channel(ROOM, { config: { broadcast: { self: true } } });
    channelRef.current = channel;
    const onSignal = async ({ payload }: { payload: Signal }) => {
      if (payload.type === "hello" && payload.role === "listener" && role === "broadcaster") {
        const source = streamRef.current;
        if (!source || peersRef.current.has(payload.peerId)) return;
        const peer = new RTCPeerConnection({ iceServers: [] });
        peersRef.current.set(payload.peerId, peer);
        source.getTracks().forEach((track) => peer.addTrack(track, source));
        peer.onicecandidate = (event) => {
          if (event.candidate) {
            void channel.send({
              type: "broadcast",
              event: "signal",
              payload: {
                type: "ice",
                from: peerId,
                to: payload.peerId,
                candidate: event.candidate.toJSON(),
              } satisfies Signal,
            });
          }
        };
        peer.onconnectionstatechange = () => setConnected(peer.connectionState === "connected");
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        await channel.send({
          type: "broadcast",
          event: "signal",
          payload: { type: "offer", from: peerId, to: payload.peerId, sdp: offer } satisfies Signal,
        });
        return;
      }
      if (payload.to !== peerId) return;
      if (payload.type === "offer" && role === "listener") {
        closeAll();
        const peer = new RTCPeerConnection({ iceServers: [] });
        peersRef.current.set(payload.from, peer);
        peer.ontrack = (event) => {
          const audio = audioRef.current;
          if (!audio) return;
          const remoteStream = event.streams[0] ?? new MediaStream([event.track]);
          audio.srcObject = remoteStream;
          startMeter(remoteStream);
          void audio
            .play()
            .then(() => setReceiving(true))
            .catch(() => setError("Toque em Reproduzir para liberar o áudio no Safari."));
        };
        peer.onicecandidate = (event) => {
          if (event.candidate)
            void channel.send({
              type: "broadcast",
              event: "signal",
              payload: {
                type: "ice",
                from: peerId,
                to: payload.from,
                candidate: event.candidate.toJSON(),
              } satisfies Signal,
            });
        };
        peer.onconnectionstatechange = () => {
          setConnected(peer.connectionState === "connected");
          if (["failed", "closed", "disconnected"].includes(peer.connectionState))
            setReceiving(false);
        };
        peer.oniceconnectionstatechange = () =>
          setConnected(
            peer.iceConnectionState === "connected" || peer.iceConnectionState === "completed",
          );
        await peer.setRemoteDescription(payload.sdp);
        await flushIceCandidates(payload.from, peer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        await channel.send({
          type: "broadcast",
          event: "signal",
          payload: { type: "answer", from: peerId, to: payload.from, sdp: answer } satisfies Signal,
        });
        return;
      }
      if ((payload.type === "answer" || payload.type === "ice") && role === "broadcaster") {
        const peer = peersRef.current.get(payload.from);
        if (!peer) return;
        if (payload.type === "answer") {
          await peer.setRemoteDescription(payload.sdp);
          await flushIceCandidates(payload.from, peer);
        } else await addIceCandidate(payload.from, peer, payload.candidate);
      } else if (payload.type === "ice" && role === "listener") {
        const peer = peersRef.current.get(payload.from);
        if (peer) await addIceCandidate(payload.from, peer, payload.candidate);
      }
    };
    channel.on("broadcast", { event: "signal" }, onSignal);
    void channel.subscribe((status) => {
      if (status === "SUBSCRIBED")
        void channel.send({
          type: "broadcast",
          event: "signal",
          payload: { type: "hello", role, peerId } satisfies Signal,
        });
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
        setError("Sinalização autenticada indisponível.");
    });
    return () => {
      closeAll();
      void supabase.removeChannel(channel);
    };
  }, [peerId, role]);

  useEffect(() => {
    if (!connected) return;
    statsTimerRef.current = window.setInterval(async () => {
      const peer = [...peersRef.current.values()][0];
      if (!peer) return;
      const stats = await peer.getStats();
      stats.forEach((report) => {
        if (
          report.type === "candidate-pair" &&
          report.state === "succeeded" &&
          typeof report.currentRoundTripTime === "number"
        ) {
          setLatencyMs(Math.round(report.currentRoundTripTime * 1000));
        }
      });
    }, 1000);
    return () => {
      if (statsTimerRef.current !== null) window.clearInterval(statsTimerRef.current);
    };
  }, [connected]);

  const refreshDevices = async () => {
    try {
      const permission = await navigator.mediaDevices.getUserMedia({ audio: true });
      permission.getTracks().forEach((track) => track.stop());
      const all = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = all.filter((device) => device.kind === "audioinput");
      setDevices(audioInputs);
      const preferred = audioInputs.find((device) =>
        /CABLE Output|Stereo Mix|Mixagem est[eé]reo|Loopback/i.test(device.label),
      );
      setDeviceId(preferred?.deviceId ?? audioInputs[0]?.deviceId ?? "");
      setError(null);
    } catch {
      setError("Permissão de áudio recusada ou nenhum dispositivo de captura disponível.");
    }
  };

  const startBroadcaster = async () => {
    if (!window.isSecureContext) {
      setError("Abra o player no endereço HTTPS privado antes de capturar áudio.");
      return;
    }
    try {
      setRole("broadcaster");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
        video: false,
      });
      streamRef.current = stream;
      startMeter(stream);
      setConnected(true);
      setError(null);
      await channelRef.current?.send({
        type: "broadcast",
        event: "signal",
        payload: { type: "hello", role: "broadcaster", peerId } satisfies Signal,
      });
    } catch {
      setError("Não foi possível capturar essa entrada. Use Capturar áudio do sistema Windows.");
      setConnected(false);
    }
  };

  const startSystemBroadcaster = async () => {
    if (!window.isSecureContext) {
      setError("Abra o player no endereço HTTPS privado antes de capturar áudio.");
      return;
    }
    try {
      setRole("broadcaster");
      const shared = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      const audioTracks = shared.getAudioTracks();
      shared.getVideoTracks().forEach((track) => track.stop());
      if (!audioTracks.length) {
        setError(
          "A janela de compartilhamento não entregou áudio. Marque a opção de compartilhar áudio do sistema.",
        );
        return;
      }
      streamRef.current = new MediaStream(audioTracks);
      startMeter(streamRef.current);
      setConnected(true);
      setError(null);
      audioTracks[0]?.addEventListener("ended", closeAll, { once: true });
      await channelRef.current?.send({
        type: "broadcast",
        event: "signal",
        payload: { type: "hello", role: "broadcaster", peerId } satisfies Signal,
      });
    } catch {
      setError("Captura do sistema cancelada ou não autorizada.");
      setConnected(false);
    }
  };

  const connectListener = async () => {
    if (!window.isSecureContext) {
      setError("Abra o player no endereço HTTPS privado antes de conectar.");
      return;
    }
    setRole("listener");
    setError(null);
    setConnected(false);
    await channelRef.current?.send({
      type: "broadcast",
      event: "signal",
      payload: { type: "hello", role: "listener", peerId } satisfies Signal,
    });
  };

  return (
    <section
      className="relative mx-auto w-full max-w-3xl rounded-2xl border border-border bg-[#05070c] p-4 shadow-2xl sm:p-6"
      data-cd-flow="instinto.PlayerLocalJarvis"
    >
      {onClose ? (
        <button
          type="button"
          aria-label="Fechar painel Ouvir PC"
          title="Fechar"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full border border-red-500/40 bg-[#05070c] text-red-400 transition-colors hover:border-red-400 hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] text-neon-blue uppercase">
            JARVIS · ÁUDIO DA CASA
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold">
            <Headphones className="size-5 text-gold" /> Ouvir PC
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            WebRTC/Opus P2P pela tailnet. O Cockpit continua sendo o único servidor HTTP.
          </p>
        </div>
        <span
          className={`mr-9 rounded-full border px-2 py-1 font-mono text-[10px] ${connected ? "border-emerald-400/50 text-emerald-300" : "border-border text-muted-foreground"}`}
          role="status"
        >
          {connected ? (
            <Wifi className="mr-1 inline size-3" />
          ) : (
            <WifiOff className="mr-1 inline size-3" />
          )}
          {connected ? "CONECTADO" : "DESCONECTADO"}
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button
          type="button"
          onClick={() => void connectListener()}
          disabled={secureContext === false}
          variant={role === "listener" ? "default" : "outline"}
        >
          <Volume2 className="mr-2 size-4" />
          Conectar e ouvir
        </Button>
        <Button
          type="button"
          onClick={() => void startBroadcaster()}
          disabled={secureContext === false}
          variant={role === "broadcaster" ? "default" : "outline"}
        >
          <Radio className="mr-2 size-4" />
          Transmitir áudio deste PC
        </Button>
      </div>
      <Button
        type="button"
        className="mt-3 w-full"
        variant="outline"
        onClick={() => void startSystemBroadcaster()}
        disabled={secureContext === false}
      >
        <Radio className="mr-2 size-4" />
        Capturar áudio do sistema Windows
      </Button>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Na janela do navegador, escolha a aba/janela que está tocando e marque{" "}
        <span className="font-semibold text-foreground">Compartilhar áudio</span>. A faixa segue por
        WebRTC/Opus; nenhum áudio é gravado.
      </p>
      {secureContext === false ? (
        <a
          className="mt-3 block rounded-lg border border-amber-400/40 bg-amber-400/5 p-3 text-center text-sm font-semibold text-amber-200 underline underline-offset-4"
          href={SECURE_PLAYER_URL}
        >
          Abrir player seguro pela tailnet
        </a>
      ) : null}
      <div className="mt-4 grid gap-3 rounded-xl border border-border bg-muted/20 p-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="text-xs text-muted-foreground">
          Fonte de captura no PC
          <select
            className="mt-1 w-full rounded border border-border bg-background px-2 py-2 text-sm"
            value={deviceId}
            onChange={(event) => setDeviceId(event.target.value)}
            onFocus={() => {
              if (!devices.length) void refreshDevices();
            }}
          >
            <option value="">Selecionar após permitir áudio</option>
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || "Dispositivo de áudio"}
              </option>
            ))}
          </select>
        </label>
        <Button type="button" variant="outline" onClick={() => void refreshDevices()}>
          <Mic2 className="mr-2 size-4" />
          Detectar fonte
        </Button>
      </div>
      <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
        <div className="rounded-lg border border-border p-3">
          <span className="text-muted-foreground">Áudio</span>
          <p className="mt-1 font-mono">{receiving ? "RECEBENDO" : "SEM SINAL"}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <span className="text-muted-foreground">Latência WebRTC</span>
          <p className="mt-1 font-mono">{latencyMs === null ? "medindo…" : `${latencyMs} ms`}</p>
        </div>
        <label className="rounded-lg border border-border p-3">
          <span className="text-muted-foreground">Volume</span>
          <input
            className="mt-2 w-full accent-amber-400"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(event) => {
              const next = Number(event.target.value);
              setVolume(next);
              if (audioRef.current) audioRef.current.volume = next;
            }}
          />
        </label>
      </div>
      <div
        className="mt-4 rounded-xl border border-border bg-black/35 p-4"
        role="meter"
        aria-label="Nível do áudio detectado"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(audioLevel * 100)}
      >
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold">Nível do áudio</span>
          <span
            className={
              audioLevel > 0.015 ? "font-mono text-emerald-300" : "font-mono text-muted-foreground"
            }
          >
            {audioLevel > 0.015 ? `DETECTANDO · ${Math.round(audioLevel * 100)}%` : "SILÊNCIO"}
          </span>
        </div>
        <div className="mt-3 flex h-14 items-end gap-1" aria-hidden="true">
          {Array.from({ length: 24 }, (_, index) => {
            const active = index < Math.ceil(audioLevel * 24);
            const color =
              index > 20 ? "bg-red-400" : index > 15 ? "bg-amber-400" : "bg-emerald-400";
            return (
              <span
                key={index}
                className={`min-w-0 flex-1 rounded-sm transition-all duration-75 ${active ? color : "bg-white/10"}`}
                style={{ height: `${28 + ((index * 17) % 67)}%`, opacity: active ? 1 : 0.45 }}
              />
            );
          })}
        </div>
      </div>
      <audio ref={audioRef} controls className="mt-4 w-full" aria-label="Áudio recebido do PC" />
      {error ? (
        <p
          className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/5 p-3 text-xs text-amber-200"
          role="alert"
        >
          ⚠️ {error}
        </p>
      ) : null}
      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        PLAYER reproduz. ORB continua visual/captura. Transcrição e Hermes não recebem este fluxo
        automaticamente.
      </p>
    </section>
  );
}
