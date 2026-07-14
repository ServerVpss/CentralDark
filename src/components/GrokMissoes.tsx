// src/components/GrokMissoes.tsx
// Sala de Missões Grok — alinhada ao template da Sala de Controle (esmeralda + mono).
// Sem fundo zinc, sem cara de app separado: herda os tokens do cockpit.

import { useState } from "react";
import "./grok-missoes.css";

type Quest = {
  id: string;
  title: string;
  status: "ativa" | "concluida" | "falhou";
  progress: number;
  lastResult?: any;
};

type Player = {
  rank: string;
  level: number;
  xp: number;
  xpToNext: number;
};

const RANKS = [
  "Grok Initiate",
  "Grok Scout",
  "Grok Operator",
  "Grok Executor",
  "Grok Vanguard",
  "Grok Overseer",
  "Grok Sovereign",
];

function getRank(level: number) {
  return RANKS[Math.min(level - 1, RANKS.length - 1)] ?? "Grok Legend";
}

export default function GrokMissoes() {
  const [prompt, setPrompt] = useState("");
  const [player, setPlayer] = useState<Player>({
    rank: "Grok Initiate",
    level: 3,
    xp: 240,
    xpToNext: 400,
  });
  const [activeQuests, setActiveQuests] = useState<Quest[]>([
    { id: "q1", title: "Revisar auth do gateway", status: "ativa", progress: 65 },
    { id: "q2", title: "Otimizar worker de jobs longos", status: "ativa", progress: 30 },
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
    setPlayer((prev) => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let newXPToNext = prev.xpToNext;
      if (newXP >= prev.xpToNext) {
        newLevel = prev.level + 1;
        newXP = newXP - prev.xpToNext;
        newXPToNext = Math.floor(prev.xpToNext * 1.5);
        showToast(`LEVEL UP! Agora você é ${getRank(newLevel)}`);
      }
      return { ...prev, level: newLevel, xp: newXP, xpToNext: newXPToNext, rank: getRank(newLevel) };
    });
  };

  const lancarMissao = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    await new Promise((r) => setTimeout(r, 900));
    const nova: Quest = {
      id: "q" + (activeQuests.length + 3),
      title: prompt.slice(0, 60),
      status: "ativa",
      progress: 10,
    };
    setActiveQuests((qs) => [...qs, nova]);
    setResult({ ok: true, quest: nova.id, mensagem: "Missão despachada pro Grok Executor." });
    setPrompt("");
    addXP(30);
    showToast("+30 XP · missão lançada");
    setLoading(false);
  };

  const bossReview = (q: Quest) => {
    setActiveQuests((qs) =>
      qs.map((x) => (x.id === q.id ? { ...x, progress: Math.min(100, x.progress + 20) } : x)),
    );
    addXP(50);
    showToast(`⚔️ Boss enfrentado em ${q.id} · +50 XP`);
  };

  const resgate = (q: Quest) => {
    setActiveQuests((qs) =>
      qs.map((x) => (x.id === q.id ? { ...x, progress: Math.min(100, x.progress + 10) } : x)),
    );
    addXP(20);
    showToast(`🛟 Resgate ativado em ${q.id} · +20 XP`);
  };

  const verStatus = (q: Quest) => {
    setResult({ quest: q.id, titulo: q.title, progresso: q.progress + "%", status: q.status });
  };

  const concluirQuest = (q: Quest) => {
    setActiveQuests((qs) => qs.filter((x) => x.id !== q.id));
    setCompletedQuests((cs) => [{ ...q, status: "concluida", progress: 100 }, ...cs]);
    addXP(120);
    showToast(`✅ ${q.id} concluída · +120 XP`);
  };

  const xpPct = Math.min(100, (player.xp / player.xpToNext) * 100);

  return (
    <div className="gk-root">
      {/* HUD do jogador (compacto, alinhado ao header do cockpit) */}
      <div className="gk-hud">
        <div className="gk-hud-left">
          <span className="gk-icon">⚔</span>
          <div>
            <div className="gk-hud-title">SALA DE MISSÕES GROK</div>
            <div className="gk-hud-sub">grok executor · controlado</div>
          </div>
        </div>
        <div className="gk-player">
          <div className="gk-player-info">
            <div className="gk-player-label">JOGADOR</div>
            <div className="gk-player-rank">{player.rank}</div>
            <div className="gk-player-lvl">nível {player.level}</div>
          </div>
          <div className="gk-xp-wrap">
            <div className="gk-xp-top">
              <span>XP</span>
              <span>{player.xp} / {player.xpToNext}</span>
            </div>
            <div className="gk-xp-bar">
              <div className="gk-xp-fill" style={{ width: xpPct + "%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* LANÇAR MISSÃO */}
      <section className="gk-card">
        <div className="gk-card-head">
          <span className="gk-em">▶</span>
          <span>LANÇAR NOVA MISSÃO</span>
        </div>
        <textarea
          className="gk-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="ex: analisa o código do mcp-server e sugere melhorias de performance e segurança..."
        />
        <button
          className="gk-btn gk-btn-primary"
          onClick={lancarMissao}
          disabled={!prompt.trim() || loading}
        >
          {loading ? "EXECUTANDO MISSÃO..." : "⚡ LANÇAR MISSÃO PRO GROK"}
        </button>
      </section>

      {/* QUESTS ATIVAS */}
      <section>
        <div className="gk-section-head">
          <span className="gk-em">▣</span>
          <span>QUESTS ATIVAS</span>
          <span className="gk-badge">{activeQuests.length}</span>
        </div>

        <div className="gk-quest-grid">
          {activeQuests.map((quest) => (
            <div key={quest.id} className="gk-card gk-quest">
              <div className="gk-quest-top">
                <div>
                  <div className="gk-quest-id">QUEST {quest.id}</div>
                  <div className="gk-quest-title">{quest.title}</div>
                </div>
                <div className="gk-quest-progress">
                  <div className="gk-quest-progress-label">PROGRESSO</div>
                  <div className="gk-quest-progress-val">{quest.progress}%</div>
                </div>
              </div>

              <div className="gk-progress">
                <div className="gk-progress-fill" style={{ width: quest.progress + "%" }} />
              </div>

              <div className="gk-quest-actions">
                <button className="gk-btn" onClick={() => bossReview(quest)}>🐉 ENFRENTAR BOSS</button>
                <button className="gk-btn" onClick={() => resgate(quest)}>🛟 TENTAR RESGATE</button>
                <button className="gk-btn" onClick={() => verStatus(quest)}>📊 VER STATUS</button>
                <button className="gk-btn gk-btn-conclude" onClick={() => concluirQuest(quest)}>✅ CONCLUIR</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CONCLUÍDAS */}
      {completedQuests.length > 0 && (
        <section>
          <div className="gk-section-head">
            <span className="gk-em">✓</span>
            <span>MISSÕES CONCLUÍDAS</span>
          </div>
          <div className="gk-done-list">
            {completedQuests.slice(0, 6).map((q) => (
              <div key={q.id} className="gk-done-chip">{q.title}</div>
            ))}
          </div>
        </section>
      )}

      {/* RESULTADO */}
      {result && (
        <section className="gk-card">
          <div className="gk-card-head">
            <span className="gk-em">◈</span>
            <span>RESULTADO DA AÇÃO</span>
          </div>
          <pre className="gk-pre">{JSON.stringify(result, null, 2)}</pre>
        </section>
      )}

      {toast && <div className="gk-toast">{toast}</div>}
    </div>
  );
}
