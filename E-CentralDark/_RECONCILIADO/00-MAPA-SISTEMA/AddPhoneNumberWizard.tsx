// Wizard "Adicionar número à WABA" — fluxo em 4 passos: dados, código, confirmar, registrar.
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Phone, ShieldCheck, MessageSquare, PhoneCall, Loader2, Check,
  AlertTriangle, ExternalLink,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  InputOTP, InputOTPGroup, InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import {
  createMetaPhoneNumber, requestPhoneCode, verifyPhoneCode, registerMetaPhoneNumber,
} from "@/lib/meta-phone-numbers.functions";
import { MetaErrorPanel, parseMetaError, type MetaErrPayload } from "./MetaErrorPanel";

type Step = "dados" | "codigo" | "confirmar" | "registrar" | "concluido";

const STEPS: { key: Step; label: string }[] = [
  { key: "dados", label: "Dados" },
  { key: "codigo", label: "Código" },
  { key: "confirmar", label: "Confirmar" },
  { key: "registrar", label: "Registrar" },
];

export function AddPhoneNumberWizard({
  open, onClose, profileId, onConcluido,
}: {
  open: boolean;
  onClose: () => void;
  profileId: string;
  onConcluido: (connectionId: string) => void;
}) {
  const [step, setStep] = useState<Step>("dados");
  const [form, setForm] = useState({
    display_name: "",
    cc: "55",
    phone_number: "",
    verification_method: "SMS" as "SMS" | "VOICE",
    pin: "123456",
  });
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [code, setCode] = useState("");
  const [metaBlocked, setMetaBlocked] = useState<string | null>(null);
  const [lastError, setLastError] = useState<MetaErrPayload | null>(null);

  useEffect(() => {
    if (!open) {
      setStep("dados");
      setForm({ display_name: "", cc: "55", phone_number: "", verification_method: "SMS", pin: "123456" });
      setConnectionId(null);
      setCooldown(0);
      setCode("");
      setMetaBlocked(null);
      setLastError(null);
    }
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(id);
  }, [cooldown]);

  // Server functions
  const createFn = useServerFn(createMetaPhoneNumber);
  const requestFn = useServerFn(requestPhoneCode);
  const verifyFn = useServerFn(verifyPhoneCode);
  const registerFn = useServerFn(registerMetaPhoneNumber);

  const createM = useMutation({
    mutationFn: () => createFn({ data: {
      profileId,
      display_name: form.display_name,
      cc: form.cc,
      phone_number: form.phone_number,
      verification_method: form.verification_method,
    }}),
    onSuccess: (r) => {
      setLastError(null);
      setConnectionId(r.connectionId);
      setStep("codigo");
      requestM.mutate({ connId: r.connectionId, method: form.verification_method });
    },
    onError: (e: Error) => {
      const parsed = parseMetaError(e);
      // Mantém o fallback antigo do "WhatsApp Manager" pra create_number
      if (parsed.action === "create_number" && /WhatsApp Manager|não permitiu/i.test(parsed.friendly + " " + (parsed.next ?? ""))) {
        setMetaBlocked(parsed.friendly + (parsed.next ? " " + parsed.next : ""));
      } else {
        setLastError(parsed);
      }
    },
  });

  const requestM = useMutation({
    mutationFn: ({ connId, method }: { connId: string; method: "SMS" | "VOICE" }) =>
      requestFn({ data: { connectionId: connId, method, language: "pt_BR" } }),
    onSuccess: () => {
      setLastError(null);
      setCooldown(60);
      toast.success(form.verification_method === "SMS" ? "Código enviado por SMS." : "Código enviado por ligação.");
      setStep("confirmar");
    },
    onError: (e: Error) => setLastError(parseMetaError(e)),
  });

  const verifyM = useMutation({
    mutationFn: () => verifyFn({ data: { connectionId: connectionId!, code } }),
    onSuccess: () => {
      setLastError(null);
      toast.success("Código confirmado.");
      setStep("registrar");
    },
    onError: (e: Error) => setLastError(parseMetaError(e)),
  });

  const registerM = useMutation({
    mutationFn: () => registerFn({ data: { connectionId: connectionId!, pin: form.pin } }),
    onSuccess: () => {
      setLastError(null);
      toast.success("Número conectado com sucesso!");
      setStep("concluido");
    },
    onError: (e: Error) => setLastError(parseMetaError(e)),
  });

  const retryLastError = () => {
    if (!lastError) return;
    setLastError(null);
    switch (lastError.action) {
      case "create_number": createM.mutate(); break;
      case "request_code":
        if (connectionId) requestM.mutate({ connId: connectionId, method: form.verification_method });
        break;
      case "verify_code": verifyM.mutate(); break;
      case "register": registerM.mutate(); break;
    }
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-emerald-500" /> Adicionar número à WABA
          </DialogTitle>
          <DialogDescription>
            Cadastre seu número direto no MultiZap — sem precisar abrir a Meta.
          </DialogDescription>
        </DialogHeader>

        {/* Stepper */}
        <div className="mb-2 flex items-center justify-between gap-1 text-xs">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex flex-1 items-center gap-1">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold",
                  i < stepIndex
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : i === stepIndex
                    ? "border-emerald-500 text-emerald-400"
                    : "border-white/15 text-muted-foreground",
                )}
              >
                {i < stepIndex ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              <span className={cn("truncate", i === stepIndex ? "text-foreground" : "text-muted-foreground")}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && <div className="h-px flex-1 bg-white/10" />}
            </div>
          ))}
        </div>

        {/* Fallback se a Meta bloqueou criação automática */}
        {metaBlocked && (
          <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
              <div className="space-y-1">
                <p className="font-medium text-amber-300">A Meta não permitiu adicionar automaticamente</p>
                <p className="text-sm text-muted-foreground">{metaBlocked}</p>
                <p className="text-sm text-muted-foreground">
                  Você ainda pode adicionar pelo WhatsApp Manager. Depois volte aqui e clique em <strong>Atualizar números</strong>.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <a href="https://business.facebook.com/wa/manage/phone-numbers/" target="_blank" rel="noreferrer">
                  Abrir WhatsApp Manager <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setMetaBlocked(null); onClose(); }}>
                Fechar
              </Button>
            </div>
          </div>
        )}

        {!metaBlocked && lastError && (
          <MetaErrorPanel
            error={lastError}
            onRetry={retryLastError}
            retrying={createM.isPending || requestM.isPending || verifyM.isPending || registerM.isPending}
          />
        )}

        {!metaBlocked && step === "dados" && (
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome de exibição</Label>
              <Input
                placeholder="Ex: Minha Empresa Ltda"
                value={form.display_name}
                onChange={(e) => setForm({ ...form, display_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div>
                <Label className="text-xs">DDI</Label>
                <Input
                  placeholder="55"
                  value={form.cc}
                  onChange={(e) => setForm({ ...form, cc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                />
              </div>
              <div>
                <Label className="text-xs">Telefone com DDD</Label>
                <Input
                  placeholder="11912345678"
                  value={form.phone_number}
                  onChange={(e) => setForm({ ...form, phone_number: e.target.value.replace(/\D/g, "").slice(0, 15) })}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Como deseja receber o código?</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {(["SMS", "VOICE"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setForm({ ...form, verification_method: m })}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border p-3 text-sm transition",
                      form.verification_method === m
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                        : "border-white/10 hover:bg-white/5",
                    )}
                  >
                    {m === "SMS" ? <MessageSquare className="h-4 w-4" /> : <PhoneCall className="h-4 w-4" />}
                    {m === "SMS" ? "SMS" : "Ligação"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">PIN de 2 fatores (já preenchido)</Label>
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  Padrão seguro
                </span>
              </div>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={form.pin}
                onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Padrão <strong>123456</strong> — é a senha de 2 fatores que fica guardada na Meta.
                Só vai ser pedida se você precisar reativar o número depois. Pode trocar se quiser uma sua.
              </p>
            </div>

            <p className="rounded-md bg-white/5 p-3 text-xs text-muted-foreground">
              Use um número que ainda não esteja ativo no WhatsApp comum, ou que esteja liberado para migração.
              A Meta pode exigir verificação por SMS ou ligação.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button
                onClick={() => createM.mutate()}
                disabled={
                  createM.isPending ||
                  !form.display_name || !form.cc || !form.phone_number || form.pin.length !== 6
                }
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {createM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Adicionar e enviar código
              </Button>
            </div>
          </div>
        )}

        {!metaBlocked && step === "codigo" && (
          <div className="space-y-3 py-6 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-400" />
            <p className="text-sm text-muted-foreground">Solicitando código à Meta…</p>
          </div>
        )}

        {!metaBlocked && step === "confirmar" && (
          <div className="space-y-4">
            <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-300">
              {form.verification_method === "SMS"
                ? `Enviamos um SMS para +${form.cc} ${form.phone_number}.`
                : `Você receberá uma ligação em +${form.cc} ${form.phone_number}.`}
            </div>
            <div>
              <Label className="text-xs">Digite o código recebido</Label>
              <div className="mt-2 flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost" size="sm"
                disabled={cooldown > 0 || requestM.isPending || !connectionId}
                onClick={() => requestM.mutate({ connId: connectionId!, method: form.verification_method })}
              >
                {cooldown > 0 ? `Reenviar em ${cooldown}s` : "Reenviar código"}
              </Button>
              <Button
                onClick={() => verifyM.mutate()}
                disabled={code.length < 6 || verifyM.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {verifyM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar código
              </Button>
            </div>
          </div>
        )}

        {!metaBlocked && step === "registrar" && (
          <div className="space-y-4">
            <div className="rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-300">
              Código confirmado! Agora vamos registrar o número na Cloud API usando seu PIN.
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => registerM.mutate()}
                disabled={registerM.isPending}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {registerM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ShieldCheck className="mr-2 h-4 w-4" />
                Registrar número
              </Button>
            </div>
          </div>
        )}

        {!metaBlocked && step === "concluido" && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium">Número conectado com sucesso!</p>
              <p className="text-sm text-muted-foreground">
                Agora configure o webhook para começar a receber mensagens.
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button variant="ghost" onClick={onClose}>Fechar</Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => { onConcluido(connectionId!); onClose(); }}
              >
                Ir para Webhook
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
