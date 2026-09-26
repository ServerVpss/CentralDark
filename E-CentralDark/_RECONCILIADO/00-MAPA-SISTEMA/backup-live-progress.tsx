// Acompanhamento em tempo real da cópia de segurança.
// Mostra etapa atual em destaque, lista das 6 etapas, barra grande
// de progresso e tempo decorrido. Anima entre etapas com base no
// status do banco + tempo desde started_at (sem precisar de webhook).

import { motion, AnimatePresence, useMotionValue, useTransform, animate, LayoutGroup } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  Database,
  Cloud,
  Server,
  Lock,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  PartyPopper,
  Wifi,
  WifiOff,
  Activity,
} from "lucide-react";
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  springBar,
  springSnappy,
  easeOutExpo,
} from "@/lib/motion-presets";

type RunStatus = "requested" | "running" | "success" | "error" | string;

type Props = {
  // Última execução (a mais recente). Pode ser undefined quando ainda nenhum row existe.
  run?: {
    id?: string;
    status?: RunStatus;
    started_at?: string | null;
    finished_at?: string | null;
    error_message?: string | null;
    current_step?: string | null;
    progress_percent?: number | null;
    status_message?: string | null;
    vps_last_seen_at?: string | null;
    vps_started_at?: string | null;
    vps_worker_id?: string | null;
    progress_log?: unknown;
  } | null;
  // True quando o usuário acabou de clicar e o serverFn ainda não respondeu.
  isPendingClick?: boolean;
  // Destino atual (para o texto do upload)
  destination?: string;
};

type StageKey = "queue" | "db" | "site" | "server" | "encrypt" | "upload" | "done";

type Stage = {
  key: StageKey;
  num: number;
  title: string;
  detail: string;
  Icon: typeof Database;
  color: string;
  // duração aproximada (segundos) usada para animar a barra
  dur: number;
};

const STAGES: Stage[] = [
  { key: "queue",   num: 0, title: "Esperando resposta da VPS",              detail: "O pedido já foi criado. Falta a VPS responder e assumir o serviço.", Icon: Clock,    color: "#eab308", dur: 30 },
  { key: "db",      num: 1, title: "Salvando o banco de dados",              detail: "Exportando todas as conversas, contatos e configurações.",      Icon: Database, color: "#22c55e", dur: 25 },
  { key: "site",    num: 2, title: "Empacotando o site (painel)",            detail: "Guardando a referência para republicar pelo GitHub.",            Icon: Cloud,    color: "#3b82f6", dur: 5  },
  { key: "server",  num: 3, title: "Empacotando o servidor do WhatsApp",     detail: "Código + sessões ativas do gateway na VPS.",                     Icon: Server,   color: "#a855f7", dur: 20 },
  { key: "encrypt", num: 4, title: "Cifrando tudo com AES-256",              detail: "Senha de criptografia (cofre) — sem ela, ninguém abre o pacote.", Icon: Lock,     color: "#f97316", dur: 12 },
  { key: "upload",  num: 5, title: "Enviando para o destino escolhido",      detail: "Sobe o pacote final cifrado.",                                   Icon: Upload,   color: "#06b6d4", dur: 25 },
  { key: "done",    num: 6, title: "Pronto!",                                 detail: "Cópia concluída e registrada no histórico.",                    Icon: PartyPopper, color: "#22c55e", dur: 0 },
];

function fmtElapsed(sec: number) {
  if (sec < 60) return `${Math.floor(sec)}s`;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function parseProgressLog(input: unknown): Array<{ at?: string; step?: string; percent?: number; message?: string }> {
  return Array.isArray(input) ? input.filter((item) => item && typeof item === "object") as any[] : [];
}

function InfoPill({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: typeof Database;
  label: string;
  value: string;
  tone: "ok" | "warn" | "muted";
}) {
  const color = tone === "ok" ? "#22c55e" : tone === "warn" ? "#eab308" : "hsl(var(--muted-foreground))";
  return (
    <div className="rounded-md border bg-background/45 px-3 py-2 flex items-center gap-2 min-w-0">
      <Icon className="h-4 w-4 shrink-0" style={{ color }} />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-xs font-medium text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}

export function BackupLiveProgress({ run, isPendingClick, destination }: Props) {
  const status: RunStatus = isPendingClick && !run ? "requested" : (run?.status ?? "requested");
  const progressLog = useMemo(() => parseProgressLog(run?.progress_log), [run?.progress_log]);
  const lastSeenMs = run?.vps_last_seen_at ? new Date(run.vps_last_seen_at).getTime() : null;
  const startedAtMs = useMemo(() => {
    if (run?.started_at) return new Date(run.started_at).getTime();
    return Date.now();
  }, [run?.started_at]);

  // Tick para tempo decorrido (1s)
  const [nowMs, setNowMs] = useState(Date.now());
  useEffect(() => {
    if (status === "success" || status === "error") return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status]);

  const elapsedSec = Math.max(0, (nowMs - startedAtMs) / 1000);
  const secondsSinceVps = lastSeenMs ? Math.max(0, Math.floor((nowMs - lastSeenMs) / 1000)) : null;
  const hasVpsContact = Boolean(lastSeenMs || run?.vps_started_at || progressLog.length > 0);
  const vpsLooksStale = status !== "success" && status !== "error" && secondsSinceVps !== null && secondsSinceVps > 90;

  // Decide etapa atual + percentual
  const { currentIdx, percent } = useMemo(() => {
    if (status === "success") return { currentIdx: STAGES.length - 1, percent: 100 };
    if (typeof run?.progress_percent === "number" && run.progress_percent > 0) {
      const idx = pickIdxFromPercent(run.progress_percent, status, run.current_step ?? undefined);
      return { currentIdx: idx, percent: Math.min(100, Math.max(0, run.progress_percent)) };
    }
    if (status === "error") {
      // erro: trava na etapa estimada pelo tempo, em vermelho
      const idx = pickIdxFromElapsed(elapsedSec, status);
      return { currentIdx: idx, percent: Math.min(95, computePercent(idx, elapsedSec, status)) };
    }
    if (status === "requested") {
      // limite ~30s na fila (cron 1 em 1 min)
      const pct = Math.min(12, 4 + (elapsedSec / 30) * 8);
      return { currentIdx: 0, percent: pct };
    }
    // running
    const idx = pickIdxFromElapsed(elapsedSec, "running");
    return { currentIdx: idx, percent: computePercent(idx, elapsedSec, "running") };
  }, [status, elapsedSec, run?.progress_percent, run?.current_step]);

  // Barra animada com spring suave (sensação mais "viva" que duration linear)
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(mv, percent, springBar);
    return () => controls.stop();
  }, [percent, mv]);
  useEffect(() => mv.on("change", (v) => setDisplay(v)), [mv]);
  const widthPct = useTransform(mv, (v) => `${v}%`);

  const current = STAGES[currentIdx];
  const CurIcon = current.Icon;

  const isFinal = status === "success" || status === "error";
  const isErr = status === "error";

  return (
    <LayoutGroup>
    <motion.div
      className="rounded-xl border bg-card overflow-hidden"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOutExpo }}
    >
      {/* Cabeçalho com etapa atual em destaque (background anima entre cores) */}
      <motion.div
        className="p-5 border-b relative overflow-hidden"
        animate={{
          background: `linear-gradient(135deg, ${isErr ? "#ef4444" : current.color}1f, transparent 70%)`,
        }}
        transition={{ duration: 0.7, ease: easeOutExpo }}
      >
        <div className="flex items-start gap-4">
          <motion.div
            key={current.key}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className="h-14 w-14 rounded-2xl grid place-items-center shrink-0"
            style={{
              background: `${current.color}22`,
              boxShadow: `0 0 24px ${current.color}40`,
            }}
          >
            {isErr ? (
              <XCircle className="h-7 w-7" style={{ color: "#ef4444" }} />
            ) : status === "success" ? (
              <CheckCircle2 className="h-7 w-7" style={{ color: "#22c55e" }} />
            ) : (
              <motion.div
                animate={{ rotate: status === "running" || status === "requested" ? 360 : 0 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <CurIcon className="h-7 w-7" style={{ color: current.color }} />
              </motion.div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
              <span>{current.key === "queue" ? "Aguardando resposta" : `Etapa ${Math.min(current.num, 6)} de 6`}</span>
              <span>•</span>
              <span>Tempo decorrido: <strong className="text-foreground">{fmtElapsed(elapsedSec)}</strong></span>
              {destination && (
                <>
                  <span>•</span>
                  <span>Destino: <strong className="text-foreground uppercase">{destination}</strong></span>
                </>
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.h3
                key={current.key + status}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="text-xl sm:text-2xl font-bold leading-tight mt-0.5"
              >
                {isErr ? "A cópia falhou nesta etapa" : status === "success" ? "Cópia concluída com sucesso" : (run?.status_message || current.title)}
              </motion.h3>
            </AnimatePresence>
            <p className="text-sm text-muted-foreground mt-1">
              {isErr ? (run?.error_message || run?.status_message || "Veja o detalhe no histórico abaixo.") : current.detail}
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <InfoPill
                Icon={hasVpsContact ? Wifi : WifiOff}
                label="Comunicação"
                value={hasVpsContact ? (vpsLooksStale ? `sem sinal há ${fmtElapsed(secondsSinceVps || 0)}` : "VPS respondeu") : "a VPS ainda não respondeu"}
                tone={hasVpsContact && !vpsLooksStale ? "ok" : "warn"}
              />
              <InfoPill
                Icon={Activity}
                label="Último sinal"
                value={secondsSinceVps === null ? "nenhum ainda" : `${fmtElapsed(secondsSinceVps)} atrás`}
                tone={vpsLooksStale ? "warn" : "muted"}
              />
              <InfoPill
                Icon={Server}
                label="VPS"
                value={run?.vps_worker_id ? run.vps_worker_id.split("-").slice(0, -1).join("-") || "identificada" : "aguardando"}
                tone="muted"
              />
            </div>
          </div>

          <div className="text-right shrink-0">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={Math.round(display / 5) /* pulsa a cada ~5% */}
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={springSnappy}
                className="text-3xl sm:text-4xl font-mono tabular-nums font-bold"
                style={{ color: isErr ? "#ef4444" : current.color }}
              >
                {Math.round(display)}%
              </motion.div>
            </AnimatePresence>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">progresso</div>
          </div>
        </div>

        {/* Barra GRANDE */}
        <div className="mt-4 relative h-6 w-full rounded-full bg-muted/60 ring-1 ring-border/60 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent 0 8px, hsl(var(--border)) 8px 9px)",
            }}
          />
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: widthPct,
              background: isErr
                ? "linear-gradient(90deg, #b91c1c 0%, #ef4444 50%, #f87171 100%)"
                : `linear-gradient(90deg, ${current.color} 0%, ${current.color}cc 50%, ${current.color}80 100%)`,
              boxShadow: `0 0 18px ${isErr ? "#ef4444" : current.color}aa, inset 0 0 8px rgba(255,255,255,.25)`,
            }}
          >
            {!isFinal && (
              <motion.div
                aria-hidden
                className="absolute inset-y-0 w-1/3 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, rgba(255,255,255,.55) 50%, transparent 100%)",
                  mixBlendMode: "screen",
                }}
                animate={{ x: ["-100%", "320%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.div>
        </div>
      </motion.div>

      {progressLog.length > 0 && (
        <div className="px-5 py-4 border-b bg-background/35">
          <div className="text-xs font-semibold uppercase text-muted-foreground mb-3">O que já aconteceu</div>
          <motion.div className="space-y-2" variants={staggerContainer(0.05)} initial="initial" animate="animate">
            <AnimatePresence initial={false}>
              {progressLog.slice(-8).map((item, idx) => (
                <motion.div
                  layout
                  key={`${item.at}-${idx}`}
                  variants={staggerItem}
                  initial="initial"
                  animate="animate"
                  exit={{ opacity: 0, x: -8, transition: { duration: 0.2 } }}
                  className="flex items-start gap-3 text-sm"
                >
                  <motion.span
                    className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0"
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground leading-snug">{item.message || item.step || "Atualização recebida da VPS"}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {item.at ? new Date(item.at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "agora"}
                      {typeof item.percent === "number" ? ` • ${item.percent}%` : ""}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Lista das 6 etapas */}
      <motion.ol
        className="divide-y"
        variants={staggerContainer(0.05, 0.1)}
        initial="initial"
        animate="animate"
      >
        {STAGES.slice(0, 6).map((s, i) => {
          const state: "done" | "active" | "pending" =
            status === "success" || i < currentIdx
              ? "done"
              : i === currentIdx
              ? "active"
              : "pending";
          const isCurrentErr = isErr && i === currentIdx;
          const Icon = s.Icon;
          return (
            <motion.li
              layout
              key={s.key}
              variants={staggerItem}
              animate={{
                background: state === "active" ? `${s.color}14` : "rgba(0,0,0,0)",
                scale: state === "active" ? 1.01 : 1,
              }}
              transition={{ duration: 0.4, ease: easeOutExpo }}
              className="flex items-center gap-3 px-5 py-3"
            >
              <div
                className="h-9 w-9 rounded-full grid place-items-center shrink-0"
                style={{
                  background:
                    state === "done"
                      ? "#22c55e22"
                      : isCurrentErr
                      ? "#ef444422"
                      : state === "active"
                      ? `${s.color}22`
                      : "hsl(var(--muted))",
                  color:
                    state === "done"
                      ? "#22c55e"
                      : isCurrentErr
                      ? "#ef4444"
                      : state === "active"
                      ? s.color
                      : "hsl(var(--muted-foreground))",
                }}
              >
                {state === "done" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : isCurrentErr ? (
                  <XCircle className="h-5 w-5" />
                ) : state === "active" ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4 opacity-60" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      background:
                        state === "done"
                          ? "#22c55e22"
                          : state === "active"
                          ? `${s.color}22`
                          : "hsl(var(--muted))",
                      color:
                        state === "done"
                          ? "#22c55e"
                          : state === "active"
                          ? s.color
                          : "hsl(var(--muted-foreground))",
                    }}
                  >
                    {s.num === 0 ? "FILA" : `${s.num}/6`}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      state === "pending" ? "text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {s.title}
                  </span>
                  {state === "active" && !isErr && (
                    <span className="ml-auto text-[11px] text-muted-foreground">em andamento…</span>
                  )}
                  {state === "done" && (
                    <span className="ml-auto text-[11px]" style={{ color: "#22c55e" }}>
                      feito
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.detail}</p>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </motion.div>
    </LayoutGroup>
  );
}

// Dado o tempo decorrido (s) decide em qual etapa estamos (1..5)
function pickIdxFromElapsed(elapsed: number, status: RunStatus): number {
  // etapas 1..5 (db, site, server, encrypt, upload)
  // se ainda estiver 'requested', cuidamos antes
  // mapeamos por durações cumulativas
  const order: StageKey[] = ["db", "site", "server", "encrypt", "upload"];
  let acc = 0;
  for (let i = 0; i < order.length; i++) {
    const stg = STAGES.find((s) => s.key === order[i])!;
    acc += stg.dur;
    if (elapsed < acc) return STAGES.findIndex((s) => s.key === order[i]);
  }
  // ainda rodando além do estimado → fica na última (upload) até virar success
  return STAGES.findIndex((s) => s.key === "upload");
}

function pickIdxFromPercent(percent: number, status: RunStatus, step?: string): number {
  if (status === "success" || percent >= 100) return STAGES.findIndex((s) => s.key === "done");
  if (status === "requested" || percent < 15) return STAGES.findIndex((s) => s.key === "queue");
  const byStep: Record<string, StageKey> = {
    salvando_banco: "db",
    banco_salvo: "db",
    salvando_site: "site",
    site_salvo: "site",
    salvando_servidor: "server",
    servidor_salvo: "server",
    montando_pacote: "server",
    criptografando: "encrypt",
    enviando_github: "upload",
    upload_arquivo: "upload",
  };
  const key = step ? byStep[step] : undefined;
  if (key) return STAGES.findIndex((s) => s.key === key);
  if (percent < 55) return STAGES.findIndex((s) => s.key === "db");
  if (percent < 68) return STAGES.findIndex((s) => s.key === "site");
  if (percent < 86) return STAGES.findIndex((s) => s.key === "server");
  if (percent < 92) return STAGES.findIndex((s) => s.key === "encrypt");
  return STAGES.findIndex((s) => s.key === "upload");
}

function computePercent(idx: number, elapsed: number, status: RunStatus): number {
  // 0 = queue, 1..5 = etapas reais, 6 = done
  // queue ocupa de 0% a 15%; etapas 1..5 ocupam de 15% a 95%; success = 100%
  const order: StageKey[] = ["db", "site", "server", "encrypt", "upload"];
  const total = order.reduce((a, k) => a + STAGES.find((s) => s.key === k)!.dur, 0);
  // tempo já gasto até o início da etapa atual:
  let before = 0;
  for (let i = 0; i < order.length; i++) {
    const j = STAGES.findIndex((s) => s.key === order[i]);
    if (j === idx) break;
    before += STAGES[j].dur;
  }
  const stg = STAGES[idx];
  const within = Math.min(stg.dur, Math.max(0, elapsed - before));
  const ratio = (before + within) / total; // 0..~1
  const pct = 15 + Math.min(0.95, ratio) * 80;
  return Math.min(95, pct);
}

export default BackupLiveProgress;
