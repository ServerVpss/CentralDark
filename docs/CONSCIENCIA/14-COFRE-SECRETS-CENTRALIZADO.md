---
title: "14 COFRE SECRETS CENTRALIZADO"
date: 2026-06-29
tags: ["consciencia"]
updated: 2026-06-29
---

# Cofre Secrets Centralizado

Este documento registra o cofre oficial de secrets do CentralDark.

## Finalidade

O cofre existe para concentrar armazenamento e governança de segredos do projeto em um único ponto oficial:

- `/root/CentralDark/secrets/`

## Contrato global de reuso

```text
GLOBAL_SECRET_REUSE=true
CANONICAL_VAULT=/root/CentralDark/secrets
REPOSITORY_SECRETS=REUSE_ALL_EXISTING_AND_FUTURE
CREATE_NEW_SECRET_ONLY_IF=NO_EQUIVALENT_AFTER_MEASURE
ROOT_SECRETS_ROLE=COMPATIBILITY_INPUT_NOT_SECOND_VAULT
SECRET_VALUES_IN_GIT=FORBIDDEN
SECRET_NAMES_AND_METADATA_IN_LEDGER=ALLOWED
SAME_SECRET_MULTI_CONSUMER_WHEN_CHEFE_INTENT_REQUIRES=true
```

Repository Secrets, ambiente runtime, PM2, systemd e entradas legadas são fontes que devem ser medidas e reconciliadas com este cofre antes de qualquer criação. O mesmo segredo pode alimentar múltiplos consumidores quando isso fizer parte da intenção explícita do CHEFE; isso não cria outro owner.
## O que pode ficar no cofre

- arquivos de ambiente protegidos;
- chaves e credenciais necessárias para operação;
- referências privadas que não devem aparecer em docs públicas;
- artefatos de suporte que só façam sentido em contexto restrito e controlado.

## O que não pode aparecer fora do cofre

- valores reais de `.env`;
- tokens;
- sessões;
- chaves privadas;
- senhas;
- conteúdo sensível de integrações;
- qualquer dado que permita acesso direto a serviços reais.

## Regras de uso

- Toda auditoria sobre secrets deve ser read-only quando possível.
- Toda saída para docs, painel, relatório ou chat deve ser sanitizada.
- Qualquer leitura, migração, edição ou exposição real de segredo exige aprovação humana explícita.
- O cofre não é um local para divulgação, apenas para armazenamento e controle.

## Convenção de arquivos

Cada capability reutiliza primeiro o owner/arquivo existente no cofre. Não criar vários arquivos ou raízes para a mesma capability. Repository Secrets podem ser ligados ao mesmo owner sem duplicar valor em Git. Sempre atualizar/reutilizar o owner existente.

Exemplos (nomes ilustrativos):

- `/root/CentralDark/secrets/mcp.env`
- `/root/CentralDark/secrets/lovable.env`
- `/root/CentralDark/secrets/cloudflare.env`
- `/root/CentralDark/secrets/botserver.env`

## Estado consolidado do Lote 1

- conforme relatório operacional do Lote 1, arquivos `.env` foram movidos para quarentena;
- conforme relatório operacional do Lote 1, itens sensíveis foram preservados;
- conforme relatório operacional do Lote 1, o MCP foi validado com resultado sanitizado e sem erro;
- o script de quarentena foi restaurado e ficou sem diff;
- o Lote 2 permanece fora de escopo por enquanto.

---

## Conexões Rápidas

- [[00-LEIA-PRIMEIRO]] — portão de entrada
- [[MAPA-DO-CEREBRO]] — visão geral
- [[CONSCIENCIA]] — documento mestre
