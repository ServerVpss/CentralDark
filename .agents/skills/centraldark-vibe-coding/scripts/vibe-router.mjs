// Roteador de metadados: nenhum comando, arquivo, rede, prompt externo ou segredo é executado aqui.
const SKILL = "centraldark-vibe-coding";
const ROUTES = Object.freeze({
  CREATE: ["capability-contract-router", "meta-lupa"],
  IDEATE: ["brainstorming", "capability-contract-router", "meta-lupa"],
  PATCH: ["capability-contract-router", "meta-lupa"],
  RESTART_DRAFT: ["brainstorming", "meta-lupa"],
  RECONCILE: ["git-conflict-resolve-house-standard", "meta-lupa"],
});

export function routeVibeCoding(input = {}) {
  const command = typeof input === "string" ? input : String(input.command ?? "");
  const target = typeof input === "string" ? "" : String(input.target ?? "").trim();
  const confirmRestart = typeof input === "string" ? false : input.confirmRestart === true;
  const normalized = command.normalize("NFKC").trim();
  const triggered = /(?:^|\s)(?:#VIBECODING|!VIBECODING)(?=\s|$)/i.test(normalized);
  if (!triggered) return { status: "NOT_TRIGGERED", skill: SKILL, actionTaken: false };
  const goal = normalized.replace(/!CENTRALDARK/gi, "").replace(/(?:#|!)VIBECODING/gi, "").trim();
  if (!goal) return { status: "GOAL_REQUIRED", skill: SKILL, actionTaken: false };
  let mode = "CREATE";
  if (/(?:recome[cç]ar|come[cç]ar de novo|refazer tudo|descartar rascunho)/i.test(goal)) mode = "RESTART_DRAFT";
  else if (/(?:conflito|reconcilia(?:r|[cç][aã]o)|merge de pr)/i.test(goal)) mode = "RECONCILE";
  else if (/(?:n[aã]o gostei|ajustar|mexe(?:r)? s[oó]|altere apenas|trocar s[oó])/i.test(goal)) mode = "PATCH";
  else if (/(?:brainstorm|ideias|op[cç][oõ]es|explorar conceito|imaginar)/i.test(goal)) mode = "IDEATE";
  let status = "ROUTE_DECLARED_NOT_EXECUTED";
  if (mode === "PATCH" && !target) status = "TARGET_REQUIRED";
  if (mode === "RESTART_DRAFT") status = confirmRestart ? "DRAFT_RESET_CANDIDATE_ONLY" : "CONFIRM_DRAFT_SCOPE_REQUIRED";
  const skills = ROUTES[mode];
  return {
    status, skill: SKILL, trigger: "#VIBECODING", root: "!CENTRALDARK",
    goal, mode, target: mode === "PATCH" ? (target || null) : null,
    skillsOnDemand: skills, loadAll: false, actionTaken: false,
    allowedSurface: mode === "RESTART_DRAFT" ? "ISOLATED_DRAFT_ONLY" :
      mode === "PATCH" ? "NAMED_COMPONENT_ONLY" : "EXISTING_OWNER",
    graphTags: ["VIBE_CODING", mode, "CONTRAPROVA", "CRISTAL"],
    testContract: "OBJETIVO|ALVO|HIPOTESE|ORACULO|PROVA|CONTRAPROVA",
    noFalseGreen: true,
    nextCursor: status !== "ROUTE_DECLARED_NOT_EXECUTED" ? status :
      "OWNER_READBACK→SKILLS_SOB_DEMANDA→RASCUNHO→TESTE→RECEIPT",
  };
}

if (process.argv[1] && new URL(import.meta.url).pathname === new URL("file://" + process.argv[1]).pathname) {
  process.stdout.write(JSON.stringify(routeVibeCoding({ command: process.argv.slice(2).join(" ") }), null, 2) + "\n");
}
