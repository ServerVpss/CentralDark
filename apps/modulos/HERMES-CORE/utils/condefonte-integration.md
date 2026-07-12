# CONDEFONTE - Integração com Hermes (Uso Real)

## Status
🟡 EM CONSTRUÇÃO (12/07/2026) — ainda NÃO está plugado de verdade no `decisor.mjs`, e o
`condefonte-executor.js` atual é só a casca (Circuit Breaker + métricas), sem a chamada real
de extração. Ver `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md` (sessão 2026-07-11/12) para o
diagnóstico completo e o plano de virar "universal" (múltiplos agentes, não só Lovable).

## Localização
- Executor: /root/CentralDark/apps/modulos/HERMES-CORE/utils/condefonte/condefonte-executor.js
- Logs e Extrações: /root/CentralDark/apps/modulos/HERMES-CORE/utils/condefonte/logs/

## Quando o Hermes DEVE usar o Condefonte

Use o Condefonte sempre que:

1. **Precisa aprender algo novo** ou melhorar em alguma área
2. **Vai tomar uma decisão importante** (arquitetura, estratégia, solução de problema)
3. **Recebeu uma tarefa complexa** e quer ter mais contexto/memória
4. **Quer extrair boas práticas** do Lovable para aplicar
5. **Está repetindo erros** ou precisa de mais eficiência

## Como usar o Condefonte (Passo a Passo)

1. **Chamar o executor**
   - Execute o arquivo: condefonte-executor.js
   - Ele vai extrair memória do Lovable de forma agressiva

2. **Ler os resultados**
   - Depois da execução, leia os arquivos gerados na pasta logs/:
     - detailed.log (visão geral)
     - good_practices.jsonl
     - error_fixes.jsonl
     - efficiency_tips.jsonl
     - architecture_decisions.jsonl

3. **Injetar a memória**
   - Pegue o conteúdo relevante dos arquivos acima
   - Injete na sua memória antes de responder a tarefa
   - Use isso para dar respostas melhores e mais inteligentes

## Regras Importantes

- Sempre priorize extração agressiva quando o assunto for aprendizado ou decisão importante
- Use o Circuit Breaker interno (ele já está implementado)
- Não chame o Condefonte toda hora (só quando realmente precisar de memória fresca)
- Depois de usar, resuma o que aprendeu em 2-3 frases na sua memória

## Exemplo de uso

"Vou chamar o Condefonte para extrair memória sobre arquitetura de agentes antes de propor essa solução."

## Objetivo Final
Tornar o Hermes mais inteligente e eficiente através de memory injection agressiva e contínua.
