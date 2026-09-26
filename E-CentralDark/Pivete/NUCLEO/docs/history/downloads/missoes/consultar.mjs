#!/usr/bin/env node
/**
 * consultar.mjs — abre no máximo três Markdown únicos selecionados pelo router.
 * Bloqueia traversal e retorna trechos por relevância, não o acervo inteiro.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeText, sanitizeText } from "./sanitize.mjs";
import { resolveManifestRealPath } from "./router.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const STOP_WORDS = new Set(["teste", "test", "failed", "falha", "erro", "error", "node", "runtime", "arquivo", "mission", "missao"]);

export function extractKeywords(values = []) {
  const tokens = [];
  for (const value of values.flat(Infinity).filter(Boolean)) {
    const normalized = normalizeText(value);
    for (const token of normalized.split(/\s+/)) {
      if (token.length >= 3 && !STOP_WORDS.has(token)) tokens.push(token);
    }
  }
  return [...new Set(tokens)].slice(0, 24);
}

function selectExcerpt(raw, keywords, maxChars) {
  const lines = raw.split(/\r?\n/);
  const indexes = new Set();
  const normalizedKeywords = keywords.map(normalizeText).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const normalizedLine = normalizeText(lines[i]);
    if (normalizedKeywords.some((keyword) => normalizedLine.includes(keyword))) {
      for (let j = Math.max(0, i - 3); j <= Math.min(lines.length - 1, i + 3); j++) indexes.add(j);
      for (let h = i; h >= 0; h--) {
        if (/^#{1,6}\s/.test(lines[h])) {
          indexes.add(h);
          break;
        }
      }
    }
  }

  let selected;
  let mode;
  if (indexes.size) {
    selected = [...indexes].sort((a, b) => a - b).map((index) => lines[index]);
    mode = "KEYWORD_WINDOWS";
  } else {
    selected = lines.slice(0, 80);
    mode = "HEAD_FALLBACK";
  }

  let excerpt = selected.join("\n").trim();
  if (excerpt.length > maxChars) excerpt = `${excerpt.slice(0, maxChars)}\n...[truncado]`;
  return { excerpt, mode };
}

export async function consultarDocumentos(matches = [], keywordValues = [], options = {}) {
  const root = options.root || ROOT;
  const parsedMaxDocs = Number(options.maxDocs);
  const maxDocs = Number.isFinite(parsedMaxDocs) ? Math.max(1, Math.min(Math.trunc(parsedMaxDocs), 3)) : 3;
  const parsedMaxChars = Number(options.maxCharsPerDoc);
  const maxCharsPerDoc = Number.isFinite(parsedMaxChars) ? Math.max(200, Math.min(Math.trunc(parsedMaxChars), 12000)) : 3500;

  if (!Array.isArray(matches) || matches.length === 0) {
    return { documents: [], loaded: 0, requested: 0, errors: [], refused: "NO_MATCH" };
  }

  const unique = [];
  const seenPaths = new Set();
  for (const match of matches) {
    const key = String(match.path || "").replace(/\\/g, "/").toLowerCase();
    if (seenPaths.has(key)) continue;
    seenPaths.add(key);
    unique.push(match);
    if (unique.length >= maxDocs) break;
  }

  const baseKeywords = extractKeywords(keywordValues);
  const documents = [];
  const errors = [];

  for (const match of unique) {
    try {
      const fullPath = await resolveManifestRealPath(root, match.path);
      const raw = await fs.readFile(fullPath, "utf8");
      const keywords = extractKeywords([baseKeywords, match.matchedTriggers || [], match.name, match.id]);
      const { excerpt, mode } = selectExcerpt(raw, keywords, maxCharsPerDoc);
      documents.push({
        id: match.id,
        name: match.name,
        path: match.path,
        score: match.score,
        matchedTriggers: match.matchedTriggers || [],
        chars: excerpt.length,
        selectionMode: mode,
        content: excerpt,
      });
    } catch (error) {
      const detail = { id: match.id, path: match.path, error: sanitizeText(error.message, 300) };
      errors.push(detail);
      documents.push({ ...detail, name: match.name, content: null });
    }
  }

  return {
    documents,
    loaded: documents.filter((document) => typeof document.content === "string" && document.content.length > 0).length,
    requested: unique.length,
    errors,
    refused: errors.length && documents.every((document) => !document.content) ? "ALL_READS_FAILED" : null,
  };
}
