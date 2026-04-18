
## Bug: `/start` está disparando consulta de PIS inválida

### Nova causa raiz (correção do diagnóstico anterior)

O usuário enviou apenas `/start` — não clicou em PIS. Mas o bot respondeu "⚠️ Módulo 📋 PIS indisponível - Valor não pode ser vazio".

Isso significa que existe um **estado de conversa pendente** (`bot_conversation_states`) deixado de uma sessão anterior — provavelmente o usuário clicou em PIS antes, não respondeu, e o estado ficou ativo. Quando ele agora envia `/start`, o handler de estado (linha ~7298-7310 do `telegram-webhook/index.ts`) intercepta o texto **antes** do roteador de comandos e passa `"/start"` como valor da consulta PIS.

Como `/start` começa com `/`, a sanitização derruba para vazio → `api-query` retorna "Valor não pode ser vazio" → `isProviderError` classifica errado → mostra "Módulo PIS indisponível".

### Correções (1 arquivo: `supabase/functions/telegram-webhook/index.ts`)

**1. Comandos sempre cancelam estado pendente (handler de estado, ~linha 7290)**
Antes de consumir o estado `query`, verificar se `text.trim()` começa com `/`. Se sim:
- Limpar o estado (`bot_conversation_states`)
- Deixar o fluxo seguir para o roteador de comandos normal
- Não chamar `processQuery` com o comando

Isso resolve `/start`, `/cancelar`, `/cpf ...`, `/menu` etc. enquanto há estado de PIS/CPF/etc. esperando input.

**2. Validar input vazio antes de `processQuery` (mesmo bloco)**
Se após o passo 1 o `text` ainda chegar vazio/whitespace/só símbolos, responder:
> ⚠️ Você precisa digitar um valor. Exemplo: `12345678900`
> Envie /cancelar para sair.
E **manter** o estado para nova tentativa (não cancelar).

**3. Distinguir validation_error de provider_error em `isProviderError` (linha ~2819)**
Se `result.meta?.status === 'validation_error'` ou mensagem contém "Valor não pode ser vazio" / "inválido" / "obrigatório", retornar `{ isError: false }` para **não** mostrar banner de "módulo indisponível". Em vez disso, exibir mensagem dedicada de input inválido com exemplo do módulo.

**4. TTL automático no estado (defesa extra)**
Ao consumir o estado `query`, ignorar (e apagar) se `created_at` for mais antigo que **5 minutos**. Evita que um estado órfão de horas atrás capture comandos legítimos.

### Resultado esperado

- `/start` (e qualquer comando) sempre funciona, mesmo com estado pendente.
- Estado expirado em 5min é descartado silenciosamente.
- Erros de validação ganham mensagem própria, separada de erros de provedor.

<lov-actions>
<lov-suggestion message="Aprovado. Implemente as 4 correções no telegram-webhook e teste enviando /start após clicar em PIS sem responder, para validar que /start funciona normalmente.">Implementar correções</lov-suggestion>
<lov-suggestion message="Implemente apenas as correções #1 (comandos cancelam estado) e #4 (TTL de 5min) — quero o fix mínimo de UX agora e deixar o ajuste do isProviderError para depois.">Só fix de estado pendente</lov-suggestion>
<lov-suggestion message="Antes de implementar, rode uma query no banco para listar todos os estados ativos em bot_conversation_states (e há quanto tempo) — quero ver se há muitos órfãos acumulados.">Auditar estados órfãos primeiro</lov-suggestion>
</lov-actions>
