# OUTRO - install.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\physical-ai-infrastructure-setup-and-resilient-scaling\components\inference-nim-operator\scripts\install.sh
**SHA:** 54aa987b3cf0eeb3
**Timestamp:** 2026-08-26T18:42:42.275421
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -
- --dry-run=client -o yaml | kubectl apply -f -
- kubectl create namespace "${NIM_NS}" --dry-run=client -o yaml | kubectl apply -f -
- --dry-run=client -o yaml | kubectl apply -f -
- --dry-run=client -o yaml | kubectl apply -f -
- --dry-run=client -o yaml | kubectl apply -f -

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

# Install NVIDIA NIM Operator via Helm and deploy NIMService instances.
#
# Prerequisites: kubectl configured, helm installed, NGC_API_KEY set
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../../.." && pwd)"
# shellcheck disable=SC1091
[[ -f "${REPO_ROOT}/.env" ]] && set -a && source "${REPO_ROOT}/.env" && set +a

NIM_OPERATOR_VERSION="${NIM_OPERATOR_VERSION:-3.1.0}"
NAMESPACE="${NAMESPACE:-nim-operator}"

# ── Preflight ─────────────────────────────────────────────────────────────────
"${SCRIPT_DIR}/preflight.sh"

# ── 1. Verify GPUs ───────────────────────────────────────────────────────────
PHYSICAL_GPUS=$(kubectl get node -o jsonpath='{.items[0].status.capacity.nvidia\.com/gpu}' 2>/dev/null || echo "0")
echo "==> ${PHYSICAL_GPUS} GPU(s) available on node"

# ── 2. Add Helm repo ─────────────────────────────────────────────────────────
echo "==> Adding nvidia helm repo"
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia --force-update
helm repo update nvidia

# ── 3. Create namespace ──────────────────────────────────────────────────────
echo "==> Creating namespace ${NAMESPACE}"
kubectl create namespace "${NAMESPACE}" --dry-run=client -o yaml | kubectl apply -f -

# ── 4. Create NGC pull secret (if NGC_API_KEY is set) ────────────────────────
if [[ -n "${NGC_API_KEY:-}" ]]; then
  echo "==> Creating nvcr-pull-secret in ${NAMESPACE}"
  kubectl create secret docker-registry nvcr-pull-secret \
    -n "${NAMESPACE}" \
    --docker-server=nvcr.io \
    --docker-username='$oauthtoken' \
    --docker-password="${NGC_API_KEY}" \
    --dry-run=client -o yaml | kubectl apply -f -
else
  echo "WARNING: NGC_API_KEY not set — NIM deployments will fail to pull images"
fi

# ── 5. Install NIM Operator ──────────────────────────────────────────────────
echo "==> Installing NIM Operator ${NIM_OPERATOR_VERSION}"
helm upgrade --install nim-operator nvidia/k8s-nim-operator \
  -n "${NAMESPACE}" \
  --version="${NIM_OPERATOR_VERSION}" \
  --wait --timeout=300s

# ── 6. Deploy NIMService instances ───────────────────────────────────────────
# Each NIM lives in its own directory under nims/<name>/ containing its
# nimservice.yaml and, when pre-staging is needed, pvc.yaml + hf-download-job.yaml.
# install.sh applies the files in a fixed per-NIM order: pvc → job (wait) →
# nimservice.
#
# NIM_SERVICES (optional): space-separated allow-list of NIM directory names
# under nims/. Root SKILL.md computes this from the pipeline spec's capability
# needs. Unset = deploy every nims/*/ directory.
NIMS_DIR="${SCRIPT_DIR}/../nims"

SELECTED_NIMS=()
if [[ -d "${NIMS_DIR}" ]]; then
  for d in "${NIMS_DIR}"/*/; do
    [[ -d "${d}" ]] || continue
    name=$(basename "${d}")
    if [[ -n "${NIM_SERVICES:-}" ]]; then
      for want in ${NIM_SERVICES}; do
        [[ "${want}" == "${name}" ]] && { SELECTED_NIMS+=("${name}"); break; }
      done
    else
      SELECTED_NIMS+=("${name}")
    fi
  done
fi

if [[ -n "${NIM_SERVICES:-}" ]] && [[ ${#SELECTED_NIMS[@]} -eq 0 ]]; then
  echo "ERROR: NIM_SERVICES='${NIM_SERVICES}' matched zero directories under ${NIMS_DIR}"
  exit 1
fi

if [[ ${#SELECTED_NIMS[@]} -gt 0 ]]; then
  echo "==> Deploying NIMs (${#SELECTED_NIMS[@]} selected): ${SELECTED_NIMS[*]}"

  # All NIMs live in the osmo namespace (matches the nimservice.yaml metadata).
  NIM_NS="osmo-nims"
  kubectl create namespace "${NIM_NS}" --dry-run=client -o yaml | kubectl apply -f -
  if [[ -n "${NGC_API_KEY:-}" ]]; then
    kubectl create secret docker-registry nvcr-pull-secret \
      -n "${NIM_NS}" \
      --docker-server=nvcr.io \
      --docker-username='$oauthtoken' \
      --docker-password="${NGC_API_KEY}" \
      --dry-run=client -o yaml | kubectl apply -f -
    kubectl create secret generic ngc-api-secret \
      -n "${NIM_NS}" \
      --from-literal=NGC_API_KEY="${NGC_API_KEY}" \
      --dry-run=client -o yaml | kubectl apply -f -
  fi
  if [[ -n "${HF_TOKEN:-}" ]]; then
    kubectl create secret generic hf-token-secret \
      -n "${NIM_NS}" \
      --from-literal=HF_TOKEN="${HF_TOKEN}" \
      --dry-run=client -o yaml | kubectl apply -f -
  fi

  # PVCs + NIMService storage omit storageClassName so Kubernetes uses the
  # cluster's default StorageClass (MicroK8s: microk8s-hostpath; AKS: default).

  deploy_one_nim() {
    local nim="$1"
    local nim_dir="${NIMS_DIR}/${nim}"
    local svc_yaml="${nim_dir}/nimservice.yaml"
    local job_yaml="${nim_dir}/hf-download-job.yaml"
    local prefix="[${nim}]"

    [[ -f "${svc_yaml}" ]] || { echo "${prefix} ERROR: ${svc_yaml} missing"; return 1; }

    # An hf-download-job.yaml is the authoritative marker for HF-backed NIMs —
    # that's the manifest that references hf-token-secret. Skip the whole NIM
    # when we have no HF_TOKEN to avoid applying a PVC + Job that will wait
   
```