# 001 — Token de bot ≠ sessão de usuário

**Data:** 2026-07-03  
**Categoria:** regra

## Contexto
Pivete pediu pra criar 3 bots (Groq/Gemini/Claude) dentro do grupo "Central Dark - Grupo Da Evolução" e achou que dar o token do `@srver1bot` equivalia a dar acesso à conta pessoal dele no Telegram.

## Aprendizado
Token de bot (Bot API) NÃO permite:
1. Criar bots novos — só `@BotFather` via conta de usuário
2. Adicionar bots num grupo — só usuário humano adiciona
3. Agir como conta pessoal — exige MTProto/Telethon com sessão de user

**Regra prática:** quando pedido é "cria bot X no grupo Y", ou o Pivete cria no BotFather e cola o token, OU adotamos alternativa de 1 bot só com múltiplos comandos (`/groq`, `/gemini`, `/claude`) roteando pra modelos diferentes. Sempre oferecer as 2 opções antes de sair implementando.

## Ver também
- AULA-003 (Telegram notificação)
- ROTAS-FIXAS/notificacao-telegram.md
