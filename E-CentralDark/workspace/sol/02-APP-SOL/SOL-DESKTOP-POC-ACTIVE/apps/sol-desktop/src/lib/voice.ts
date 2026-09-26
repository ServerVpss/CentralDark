import type { SolSettings } from "./settings";

export interface SolRecognizer {
  start(): void;
  stop(): void;
  abort(): void;
}

interface BrowserRecognitionEvent extends Event {
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>;
}

interface BrowserRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: BrowserRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
}

type RecognitionConstructor = new () => BrowserRecognition;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

export function createRecognition(
  settings: SolSettings,
  onText: (text: string, final: boolean) => void,
  onEnd: () => void,
  onError: (message: string) => void,
): SolRecognizer | null {
  const Constructor = settings.useBrowserSpeechRecognition
    ? (window.SpeechRecognition ?? window.webkitSpeechRecognition)
    : undefined;
  if (!Constructor) return createLocalRecorder(settings, onText, onEnd, onError);
  const recognition = new Constructor();
  recognition.lang = "pt-BR";
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.onresult = (event) => {
    let text = "";
    let final = false;
    for (let index = 0; index < event.results.length; index += 1) {
      text += event.results[index][0]?.transcript ?? "";
      final ||= event.results[index].isFinal;
    }
    onText(text.trim(), final);
  };
  recognition.onend = onEnd;
  recognition.onerror = (event) => onError(event.error || "Falha no reconhecimento de voz");
  return recognition;
}

function createLocalRecorder(
  settings: SolSettings,
  onText: (text: string, final: boolean) => void,
  onEnd: () => void,
  onError: (message: string) => void,
): SolRecognizer | null {
  if (!settings.sttUrl || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return null;

  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let chunks: Blob[] = [];
  let aborted = false;

  const release = () => {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    recorder = null;
  };

  const transcribe = async () => {
    const blob = new Blob(chunks, { type: chunks[0]?.type || "audio/webm" });
    chunks = [];
    if (aborted || blob.size === 0) {
      release();
      onEnd();
      return;
    }
    try {
      const form = new FormData();
      form.append("file", blob, `sol-${Date.now()}.webm`);
      form.append("model", "base");
      form.append("language", "pt");
      const response = await fetch(settings.sttUrl, {
        method: "POST",
        headers: settings.sttKey ? { "x-api-key": settings.sttKey } : {},
        body: form,
      });
      const body = await response.json().catch(() => ({})) as { text?: string; error?: string };
      if (!response.ok) throw new Error(body.error || `STT respondeu HTTP ${response.status}`);
      const text = body.text?.trim() || "";
      if (text) onText(text, true);
      onEnd();
    } catch (error) {
      onError(error instanceof Error ? error.message : "Falha na transcrição local");
    } finally {
      release();
    }
  };

  const start = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (aborted) {
        release();
        onEnd();
        return;
      }
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg"].find((type) => MediaRecorder.isTypeSupported(type));
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
      recorder.onerror = () => onError("Falha na captura do microfone");
      recorder.onstop = () => { void transcribe(); };
      recorder.start();
    } catch (error) {
      release();
      onError(error instanceof Error ? error.message : "Permissão de microfone recusada");
    }
  };

  return {
    start: () => { void start(); },
    stop: () => { if (recorder && recorder.state !== "inactive") recorder.stop(); },
    abort: () => {
      aborted = true;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      else release();
    },
  };
}

let audio: HTMLAudioElement | null = null;

export function stopVoice(): void {
  window.speechSynthesis?.cancel();
  if (audio) {
    audio.pause();
    audio.src = "";
    audio = null;
  }
}

export async function speak(text: string, settings: SolSettings): Promise<"bridge" | "browser"> {
  stopVoice();
  const localBridge = /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?(?:\/|$)/i.test(settings.ttsUrl);
  if (settings.ttsUrl && (settings.ttsKey || localBridge)) {
    const response = await fetch(settings.ttsUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(settings.ttsKey ? { "x-api-key": settings.ttsKey } : {}),
      },
      body: JSON.stringify({
        model: localBridge ? "kokoro" : settings.ttsModel,
        voice: localBridge ? "pf_dora" : settings.ttsVoice,
        input: text.slice(0, 4000),
        response_format: "mp3",
        instructions: "Fale em português brasileiro nativo, com precisão, firmeza e naturalidade.",
      }),
    });
    if (!response.ok) throw new Error(`TTS bridge respondeu HTTP ${response.status}`);
    const blob = await response.blob();
    audio = new Audio(URL.createObjectURL(blob));
    await audio.play();
    return "bridge";
  }

  await new Promise<void>((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 1.04;
    utterance.onend = () => resolve();
    utterance.onerror = () => reject(new Error("TTS do Windows falhou"));
    window.speechSynthesis.speak(utterance);
  });
  return "browser";
}
