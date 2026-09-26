# COMANDO - lighteval_vllm_uv.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\community-evals\scripts\lighteval_vllm_uv.py
**SHA:** eebf5ac94c121f9f
**Timestamp:** 2026-08-26T18:31:13.917158
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- system_prompt: Optional[str] = None,
- system_prompt: System prompt for chat models
- if system_prompt:
- system_prompt: Optional[str] = None,
- system_prompt: System prompt for chat models
- if system_prompt:
- system_prompt=args.system_prompt,
- system_prompt=args.system_prompt,

### Ouro Bruto (primeiros 5000 chars)
```
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "lighteval[accelerate,vllm]>=0.6.0",
#     "torch>=2.0.0",
#     "transformers>=4.40.0",
#     "accelerate>=0.30.0",
#     "vllm>=0.4.0",
# ]
# ///

"""
Entry point script for running lighteval evaluations with local GPU backends.

This script runs evaluations using vLLM or accelerate on custom HuggingFace models.
It is separate from inference provider scripts and evaluates models directly on local hardware.

Usage (standalone):
    uv run scripts/lighteval_vllm_uv.py --model "meta-llama/Llama-3.2-1B" --tasks "leaderboard|mmlu|5"

"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from typing import Optional


def setup_environment() -> None:
    """Configure environment variables for HuggingFace authentication."""
    hf_token = os.getenv("HF_TOKEN")
    if hf_token:
        os.environ.setdefault("HUGGING_FACE_HUB_TOKEN", hf_token)
        os.environ.setdefault("HF_HUB_TOKEN", hf_token)


def run_lighteval_vllm(
    model_id: str,
    tasks: str,
    output_dir: Optional[str] = None,
    max_samples: Optional[int] = None,
    batch_size: int = 1,
    tensor_parallel_size: int = 1,
    gpu_memory_utilization: float = 0.8,
    dtype: str = "auto",
    trust_remote_code: bool = False,
    use_chat_template: bool = False,
    system_prompt: Optional[str] = None,
) -> None:
    """
    Run lighteval with vLLM backend for efficient GPU inference.

    Args:
        model_id: HuggingFace model ID (e.g., "meta-llama/Llama-3.2-1B")
        tasks: Task specification (e.g., "leaderboard|mmlu|5" or "lighteval|hellaswag|0")
        output_dir: Directory for evaluation results
        max_samples: Limit number of samples per task
        batch_size: Batch size for evaluation
        tensor_parallel_size: Number of GPUs for tensor parallelism
        gpu_memory_utilization: GPU memory fraction to use (0.0-1.0)
        dtype: Data type for model weights (auto, float16, bfloat16)
        trust_remote_code: Allow executing remote code from model repo
        use_chat_template: Apply chat template for conversational models
        system_prompt: System prompt for chat models
    """
    setup_environment()

    # Build lighteval vllm command
    cmd = [
        "lighteval",
        "vllm",
        model_id,
        tasks,
        "--batch-size", str(batch_size),
        "--tensor-parallel-size", str(tensor_parallel_size),
        "--gpu-memory-utilization", str(gpu_memory_utilization),
        "--dtype", dtype,
    ]

    if output_dir:
        cmd.extend(["--output-dir", output_dir])

    if max_samples:
        cmd.extend(["--max-samples", str(max_samples)])

    if trust_remote_code:
        cmd.append("--trust-remote-code")

    if use_chat_template:
        cmd.append("--use-chat-template")

    if system_prompt:
        cmd.extend(["--system-prompt", system_prompt])

    print(f"Running: {' '.join(cmd)}")

    try:
        subprocess.run(cmd, check=True)
        print("Evaluation complete.")
    except subprocess.CalledProcessError as exc:
        print(f"Evaluation failed with exit code {exc.returncode}", file=sys.stderr)
        sys.exit(exc.returncode)


def run_lighteval_accelerate(
    model_id: str,
    tasks: str,
    output_dir: Optional[str] = None,
    max_samples: Optional[int] = None,
    batch_size: int = 1,
    dtype: str = "bfloat16",
    trust_remote_code: bool = False,
    use_chat_template: bool = False,
    system_prompt: Optional[str] = None,
) -> None:
    """
    Run lighteval with accelerate backend for multi-GPU distributed inference.

    Use this backend when vLLM is not available or for models not supported by vLLM.

    Args:
        model_id: HuggingFace model ID
        tasks: Task specification
        output_dir: Directory for evaluation results
        max_samples: Limit number of samples per task
        batch_size: Batch size for evaluation
        dtype: Data type for model weights
        trust_remote_code: Allow executing remote code
        use_chat_template: Apply chat template
        system_prompt: System prompt for chat models
    """
    setup_environment()

    # Build lighteval accelerate command
    cmd = [
        "lighteval",
        "accelerate",
        model_id,
        tasks,
        "--batch-size", str(batch_size),
        "--dtype", dtype,
    ]

    if output_dir:
        cmd.extend(["--output-dir", output_dir])

    if max_samples:
        cmd.extend(["--max-samples", str(max_samples)])

    if trust_remote_code:
        cmd.append("--trust-remote-code")

    if use_chat_template:
        cmd.append("--use-chat-template")

    if system_prompt:
        cmd.extend(["--system-prompt", system_prompt])

    print(f"Running: {' '.join(cmd)}")

    try:
        subprocess.run(cmd, check=True)
        print("Evaluation complete.")
    except subprocess.CalledProcessError as exc:
        print(f"Evaluation failed with exit code {exc.returncode}", file=sys.stder
```