import { parseInvocation } from "./command-parser.mjs";
import { executeInvocation } from "./orchestrator.mjs";

/**
 * LEIGO: permite chamar o motor de dentro da sua própria API com uma única função.
 * PROFISSIONAL: converte command/target/options na mesma invocation tipada usada pela CLI e pelo servidor HTTP.
 */
export async function runUniversal(command, target = null, options = {}) {
  const argv = [command];
  if (target) argv.push(target);
  if (options.provider) argv.push("--provider", options.provider);
  if (options.model) argv.push("--model", options.model);
  if (options.instruction) argv.push("--instrucao", options.instruction);
  if (options.allowedRoot) argv.push("--allowed-root", options.allowedRoot);
  if (options.allowReusedJudge === true) argv.push("--allow-reused-judge", "true");
  return executeInvocation(parseInvocation(argv), options);
}

export { parseInvocation } from "./command-parser.mjs";
export { executeInvocation } from "./orchestrator.mjs";
export { createServer } from "./http-server.mjs";
export { verifyReceiptSignature } from "./receipt.mjs";
