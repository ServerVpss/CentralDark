# OUTRO - finepdfs-stats.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\jobs\scripts\finepdfs-stats.py
**SHA:** f433aa48c2a2225c
**Timestamp:** 2026-08-26T18:31:30.454346
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start = time.perf_counter()

### Ouro Bruto (primeiros 5000 chars)
```
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "polars>=1.31.0",
#     "huggingface-hub",
#     "datasets",
#     "ascii-graph",
# ]
# ///
"""
Analyze educational quality trends across CommonCrawl dumps using Polars streaming.

Answers: "Is the web getting more educational over time?"

Demonstrates Polars HF Hub integration - process 50M+ docs without downloading 300GB+.

Example usage:
    # Analyze English PDFs (default)
    uv run finepdfs-stats.py

    # Analyze all 70+ languages
    uv run finepdfs-stats.py --all-languages

    # Quick test
    uv run finepdfs-stats.py --limit 10000 --show-plan

    # Save results to HF Hub
    uv run finepdfs-stats.py --output-repo username/finepdfs-temporal-stats

    # Run on HF Jobs
    hf jobs uv run \\
        -s HF_TOKEN \\
        -e HF_XET_HIGH_PERFORMANCE=1 \\
        https://huggingface.co/datasets/uv-scripts/dataset-stats/raw/main/finepdfs-stats.py \\
        -- --output-repo username/stats
"""

import argparse
import logging
import os
import sys
import time
from pathlib import Path

import polars as pl
from ascii_graph import Pyasciigraph
from datasets import Dataset
from huggingface_hub import HfApi, create_repo, list_repo_tree, login

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Common language+script codes for finepdfs-edu
COMMON_LANGUAGES = {
    "eng_Latn": "English (Latin script)",
    "fra_Latn": "French (Latin script)",
    "deu_Latn": "German (Latin script)",
    "spa_Latn": "Spanish (Latin script)",
    "por_Latn": "Portuguese (Latin script)",
    "ita_Latn": "Italian (Latin script)",
    "nld_Latn": "Dutch (Latin script)",
    "pol_Latn": "Polish (Latin script)",
    "rus_Cyrl": "Russian (Cyrillic script)",
    "zho_Hans": "Chinese (Simplified)",
    "zho_Hant": "Chinese (Traditional)",
    "jpn_Jpan": "Japanese",
    "kor_Hang": "Korean",
    "ara_Arab": "Arabic",
    "hin_Deva": "Hindi (Devanagari)",
}


def list_available_languages(dataset_id: str) -> list[str]:
    """List available language subsets in the dataset."""
    try:
        tree = list_repo_tree(dataset_id, path_in_repo="data", repo_type="dataset")
        languages = [
            item.path.replace("data/", "")
            for item in tree
            if item.path.startswith("data/")
            and "/" not in item.path.replace("data/", "")
        ]
        return sorted(languages)
    except Exception as e:
        logger.warning(f"Could not list languages: {e}")
        return list(COMMON_LANGUAGES.keys())


def compute_temporal_stats(df: pl.LazyFrame, output_path: Path) -> pl.DataFrame:
    """Single scan: compute stats grouped by dump for temporal analysis."""
    query = df.group_by("dump").agg(
        pl.len().alias("doc_count"),
        pl.col("token_count").sum().alias("total_tokens"),
        pl.col("fw_edu_scores").list.mean().mean().alias("avg_edu_score"),
        (pl.col("fw_edu_scores").list.mean() >= 3).sum().alias("high_edu_count"),
    )
    query.sink_parquet(output_path, engine="streaming")
    return pl.read_parquet(output_path)


def compute_global_stats(temporal: pl.DataFrame) -> pl.DataFrame:
    """Compute global stats from temporal breakdown."""
    total = temporal["doc_count"].sum()
    return pl.DataFrame(
        {
            "total_docs": [total],
            "total_tokens": [temporal["total_tokens"].sum()],
            "avg_edu_score": [
                (temporal["avg_edu_score"] * temporal["doc_count"]).sum() / total
            ],
            "high_edu_rate": [temporal["high_edu_count"].sum() / total],
            "num_dumps": [len(temporal)],
        }
    )


def format_temporal_stats(temporal: pl.DataFrame) -> pl.DataFrame:
    """Format temporal stats with high_edu_rate, sorted chronologically."""
    return (
        temporal.with_columns(
            (pl.col("high_edu_count") / pl.col("doc_count")).alias("high_edu_rate")
        )
        .select(["dump", "doc_count", "avg_edu_score", "high_edu_rate"])
        .sort(
            "dump"
        )  # Chronological order (CC-MAIN-2017-xx comes before CC-MAIN-2024-xx)
    )


def create_ascii_charts(temporal_stats: pl.DataFrame) -> str:
    """Create ASCII bar charts showing temporal trends."""
    # Extract year from dump name (CC-MAIN-2024-42 -> 2024)
    # Group by year and average the values for cleaner display
    yearly = (
        temporal_stats.with_columns(
            pl.col("dump").str.extract(r"CC-MAIN-(\d{4})", 1).alias("year")
        )
        .group_by("year")
        .agg(
            pl.col("doc_count").sum(),
            pl.col("avg_edu_score").mean(),
            pl.col("high_edu_rate").mean(),
        )
        .sort("year")
    )

    lines = []

    # High edu rate chart (more dramatic differences)
    data_rate = [
        (row["year"], row["high_edu_rate"] * 100)
        for row in yearly.iter_rows(named=True)
    ]
    graph = Pyasciigraph(line_length=60, f
```