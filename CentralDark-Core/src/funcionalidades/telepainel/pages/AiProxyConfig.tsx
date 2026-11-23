import { useEffect, useState } from "react";
import { Shield, RefreshCw, Zap, Lock, AlertTriangle, KeyRound, Copy } from "lucide-react";
import { DashboardLayout } from "@/compartilhado/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/compartilhado/ui/card";
import { Button } from "@/compartilhado/ui/button";
import { Input } from "@/compartilhado/ui/input";
import { Label } from "@/compartilhado/ui/label";
import { Badge } from "@/compartilhado/ui/badge";
import { toast } from "sonner";

const AI_PROXY_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/ai-proxy`;

type ConfigResp = {
  ok: boolean;
  rate_limit: { per_minute: number; per_hour: number; enabled: boolean };
  models: string[];
  default_model: string;
};

export default function AiProxyConfig() {
  const [key, setKey] = useState(() => localStorage.getItem("ai_proxy_test_key") ?? "");
  const [config, setConfig] = useState<ConfigResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastStatus, setLastStatus] = useState<{ code: number; ok: boolean } | null>(null);

  const fetchConfig = async () => {
    if (!key.trim()) {
      toast.error("Cole a WEBUI_LOVABLE_KEY pra testar");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${AI_PROXY_URL}/config`, {
        headers: { Authorization: `Bearer ${key.trim()}` },
      });
      setLastStatus({ code: r.status, ok: r.ok });
      if (!r.ok) {
        const t = await r.text();
        toast.error(`Falhou (${r.status}): ${t.slice(0, 120)}`);
        setConfig(null);
      } else {
        const data = (await r.json()) as ConfigResp;
        setConfig(data);
        localStorage.setItem("ai_proxy_test_key", key.trim());
        toast.success("Conectado — proteção ativa");
      }
    } catch (e) {
      toast.error(`Erro de rede: ${String((e as Error).message)}`);
    } finally {
      setLoading(false);
    }
  };

  const testAnonymous = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${AI_PROXY_URL}/v1/models`);
      setLastStatus({ code: r.status, ok: false });
      if (r.status === 401) {
        toast.success("✅ Bloqueou anônimo (401) — proteção OK");
      } else {
        toast.error(`⚠️ Deveria ser 401, veio ${r.status}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const generateStrongKey = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const b64 = btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const newKey = `wlk_${b64}`;
    setKey(newKey);
    localStorage.setItem("ai_proxy_test_key", newKey);
    navigator.clipboard?.writeText(newKey).catch(() => {});
    toast.success("Chave gerada e copiada — agora clique em 'Salvar no backend'");
  };

  const copyKey = () => {
    if (!key.trim()) return toast.error("Sem chave pra copiar");
    navigator.clipboard.writeText(key.trim());
    toast.success("Chave copiada");
  };

  useEffect(() => {
    if (key) fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 to-emerald-900/40 p-5">
          <Shield className="h-7 w-7 text-emerald-400" />
          <div>
            <h1 className="text-2xl font-bold text-emerald-50">Proteção do ai-proxy</h1>
            <p className="text-sm text-emerald-200/80">
              Todas as rotas exigem <code className="text-emerald-300">WEBUI_LOVABLE_KEY</code>. Rate limit por chave.
            </p>
          </div>
        </div>

        <Card className="border-emerald-500/30 bg-emerald-950/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-emerald-100">
              <Lock className="h-4 w-4 text-emerald-400" />
              Chave de acesso (Bearer)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="key" className="text-emerald-200">WEBUI_LOVABLE_KEY</Label>
            <Input
              id="key"
              type="password"
              placeholder="cole aqui pra testar"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="bg-emerald-950/60 border-emerald-500/30 text-emerald-50 placeholder:text-emerald-300/40"
            />
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={fetchConfig}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Ler configuração
              </Button>
              <Button
                variant="outline"
                onClick={testAnonymous}
                disabled={loading}
                className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-100"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Testar sem chave (deve dar 401)
              </Button>
              <Button
                variant="outline"
                onClick={generateStrongKey}
                className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-100"
              >
                <KeyRound className="h-4 w-4 mr-2" />
                Gerar chave forte
              </Button>
              <Button
                variant="outline"
                onClick={copyKey}
                className="border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-100"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="rounded-lg bg-emerald-900/30 border border-emerald-500/20 p-3 text-xs text-emerald-200/85 space-y-1">
              <p className="font-medium text-emerald-100">Como salvar no backend:</p>
              <p>1. Clique em <b>Gerar chave forte</b> (ou cole uma que você já tenha).</p>
              <p>2. Peça no chat: <code className="text-emerald-300">"atualiza a WEBUI_LOVABLE_KEY"</code> — vou abrir o formulário seguro pra você colar o valor.</p>
              <p>3. Depois clique em <b>Ler configuração</b> aqui. Se voltar HTTP 200, tá sincronizado.</p>
            </div>
            {lastStatus && (
              <div className="text-xs text-emerald-300/80">
                Última resposta:{" "}
                <Badge
                  className={
                    lastStatus.ok
                      ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-200 border border-rose-500/40"
                  }
                >
                  HTTP {lastStatus.code}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {config && (
          <Card className="border-emerald-500/30 bg-emerald-950/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-emerald-100">
                <Zap className="h-4 w-4 text-emerald-400" />
                Rate limit vigente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/40 p-4">
                  <div className="text-xs uppercase text-emerald-300/80">Por minuto</div>
                  <div className="text-3xl font-bold text-emerald-300">
                    {config.rate_limit.per_minute || "∞"}
                  </div>
                </div>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-900/40 p-4">
                  <div className="text-xs uppercase text-emerald-300/80">Por hora</div>
                  <div className="text-3xl font-bold text-emerald-300">
                    {config.rate_limit.per_hour || "∞"}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-emerald-900/30 border border-emerald-500/20 p-4 text-sm space-y-2">
                <p className="font-medium text-emerald-100">Como ajustar os limites:</p>
                <p className="text-emerald-200/80">
                  Os valores vêm das secrets <code className="text-emerald-300">AI_PROXY_RATE_PER_MIN</code> e{" "}
                  <code className="text-emerald-300">AI_PROXY_RATE_PER_HOUR</code>. Zero desativa o limite.
                  Edita nas secrets do backend e a edge function pega o novo valor no próximo boot.
                </p>
                <p className="text-emerald-200/80">
                  Modelos expostos: <code className="text-emerald-300">{config.models.length}</code> · Default:{" "}
                  <code className="text-emerald-300">{config.default_model}</code>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-emerald-500/30 bg-emerald-950/40">
          <CardHeader>
            <CardTitle className="text-base text-emerald-100">Regras de proteção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-emerald-200/85">
            <p>✅ Toda rota (inclusive legado <code className="text-emerald-300">POST /</code>) exige a chave.</p>
            <p>✅ Comparação constante-tempo (timing-safe) contra <code className="text-emerald-300">WEBUI_LOVABLE_KEY</code>.</p>
            <p>✅ Rate limit em janela deslizante por chave + IP.</p>
            <p>✅ Retorna <code className="text-emerald-300">429</code> com header <code className="text-emerald-300">Retry-After</code> quando estoura.</p>
            <p>✅ <code className="text-emerald-300">LOVABLE_API_KEY</code> nunca sai do servidor.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
