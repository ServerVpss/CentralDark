import { useEffect, useState } from "react";
import { Shield, RefreshCw, Zap, Lock, AlertTriangle } from "lucide-react";
import { DashboardLayout } from "@/shared/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
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

  useEffect(() => {
    if (key) fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Proteção do ai-proxy</h1>
            <p className="text-sm text-muted-foreground">
              Todas as rotas exigem <code>WEBUI_LOVABLE_KEY</code>. Rate limit por chave.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lock className="h-4 w-4" />
              Chave de acesso (Bearer)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Label htmlFor="key">WEBUI_LOVABLE_KEY</Label>
            <Input
              id="key"
              type="password"
              placeholder="cole aqui pra testar"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={fetchConfig} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Ler configuração
              </Button>
              <Button variant="outline" onClick={testAnonymous} disabled={loading}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Testar sem chave (deve dar 401)
              </Button>
            </div>
            {lastStatus && (
              <div className="text-xs text-muted-foreground">
                Última resposta:{" "}
                <Badge variant={lastStatus.ok ? "default" : "destructive"}>
                  HTTP {lastStatus.code}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {config && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-4 w-4" />
                Rate limit vigente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-xs uppercase text-muted-foreground">Por minuto</div>
                  <div className="text-3xl font-bold text-primary">
                    {config.rate_limit.per_minute || "∞"}
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-xs uppercase text-muted-foreground">Por hora</div>
                  <div className="text-3xl font-bold text-primary">
                    {config.rate_limit.per_hour || "∞"}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted/40 p-4 text-sm space-y-2">
                <p className="font-medium">Como ajustar os limites:</p>
                <p className="text-muted-foreground">
                  Os valores vêm das secrets <code>AI_PROXY_RATE_PER_MIN</code> e{" "}
                  <code>AI_PROXY_RATE_PER_HOUR</code>. Zero desativa o limite. Edita nas{" "}
                  secrets do backend e a edge function pega o novo valor no próximo boot.
                </p>
                <p className="text-muted-foreground">
                  Modelos expostos: <code>{config.models.length}</code> · Default:{" "}
                  <code>{config.default_model}</code>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regras de proteção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>✅ Toda rota (inclusive legado <code>POST /</code>) exige a chave.</p>
            <p>✅ Comparação constante-tempo (timing-safe) contra <code>WEBUI_LOVABLE_KEY</code>.</p>
            <p>✅ Rate limit em janela deslizante por chave + IP.</p>
            <p>✅ Retorna <code>429</code> com header <code>Retry-After</code> quando estoura.</p>
            <p>✅ <code>LOVABLE_API_KEY</code> nunca sai do servidor.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
