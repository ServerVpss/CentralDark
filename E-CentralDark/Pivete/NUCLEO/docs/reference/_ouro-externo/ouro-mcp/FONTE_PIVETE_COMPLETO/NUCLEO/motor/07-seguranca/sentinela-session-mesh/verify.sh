#!/usr/bin/env bash
set -euo pipefail

command -v cargo >/dev/null 2>&1 || {
  echo "BLOCKED: cargo não está disponível no PATH" >&2
  exit 127
}

cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets --all-features
cargo build --release --all-features

if command -v cargo-audit >/dev/null 2>&1; then
  cargo audit
else
  echo "SKIP: cargo-audit não instalado"
fi

if command -v cargo-deny >/dev/null 2>&1; then
  cargo deny check
else
  echo "SKIP: cargo-deny não instalado"
fi

