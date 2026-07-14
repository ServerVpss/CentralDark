// src/components/GrokMissoes.tsx
// VERSÃO JOGO COMPLETA - Sala de Missões Grok
// Tudo em formato de jogo: ranks, XP, quests, boss fights, resgates, loot
// Pronto pra Lovable integrar no cockpit pivete/dev

import React, { useState } from 'react';

type Quest = {
  id: string;
  title: string;
  status: 'ativa' | 'concluida' | 'falhou';
  progress: number;
  lastResult?: any;
};

type Player = {
  rank: string;
  level: number;
  xp: number;
  xpToNext: number;
};

export default function GrokMissoes() {
  const [prompt, setPrompt] = useState('');
  const [player, setPlayer] = useState<Player>({
    rank: "Grok Initiate",
    level: 3,
    xp: 240,
    xpToNext: 400,
  });
  const [activeQuests, setActiveQuests] = useState<Quest[]>([
    { id: 'q1', title: 'Revisar auth do gateway', status: 'ativa', progress: 65 },
    { id: 'q2', title: 'Otimizar worker de jobs longos', status: 'ativa', progress: 30 },
  ]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  const addXP = (amount: number) => {
    setPlayer(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNext;

      if (newXP >= prev.xpToNext) {
        newLevel = prev.level + 1;
        newXP = newXP - prev.xpToNext;
        newXPToNext = Math.floor(prev.xpToNext * 1.5);
        showToast(`LEVEL UP! Agora você é ${getRank(newLevel)}`);
      }
      return { ...prev, level: newLevel, xp: newXP, xpToNext: newXPToNext };
    });
  };

  const getRank = (level: number) => {
    if (level >= 10) return "Grok Legend";
    if (level >= 7) return "Grok Veteran";
    if (level >= 4) return "Grok Adept";
    return "Grok Initiate";
  };

  const lancarMissao = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    const questId = `quest-${Date.now()}`;
    const title = prompt.length > 55 ? prompt.slice(0, 52) + "..." : prompt;

    setTimeout(() => {
      const fakeResult = {
        ok: true,
        data: `Missão concluída com sucesso!\n\n${prompt}`,
        error: null,
        warnings: [],
      };

      const newQuest: Quest = {
        id: questId,
        title,
        status: 'ativa',
        progress: 100,
        lastResult: fakeResult,
      };

      setActiveQuests(prev => [newQuest, ...prev]);
      setResult(fakeResult);
      addXP(65);
      showToast("Missão lançada! +65 XP");
      setPrompt('');
      setLoading(false);
    }, 750);
  };

  const bossReview = async (quest: Quest) => {
    setLoading(true);
    setTimeout(() => {
      const fake = {
        ok: true,
        data: `🐉 BOSS FIGHT RESULTADO\n\nAlvo: ${quest.title}\n\nFalhas críticas: 2\nRiscos médios: 4\nRecomendações: 7\n\nGrok encontrou pontos fracos importantes.`,
        error: null,
        warnings: ["Modo demo - conecte com grok_revisao_boss real"],
      };
      setResult(fake);
      addXP(45);
      showToast("Boss Review completo! +45 XP");
      setLoading(false);
    }, 650);
  };

  const resgate = async (quest: Quest) => {
    setLoading(true);
    setTimeout(() => {
      const fake = {
        ok: true,
        data: `🛟 RESGATE EXECUTADO\n\nQuest: ${quest.title}\n\nErro corrigido. Nova versão funcional entregue.`,
        error: null,
        warnings: [],
      };
      setResult(fake);
      addXP(80);
      showToast("Resgate bem sucedido! +80 XP");
      setLoading(false);
    }, 650);
  };

  const concluirQuest = (quest: Quest) => {
    setActiveQuests(prev => prev.filter(q => q.id !== quest.id));
    const completed = { ...quest, status: 'concluida' as const };
    setCompletedQuests(prev => [completed, ...prev]);
    addXP(120);
    showToast("Quest completada! +120 XP + Loot");
  };

  const verStatus = (quest: Quest) => {
    setResult({
      ok: true,
      data: {
        questId: quest.id,
        title: quest.title,
        status: quest.status,
        progress: `${quest.progress}%`,
        rankBonus: player.rank,
      },
      error: null,
      warnings: [],
    });
  };

  return (
    <div className="p-6 bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto">
        {/* HEADER DO JOGO */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="text-5xl">⚔️</div>
            <div>
              <h1 className="text-4xl font-bold tracking-tighter">SALA DE MISSÕES GROK</h1>
              <p className="text-emerald-400 text-sm">CentralDark • Grok Executor Controlado</p>
            </div>
          </div>

          {/* PLAYER CARD */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-3 flex items-center gap-4">
            <div>
              <div className="text-emerald-400 text-xs tracking-[3px]">JOGADOR</div>
              <div className="font-bold text-lg">{player.rank}</div>
              <div className="text-xs text-zinc-400">Nível {player.level}</div>
            </div>
            <div className="w-px h-10 bg-zinc-700" />
            <div className="min-w-[140px]">
              <div className="flex justify-between text-xs mb-1">
                <span>XP</span>
                <span>{player.xp} / {player.xpToNext}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-emerald-500 transition-all" 
                  style={{ width: `${(player.xp / player.xpToNext) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* LANÇAR MISSÃO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🚀</span>
            <h2 className="text-2xl font-semibold">Lançar Nova Missão</h2>
          </div>
          
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ex: Analisa o código do mcp-server e sugere melhorias de performance e segurança..."
            className="w-full bg-zinc-950 border border-zinc-700 focus:border-emerald-600 rounded-2xl p-5 text-sm h-28 resize-y"
          />
          
          <button
            onClick={lancarMissao}
            disabled={!prompt.trim() || loading}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:bg-zinc-700 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? "EXECUTANDO MISSÃO..." : "⚡ LANÇAR MISSÃO PRO GROK"}
          </button>
        </div>

        {/* QUESTS ATIVAS */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📜</span>
            <h2 className="text-2xl font-semibold">Quests Ativas</h2>
            <div className="text-xs bg-zinc-800 px-3 py-1 rounded-full">{activeQuests.length}</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeQuests.map(quest => (
              <div key={quest.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="font-mono text-[10px] text-emerald-500 tracking-[2px]">QUEST {quest.id}</div>
                    <div className="font-semibold text-lg pr-4 leading-tight mt-1">{quest.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-400">PROGRESSO</div>
                    <div className="font-mono text-2xl font-bold text-emerald-400">{quest.progress}%</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-zinc-800 rounded mb-5 overflow-hidden">
                  <div className="h-1.5 bg-emerald-500" style={{ width: `${quest.progress}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => bossReview(quest)} className="bg-zinc-800 hover:bg-zinc-700 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2">
                    🐉 ENFRENTAR BOSS
                  </button>
                  <button onClick={() => resgate(quest)} className="bg-zinc-800 hover:bg-zinc-700 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2">
                    🛟 TENTAR RESGATE
                  </button>
                  <button onClick={() => verStatus(quest)} className="bg-zinc-800 hover:bg-zinc-700 py-3 rounded-2xl text-sm font-medium col-span-1">
                    📊 VER STATUS
                  </button>
                  <button onClick={() => concluirQuest(quest)} className="bg-emerald-700 hover:bg-emerald-600 py-3 rounded-2xl text-sm font-bold col-span-1">
                    ✅ CONCLUIR QUEST
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* QUEST LOG / COMPLETADAS */}
        {completedQuests.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl">🏆</span>
              <h3 className="font-semibold">Missões Concluídas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {completedQuests.slice(0, 6).map(q => (
                <div key={q.id} className="bg-zinc-900 border border-emerald-900/50 text-emerald-400 text-xs px-4 py-2 rounded-2xl">
                  {q.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTADO */}
        {result && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-7">
            <div className="uppercase tracking-[3px] text-xs text-emerald-500 mb-2">RESULTADO DA AÇÃO</div>
            <pre className="bg-black/70 p-5 rounded-2xl text-sm overflow-auto max-h-[320px] font-mono text-emerald-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
