// Componentes reutilizáveis pra mostrar hora/data SEMPRE no fuso de Brasília.
// Usar em qualquer lugar do sistema em vez de `toLocaleString` direto.
//
// - <TimeBR value={iso} />              → "10:18"
// - <DateBR value={iso} />              → "20/05/2026"
// - <DateTimeBR value={iso} />          → "20/05/2026 10:18"
// - <RelativeBR value={iso} />          → "agora", "há 3 min", "há 2 h", senão DateTimeBR
// - <NowBR />                            → relógio ao vivo (auto-refresh a cada 30s)
//
// Todos usam src/lib/datetime, que força timeZone="America/Sao_Paulo".

import * as React from "react";
import {
  formatDateBR,
  formatDateTimeBR,
  formatTimeBR,
} from "@/lib/datetime";

type Input = Date | string | number | null | undefined;

type CommonProps = {
  value: Input;
  className?: string;
  title?: string;
  options?: Intl.DateTimeFormatOptions;
};

export function TimeBR({ value, className, title, options }: CommonProps) {
  return (
    <time className={className} title={title ?? (value ? formatDateTimeBR(value) : undefined)}>
      {formatTimeBR(value, options)}
    </time>
  );
}

export function DateBR({ value, className, title, options }: CommonProps) {
  return (
    <time className={className} title={title ?? (value ? formatDateTimeBR(value) : undefined)}>
      {formatDateBR(value, options)}
    </time>
  );
}

export function DateTimeBR({ value, className, title, options }: CommonProps) {
  return (
    <time className={className} title={title}>
      {formatDateTimeBR(value, options)}
    </time>
  );
}

function relativeLabel(input: Input): string {
  if (!input) return "—";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "—";
  const diffSec = Math.round((Date.now() - d.getTime()) / 1000);
  if (diffSec < 0) return formatDateTimeBR(d);
  if (diffSec < 45) return "agora";
  if (diffSec < 90) return "há 1 min";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH} h`;
  return formatDateTimeBR(d);
}

export function RelativeBR({ value, className, title }: Omit<CommonProps, "options">) {
  // Re-renderiza a cada 30s pra "há X min" ficar vivo.
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <time className={className} title={title ?? (value ? formatDateTimeBR(value) : undefined)}>
      {relativeLabel(value)}
    </time>
  );
}

/** Relógio ao vivo no fuso de Brasília. Atualiza a cada 30s. */
export function NowBR({
  className,
  withDate = false,
  options,
}: {
  className?: string;
  withDate?: boolean;
  options?: Intl.DateTimeFormatOptions;
}) {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <time className={className} title={formatDateTimeBR(now)}>
      {withDate ? formatDateTimeBR(now, options) : formatTimeBR(now, options)}
    </time>
  );
}
