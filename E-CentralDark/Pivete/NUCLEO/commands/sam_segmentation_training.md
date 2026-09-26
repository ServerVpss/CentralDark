# COMANDO - sam_segmentation_training.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\vision-trainer\scripts\sam_segmentation_training.py
**SHA:** a9880d7b233dd2e3
**Timestamp:** 2026-08-26T18:31:15.614261
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt = self._extract_prompt(item)
- prompt = [prompt]

### Ouro Bruto (primeiros 5000 chars)
```
# /// script
# dependencies = [
#     "transformers>=5.2.0",
#     "accelerate>=1.1.0",
#     "datasets>=4.0",
#     "torchvision",
#     "monai",
#     "trackio",
#     "huggingface_hub",
# ]
# ///

"""Fine-tune SAM or SAM2 for segmentation using bounding-box or point prompts with the HF Trainer API."""

import json
import logging
import math
import os
import sys
from dataclasses import dataclass, field
from typing import Any

import numpy as np
import torch
import torch.nn.functional as F
from datasets import load_dataset
from torch.utils.data import Dataset

import monai
import trackio

import transformers
from transformers import (
    HfArgumentParser,
    Trainer,
    TrainingArguments,
)
from transformers.utils import check_min_version

logger = logging.getLogger(__name__)

check_min_version("4.57.0.dev0")


# ---------------------------------------------------------------------------
# Dataset wrapper
# ---------------------------------------------------------------------------

class SAMSegmentationDataset(Dataset):
    """Wraps a HF dataset into the format expected by SAM/SAM2 processors.

    Each sample must contain an image, a binary mask, and a prompt (bbox or
    point).  Prompts are read from a JSON-encoded ``prompt`` column or from
    dedicated ``bbox`` / ``point`` columns.
    """

    def __init__(self, dataset, processor, prompt_type: str,
                 image_col: str, mask_col: str, prompt_col: str | None,
                 bbox_col: str | None, point_col: str | None):
        self.dataset = dataset
        self.processor = processor
        self.prompt_type = prompt_type
        self.image_col = image_col
        self.mask_col = mask_col
        self.prompt_col = prompt_col
        self.bbox_col = bbox_col
        self.point_col = point_col

    def __len__(self):
        return len(self.dataset)

    def _extract_prompt(self, item):
        if self.prompt_col and self.prompt_col in item:
            raw = item[self.prompt_col]
            parsed = json.loads(raw) if isinstance(raw, str) else raw
            if self.prompt_type == "bbox":
                return parsed.get("bbox") or parsed.get("box")
            return parsed.get("point") or parsed.get("points")

        if self.prompt_type == "bbox" and self.bbox_col:
            return item[self.bbox_col]
        if self.prompt_type == "point" and self.point_col:
            return item[self.point_col]
        raise ValueError("Could not extract prompt from sample")

    def __getitem__(self, idx):
        item = self.dataset[idx]
        image = item[self.image_col]
        prompt = self._extract_prompt(item)

        if self.prompt_type == "bbox":
            inputs = self.processor(image, input_boxes=[[prompt]], return_tensors="pt")
        else:
            if isinstance(prompt[0], (int, float)):
                prompt = [prompt]
            inputs = self.processor(image, input_points=[[prompt]], return_tensors="pt")

        mask = np.array(item[self.mask_col])
        if mask.ndim == 3:
            mask = mask[:, :, 0]
        inputs["labels"] = (mask > 0).astype(np.float32)
        inputs["original_image_size"] = torch.tensor(image.size[::-1])
        return inputs


def collate_fn(batch):
    pixel_values = torch.cat([item["pixel_values"] for item in batch], dim=0)
    original_sizes = torch.stack([item["original_sizes"] for item in batch])
    original_image_size = torch.stack([item["original_image_size"] for item in batch])

    has_boxes = "input_boxes" in batch[0]
    has_points = "input_points" in batch[0]

    labels = torch.cat(
        [
            F.interpolate(
                torch.as_tensor(x["labels"]).unsqueeze(0).unsqueeze(0).float(),
                size=(256, 256),
                mode="nearest",
            )
            for x in batch
        ],
        dim=0,
    ).long()

    result = {
        "pixel_values": pixel_values,
        "original_sizes": original_sizes,
        "labels": labels,
        "original_image_size": original_image_size,
        "multimask_output": False,
    }

    if has_boxes:
        result["input_boxes"] = torch.cat([item["input_boxes"] for item in batch], dim=0)
    if has_points:
        result["input_points"] = torch.cat([item["input_points"] for item in batch], dim=0)
        if "input_labels" in batch[0]:
            result["input_labels"] = torch.cat([item["input_labels"] for item in batch], dim=0)

    return result


# ---------------------------------------------------------------------------
# Custom loss (SAM/SAM2 don't compute loss in forward())
# ---------------------------------------------------------------------------

seg_loss = monai.losses.DiceCELoss(sigmoid=True, squared_pred=True, reduction="mean")


def compute_loss(outputs, labels, num_items_in_batch=None):
    predicted_masks = outputs.pred_masks.squeeze(1)
    return seg_loss(predicted_masks, labels.float())


# ---------------------------------------------------------------------------
# CLI argument
```