from __future__ import annotations

# #OBSERVACOES#
# @owner: apps/modulos/fixed-point-fabric/src/centraldark_fixed_point/config.py
# @doc_ref: docs/CONSCIENCIA/RECEIPTS/2026-11-03-branches-891-funil-hud.md
# @last_updated: 2026-11-03T18:16:50.564Z
# @implementado: valida limites críticos da política antes de construir o engine.
# @pendente: CI e revisão source SAME_HEAD; runtime fora do escopo.
# @estado: SOURCE_CORRECTED; STATIC_GATES=PENDING; RUNTIME=NOT_TESTED_BY_SCOPE
# @next_cursor: confrontar gates e review debts de #1381 no PR #1977.

import json
import os
from pathlib import Path
from typing import Any


def _expand(value: Any) -> Any:
    if isinstance(value, str):
        return os.path.expandvars(value)
    if isinstance(value, dict):
        return {k: _expand(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_expand(v) for v in value]
    return value


def _validate_config(config: Any) -> dict[str, Any]:
    if not isinstance(config, dict):
        raise ValueError("config must be a JSON object")
    policy = config.get("policy", {})
    if not isinstance(policy, dict):
        raise ValueError("policy must be an object")
    for domain in ("local", "vps", "github", "screenpipe"):
        if domain in config and not isinstance(config[domain], dict):
            raise ValueError(f"{domain} must be an object")
    if "required_domains" in policy:
        domains = policy["required_domains"]
        if not isinstance(domains, list) or not domains or any(not isinstance(d, str) or not d.strip() for d in domains):
            raise ValueError("required_domains must be a nonempty list of names")
        if len(domains) != len(set(domains)):
            raise ValueError("required_domains must be unique")
    numeric_limits = {
        "required_stable_samples": (2, None, int),
        "max_rounds": (2, None, int),
        "sample_interval_seconds": (1, None, (int, float)),
        "max_observation_age_seconds": (1, None, int),
        "max_open_promotion_prs": (1, 1, int),
    }
    for key, (minimum, maximum, value_type) in numeric_limits.items():
        if key not in policy:
            continue
        value = policy[key]
        if isinstance(value, bool) or not isinstance(value, value_type) or value < minimum or (maximum is not None and value > maximum):
            raise ValueError(f"invalid policy.{key}")
    return config


def load_config(path: str | Path) -> dict[str, Any]:
    with Path(path).open("r", encoding="utf-8") as handle:
        config = json.load(handle)
    return _validate_config(_expand(config))
