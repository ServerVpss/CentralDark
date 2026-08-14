---
title: "02 PERMISSOES"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-08-14
---

# 02 — Permissões

SEGREDO/CHEFE é a autoridade humana final. Autorização já concedida e ainda dentro do mesmo escopo não deve ser perguntada novamente.

## ✅ PODE fazer sem perguntar dentro do escopo vigente da CentralDark

- Editar arquivos do repo, commitar e fazer push no escopo autorizado.
- Abrir PR quando a mudança exigir isolamento/CI.
- Rodar workflows / GitHub Actions.
- Medir branch, HEAD, PR, runtime, logs, DNS, VPS, providers e tools sem pedir ao SEGREDO/CHEFE que prove estado mensurável pela máquina.
- SSH/VPS e operações de runtime necessárias para colocar/manter a CentralDark viva.
- Build, testes, deploy, redeploy e restart necessários ao componente causal.
- Cloudflare/DNS: ler e alterar records/configuração necessários à CentralDark canônica.
- Contabo/VPS: ler estado, configurar, instalar o necessário e reconstruir a VPS quando isso for o menor caminho seguro.
- Docker/containers da CentralDark quando necessários ao deploy autorizado.
- Reutilizar painel/admin, MCP, Gateway, Builder, WebUI e demais componentes canônicos antes de criar qualquer alternativa.
- Atualizar documentação/instalador quando a mudança material exigir.
- Registrar logs/receipts sanitizados e pendências reais.

## 🔥 AUTORIZAÇÃO PERSISTENTE — PRODUCTION FIRST

Autorização explicitamente concedida por SEGREDO/CHEFE para a missão/organismo CentralDark:

```text
PRODUCTION_FIRST=true
GITHUB_MUTATION=PERMITIDO_QUANDO_CAUSAL
DEPLOY=PERMITIDO
REDEPLOY=PERMITIDO
RESTART=PERMITIDO
CLOUDFLARE_MUTATION=PERMITIDO
DNS_MUTATION=PERMITIDO
CONTABO_MUTATION=PERMITIDO
VPS_MUTATION=PERMITIDO
VPS_CLEAN_REBUILD=PERMITIDO_SE_NECESSARIO
NO_HUMAN_REASK_FOR_ALREADY_GRANTED_SCOPE=true
NO_RETURN_TO_CHEFE_FOR_MACHINE_MEASURABLE_STATE=true
```

Essa autorização não concede carta branca para recurso externo não relacionado, segredo, gasto novo, exclusão irreversível sem mapa ou mudança de intenção de negócio.

## Deploy: menor escopo primeiro

```text
FALHA_LOCAL
→ COMPONENTE_CAUSAL
→ CORRECAO_LOCAL
→ TESTE_LOCAL
→ DEPLOY_LOCAL
→ PROVA_LOCAL
```

Full deploy somente com causa técnica que atravesse fronteiras.

## Convergência

Convergência adversarial total / swarm / Judge independente **não é gate automático de deploy**.

```text
VALIDACAO_MINIMA
= teste aplicável + rollback + logs + prova de runtime + MetaLupa proporcional

CONVERGENCIA_TOTAL
= somente quando SEGREDO/CHEFE solicitar para provar autonomia, arquitetura, robustez ou generalização
```

## ⛔ Continua proibido

- Expor, copiar para chat/log/commit ou publicar valor de token, senha, Authorization, cookie, chave privada ou secret.
- Force-push.
- `git reset --hard` como mecanismo operacional.
- Apagar recurso externo/arquivo necessário sem mapear consumidor e rollback.
- Tratar `UNKNOWN` como PASS.
- Criar V1/V2/V3, segundo painel, segundo orquestrador, segundo cérebro ou memória paralela sem GAP_REAL.
- Inventar que tool, permissão, VPS, provider ou conexão está disponível sem medir.
- Alterar intenção humana, gasto, regra de negócio ou alvo ambíguo como se fosse decisão técnica.

## Ação destrutiva irreversível

Se houver `UNKNOWN` material capaz de destruir recurso necessário:

```text
MAPEAR
→ SNAPSHOT/BACKUP quando tecnicamente disponível
→ PROVAR CAMINHO DE REDEPLOY/ROLLBACK
→ EXECUTAR MENOR AÇÃO
```

Se a ação estiver fora da autorização vigente ou envolver decisão humana nova, aí sim SEGREDO/CHEFE decide.

## Regra de logs

Antes de mostrar/salvar log, sanitizar valores sensíveis. Nunca retornar secret salvo ao painel/chat.

Todo erro relevante deve permitir localizar:

```text
timestamp
correlation/request id quando houver
serviço/componente
ação
status
duração
erro sanitizado
SHA/build/runtime relacionado
```

## Ciclo de trabalho

```text
#ACORDAR
→ recuperar contexto/estado
→ diagnosticar
→ menor correção
→ teste
→ deploy/aplicação no menor escopo
→ validar runtime/log
→ corrigir novamente se necessário
→ registrar
```

Não para na primeira correção e não exige perfeição global antes de tornar o sistema observável.
