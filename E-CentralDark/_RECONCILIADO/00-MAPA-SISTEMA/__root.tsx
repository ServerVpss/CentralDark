import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/sonner";
import { UpdateBanner } from "@/components/update-banner";
import { InstallAppBanner } from "@/components/install-app-banner";
import { SegredoIAButton } from "@/components/segredo-ia/SegredoIAButton";
import { SegredoCommandPalette } from "@/components/segredo-ia/SegredoCommandPalette";
import { DevCacheRecover } from "@/components/dev-cache-recover";
import { resolveBrandingForCurrentHost } from "@/lib/host-branding.functions";
import { MultiZapThemeProvider } from "@/hooks/use-active-theme";
import { NexThemeWrapper } from "@/components/nexchat/NexThemeWrapper";
import { FloatingAssistant } from "@/components/assistant/FloatingAssistant";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço que você tentou acessar não existe.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Ir para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

const STALE_PATTERNS = [
  "Invalid server function ID",
  "_nonReactive",
  "Failed to fetch dynamically imported module",
  "Importing a module script failed",
  "error loading dynamically imported module",
];

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  // Auto-recover stale HMR/chunk errors caught pelo React error boundary
  if (typeof window !== "undefined" && STALE_PATTERNS.some((p) => error.message?.includes(p))) {
    try {
      const FLAG = "dev-cache-recovered-at";
      const last = Number(sessionStorage.getItem(FLAG) ?? "0");
      if (Date.now() - last > 30_000) {
        sessionStorage.setItem(FLAG, String(Date.now()));
        window.location.reload();
        return null;
      }
    } catch {}
  }

  // Em produção, nunca mostrar a mensagem técnica do React (#185, react.dev/errors...)
  // pro usuário final. Esses textos são só pra dev.
  const isDev = typeof import.meta !== "undefined" && (import.meta as any).env?.DEV;
  const techMsg = error?.message ?? "";
  const isReactInternal =
    /Minified React error|react\.dev\/errors|non-minified dev/i.test(techMsg);
  const showTech = isDev && techMsg && !isReactInternal;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Ops, algo não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tivemos um problema ao abrir essa tela. Tente de novo ou volte para o início — se continuar, atualize a página.
        </p>
        {showTech && (
          <p className="mt-2 text-[11px] text-muted-foreground/60 break-words">{techMsg}</p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tentar de novo
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: async () => {
    const hostBranding = await resolveBrandingForCurrentHost();
    return { hostBranding };
  },
  head: ({ loaderData }) => {
    const b = loaderData?.hostBranding ?? null;
    const isWhiteLabel = !!b?.white_label_active;
    const brand = isWhiteLabel ? (b?.brand_name || b?.workspace_name || "Atendimento") : "MultiZap";
    const titleSuffix = isWhiteLabel ? "" : " — Atendimento Profissional";
    const title = isWhiteLabel ? brand : `MultiZap${titleSuffix}`;
    const description = isWhiteLabel
      ? `${brand} — Atendimento profissional via WhatsApp.`
      : "MultiZap — Atendimento profissional via WhatsApp: inbox compartilhada, chatbot e envios em massa.";
    const ogImage = "https://multizap.dev/og-image.jpg";
    const favicon = isWhiteLabel && b?.favicon_url ? b.favicon_url : null;

    const meta: Array<Record<string, string>> = [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { name: "twitter:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:description", content: description },
      { property: "og:type", content: "website" },
    ];
    if (!isWhiteLabel) {
      meta.push(
        { property: "og:image", content: ogImage },
        { name: "twitter:image", content: ogImage },
        { name: "twitter:card", content: "summary_large_image" },
      );
    }
    const links: Array<Record<string, string>> = [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/apple-touch-icon.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/icons/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/icons/favicon-32.png" },
    ];
    meta.push(
      { name: "theme-color", content: "#00C853" },
      { name: "color-scheme", content: "dark light" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: brand },
      { name: "application-name", content: brand },
      { name: "format-detection", content: "telephone=no" },
    );

    if (favicon) links.push({ rel: "icon", href: favicon });
    return { meta, links };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { hostBranding } = Route.useLoaderData();
  const hideBrand = !!hostBranding?.hide_lovable_brand;
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MultiZapThemeProvider>
          <NexThemeWrapper />
          <DevCacheRecover />
          <UpdateBanner />
          <Outlet />
          <InstallAppBanner />
          {!hideBrand && <SegredoIAButton />}
          {!hideBrand && <SegredoCommandPalette />}
          <FloatingAssistant />
          <Toaster richColors position="top-right" />
        </MultiZapThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
