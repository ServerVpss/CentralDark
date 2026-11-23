// Wrapper CJS para evitar bug de ESM do PM2
// O PM2 tem problemas com import() dinâmico em .mjs
// Este wrapper chama o Node diretamente com o script .mjs
const { spawn } = require("child_process");
const path = require("path");

const script = path.join(__dirname, "crafter.mjs");

const child = spawn(process.execPath, [script], {
  stdio: "inherit",
  cwd: __dirname,
  env: { ...process.env },
});

child.on("exit", (code) => {
  process.exit(code);
});

process.on("SIGTERM", () => child.kill("SIGTERM"));
process.on("SIGINT", () => child.kill("SIGINT"));
