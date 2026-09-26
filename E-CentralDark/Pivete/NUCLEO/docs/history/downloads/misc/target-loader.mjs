import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const SAFE_TEXT_EXTENSIONS = new Set([
  ".md", ".txt", ".json", ".js", ".mjs", ".cjs", ".ts", ".tsx", ".jsx",
  ".yaml", ".yml", ".csv", ".html", ".css", ".sh", ".ps1", ".py", ".diff", ".patch"
]);
const SENSITIVE_NAMES = new Set([".env", ".ssh", "secrets", "tokens", "sessions"]);
const IGNORED_DIRECTORIES = new Set([".git", "node_modules", "dist", "build", "coverage", ".next", ".cache"]);

/**
 * LEIGO: confere se o alvo está dentro das pastas que você autorizou.
 * PROFISSIONAL: compara realpath com raízes canônicas e bloqueia symlink escape.
 */
async function assertAllowedRealPath(candidate, allowedRoots) {
  const real = await fs.realpath(candidate);
  if (!allowedRoots.length) return real;
  const roots = await Promise.all(allowedRoots.map((root) => fs.realpath(path.resolve(root))));
  const allowed = roots.some((root) => real === root || real.startsWith(`${root}${path.sep}`));
  if (!allowed) throw new Error("TARGET_OUTSIDE_ALLOWED_ROOTS");
  return real;
}

/**
 * LEIGO: impede que arquivos sensíveis entrem no contexto do modelo.
 * PROFISSIONAL: aplica denylist por segmento de caminho antes de leitura.
 */
function assertNotSensitive(filePath) {
  const parts = path.resolve(filePath).split(path.sep).map((x) => x.toLowerCase());
  if (parts.some((part) => SENSITIVE_NAMES.has(part) || part.startsWith(".env."))) throw new Error("SENSITIVE_TARGET_BLOCKED");
  if (/\.(pem|key|p12|pfx)$/i.test(filePath)) throw new Error("SENSITIVE_TARGET_BLOCKED");
}

/**
 * LEIGO: lê um arquivo de texto pequeno e devolve também seu hash.
 * PROFISSIONAL: valida extensão, tamanho, realpath e produz snapshot UTF-8 limitado.
 */
async function loadFile(filePath, options) {
  assertNotSensitive(filePath);
  const real = await assertAllowedRealPath(filePath, options.allowedRoots);
  assertNotSensitive(real);
  const stat = await fs.stat(real);
  if (stat.size > options.maxFileBytes) throw new Error("TARGET_FILE_TOO_LARGE");
  const ext = path.extname(real).toLowerCase();
  if (!SAFE_TEXT_EXTENSIONS.has(ext)) {
    return { type: "file-metadata", path: real, size: stat.size, sha256: await hashFile(real), content: "<BINARY_OR_UNSUPPORTED_CONTENT_NOT_READ>" };
  }
  const content = await fs.readFile(real, "utf8");
  return { type: "file", path: real, size: stat.size, sha256: hashBytes(content), content: content.slice(0, options.maxContextChars) };
}

/**
 * LEIGO: percorre uma pasta sem seguir atalhos e pega apenas uma amostra útil dos textos.
 * PROFISSIONAL: faz walk recursivo, ignora symlinks e sensíveis, gera inventário completo e excerpts limitados.
 */
async function loadDirectory(directory, options) {
  const realRoot = await assertAllowedRealPath(directory, options.allowedRoots);
  const inventory = [];
  const excerpts = [];

  /**
   * LEIGO: visita cada subpasta até atingir o limite configurado.
   * PROFISSIONAL: recursão interna com limite global, exclusões e bloqueio de symlink.
   */
  async function walk(current) {
    if (inventory.length >= options.maxInventoryEntries) return;
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (inventory.length >= options.maxInventoryEntries) break;
      const full = path.join(current, entry.name);
      const relative = path.relative(realRoot, full).replaceAll("\\", "/");
      const lowerParts = relative.split("/").map((part) => part.toLowerCase());
      if (lowerParts.some((part) => SENSITIVE_NAMES.has(part) || part.startsWith(".env."))) continue;
      if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) continue;
      if (entry.isSymbolicLink()) { inventory.push({ path: relative, type: "symlink-blocked" }); continue; }
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile()) {
        const stat = await fs.stat(full);
        inventory.push({ path: relative, size: stat.size });
        if (excerpts.length < options.maxFiles && SAFE_TEXT_EXTENSIONS.has(path.extname(full).toLowerCase()) && stat.size <= options.maxFileBytes) {
          const text = await fs.readFile(full, "utf8");
          excerpts.push({ path: relative, sha256: hashBytes(text), content: text.slice(0, options.maxCharsPerFile) });
        }
      }
      if (inventory.length >= options.maxInventoryEntries) return;
    }
  }
  await walk(realRoot);
  return { type: "directory", path: realRoot, inventory, excerpts, sha256: hashBytes(JSON.stringify(inventory)) };
}

/**
 * LEIGO: carrega arquivo, pasta ou apenas registra um alvo textual/URL sem acessar a internet.
 * PROFISSIONAL: resolve tipos locais com realpath e trata URLs como referências não buscadas para evitar SSRF.
 */
export async function loadTarget(target, options = {}) {
  if (!target) return { type: "none", path: null, content: "<NO_TARGET>" };
  if (/^https?:\/\//i.test(target)) return { type: "url-reference", path: target, content: "<REMOTE_TARGET_NOT_FETCHED>" };

  const settings = {
    allowedRoots: options.allowedRoots || [],
    maxFileBytes: Number(options.maxFileBytes || 1_000_000),
    maxContextChars: Number(options.maxContextChars || 100_000),
    maxFiles: Number(options.maxFiles || 12),
    maxCharsPerFile: Number(options.maxCharsPerFile || 12_000),
    maxInventoryEntries: Number(options.maxInventoryEntries || 2000),
  };
  const lexicalTarget = path.resolve(target);
  const stat = await fs.stat(lexicalTarget);
  if (!settings.allowedRoots.length) settings.allowedRoots = [stat.isDirectory() ? lexicalTarget : path.dirname(lexicalTarget)];
  return stat.isDirectory() ? loadDirectory(lexicalTarget, settings) : loadFile(lexicalTarget, settings);
}

/** LEIGO: calcula hash de texto. PROFISSIONAL: SHA-256 sobre bytes UTF-8. */
function hashBytes(value) { return crypto.createHash("sha256").update(value).digest("hex"); }

/** LEIGO: calcula hash de arquivo sem carregá-lo todo na memória. PROFISSIONAL: streaming SHA-256. */
async function hashFile(filePath) {
  const handle = await fs.open(filePath, "r");
  const hash = crypto.createHash("sha256");
  try { for await (const chunk of handle.readableWebStream({ type: "bytes" })) hash.update(Buffer.from(chunk)); }
  finally { await handle.close(); }
  return hash.digest("hex");
}
