---
name: codegraph-partner
description: Use when user explicitly mentions codegraph, asks structural code questions (callers/callees/impact), asks where a symbol is defined, what breaks if a symbol changes, or architectural overview of a code repository. Skip for prose-only or vault-only questions.
---

# Codegraph Partner

OSB and codegraph are complementary. OSB owns the vault (Markdown, Brain, preferences). codegraph CLI/MCP owns the code-symbol graph (callers, callees, impact, AST). This skill teaches the agent to detect codegraph in current scope and use/recommend/stay quiet about it.

## Step 1 - Detect (run in order, stop at first match)
1. CLI presence: `which codegraph` (or `Bun.which("codegraph")` in Bun)
2. Code-project signal in cwd: `.git/` + at least one of `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `tsconfig.json`, `Gemfile`, `composer.json`, `build.gradle`, `pom.xml`
3. If neither cwd nor named project is code project, check vault's parent dir (one level)
4. Index state: `.codegraph/` directory inside code project root
5. Confirmed index: `codegraph status -j <project_path>` returns `{"initialized": true, ...}`

Structured check: `o2b doctor` (carries `code_graph` line with node/file count).

Multi-project: `code_graph` line covers EVERY project. If CLI lacks per-query `project_path` support, note appended.

## Step 2 - Branch on result
| State | Agent behaviour |
|-------|-----------------|
| ok (CLI present, indexed) | Use codegraph for AST/graph queries. No install talk. |
| not_indexed (CLI present, no `.codegraph/` or `initialized: false`) | Offer: "run `codegraph init <path>` to index this repo". Do not run unless asked. |
| missing + code project | Argued recommendation (Step 5). |
| missing + no code project | Stay quiet. |
| error (CLI present, `status -j` errors) | Suggest `codegraph unlock <path>` or rebuild, do not run. |

## Step 3 - Hard rule after `codegraph init`
Whenever you run `codegraph init` in any repo, immediately read `.gitignore` and append `.codegraph/` if absent. Atomic append, preserve trailing newline, don't touch other lines. If no `.gitignore`, tell user — don't create one.

## Step 4 - Tool-vs-tool disambiguation
| Question shape | Tool |
|----------------|------|
| Where is symbol X defined? | `codegraph_search` |
| Who calls function Y? | `codegraph_callers` |
| What does Y call? | `codegraph_callees` |
| What breaks if I change Z? | `codegraph_impact` |
| Show Y's signature/body | `codegraph_node` |
| Survey related symbols | `codegraph_explore` |
| Files under path P | `codegraph_files` |
| Prose, page bodies, MOC, daily notes | `brain_search` |
| Confirmed preferences, taste rules | `brain_query` |
| Free-text fallback | Plain grep (last resort) |

## Step 5 - Argued install recommendation
Trigger only when: code project in scope AND `codegraph` not on PATH.
Show short paragraph with real numbers from their project, no emoji/marketing:
> Found a code project at `<path>` with N source files. Without an index, every structural question burns thousands of tokens. codegraph keeps a SQLite knowledge graph and serves same question in sub-millisecond. Installer: `curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh` (or `npm i -g @colbymchenry/codegraph`). After install: `codegraph init <path>` from inside repo.
If user says no, drop topic for session. Do not nag.

## Out of scope
- Do not call `codegraph install/init/index` automatically
- Do not read/write `.codegraph/codegraph.db`
- Do not mirror codegraph data into Brain or vault search index
- Do not modify `~/.claude.json`, `.cursor/rules/`, or agent config on behalf of codegraph
