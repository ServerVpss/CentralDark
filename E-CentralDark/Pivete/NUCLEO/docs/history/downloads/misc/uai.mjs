#!/usr/bin/env node
import { parseInvocation } from "../src/command-parser.mjs";
import { executeInvocation } from "../src/orchestrator.mjs";
import { sanitizeText } from "../src/sanitize.mjs";

/**
 * LEIGO: é a porta de entrada do terminal.
 * PROFISSIONAL: parseia argv, executa o orquestrador e imprime somente JSON sanitizado em erro.
 */
async function main() {
  try {
    const invocation = parseInvocation(process.argv.slice(2));
    const result = await executeInvocation(invocation);
    console.log(result.output);
    console.error(`\nRECEIPT=${result.receiptPath}`);
  } catch (error) {
    console.error(JSON.stringify({ status: "BLOCKED", error: sanitizeText(error.message, 1000) }, null, 2));
    process.exitCode = 1;
  }
}
await main();
