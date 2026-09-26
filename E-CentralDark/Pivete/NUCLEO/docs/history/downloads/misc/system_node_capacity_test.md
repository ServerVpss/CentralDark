# OUTRO - system_node_capacity_test.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\physical-ai-infrastructure-setup-and-resilient-scaling\components\cluster-azure\scripts\system_node_capacity_test.sh
**SHA:** 180d7175274e073b
**Timestamp:** 2026-08-26T18:45:00.606587
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- local pattern="$2"

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env bash
# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

want="Standard_D16ds_v5"
failures=0

check_file() {
  local file="$1"
  local pattern="$2"
  if ! grep -q "$pattern" "$file"; then
    echo "$file: expected $want system node size" >&2
    failures=$((failures + 1))
  fi
}

check_file "$SCRIPT_DIR/variables.tf" "default[[:space:]]*=[[:space:]]*\"$want\""
check_file "$SCRIPT_DIR/terraform.tfvars.example" "system_vm_size[[:space:]]*=[[:space:]]*\"$want\""
check_file "$SKILL_DIR/terraform/variables.tf" "default[[:space:]]*=[[:space:]]*\"$want\""
check_file "$SKILL_DIR/terraform/terraform.tfvars.example" "system_node_pool_vm_size[[:space:]]*=[[:space:]]*\"$want\""

exit "$failures"

```