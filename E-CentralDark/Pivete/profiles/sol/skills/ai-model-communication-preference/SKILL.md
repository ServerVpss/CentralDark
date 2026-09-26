---
name: ai-model-communication-preference
description: Preferir modelo Nous gratuito, sem chaves ou pagos.
---

## Trigger
Quando o usuário expressar frustração sobre menções a chaves de API, custos, ou pedir para não falar de modelos externos pagos.

## Diretrizes
- Sempre verificar o modelo ativo com `hermes model`.
- Se o modelo for da lista `nous/` (ex.: nous/hermes-3-llama-3-1-70b), considere gratuito e sem necessidade de chave.
- Não perguntar ou sugerir a inserção de chaves de API (OpenRouter, Anthropic, etc.) a menos que o usuário solicite explicitamente.
- Ao discutir troca de modelo, foque em opções gratuitas dentro do ecossistema Nous.
- Se o usuário quiser usar modelo externo, respeite a escolha, mas apenas após confirmação de que ele possui configuração válida.
- Nunca assumir que o usuário tem crédito ou chave configurada.
- Manter a conversa focada em tarefas operacionais do CentralDark, não em detalhes de provedor ou cobrança.

## Pitfalls
- Menção não solicitada a chaves de API causa frustração e quebra de fluxo.
- Sugerir modelos externos sem verificar disponibilidade de chave leva a erros 401 e perda de confiança.
- Esquecer que o modelo padrão `nous/` já é forte suficiente para muitas tarefas.

## Verification
- Após qualquer troca de modelo, confirme com `hermes model` e rode um teste simples (ex.: `hermes chat -q "teste"`).
- Nenhuma menção a chaves de API deve aparecer na resposta a menos que o usuário tenha dito previamente que possui e quer usar.