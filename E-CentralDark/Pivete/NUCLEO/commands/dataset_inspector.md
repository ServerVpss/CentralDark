# COMANDO - dataset_inspector.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\vision-trainer\scripts\dataset_inspector.py
**SHA:** e46216b3818cb5e2
**Timestamp:** 2026-08-26T18:31:13.786295
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- - A prompt: either a bbox prompt or point prompt (in a JSON prompt column, or dedicated columns)
- print(f"\nPrompt:")
- print(f"✓ SAM Segmentation: READY (prompt: {pi['prompt_type']})")

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""
Dataset Format Inspector for Vision Model Training

Inspects Hugging Face datasets to determine compatibility with object detection
and image classification training.
Uses Datasets Server API for instant results - no dataset download needed!

ULTRA-EFFICIENT: Uses HF Datasets Server API - completes in <2 seconds.

Usage with HF Jobs:
    hf_jobs("uv", {
        "script": "path/to/dataset_inspector.py",
        "script_args": ["--dataset", "your/dataset", "--split", "train"]
    })
"""

import argparse
import math
import sys
import json
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Tuple


def parse_args():
    parser = argparse.ArgumentParser(description="Inspect dataset format for vision model training")
    parser.add_argument("--dataset", type=str, required=True, help="Dataset name")
    parser.add_argument("--split", type=str, default="train", help="Dataset split (default: train)")
    parser.add_argument("--config", type=str, default="default", help="Dataset config name (default: default)")
    parser.add_argument("--preview", type=int, default=150, help="Max chars per field preview")
    parser.add_argument("--samples", type=int, default=5, help="Number of samples to fetch (default: 5)")
    parser.add_argument("--json-output", action="store_true", help="Output as JSON")
    return parser.parse_args()


def api_request(url: str) -> Dict:
    """Make API request to Datasets Server"""
    try:
        with urllib.request.urlopen(url, timeout=10) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise Exception(f"API request failed: {e.code} {e.reason}")
    except Exception as e:
        raise Exception(f"API request failed: {str(e)}")


def get_splits(dataset: str) -> Dict:
    """Get available splits for dataset"""
    url = f"https://datasets-server.huggingface.co/splits?dataset={urllib.parse.quote(dataset)}"
    return api_request(url)


def get_rows(dataset: str, config: str, split: str, offset: int = 0, length: int = 5) -> Dict:
    """Get rows from dataset"""
    url = f"https://datasets-server.huggingface.co/rows?dataset={urllib.parse.quote(dataset)}&config={config}&split={split}&offset={offset}&length={length}"
    return api_request(url)


def find_columns(columns: List[str], patterns: List[str]) -> List[str]:
    """Find columns matching patterns"""
    return [c for c in columns if any(p in c.lower() for p in patterns)]


def detect_bbox_format(bbox: List[float], image_size: Tuple[int, int] = None) -> str:
    """
    Detect bounding box format based on values and optionally image dimensions.
    Common formats:
    - [x_min, y_min, x_max, y_max] - XYXY (Pascal VOC)
    - [x_min, y_min, width, height] - XYWH (COCO)
    - [x_center, y_center, width, height] - CXCYWH (YOLO normalized)
    """
    if len(bbox) != 4:
        return "unknown (not 4 values)"

    a, b, c, d = bbox

    is_normalized = all(0 <= v <= 1 for v in bbox)

    if c < a or d < b:
        if is_normalized:
            return "xywh_normalized"
        return "xywh (COCO style)"

    # c > a and d > b — ambiguous between xyxy and xywh.
    # Use image dimensions to disambiguate when available.
    if image_size is not None:
        img_w, img_h = image_size
        # If interpreting as xywh, right edge = a + c; if that overshoots the
        # image while c alone fits, the format is more likely xyxy.
        xywh_exceeds = (a + c > img_w * 1.05) or (b + d > img_h * 1.05)
        xyxy_exceeds = (c > img_w * 1.05) or (d > img_h * 1.05)
        if xywh_exceeds and not xyxy_exceeds:
            return "xyxy (Pascal VOC style)"
        if xyxy_exceeds and not xywh_exceeds:
            return "xywh (COCO style)"

    if is_normalized:
        return "xyxy_normalized"
    return "xyxy (Pascal VOC style)"


def _extract_image_size(row: Dict) -> Tuple[int, int] | None:
    """Try to extract (width, height) from the image column returned by Datasets Server."""
    for col in ("image", "img", "picture", "photo"):
        img = row.get(col)
        if isinstance(img, dict):
            w = img.get("width")
            h = img.get("height")
            if isinstance(w, (int, float)) and isinstance(h, (int, float)):
                return (int(w), int(h))
    return None


def analyze_annotations(sample_rows: List[Dict], annotation_cols: List[str]) -> Dict[str, Any]:
    """Analyze annotation structure from sample rows"""
    if not annotation_cols:
        return {"found": False}

    annotation_col = annotation_cols[0]
    annotations_info = {
        "found": True,
        "column": annotation_col,
        "sample_structures": [],
        "bbox_formats": [],
        "categories_found": [],
        "avg_objects_per_image": 0,
        "max_objects": 0,
        "min_objects": float('inf'),
    }

  
```ompt", "instruction", "question", "input"])
    
    return {
        "ready": has_prompt and has_no_responses,
        "can_map": bool(possible_prompt) and has_no_responses,
        "prompt_col": possible_prompt[0] if possible_prompt else None,
    }


def check_kto_compatibility(columns: List[str]) -> Dict[str, Any]:
    """Check KTO compatibility"""
    return {"ready": "p
```