#!/usr/bin/env bash
# ============================================================
# Puxar cofre de secrets do Lovable que está guardado na VPS.
#
# Quando usar:
#   - Conta Lovable nova/zerada e você quer rehidratar os 4 secrets
#     (VPS_HOST_LOVABLE, VPS_USER_LOVABLE, VPS_SSH_KEY_LOVABLE, GITHUB_PAT_PERFIL).
#
# Pré-requisito (problema do ovo e da galinha):
#   - É preciso ter SSH pra puxar o cofre. Em conta nova zerada, cole
#     a chave SSH no secret VPS_SSH_KEY_LOVABLE UMA vez. Depois disso,
#     este script puxa todo o resto da VPS — incluindo o PAT.
#
# Uso:
#   bash scripts/lovable-agent/pull-vault-from-vps.sh
#
# Saída:
#   - Imprime os 4 valores em formato pronto pra colar nos secrets
#     do Lovable (Workspace Settings > Secrets).
# ============================================================
set -euo pipefail

# Garante ssh disponível e ssh-vps carregado
export PATH="/nix/store/a8q1aypk785ari2q2a3xr0c2agpwkxb2-openssh-10.2p1/bin:$PATH"
source "$(dirname "$0")/setup-vps-ssh.sh"

VAULT_REMOTE="/root/CentralDark/secrets/lovable.env"
VAULT_LOCAL="/tmp/lovable-vault.env"

echo "[cofre] baixando $VAULT_REMOTE da VPS..."
scp-vps "${VPS_USER}@${VPS_HOST}:${VAULT_REMOTE}" "$VAULT_LOCAL"
chmod 600 "$VAULT_LOCAL"

echo
echo "[cofre] valores recuperados (cole nos secrets do Lovable):"
echo "============================================================"

# Imprime cada secret separado, com a chave SSH em bloco
awk '
  /^VPS_SSH_KEY_LOVABLE<<KEY_EOF/ { in_key=1; print "VPS_SSH_KEY_LOVABLE="; next }
  /^KEY_EOF/ { in_key=0; print "---fim da chave---"; next }
  in_key { print; next }
  /^[A-Z_]+=/ { print }
' "$VAULT_LOCAL"

echo "============================================================"
echo
echo "[cofre] feito. Arquivo local em $VAULT_LOCAL (apague depois: rm $VAULT_LOCAL)"

# Aviso se o PAT estiver vazio
if grep -q '^GITHUB_PAT_PERFIL=$' "$VAULT_LOCAL"; then
  echo
  echo "[AVISO] GITHUB_PAT_PERFIL está vazio no cofre."
  echo "        Gere um PAT em https://github.com/settings/tokens?type=beta"
  echo "        e atualize o cofre com:"
  echo "          ssh-vps \"sed -i 's|^GITHUB_PAT_PERFIL=.*|GITHUB_PAT_PERFIL=SEU_TOKEN_AQUI|' $VAULT_REMOTE\""
fi
