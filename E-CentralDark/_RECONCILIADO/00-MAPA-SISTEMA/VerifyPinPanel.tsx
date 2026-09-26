import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Phone, Send, CheckCircle2 } from "lucide-react";
import {
  requestPhoneVerificationCode,
  verifyPhoneCode,
} from "@/lib/whatsapp.functions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { friendlyToastMessage } from "@/lib/whatsapp-error-translate";

/**
 * Painel reutilizável: pede SMS/voz e confirma o PIN de 6 dígitos
 * para uma conexão WhatsApp já criada (status pending).
 * Usado tanto no fluxo de cadastro inicial quanto no "Reenviar PIN"
 * a partir da lista de números pendentes (cliente e master).
 */
export function VerifyPinPanel({
  connectionId,
  onDone,
}: {
  connectionId: string;
  onDone?: () => void;
}) {
  const requestFn = useServerFn(requestPhoneVerificationCode);
  const verifyFn = useServerFn(verifyPhoneCode);
  const [code, setCode] = useState("");

  const requestM = useMutation({
    mutationFn: (method: "SMS" | "VOICE") =>
      requestFn({ data: { connectionId, method, language: "pt_BR" } }),
    onSuccess: (r, method) =>
      r.ok
        ? toast.success(`Novo código enviado por ${method === "SMS" ? "SMS" : "ligação"}.`)
        : toast.error(friendlyToastMessage(r.error ?? "Não consegui reenviar o código.")),
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });

  const [confirmado, setConfirmado] = useState(false);

  const verifyM = useMutation({
    mutationFn: () => verifyFn({ data: { connectionId, code } }),
    onSuccess: (r) => {
      if (!r.ok) return toast.error(friendlyToastMessage(r.error ?? "Código inválido"));
      toast.success("Número confirmado na Meta.");
      setConfirmado(true);
      setCode("");
      onDone?.();
    },
    onError: (e: Error) => toast.error(friendlyToastMessage(e.message)),
  });

  if (confirmado) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <p className="font-semibold">Número confirmado com sucesso.</p>
              <p>
                Agora configure o <strong>Webhook</strong> (URL + Verify Token) acima e
                marque o campo <code className="font-mono">messages</code> no painel da Meta
                para começar a receber mensagens no MultiZap.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
          A conexão só fica como <strong>"Recebendo mensagens"</strong> quando: o número estiver
          confirmado, o Access Token válido, o webhook validado, o campo <code className="font-mono">messages</code> assinado
          e chegar a primeira mensagem de teste.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
        Este código serve só pra <strong>validar o número na Meta</strong>. Depois ainda
        falta configurar o webhook pra começar a receber mensagens.
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          variant="outline"
          onClick={() => requestM.mutate("SMS")}
          disabled={requestM.isPending}
          className="h-12 text-base"
        >
          <Send className="mr-2 h-5 w-5" /> Reenviar por SMS
        </Button>
        <Button
          variant="outline"
          onClick={() => requestM.mutate("VOICE")}
          disabled={requestM.isPending}
          className="h-12 text-base"
        >
          <Phone className="mr-2 h-5 w-5" /> Receber por ligação
        </Button>
      </div>

      <div className="space-y-3">
        <Label className="text-base font-semibold">
          Digite o código de 6 dígitos que chegou no seu telefone
        </Label>
        <div className="flex justify-center py-2">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="h-14 w-12 rounded-lg border-2 text-2xl font-bold"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <Button
        onClick={() => verifyM.mutate()}
        disabled={code.length !== 6 || verifyM.isPending}
        className="h-14 w-full text-base font-semibold"
      >
        <CheckCircle2 className="mr-2 h-5 w-5" />
        {verifyM.isPending ? "Confirmando…" : "Confirmar número na Meta"}
      </Button>

      <div className="rounded-lg border border-muted bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">
        ⏱ O código vale uns <strong>10 minutos</strong>. Se passar, clique em
        <strong> "Reenviar por SMS"</strong> ou <strong>"Receber por ligação"</strong>.
        Confirmar aqui não conclui a conexão — é só o 1º de 5 passos.
      </div>
    </div>
  );
}
