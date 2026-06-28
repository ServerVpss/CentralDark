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

  const skills = manager.listAll();
  let chosenSkill = null;

  // Heurística (depois evolui com IA)
  if (/ideia|criar|brainstorm|criativ|melhorar|sugest/i.test(input)) {
    chosenSkill = "brainstorming";
  } else if (/buscar|procurar|skills?\b|encontr/i.test(input)) {
    chosenSkill = "find-skills";
  } else if (/erro|bug|debug|falh|quebr|problema/i.test(input)) {
    chosenSkill = "systematic-debugging";
  } else if (/plan|estratégia|roteiro|organiz/i.test(input)) {
    chosenSkill = "writing-plans";
  } else if (/revis|code.?review|qualidade/i.test(input)) {
    chosenSkill = "code-review";
  } else if (/document|memória|registr/i.test(input)) {
    chosenSkill = "documentation-memory";
  } else if (/test|validar|verific|confirm/i.test(input)) {
    chosenSkill = "verification-before-completion";
  } else if (/status|monitor|saúde|health/i.test(input)) {
    chosenSkill = "monitor-heartbeat";
  } else if (/telegram|alert|notific/i.test(input)) {
    chosenSkill = "telegram-alerts";
  } else if (/whatsapp|conex|qr|instância/i.test(input)) {
    chosenSkill = "whatsapp-wuzapi";
  } else {
    // fallback: primeira skill executável ativa
    const active = manager.listActive().filter(s => s.type === "executable");
    chosenSkill = active.length > 0 ? active[0].slug : null;
  }

  if (!chosenSkill) {
    return { type: "automatic", error: "Nenhuma skill encontrada" };
  }

  const result = await executor.run(chosenSkill, { input, topic: input, query: input });

  memory.save({
    input: (input || "").slice(0, 200),
    skill: chosenSkill,
    result: result.ok ? "success" : "error",
    timestamp: Date.now()
  });

  return {
    type: "automatic",
    skill: chosenSkill,
    response: result
  };
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
