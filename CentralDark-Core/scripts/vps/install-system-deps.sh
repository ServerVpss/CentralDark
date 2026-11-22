#!/bin/bash
# Install system dependencies for CentralDark services (ScreenPipe, node modules, etc)
set -e

echo "[DEPS] Installing system dependencies..."

# Update package index
sudo apt-get update -qq 2>/dev/null || true

# Install dependencies
# - build-essential: for npm packages with native bindings
# - python3-dev: for some npm packages
# - libasound2-dev: for ScreenPipe audio support
# - ffmpeg: for ScreenPipe media processing
# - jq: required by the canonical runtime deployment receipts
sudo apt-get install -y --no-install-recommends \
  build-essential \
  python3-dev \
  libasound2-dev \
  ffmpeg \
  jq \
  2>/dev/null || echo "[DEPS] apt-get install completed with warnings (may be expected on some systems)"

echo "[DEPS] System dependencies installed successfully"
