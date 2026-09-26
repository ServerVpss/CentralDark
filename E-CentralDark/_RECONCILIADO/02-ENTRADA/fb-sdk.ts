// Carrega o Facebook JavaScript SDK sob demanda e expõe verificação de login.
// Usado para detectar se o usuário já tem sessão no Facebook antes de abrir
// o popup do OAuth do WhatsApp Embedded Signup.

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

let loadingPromise: Promise<any> | null = null;

export function loadFbSdk(appId: string): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.FB) return Promise.resolve(window.FB);
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: false,
          version: "v22.0",
        });
        resolve(window.FB);
      } catch (e) {
        reject(e);
      }
    };
    const script = document.createElement("script");
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onerror = () => reject(new Error("Falha ao carregar SDK do Facebook"));
    document.body.appendChild(script);
  });

  return loadingPromise;
}

export type FbLoginStatus = "connected" | "not_authorized" | "unknown";

export interface FbStatusResult {
  status: FbLoginStatus;
  // true quando o usuário tem sessão ativa no facebook.com (mesmo sem ter
  // autorizado nosso app ainda). É isso que evita a tela "Log into business tools".
  loggedIntoFacebook: boolean;
}

export async function getFbLoginStatus(appId: string): Promise<FbStatusResult> {
  const FB = await loadFbSdk(appId);
  return new Promise((resolve) => {
    FB.getLoginStatus((response: any) => {
      const status = (response?.status ?? "unknown") as FbLoginStatus;
      resolve({
        status,
        loggedIntoFacebook: status === "connected" || status === "not_authorized",
      });
    });
  });
}

// Dispara o fluxo OFICIAL do WhatsApp Embedded Signup via FB.login().
// Diferente do /dialog/oauth genérico, esse método abre a tela de seleção
// de WhatsApp Business Account, business e número de telefone.
// Doc: https://developers.facebook.com/docs/whatsapp/embedded-signup/implementation
export async function fbLoginWithConfig(
  appId: string,
  configId: string,
): Promise<{ code: string }> {
  const FB = await loadFbSdk(appId);
  return new Promise((resolve, reject) => {
    FB.login(
      (response: any) => {
        const code = response?.authResponse?.code;
        if (code) {
          resolve({ code });
        } else if (response?.status === "unknown" || !response?.authResponse) {
          reject(new Error("Login cancelado."));
        } else {
          reject(new Error("Falha ao autorizar na Meta."));
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: "",
          sessionInfoVersion: "3",
        },
      },
    );
  });
}
