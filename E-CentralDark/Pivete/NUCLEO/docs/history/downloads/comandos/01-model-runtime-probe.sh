#!/usr/bin/env bash
set -euo pipefail
umask 077

TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${OUT_DIR:-artifacts/model-probe-${TS}}"
mkdir -p "$OUT"

have() { command -v "$1" >/dev/null 2>&1; }

RAM_GB="$(awk '/MemTotal/ {printf "%.0f", $2/1024/1024}' /proc/meminfo 2>/dev/null || echo 0)"
VRAM_MB=0
if have nvidia-smi; then
  VRAM_MB="$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits 2>/dev/null \
    | awk '{s+=$1} END{print s+0}')"
fi

RUNTIME="NONE"
have vllm && RUNTIME="vLLM"
have sglang && RUNTIME="${RUNTIME}+SGLang"
have ollama && RUNTIME="${RUNTIME}+Ollama"
have llama-server && RUNTIME="${RUNTIME}+llama.cpp"

MODEL="BLOCKED_HARDWARE_OR_RUNTIME"
ROLE="NONE"

if (( VRAM_MB >= 48000 )); then
  MODEL="Qwen/Qwen3.6-35B-A3B"
  ROLE="LOCAL_TRIAGE_HIGH_CAPACITY"
elif (( VRAM_MB >= 16000 || RAM_GB >= 32 )); then
  MODEL="Qwen/Qwen3.5-9B"
  ROLE="LOCAL_TRIAGE_BALANCED"
elif (( VRAM_MB >= 8000 || RAM_GB >= 16 )); then
  MODEL="Qwen/Qwen3.5-4B"
  ROLE="LOCAL_TRIAGE_LIGHT"
fi

cat > "$OUT/recommendation.json" <<JSON
{
  "schema": "centraldark.model-probe.v1",
  "timestamp": "$(date -u +%FT%TZ)",
  "ram_gb": ${RAM_GB},
  "aggregate_vram_mb": ${VRAM_MB},
  "detected_runtime": "${RUNTIME}",
  "recommended_model": "${MODEL}",
  "recommended_role": "${ROLE}",
  "install_authorized": false,
  "reason": "Recommendation is provisional until runtime compatibility and a local benchmark are proven."
}
JSON

if have ollama; then ollama list > "$OUT/ollama-list.txt" 2>&1 || true; fi
if have nvidia-smi; then nvidia-smi > "$OUT/nvidia-smi.txt" 2>&1 || true; fi
ps -eo pid,ppid,etime,cmd \
  | grep -Ei 'ollama|vllm|sglang|llama[-_ ]?server|lmstudio|qwen' \
  | grep -v grep > "$OUT/model-processes.txt" || true

find "$OUT" -type f -print0 | sort -z | xargs -0 sha256sum > "$OUT/SHA256SUMS"
cat "$OUT/recommendation.json"
