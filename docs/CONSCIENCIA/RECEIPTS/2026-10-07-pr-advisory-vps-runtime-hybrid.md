# Receipt — IA consultiva híbrida ancorada no runtime VPS

Data: 2026-10-07  
Status: CANDIDATE_UNTIL_CI  
Authority: SEGREDO/CHEFE  
Owner: `.github/workflows/pr-auto-review.yml`  
Base medida: `9bdf7d0abab7ca2acbce9c476a4bfb171228860c`

## Intenção

Fazer a revisão consultiva nascer primeiro do runtime vivo da CentralDark na VPS, sem depender de saldo/disponibilidade do Codex ou de outro provedor remoto.

## Delta

```text
PR_DIFF_SANITIZADO
→ RUNNER_SELF_HOSTED_VPS
→ SNAPSHOT_RUNTIME_VIVO
→ LLAMACPP_LOCAL/HERMES_MODEL
→ ADVISORY_JSON
→ COMMENT_GITHUB

se local indisponível:
→ CENTRALDARK_API_FALLBACK
→ DARKAI_PROVIDER_FALLBACK

gates determinísticos continuam autoridade
IA consultiva não aprova/não bloqueia/não executa código
```

## Runtime que o advisory mede

- host;
- `hermes-gateway.service`;
- MCP local `:9100/health`;
- Hermes `:9900/health`;
- Triton live/ready;
- bridge Kylin;
- modelo local efetivamente exposto pelo llama.cpp.

O token interno do llama.cpp é lido somente do state file local pelo processo do runner root e não é impresso, enviado ao GitHub ou gravado no repo.

## Segurança

- `pull_request_target` continua sem executar código do PR;
- checkout adicionado é somente do `base.sha` confiável;
- diff continua vindo da API e passa pela sanitização existente;
- modelo local recebe apenas texto e nenhum tool binding;
- `contents: read` continua; o job só escreve comentário/issue;
- external provider é fallback, não obrigação.

## Contrato

```text
LOCAL_RUNTIME_FIRST=true
CODEX_REQUIRED=false
REMOTE_MODEL_REQUIRED=false
MODEL_OUTPUT_IS_MERGE_AUTHORITY=false
DETERMINISTIC_GATES_REMAIN_AUTHORITY=true
RUNTIME_STATE_IS_CONTEXT_NOT_PROOF_OF_PR=true
UNKNOWN != PASS
```

## NEXT_CURSOR

Rodar sintaxe/teste do helper no HEAD da branch → abrir PR → CI do HEAD exato → depois do merge disparar um PR controlado e comprovar comentário com `Fonte: vps-local-runtime` + snapshot vivo.
