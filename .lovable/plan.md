## Problema confirmado

Acabei de testar a chave do provedor agora e ela está **funcionando**. Nas últimas 6 horas há 26+ consultas bem-sucedidas (cpf, telefone, nome, placa). A mensagem "Token expirado" que o provedor devolve em alguns 403 **não significa** que a chave venceu — é uma resposta genérica do lado deles pra várias situações (CPF inexistente, módulo indisponível pontual, IP bloqueado momentaneamente, etc).

O alerta que coloquei na última rodada (`api-query/index.ts` linhas 499–515) estava amplificando esse falso positivo e dizendo "renovar assinatura" quando na verdade a key tá ativa.

## O que vou fazer

1. **Reverter a detecção agressiva** em `supabase/functions/api-query/index.ts`:
   - Tirar a regra que transforma qualquer "token expirado" do provedor em mensagem de "renovar assinatura".
   - Manter só a mensagem amigável genérica de 403 ("Módulo temporariamente indisponível, tente outro ou aguarde").

2. **Mesma coisa no bot** (`supabase/functions/telegram-webhook/index.ts`) — manter o texto amigável padrão pra 401/403 sem afirmar que a chave venceu.

3. **Criar painel de diagnóstico real** (rápido): uma query que mostra, dos últimos 60 minutos:
   - Quantos 403 reais aconteceram, em quais módulos
   - Taxa de sucesso atual por módulo
   - Assim você consegue ver de relance se é problema de UM módulo específico ou da chave inteira, sem chute.
   
   Isso já existe parcialmente em `module_health_status` — vou só garantir que a página de saúde dos módulos no painel web esteja puxando essa informação corretamente.

4. **Deploy** das duas edge functions ajustadas e validação rodando uma consulta real.

## Detalhes técnicos (pra referência)

- Arquivos tocados: `api-query/index.ts`, `telegram-webhook/index.ts`, e talvez `src/pages/...` da página de saúde de módulos (só se a visualização não estiver clara).
- Nenhuma mudança em banco / RLS / secrets.
- A `ISEEK_API_KEY` continua a mesma, intocada.

## Resultado esperado

- Bot e painel param de gritar "chave vencida" quando não está.
- Quando uma consulta falhar, o usuário vê "tenta outro módulo / aguarda um pouco" em vez de mensagem assustadora.
- Você ganha uma forma confiável de checar a saúde real quando suspeitar.
