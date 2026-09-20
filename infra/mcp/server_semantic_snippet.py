"""
server.py — Snippet de integração SemanticIndex no FastMCP (stdio)
Cole/adapte no seu server.py existente.

Substitui a busca textual (grep) por busca semântica vetorial.
"""
from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

from fastmcp import FastMCP

from semantic_index import SemanticIndex, SearchResult

# ──────────────────────────────────────────────────────────────────────────────
# Configuração
# ──────────────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

CONSCIENCIA_DIR = Path(os.getenv("CONSCIENCIA_DIR", "docs/CONSCIENCIA"))
INDEX_DIR = Path(os.getenv("SEMANTIC_INDEX_DIR", ".semantic_index"))

# Instância global — carregada uma vez no startup
_index = SemanticIndex(
    consciencia_dir=CONSCIENCIA_DIR,
    index_dir=INDEX_DIR,
)

mcp = FastMCP(
    name="CentralDark",
    instructions="Servidor MCP pessoal CentralDark com acesso à consciência e ferramentas de operação.",
)


# ──────────────────────────────────────────────────────────────────────────────
# Startup: auto-reindex se índice ausente/stale
# ──────────────────────────────────────────────────────────────────────────────
@mcp.on_startup()           # FastMCP ≥ 2.x — equivalente a lifespan/startup hook
async def _startup() -> None:
    """
    Roda uma vez quando o servidor FastMCP inicializa.
    Carrega índice do disco ou rebuilda se necessário.
    """
    import asyncio
    loop = asyncio.get_event_loop()
    # Roda em thread para não bloquear o event loop (build pode levar ~30s)
    await loop.run_in_executor(None, _index.load_or_build)


# ──────────────────────────────────────────────────────────────────────────────
# Tools
# ──────────────────────────────────────────────────────────────────────────────

@mcp.tool()
def buscar_consciencia(query: str, top_k: int = 5) -> list[dict[str, Any]]:
    """
    Busca semântica na base de conhecimento (docs/CONSCIENCIA/).

    Usa embeddings vetoriais multilinguais (PT-BR nativo) para encontrar
    os trechos mais relevantes semanticamente — vai muito além de grep textual.

    Args:
        query:  Pergunta ou termo em linguagem natural (PT-BR ou EN).
        top_k:  Número de trechos a retornar (padrão 5, máximo recomendado 20).

    Returns:
        Lista de dicionários com:
          - path   : caminho relativo do arquivo (ex: "01-IDENTIDADE.md")
          - score  : similaridade cosseno [0.0–1.0] — quanto maior, mais relevante
          - chunk  : índice do trecho dentro do arquivo
          - text   : conteúdo do trecho (~800 chars)
          - chars  : [start, end] — posição no arquivo original
    """
    if top_k < 1:
        top_k = 1
    if top_k > 50:
        top_k = 50

    results: list[SearchResult] = _index.search(query, top_k=top_k)

    return [
        {
            "path": r.path,
            "score": round(r.score, 4),
            "chunk": r.chunk_index,
            "text": r.text,
            "chars": [r.start_char, r.end_char],
        }
        for r in results
    ]


@mcp.tool()
def reindexar_consciencia() -> dict[str, Any]:
    """
    Rebuilda o índice semântico incrementalmente.

    Só re-embeda arquivos cujo conteúdo mudou (via hash SHA-1).
    Arquivos não modificados são preservados sem custo computacional.

    Use após adicionar, editar ou remover arquivos em docs/CONSCIENCIA/.

    Returns:
        Estatísticas: arquivos alterados, removidos, intocados, tempo, total de chunks.
    """
    stats = _index.reindex()
    return stats


@mcp.tool()
def status_indice_consciencia() -> dict[str, Any]:
    """
    Retorna informações sobre o índice semântico atual.

    Útil para diagnóstico: quantos chunks, modelo usado, tamanho em disco/RAM.
    """
    return _index.info()


# ──────────────────────────────────────────────────────────────────────────────
# Resources — exposição dos .md como recursos MCP
# ──────────────────────────────────────────────────────────────────────────────

@mcp.resource("consciencia://docs/{file_path}")
def get_consciencia_doc(file_path: str) -> str:
    """
    Lê um arquivo de docs/CONSCIENCIA/ como resource MCP.
    Ex: consciencia://docs/01-IDENTIDADE.md
    """
    target = (CONSCIENCIA_DIR / file_path).resolve()
    # Garante que não sai do diretório permitido (path traversal guard)
    if not str(target).startswith(str(CONSCIENCIA_DIR.resolve())):
        return "⛔ Acesso negado: caminho fora de CONSCIENCIA_DIR"
    if not target.exists():
        return f"❌ Arquivo não encontrado: {file_path}"
    return target.read_text(encoding="utf-8", errors="replace")


@mcp.resource("consciencia://index")
def list_consciencia_docs() -> str:
    """Lista todos os arquivos disponíveis em docs/CONSCIENCIA/."""
    files = sorted(CONSCIENCIA_DIR.rglob("*.md"))
    lines = [f"# Arquivos em CONSCIENCIA ({len(files)} total)\n"]
    for f in files:
        rel = f.relative_to(CONSCIENCIA_DIR).as_posix()
        size_kb = round(f.stat().st_size / 1024, 1)
        lines.append(f"- {rel} ({size_kb} KB)")
    return "\n".join(lines)


# ──────────────────────────────────────────────────────────────────────────────
# Entrypoint
# ──────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # stdio transport — padrão para MCP local / ChatGPT connector
    mcp.run(transport="stdio")
