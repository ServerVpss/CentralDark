# 00 — Leia-me (uso deste planão)

## O que é

Pacote de **planejamento ChatOps** para orquestração de DevOps via bots/agentes, com:

- BOOT #6 (Orquestrador) como cérebro de coordenação
- Fio da missão como diretriz inviolável
- Trajetória E2E de fora → dentro, sem big-bang

## O que NÃO é

- Não é script de deploy
- Não é ordem automática de PM2/Caddy/Supabase
- Não substitui `docs/GOVERNANCA` nem `CLAUDE.md`

## Como usar

1. Operador lê `02-Missao/02-TRAJETORIA-E2E.md`
2. Valida gates em `03-Arquitetura/01-GATES-SEGURANCA.md`
3. Autoriza **fase por fase** (nunca “faz tudo”)
4. Lab sandbox primeiro (`05-Infra/01-LAB-SANDBOX-DOCKER.md`)
5. Só depois, sob ordem, espelho controlado no runtime

## Hierarquia (Obsidian)

Raiz só tem `README.md`. Conteúdo em pastas `00`–`06` + `99-Arquivados`.  
`BOOT-NUM-6` = perfil #6, **não** versão do documento.

## Risco declarado

Falha de orquestração **sem gates** pode comprometer infra.  
Por isso **zero execução implícita**: cada fase exige autorização nominal.
