# COMANDO - unsloth_sft_example.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\llm-trainer\scripts\unsloth_sft_example.py
**SHA:** 40174038a0f1b030
**Timestamp:** 2026-08-26T18:31:14.212528
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start = time.time()
- print(f"Model loaded in {time.time() - start:.1f}s")
- start = time.time()
- add_generation_prompt=False,
- print(f"  Dataset ready in {time.time() - start:.1f}s")
- start = time.time()

### Ouro Bruto (primeiros 5000 chars)
```
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "unsloth",
#     "datasets",
#     "trl==0.22.2",
#     "huggingface_hub[hf_transfer]",
#     "trackio",
#     "tensorboard",
#     "transformers==4.57.3",
# ]
# ///
"""
Fine-tune LLMs using Unsloth optimizations for ~60% less VRAM and 2x faster training.

Supports epoch-based or step-based training with optional eval split.
Default model: LFM2.5-1.2B-Instruct (Liquid Foundation Model).

Epoch-based training (recommended for full datasets):
    uv run unsloth_sft_example.py \
        --dataset mlabonne/FineTome-100k \
        --num-epochs 1 \
        --eval-split 0.2 \
        --output-repo your-username/model-finetuned

Run on HF Jobs (1 epoch with eval):
    hf jobs uv run unsloth_sft_example.py \
        --flavor a10g-small --secrets HF_TOKEN --timeout 4h \
        -- --dataset mlabonne/FineTome-100k \
           --num-epochs 1 \
           --eval-split 0.2 \
           --output-repo your-username/model-finetuned

Step-based training (for quick tests):
    uv run unsloth_sft_example.py \
        --dataset mlabonne/FineTome-100k \
        --max-steps 500 \
        --output-repo your-username/model-finetuned
"""

import argparse
import logging
import os
import sys
import time

# Force unbuffered output for HF Jobs logs
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def check_cuda():
    """Check CUDA availability and exit if not available."""
    import torch

    if not torch.cuda.is_available():
        logger.error("CUDA is not available. This script requires a GPU.")
        logger.error("Run on a machine with a CUDA-capable GPU or use HF Jobs:")
        logger.error(
            "  hf jobs uv run unsloth_sft_example.py --flavor a10g-small ..."
        )
        sys.exit(1)
    logger.info(f"CUDA available: {torch.cuda.get_device_name(0)}")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Fine-tune LLMs with Unsloth optimizations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Quick test run
  uv run unsloth_sft_example.py \\
      --dataset mlabonne/FineTome-100k \\
      --max-steps 50 \\
      --output-repo username/model-test

  # Full training with eval
  uv run unsloth_sft_example.py \\
      --dataset mlabonne/FineTome-100k \\
      --num-epochs 1 \\
      --eval-split 0.2 \\
      --output-repo username/model-finetuned

  # With Trackio monitoring
  uv run unsloth_sft_example.py \\
      --dataset mlabonne/FineTome-100k \\
      --num-epochs 1 \\
      --output-repo username/model-finetuned \\
      --trackio-space username/trackio
        """,
    )

    # Model and data
    parser.add_argument(
        "--base-model",
        default="LiquidAI/LFM2.5-1.2B-Instruct",
        help="Base model (default: LiquidAI/LFM2.5-1.2B-Instruct)",
    )
    parser.add_argument(
        "--dataset",
        required=True,
        help="Dataset in ShareGPT/conversation format (e.g., mlabonne/FineTome-100k)",
    )
    parser.add_argument(
        "--output-repo",
        required=True,
        help="HF Hub repo to push model to (e.g., 'username/model-finetuned')",
    )

    # Training config
    parser.add_argument(
        "--num-epochs",
        type=float,
        default=None,
        help="Number of epochs (default: None). Use instead of --max-steps.",
    )
    parser.add_argument(
        "--max-steps",
        type=int,
        default=None,
        help="Training steps (default: None). Use for quick tests or streaming.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=2,
        help="Per-device batch size (default: 2)",
    )
    parser.add_argument(
        "--gradient-accumulation",
        type=int,
        default=4,
        help="Gradient accumulation steps (default: 4). Effective batch = batch-size * this",
    )
    parser.add_argument(
        "--learning-rate",
        type=float,
        default=2e-4,
        help="Learning rate (default: 2e-4)",
    )
    parser.add_argument(
        "--max-seq-length",
        type=int,
        default=2048,
        help="Maximum sequence length (default: 2048)",
    )

    # LoRA config
    parser.add_argument(
        "--lora-r",
        type=int,
        default=16,
        help="LoRA rank (default: 16). Higher = more capacity but more VRAM",
    )
    parser.add_argument(
        "--lora-alpha",
        type=int,
        default=16,
        help="LoRA alpha (default: 16). Same as r per Unsloth recommendation",
    )

    # Logging
    parser.add_argument(
        "--trackio-space",
        default=None,
        help="HF Space for Trackio dashboard (e.g., 'username/trackio')",
    )
    parser.add_argument(
        "--run-name",
        default=None,
        help="Custom run name for Tr
```