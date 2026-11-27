#!/usr/bin/env python3
"""Evidence-first benchmark/calibration for the canonical semantic core.

No threshold is hard-coded. Candidate thresholds are derived from observed GloVe
scores on an explicit SAME_INTENT / DIFFERENT_INTENT / AMBIGUOUS dataset.
AMBIGUOUS rows are never auto-merged and are excluded from the classification
denominator; they are reported separately.
"""
from __future__ import annotations

import argparse
import json
import time
import unicodedata
from pathlib import Path
from typing import Any

from semantic_core import GloveSemanticCore, MODEL_ID

LABELS = {"SAME_INTENT", "DIFFERENT_INTENT", "AMBIGUOUS"}


def normalize_exact(value: str) -> str:
    return " ".join(unicodedata.normalize("NFC", value).casefold().split())


def metrics(rows: list[dict[str, Any]], predictor) -> dict[str, Any]:
    tp = fp = tn = fn = 0
    for row in rows:
        if row["label"] == "AMBIGUOUS":
            continue
        predicted_same = bool(predictor(row))
        actual_same = row["label"] == "SAME_INTENT"
        if predicted_same and actual_same:
            tp += 1
        elif predicted_same and not actual_same:
            fp += 1
        elif not predicted_same and actual_same:
            fn += 1
        else:
            tn += 1
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    total_diff = fp + tn
    total_same = tp + fn
    return {
        "tp": tp, "fp": fp, "tn": tn, "fn": fn,
        "precision": round(precision, 6),
        "recall": round(recall, 6),
        "f1": round(f1, 6),
        "false_merge_rate": round(fp / total_diff, 6) if total_diff else 0.0,
        "false_split_rate": round(fn / total_same, 6) if total_same else 0.0,
    }


def load_dataset(path: Path) -> list[dict[str, Any]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, list) or not payload:
        raise ValueError("DATASET_INVALID")
    rows: list[dict[str, Any]] = []
    for index, item in enumerate(payload):
        if not isinstance(item, dict):
            raise ValueError(f"DATASET_ROW_INVALID:{index}")
        left = str(item.get("left") or "").strip()
        right = str(item.get("right") or "").strip()
        label = str(item.get("label") or "").upper()
        if not left or not right or label not in LABELS:
            raise ValueError(f"DATASET_ROW_INVALID:{index}")
        rows.append({"left": left, "right": right, "label": label})
    return rows


def threshold_candidates(scored: list[dict[str, Any]]) -> list[float]:
    values = sorted({float(row["score"]) for row in scored if row["score"] is not None})
    if not values:
        return []
    points = [values[0] - 1e-9, values[-1] + 1e-9]
    points.extend((a + b) / 2 for a, b in zip(values, values[1:]))
    return sorted(set(points))


def choose_threshold(scored: list[dict[str, Any]]) -> tuple[float | None, dict[str, Any] | None]:
    candidates = threshold_candidates(scored)
    if not candidates:
        return None, None
    ranked = []
    for threshold in candidates:
        m = metrics(scored, lambda row, t=threshold: row["score"] is not None and row["score"] >= t)
        ranked.append((m["false_merge_rate"], -m["f1"], -m["recall"], threshold, m))
    ranked.sort(key=lambda item: (item[0], item[1], item[2], item[3]))
    _, _, _, threshold, m = ranked[0]
    return threshold, m


def run(dataset: Path, model_home: str | None = None) -> dict[str, Any]:
    rows = load_dataset(dataset)
    baseline = metrics(rows, lambda row: normalize_exact(row["left"]) == normalize_exact(row["right"]))
    core = GloveSemanticCore(model_home).load()
    started = time.perf_counter()
    scored = []
    for row in rows:
        similarity = core.similarity(row["left"], row["right"])
        scored.append({**row, "score": similarity["score"], "oov": similarity["oov"]})
    latency_ms = (time.perf_counter() - started) * 1000
    threshold, after = choose_threshold(scored)
    ambiguous = [row for row in scored if row["label"] == "AMBIGUOUS"]
    return {
        "model_id": MODEL_ID,
        "dataset": str(dataset),
        "dataset_rows": len(rows),
        "applicable_denominator": sum(row["label"] != "AMBIGUOUS" for row in rows),
        "ambiguous_rows": len(ambiguous),
        "baseline": baseline,
        "after": after,
        "threshold": threshold,
        "threshold_source": "MEASURED_FROM_DATASET" if threshold is not None else "UNPROVEN",
        "ambiguous_auto_merge": False,
        "scores": scored,
        "latency_total_ms": round(latency_ms, 3),
        "latency_per_pair_ms": round(latency_ms / len(rows), 3),
        "llm_call_delta": None,
        "token_delta": None,
        "final_result_quality": "UNPROVEN_OUTSIDE_THIS_BENCHMARK",
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", default=str(Path(__file__).with_name("tests") / "semantic_intent_dataset.json"))
    parser.add_argument("--model-home", default=None)
    ns = parser.parse_args()
    print(json.dumps(run(Path(ns.dataset), ns.model_home), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
