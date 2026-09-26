# COMANDO - consciousness.cjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\apps\bot-telegram\skills\core\consciousness.cjs
**SHA:** 81910d840dc6c67d
**Timestamp:** 2026-08-28T02:56:06.789810
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const ehPrompt = /\b(forja (isso|esse|o prompt)|melhora (esse |o )?prompt|transforma em prompt|faz (um )?prompt (forte|bom|melhor)|melhora esse texto pra ia)\b/i.test(txt);

### Decisoes
- const ehDecisao = /\b(registra a decisão|grava (essa |a )?escolha|anota o que decidimos|decisão tomada|ficou decidido que|a partir de agora|regra nova|nova regra)\b/i.test(txt);
- const content = `## ${hoje}\n\n**Decisão:** ${txt}\n\n**Motivo:** (registrado via bot)\n\n---\n*Registrado via bot — ${hoje}*`;

### Ouro Bruto (primeiros 5000 chars)
```
const manager = require("./manager.cjs");
const executor = require("./executor.cjs");
const memory = require("./memory.cjs");

let state = {
  enabled: false,
  mode: "manual" // manual | automatic
};

// 🔌 CONTROLE
function enable() {
  state.enabled = true;
  state.mode = "automatic";
  console.log("🧠 Consciousness ATIVADA");
  return { ok: true, enabled: true, mode: "automatic" };
}

function disable() {
  state.enabled = false;
  state.mode = "manual";
  console.log("🧠 Consciousness DESATIVADA");
  return { ok: true, enabled: false, mode: "manual" };
}

function setMode(mode) {
  if (!["manual", "automatic"].includes(mode)) return { ok: false, error: "Modo inválido" };
  state.mode = mode;
  if (mode === "automatic") state.enabled = true;
  return { ok: true, mode: state.mode };
}

function getState() {
  return { ...state };
}

// 🧠 DECISÃO INTELIGENTE
async function think(input) {
  if (!state.enabled) {
    return { type: "manual", message: "Consciência desativada" };
  }

  const txt = (input || "").trim();
  let chosenSkill = null;

  // ⚠️ Detectar mensagem copiada / citada de outra IA
  // Se o usuário copiou texto de instrução em vez de digitar um comando direto
  const ehCopia = /você (disse|falou|citou|me pediu|me mandou|recomendou|sugeriu|escreveu)|aqui você (falou|disse|escreveu)|copiando|você indicou|você aconselhou/i.test(txt);
  if (ehCopia) {
    return {
      type: "clarify",
      message: "Percebi que você pode ter copiado um texto. Quer que eu:\n\n" +
               "1️⃣ <b>Execute</b> o que está escrito\n" +
               "2️⃣ <b>Grave como nota</b> no cérebro\n" +
               "3️⃣ <b>Ignore</b> — só estava me mostrando\n\n" +
               "Me diz qual das 3 opções ou fala com suas palavras o que quer fazer."
    };
  }

  // 🧠 Aprendizados pessoais e memórias boas
  const ehAprendizado = /\b(aprendi (que|como|a |hoje|isso)|que coisa boa|nunca (vou )?esquecer|gostei (muito )?de|lembrança boa|momento bom|descobri (que|como)|foi incrível|funcionou (pela primeira vez|perfeitamente)|consegui (fazer|resolver)|isso me ensinou)\b/i.test(txt);
  if (ehAprendizado) {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const content = `## ${hoje}\n\n${txt}\n\n---\n*Registrado via bot — ${hoje}*`;
    const result = await executor.run("obsidian-writer", {
      op: "write",
      folder: "08 - Aprendizados & Memórias",
      title: txt.slice(0, 55).replace(/[^\w\s\-áéíóúâêîôûãõçàèìòù]/gi, "").trim() || "Aprendizado",
      content,
    });
    memory.save({ input: txt.slice(0, 200), skill: "obsidian-writer", folder: "aprendizados", result: result.ok ? "success" : "error", timestamp: Date.now() });
    return { type: "automatic", skill: "obsidian-writer", response: { ...result, _folder: "Aprendizados & Memórias" } };
  }

  // 📌 DECISION-RECORDER — "Registra a decisão" / "Grava essa escolha"
  const ehDecisao = /\b(registra a decisão|grava (essa |a )?escolha|anota o que decidimos|decisão tomada|ficou decidido que|a partir de agora|regra nova|nova regra)\b/i.test(txt);
  if (ehDecisao) {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const content = `## ${hoje}\n\n**Decisão:** ${txt}\n\n**Motivo:** (registrado via bot)\n\n---\n*Registrado via bot — ${hoje}*`;
    const result = await executor.run("obsidian-writer", {
      op: "append",
      folder: "CONSCIENCIA",
      title: "08-HISTORICO-DECISOES",
      content,
    });
    memory.save({ input: txt.slice(0, 200), skill: "decision-recorder", result: result.ok ? "success" : "error", timestamp: Date.now() });
    return { type: "automatic", skill: "decision-recorder", response: { ...result, _folder: "08-HISTORICO-DECISOES" } };
  }

  // 📋 DAILY-REVIEWER — "Revisão do dia" / "Status do dia"
  const ehRevisaoDia = /\b(revisão do dia|revisao do dia|status do dia|o que foi feito hoje|o que aconteceu hoje|resumo do dia|como foi o dia|o que temos hoje|pendências de hoje|foco de amanhã)\b/i.test(txt);
  if (ehRevisaoDia) {
    chosenSkill = "painel-status";
    const result = await executor.run(chosenSkill, { input: txt, topic: "revisão do dia", query: txt });
    memory.save({ input: txt.slice(0, 200), skill: "daily-reviewer", result: result.ok ? "success" : "error", timestamp: Date.now() });
    return { type: "automatic", skill: "daily-reviewer", response: result };
  }

  // 🐛 CODE-INVESTIGATOR — "Acha o bug" / "Investiga o código"
  const ehBug = /\b(acha o bug|investiga o código|investiga o codigo|o que tá quebrando|o que ta quebrando|por que (isso )?não funciona|por que (isso )?nao funciona|o que deu errado|acha o problema|investiga o erro)\b/i.test(txt);
  if (ehBug) {
    chosenSkill = "systematic-debugging";
  }

  // ✨ PROMPT-ENGINEER — "Forja" / "Melhora esse prompt"
  const ehPrompt = /\b(forja (isso|esse|o prompt)|melhora (esse |o )?prompt|transforma em prompt|faz (um )?prompt (forte|bom|melhor)|melhora esse texto pra ia)\b/i.test(txt);
  if (ehPrompt) {
    chosenSkill = "brainstorming";
  }

  // 🔍 GRAPH
```