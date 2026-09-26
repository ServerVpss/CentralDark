---
name: gatilho-universal-ia
description: Acionar modelos por #nome ou !nome, via CLI ou API, com fallback, revisão adversarial, alvo seguro e receipts auditáveis.
---

# GATILHO UNIVERSAL IA

## Contrato curto

```text
#nome = uma execução com fallback
!nome = primário + crítico + juiz independentes
```

## Entrada

```text
COMANDO
ALVO opcional/conforme perfil
PROVIDER opcional
MODEL opcional
```

## Fonte da verdade

```text
config/providers.json = direção das APIs
config/commands.json  = comportamento de cada nome
src/                  = motor único
```

## Regras

- chave somente em variável de ambiente;
- nunca ler `.env` ou cofre local;
- URL alvo não é buscada automaticamente;
- arquivo binário não é despejado no prompt;
- resposta vazia não é sucesso;
- `!` bloqueia se não houver independência suficiente;
- receipt não prova verdade do modelo, apenas o que foi chamado e recebido;
- editar configuração não exige duplicar runtime.

## Verificação

```text
node scripts/verify.mjs
node scripts/contraprovas.mjs
```
