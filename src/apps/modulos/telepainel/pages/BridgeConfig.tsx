// Painel Bridge Config — diferencia preset "Bridge Lovable" vs "Ap7 (Claude/GPT)",
// valida IDs de modelo, testa conexão em tempo real e detecta modelos válidos.
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/shared/ui/radio-group";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CheckCircle2, XCircle, Zap, RefreshCw, Shield, Copy } from "lucide-react";

type Preset = "lovable-direct" | "bridge-vps" | "ap7" | "custom";

const PRESETS: Record<Preset, { nome: string; url: string; auth: string; descricao: string }> = {
  "lovable-direct": {
    nome: "Lovable AI Gateway (direto)",
    url: "https://ai.gateway.lovable.dev/v1",
    auth: "Lovable-API-Key (no servidor)",
    descricao: "Chamada direta usando LOVABLE_API_KEY do cofre. Ideal pra teste rápido.",
  },
  "bridge-vps": {
    nome: "Bridge Lovable (VPS)",
    url: "http://host.docker.internal:8099/v1",
    auth: "Bearer WEBUI_LOVABLE_KEY",
    descricao: "Ponte OpenAI-compat rodando na VPS (porta 8099). Usado pelo Open WebUI.",
  },
  "ap7": {
    nome: "Ap7 (Claude/GPT Elite Proxy)",
    url: "https://api.centralldark.com/v1",
    auth: "Bearer chave-do-ap7",
    descricao: "Proxy Anthropic/OpenAI Elite (opus, sonnet, haiku, gpt-5.5, etc).",
  },
  "custom": {
    nome: "Custom (URL sua)",
    url: "",
    auth: "Bearer",
    descricao: "Qualquer endpoint OpenAI-compat.",
  },
};

const CATALOGO_LOVABLE = new Set([
  "google/gemini-3-flash-preview", "google/gemini-3.1-pro-preview", "google/gemini-3.1-flash-lite",
  "google/gemini-3.5-flash", "google/gemini-2.5-pro", "google/gemini-2.5-flash", "google/gemini-2.5-flash-lite",
  "openai/gpt-5", "openai/gpt-5-mini", "openai/gpt-5-nano", "openai/gpt-5.2",
  "openai/gpt-5.4", "openai/gpt-5.4-mini", "openai/gpt-5.4-nano", "openai/gpt-5.4-pro",
  "openai/gpt-5.5", "openai/gpt-5.5-pro",
  "openai/gpt-image-2", "openai/gpt-image-1-mini",
  "google/gemini-2.5-flash-image", "google/gemini-3-pro-image", "google/gemini-3.1-flash-image",
  "openai/gpt-4o-mini-tts", "openai/gpt-4o-mini-transcribe", "openai/gpt-4o-transcribe",
  "google/gemini-embedding-001", "google/gemini-embedding-2",
  "openai/text-embedding-3-small", "openai/text-embedding-3-large",
]);

const CATALOGO_AP7 = new Set([
  "opus-4.8", "opus-4.8[1m]", "sonnet-4.6", "sonnet-4.6[1m]", "haiku-4.6",
  "gpt-5.5", "gpt-5.4", "gemini-3-pro", "gpt-4o",
]);

export default function BridgeConfig() {
  const [preset, setPreset] = useState<Preset>("lovable-direct");
  const [url, setUrl] = useState(PRESETS["lovable-direct"].url);
  const [key, setKey] = useState("");
  const [modeloTeste, setModeloTeste] = useState("google/gemini-3-flash-preview");
  const [idsTexto, setIdsTexto] = useState("");
  const [prompt, setPrompt] = useState("Diga em 5 palavras: bridge funcionando");
  const [carregando, setCarregando] = useState(false);
  const [carregandoModelos, setCarregandoModelos] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [modelosDetectados, setModelosDetectados] = useState<Array<{ id: string; tipo?: string }>>([]);

  function trocarPreset(p: Preset) {
    setPreset(p);
    setUrl(PRESETS[p].url);
    setResultado(null);
    setModelosDetectados([]);
    if (p === "ap7") setModeloTeste("sonnet-4.6");
    else setModeloTeste("google/gemini-3-flash-preview");
  }

  // Validação dos IDs colados no textarea
  const validacao = useMemo(() => {
    const linhas = idsTexto.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    const catalogo = preset === "ap7" ? CATALOGO_AP7 : CATALOGO_LOVABLE;
    const ehLovableOuBridge = preset === "lovable-direct" || preset === "bridge-vps";
    const validos: string[] = [];
    const invalidos: string[] = [];
    for (const id of linhas) {
      if (preset === "custom") { validos.push(id); continue; }
      if (catalogo.has(id)) validos.push(id);
      else invalidos.push(id);
    }
    return { validos, invalidos, ehLovableOuBridge };
  }, [idsTexto, preset]);

  async function testarConexao() {
    setCarregando(true);
    setResultado(null);
    try {
      const { data, error } = await supabase.functions.invoke("bridge-config-test", {
        body: { modo: preset, acao: "chat", url, key, modelo: modeloTeste, prompt },
      });
      if (error) throw error;
      setResultado(data);
      if (data?.ok) toast.success(`Bridge respondeu em ${data.tempo_ms}ms`);
      else toast.error(`Falha HTTP ${data?.http}: ${data?.erro || "erro"}`);
    } catch (e: any) {
      setResultado({ ok: false, erro: String(e.message || e) });
      toast.error("Erro ao chamar edge function");
    } finally {
      setCarregando(false);
    }
  }

  async function detectarModelos() {
    setCarregandoModelos(true);
    try {
      const { data, error } = await supabase.functions.invoke("bridge-config-test", {
        body: { modo: preset, acao: "models", url, key },
      });
      if (error) throw error;
      if (data?.ok && data.modelos) {
        setModelosDetectados(data.modelos);
        toast.success(`${data.modelos.length} modelos detectados`);
      } else {
        toast.error(data?.erro || "não foi possível listar modelos");
      }
    } catch (e: any) {
      toast.error("Erro: " + (e.message || e));
    } finally {
      setCarregandoModelos(false);
    }
  }

  function copiarValidos() {
    navigator.clipboard.writeText(modelosDetectados.map((m) => m.id).join("\n"));
    toast.success("IDs copiados");
  }

  return (
    <div className="min-h-screen bg-[#052e2b] text-emerald-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-300 flex items-center gap-3">
            <Shield className="h-8 w-8" /> Bridge Config
          </h1>
          <p className="text-emerald-200/70">
            Diferencia bridge Lovable de ap7, valida IDs de modelo e testa conexão real.
          </p>
        </header>

        {/* PRESET */}
        <Card className="bg-[#0a3d38] border-emerald-800/40">
          <CardHeader>
            <CardTitle className="text-emerald-300">1. Tipo de conexão</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={preset} onValueChange={(v) => trocarPreset(v as Preset)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(PRESETS) as Preset[]).map((p) => (
                <label
                  key={p}
                  htmlFor={p}
                  className={`flex flex-col gap-1 p-4 rounded-lg border cursor-pointer transition ${
                    preset === p
                      ? "border-emerald-400 bg-emerald-500/10"
                      : "border-emerald-800/40 bg-[#052e2b]/50 hover:border-emerald-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={p} id={p} />
                    <span className="font-semibold">{PRESETS[p].nome}</span>
                  </div>
                  <p className="text-xs text-emerald-200/60 ml-6">{PRESETS[p].descricao}</p>
                  <code className="text-xs text-emerald-300/80 ml-6 mt-1">{PRESETS[p].auth}</code>
                </label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* CONFIG */}
        <Card className="bg-[#0a3d38] border-emerald-800/40">
          <CardHeader>
            <CardTitle className="text-emerald-300">2. URL, chave e modelo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-emerald-200">URL Base</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)}
                className="bg-[#052e2b] border-emerald-800/40 text-emerald-100"
                disabled={preset === "lovable-direct"} />
              {preset === "lovable-direct" && (
                <p className="text-xs text-emerald-200/50 mt-1">
                  URL fixa. LOVABLE_API_KEY é usada automaticamente do cofre.
                </p>
              )}
            </div>

            {preset !== "lovable-direct" && (
              <div>
                <Label className="text-emerald-200">Chave (Bearer)</Label>
                <Input type="password" value={key} onChange={(e) => setKey(e.target.value)}
                  placeholder="cole a chave aqui pra testar"
                  className="bg-[#052e2b] border-emerald-800/40 text-emerald-100" />
              </div>
            )}

            <div>
              <Label className="text-emerald-200">Modelo pra testar</Label>
              <Input value={modeloTeste} onChange={(e) => setModeloTeste(e.target.value)}
                className="bg-[#052e2b] border-emerald-800/40 text-emerald-100" />
              {(preset === "lovable-direct" || preset === "bridge-vps") &&
                !CATALOGO_LOVABLE.has(modeloTeste) && modeloTeste && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> ID não existe no catálogo Lovable
                  </p>
                )}
              {preset === "ap7" && !CATALOGO_AP7.has(modeloTeste) && modeloTeste && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <XCircle className="h-3 w-3" /> ID não existe no catálogo Ap7
                </p>
              )}
            </div>

            <div>
              <Label className="text-emerald-200">Mensagem do teste</Label>
              <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2}
                className="bg-[#052e2b] border-emerald-800/40 text-emerald-100" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={testarConexao} disabled={carregando}
                className="bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-semibold">
                {carregando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                Testar conexão
              </Button>
              <Button onClick={detectarModelos} disabled={carregandoModelos} variant="outline"
                className="border-emerald-600 text-emerald-200 hover:bg-emerald-900/40">
                {carregandoModelos ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                Detectar modelos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RESULTADO */}
        {resultado && (
          <Card className={`border-2 ${resultado.ok ? "border-emerald-400 bg-emerald-900/20" : "border-red-500 bg-red-950/30"}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${resultado.ok ? "text-emerald-300" : "text-red-300"}`}>
                {resultado.ok ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                {resultado.ok ? `Conectou · ${resultado.tempo_ms}ms · HTTP ${resultado.http}` : `Falhou · HTTP ${resultado.http || "?"}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {resultado.ok ? (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-emerald-700">modo: {resultado.modo}</Badge>
                    <Badge className="bg-emerald-700">modelo: {resultado.modelo}</Badge>
                  </div>
                  <div className="p-4 bg-[#052e2b] rounded-lg border border-emerald-800/40">
                    <p className="text-xs text-emerald-200/60 mb-1">Resposta da IA:</p>
                    <p className="text-emerald-100 whitespace-pre-wrap">{resultado.resposta}</p>
                  </div>
                </div>
              ) : (
                <Alert variant="destructive" className="bg-red-950/50 border-red-500 text-red-200">
                  <AlertDescription className="whitespace-pre-wrap font-mono text-xs">
                    {typeof resultado.erro === "string" ? resultado.erro : JSON.stringify(resultado.erro, null, 2)}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* VALIDAÇÃO DE IDS */}
        <Card className="bg-[#0a3d38] border-emerald-800/40">
          <CardHeader>
            <CardTitle className="text-emerald-300">3. Validar IDs de modelo antes de salvar</CardTitle>
            <p className="text-sm text-emerald-200/60">
              Cole os IDs (um por linha ou separados por vírgula). Valida contra o catálogo do preset selecionado.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea value={idsTexto} onChange={(e) => setIdsTexto(e.target.value)} rows={6}
              placeholder="google/gemini-3-flash-preview&#10;openai/gpt-5.5&#10;sonnet-4.6"
              className="bg-[#052e2b] border-emerald-800/40 text-emerald-100 font-mono text-sm" />
            {validacao.validos.length + validacao.invalidos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {validacao.validos.map((id) => (
                  <Badge key={id} className="bg-emerald-600 text-emerald-50">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> {id}
                  </Badge>
                ))}
                {validacao.invalidos.map((id) => (
                  <Badge key={id} variant="destructive" className="bg-red-600">
                    <XCircle className="h-3 w-3 mr-1" /> {id}
                  </Badge>
                ))}
              </div>
            )}
            {preset === "custom" && idsTexto && (
              <p className="text-xs text-amber-300">⚠️ Preset "custom" não valida contra catálogo.</p>
            )}
          </CardContent>
        </Card>

        {/* MODELOS DETECTADOS */}
        {modelosDetectados.length > 0 && (
          <Card className="bg-[#0a3d38] border-emerald-800/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-emerald-300">
                4. Modelos válidos detectados ({modelosDetectados.length})
              </CardTitle>
              <Button onClick={copiarValidos} variant="outline" size="sm"
                className="border-emerald-600 text-emerald-200">
                <Copy className="h-3 w-3 mr-1" /> Copiar todos
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-emerald-200/60 mb-3">
                Deixe o campo "IDs de modelo" vazio no WebUI e ele detecta esses automaticamente.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-h-96 overflow-y-auto">
                {modelosDetectados.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2 bg-[#052e2b] rounded border border-emerald-800/30">
                    <code className="text-xs text-emerald-100">{m.id}</code>
                    {m.tipo && <Badge className="bg-emerald-800 text-xs">{m.tipo}</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
