#!/usr/bin/env python3

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


FENCE_RE = re.compile(r"^```(?P<lang>[A-Za-z0-9_+.-]+)?\s*$")
HEADING_RE = re.compile(r"^(?P<level>#{1,6})\s+(?P<text>.+?)\s*$")
LINK_RE = re.compile(r"\[[^\]]+\]\(([^)]+)\)")


TOOL_KEYWORDS: dict[str, list[str]] = {
    "d3": ["d3.js", "d3"],
    "react": ["react", "jsx", "tsx"],
    "nextjs": ["next.js", "nextjs", "app router", "pages router"],
    "vue": ["vue", "vue.js", "vuejs"],
    "nuxt": ["nuxt", "nuxt.js"],
    "svelte": ["svelte", "sveltekit"],
    "angular": ["angular", "angularjs"],
    "tailwind": ["tailwind", "tailwindcss"],
    "vite": ["vite"],
    "webpack": ["webpack"],
    "eslint": ["eslint"],
    "prettier": ["prettier"],
    "storybook": ["storybook"],
    "vercel": ["vercel"],
    "netlify": ["netlify"],
    "fastapi": ["fastapi"],
    "django": ["django"],
    "flask": ["flask"],
    "express": ["express", "express.js"],
    "nestjs": ["nestjs", "nest.js"],
    "graphql": ["graphql"],
    "grpc": ["grpc"],
    "node": ["node.js", "nodejs"],
    "deno": ["deno"],
    "bun": ["bun"],
    "kubernetes": ["kubernetes", "k8s"],
    "docker": ["docker", "dockerfile", "docker compose"],
    "podman": ["podman"],
    "helm": ["helm"],
    "ansible": ["ansible"],
    "terraform": ["terraform"],
    "pulumi": ["pulumi"],
    "github_actions": ["github actions"],
    "gitlab_ci": ["gitlab ci", "gitlab-ci"],
    "circleci": ["circleci"],
    "jenkins": ["jenkins"],
    "azure_devops": ["azure devops", "azure pipelines"],
    "aws": ["aws", "lambda", "sagemaker"],
    "gcp": ["gcp", "google cloud"],
    "azure": ["azure"],
    "cloudflare": ["cloudflare", "cloudflare workers", "cloudflare r2"],
    "n8n": ["n8n"],
    "mcp": ["model context protocol", "mcp"],
    "vscode": ["vscode", "visual studio code"],
    "langchain": ["langchain"],
    "llamaindex": ["llamaindex", "llama-index"],
    "rag": ["rag", "retrieval-augmented"],
    "openai": ["openai", "chatgpt"],
    "anthropic": ["anthropic"],
    "huggingface": ["hugging face", "huggingface"],
    "transformers": ["transformers"],
    "pytorch": ["pytorch"],
    "tensorflow": ["tensorflow"],
    "scikit_learn": ["scikit-learn", "sklearn"],
    "pinecone": ["pinecone"],
    "qdrant": ["qdrant"],
    "milvus": ["milvus"],
    "weaviate": ["weaviate"],
    "chromadb": ["chromadb", "chroma db"],
    "vector_db": ["vector database", "vector db", "vector store", "vector stores", "embedding store", "embedding stores"],
    "pgvector": ["pgvector"],
    "postgres": ["postgres", "postgresql"],
    "mysql": ["mysql"],
    "sqlite": ["sqlite"],
    "redis": ["redis"],
    "mongodb": ["mongodb", "mongo db"],
    "elasticsearch": ["elasticsearch"],
    "kafka": ["kafka"],
    "rabbitmq": ["rabbitmq"],
    "supabase": ["supabase"],
    "prisma": ["prisma"],
    "pandas": ["pandas"],
    "numpy": ["numpy"],
    "spark": ["spark", "pyspark"],
    "dbt": ["dbt"],
    "airflow": ["airflow"],
    "dagster": ["dagster"],
    "prefect": ["prefect"],
    "jupyter": ["jupyter", "ipynb", "jupyter notebook"],
    "pytest": ["pytest"],
    "jest": ["jest"],
    "vitest": ["vitest"],
    "playwright": ["playwright"],
    "cypress": ["cypress"],
    "selenium": ["selenium"],
    "prometheus": ["prometheus"],
    "grafana": ["grafana"],
    "opentelemetry": ["opentelemetry", "open telemetry", "otel"],
    "sentry": ["sentry"],
    "prompt_engineering": ["prompt engineering"],
    "feature_flags": ["feature flags", "feature flag"],
}


@dataclass(frozen=True)
class RepoInfo:
    owner: str
    name: str
    ref: str

    @property
    def url(self) -> str:
        return f"https://github.com/{self.owner}/{self.name}"


def _utc_now_iso() -> str:
    return dt.datetime.now(dt.UTC).isoformat()


def _safe_read_text(path: Path) -> tuple[str, list[str]]:
    warnings: list[str] = []
    try:
        text = path.read_text(encoding="utf-8")
        return text, warnings
    except UnicodeDecodeError:
        warnings.append("unicode_decode_error_utf8")
        text = path.read_text(encoding="utf-8", errors="replace")
        return text, warnings


def _strip_code_blocks_for_word_count(markdown: str) -> str:
    lines = markdown.splitlines()
    out: list[str] = []
    in_fence = False
    for line in lines:
        if line.strip().startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        out.append(line)
    return "\n".join(out)


def _extract_yaml_frontmatter(markdown: str) -> tuple[dict[str, Any] | None, str | None, list[str]]:
    """Extracts YAML frontmatter if it is the first block.

    We intentionally do NOT depend on PyYAML; instead we parse a small subset:
    - key: value
    - key: [a, b]
    - key:\n  - item\n  - item
    - key: |\n  multiline

    Anything we can't parse becomes raw text in _frontmatter_raw.
    """

    warnings: list[str] = []
    if not markdown.startswith("---\n"):
        return None, None, warnings

    end = markdown.find("\n---\n", 4)
    if end == -1:
        warnings.append("frontmatter_unclosed")
        return None, None, warnings

    raw = markdown[4:end]
    data: dict[str, Any] = {}

    lines = raw.splitlines()
    i = 0
    current_key: str | None = None
    current_list: list[str] | None = None
    current_block: list[str] | None = None

    def flush_pending() -> None:
        nonlocal current_key, current_list, current_block
        if current_key is None:
            return
        if current_block is not None:
            data[current_key] = "\n".join(current_block).rstrip("\n")
        elif current_list is not None:
            data[current_key] = [item for item in current_list if item != ""]
        current_key = None
        current_list = None
        current_block = None

    key_value_re = re.compile(r"^(?P<key>[A-Za-z0-9_-]+):(?P<rest>.*)$")

    try:
        while i < len(lines):
            line = lines[i]
            if line.strip() == "":
                i += 1
                continue

            # list continuation
            if current_key is not None and current_list is not None:
                m_item = re.match(r"^\s*-\s*(.+?)\s*$", line)
                if m_item:
                    current_list.append(m_item.group(1))
                    i += 1
                    continue

            # block continuation
            if current_key is not None and current_block is not None:
                m_block = re.match(r"^\s{2,}(.*)$", line)
                if m_block:
                    current_block.append(m_block.group(1))
                    i += 1
                    continue

            # start new key
            flush_pending()
            m = key_value_re.match(line)
            if not m:
                warnings.append("frontmatter_parse_partial")
                break

            key = m.group("key")
            rest = m.group("rest").strip()
            if rest == "":
                # Either list or nested; we treat as list if next lines are '- '
                current_key = key
                current_list = []
                current_block = None
                i += 1
                continue

            if rest == "|":
                current_key = key
                current_list = None
                current_block = []
                i += 1
                continue

            # inline list
            if rest.startswith("[") and rest.endswith("]"):
                inner = rest[1:-1].strip()
                items = [] if inner == "" else [x.strip() for x in inner.split(",")]
                data[key] = items
                i += 1
                continue

            # scalar value
            data[key] = rest.strip('"')
            i += 1

        flush_pending()
    except Exception:
        warnings.append("frontmatter_parse_error")
        return None, raw, warnings

    if "frontmatter_parse_partial" in warnings:
        return data if data else None, raw, warnings

    return data, raw, warnings


def _parse_filename(filename: str) -> dict[str, Any]:
    """Derive metadata from the collection filename convention.

    Typical pattern:
      owner__repo__claude__skills__...__SKILL.md

    But we handle many variants (no SKILL suffix, different casing, etc.).
    """

    base = filename
    segments = base.split("__")

    owner = segments[0] if len(segments) >= 1 else ""
    repo = segments[1] if len(segments) >= 2 else ""

    # skill key: everything after "__skills__" (or after owner/repo) without extension
    stem = Path(filename).stem
    stem_segments = stem.split("__")

    skill_segments: list[str] = []
    if "skills" in stem_segments:
        idx = stem_segments.index("skills")
        skill_segments = stem_segments[idx + 1 :]
    elif len(stem_segments) > 2:
        skill_segments = stem_segments[2:]

    # drop known tail markers
    if skill_segments:
        tail = skill_segments[-1]
        if tail.lower() in {"skill", "skills", "registry", "helpers", "index"}:
            # keep it; it can be meaningful
            pass

    skill_key = "/".join(skill_segments) if skill_segments else stem

    return {
        "owner": owner,
        "repo": repo,
        "skill_key": skill_key,
        "segments": segments,
    }


def _markdown_title(markdown: str) -> str | None:
    for line in markdown.splitlines():
        m = re.match(r"^#\s+(.+?)\s*$", line)
        if m:
            return m.group(1).strip()
    return None


def _headings(markdown: str, limit: int = 30) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for line in markdown.splitlines():
        m = HEADING_RE.match(line)
        if not m:
            continue
        out.append({"level": len(m.group("level")), "text": m.group("text").strip()})
        if len(out) >= limit:
            break
    return out


def _code_fences(markdown: str) -> tuple[int, list[str]]:
    count = 0
    langs: list[str] = []
    for line in markdown.splitlines():
        m = FENCE_RE.match(line)
        if not m:
            continue
        count += 1
        lang = (m.group("lang") or "").strip().lower()
        if lang:
            langs.append(lang)
    # each code block has 2 fences; approximate blocks as floor(count/2)
    return count // 2, langs


def _links(markdown: str) -> list[str]:
    return [m.group(1) for m in LINK_RE.finditer(markdown)]


def _word_count(markdown: str) -> int:
    text = _strip_code_blocks_for_word_count(markdown)
    # remove most markdown punctuation
    text = re.sub(r"[`*_>#-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return 0
    return len(text.split(" "))


def _detect_tools(markdown: str) -> list[str]:
    haystack = markdown.lower()
    hits: list[str] = []
    for key, needles in TOOL_KEYWORDS.items():
        for needle in needles:
            n = needle.lower()
            if " " in n:
                if n in haystack:
                    hits.append(key)
                    break
                continue

            # For simple tokens (letters/numbers and a few common separators),
            # prefer a boundary-style match to avoid substring false positives.
            if re.fullmatch(r"[a-z0-9_+.-]+", n):
                pattern = rf"(?<![a-z0-9_+.-]){re.escape(n)}(?![a-z0-9_+.-])"
                if re.search(pattern, haystack):
                    hits.append(key)
                    break
                continue

            if n in haystack:
                hits.append(key)
                break
    return sorted(set(hits))


def _extract_excerpt(markdown: str, max_chars: int = 240) -> str:
    # Strip frontmatter block if present
    if markdown.startswith("---\n"):
        end = markdown.find("\n---\n", 4)
        if end != -1:
            markdown = markdown[end + 5 :]

    # Remove code blocks
    markdown = _strip_code_blocks_for_word_count(markdown)

    # Drop headings markup, blockquotes, tables pipes
    cleaned = []
    for line in markdown.splitlines():
        line = re.sub(r"^#{1,6}\s+", "", line)
        line = re.sub(r"^>\s+", "", line)
        if line.strip().startswith("|") and line.strip().endswith("|"):
            continue
        cleaned.append(line)

    text = " ".join([x.strip() for x in cleaned if x.strip()])
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 1] + "…"


def _hash_id(path: str) -> str:
    return hashlib.sha1(path.encode("utf-8")).hexdigest()[:12]


def _parse_github_remote_owner_repo(remote_url: str) -> tuple[str | None, str | None]:
    # Supports https://github.com/owner/repo.git and git@github.com:owner/repo.git
    m = re.search(r"github\.com[:/](?P<owner>[^/]+)/(?P<repo>[^/.]+)(?:\.git)?$", remote_url)
    if not m:
        return None, None
    return m.group("owner"), m.group("repo")


def _get_repo_info_from_env(default_ref: str) -> RepoInfo | None:
    # Best-effort: allow overrides from environment for CI
    owner = os.environ.get("SKILLS_COLLECTION_OWNER")
    name = os.environ.get("SKILLS_COLLECTION_REPO")
    ref = os.environ.get("SKILLS_COLLECTION_REF", default_ref)
    if owner and name:
        return RepoInfo(owner=owner, name=name, ref=ref)
    return None


def _load_index_jsonl(index_path: Path) -> dict[str, dict[str, Any]]:
    if not index_path.exists():
        return {}

    out: dict[str, dict[str, Any]] = {}
    with index_path.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue
            local_path = obj.get("local_path")
            if isinstance(local_path, str):
                out[local_path] = obj
    return out


def _iter_collection_files(collection_dir: Path) -> Iterable[Path]:
    # collection is flat in this repo, but use glob to be safe.
    for path in sorted(collection_dir.glob("*")):
        if path.is_file():
            yield path


def build_analysis(repo: RepoInfo, collection_dir: Path, index_map: dict[str, dict[str, Any]]) -> dict[str, Any]:
    records: list[dict[str, Any]] = []

    counts_by_owner = Counter()
    counts_by_repo = Counter()
    code_lang_counter = Counter()
    tool_counter = Counter()
    word_counts: list[int] = []

    for path in _iter_collection_files(collection_dir):
        rel_path = f"collection/{path.name}"
        filename = path.name
        ext = path.suffix.lower()

        raw, warnings = _safe_read_text(path)

        fm, fm_raw, fm_warnings = _extract_yaml_frontmatter(raw) if ext in {".md", ".markdown"} else (None, None, [])
        warnings.extend(fm_warnings)

        title = _markdown_title(raw) if ext in {".md", ".markdown"} else None

        file_meta = _parse_filename(filename)
        owner_guess = file_meta.get("owner") or ""
        repo_guess = file_meta.get("repo") or ""

        # Prefer frontmatter name/description if available
        fm_name = fm.get("name") if isinstance(fm, dict) else None
        fm_desc = fm.get("description") if isinstance(fm, dict) else None
        fm_tags = fm.get("tags") if isinstance(fm, dict) else None

        tags: list[str] = []
        if isinstance(fm_tags, list):
            tags = [str(x).strip() for x in fm_tags if str(x).strip()]
        elif isinstance(fm_tags, str):
            tags = [x.strip() for x in re.split(r"[,;]", fm_tags) if x.strip()]

        headings = _headings(raw) if ext in {".md", ".markdown"} else []
        code_block_count, code_langs = _code_fences(raw) if ext in {".md", ".markdown"} else (0, [])
        links = _links(raw) if ext in {".md", ".markdown"} else []

        wc = _word_count(raw) if ext in {".md", ".markdown"} else _word_count(raw)
        line_count = raw.count("\n") + 1 if raw else 0
        byte_size = path.stat().st_size
        excerpt = _extract_excerpt(raw) if ext in {".md", ".markdown"} else raw[:240]

        detected_tools = _detect_tools(raw) if ext in {".md", ".markdown"} else _detect_tools(raw)

        # Link targets
        blob_url = f"{repo.url}/blob/{repo.ref}/{rel_path}"
        raw_url = f"https://raw.githubusercontent.com/{repo.owner}/{repo.name}/{repo.ref}/{rel_path}"

        upstream: dict[str, Any] | None = None
        index_key = rel_path
        if index_key in index_map:
            upstream = {
                "repo": index_map[index_key].get("repo"),
                "path": index_map[index_key].get("path"),
                "sha": index_map[index_key].get("sha"),
                "html_url": index_map[index_key].get("html_url"),
                "discovered_at": index_map[index_key].get("discovered_at"),
            }

        heading_preview = " ".join([h["text"] for h in headings[:12]])

        rec_owner = owner_guess
        rec_repo = repo_guess
        counts_by_owner[rec_owner] += 1 if rec_owner else 0
        counts_by_repo[f"{rec_owner}/{rec_repo}" if rec_owner and rec_repo else ""] += 1 if rec_owner and rec_repo else 0

        for lang in code_langs:
            code_lang_counter[lang] += 1

        for tool in detected_tools:
            tool_counter[tool] += 1

        word_counts.append(wc)

        record = {
            "id": _hash_id(rel_path),
            "path": rel_path,
            "filename": filename,
            "ext": ext.lstrip("."),
            "owner": rec_owner,
            "repo": rec_repo,
            "skill_key": file_meta.get("skill_key"),
            "title": title or (str(fm_name) if fm_name else None) or filename,
            "frontmatter": {
                "name": fm_name,
                "description": fm_desc,
                "tags": tags,
                "category": fm.get("category") if isinstance(fm, dict) else None,
                "complexity": fm.get("complexity") if isinstance(fm, dict) else None,
                "status": fm.get("status") if isinstance(fm, dict) else None,
            }
            if isinstance(fm, dict)
            else None,
            "excerpt": excerpt,
            "stats": {
                "bytes": byte_size,
                "lines": line_count,
                "words": wc,
                "headings": len([h for h in headings if h.get("level")]),
                "code_blocks": code_block_count,
                "links": len(links),
            },
            "heading_preview": heading_preview,
            "code_languages": sorted(set(code_langs)),
            "detected_tools": detected_tools,
            "links": {
                "blob": blob_url,
                "raw": raw_url,
                "upstream": upstream,
            },
            "warnings": sorted(set(warnings)),
            "_frontmatter_raw": fm_raw if fm_raw and ("frontmatter_parse_partial" in warnings or "frontmatter_parse_error" in warnings) else None,
        }

        records.append(record)

    def quantiles(values: list[int], qs: list[float]) -> dict[str, int]:
        if not values:
            return {str(q): 0 for q in qs}
        s = sorted(values)
        out: dict[str, int] = {}
        for q in qs:
            idx = int(round((len(s) - 1) * q))
            out[str(q)] = s[idx]
        return out

    agg = {
        "counts": {
            "files": len(records),
            "with_frontmatter": sum(1 for r in records if r.get("frontmatter")),
            "with_tags": sum(1 for r in records if (r.get("frontmatter") or {}).get("tags")),
            "with_code": sum(1 for r in records if (r.get("stats") or {}).get("code_blocks", 0) > 0),
            "with_parse_warnings": sum(1 for r in records if r.get("warnings")),
        },
        "top": {
            "owners": counts_by_owner.most_common(30),
            "repos": [(k, v) for k, v in counts_by_repo.most_common(30) if k],
            "code_languages": code_lang_counter.most_common(30),
            "tools": tool_counter.most_common(30),
        },
        "words": {
            "min": min(word_counts) if word_counts else 0,
            "max": max(word_counts) if word_counts else 0,
            "quantiles": quantiles(word_counts, [0.5, 0.9, 0.95, 0.99]),
        },
    }

    return {
        "generated_at": _utc_now_iso(),
        "repo": {"owner": repo.owner, "name": repo.name, "ref": repo.ref, "url": repo.url},
        "aggregates": agg,
        "records": records,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Analyze collection/ skills and emit JSON for GitHub Pages")
    parser.add_argument("--collection-dir", default="collection", help="Path to collection directory")
    parser.add_argument("--index-jsonl", default="collection/index.jsonl", help="Optional index.jsonl to enrich upstream links")
    parser.add_argument("--out", default="docs/data/analysis.json", help="Output JSON path")
    parser.add_argument("--ref", default=os.environ.get("SKILLS_COLLECTION_REF", "main"), help="Git ref for blob links")
    parser.add_argument("--owner", default=os.environ.get("SKILLS_COLLECTION_OWNER"), help="GitHub owner/org")
    parser.add_argument("--repo", dest="repo_name", default=os.environ.get("SKILLS_COLLECTION_REPO"), help="GitHub repo name")

    args = parser.parse_args()

    root = Path(__file__).resolve().parents[1]
    collection_dir = (root / args.collection_dir).resolve()
    out_path = (root / args.out).resolve()
    index_path = (root / args.index_jsonl).resolve()

    if not collection_dir.exists() or not collection_dir.is_dir():
        raise SystemExit(f"collection dir not found: {collection_dir}")

    # Determine repo owner/name
    repo_info = None
    if args.owner and args.repo_name:
        repo_info = RepoInfo(owner=args.owner, name=args.repo_name, ref=args.ref)
    else:
        # fallback: parse git remote origin
        try:
            import subprocess

            remote = subprocess.check_output(["git", "remote", "get-url", "origin"], cwd=str(root), text=True).strip()
            owner, name = _parse_github_remote_owner_repo(remote)
            if owner and name:
                repo_info = RepoInfo(owner=owner, name=name, ref=args.ref)
        except Exception:
            repo_info = _get_repo_info_from_env(args.ref)

    if not repo_info:
        raise SystemExit(
            "Could not determine GitHub owner/repo. Set SKILLS_COLLECTION_OWNER and SKILLS_COLLECTION_REPO or pass --owner/--repo."
        )

    index_map = _load_index_jsonl(index_path)
    analysis = build_analysis(repo_info, collection_dir, index_map)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(analysis, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Wrote {out_path} ({len(analysis['records'])} records)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
