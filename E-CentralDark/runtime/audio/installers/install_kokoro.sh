#!/bin/bash
# Instalação Kokoro TTS standalone - só voz, sem tudo o resto
# Pronto em ~5 minutos, ~400MB

set -e

INSTALL_DIR="/c/c"
cd "$INSTALL_DIR"

echo "=== Baixando Kokoro-FastAPI ==="
if [ ! -d "Kokoro-FastAPI" ]; then
    git clone https://github.com/remsky/Kokoro-FastAPI.git
fi

cd Kokoro-FastAPI

echo "=== Subindo container do Kokoro (CPU) ==="
cd docker/cpu
docker compose up -d --build

echo ""
echo "=== Kokoro TTS standalone no ar ==="
echo "API TTS: http://localhost:8880"
echo "Documentação: https://docs.openwebui.com/features/chat-conversations/audio/text-to-speech/Kokoro-FastAPI-integration/"
echo ""
echo "Pronto! Agora você tem só o TTS (voz)."
echo "Teste com curl ou use o endpoint OpenAI-compatible."