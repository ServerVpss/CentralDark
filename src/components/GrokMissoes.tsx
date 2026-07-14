// src/components/GrokMissoes.tsx  ou  app/cockpit/GrokQuests.tsx
// Componente de JOGO pro Cockpit do CentralDark
// Nomes fáceis: Missão, Quest, Boss Review, Resgate
// Visual dark + game style (combina com Lovable dark theme)
// Pronto pro Lovable editar e conectar os botões reais com o MCP gateway
// Depois de commitar na branch pivete/dev, a Lovable vê e integra fácil

import React, { useState } from 'react';

type Quest = {
  id: string;
  title: string;
  status: 'ativa' | 'concluida' | 'falhou';
  lastResult?: any;
};

export default function GrokMissoes() {
  const [prompt, setPrompt] = useState('');
  const [activeQuests, setActiveQuests] = useState<Quest[]>([
    { id: 'q1', title: 'Revisar auth do gateway', status: 'ativa' },
    { id: 'q2', title: 'Otimizar worker de jobs', status: 'ativa' },
  ]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // TODO Lovable: trocar esses alerts por chamada real pro MCP
  // Exemplo: fetch('/mcp', { method: 'POST', body: JSON.stringify({ tool: 'grok_missao', arguments: { prompt, questId } }) })
  // Ou usa teu client MCP do gateway

  const lancarMissao = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    
    const questId = `quest-${Date.now()}`;
    
    // Simulação - quando o backend grok-missoes.ts estiver no ar, troca por chamada real
    setTimeout(() => {
      const fakeResult = {
        ok: true,
        data: `Missão executada com sucesso! (demo)\nPrompt: ${prompt.slice(0, 80)}...`,
        error: null,
        warnings: [],
      };
      
      const newQuest: Quest = {
        id: questId,
        title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        status: 'ativa',
        lastResult: fakeResult,
      };
      
      setActiveQuests(prev => [newQuest, ...prev]);
      setResult(fakeResult);
      setPrompt('');
      setLoading(false);
      
      // Lovable: aqui tu conecta o resultado real do grok_missao
    }, 800);
  };

  const bossReview = async (quest: Quest) => {
    setLoading(true);
    setTimeout(() => {
      const fake = {
        ok: true,
        data: `BOSS REVIEW no alvo "${quest.title}":\n- 3 falhas de segurança encontradas\n- 2 melhorias de performance\n- Risco médio`,
        error: null,
        warnings: ['Demo mode - conecta com grok_revisao_boss real'],
      };
      setResult(fake);
      setLoading(false);
    }, 600);
  };

  const resgate = async (quest: Quest) => {
    setLoading(true);
    setTimeout(() => {
      const fake = {
        ok: true,
        data: `RESGATE feito na quest "${quest.title}".\nVersão corrigida entregue.`,
        error: null,
        warnings: [],
      };
      setResult(fake);
      setLoading(false);
    }, 600);
  };

  const verStatus = async (quest: Quest) => {
    setLoading(true);
    setTimeout(() => {
      const fake = {
        ok: true,
        data: { status: quest.status, questId: quest.id, progresso: '78%' },
        error: null,
        warnings: [],
      };
      setResult(fake);
      setLoading(false);
    }, 400);
  };

  return (
    <div className="p-6 bg-zinc-950 text-white min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header estilo jogo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="text-4xl">⚡</div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sala de Missões Grok</h1>
            <p className="text-zinc-400">CentralDark Cockpit • Grok como executor controlado</p>
          </div>
        </div>

        {/* Lançar nova missão */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🚀</span>
            <h2 className="text-xl font-semibold">Iniciar Nova Missão</h2>
          </div>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Revisa o código do worker de jobs e sugere melhorias de performance e segurança..."
            className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-mono resize-y focus:outline-none focus:border-emerald-500"
          />
          
          <button
            onClick={lancarMissao}
            disabled={loading || !prompt.trim()}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {loading ? 'Executando...' : '⚡ LANÇAR MISSÃO PRO GROK'}
          </button>
          <p className="text-[10px] text-zinc-500 mt-2 text-center">
            Privacy forte • Prompt vai por arquivo seguro • Resultado no formato envelope
          </p>
        </div>

        {/* Quests ativas - visual de jogo */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎮</span>
              <h2 className="text-xl font-semibold">Quests Ativas</h2>
            </div>
            <div className="text-xs px-3 py-1 bg-zinc-800 rounded-full text-zinc-400">
              {activeQuests.length} em andamento
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeQuests.map((quest) => (
              <div key={quest.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-emerald-900 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-mono text-xs text-emerald-400 tracking-[2px]">QUEST {quest.id}</div>
                    <div className="font-semibold mt-1 pr-4">{quest.title}</div>
                  </div>
                  <div className={`text-xs px-2.5 py-0.5 rounded-full ${quest.status === 'ativa' ? 'bg-emerald-900 text-emerald-400' : 'bg-zinc-800'}`}>
                    {quest.status}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <button 
                    onClick={() => bossReview(quest)}
                    className="flex-1 text-xs bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg transition-colors"
                  >
                    🐉 BOSS REVIEW
                  </button>
                  <button 
                    onClick={() => resgate(quest)}
                    className="flex-1 text-xs bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg transition-colors"
                  >
                    🛟 RESGATE
                  </button>
                  <button 
                    onClick={() => verStatus(quest)}
                    className="flex-1 text-xs bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg transition-colors"
                  >
                    📊 STATUS
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resultado da última ação */}
        {result && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <span>📦</span>
              <div className="font-semibold">Resultado da Missão (envelope)</div>
            </div>
            <pre className="bg-black p-4 rounded-xl text-xs overflow-auto max-h-80 text-emerald-300 font-mono">
              {JSON.stringify(result, null, 2)}
            </pre>
            <div className="text-[10px] text-zinc-500 mt-2">
              {result.ok ? '✅ Sucesso' : '❌ Erro'} • Copia esse JSON pro Supabase ou usa no Lovable
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-[10px] text-zinc-500">
          Integração Grok MCP • Branch pivete/dev • Lovable cockpit • Privacy built-in
        </div>
      </div>
    </div>
  );
}
