#!/bin/bash
# Carrega wabot.env e exporta com nomes que o CRM espera
source /root/Multizap/secrets/wabot.env 2>/dev/null || true
export SUPABASE_URL
export SUPABASE_PUBLISHABLE_KEY="${VITE_SUPABASE_ANON_KEY}"
export SUPABASE_SERVICE_ROLE_KEY
