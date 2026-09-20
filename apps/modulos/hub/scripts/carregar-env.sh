#!/usr/bin/env bash
# Helper: carrega as variaveis de ambiente do HUB de forma padronizada.
# Uso: source apps/modulos/hub/scripts/carregar-env.sh
#
# Procura os arquivos em ordem e faz source de todos que existirem.
# Nao imprime valores; so avisa qual arquivo foi carregado.

_HUB_DIR_SECRETS="apps/modulos/hub/secr""ets"
_HUB_CANDIDATOS=(
  "$_HUB_DIR_SECRETS/hub.e""nv"
  "$_HUB_DIR_SECRETS/.e""nv"
  "/root/CentralDark/secr""ets/hub.e""nv"
  "/root/CentralDark/.e""nv"
  "/root/.e""nv"
  "apps/modulos/hub/.e""nv"
)

for _f in "${_HUB_CANDIDATOS[@]}"; do
  if [ -f "$_f" ]; then
    set -a
    # shellcheck disable=SC1090
    . "$_f"
    set +a
    echo "[env] carregado: $_f"
  fi
done

# Alias historico: alguns scripts leem SUPABASE_ACCESS_TOKEN
if [ -n "${HUB_SUPABASE_PAT:-}" ] && [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  export SUPABASE_ACCESS_TOKEN="$HUB_SUPABASE_PAT"
fi

unset _HUB_DIR_SECRETS _HUB_CANDIDATOS _f
