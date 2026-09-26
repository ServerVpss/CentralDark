import { useEffect, useMemo, useRef, useState } from "react";
import { Terminal, X, ShieldAlert, Cpu, Wifi } from "lucide-react";
import { formatTimeWithSecondsBR } from "@/lib/datetime";

interface HackerModeProps {
  open: boolean;
  onClose: () => void;
}

const BREACH_LINES = [
  { tag: "SYSTEM", color: "text-primary", text: "Initializing intrusion vector..." },
  { tag: "SCAN", color: "text-info", text: "Scanning ports 0-65535 on 192.168.1.1" },
  { tag: "SCAN", color: "text-info", text: "Open ports: 22, 80, 443, 8080, 3306" },
  { tag: "EXPLOIT", color: "text-warning", text: "Probing CVE-2024-31337 on target..." },
  { tag: "EXPLOIT", color: "text-warning", text: "Payload delivered. Awaiting response..." },
  { tag: "ALERT", color: "text-destructive", text: "[!] SYSTEM BREACH DETECTED" },
  { tag: "ACCESS", color: "text-primary", text: "Root shell acquired @ root@mainframe:~#" },
  { tag: "DUMP", color: "text-info", text: "Extracting /etc/shadow ..." },
  { tag: "DUMP", color: "text-info", text: "1.452 credentials decrypted (sha512)" },
  { tag: "TRACE", color: "text-warning", text: "Bypassing IDS signature 0xDEADBEEF" },
  { tag: "TRACE", color: "text-warning", text: "Rerouting through 7 proxy nodes [TOR]" },
  { tag: "ALERT", color: "text-destructive", text: "[!!] FIREWALL COUNTERMEASURES ENGAGED" },
  { tag: "DEFENSE", color: "text-primary", text: "Deploying polymorphic shellcode..." },
  { tag: "SUCCESS", color: "text-primary", text: "[OK] Mainframe compromised. Persistence installed." },
  { tag: "EXFIL", color: "text-info", text: "Uploading 2.4GB to encrypted dropzone..." },
  { tag: "CLEAN", color: "text-muted-foreground", text: "Wiping logs... overwriting MFT entries..." },
  { tag: "DONE", color: "text-primary", text: ">> Operation complete. Disconnecting." },
];

const ASCII_FRAMES = [
  `   ▄████▄   ▒█████   ▓█████▄  ▓█████ 
  ▒██▀ ▀█  ▒██▒  ██▒ ▒██▀ ██▌ ▓█   ▀ 
  ▒▓█    ▄ ▒██░  ██▒ ░██   █▌ ▒███   
  ▒▓▓▄ ▄██▒▒██   ██░ ░▓█▄   ▌ ▒▓█  ▄ 
  ▒ ▓███▀ ░░ ████▓▒░ ░▒████▓  ░▒████▒
  ░ ░▒ ▒  ░░ ▒░▒░▒░   ▒▒▓  ▒  ░░ ▒░ ░`,
  `   ▄████▄   ▒█████   ▓█████▄  ▓█████ 
  ▒██▀ ▀█  ▒██▒  ██▒ ▒██▀ ██▌ ▓█   ▀ 
  ▒▓█    ▄ ▒██░  ██▒ ░██   █▌ ▒███   
  ▒▓▓▄▄▄██▒▒██   ██░ ░▓█▄▄▄▌ ▒▓█  ▄ 
  ▒ ▓███▀ ░░ ████▓▒░ ░▒████▓  ░▒████▒
  ░ ░▒▒▒  ░░ ▒░▒░▒░   ▒▒▓  ▒  ░░ ▒░ ░`,
];

const TYPE_TEXT = "$ ./exploit --target=mainframe --mode=stealth --payload=reverse_shell";

export function HackerMode({ open, onClose }: HackerModeProps) {
  const [typed, setTyped] = useState("");
  const [logs, setLogs] = useState<typeof BREACH_LINES>([]);
  const [progress, setProgress] = useState(0);
  const [crackProgress, setCrackProgress] = useState(0);
  const [bypassProgress, setBypassProgress] = useState(0);
  const [frame, setFrame] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  // Typewriter
  useEffect(() => {
    if (!open) return;
    setTyped("");
    setLogs([]);
    setProgress(0);
    setCrackProgress(0);
    setBypassProgress(0);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(TYPE_TEXT.slice(0, i));
      if (i >= TYPE_TEXT.length) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, [open]);

  // Log streaming
  useEffect(() => {
    if (!open) return;
    let idx = 0;
    const id = setInterval(() => {
      setLogs((prev) => [...prev, BREACH_LINES[idx % BREACH_LINES.length]]);
      idx++;
      if (idx > 40) clearInterval(id);
    }, 600);
    return () => clearInterval(id);
  }, [open]);

  // Auto scroll
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [logs]);

  // Progress bars
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + Math.random() * 4));
      setCrackProgress((p) => (p >= 100 ? 0 : p + Math.random() * 2.5));
      setBypassProgress((p) => (p >= 100 ? 0 : p + Math.random() * 6));
    }, 200);
    return () => clearInterval(id);
  }, [open]);

  // ASCII frame
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % ASCII_FRAMES.length), 400);
    return () => clearInterval(id);
  }, [open]);

  const matrixCols = useMemo(
    () => Array.from({ length: 30 }, () => Math.random() * 100),
    [open]
  );

  if (!open) return null;

  const time = formatTimeWithSecondsBR();

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col animate-fade-in">
      {/* Matrix rain bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {matrixCols.map((left, i) => (
          <div
            key={i}
            className="absolute top-0 text-primary font-mono text-xs animate-[fade-in_2s_ease-in-out_infinite]"
            style={{
              left: `${left}%`,
              animationDelay: `${i * 0.15}s`,
              writingMode: "vertical-rl",
            }}
          >
            {Array.from({ length: 20 })
              .map(() => Math.round(Math.random()))
              .join(" ")}
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-primary/40 bg-background/60">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-destructive animate-pulse" />
          <h2 className="font-display font-bold tracking-widest text-primary text-glow text-sm">
            HACKER UI MODE — UNAUTHORIZED ACCESS SIMULATION
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/40 text-primary hover:bg-primary/10 transition text-xs font-mono"
        >
          <X className="w-3 h-3" /> EXIT [ESC]
        </button>
      </div>

      <div className="relative z-10 flex-1 grid grid-cols-12 gap-4 p-6 overflow-hidden">
        {/* Left: Terminal */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 min-h-0">
          <div className="bg-card/60 border border-primary/30 rounded-xl border-glow overflow-hidden flex flex-col min-h-0 flex-1">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-primary/20 bg-background/40">
              <Terminal className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-xs text-muted-foreground">root@mainframe: ~/exploits</span>
              <div className="ml-auto flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                <span className="w-2 h-2 rounded-full bg-warning" />
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            </div>
            <div className="p-4 font-mono text-xs flex-1 overflow-hidden flex flex-col scanline">
              <pre className="text-primary text-[10px] leading-tight mb-3 text-glow">
                {ASCII_FRAMES[frame]}
              </pre>
              <p className="text-primary mb-2">
                {typed}
                <span className="inline-block w-2 h-3 bg-primary ml-0.5 animate-blink" />
              </p>
              <div ref={logRef} className="flex-1 overflow-auto space-y-1">
                {logs.map((l, i) => (
                  <div key={i} className="flex gap-2 animate-fade-in">
                    <span className="text-muted-foreground shrink-0">{time}</span>
                    <span className={`${l.color} font-bold shrink-0 w-20`}>[{l.tag}]</span>
                    <span className="text-foreground/90">{l.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Progress bars */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-auto">
          <FakeProgress
            icon={<Cpu className="w-4 h-4" />}
            label="DECRYPTING SHA-512"
            value={crackProgress}
            sublabel={`${Math.floor(crackProgress * 13.4).toLocaleString()} hashes/sec`}
          />
          <FakeProgress
            icon={<Wifi className="w-4 h-4" />}
            label="BYPASSING FIREWALL"
            value={bypassProgress}
            sublabel="Layer 7 evasion active"
          />
          <FakeProgress
            icon={<ShieldAlert className="w-4 h-4" />}
            label="INJECTING PAYLOAD"
            value={progress}
            sublabel={`Buffer @ 0x${Math.floor(progress * 167772).toString(16).toUpperCase()}`}
          />

          <div className="bg-card/60 border border-destructive/40 rounded-xl p-4 mt-auto">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <span className="font-display text-xs tracking-widest text-destructive">
                THREAT LEVEL: CRITICAL
              </span>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
              &gt; Esta é uma simulação visual.
              <br />&gt; Nenhum sistema real está sendo acessado.
              <br />&gt; Modo demonstrativo "Hacker UI".
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FakeProgress({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sublabel: string;
}) {
  return (
    <div className="bg-card/60 border border-primary/30 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-primary">
          {icon}
          <span className="font-display text-[11px] tracking-widest">{label}</span>
        </div>
        <span className="font-mono text-xs text-primary text-glow">
          {value.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full bg-background/60 rounded-full overflow-hidden border border-primary/20">
        <div
          className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary-glow transition-all duration-200"
          style={{ width: `${value}%`, boxShadow: "0 0 10px hsl(var(--primary) / 0.8)" }}
        />
      </div>
      <p className="font-mono text-[10px] text-muted-foreground mt-1.5">{sublabel}</p>
    </div>
  );
}
