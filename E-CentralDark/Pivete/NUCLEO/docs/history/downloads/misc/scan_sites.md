# OUTRO - scan_sites.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\boltz-api-cli\skills\boltz-protein-design\scripts\scan_sites.py
**SHA:** 03d0bfeb2bfe7924
**Timestamp:** 2026-08-26T18:31:49.011231
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- missing = selected - available
- if missing:

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
"""Discover candidate binding sites from a no-site scout run.

For a large target with an unknown site, submit one 100-design run with no
`epitope_residues`, then run this on the downloaded run to see where binders
actually dock. It takes the top designs by binding_confidence, computes each
one's all-atom contact footprint on the target chain, clusters the
footprints by Jaccard overlap, and prints a consensus site (0-based API indices)
per cluster. Feed each consensus site back through crop_radius.py to scout it.

Usage:
    python3 scan_sites.py <run-dir> --target-chain A --binder-chain B \
        --top 20 --cutoff 6 --jaccard 0.25
"""

import argparse
import json
import os
import sys
from collections import Counter

import gemmi
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import atom_coords, indexed_residues  # noqa: E402


def load_records(run_dir):
    idx = os.path.join(run_dir, "results", "index.jsonl")
    if not os.path.exists(idx):
        alt = os.path.join(run_dir, "index.jsonl")
        idx = alt if os.path.exists(alt) else idx
    if not os.path.exists(idx):
        sys.exit(f"error: no results/index.jsonl under {run_dir}")
    recs = []
    with open(idx) as f:
        for line in f:
            line = line.strip()
            if line:
                recs.append(json.loads(line))
    return recs


def _binder_chain_names(model, target_chain, binder_chains=None):
    """Return explicit binder chain names, inferring only an unambiguous single chain."""
    available = {chain.name for chain in model}
    if binder_chains:
        selected = set(binder_chains)
        if target_chain in selected:
            raise ValueError(
                f"target chain '{target_chain}' cannot also be a binder chain"
            )
        missing = selected - available
        if missing:
            raise ValueError(
                f"binder chain(s) {', '.join(sorted(missing))} not found "
                f"(available chains: {', '.join(sorted(available))})"
            )
        return selected

    candidates = available - {target_chain}
    if len(candidates) != 1:
        raise ValueError(
            "binder chains are ambiguous; pass --binder-chain once for each generated binder chain"
        )
    return candidates


def footprint(cif_path, target_chain, cutoff, binder_chains=None):
    """Set of target-chain 0-based API indices contacted by selected binder chains."""
    st = gemmi.read_structure(cif_path)
    st.setup_entities()
    model = st[0]
    tgt = next((c for c in model if c.name == target_chain), None)
    if tgt is None:
        return None
    selected_binder_chains = _binder_chain_names(model, target_chain, binder_chains)
    pairs, _ = indexed_residues(tgt.get_polymer())
    binder = np.array(
        [
            [a.pos.x, a.pos.y, a.pos.z]
            for c in model
            if c.name in selected_binder_chains
            for r in c
            for a in r
        ],
        dtype=float,
    )
    if len(binder) == 0:
        return set()
    site = set()
    for idx, res in pairs:
        ca = atom_coords(res)
        d2 = ((ca[:, None, :] - binder[None, :, :]) ** 2).sum(-1)
        if np.sqrt(d2.min()) < cutoff:
            site.add(idx)
    return site


def jaccard(a, b):
    union = a | b
    return len(a & b) / len(union) if union else 0.0


def cluster_sites(sites, threshold):
    """Return single-linkage components under a strict Jaccard threshold."""
    remaining = set(range(len(sites)))
    clusters = []
    while remaining:
        seed = min(remaining)
        remaining.remove(seed)
        cluster = []
        pending = [seed]
        while pending:
            current = pending.pop()
            cluster.append(current)
            neighbors = {
                other
                for other in remaining
                if jaccard(sites[current], sites[other]) > threshold
            }
            remaining.difference_update(neighbors)
            pending.extend(sorted(neighbors, reverse=True))
        clusters.append(sorted(cluster))
    return sorted(clusters, key=lambda cluster: (-len(cluster), cluster))


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument("run_dir")
    ap.add_argument("--target-chain", default="A")
    ap.add_argument(
        "--binder-chain",
        action="append",
        help=(
            "generated binder chain ID; repeat for a multi-chain binder "
            "(required when more than one non-target chain is present)"
        ),
    )
    ap.add_argument(
        "--top", type=int, default=20, help="top designs by bc (default 20)"
    )
    ap.add_argument(
        "--cutoff",
        type=float,
        default=6.0,
        help="all-atom contact cutoff in angstrom (default 6)",
    )
    ap.add_argument(
        "--jaccard",
        type=float,
        defa
```