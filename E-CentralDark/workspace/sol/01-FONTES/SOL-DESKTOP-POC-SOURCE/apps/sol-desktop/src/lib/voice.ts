import type { SolSettings } from "./settings";

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
  onText: (text: string, final: boolean) => void,
  onEnd: () => void,
  onError: (message: string) => void,
): BrowserRecognition | null {
  const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Constructor) return null;
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
  if (settings.ttsUrl && settings.ttsKey) {
    const response = await fetch(settings.ttsUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": settings.ttsKey,
      },
      body: JSON.stringify({
        model: settings.ttsModel,
        voice: settings.ttsVoice,
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
