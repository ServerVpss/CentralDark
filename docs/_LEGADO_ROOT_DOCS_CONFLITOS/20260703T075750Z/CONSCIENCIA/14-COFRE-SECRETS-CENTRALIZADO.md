# Cofre Secrets Centralizado

Este documento registra o cofre oficial de secrets do CentralDark.

## Finalidade

O cofre existe para concentrar armazenamento e governança de segredos do projeto em um único ponto oficial:

- `/root/CentralDark/secrets/`

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

Cada integração deve ter um arquivo próprio no cofre.
Não criar vários arquivos para a mesma integração.
Sempre atualizar o arquivo existente.

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
