import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Headphones, Mic2, Radio, Volume2, Wifi, WifiOff } from "lucide-react";
import { PopupCloseButton } from "@/components/ui/popup-close-button";

// Mesmo owner, sala e Cockpit. WebRTC trafega áudio; Supabase carrega sinalização.
// Escuta e transmissão são independentes para operar também em duplex.
type Role = "listener" | "broadcaster";
type Signal =
  | { type: "hello"; role: Role; peerId: string }
  | { type: "offer" | "answer"; from: string; to: string; linkId: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; from: string; to: string; linkId: string; candidate: RTCIceCandidateInit }
  | { type: "stop"; from: string; role: Role };
type Direction = "in" | "out";
type Link = { pc: RTCPeerConnection; remoteId: string; direction: Direction };
type Meter = { ctx: AudioContext; source: MediaStreamAudioSourceNode; frame: number };
const ROOM = "centraldark-audio-relay";
const SECURE_PLAYER_URL = "https://windows-casa.tail6d7aa4.ts.net:8443/audio-player.html";

export function PlayerLocalJarvis({ onClose }: { onClose?: () => void } = {}) {
  const [peerId] = useState(() => crypto.randomUUID()); // unique between Windows and iPhone
  const [listening, setListening] = useState(false);
  const [sending, setSending] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [sendingTo, setSendingTo] = useState(0);
  const [latency, setLatency] = useState<number | null>(null);
  const [volume, setVolume] = useState(1);
  const [levelIn, setLevelIn] = useState(0);
  const [levelOut, setLevelOut] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [secure, setSecure] = useState<boolean | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const volumeRef = useRef(1);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const listeningRef = useRef(false);
  const sendingRef = useRef(false);
  const sourceRef = useRef<MediaStream | null>(null);
  const sharedRef = useRef<MediaStream | null>(null);
  const linksRef = useRef(new Map<string, Link>());
  const pendingRef = useRef(new Map<string, RTCIceCandidateInit[]>());
  const metersRef = useRef(new Map<Direction, Meter>());
  const statsTimerRef = useRef<number | null>(null);

  const signal = async (payload: Signal) => {
    if (channelRef.current) await channelRef.current.send({
      type: "broadcast", event: "signal", payload,
    });
  };
  const stopMeter = (direction: Direction) => {
    const m = metersRef.current.get(direction);
    if (m) {
      cancelAnimationFrame(m.frame);
      m.source.disconnect();
      if (m.ctx.state !== "closed") void m.ctx.close();
      metersRef.current.delete(direction);
    }
    if (direction === "in") setLevelIn(0); else setLevelOut(0);
  };
  const startMeter = (stream: MediaStream, direction: Direction) => {
    stopMeter(direction);
    if (!stream.getAudioTracks().length) return;
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    let last = 0;
    const measure = (now: number) => {
      analyser.getByteTimeDomainData(samples);
      let power = 0;
      for (const s of samples) power += ((s - 128) / 128) ** 2;
      if (now - last >= 80) {
        const level = Math.min(1, Math.sqrt(power / samples.length) * 4.5);
        if (direction === "in") setLevelIn(level); else setLevelOut(level);
        last = now;
      }
      const m = metersRef.current.get(direction);
      if (m) m.frame = requestAnimationFrame(measure);
    };
    metersRef.current.set(direction, { ctx, source, frame: requestAnimationFrame(measure) });
    void ctx.resume().catch(() => undefined);
  };
  const countSending = () => setSendingTo([...linksRef.current.values()].filter(
    (link) => link.direction === "out" && link.pc.connectionState === "connected",
  ).length);
  const closeLink = (id: string) => {
    const link = linksRef.current.get(id);
    if (!link) return;
    linksRef.current.delete(id);
    pendingRef.current.delete(id);
    link.pc.onconnectionstatechange = null;
    link.pc.close();
    if (link.direction === "in" &&
      ![...linksRef.current.values()].some((v) => v.direction === "in")) {
      setReceiving(false);
      if (audioRef.current) audioRef.current.srcObject = null;
      stopMeter("in");
    }
    if (link.direction === "out") countSending();
  };
  const createLink = (id: string, remoteId: string, direction: Direction) => {
    const pc = new RTCPeerConnection({ iceServers: [] });
    linksRef.current.set(id, { pc, remoteId, direction });
    pc.onicecandidate = (event) => {
      if (event.candidate) void signal({
        type: "ice", from: peerId, to: remoteId, linkId: id,
        candidate: event.candidate.toJSON(),
      });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected" && direction === "out") countSending();
      if (["failed", "disconnected", "closed"].includes(pc.connectionState)) closeLink(id);
    };
    return pc;
  };
  const receiveIce = async (id: string, candidate: RTCIceCandidateInit) => {
    const pc = linksRef.current.get(id)?.pc;
    if (pc?.remoteDescription) await pc.addIceCandidate(candidate);
    else pendingRef.current.set(id, [...(pendingRef.current.get(id) ?? []), candidate]);
  };
  const flushIce = async (id: string) => {
    const pc = linksRef.current.get(id)?.pc;
    if (!pc?.remoteDescription) return;
    const waiting = pendingRef.current.get(id) ?? [];
    pendingRef.current.delete(id);
    for (const candidate of waiting) await pc.addIceCandidate(candidate);
  };
  const offerTo = async (listenerId: string) => {
    const stream = sourceRef.current;
    if (!sendingRef.current || !stream || listenerId === peerId) return;
    if ([...linksRef.current.values()].some((v) =>
      v.direction === "out" && v.remoteId === listenerId)) return;
    const id = crypto.randomUUID();
    const pc = createLink(id, listenerId, "out");
    for (const track of stream.getAudioTracks()) pc.addTrack(track, stream);
    await pc.setLocalDescription(await pc.createOffer());
    await signal({ type: "offer", from: peerId, to: listenerId, linkId: id, sdp: pc.localDescription! });
  };
  useEffect(() => setSecure(window.isSecureContext), []);

  // Assinar UMA vez: alternar os botões nunca encerra a direção oposta.
  useEffect(() => {
    const channel = supabase.channel(ROOM, { config: { broadcast: { self: true } } });
    channelRef.current = channel;
    const onSignal = async ({ payload }: { payload: Signal }) => {
      try {
        if (payload.type === "hello") {
          if (payload.peerId === peerId) return;
          if (payload.role === "listener" && sendingRef.current) await offerTo(payload.peerId);
          if (payload.role === "broadcaster" && listeningRef.current)
            await signal({ type: "hello", role: "listener", peerId });
          return;
        }
        if (payload.type === "stop") {
          if (payload.from === peerId) return;
          for (const [id, link] of linksRef.current) {
            if (link.remoteId === payload.from &&
              (payload.role === "listener" ? link.direction === "out" : link.direction === "in"))
              closeLink(id);
          }
          return;
        }
        if (payload.to !== peerId) return;
        if (payload.type === "offer") {
          if (!listeningRef.current) return;
          for (const [id, link] of linksRef.current) {
            if (link.direction === "in" && link.remoteId === payload.from) closeLink(id);
          }
          const pc = createLink(payload.linkId, payload.from, "in");
          pc.ontrack = (event) => {
            if (!listeningRef.current || !audioRef.current) return;
            const audio = audioRef.current;
            const stream = event.streams[0] ?? new MediaStream([event.track]);
            audio.srcObject = stream;
            audio.volume = volumeRef.current;
            startMeter(stream, "in");
            void audio.play().then(() => setReceiving(true)).catch(
              () => setError("Toque em Reproduzir no iPhone para liberar o som."),
            );
          };
          await pc.setRemoteDescription(payload.sdp);
          await flushIce(payload.linkId);
          await pc.setLocalDescription(await pc.createAnswer());
          await signal({
            type: "answer", from: peerId, to: payload.from,
            linkId: payload.linkId, sdp: pc.localDescription!,
          });
          return;
        }
        if (payload.type === "answer") {
          const pc = linksRef.current.get(payload.linkId)?.pc;
          if (pc && pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(payload.sdp);
            await flushIce(payload.linkId);
          }
        } else if (payload.type === "ice") await receiveIce(payload.linkId, payload.candidate);
      } catch {
        setError("Falha na conexão do áudio. Reinicie apenas o botão afetado.");
      }
    };
    channel.on("broadcast", { event: "signal" }, onSignal);
    void channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        if (listeningRef.current) void signal({ type: "hello", role: "listener", peerId });
        if (sendingRef.current) void signal({ type: "hello", role: "broadcaster", peerId });
      }
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT")
        setError("Sinalização indisponível; transmissão não confirmada.");
    });
    return () => {
      channelRef.current = null;
      listeningRef.current = false;
      sendingRef.current = false;
      for (const link of linksRef.current.values()) link.pc.close();
      linksRef.current.clear();
      pendingRef.current.clear();
      sourceRef.current?.getTracks().forEach((t) => t.stop());
      sharedRef.current?.getTracks().forEach((t) => t.stop());
      sourceRef.current = null;
      sharedRef.current = null;
      if (statsTimerRef.current !== null) clearInterval(statsTimerRef.current);
      for (const m of metersRef.current.values()) {
        cancelAnimationFrame(m.frame);
        m.source.disconnect();
        if (m.ctx.state !== "closed") void m.ctx.close();
      }
      metersRef.current.clear();
      if (audioRef.current) audioRef.current.srcObject = null;
      void supabase.removeChannel(channel);
    };
  }, [peerId]);

  useEffect(() => {
    if (!receiving && sendingTo === 0) { setLatency(null); return; }
    statsTimerRef.current = window.setInterval(async () => {
      const link = [...linksRef.current.values()].find((v) => v.pc.connectionState === "connected");
      if (!link) return;
      try {
        const stats = await link.pc.getStats();
        stats.forEach((report) => {
          if (report.type === "candidate-pair" && report.state === "succeeded" &&
            typeof report.currentRoundTripTime === "number")
            setLatency(Math.round(report.currentRoundTripTime * 1000));
        });
      } catch { /* peer closed during polling */ }
    }, 1000);
    return () => {
      if (statsTimerRef.current !== null) clearInterval(statsTimerRef.current);
      statsTimerRef.current = null;
    };
  }, [receiving, sendingTo]);

  const stopListening = () => {
    listeningRef.current = false;
    setListening(false);
    for (const [id, link] of linksRef.current) if (link.direction === "in") closeLink(id);
    setReceiving(false);
    stopMeter("in");
    if (audioRef.current) audioRef.current.srcObject = null;
    void signal({ type: "stop", from: peerId, role: "listener" });
  };
  const toggleListening = () => {
    if (!window.isSecureContext) { setError("Abra por HTTPS privado para ouvir."); return; }
    if (listeningRef.current) { stopListening(); return; }
    listeningRef.current = true;
    setListening(true);
    setError(null);
    void signal({ type: "hello", role: "listener", peerId });
  };
  const stopSending = () => {
    sendingRef.current = false;
    setSending(false);
    for (const [id, link] of linksRef.current) if (link.direction === "out") closeLink(id);
    sourceRef.current?.getTracks().forEach((t) => t.stop());
    sharedRef.current?.getTracks().forEach((t) => t.stop());
    sourceRef.current = null;
    sharedRef.current = null;
    stopMeter("out");
    setSendingTo(0);
    void signal({ type: "stop", from: peerId, role: "broadcaster" });
  };
  const startSending = (source: MediaStream, shared: MediaStream | null = null) => {
    sourceRef.current = source;
    sharedRef.current = shared;
    sendingRef.current = true;
    setSending(true);
    setError(null);
    startMeter(source, "out");
    source.getAudioTracks()[0]?.addEventListener("ended", () => {
      if (sendingRef.current) stopSending();
    }, { once: true });
    void signal({ type: "hello", role: "broadcaster", peerId });
  };
  const sendMicrophone = async () => {
    if (!window.isSecureContext) { setError("Abra por HTTPS privado para enviar áudio."); return; }
    if (sendingRef.current) { stopSending(); return; }
    try {
      const selected = devices.find((device) => device.deviceId === deviceId);
      const isLoopback = /CABLE Output|Stereo Mix|Mixagem est[eé]reo|Loopback/i.test(
        selected?.label ?? "",
      );
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId
          ? {
              deviceId: { exact: deviceId },
              echoCancellation: !isLoopback,
              noiseSuppression: !isLoopback,
              autoGainControl: !isLoopback,
            }
          : { echoCancellation: true },
        video: false,
      });
      startSending(stream);
    } catch { setError("Microfone indisponível. Verifique a permissão e a fonte."); }
  };
  const sendWindowsAudio = async () => {
    if (!window.isSecureContext || sendingRef.current) return;
    try {
      const shared = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      const tracks = shared.getAudioTracks();
      if (!tracks.length) {
        shared.getTracks().forEach((t) => t.stop());
        setError("Selecione a aba com áudio e marque Compartilhar áudio.");
        return;
      }
      // Keep display video track alive or Chromium may end the audio capture.
      startSending(new MediaStream(tracks), shared);
      shared.getVideoTracks()[0]?.addEventListener("ended", () => {
        if (sendingRef.current) stopSending();
      }, { once: true });
    } catch { setError("Compartilhamento cancelado ou sem permissão."); }
  };
  const refreshDevices = async () => {
    try {
      const permission = await navigator.mediaDevices.getUserMedia({ audio: true });
      permission.getTracks().forEach((t) => t.stop());
      const inputs = (await navigator.mediaDevices.enumerateDevices())
        .filter((device) => device.kind === "audioinput");
      setDevices(inputs);
      const preferred = inputs.find((d) => /CABLE Output|Stereo Mix|Mixagem est[eé]reo|Loopback/i.test(d.label));
      setDeviceId(preferred?.deviceId ?? inputs[0]?.deviceId ?? "");
      setError(null);
    } catch { setError("Não foi possível listar as fontes de microfone."); }
  };
  const changeVolume = (v: number) => {
    setVolume(v);
    volumeRef.current = v;
    if (audioRef.current) audioRef.current.volume = v;
  };

  return (
    <section
      className="relative mx-auto w-full max-w-3xl rounded-2xl border border-border bg-[#05070c] p-4 shadow-2xl sm:p-6"
      data-cd-flow="instinto.PlayerLocalJarvis"
    >
      {onClose ? <PopupCloseButton aria-label="Fechar painel Ouvir PC" onClick={onClose} /> : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] text-neon-blue uppercase">JARVIS · ÁUDIO DA CASA</p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold">
            <Headphones className="size-5 text-gold" /> Ouvir e enviar áudio
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            WebRTC/Opus entre dispositivos; Supabase apenas para sinalização. Acesso ao Cockpit via Tailscale.
          </p>
        </div>
        <span role="status" className={"mr-9 rounded-full border px-2 py-1 font-mono text-[10px] " +
          (receiving || sendingTo > 0 ? "border-emerald-400/50 text-emerald-300" : "border-border text-muted-foreground")}>
          {receiving || sendingTo > 0 ?
            <Wifi className="mr-1 inline size-3" /> : <WifiOff className="mr-1 inline size-3" />}
          {receiving && sendingTo ? "OUVINDO E ENVIANDO" :
            receiving ? "OUVINDO" : sendingTo ? "ENVIANDO" :
              listening || sending ? "AGUARDANDO CONEXÃO" : "DESLIGADO"}
        </span>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-3">
          <p className="mb-2 text-sm font-semibold">🎧 Ouvir o outro dispositivo</p>
          <Button type="button" className="w-full" variant={listening ? "outline" : "default"}
            disabled={secure === false} onClick={toggleListening}>
            <Volume2 className="mr-2 size-4" /> {listening ? "Parar de ouvir" : "Conectar e ouvir"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            {receiving ? "Som sendo reproduzido." :
              listening ? "Aguardando outro dispositivo transmitir." : "Recepção desligada."}
          </p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="mb-2 text-sm font-semibold">🎙️ Enviar som deste dispositivo</p>
          <Button type="button" className="w-full" variant={sending ? "outline" : "default"}
            disabled={secure === false} onClick={() => void sendMicrophone()}>
            <Mic2 className="mr-2 size-4" /> {sending ? "Parar de enviar" : "Enviar microfone / entrada"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            {sendingTo ? "Enviando para o outro dispositivo." :
              sending ? "Fonte aberta. Aguardando quem ouça." : "Microfone desligado."}
          </p>
        </div>
      </div>
      <Button type="button" className="mt-3 w-full" variant="outline"
        disabled={secure === false || sending || typeof navigator === "undefined" || !navigator.mediaDevices?.getDisplayMedia}
        onClick={() => void sendWindowsAudio()}>
        <Radio className="mr-2 size-4" /> Compartilhar áudio do Windows (em vez do microfone)
      </Button>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Para ouvir o PC no iPhone: enviar no Windows e ouvir no iPhone.
        Para falar do iPhone com a Casa: enviar microfone no iPhone e ouvir no Windows.
        Ambos os sentidos podem ficar ligados. Use fones para evitar eco. Captura com permissão; sem gravação neste player.
      </p>
      {secure === false ? (
        <a href={SECURE_PLAYER_URL}
          className="mt-3 block rounded-lg border border-amber-400/40 p-3 text-center text-sm font-semibold text-amber-200 underline">
          Abrir player seguro pela tailnet
        </a>
      ) : null}
      <div className="mt-4 grid gap-3 rounded-xl border border-border bg-muted/20 p-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="text-xs text-muted-foreground">
          Fonte de microfone / entrada neste dispositivo
          <select className="mt-1 w-full rounded border border-border bg-background px-3 py-2 text-sm"
            value={deviceId} onChange={(event) => setDeviceId(event.target.value)}
            onFocus={() => { if (!devices.length) void refreshDevices(); }} disabled={sending}>
            <option value="">Padrão (permitir áudio para detectar)</option>
            {devices.map((d) => <option key={d.deviceId} value={d.deviceId}>
              {d.label || "Dispositivo de áudio"}
            </option>)}
          </select>
        </label>
        <Button type="button" variant="outline" onClick={() => void refreshDevices()} disabled={sending}>
          <Mic2 className="mr-2 size-4" /> Detectar fonte
        </Button>
      </div>
      <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
        <div className="rounded-lg border border-border p-3">
          <span className="text-muted-foreground">Recepção</span>
          <p className="mt-1 font-mono">{receiving ? "REPRODUZINDO" : listening ? "AGUARDANDO" : "DESLIGADA"}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <span className="text-muted-foreground">Transmissão</span>
          <p className="mt-1 font-mono">{sending ? sendingTo ? "ENVIANDO" : "FONTE PRONTA" : "DESLIGADA"}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <span className="text-muted-foreground">WebRTC RTT</span>
          <p className="mt-1 font-mono">{latency === null ? "não medido" : latency + " ms"}</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-border bg-black/35 p-3 text-xs">
        <div className="flex justify-between"><span>Som enviado</span><span>{sending ? Math.round(levelOut * 100) + "%" : "DESLIGADO"}</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-amber-400 transition-all" style={{ width: Math.round(levelOut * 100) + "%" }} />
        </div>
        <div className="mt-4 flex justify-between"><span>Som recebido</span><span>{receiving ? Math.round(levelIn * 100) + "%" : "SEM REPRODUÇÃO"}</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-emerald-400 transition-all" style={{ width: Math.round(levelIn * 100) + "%" }} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Volume2 className="size-4 shrink-0" />
        <label htmlFor="jarvis-audio-volume" className="text-xs">Volume</label>
        <input id="jarvis-audio-volume" type="range" min="0" max="1" step="0.01"
          value={volume} onChange={(e) => changeVolume(Number(e.target.value))}
          className="w-full accent-amber-400" />
      </div>
      <audio ref={audioRef} controls className="mt-4 w-full" aria-label="Áudio recebido do outro dispositivo"
        onPlay={() => setReceiving(true)}
        onPause={() => setReceiving(false)}
        onEnded={() => setReceiving(false)} />
      {error ? <p role="alert" className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/5 p-3 text-xs text-amber-200">
        ⚠️ {error}
      </p> : null}
      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        PLAYER envia e reproduz; ORB continua visual/captura. Transcrição e Hermes não recebem este áudio automaticamente.
      </p>
    </section>
  );
}
