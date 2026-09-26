# COMANDO - validar-escritor-unico.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lupa\validar-escritor-unico.mjs
**SHA:** 0bd16349ca4ac110
**Timestamp:** 2026-08-28T02:57:36.292552
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- * Contrato:

### Gaps
- problems.push(`WRITER_TRAILER_MISSING:${sha}`);

### Ouro Bruto (primeiros 5000 chars)
```
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
 *   - futuro (mode=enforce): todo commit carrega trailer `Writer: <slug>`;
 *   - passado (mode=legacy): commit sem trailer = UNKNOWN_LEGACY (nao inventa autor);
 *   - o intervalo enforce tem UM unico valor de Writer;
 *   - `Writer-Session:` e opcional e precisa ser opaco (sem cara de credencial).
 *
 * Fail-closed: so verdict=PASS exit 0. UNKNOWN_LEGACY/FAIL exit 1 (nao e verde).
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
/**
 * Fronteira de ativacao do gate Writer:
 * - mode=enforce (default, futuro/CI): falta de trailer = FAIL
 * - mode=legacy (passado/UNKNOWN_LEGACY): commit sem trailer = UNKNOWN_LEGACY
 *   (nao inventa autoria historica; nao conta como PASS)
 * Em ambos os modos: trailer presente invalido / multi-writer / credencial = FAIL.
 * Intervalo vazio sempre FAIL.
 */
export function evaluateWriters(commits, options = {}) {
  const mode = ["legacy", "migrate", "enforce"].includes(options.mode)
    ? options.mode
    : "enforce";
  const problems = [];
  const seen = new Set();
  const perCommit = [];
  let unknownLegacy = 0;

  if (!Array.isArray(commits) || commits.length === 0) {
    return {
      verdict: "FAIL",
      mode,
      writers: [],
      problems: ["NO_COMMITS_INSPECTED"],
      commits: [],
      unknown_legacy: 0,
    };
  }

  for (const commit of commits) {
    const sha = String(commit?.sha ?? "").slice(0, 12) || "unknown";
    const { writer, session } = parseWriterTrailers(commit?.message);

    if (!writer) {
      if (mode === "legacy" || mode === "migrate") {
        unknownLegacy += 1;
        perCommit.push({ sha, writer: null, session: null, status: "UNKNOWN_LEGACY" });
      } else {
        problems.push(`WRITER_TRAILER_MISSING:${sha}`);
        perCommit.push({ sha, writer: null, session: null, status: "FAIL" });
      }
      continue;
    }
    if (!WRITER_SLUG.test(writer)) {
      problems.push(`WRITER_SLUG_INVALID:${sha}`);
      perCommit.push({ sha, writer: null, session: null, status: "FAIL" });
      continue;
    }
    if (session && looksLikeCredential(session)) {
      problems.push(`WRITER_SESSION_LOOKS_LIKE_CREDENTIAL:${sha}`);
      perCommit.push({ sha, writer, session: "REDACTED", status: "FAIL" });
      continue;
    }
    seen.add(writer);
    perCommit.push({ sha, writer, session: session || null, status: "OK" });
  }

  const writers = [...seen].sort();
  if (writers.length > 1) problems.push(`WRITER_NOT_UNIQUE:${writers.join("+")}`);

  let verdict;
  if (problems.length) {
    verdict = "FAIL";
  } else if (mode === "legacy") {
    if (unknownLegacy > 0 && writers.length === 0) verdict = "UNKNOWN_LEGACY";
    else if (unknownLegacy > 0 && writers.length >= 1) verdict = "PARTIAL_LEGACY";
    else verdict = "PASS";
  } else if (mode === "migrate") {
    // tip exige Writer; passado sem trailer = UNKNOWN_LEGACY (nao inventa autor)
    if (unknownLegacy > 0 && writers.length === 0) verdict = "UNKNOWN_LEGACY";
    else if (unknownLegacy > 0 && writers.length 
```