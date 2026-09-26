#!/usr/bin/env bash
# painel — comando oficial do MultiZap.
# A partir do V2: este wrapper abre /usr/local/bin/multizap-panel-v2.
# Se o V2 não existir, tenta cair no painel antigo pra não deixar o operador sem ferramenta.
set -uo pipefail

if [ -x /usr/local/bin/multizap-panel-v2 ]; then
  exec /usr/local/bin/multizap-panel-v2 "$@"
elif [ -x /root/Multizap/scripts/multizap-panel-v2.sh ]; then
  exec /root/Multizap/scripts/multizap-panel-v2.sh "$@"
elif [ -x /usr/local/bin/multizap-panel ]; then
  echo "⚠ V2 não instalado — abrindo painel antigo como fallback."
  exec /usr/local/bin/multizap-panel "$@"
elif [ -x /root/Multizap/scripts/multizap-panel.sh ]; then
  echo "⚠ V2 não instalado — abrindo painel antigo como fallback."
  exec /root/Multizap/scripts/multizap-panel.sh "$@"
else
  echo "✗ Nenhum painel encontrado."
  echo "  Instale com:"
  echo "    multizap-gh-pull"
  echo "    bash /root/Multizap/scripts/install-panel-v2.sh"
  exit 1
fi
