import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const rootDir = process.cwd();
const appDir = resolve(rootDir, "apps/bot");
const appDistDir = resolve(appDir, "dist");
const rootDistDir = resolve(rootDir, "dist");

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run("bun", ["install"], appDir);
run("bun", ["run", "build"], appDir);

if (!existsSync(appDistDir)) {
  console.error("Build concluído, mas apps/bot/dist não foi gerado.");
  process.exit(1);
}

rmSync(rootDistDir, { recursive: true, force: true });
mkdirSync(rootDistDir, { recursive: true });
cpSync(appDistDir, rootDistDir, { recursive: true });

if (!existsSync(resolve(rootDistDir, "index.html"))) {
  console.error("A pasta dist da raiz foi criada sem index.html.");
  process.exit(1);
}

console.log("Build final pronto em /dist.");