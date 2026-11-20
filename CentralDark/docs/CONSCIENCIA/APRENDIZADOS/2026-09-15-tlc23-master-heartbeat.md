# ⭕ TLC23 Master + Heartbeat — cristalização operacional

Data: 2026-09-15
Branch: `cristal/tlc23-master-fixed-point-20260915`
Base medida após rebase: `origin/main` em `e094880bc0438bc302f31688196ef67fe41dd4b3`
HEAD do PR: `753700f7d4ad9c88b3e2cd12ffcea5c7cd3a10c3`
PR: #1534

## Intenção do CHEFE

Cristalizar `!CENTRALDARK` com a camada metodológica TLC23 integrada ao ciclo mestre existente, sem criar sistema paralelo.
O comando humano continua único, mas o executor passa a abrir o gate Horn, medir destino, executar fases, julgar pela realidade e fechar em ponto fixo.

## Correções que entraram no julgamento

- `TARGET_ARCHITECTURE_DERIVED`, não `ARGET_ARCHITECTURE_DERIVED`.
- `LOCAL_MAIS_NOVO` vira candidato; não ganha autoridade automática.
- `MASTER-CYCLE` é owner do comando e invoca TLC23 internamente.
- `REALITY_JUDGE` vem antes de `FIXED_POINT`; fixed point não aprova a si mesmo.
## Mutação feita

- `MASTER-CYCLE.yml` agora declara `TLC23_OPEN`, `DESTINATION_LOCK`, fases de leitura/reconciliação, `REALITY_JUDGE`, `FIXED_POINT`, `TLC23_CLOSE`, `HANDOFF` e `BOOT`.
- `TRIGGERS.yml` expande `!CENTRALDARK` para a cadeia completa derivada do master.
- `ENGINE_BINDING.yml` preserva extensões obrigatórias e herda a cadeia efetiva sem criar segundo core.
- `centraldark_master_cycle.py` e `centraldark_full_trigger_boot.py` passam a refletir a cadeia completa.
- Testes do trigger fabric foram ajustados para impedir regressão.

## Heartbeat / Pairing

O pairing MCP mantém código curto efêmero e entrega token uma única vez.
Agora também registra validade do token e refresh token por hash, preservando listagem sem expor hash ou segredo.
O objetivo é sustentar `/heartbeat` como batimento único categorizado no painel/admin, sem transformar user_code em segredo permanente.
## Workspace físico

- Casa: `E:\CentralDark` é oficina; `_tmp` descartável; `cache` reconstruível; `worktrees` para missão Git; `C:\CentralDark` é build/preview local do site.
- VPS: mesma taxonomia conceitual, caminhos Linux próprios, runtime/deploy/logs/cache/tmp sem copiar estado da Casa.
- GitHub: código, contrato, testes e receipts promovidos; não cache/lixo.

Regra: `CASA != VPS != GITHUB`, mas todos herdam os mesmos gates e deixam rastro por SHA/ID.

## Provas locais

- `test_centraldark_master_cycle.py`: 16/16 OK.
- `test_centraldark_full_trigger_boot.py`: PASS_TOTAL=8.
- `horn_caracol_gate.py --self-test`: PASS.
- `device-pairing.test.mjs`: 3/3 PASS.
- `node --check apps/modulos/mcp/src/device-pairing.js`: PASS.
- `verify_repo_contract.py .`: PASS.
## Estado final deste receipt

Implementação local e PR: feita.
GitHub PR: aberto e mergeável na criação.
CI remoto: iniciou em fila para HEAD `753700f7d4ad9c88b3e2cd12ffcea5c7cd3a10c3`; enquanto houver job queued/pending, não é verde global.
Deploy/runtime: não declarado como concluído sem prova pós-main.

## Próximo cursor

Aguardar CI do PR #1534 no mesmo HEAD, resolver qualquer failure por menor patch seguro, mergear somente com checks aplicáveis verdes, remedir main, executar micro-deploy do cone afetado e provar `/heartbeat` no painel/admin vivo.
