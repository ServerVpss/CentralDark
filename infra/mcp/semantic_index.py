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
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        self._model = None                      # carregado lazy
        self._embeddings: np.ndarray | None = None  # (N, 384) float32, L2-norm
        self._meta: list[_ChunkMeta] = []       # len = N
        self._file_hashes: dict[str, str] = {}  # rel_path → sha1

        self.index_dir.mkdir(parents=True, exist_ok=True)

    # ── Modelo ────────────────────────────────────────────────────────────────

    def _get_model(self):
        """Carrega o modelo na primeira chamada (lazy, thread-safe o suficiente para stdio)."""
        if self._model is None:
            logger.info("Carregando modelo de embedding: %s …", self.model_name)
            t0 = time.perf_counter()
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(self.model_name)
            logger.info("Modelo carregado em %.2fs", time.perf_counter() - t0)
        return self._model

    def _embed(self, texts: list[str]) -> np.ndarray:
        """
        Embeda lista de textos → np.ndarray (N, dim) float32, já L2-normalizado.
        batch_size=64 equilibra velocidade vs uso de RAM em CPU.
        """
        model = self._get_model()
        vecs = model.encode(
            texts,
            batch_size=64,
            show_progress_bar=False,
            normalize_embeddings=True,  # L2-norm → cosseno vira produto escalar
            convert_to_numpy=True,
        )
        return vecs.astype(np.float32)

    # ── Descoberta de arquivos ────────────────────────────────────────────────

    def _discover_md_files(self) -> list[Path]:
        """Retorna todos os .md dentro de CONSCIENCIA_DIR, ordenados."""
        return sorted(self.consciencia_dir.rglob("*.md"))

    def _rel(self, path: Path) -> str:
        """Caminho relativo ao CONSCIENCIA_DIR como string posix."""
        return path.relative_to(self.consciencia_dir).as_posix()

    # ── Persistência ──────────────────────────────────────────────────────────

    def _save(self) -> None:
        """Persiste embeddings + metadados + hashes em disco."""
        if self._embeddings is not None:
            np.save(str(_EMBEDDINGS_FILE), self._embeddings)

        meta_raw = [
            {
                "path": m.path,
                "chunk_index": m.chunk_index,
                "text": m.text,
                "start_char": m.start_char,
                "end_char": m.end_char,
            }
            for m in self._meta
        ]
        _META_FILE.write_text(json.dumps(meta_raw, ensure_ascii=False, indent=None), encoding="utf-8")
        _HASHES_FILE.write_text(json.dumps(self._file_hashes, ensure_ascii=False), encoding="utf-8")
        logger.info("Índice salvo: %d chunks em %s", len(self._meta), self.index_dir)

    def _load_from_disk(self) -> bool:
        """
        Tenta carregar índice do disco.
        Retorna True se bem-sucedido e consistente, False caso contrário.
        """
        try:
            if not (_EMBEDDINGS_FILE.exists() and _META_FILE.exists() and _HASHES_FILE.exists()):
                return False

            emb = np.load(str(_EMBEDDINGS_FILE))
            meta_raw: list[dict] = json.loads(_META_FILE.read_text(encoding="utf-8"))
            hashes: dict[str, str] = json.loads(_HASHES_FILE.read_text(encoding="utf-8"))

            if len(emb) != len(meta_raw):
                logger.warning("Índice corrompido (emb %d ≠ meta %d). Rebuild necessário.", len(emb), len(meta_raw))
                return False

            self._embeddings = emb.astype(np.float32)
            self._meta = [_ChunkMeta(**m) for m in meta_raw]
            self._file_hashes = hashes
            logger.info("Índice carregado do disco: %d chunks", len(self._meta))
            return True

        except Exception as exc:
            logger.warning("Falha ao carregar índice: %s", exc)
            return False

    # ── Build completo ─────────────────────────────────────────────────────────

    def build(self) -> None:
        """Rebuilda o índice completo do zero (todos os .md)."""
        logger.info("BUILD completo iniciado em %s …", self.consciencia_dir)
        t0 = time.perf_counter()

        md_files = self._discover_md_files()
        if not md_files:
            logger.warning("Nenhum .md encontrado em %s", self.consciencia_dir)
            return

        all_chunks: list[_ChunkMeta] = []
        all_texts: list[str] = []
        new_hashes: dict[str, str] = {}

        for path in md_files:
            rel = self._rel(path)
            try:
                content = path.read_text(encoding="utf-8", errors="replace")
            except OSError as e:
                logger.warning("Não foi possível ler %s: %s", rel, e)
                continue

            new_hashes[rel] = _file_hash(path)
            chunks = _chunk_text(content, self.chunk_size, self.chunk_overlap)
            for idx, (text, start, end) in enumerate(chunks):
                all_chunks.append(_ChunkMeta(path=rel, chunk_index=idx, text=text, start_char=start, end_char=end))
                all_texts.append(text)

        logger.info("Embedando %d chunks de %d arquivos …", len(all_texts), len(md_files))
        embeddings = self._embed(all_texts)

        self._embeddings = embeddings
        self._meta = all_chunks
        self._file_hashes = new_hashes
        self._save()

        logger.info("BUILD concluído em %.2fs — %d chunks, %d arquivos", time.perf_counter() - t0, len(all_chunks), len(md_files))

    # ── Load ou build ──────────────────────────────────────────────────────────

    def load_or_build(self) -> None:
        """
        Carrega índice do disco se existir e estiver atualizado.
        Se não existir OU houver arquivos novos/modificados desde o último build,
        executa build completo (startup stale-check).
        """
        if not self._load_from_disk():
            logger.info("Índice ausente ou inválido → build completo")
            self.build()
            return

        # Stale check: verifica se algum arquivo mudou ou foi adicionado
        md_files = self._discover_md_files()
        stale = False
        for path in md_files:
            rel = self._rel(path)
            current_hash = _file_hash(path)
            if self._file_hashes.get(rel) != current_hash:
                logger.info("Arquivo modificado/novo detectado: %s → rebuild incremental", rel)
                stale = True
                break

        # Verifica também arquivos removidos
        if not stale:
            disk_rels = {self._rel(p) for p in md_files}
            for rel in list(self._file_hashes.keys()):
                if rel not in disk_rels:
                    logger.info("Arquivo removido detectado: %s → rebuild incremental", rel)
                    stale = True
                    break

        if stale:
            self.reindex()

    # ── Reindex incremental ────────────────────────────────────────────────────

    def reindex(self) -> dict[str, Any]:
        """
        Rebuild incremental: só re-embeda arquivos cujo hash mudou.
        Preserva embeddings dos arquivos não modificados.
        Retorna dict com estatísticas da operação.
        """
        logger.info("REINDEX incremental iniciado …")
        t0 = time.perf_counter()

        md_files = self._discover_md_files()
        current_rels = {self._rel(p): p for p in md_files}
        new_hashes: dict[str, str] = {}

        # Identifica quais arquivos mudaram / foram adicionados / removidos
        changed: list[str] = []
        removed: list[str] = []

        for rel, path in current_rels.items():
            h = _file_hash(path)
            new_hashes[rel] = h
            if self._file_hashes.get(rel) != h:
                changed.append(rel)

        for rel in self._file_hashes:
            if rel not in current_rels:
                removed.append(rel)

        stats = {"changed": len(changed), "removed": len(removed), "unchanged": len(md_files) - len(changed)}

        if not changed and not removed:
            logger.info("Nenhuma mudança detectada — índice já atualizado.")
            return {**stats, "elapsed_s": 0.0}

        # Remove chunks dos arquivos removidos/alterados
        keep_mask = [
            m.path not in changed and m.path not in removed
            for m in self._meta
        ]
        kept_meta = [m for m, k in zip(self._meta, keep_mask) if k]
        kept_emb = (
            self._embeddings[np.array(keep_mask, dtype=bool)]
            if self._embeddings is not None and len(self._embeddings) > 0
            else np.empty((0, 384), dtype=np.float32)
        )

        # Embeda arquivos novos/modificados
        new_chunks: list[_ChunkMeta] = []
        new_texts: list[str] = []

        for rel in changed:
            path = current_rels[rel]
            try:
                content = path.read_text(encoding="utf-8", errors="replace")
            except OSError as e:
                logger.warning("Não foi possível ler %s: %s", rel, e)
                continue
            chunks = _chunk_text(content, self.chunk_size, self.chunk_overlap)
            for idx, (text, start, end) in enumerate(chunks):
                new_chunks.append(_ChunkMeta(path=rel, chunk_index=idx, text=text, start_char=start, end_char=end))
                new_texts.append(text)

        if new_texts:
            logger.info("Re-embedando %d chunks de %d arquivos alterados …", len(new_texts), len(changed))
            new_emb = self._embed(new_texts)
        else:
            new_emb = np.empty((0, kept_emb.shape[1] if kept_emb.ndim == 2 else 384), dtype=np.float32)

        # Monta novo índice
        if len(kept_emb) > 0 and len(new_emb) > 0:
            self._embeddings = np.vstack([kept_emb, new_emb]).astype(np.float32)
        elif len(kept_emb) > 0:
            self._embeddings = kept_emb
        elif len(new_emb) > 0:
            self._embeddings = new_emb
        else:
            self._embeddings = np.empty((0, 384), dtype=np.float32)

        self._meta = kept_meta + new_chunks
        self._file_hashes = new_hashes
        self._save()

        elapsed = time.perf_counter() - t0
        stats["elapsed_s"] = round(elapsed, 3)
        stats["total_chunks"] = len(self._meta)
        logger.info(
            "REINDEX concluído em %.2fs — +%d alterados, -%d removidos, %d intocados, %d chunks total",
            elapsed, len(changed), len(removed), stats["unchanged"], len(self._meta),
        )
        return stats

    # ── Busca ─────────────────────────────────────────────────────────────────

    def search(self, query: str, top_k: int = 5) -> list[SearchResult]:
        """
        Busca semântica: retorna os `top_k` chunks mais relevantes para `query`.
        Latência típica: 5–30ms em CPU (após modelo carregado).

        Args:
            query:  Texto livre em PT-BR ou EN.
            top_k:  Número de resultados. Máximo recomendado: 20.

        Returns:
            Lista de SearchResult ordenada por score decrescente.
        """
        if self._embeddings is None or len(self._embeddings) == 0:
            logger.warning("Índice vazio — execute load_or_build() primeiro.")
            return []

        t0 = time.perf_counter()

        # Embeda a query (normalizada = 1 vetor)
        q_vec = self._embed([query])[0]  # shape (384,)

        # Produto escalar = cosseno (já normalizados)
        scores = _cosine_similarity_batch(q_vec, self._embeddings)  # (N,)

        # top_k via argpartition (O(N) mais rápido que argsort completo)
        k = min(top_k, len(scores))
        top_indices = np.argpartition(scores, -k)[-k:]
        top_indices = top_indices[np.argsort(scores[top_indices])[::-1]]

        results = []
        for idx in top_indices:
            meta = self._meta[idx]
            results.append(
                SearchResult(
                    path=meta.path,
                    chunk_index=meta.chunk_index,
                    score=float(scores[idx]),
                    text=meta.text,
                    start_char=meta.start_char,
                    end_char=meta.end_char,
                )
            )

        elapsed_ms = (time.perf_counter() - t0) * 1000
        logger.debug("search(%r, top_k=%d) → %.1fms", query, top_k, elapsed_ms)
        return results

    # ── Info / diagnóstico ────────────────────────────────────────────────────

    def info(self) -> dict[str, Any]:
        """Retorna estatísticas do índice atual."""
        n_chunks = len(self._meta) if self._meta else 0
        n_files = len(self._file_hashes) if self._file_hashes else 0
        emb_shape = list(self._embeddings.shape) if self._embeddings is not None else []
        disk_mb = 0.0
        if _EMBEDDINGS_FILE.exists():
            disk_mb = round(_EMBEDDINGS_FILE.stat().st_size / 1024 / 1024, 2)
        ram_mb = round(self._embeddings.nbytes / 1024 / 1024, 2) if self._embeddings is not None else 0.0
        return {
            "model": self.model_name,
            "n_chunks": n_chunks,
            "n_files": n_files,
            "embedding_shape": emb_shape,
            "chunk_size": self.chunk_size,
            "chunk_overlap": self.chunk_overlap,
            "index_dir": str(self.index_dir),
            "consciencia_dir": str(self.consciencia_dir),
            "disk_embeddings_mb": disk_mb,
            "ram_embeddings_mb": ram_mb,
            "index_exists": _EMBEDDINGS_FILE.exists(),
        }
