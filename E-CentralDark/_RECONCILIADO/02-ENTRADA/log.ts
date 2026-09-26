// Logger simples com fuso BRT. Sem dependências externas.

const TZ = "America/Sao_Paulo";

function ts(): string {
  return new Date().toLocaleString("pt-BR", {
    timeZone: TZ,
    hour12: false,
  });
}

type Level = "debug" | "info" | "warn" | "error";

function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
  const line = `[${ts()}] [${level.toUpperCase()}] ${msg}`;
  if (meta && Object.keys(meta).length > 0) {
    console.log(line, JSON.stringify(meta));
  } else {
    console.log(line);
  }
}

export const log = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta),
};
