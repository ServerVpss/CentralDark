# COMANDO - cot-self-instruct.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hugging-face\skills\jobs\scripts\cot-self-instruct.py
**SHA:** 9767d8dde9128f17
**Timestamp:** 2026-08-26T18:31:12.928963
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt = REASONING_PROMPT_TEMPLATE.format(
- prompt = INSTRUCTION_PROMPT_TEMPLATE.format(
- synthetic_prompt = extract_instruction_output(output_text)
- if synthetic_prompt:
- prompt = item.get("prompt", item.get("question", ""))

### Ouro Bruto (primeiros 5000 chars)
```
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "datasets",
#     "transformers",
#     "vllm>=0.6.5",
#     "huggingface-hub[hf_transfer]",
#     "torch",
#     "numpy",
#     "tqdm",
#     "scikit-learn",
# ]
# ///
"""
Generate high-quality synthetic data using Chain-of-Thought Self-Instruct methodology.

This script implements the CoT-Self-Instruct approach from the paper "CoT-Self-Instruct: 
Building high-quality synthetic prompts for reasoning and non-reasoning tasks" (2025).

It supports two modes:
1. Reasoning tasks: Generates both questions and answers with Chain-of-Thought
2. Instruction tasks: Generates diverse prompts for general instruction following

Example usage:
    # Reasoning tasks with Answer-Consistency filtering
    uv run cot-self-instruct.py \\
        --seed-dataset davanstrien/s1k-reasoning \\
        --output-dataset username/synthetic-math \\
        --task-type reasoning \\
        --num-samples 5000 \\
        --filter-method answer-consistency

    # Instruction tasks with RIP filtering
    uv run cot-self-instruct.py \\
        --seed-dataset wildchat-filtered \\
        --output-dataset username/synthetic-prompts \\
        --task-type instruction \\
        --filter-method rip \\
        --reward-model Nexusflow/Athene-RM-8B

    # HF Jobs execution
    hf jobs uv run --flavor l4x4 \\
        --image vllm/vllm-openai \\
        -e HF_TOKEN=$(python3 -c "from huggingface_hub import get_token; print(get_token())") \\
        https://huggingface.co/datasets/uv-scripts/synthetic-data/raw/main/cot-self-instruct.py \\
        [args...]
"""

import argparse
import json
import logging
import os
import random
import re
import sys
from collections import Counter
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union

import numpy as np
import torch
from datasets import Dataset, load_dataset
from huggingface_hub import DatasetCard, login
from sklearn.cluster import KMeans
from tqdm.auto import tqdm
from transformers import AutoTokenizer
from vllm import LLM, SamplingParams

# Enable HF Transfer for faster downloads
os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Prompt templates from the paper
REASONING_PROMPT_TEMPLATE = """You are a reasoning question generator assistant. Your goal is to create a novel, and challenging reasoning question. You are provided the following seed questions:
Seed Question 1: {seed1}
Seed Question 2: {seed2}
Your task is to:
1. Write a brand-new, self-contained reasoning question that meets the following requirements:
(a) The question draws inspiration from the seed question without copying it verbatim, remaining novel and of comparable difficulty.
(b) The question's final answer should be a single, unambiguous scalar value (e.g., an integer, reduced fraction, exact radical), or another answer type that can be verified in one step (e.g., 'yes/no,' a choice from A to D).
2. Then reason step by step, solve the new question and format your output as follows:
[New Question Begin]{{your_generated_question}}[New Question End]
[Final Answer to New Question Begin]\\boxed{{your_final_answer}}[Final Answer to New Question End]"""

INSTRUCTION_PROMPT_TEMPLATE = """You are a prompt generator assistant. Your goal is to create diverse and creative synthetic prompts.
Please follow the steps below to create synthetic prompts.
Step 1: Carefully read #Prompt 1# and #Prompt 2#. Identify and list all the common elements between these two prompts. If no common elements are found, list the main elements from each prompt.
Step 2: Develop a comprehensive plan based on the #Common Elements List# or #Main Elements List# from Step 1. This plan will guide the generation of new synthetic prompts that are similar to the original prompts.
Step 3: Execute the plan step by step and provide one #Synthetic Prompt#.
Please reply strictly in the following format:
- Step 1 #Common Elements List# or #Main Elements List#:
- Step 2 #Plan#:
- Step 3 #Synthetic Prompt#:
#Prompt 1#:
{prompt1}
#Prompt 2#:
{prompt2}"""


def check_gpu_availability() -> int:
    """Check if CUDA is available and return the number of GPUs."""
    if not torch.cuda.is_available():
        logger.error("CUDA is not available. This script requires a GPU.")
        logger.error(
            "Please run on a machine with NVIDIA GPU or use HF Jobs with GPU flavor."
        )
        sys.exit(1)

    num_gpus = torch.cuda.device_count()
    for i in range(num_gpus):
        gpu_name = torch.cuda.get_device_name(i)
        gpu_memory = torch.cuda.get_device_properties(i).total_memory / 1024**3
        logger.info(f"GPU {i}: {gpu_name} with {gpu_memory:.1f} GB memory")

    return num_gpus


def parse_thinking_output(text: str) -> str:
    """Remove thinking tokens from model output."""
    # Remove <think>...</think> blocks
    text = re.sub(r'<thin
```