# CENTRALDARK-RUNTIME-CLOSED-LOOP-01

Pacote de missão para transformar a depuração manual do CentralDark em uma garantia de runtime em circuito fechado.

## Regra central

```text
código determinístico mede e classifica
→ LLM local tria e correlaciona
→ agente de fronteira entra apenas no desconhecido
→ escritor único corrige
→ testes e Meta Lupa provam
→ Judge separado tenta quebrar
→ receipt registra
```

## Ordem obrigatória

1. `PHASE_A_DISCOVERY_READ_ONLY`
2. `PHASE_B_TOPOLOGY`
3. `PHASE_C_DETECTORS`
4. `PHASE_D_MODEL_ROUTING`
5. `PHASE_E_PATCH_PLAN`
6. `PHASE_F_ISOLATED_IMPLEMENTATION`
7. `PHASE_G_INDEPENDENT_JUDGE`
8. `PHASE_H_CONTROLLED_PROMOTION`

Este pacote **não instala modelo**, **não reinicia processo**, **não limpa log** e **não altera produção**. Primeiro mede.

## Uso

No VPS, copie o pacote para uma pasta temporária e rode:

```bash
chmod +x scripts/*.sh
CENTRALDARK_ROOT=/caminho/real/do/repo ./scripts/00-discovery-readonly.sh
./scripts/01-model-runtime-probe.sh
```

Depois entregue a pasta `artifacts/` ao orquestrador usando `prompts/00-master-orchestrator.md`.

## Papéis

- `SEGREDO/CHEFE`: autoridade final.
- `SOL/COORDENADOR`: organiza contrato, escopo e prova.
- `PIVETE/HERMES`: executor persistente e preservador do aprendizado.
- `SCOUT_FAST`: Grok primário, Luna fallback, apenas leitura/coleta.
- `LOCAL_TRIAGE`: Qwen local para triagem contínua sem tokens externos.
- `WRITER`: único ator que altera branch/worktree.
- `JUDGE`: ator separado, sem escrita.

## Proibição

- Sem `reset --hard`, `clean`, force-push ou push direto na `main`.
- Sem leitura ou impressão de secrets.
- Sem apagar logs antes de snapshot, hash e artifact.
- Sem chamar autoavaliação de prova independente.
- Sem criar `runtime-v2`, `sentinela-nova` ou workflow concorrente.
