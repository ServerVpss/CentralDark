#!/usr/bin/env bash
# Build owner: existing Instinto Superior build:vps. No new deploy process.
# Supabase URL and publishable key are intentionally embedded into browser JavaScript.
# Never inject a service_role / sb_secret key into a browser bundle.
set -Eeuo pipefail
if [[ -r /etc/centraldark/instinto-superior-auth-public.env ]]; then
  set -a
  # Trusted, existing root-owned runtime configuration; values are never printed.
  source /etc/centraldark/instinto-superior-auth-public.env
  set +a
fi
export VITE_SUPABASE_URL="${VITE_SUPABASE_URL:-${SUPABASE_URL:-}}"
export VITE_SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_PUBLISHABLE_KEY:-${SUPABASE_PUBLISHABLE_KEY:-}}"
if [[ -z "${VITE_SUPABASE_URL}" || -z "${VITE_SUPABASE_PUBLISHABLE_KEY}" ]]; then
  echo "BUILD_PUBLIC_SUPABASE_CONFIG_MISSING: configure existing approved public env before building" >&2
  exit 62
fi
if [[ "${VITE_SUPABASE_PUBLISHABLE_KEY}" == sb_secret_* || "${VITE_SUPABASE_PUBLISHABLE_KEY}" == *service_role* ]]; then
  echo "BUILD_REJECTED_PRIVATE_SUPABASE_KEY" >&2
  exit 63
fi
export NITRO_PRESET=node-server
./node_modules/.bin/vite build
node scripts/fix-node-ssr-cycle.mjs
node --input-type=module - <<'NODE'
import { readdirSync, readFileSync } from 'node:fs';
const files = readdirSync('.output/public/assets').filter(f => /^index-[A-Za-z0-9_-]+\.js$/.test(f));
if (!files.some(file => {
  const bundle = readFileSync('.output/public/assets/' + file, 'utf8');
  return bundle.includes(process.env.VITE_SUPABASE_URL)
    && bundle.includes(process.env.VITE_SUPABASE_PUBLISHABLE_KEY)
    && !bundle.includes('import.meta.env');
})) {
  console.error('BUILD_PUBLIC_SUPABASE_NOT_INJECTED');
  process.exit(64);
}
console.log('BUILD_PUBLIC_SUPABASE_INJECTED=PASS');
NODE
