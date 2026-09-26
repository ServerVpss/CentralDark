/**
 * LEIGO: transforma uma chamada curta como "#auditar C:\\alvo" em campos compreensíveis pelo motor.
 * PROFISSIONAL: faz parsing fail-closed de prefixo, nome, alvo e flags sem executar shell.
 */
export function parseInvocation(argv) {
  const args = [...argv];
  if (!args.length) throw new Error("COMMAND_REQUIRED");

  // Aceita uma frase inteira ou argumentos separados.
  if (args.length === 1 && /^\s*[#!][\w-]+\s+/.test(args[0])) {
    const match = args[0].trim().match(/^([#!][\w-]+)\s+([\s\S]+)$/);
    args.splice(0, 1, match[1], match[2]);
  }

  const token = String(args.shift()).trim();
  const commandMatch = token.match(/^([#!])([a-z0-9][a-z0-9_-]{0,63})$/i);
  if (!commandMatch) throw new Error("COMMAND_FORMAT_INVALID");

  const flags = {};
  const targetParts = [];
  while (args.length) {
    const current = String(args.shift());
    if (current.startsWith("--")) {
      const [rawKey, inline] = current.slice(2).split("=", 2);
      if (!rawKey) throw new Error("FLAG_INVALID");
      const value = inline ?? (args[0] && !String(args[0]).startsWith("--") ? String(args.shift()) : "true");
      flags[rawKey] = value;
    } else {
      targetParts.push(current);
    }
  }

  let target = targetParts.join(" ").trim();
  if (/^ALVO=/i.test(target)) target = target.replace(/^ALVO=/i, "").trim();

  return {
    prefix: commandMatch[1],
    mode: commandMatch[1] === "!" ? "adversarial" : "standard",
    name: commandMatch[2].toLowerCase(),
    target: target || null,
    flags,
  };
}
