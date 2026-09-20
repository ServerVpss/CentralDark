#!/usr/bin/env bash
# Exemplo: classifica gravidade de um erro
echo "$1" | darkai --model google/gemini-2.5-flash-lite \
  --system "responda APENAS: BAIXO, MEDIO, ALTO ou CRITICO" \
  "classifique a gravidade deste erro"
