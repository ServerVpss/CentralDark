#!/usr/bin/env node
// Auditor de páginas: varre src/apps/**/pages, compara com rotas
// registradas em src/App.tsx e gera public/data/paginas.json.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PAGES_GLOB_ROOT = join(ROOT, "src", "apps");
const APP_FILE = join(ROOT, "src", "App.tsx");
const OUT_DIR = join(ROOT, "public", "data");
const OUT_FILE = join(OUT_DIR, "paginas.json");

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (st.isFile() && /\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

function listarPaginas() {
  const todos = walk(PAGES_GLOB_ROOT);
  return todos
    .filter((p) => p.includes(`${"/"}pages${"/"}`) || p.endsWith(`${"/"}pages`))
    .map((p) => relative(ROOT, p).replaceAll("\\", "/"));
}

function lerRotasRegistradas() {
  const txt = readFileSync(APP_FILE, "utf8");
  // captura imports default de qualquer caminho contendo /pages/
  const re = /import\s+(\w+)\s+from\s+["']([^"']*\/pages\/[^"']+)["']/g;
  const registrados = new Set();
  let m;
  while ((m = re.exec(txt))) {
    // normaliza alias @/ -> src/
    const caminho = m[2].replace(/^@\//, "src/") + ".tsx";
    registrados.add(caminho);
  }
  return registrados;
}

function main() {
  const paginas = listarPaginas();
  const registrados = lerRotasRegistradas();
  const itens = paginas.map((arquivo) => ({
    arquivo,
    nome: arquivo.split("/").pop().replace(/\.tsx?$/, ""),
    registrado: registrados.has(arquivo),
  }));
  const total = itens.length;
  const cadastradas = itens.filter((i) => i.registrado).length;
  const orfas = itens.filter((i) => !i.registrado);

  const relatorio = {
    geradoEm: new Date().toISOString(),
    total,
    cadastradas,
    orfas: orfas.length,
    itens,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(relatorio, null, 2));
  console.log(
    `[audit-pages] total=${total} cadastradas=${cadastradas} orfas=${orfas.length}`
  );
  if (orfas.length) {
    console.log("  Órfãs:");
    for (const o of orfas) console.log("   - " + o.arquivo);
  }
}

main();
