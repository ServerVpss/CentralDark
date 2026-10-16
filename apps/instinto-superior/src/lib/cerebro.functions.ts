import { createServerFn } from "@tanstack/react-start";
import * as fs from "node:fs";
import * as path from "node:path";

/* ───────────────────────────────────────────────
   Cérebro Vivo — lê aprendizados, lembranças,
   NeuroLink lineage e commits do repo canônico.
   Alimenta o medidor de conformidade cognitiva.
   ─────────────────────────────────────────────── */

export type Aprendizado = {
  numero: number;
  titulo: string;
  categoria: string;
  data: string;
  uid: string;
  prevUid: string | null;
  nextUid: string | null;
};

export type Lembranca = {
  arquivo: string;
  titulo: string;
  data: string;
  status: string;
};

export type NeuroNode = {
  uid: string;
  legacy_learning_number: number;
  title: string;
  prev_uid: string | null;
  next_uid: string | null;
  relation_type: string;
};

export type CommitConformidade = {
  sha: string;
  mensagem: string;
  data: string;
  temRecibo: boolean;
  temAprendizado: boolean;
};

export type CerebroVivo = {
  aprendizados: Aprendizado[];
  lembrancas: Lembranca[];
  neurolink: { total: number; cadeiaIntegra: boolean; quebras: string[] };
  commits: CommitConformidade[];
  resumo: {
    totalAprendizados: number;
    totalLembrancas: number;
    totalNeuroNodes: number;
    categoriasTop: { cat: string; n: number }[];
    ultimoAprendizado: string | null;
    ultimaLembranca: string | null;
    cadeiaNeuroIntegra: boolean;
  };
};

// Tenta encontrar a raiz do repo
function repoRoot(): string {
  const candidates = [
    process.env['REPO_ROOT'],
    "K:/",
    "/root/CentralDark",
    process.cwd(),
  ].filter(Boolean) as string[];
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "docs", "CONSCIENCIA", "APRENDIZADOS.md"))) return c;
  }
  return candidates[0] || process.cwd();
}

function lerAprendizados(root: string): Aprendizado[] {
  const filePath = path.join(root, "docs", "CONSCIENCIA", "APRENDIZADOS.md");
  if (!fs.existsSync(filePath)) return [];
  const texto = fs.readFileSync(filePath, "utf-8");
  const blocos = texto.split(/^### /gm).slice(1);
  const result: Aprendizado[] = [];

  for (const bloco of blocos) {
    const headerMatch = bloco.match(/^(\d+)\.\s+(.*)/);
    if (!headerMatch) continue;
    const numero = parseInt(headerMatch[1] ?? "0", 10);
    const titulo = (headerMatch[2] ?? "").trim();

    const catMatch = bloco.match(/\*\*Categoria:\*\*\s*(.*)/);
    const dataMatch = bloco.match(/\*\*Data:\*\*\s*(.*)/);
    const uidMatch = bloco.match(/GLOBAL_LINEAGE_UID=(\w+)/);
    const prevMatch = bloco.match(/PREV_GLOBAL_UID=(\w+)/);
    const nextMatch = bloco.match(/NEXT_GLOBAL_UID=(\w+)/);

    result.push({
      numero,
      titulo: titulo.slice(0, 120),
      categoria: catMatch?.[1]?.trim() ?? "sem-categoria",
      data: dataMatch?.[1]?.trim() ?? "",
      uid: uidMatch?.[1] ?? `L${String(numero).padStart(3, "0")}`,
      prevUid: prevMatch?.[1] ?? null,
      nextUid: nextMatch?.[1] ?? null,
    });
  }
  return result;
}

function lerLembrancas(root: string): Lembranca[] {
  const dir = path.join(root, "docs", "CONSCIENCIA", "LEMBRANCAS");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  const result: Lembranca[] = [];

  for (const f of files) {
    const texto = fs.readFileSync(path.join(dir, f), "utf-8");
    const tituloMatch = texto.match(/title:\s*"(.*)"/);
    const dataMatch = f.match(/^(\d{4}-\d{2}-\d{2})/);
    const statusMatch = texto.match(/status:\s*"?(\S+)"?/);
    result.push({
      arquivo: f,
      titulo: tituloMatch?.[1] ?? f.replace(/\.md$/, ""),
      data: dataMatch?.[1] ?? "",
      status: statusMatch?.[1] ?? "ACTIVE",
    });
  }
  return result;
}

function lerNeuroLink(root: string): { total: number; cadeiaIntegra: boolean; quebras: string[] } {
  const filePath = path.join(root, "docs", "CONSCIENCIA", "APRENDIZADOS-NEUROLINK-LINEAGE.json");
  if (!fs.existsSync(filePath)) return { total: 0, cadeiaIntegra: false, quebras: ["arquivo nao encontrado"] };
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const nodes: NeuroNode[] = data.nodes ?? [];
    const uidSet = new Set(nodes.map((n) => n.uid));
    if (data.genesis?.uid) uidSet.add(data.genesis.uid);

    // Verificar integridade da cadeia
    const quebras: string[] = [];
    for (const n of nodes) {
      if (n.prev_uid && !uidSet.has(n.prev_uid)) {
        quebras.push(`${n.uid} aponta prev ${n.prev_uid} inexistente`);
      }
      if (n.next_uid && !uidSet.has(n.next_uid)) {
        quebras.push(`${n.uid} aponta next ${n.next_uid} inexistente`);
      }
    }
    return { total: nodes.length, cadeiaIntegra: quebras.length === 0, quebras };
  } catch {
    return { total: 0, cadeiaIntegra: false, quebras: ["erro ao parsear JSON"] };
  }
}

function lerCommitsConformidade(root: string, aprendizados: Aprendizado[]): CommitConformidade[] {
  // Uses git log from repo
  try {
    const { execSync } = require("node:child_process");
    // Safe: no user input in command — static git log query
    const log = execSync("git log --oneline -20 --format=%H|||%s|||%aI", {
      cwd: root,
      encoding: "utf-8",
      timeout: 5000,
    });
    const shasMencionados = new Set<string>();
    // Check if any aprendizado mentions commits
    for (const a of aprendizados) {
      const shaMatch = a.titulo.match(/[0-9a-f]{7,40}/g);
      if (shaMatch) shaMatch.forEach((s) => shasMencionados.add(s));
    }

    return log
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line: string) => {
        const [sha, mensagem, data] = line.split("|||");
        return {
          sha: sha?.slice(0, 10) ?? "",
          mensagem: mensagem?.slice(0, 100) ?? "",
          data: data ?? "",
          temRecibo: mensagem?.includes("fix") || mensagem?.includes("feat") || mensagem?.includes("receipt") || false,
          temAprendizado: shasMencionados.has(sha?.slice(0, 7) ?? ""),
        };
      });
  } catch {
    return [];
  }
}

export const lerCerebroVivo = createServerFn({ method: "GET" }).handler(async (): Promise<CerebroVivo> => {
  const root = repoRoot();
  const aprendizados = lerAprendizados(root);
  const lembrancas = lerLembrancas(root);
  const neurolink = lerNeuroLink(root);
  const commits = lerCommitsConformidade(root, aprendizados);

  // Contagem de categorias
  const catMap = new Map<string, number>();
  for (const a of aprendizados) {
    catMap.set(a.categoria, (catMap.get(a.categoria) ?? 0) + 1);
  }
  const categoriasTop = [...catMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, n]) => ({ cat, n }));

  return {
    aprendizados,
    lembrancas,
    neurolink,
    commits,
    resumo: {
      totalAprendizados: aprendizados.length,
      totalLembrancas: lembrancas.length,
      totalNeuroNodes: neurolink.total,
      categoriasTop,
      ultimoAprendizado: aprendizados[aprendizados.length - 1]?.titulo ?? null,
      ultimaLembranca: lembrancas[lembrancas.length - 1]?.titulo ?? null,
      cadeiaNeuroIntegra: neurolink.cadeiaIntegra,
    },
  };
});
