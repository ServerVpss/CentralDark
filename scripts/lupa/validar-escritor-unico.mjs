#!/usr/bin/env node
/**
 * Validador determinístico de WRITER_UNICO.
 *
 * Problema que este arquivo fecha:
 *   `author` e `committer` do Git são a identidade da CONTA, não do agente que
 *   escreveu. Toda IA da casa commita como a mesma conta, sem assinatura. Logo
 *   `WRITER=...` escrito no corpo do PR é texto livre: nem prova violação, nem
 *   prova inocência. Auditor que herda o corpo do PR como evidência viola o
 *   Princípio 3.
 *
 * Contrato:
 *   - todo commit do intervalo carrega o trailer `Writer: <slug>`;
 *   - o intervalo inteiro tem UM único valor de Writer;
 *   - `Writer-Session:` é opcional e precisa ser opaco (sem cara de credencial).
 *
 * Fail-closed: ausência, formato inválido ou divergência retornam FAIL e exit 1.
 * Warning nunca é veredito — ver `.github/workflows/farm-co-author.yml`, que é
 * `continue-on-error: true` e por isso não serve de gate.
 *
 * Nenhum valor sensível é impresso: sessões suspeitas viram REDACTED.
 */
import { execFileSync } from "node:child_process";

export const WRITER_SLUG = /^[a-z0-9][a-z0-9._-]{1,39}$/;

/** Padrões que nunca podem aparecer num campo público de identidade. */
const CREDENTIAL_SHAPES = [
  /gh[pousr]_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /sk-[A-Za-z0-9_-]{16,}/,
  /\bey[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/,
];

export function looksLikeCredential(value) {
  return CREDENTIAL_SHAPES.some((shape) => shape.test(String(value ?? "")));
}

/**
 * Lê trailers do rodapé da mensagem. Só o rodapé conta: menção a `Writer:` no
 * meio do corpo não vira identidade.
 */
export function parseWriterTrailers(message) {
  const lines = String(message ?? "").replace(/\r\n/g, "\n").split("\n");
  let writer = null;
  let session = null;
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i].trim();
    if (!line) continue;
    const match = line.match(/^([A-Za-z-]+):\s*(.+)$/);
    if (!match) break;
    const key = match[1].toLowerCase();
    const value = match[2].trim();
    if (key === "writer" && writer === null) writer = value;
    if (key === "writer-session" && session === null) session = value;
  }
  return { writer, session };
}

/**
 * Veredito do intervalo. `commits` = [{ sha, message }].
 * Intervalo vazio é FAIL: nada provado não é nada aprovado.
 */
export function evaluateWriters(commits) {
  const problems = [];
  const seen = new Set();
  const perCommit = [];

  if (!Array.isArray(commits) || commits.length === 0) {
    return { verdict: "FAIL", writers: [], problems: ["NO_COMMITS_INSPECTED"], commits: [] };
  }

  for (const commit of commits) {
    const sha = String(commit?.sha ?? "").slice(0, 12) || "unknown";
    const { writer, session } = parseWriterTrailers(commit?.message);

    if (!writer) {
      problems.push(`WRITER_TRAILER_MISSING:${sha}`);
      perCommit.push({ sha, writer: null, session: null });
      continue;
    }
    if (!WRITER_SLUG.test(writer)) {
      problems.push(`WRITER_SLUG_INVALID:${sha}`);
      perCommit.push({ sha, writer: null, session: null });
      continue;
    }
    if (session && looksLikeCredential(session)) {
      problems.push(`WRITER_SESSION_LOOKS_LIKE_CREDENTIAL:${sha}`);
      perCommit.push({ sha, writer, session: "REDACTED" });
      continue;
    }
    seen.add(writer);
    perCommit.push({ sha, writer, session: session || null });
  }

  const writers = [...seen].sort();
  if (writers.length > 1) problems.push(`WRITER_NOT_UNIQUE:${writers.join("+")}`);

  return {
    verdict: problems.length ? "FAIL" : "PASS",
    writers,
    problems,
    commits: perCommit,
  };
}

export function readCommits(range) {
  const raw = execFileSync("git", ["log", "--format=%H%x1f%B%x1e", range], {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  return raw
    .split("\x1e")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [sha, ...rest] = entry.split("\x1f");
      return { sha: sha.trim(), message: rest.join("\x1f") };
    });
}

export function main(argv = process.argv.slice(2)) {
  const range = argv[0];
  if (!range) throw new Error("RANGE_REQUIRED: uso -> validar-escritor-unico.mjs <base>..<head>");
  const result = evaluateWriters(readCommits(range));
  console.log(`WRITER_UNICO_VERDICT=${result.verdict}`);
  console.log(`WRITER_UNICO_WRITERS=${result.writers.join(",") || "none"}`);
  console.log(`WRITER_UNICO_PROBLEMS=${result.problems.join(" ") || "none"}`);
  for (const item of result.commits) {
    console.log(`COMMIT=${item.sha} WRITER=${item.writer || "MISSING"}`);
  }
  if (result.verdict !== "PASS") process.exit(1);
  return result;
}

const isMain = process.argv[1] && process.argv[1].endsWith("validar-escritor-unico.mjs");
if (isMain) {
  try {
    main();
  } catch (error) {
    console.error(`WRITER_UNICO_ERROR=${error.message}`);
    process.exit(1);
  }
}
