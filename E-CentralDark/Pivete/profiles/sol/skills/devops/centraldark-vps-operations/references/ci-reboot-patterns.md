# CI + Reboot Patterns (CentralDark VPS)

## 1. SSH loop para subir runner (quando VPS intermitente)
```bash
for i in $(seq 1 30); do
  out=$(ssh -i ~/.ssh/segredo_vps_ed25519 -o StrictHostKeyChecking=no \
    -o ConnectTimeout=10 -o BatchMode=yes root@89.117.78.124 \
    "systemctl is-active actions.runner.centraldark.service" 2>&1)
  if ! echo "$out" | grep -q "timed out\|Permission"; then
    echo "VPS_UP: $out"
    ssh root@VPS "systemctl restart actions.runner.centraldark.service"
    break
  fi
  sleep 20
done
```
Se 30 timeouts: VPS offline no provider. Não fingir online.

## 2. Reboot via Contabo API (container de execução)
Secrets em env: CONTABO_CLIENT_ID/SECRET/API_USER/PASSWORD + CLOUDFLARE_API_TOKEN
```python
# scripts/vps-reboot-forensic.py (resumido)
token = post("https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token",
             data=auth_data).json()["access_token"]
instances = get("https://api.contabo.com/v1/compute/instances", headers=ct_headers)
target = [i for i in instances["result"] if "central" in i["name"].lower()][0]
post(f"https://api.contabo.com/v1/compute/instances/{target['instanceId']}/actions/reboot",
     headers=ct_headers)
```
MUTATION=1 (reboot). Resto read-only (forense estado).

## 3. CI poll (exit-code, não jq)
```bash
for i in $(seq 1 50); do
  rc=$(gh pr checks $PR >/dev/null 2>&1; echo $?)
  [ "$rc" -eq 0 ] && { echo GREEN; break; }
  [ "$rc" -eq 8 ] && echo PENDING || echo FAIL rc=$rc
  sleep 40
done
```
rc=0 green | rc=8 pending | else fail. Nunca "rodando" = verde.

## 4. Rebase de PR com conflitos recorrentes
Conflito em arquivo já mergeado na main (ex: #1172 absorvido):
```bash
git rebase origin/main
# loop automático:
for i in $(seq 1 40); do
  conflicts=$(git diff --name-only --diff-filter=U)
  [ -z "$conflicts" ] && break
  for f in $conflicts; do git checkout --ours "$f"; git add "$f"; done
  git rebase --continue || break
done
```
Mantém `--ours` (main já tem o ouro). Push --force-with-lease na branch de PR própria.

## 5. Dependabot labels canônicas
`.github/dependabot.yml` (npm + github-actions):
```yaml
    labels:
      - "🤖 AUTO"
      - "🔄 GIT"
      - "👑 PERMITO-SEGREDO"
      - "🧠 AGENTE-HERMES"
      - "✨ MELHORIA"
      - "🤖 IA-EXECUTAR"
```
Sem isso, PR do Dependabot FAILS em label-gate-run.mjs.
