# OUTRO - loading-dots.tsx
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\apps\crm\src\components\ui\loading-dots.tsx
**SHA:** adc1a2031c0cde0a
**Timestamp:** 2026-08-26T19:31:15.735837
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- sm: { dot: "h-1.5 w-1.5", gap: "gap-1", text: "text-xs" },
- md: { dot: "h-2.5 w-2.5", gap: "gap-1.5", text: "text-sm" },
- lg: { dot: "h-3.5 w-3.5", gap: "gap-2", text: "text-base" },

### Ouro Bruto (primeiros 5000 chars)
```
import { cn } from "@/lib/utils";

type LoadingDotsProps = {
  label?: string;
  fullscreen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeMap = {
  sm: { dot: "h-1.5 w-1.5", gap: "gap-1", text: "text-xs" },
  md: { dot: "h-2.5 w-2.5", gap: "gap-1.5", text: "text-sm" },
  lg: { dot: "h-3.5 w-3.5", gap: "gap-2", text: "text-base" },
};

export function LoadingDots({
  label = "Carregando",
  fullscreen = false,
  size = "md",
  className,
}: LoadingDotsProps) {
  const s = sizeMap[size];
  const dots = (
    <div className={cn("flex flex-col items-center", s.text)}>
      <div className={cn("flex items-center", s.gap)} aria-hidden>
        <span className={cn("rounded-full bg-primary animate-loading-bounce", s.dot)} style={{ animationDelay: "0ms" }} />
        <span className={cn("rounded-full bg-primary animate-loading-bounce", s.dot)} style={{ animationDelay: "150ms" }} />
        <span className={cn("rounded-full bg-primary animate-loading-bounce", s.dot)} style={{ animationDelay: "300ms" }} />
      </div>
      {label && (
        <span className="mt-3 text-muted-foreground tracking-wide">
          {label}<span className="animate-loading-ellipsis" />
        </span>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn("flex h-screen w-full items-center justify-center bg-background", className)}
      >
        {dots}
        <span className="sr-only">{label}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex w-full items-center justify-center py-6", className)}
    >
      {dots}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default LoadingDots;

```