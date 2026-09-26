# COMANDO - rank_preview.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\codex-security\scripts\rank_preview.py
**SHA:** f656f43803181458
**Timestamp:** 2026-08-26T18:31:13.698972
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- def javascript_regex_end(text: str, start: int) -> int | None:

### Ouro Bruto (primeiros 5000 chars)
```
"""Build deterministic structural or sampled source previews for rank inputs."""

from __future__ import annotations

import argparse
import ast
import json
import re
from pathlib import Path

DEFAULT_PREVIEW_BYTES = 1024
PREVIEW_HEAD_LINES = 12
PREVIEW_SAMPLE_LINES = 10

TEXT_CODE_EXTENSIONS = {
    ".c",
    ".cc",
    ".cfg",
    ".clj",
    ".cpp",
    ".cs",
    ".css",
    ".cue",
    ".cxx",
    ".dart",
    ".ex",
    ".exs",
    ".go",
    ".graphql",
    ".h",
    ".hpp",
    ".hs",
    ".html",
    ".java",
    ".js",
    ".json",
    ".jsx",
    ".kt",
    ".kts",
    ".lua",
    ".mjs",
    ".mm",
    ".php",
    ".proto",
    ".py",
    ".rb",
    ".rs",
    ".scala",
    ".sh",
    ".sql",
    ".swift",
    ".toml",
    ".ts",
    ".tsx",
    ".vue",
    ".xml",
    ".yaml",
    ".yml",
}

JAVASCRIPT_EXTENSIONS = {".js", ".jsx", ".mjs", ".ts", ".tsx", ".vue"}
JAVA_LIKE_EXTENSIONS = {".c", ".cc", ".cpp", ".cs", ".cxx", ".h", ".hpp", ".java", ".mm"}
BRACE_LANGUAGE_EXTENSIONS = {
    *JAVASCRIPT_EXTENSIONS,
    *JAVA_LIKE_EXTENSIONS,
    ".dart",
    ".go",
    ".kt",
    ".kts",
    ".php",
    ".rs",
    ".scala",
    ".swift",
}
NESTED_BLOCK_COMMENT_EXTENSIONS = {".kt", ".kts", ".rs", ".scala", ".swift"}
RUST_RAW_STRING_RE = re.compile(r'(?:br|r)(#{0,16})"')
RUST_LIFETIME_RE = re.compile(r"'[A-Za-z_][A-Za-z0-9_]*")
PHP_HEREDOC_RE = re.compile(r"<<<\s*['\"]?([A-Za-z_]\w*)['\"]?")


def is_binary_sample(data: bytes) -> bool:
    return b"\0" in data


def compact_preview_line(line: str) -> str:
    return " ".join(line.split())


def truncate_utf8(text: str, max_bytes: int) -> str:
    if max_bytes <= 0:
        return ""
    encoded = text.encode("utf-8")
    if len(encoded) <= max_bytes:
        return text
    return encoded[:max_bytes].decode("utf-8", errors="ignore")


def select_preview_lines(lines: list[str]) -> list[str]:
    compact = [value for line in lines if (value := compact_preview_line(line))]
    head = compact[:PREVIEW_HEAD_LINES]
    remainder = compact[PREVIEW_HEAD_LINES:]
    if len(remainder) <= PREVIEW_SAMPLE_LINES:
        return [*head, *remainder]

    last_index = len(remainder) - 1
    sampled = [
        remainder[index * last_index // (PREVIEW_SAMPLE_LINES - 1)]
        for index in range(PREVIEW_SAMPLE_LINES)
    ]
    return [*head, "...", *sampled]


def fit_preview_lines(lines: list[str], max_bytes: int) -> str:
    if not lines or max_bytes <= 0:
        return ""

    full_preview = "\n".join(lines)
    if len(full_preview.encode("utf-8")) <= max_bytes:
        return full_preview

    def render(line_bytes: int) -> str:
        return "\n".join(
            line if line == "..." else truncate_utf8(line, line_bytes).rstrip() for line in lines
        )

    content_lines = [line for line in lines if line != "..."]
    if not content_lines:
        return truncate_utf8(full_preview, max_bytes)
    low = 0
    high = max(len(line.encode("utf-8")) for line in content_lines)
    best = ""
    while low <= high:
        middle = (low + high) // 2
        candidate = render(middle)
        if len(candidate.encode("utf-8")) <= max_bytes:
            best = candidate
            low = middle + 1
        else:
            high = middle - 1
    if best:
        return best
    return truncate_utf8(full_preview, max_bytes)


def python_decorators(node: ast.FunctionDef | ast.AsyncFunctionDef | ast.ClassDef) -> str:
    values: list[str] = []
    for decorator in node.decorator_list:
        try:
            rendered = compact_preview_line(ast.unparse(decorator))
        except (AttributeError, RecursionError, ValueError):
            continue
        if rendered:
            values.append(f"@{rendered}")
    return " ".join(values)


def python_arguments(node: ast.FunctionDef | ast.AsyncFunctionDef) -> str:
    arguments = [argument.arg for argument in (*node.args.posonlyargs, *node.args.args)]
    if node.args.vararg is not None:
        arguments.append(f"*{node.args.vararg.arg}")
    arguments.extend(argument.arg for argument in node.args.kwonlyargs)
    if node.args.kwarg is not None:
        arguments.append(f"**{node.args.kwarg.arg}")
    return ", ".join(arguments)


def python_outline(text: str) -> list[str]:
    try:
        tree = ast.parse(text)
    except (SyntaxError, ValueError, TypeError, MemoryError):
        return []

    outline: list[str] = []
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            prefix = python_decorators(node)
            kind = "async function" if isinstance(node, ast.AsyncFunctionDef) else "function"
            declaration = f"{kind} {node.name}({python_arguments(node)})"
            outline.append(f"{prefix} {declaration}".strip())
        elif isinstance(node, ast.ClassDef):
            prefix = python_decorators(node)
            bases: list[str] = []
            for base in node.bases:
                try:
                    bases.append(compact_preview_line(ast.unparse(
```