export interface SolSettings {
  gatewayUrl: string;
  gatewayKey: string;
  ttsUrl: string;
  ttsKey: string;
  ttsVoice: string;
  ttsModel: string;
  useBrowserSpeechRecognition: boolean;
  theme: "overclock" | "crm";
}

const KEY = "centraldark.sol.settings.v1";

export const defaults: SolSettings = {
  gatewayUrl: "http://127.0.0.1:8787/v1/sol/respond",
  gatewayKey: "",
  ttsUrl: "https://bridge.centralldark.com/v1/audio/speech",
  ttsKey: "",
  ttsVoice: "nova",
  ttsModel: "openai/gpt-4o-mini-tts",
  useBrowserSpeechRecognition: true,
  theme: "overclock",
};

export function loadSettings(): SolSettings {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: SolSettings): void {
  localStorage.setItem(KEY, JSON.stringify(settings));
}
