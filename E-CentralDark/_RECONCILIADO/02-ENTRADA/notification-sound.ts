// Geração de sons sintéticos via Web Audio API — sem precisar de arquivos.
// 3 presets: suave, classico, alerta.
let ctx: AudioContext | null = null;
let unlocked = false;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    const Ctor = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    return ctx;
  } catch { return null; }
}

export async function unlockSound(): Promise<boolean> {
  const c = ensureCtx();
  if (!c) return false;
  try {
    if (c.state === "suspended") await c.resume();
    // Toque silencioso pra liberar o autoplay
    const o = c.createOscillator();
    const g = c.createGain();
    g.gain.value = 0.0001;
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.01);
    unlocked = true;
    return true;
  } catch { return false; }
}

export function isSoundUnlocked(): boolean { return unlocked; }

type SoundChoice = "suave" | "classico" | "alerta";

function tone(c: AudioContext, freq: number, durationMs: number, startMs: number, volume: number, type: OscillatorType = "sine") {
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  const startTime = c.currentTime + startMs / 1000;
  const endTime = startTime + durationMs / 1000;
  g.gain.setValueAtTime(0.0001, startTime);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), startTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, endTime);
  o.connect(g).connect(c.destination);
  o.start(startTime);
  o.stop(endTime + 0.02);
}

export function playNotificationSound(choice: SoundChoice = "suave", volume0to100 = 70): void {
  const c = ensureCtx();
  if (!c || !unlocked) return;
  const v = Math.max(0, Math.min(1, volume0to100 / 100)) * 0.35; // teto pra não estourar
  if (choice === "suave") {
    tone(c, 880, 120, 0, v);
    tone(c, 1175, 160, 130, v);
  } else if (choice === "classico") {
    tone(c, 988, 140, 0, v, "triangle");
    tone(c, 740, 200, 150, v, "triangle");
  } else {
    tone(c, 1320, 90, 0, v, "square");
    tone(c, 1320, 90, 110, v, "square");
    tone(c, 1320, 120, 220, v, "square");
  }
}
