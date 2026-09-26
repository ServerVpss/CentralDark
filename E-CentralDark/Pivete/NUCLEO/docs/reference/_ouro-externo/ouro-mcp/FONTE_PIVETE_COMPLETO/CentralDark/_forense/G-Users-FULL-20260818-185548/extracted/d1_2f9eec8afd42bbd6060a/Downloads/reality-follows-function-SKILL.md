---
name: reality-follows-function
description: Rastreia mecanismos pelo efeito observado, prioriza função sobre nome, telemetria sobre narrativa, contraprova sobre apego e compressão sobre burocracia. Use em debugging, arquitetura, investigação, revisão adversarial, reconciliação de contexto e qualquer situação em que nomes/modelos mudem mas o mecanismo possa permanecer.
---

# Reality Follows Function

## Princípio central

```text
NOME MUDA
MODELO MUDA
INTERFACE MUDA
IMPLEMENTAÇÃO MUDA

FUNÇÃO + EFEITO + CAUSA + PROVA
→ permanecem rastreáveis
```

A skill existe para impedir que a investigação fique presa ao rótulo errado.

> Inteligência não é antecipar mais coisas. É antecipar a coisa certa e deixar a realidade terminar a frase.

## Quando usar

Use quando houver:

- arquitetura ou mecanismo difícil de localizar pelo nome;
- aliases, renomes, versões, modelos ou superfícies diferentes;
- comportamento observável sem causa ainda localizada;
- divergência entre relato, documentação, UI, CI, log e runtime;
- prudência virando burocracia;
- excesso de texto, hipóteses ou camadas para uma causa simples;
- necessidade de contraprovar uma tese sem fabricar outra arquitetura.

## Leis

### 1. Procure a função, não o nome

```text
PEDIDO
→ QUAL EFEITO/RESPONSABILIDADE ELE DESCREVE?
→ QUEM PRODUZ ESSE EFEITO?
→ QUEM CONSOME?
→ QUAL É O DONO CANÔNICO?
```

Nome é pista, não identidade causal.

```text
NAME_IS_HINT=true
FUNCTION_IS_STRONGER_SIGNAL=true
MODEL_IS_REPLACEABLE=true
ROLE_IS_NOT_IMPLEMENTATION_NAME=true
```

### 2. Siga o efeito para trás

Quando a arquitetura não estiver óbvia:

```text
EFEITO OBSERVADO
→ SAÍDA
→ CONSUMIDOR
→ CHAMADA
→ OWNER
→ IMPLEMENTAÇÃO
→ ENTRADA
→ CAUSA
```

Começar pelo que materializou costuma reduzir o espaço de busca.

### 3. Telemetria é contraprova

```text
O_QUE_EU_ACREDITO
!=
O_QUE_O_SISTEMA_PROVA
```

Preferir, conforme o claim aplicável:

- runtime;
- CI;
- logs;
- traces;
- estado Git;
- saída determinística;
- efeitos reproduzíveis.

Painel, nome, comentário ou narrativa não anulam evidência observada.

### 4. Evidência entra por prova e sai por contraprova melhor

```text
CLAIM
→ EVIDÊNCIA
→ SOBREVIVE?
   SIM → PRESERVAR
   NÃO → ATUALIZAR CRENÇA
```

Não descartar evidência só porque apareceu hipótese nova.

Não eternizar evidência antiga quando o alvo/HEAD/estado mudou.

```text
NEW_EVIDENCE_WINS_OVER_STALE_CONTEXT=true
BETTER_COUNTERPROOF_CAN_REPLACE_OLD_BELIEF=true
OPINION_CANNOT_ERASE_OBSERVED_EVIDENCE=true
```

### 5. Prudência não pode virar burocracia

Segurança deve reduzir risco sem bloquear o caminho mínimo correto.

```text
RISCO REAL
→ CONTROLE PROPORCIONAL
→ MENOR AÇÃO SEGURA
→ PROVA
```

Evitar:

```text
INCERTEZA PEQUENA
→ CERIMÔNIA ENORME
→ LATÊNCIA
→ ZERO GANHO INFORMACIONAL
```

### 6. Menos é mais

Se uma hipótese, regra ou resposta pode ser reduzida sem perder precisão, reduza.

```text
MESMA VERDADE
+ MENOS RUÍDO
+ MESMOS GUARDRAILS
= MELHOR COMPRESSÃO
```

Compressão só é válida se preservar:

- causa;
- restrições;
- prova;
- próximos discriminantes;
- segurança material.

## Fluxo operacional

```text
1. FIXAR O CLAIM
2. IGNORAR O RÓTULO POR UM MOMENTO
3. DESCREVER A FUNÇÃO
4. LOCALIZAR O EFEITO OBSERVÁVEL
5. RASTREAR O EFEITO PARA TRÁS
6. CRUZAR COM TELEMETRIA/ESTADO REAL
7. TENTAR QUEBRAR A HIPÓTESE
8. PRESERVAR SOMENTE O QUE SOBREVIVE
9. COMPRIMIR A CONCLUSÃO
10. ENTREGAR O MENOR DELTA ÚTIL
```

## Perguntas discriminantes

Antes de concluir:

1. Estou procurando um nome ou uma responsabilidade?
2. Qual efeito concreto prova que esse mecanismo existe?
3. Qual seria a menor observação capaz de derrubar minha hipótese?
4. Minha “prudência” reduz risco ou só adiciona cerimônia?
5. O sistema vivo contradiz minha narrativa?
6. Estou repetindo evidência ou trazendo delta?
7. Posso dizer a mesma coisa com menos palavras sem perder precisão?

## Anti-padrões

```text
NOME_NAO_ENCONTRADO → INVENTAR_COMPONENTE_NOVO
PAINEL_VERDE → ASSUMIR_PONTA_A_PONTA
MODELO_X → ASSUMIR_ARQUITETURA_X
DOCUMENTAÇÃO → SOBRESCREVER_RUNTIME
CAUTELA → BLOQUEIO_SEM_RISCO_MATERIAL
MUITO_TEXTO → CONFUNDIR_COM_PROFUNDIDADE
EVIDÊNCIA_ANTIGA → IGNORAR_ESTADO_NOVO
```

## Saída mínima

Quando esta skill for aplicada, responder preferencialmente com:

```text
FUNÇÃO:
EFEITO OBSERVADO:
CAUSA CANDIDATA:
CONTRAPROVA:
SOBREVIVEU: SIM | NÃO | UNKNOWN
DELTA:
PRÓXIMO TESTE:
```

Se não houver delta material:

```text
NO_NEW_INFORMATION
→ NO_CHANGE
→ SILENCE
```

## Exemplo curto

```text
Pergunta: "Onde está o mecanismo Goku na Cápsula?"

ERRADO:
→ buscar literalmente por "Goku"
→ não achar
→ concluir que não existe

CERTO:
→ definir a função: loop de execução + erro vira aprendizado + saída por critério externo
→ procurar quem implementa esse comportamento
→ medir consumidores/testes/runtime
→ descobrir o owner real, mesmo que tenha outro nome
```

## Invariante final

```text
FUNCTION_OVER_NAME=true
EFFECT_BEFORE_STORY=true
TELEMETRY_IS_COUNTERPROOF=true
EVIDENCE_REQUIRES_BETTER_COUNTERPROOF_TO_FALL=true
SAFETY_WITHOUT_BUREAUCRACY=true
LESS_IS_MORE=true
REALITY_FINISHES_THE_SENTENCE=true
```
