import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sha256 } from "./sanitize.mjs";

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * LEIGO: encontra a pasta principal do pacote, permitindo testes e instalação em outro lugar.
 * PROFISSIONAL: expõe o root resolvido a partir de import.meta.url, sem depender do diretório atual.
 */
export function packageRoot() {
  return PACKAGE_ROOT;
}

/**
 * LEIGO: abre um JSON de configuração e para com erro claro se ele estiver quebrado.
 * PROFISSIONAL: lê UTF-8, valida JSON e inclui o caminho na exceção sanitizada.
 */
export async function readJson(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`CONFIG_READ_FAILED:${path.basename(filePath)}:${error.message}`);
  }
}

/**
 * LEIGO: carrega comandos e provedores do lugar exato onde o usuário pode editar.
 * PROFISSIONAL: resolve configDir explícito, valida schema mínimo e devolve hash de configuração.
 */
export async function loadConfig(options = {}) {
  const configDir = path.resolve(options.configDir || path.join(PACKAGE_ROOT, "config"));
  const providers = await readJson(path.join(configDir, "providers.json"));
  const commands = await readJson(path.join(configDir, "commands.json"));
  if (providers.schemaVersion !== 1 || !Array.isArray(providers.providers)) throw new Error("PROVIDERS_SCHEMA_INVALID");
  if (commands.schemaVersion !== 1 || !commands.commands || typeof commands.commands !== "object") throw new Error("COMMANDS_SCHEMA_INVALID");
  return { configDir, providers, commands, configHash: sha256({ providers, commands }) };
}
