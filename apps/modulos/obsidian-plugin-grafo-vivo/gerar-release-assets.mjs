// Gera changelog.json e checksums.json pra alimentar o auto-updater.
// Deve rodar DEPOIS do build (esbuild) porque calcula SHA-256 do main.js.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const raiz = __dirname;

const manifest = JSON.parse(readFileSync(join(raiz, "manifest.json"), "utf8"));
const versao = manifest.version;

// ---- checksums.json ----
const arquivos = ["main.js", "manifest.json", "styles.css"];
const checksums = { versao, geradoEm: new Date().toISOString(), arquivos: {} };
for (const nome of arquivos) {
  const caminho = join(raiz, nome);
  if (!existsSync(caminho)) continue;
  const conteudo = readFileSync(caminho);
  const hash = createHash("sha256").update(conteudo).digest("hex");
  checksums.arquivos[nome] = hash;
}
writeFileSync(join(raiz, "checksums.json"), JSON.stringify(checksums, null, 2) + "\n");
console.log(`✅ checksums.json gerado pra v${versao}`);

// ---- changelog.json ----
// Fonte: CHANGELOG.md — cada entrada começa com "## v0.X.Y (data)"
// e as linhas de bullet abaixo viram mudanças.
const caminhoChangelog = join(raiz, "CHANGELOG.md");
if (!existsSync(caminhoChangelog)) {
  console.warn("⚠️ CHANGELOG.md não encontrado, pulando changelog.json");
  process.exit(0);
}
const texto = readFileSync(caminhoChangelog, "utf8");
const versoes = [];
const blocos = texto.split(/\n(?=## v)/g);
for (const bloco of blocos) {
  const cabecalho = bloco.match(/^##\s+v([\d.]+)(?:\s+\(([^)]+)\))?/);
  if (!cabecalho) continue;
  const mudancas = [];
  for (const linha of bloco.split("\n").slice(1)) {
    const m = linha.match(/^\s*[-*]\s+(.+)$/);
    if (m) mudancas.push(m[1].trim());
  }
  versoes.push({ versao: cabecalho[1], data: cabecalho[2] || null, mudancas });
}
writeFileSync(
  join(raiz, "changelog.json"),
  JSON.stringify({ atualizadoEm: new Date().toISOString(), versoes }, null, 2) + "\n",
);
console.log(`✅ changelog.json gerado (${versoes.length} versões)`);
