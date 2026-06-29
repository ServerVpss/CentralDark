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

  // 🔍 GRAPH-INVESTIGATOR — "Detetive" / "Investiga o grafo"
  const ehGrafo = /\b(detetive|investiga o grafo|notas cinzas|notas isoladas|sem (links?|conexões)|grafo solto|auditoria do (vault|grafo)|acha (notas?|arquivos?) (sem|isolad))\b/i.test(txt);
  if (ehGrafo) {
    return {
      type: "clarify",
      message: "🔍 <b>GRAPH-INVESTIGATOR ativado</b>\n\n" +
               "Vou investigar o grafo do vault. O que você quer que eu faça?\n\n" +
               "1️⃣ <b>Listar notas sem frontmatter</b> (aparecem cinzas no grafo)\n" +
               "2️⃣ <b>Listar notas sem nenhum link</b> (isoladas)\n" +
               "3️⃣ <b>Auditoria completa</b> (roda o SWARM de 10 agentes)\n\n" +
               "Me diz o número ou descreve o que precisa."
    };
  }

  // 🔗 SEMANTIC-LINKER — "Liga tudo" / "Conecta as notas"
  const ehLinker = /\b(liga tudo|conecta as notas|conecta (essas )?notas?|cria links?|linkagem semântica|semantic link|meu grafo (tá|ta) solto|melhora as conexões)\b/i.test(txt);
  if (ehLinker) {
    return {
      type: "clarify",
      message: "🔗 <b>SEMANTIC-LINKER ativado</b>\n\n" +
               "Vou criar conexões inteligentes entre notas. O que você quer?\n\n" +
               "1️⃣ <b>Linkar automaticamente</b> notas sem conexão\n" +
               "2️⃣ <b>Adicionar seção 'Conexões Rápidas'</b> nas notas sem ela\n" +
               "3️⃣ <b>Ver quais notas deveriam ser linkadas</b> (relatório sem alterar)\n\n" +
               "Me diz o número."
    };
  }

  // 🐙 ISSUE-ANALYZER — "Analisa as issues" / "O que tem aberto?"
  const ehIssues = /\b(analisa as issues?|o que tem aberto|issues? do github|issues? abertas?|triagem das issues?|o que (tá|ta|está) aberto no github)\b/i.test(txt);
  if (ehIssues) {
    chosenSkill = "painel-status";
  }

  // 🏗️ ARCHITECTURE-REVIEWER — "Revisa a arquitetura" / "Tá certo assim?"
  const ehArquitetura = /\b(revisa a arquitetura|tá certo assim|ta certo assim|tem jeito melhor|olha essa estrutura|faz sentido (assim|colocar|fazer)|revisão técnica|revisao tecnica)\b/i.test(txt);
  if (ehArquitetura) {
    chosenSkill = "brainstorming";
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

  // Roteamento geral — só roda se nenhum bloco acima já definiu chosenSkill
  if (!chosenSkill) {
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
