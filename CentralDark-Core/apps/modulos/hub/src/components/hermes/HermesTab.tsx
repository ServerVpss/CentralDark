import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Badge } from "@/shared/ui/badge";
import { hubPublic, HUB_FUNCTIONS_URL, HUB_ANON_KEY } from "@/integrations/supabase/hub-public";
import { Brain, MessageSquare, Users, TrendingUp, Sparkles, Send, Loader2, Zap } from "lucide-react";

type Agente = {
  agent_id: string; nome: string; emoji: string; descricao: string;
  modelos_debate: string[]; modelo_juiz: string; tom: string;
};

type Missao = {
  id: string; agent_id: string; prompt: string; resposta_final: string | null;
  status: string; modelos_usados: string[]; tokens_total: number;
  duracao_ms: number | null; created_at: string; memorias_usadas: string[];
};

type Memoria = {
  id: string; tipo: string; titulo: string; conteudo: string;
  escopo: string; relevancia: string; created_at: string;
};

type ModelScore = {
  modelo: string; score: number; acertos: number; erros: number; total_missoes: number;
};

export function HermesTab() {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [agenteSelecionado, setAgenteSelecionado] = useState<string>("hermes");
  const [prompt, setPrompt] = useState("");
  const [pensando, setPensando] = useState(false);
  const [resposta, setRespostaAtual] = useState<any>(null);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [memorias, setMemorias] = useState<Memoria[]>([]);
  const [scores, setScores] = useState<ModelScore[]>([]);

  async function carregar() {
    const [{ data: ags }, { data: ms }, { data: mem }, { data: sc }] = await Promise.all([
      hubPublic.from("agent_configs").select("*").eq("ativo", true).order("nome"),
      hubPublic.from("missoes").select("*").order("created_at", { ascending: false }).limit(15),
      hubPublic.from("memoria_vetorial").select("id,tipo,titulo,conteudo,escopo,relevancia,created_at").order("created_at", { ascending: false }).limit(10),
      hubPublic.from("model_scores").select("*").order("score", { ascending: false }),
    ]);
    setAgentes(ags ?? []);
    setMissoes(ms ?? []);
    setMemorias(mem ?? []);
    setScores(sc ?? []);
  }

  useEffect(() => { carregar(); const t = setInterval(carregar, 8000); return () => clearInterval(t); }, []);

  async function pensar() {
    if (!prompt.trim() || pensando) return;
    setPensando(true);
    setRespostaAtual(null);
    try {
      const res = await fetch(`${HUB_FUNCTIONS_URL}/hermes-think`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${HUB_ANON_KEY}` },
        body: JSON.stringify({ agent_id: agenteSelecionado, prompt }),
      });
      const data = await res.json();
      setRespostaAtual(data);
      setPrompt("");
      carregar();
    } catch (e: any) {
      setRespostaAtual({ error: e.message });
    } finally {
      setPensando(false);
    }
  }

  const agenteAtual = agentes.find(a => a.agent_id === agenteSelecionado);

  return (
    <div className="space-y-6">
      {/* HEADER com selo do Hermes */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-3d-primary">
        <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 20% 0%, hsl(var(--primary)/0.15), transparent 50%)" }} />
        <div className="relative flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl gradient-emerald flex items-center justify-center shadow-3d-primary">
            <Brain className="h-7 w-7 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Hermes Coletivo <span className="text-gradient-emerald">v2</span></h2>
            <p className="text-sm text-muted-foreground">Cérebro central multi-agente · Memória vetorial · Debate entre modelos · Auto-aprendizado</p>
          </div>
        </div>
      </div>

      {/* GRID PRINCIPAL: Console à esquerda, cards à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CONSOLE DE PENSAMENTO */}
        <Card className="lg:col-span-2 card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Console do Conselho
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Seletor de agente */}
            <div className="flex flex-wrap gap-2">
              {agentes.map(a => (
                <button
                  key={a.agent_id}
                  onClick={() => setAgenteSelecionado(a.agent_id)}
                  className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                    agenteSelecionado === a.agent_id
                      ? "gradient-emerald text-primary-foreground border-primary shadow-3d-primary"
                      : "bg-background/50 border-border hover:border-primary/40"
                  }`}
                >
                  <span className="mr-1">{a.emoji}</span>{a.nome}
                </button>
              ))}
            </div>

            {agenteAtual && (
              <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="mb-1">{agenteAtual.descricao}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {agenteAtual.modelos_debate.map(m => (
                    <Badge key={m} variant="outline" className="text-[10px]">{m.split("/")[1]}</Badge>
                  ))}
                  <Badge variant="secondary" className="text-[10px]">🏛️ juiz: {agenteAtual.modelo_juiz.split("/")[1]}</Badge>
                </div>
              </div>
            )}

            <Textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Pergunte qualquer coisa ao conselho..."
              rows={3}
              className="resize-none"
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) pensar(); }}
            />

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">⌘+Enter pra enviar</span>
              <Button onClick={pensar} disabled={pensando || !prompt.trim()} className="gradient-emerald">
                {pensando ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Debatendo...</> : <><Send className="h-4 w-4 mr-2" />Enviar ao conselho</>}
              </Button>
            </div>

            {/* Resposta atual */}
            {resposta && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-background border border-primary/20">
                {resposta.error ? (
                  <div className="text-destructive text-sm">🔴 {resposta.error}</div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                      <span>🧠 {resposta.memorias_usadas} memórias</span>
                      <span>⚡ {resposta.modelos?.length} modelos</span>
                      <span>🔤 {resposta.tokens} tokens</span>
                      <span>⏱️ {(resposta.duracao_ms / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
                      {resposta.resposta}
                    </div>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CARD: REPUTAÇÃO DOS MODELOS */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Reputação dos Modelos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {scores.length === 0 && <div className="text-xs text-muted-foreground">Sem dados ainda</div>}
            {scores.map(s => {
              const pct = Math.min(100, Math.max(0, s.score * 50));
              return (
                <div key={s.modelo} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{s.modelo.split("/")[1]}</span>
                    <span className="text-muted-foreground">{s.score.toFixed(2)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full gradient-emerald transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    ✅ {s.acertos} · ❌ {s.erros} · total {s.total_missoes}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* SEGUNDA LINHA: 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MISSÕES RECENTES */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4 text-primary" />
              Missões Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {missoes.length === 0 && <div className="text-xs text-muted-foreground">Nenhuma missão ainda</div>}
            {missoes.map(m => (
              <div key={m.id} className="p-3 rounded-lg border border-border/50 bg-background/40 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-medium truncate">{m.agent_id}</span>
                  <Badge variant={m.status === "concluida" ? "default" : m.status === "falhou" ? "destructive" : "secondary"} className="text-[10px]">
                    {m.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">{m.prompt}</div>
                {m.duracao_ms && (
                  <div className="text-[10px] text-muted-foreground mt-1 flex gap-2">
                    <span>⏱️ {(m.duracao_ms / 1000).toFixed(1)}s</span>
                    <span>🔤 {m.tokens_total}</span>
                    <span>🧠 {m.memorias_usadas?.length ?? 0}</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* MEMÓRIA VIVA */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="h-4 w-4 text-primary" />
              Memória Viva
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {memorias.length === 0 && <div className="text-xs text-muted-foreground">Cérebro vazio — grave uma primeira lembrança</div>}
            {memorias.map(m => (
              <div key={m.id} className="p-3 rounded-lg border border-border/50 bg-background/40">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs font-medium">{m.titulo}</span>
                  <Badge variant="outline" className="text-[10px]">{m.tipo}</Badge>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">{m.conteudo}</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  📁 {m.escopo} · ⭐ {m.relevancia}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AGENTES ATIVOS */}
        <Card className="card-premium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Agentes Ativos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {agentes.map(a => (
              <div key={a.agent_id} className="p-3 rounded-lg border border-border/50 bg-background/40">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{a.emoji}</span>
                  <span className="text-sm font-medium">{a.nome}</span>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">{a.descricao}</div>
                <div className="text-[10px] text-muted-foreground mt-2 italic">"{a.tom}"</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
