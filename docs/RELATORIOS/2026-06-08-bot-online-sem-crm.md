# BOT online sem CRM — validação oficial

**Data:** 2026-06-08  
**Escopo:** bot/frontend e serviços ativos  
**CRM:** fora do escopo desta etapa

## Resultado

O bot foi validado online sem alteração no CRM.

## Confirmado

- `bot.multizap.dev` respondeu HTTP 200.
- O domínio está sendo servido pelo Caddy.
- O Caddy aponta o bot para o build novo dentro da estrutura CentralDark.
- O build do bot existe.
- `dist/index.html` existe.
- O PM2 foi apenas lido, sem reiniciar serviços.
- O CRM continuou intocado.
- Nenhuma pasta foi apagada.
- Nenhuma alteração foi feita em Docker, WuzAPI, banco real ou sessão WhatsApp.

## PM2

A leitura de PM2 confirmou serviços online e referências esperadas:

- `CloneDeck-Supabase-Sync` já está apontando para a estrutura CentralDark.
- `CloneDeck-CRM` ainda permanece em caminho legado, conforme esperado.

## Decisão operacional

O estado do bot está validado para continuidade da organização do frontend/serviços ativos.

A próxima etapa segura é validar o frontend do bot para áreas de:

- chat ao vivo;
- contatos;
- fotos/avatar;
- grupos;

sem depender de histórico WhatsApp, sem banco real e sem mexer no CRM.

## Fora do escopo

- Banco de dados.
- Histórico de mensagens WhatsApp.
- Contatos antigos.
- Sessões WhatsApp/WuzAPI.
- Migração do CRM.
- Alterações em Caddy/PM2 sem confirmação.

## Regra aplicada

Modo Segredo: resultado recebido, interpretação objetiva, próxima ação pronta, validação e relatório.
