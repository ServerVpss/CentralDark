import path from "node:path";
import crypto from "node:crypto";
import { loadConfig, packageRoot } from "./config-loader.mjs";
import { resolveProviders, buildRouteCandidates } from "./provider-registry.mjs";
import { callWithFallback } from "./provider-client.mjs";
import { loadTarget } from "./target-loader.mjs";
import { buildReceipt, saveReceipt } from "./receipt.mjs";
import { sanitizeText } from "./sanitize.mjs";

/**
 * LEIGO: transforma o alvo carregado em contexto curto para o modelo.
 * PROFISSIONAL: serializa snapshot limitado com inventário, excerpts e hashes, nunca segredos ou binário.
 */
function targetToPrompt(target) {
  if (target.type === "directory") return JSON.stringify({ type: target.type, path: target.path, inventory: target.inventory, excerpts: target.excerpts }, null, 2);
  return JSON.stringify(target, null, 2);
}

/**
 * LEIGO: escolhe uma rota diferente da primeira para o crítico ou juiz.
 * PROFISSIONAL: seleciona provider/model não usado e devolve null quando independência real não existe.
 */
/**
 * LEIGO: dá um nome técnico à rota real usada.
 * PROFISSIONAL: identidade operacional por endpoint+model para distinguir aliases de independência real.
 */
function routeIdentity(route) {
  return `${route.provider.endpoint}|${route.model}`;
}

/**
 * LEIGO: escolhe uma rota realmente diferente, não apenas outro apelido para a mesma API.
 * PROFISSIONAL: independência é calculada por endpoint+model, evitando aliases falsamente independentes.
 */
function chooseDistinctRoute(routes, usedPairs) {
  return routes.find((route) => !usedPairs.has(routeIdentity(route))) || null;
}

/**
 * LEIGO: executa #nome como chamada normal e !nome como ataque adversarial com crítico e juiz.
 * PROFISSIONAL: coordena config, target snapshot, fallback, independência, fail-closed e receipt persistente.
 */
export async function executeInvocation(invocation, options = {}) {
  const config = await loadConfig({ configDir: options.configDir });
  const profile = config.commands.commands[invocation.name];
  if (!profile) throw new Error(`COMMAND_UNKNOWN:${invocation.name}`);
  if (profile.requiredTarget && !invocation.target) throw new Error("TARGET_REQUIRED");

  const allowedRootSource = options.lockAllowedRoots
    ? (options.allowedRoot || "")
    : (invocation.flags["allowed-root"] || options.allowedRoot || "");
  const allowedRoots = String(allowedRootSource)
    .split(";").map((x) => x.trim()).filter(Boolean);
  const target = await loadTarget(invocation.target, { allowedRoots });
  const providers = resolveProviders(config.providers, options.env || process.env);
  if (!providers.length) throw new Error("NO_PROVIDER_AVAILABLE");

  const preferences = {
    provider: invocation.flags.provider || profile.defaultProvider || null,
    model: invocation.flags.model || null,
  };
  let routes;
  if (invocation.flags.provider) {
    // Provider escrito pelo usuário é seleção estrita.
    routes = buildRouteCandidates(providers, preferences);
  } else {
    // Provider padrão apenas recebe prioridade; os demais continuam como fallback e independência adversarial.
    routes = buildRouteCandidates(providers, { model: preferences.model });
    routes.sort((a, b) => Number(b.provider.id === preferences.provider) - Number(a.provider.id === preferences.provider));
  }

  const user = [
    `COMANDO=${invocation.prefix}${invocation.name}`,
    `MODO=${invocation.mode}`,
    `ALVO=${invocation.target || "NENHUM"}`,
    "SNAPSHOT_DO_ALVO_SANITIZADO:",
    sanitizeText(targetToPrompt(target), 180000),
    invocation.flags.instrucao ? `INSTRUCAO_EXTRA=${sanitizeText(invocation.flags.instrucao, 4000)}` : "",
  ].filter(Boolean).join("\n\n");

  const requestId = crypto.randomUUID();
  const callOptions = { ...options, requestId };
  let output;
  let finalRoute;
  let independence = "NOT_APPLICABLE";
  if (invocation.mode === "standard") {
    const primary = await callWithFallback(routes, { system: profile.system, user }, callOptions);
    output = primary.text;
    finalRoute = primary;
  } else {
    const primary = await callWithFallback(routes, { system: profile.system, user }, callOptions);
    const primaryRoute = routes.find((route) => route.provider.id === primary.provider && route.model === primary.model);
    const used = new Set([routeIdentity(primaryRoute)]);

    const criticRoutes = routes.filter((route) => !used.has(routeIdentity(route)));
    if (!criticRoutes.length) throw new Error("INDEPENDENT_CRITIC_UNAVAILABLE");
    const critic = await callWithFallback(criticRoutes, {
      system: profile.criticSystem,
      user: `ALVO E SNAPSHOT:
${user}

RESPOSTA_PRIMARIA:
${primary.text}`,
    }, callOptions);
    const actualCriticRoute = criticRoutes.find((route) => route.provider.id === critic.provider && route.model === critic.model);
    used.add(routeIdentity(actualCriticRoute));

    const judgeRoutes = routes.filter((route) => !used.has(routeIdentity(route)));
    const allowReusedJudge = invocation.flags["allow-reused-judge"] === "true";
    if (!judgeRoutes.length && !allowReusedJudge) throw new Error("INDEPENDENT_JUDGE_UNAVAILABLE");
    const selectedJudgeRoutes = judgeRoutes.length ? judgeRoutes : [routes[0]];
    const judge = await callWithFallback(selectedJudgeRoutes, {
      system: profile.judgeSystem,
      user: `SNAPSHOT:
${user}

PRIMARIO:
${primary.text}

CRITICO:
${critic.text}`,
    }, callOptions);
    output = judge.text;
    finalRoute = judge;
    independence = judgeRoutes.length ? "PRIMARY_CRITIC_JUDGE_DISTINCT" : "JUDGE_REUSED_EXPLICITLY";
  }
  const receipt = buildReceipt({
    requestId,
    command: `${invocation.prefix}${invocation.name}`,
    mode: invocation.mode,
    status: "PASS",
    provider: finalRoute.provider,
    model: finalRoute.model,
    endpoint: finalRoute.endpoint,
    target,
    configHash: config.configHash,
    prompt: user,
    output,
    independence,
  }, { hmacKey: options.receiptHmacKey || (options.env || process.env).UNIVERSAL_RECEIPT_HMAC_KEY });
  const receiptsDir = path.resolve(options.receiptsDir || path.join(packageRoot(), "receipts"));
  const receiptPath = options.saveReceipt === false ? null : await saveReceipt(receipt, receiptsDir);
  return { status: "PASS", output, receipt, receiptPath };
}
