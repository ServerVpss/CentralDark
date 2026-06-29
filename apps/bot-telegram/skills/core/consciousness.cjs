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

  // 💰 Devedores, contatos e pendências financeiras pessoais
  const ehDevedor = /\b(deve|devo|devendo|devedora?|me deve|ainda (não )?pagou|falta pagar|não pagou|cobrar|cobrança|pendência financeira|contato d[ao]|salva o contato|número d[ao]|telefone d[ao]|whats(app)? d[ao])\b/i.test(txt);
  if (ehDevedor) {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const content = `## ${hoje}\n\n${txt}\n\n---\n*Registrado via bot — ${hoje}*`;
    const result = await executor.run("obsidian-writer", {
      op: "write",
      folder: "06 - Devedores & Contatos",
      title: txt.slice(0, 55).replace(/[^\w\s\-áéíóúâêîôûãõçàèìòù]/gi, "").trim() || "Contato rápido",
      content,
    });
    memory.save({ input: txt.slice(0, 200), skill: "obsidian-writer", folder: "devedores", result: result.ok ? "success" : "error", timestamp: Date.now() });
    return { type: "automatic", skill: "obsidian-writer", response: { ...result, _folder: "Devedores & Contatos" } };
  }

  // 🧠 Comandos de gravação no Obsidian (obsidian-writer)
  if (/\b(grava|anota|registra|salva|bota no cérebro|não (me )?deixa esquecer|pode registrar|quero lembrar)\b/i.test(txt)) {
    const match = txt.match(/(?:grava|anota|registra|salva|bota no cérebro|não (?:me )?deixa esquecer|pode registrar|quero lembrar)[\s:]+(.+)/is);
    const content = match ? match[1].trim() : txt;
    const result = await executor.run("obsidian-writer", {
      op: "write",
      folder: "07 - Reuniões & Notas",
      title: content.slice(0, 60).replace(/[^\w\s\-áéíóúâêîôûãõçàèìòù]/gi, "").trim() || "Nota rápida",
      content,
    });
    memory.save({ input: txt.slice(0, 200), skill: "obsidian-writer", result: result.ok ? "success" : "error", timestamp: Date.now() });
    return { type: "automatic", skill: "obsidian-writer", response: result };
  }

  // 📋 Status / saúde do sistema (painel-status)
  if (/\b(status|saúde|painel|como está|tá tudo|serviços|processos|relatório|resumo do sistema)\b/i.test(txt)) {
    chosenSkill = "painel-status";

  // 📚 Memória longa (memoria-longa)
  } else if (/\b(consciência|consciencia|memória|memoria|lembra|o que você sabe|o que temos|aprendizado|decisão|decisao)\b/i.test(txt)) {
    chosenSkill = "memoria-longa";

  // 💡 Brainstorming / ideias
  } else if (/\b(ideia|brainstorm|criativ|melhorar|sugest|pensar|desenvolv)\b/i.test(txt)) {
    chosenSkill = "brainstorming";

  // 🔍 Buscar skills
  } else if (/\b(skills?|ferramentas?|buscar|procurar|encontr|o que você (tem|sabe|pode))\b/i.test(txt)) {
    chosenSkill = "find-skills";

  // 🐛 Debug / erros
  } else if (/\b(erro|bug|debug|falh|quebr|problema|não (está|tá) funcionando)\b/i.test(txt)) {
    chosenSkill = "systematic-debugging";

  } else {
    const active = manager.listActive().filter(s => s.type === "executable");
    chosenSkill = active.length > 0 ? active[0].slug : null;
  }

  if (!chosenSkill) {
    return { type: "automatic", error: "Nenhuma skill encontrada para essa mensagem" };
  }

  const result = await executor.run(chosenSkill, { input: txt, topic: txt, query: txt });

  memory.save({
    input: txt.slice(0, 200),
    skill: chosenSkill,
    result: result.ok ? "success" : "error",
    timestamp: Date.now()
  });

  return { type: "automatic", skill: chosenSkill, response: result };
}

// 🚀 EXECUÇÃO PRINCIPAL
async function run(input, selectedSkill) {
  if (state.enabled && state.mode === "automatic" && !selectedSkill) {
    return await think(input);
  }

  if (selectedSkill) {
    const result = await executor.run(selectedSkill, { input, topic: input, query: input });

    memory.save({
      input: (input || "").slice(0, 200),
      skill: selectedSkill,
      result: result.ok ? "success" : "error",
      timestamp: Date.now()
    });

    return {
      type: "manual",
      skill: selectedSkill,
      response: result
    };
  }

  const active = manager.listActive();
  return {
    type: "manual",
    message: "Modo manual: nenhuma skill selecionada",
    options: active.map(s => s.slug)
  };
}

// 📊 STATUS
function status() {
  return {
    enabled: state.enabled,
    mode: state.mode,
    activeSkills: manager.listActive().length,
    totalSkills: manager.listAll().length,
    memorySize: memory.getAll().length,
    recentDecisions: memory.getLast(3)
  };
}

module.exports = { enable, disable, setMode, getState, run, think, status };
