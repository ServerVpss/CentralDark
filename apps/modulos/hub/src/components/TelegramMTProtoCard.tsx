// Card de conexao do Telegram como USUARIO (MTProto) via gramjs na VPS
// Endpoint: https://status.centralldark.com/mtproto/*
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Send, Phone, KeyRound, CheckCircle2, XCircle, Loader2, LogOut, ShieldAlert } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/shared/lib/utils";

const API = "https://status.centralldark.com/mtproto";

type Me = { id: string; firstName?: string; username?: string; phone?: string };
type Step = "phone" | "code" | "password" | "connected";

async function post(path: string, body: unknown) {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j as any };
}

export function TelegramMTProtoCard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneCodeHash, setPhoneCodeHash] = useState<string | null>(null);
  const [sessionSaved, setSessionSaved] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const r = await fetch(`${API}/status`);
      const j = await r.json();
      if (j?.connected) {
        setStep("connected");
        setMe(j.me);
      }
    } catch (_) { /* silencioso */ }
  }, []);

  useEffect(() => { checkStatus(); }, [checkStatus]);

  async function enviarCodigo() {
    setError(null); setLoading(true);
    try {
      const { status, body } = await post("/start", { phone });
      if (status !== 200 || !body.ok) throw new Error(body.error || `HTTP ${status}`);
      setPhoneCodeHash(body.phoneCodeHash);
      setStep("code");
      toast({ title: "Codigo enviado", description: "Confere no seu app do Telegram" });
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  }

  async function confirmarCodigo(comSenha = false) {
    setError(null); setLoading(true);
    try {
      const { status, body } = await post("/confirm", {
        phone, code, phoneCodeHash,
        ...(comSenha ? { password } : {}),
      });
      if (status === 401 && body.needsPassword) {
        setStep("password");
        return;
      }
      if (status !== 200 || !body.ok) throw new Error(body.error || `HTTP ${status}`);
      setMe(body.me);
      setStep("connected");
      setSessionSaved(true);
      toast({ title: "Telegram conectado ✅", description: `Logado como ${body.me?.firstName || body.me?.username || phone}` });
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally { setLoading(false); }
  }

  async function desconectar() {
    setLoading(true);
    try {
      await post("/logout", {});
      setStep("phone"); setMe(null); setPhone(""); setCode(""); setPassword(""); setPhoneCodeHash(null); setSessionSaved(false);
      toast({ title: "Desconectado" });
    } finally { setLoading(false); }
  }

  return (
    <Card className="card-premium border-primary/25">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Send className="h-4 w-4 text-primary" />
          Conectar meu Telegram (usuario, MTProto)
          {step === "connected" && (
            <Badge className="ml-auto bg-primary/10 text-primary border-primary/25 border rounded-full text-[10px] px-2">
              CONECTADO
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p className="text-xs text-muted-foreground">
          Login pela sua conta pessoal (nao e bot). O codigo chega no seu Telegram. A sessao fica salva na VPS
          (<code className="font-mono">/root/CentralDark/data/telegram-mtproto/session.txt</code>) e permite a IA
          agir como voce.
        </p>

        {error && (
          <div className="flex items-start gap-2 text-xs bg-destructive/10 border border-destructive/25 rounded-md p-2 text-destructive">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}

        {step === "phone" && (
          <div className="space-y-2">
            <label className="text-xs font-semibold flex items-center gap-1"><Phone className="h-3 w-3" /> Telefone (com DDI)</label>
            <input
              value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+5511999999999"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              disabled={loading}
            />
            <Button onClick={enviarCodigo} disabled={loading || !phone} size="sm" className="w-full gap-2 shadow-3d-soft active:translate-y-[1px]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar codigo
            </Button>
          </div>
        )}

        {step === "code" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Telefone: <span className="font-mono">{phone}</span></p>
            <label className="text-xs font-semibold flex items-center gap-1"><KeyRound className="h-3 w-3" /> Codigo recebido</label>
            <input
              value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="12345" inputMode="numeric"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm tracking-widest font-mono"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button onClick={() => setStep("phone")} variant="outline" size="sm" className="flex-1">Voltar</Button>
              <Button onClick={() => confirmarCodigo(false)} disabled={loading || !code} size="sm" className="flex-1 gap-2 shadow-3d-soft active:translate-y-[1px]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirmar
              </Button>
            </div>
          </div>
        )}

        {step === "password" && (
          <div className="space-y-2">
            <p className="text-xs text-warning">Sua conta tem 2FA. Digita a senha da nuvem do Telegram:</p>
            <input
              type="password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="senha 2FA"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button onClick={() => setStep("code")} variant="outline" size="sm" className="flex-1">Voltar</Button>
              <Button onClick={() => confirmarCodigo(true)} disabled={loading || !password} size="sm" className="flex-1 gap-2 shadow-3d-soft active:translate-y-[1px]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Entrar
              </Button>
            </div>
          </div>
        )}

        {step === "connected" && me && (
          <div className="space-y-2">
            <div className="bg-primary/5 border border-primary/25 rounded-md p-3 text-xs space-y-1">
              <p className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> <span className="font-semibold">{me.firstName || "(sem nome)"}</span></p>
              {me.username && <p className="text-muted-foreground">@{me.username}</p>}
              {me.phone && <p className="text-muted-foreground font-mono">+{me.phone}</p>}
              <p className="text-muted-foreground">ID: <span className="font-mono">{me.id}</span></p>
              {sessionSaved && <p className="text-primary text-[11px] pt-1">Sessao salva na VPS ✅</p>}
            </div>
            <Button onClick={desconectar} variant="outline" size="sm" className="w-full gap-2 text-destructive hover:text-destructive">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              Desconectar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
