# COMANDO - semantic_index.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\infra\mcp\semantic_index.py
**SHA:** b2b77c6c2194f7c2
**Timestamp:** 2026-08-28T02:57:28.768871
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start = 0
- if best_break == -1 or best_break <= start:
- chunk = text[start:end].strip()
- next_start = end - overlap
- if next_start <= start:
- next_start = start + 1  # garante progresso
- start = next_start

### Ouro Bruto (primeiros 5000 chars)
```
"""
semantic_index.py — Índice semântico vetorial para docs/CONSCIENCIA/
CentralDark MCP Server · sem GPU · Python 3.11+ · zero custo em runtime

Modelo: paraphrase-multilingual-MiniLM-L12-v2
  - 384 dims, ~420MB RAM em runtime, ~120MB em disco
  - Suporte nativo PT-BR + EN sem prefixos especiais
  - 14k+ tokens/s em CPU (i5 típico de VPS)

Índice: numpy .npy + JSON de metadados
  - Zero dependências extras além de numpy
  - ~500 arquivos × ~5 chunks × 384 floats32 = ~3.8MB em disco
  - Load completo em < 50ms
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger("semantic_index")

# ──────────────────────────────────────────────────────────────────────────────
# Constantes configuráveis via env
# ──────────────────────────────────────────────────────────────────────────────
MODEL_NAME: str = os.getenv(
    "SEMANTIC_MODEL",
    "paraphrase-multilingual-MiniLM-L12-v2",
)
CONSCIENCIA_DIR: Path = Path(
    os.getenv("CONSCIENCIA_DIR", "docs/CONSCIENCIA")
)
INDEX_DIR: Path = Path(
    os.getenv("SEMANTIC_INDEX_DIR", ".semantic_index")
)
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "800"))
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "100"))

# Caminhos dos arquivos do índice persistido
_EMBEDDINGS_FILE = INDEX_DIR / "embeddings.npy"
_META_FILE = INDEX_DIR / "metadata.json"
_HASHES_FILE = INDEX_DIR / "file_hashes.json"


# ──────────────────────────────────────────────────────────────────────────────
# Estrutura de dados
# ──────────────────────────────────────────────────────────────────────────────
@dataclass
class SearchResult:
    path: str          # caminho relativo ao CONSCIENCIA_DIR
    chunk_index: int   # índice do chunk dentro do arquivo
    score: float       # similaridade cosseno [0, 1]
    text: str          # texto do chunk
    start_char: int    # posição inicial no arquivo original
    end_char: int      # posição final no arquivo original


@dataclass
class _ChunkMeta:
    path: str
    chunk_index: int
    text: str
    start_char: int
    end_char: int


# ──────────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────────
def _file_hash(path: Path) -> str:
    """SHA-1 rápido do conteúdo do arquivo (não criptográfico, só diff)."""
    h = hashlib.sha1(usedforsecurity=False)
    h.update(path.read_bytes())
    return h.hexdigest()


def _chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[tuple[str, int, int]]:
    """
    Divide texto em chunks de `size` chars com `overlap` de sobreposição.
    Retorna lista de (texto_chunk, start, end).
    Tenta quebrar em '\n\n' ou '\n' para não cortar no meio de parágrafo.
    """
    chunks: list[tuple[str, int, int]] = []
    start = 0
    text_len = len(text)

    while start < text_len:
        end = min(start + size, text_len)

        # Tenta recuar até uma quebra de parágrafo para não cortar frases
        if end < text_len:
            # Procura \n\n nos últimos 200 chars do chunk
            best_break = text.rfind("\n\n", start, end)
            if best_break == -1 or best_break <= start:
                best_break = text.rfind("\n", start, end)
            if best_break > start + overlap:
                end = best_break + 1  # inclui o \n

        chunk = text[start:end].strip()
        if chunk:
            chunks.append((chunk, start, end))

        next_start = end - overlap
        if next_start <= start:
            next_start = start + 1  # garante progresso
        start = next_start

    return chunks


def _cosine_similarity_batch(query_vec: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    """
    Similaridade cosseno entre um vetor query e uma matriz de embeddings.
    Ambos já normalizados (norma L2 = 1) → produto escalar = cosseno.
    """
    return matrix @ query_vec  # shape (N,)


# ──────────────────────────────────────────────────────────────────────────────
# Classe principal
# ──────────────────────────────────────────────────────────────────────────────
class SemanticIndex:
    """
    Índice semântico vetorial persistido em disco.

    Lifecycle:
        idx = SemanticIndex()
        idx.load_or_build()          # carrega do disco ou rebuilda tudo
        results = idx.search("como fazer deploy", top_k=5)
        idx.reindex()                # só re-embeda arquivos modificados
    """

    def __init__(
        self,
        consciencia_dir: Path | str = CONSCIENCIA_DIR,
        index_dir: Path | str = INDEX_DIR,
        model_name: str = MODEL_NAME,
        chunk_size: int = CHUNK_SIZE,
        chunk_overlap: int = CHUNK_OVERLAP,
    ) -> None:
        self.consciencia_dir = Path(consciencia_dir).resolve()
        self.index_dir = Path(index_dir)
        self.model_name = model_name
        se
```