#!/usr/bin/env bash
set -euo pipefail
npm test
node scripts/verify-package.mjs
