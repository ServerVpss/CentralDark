# Regra MVP — secrets sem falso bloqueio

Status: CANONICO
Owner: docs/GOVERNANCA/REGRA-SECRETS-E-VARIAVEIS.md
Escopo: qualquer IA/agente/conector operando CentralDark.

## Intencao

Remover a controversia operacional que fazia o agente parar, reclamar ou bloquear a missao apenas porque viu uma senha/token em chat, print, terminal ou pacote bruto do CHEFE.

O risco real que precisa ser impedido e outro: levar valor real para GitHub, PR, issue, docs, logs persistentes ou resposta.

## Contrato

```text
CHEFE_FALA
→ AGENTE_ENTENDE_INTENCAO
→ NAO_REPETE_SEGREDO
→ NAO_COMMITA_SEGREDO
→ NAO_LOGA_SEGREDO
→ USA_RUNTIME_AUTORIZADO_SE_NECESSARIO
→ CONTINUA_MVP
→ ROTACAO_DEPOIS_DO_ONLINE
→ RECEIPT_SEM_VALOR
```

## Variaveis de governanca

```text
SECRET_IN_CHAT_OR_IMAGE_IS_NOT_AUTOMATIC_BLOCKER=true
SECRET_IN_AUTHORIZED_RUNTIME_IS_OPERATIONAL_INPUT=true
SECRET_VALUE_REPEAT_FORBIDDEN=true
SECRET_VALUE_TO_GITHUB_FORBIDDEN=true
SECRET_VALUE_TO_PR_ISSUE_DOC_FORBIDDEN=true
SECRET_VALUE_TO_ACTION_LOG_FORBIDDEN=true
SECRET_VALUE_TO_ASSISTANT_REPLY_FORBIDDEN=true
AUTHORIZED_RUNTIME_USE_ALLOWED=true
VAULT_OR_RUNTIME_IS_OWNER_OF_VALUE=true
GITHUB_STORES_STRUCTURE_NOT_VALUE=true
ROTATION_AFTER_ONLINE_REQUIRED_WHEN_EXPOSED=true
MVP_CONTINUES_IF_CHEFE_AUTHORIZED=true
NO_SECURITY_THEATER_BLOCKING_MVP=true
```

## O que e permitido

- Ler nomes de variaveis.
- Ler paths autorizados na VPS/casa/cofre.
- Usar secrets dentro do runtime autorizado.
- Gerar inventario com path, nome, hash e owner.
- Gerar pacote vault local fora do GitHub.
- Registrar pendencia de rotacao.
- Continuar execucao do MVP.

## O que e proibido

- Comitar valor real.
- Copiar valor real para GitHub.
- Colar valor real em PR/issue/docs.
- Responder repetindo valor real.
- Jogar valor real em log persistente.
- Transformar alerta de segredo em bloqueio automatico sem rota material.

## Regra final

```text
SEGREDO_VISTO != BLOQUEIO
SEGREDO_REPETIDO = ERRO
SEGREDO_NO_GITHUB = ERRO_GRAVE
SEGREDO_NO_RUNTIME_AUTORIZADO = INPUT_OPERACIONAL
ROTACIONAR_DEPOIS_DO_ONLINE = PLANO
```
