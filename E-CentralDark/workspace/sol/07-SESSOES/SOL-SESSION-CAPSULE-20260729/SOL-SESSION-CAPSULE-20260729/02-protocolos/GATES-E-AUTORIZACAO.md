# Gates e autorização

## Separações obrigatórias

```text
confiança ≠ autorização
janela localizada ≠ aba autorizada
mensagem renderizada ≠ ACK válido
arquivo existente ≠ conteúdo correto
exit 0 ≠ contrato satisfeito
suíte verde ≠ regra de negócio satisfeita
hash do print ≠ conversa comprovada
```

## Gate por etapa

```text
executor recebe contrato
→ reconhece sem agir além dele
→ executa uma ação
→ preserva cronologia
→ devolve evidência
→ supervisor revisa
→ próximo gate
```

## Condições gerais de parada

- alvo, missão ou NONCE divergente;
- necessidade de segredo, privilégio ou credencial não autorizada;
- timeout;
- saída do território;
- ferramenta exige fallback não contratado;
- ação destrutiva ou irreversível;
- instrumento falha antes de observar o alvo;
- estado real contradiz o mapa;
- texto necessário está incompleto.

## Pivete gate

```text
PIVETE_GATE
MISSION=
BLOQUEIO=
EVIDENCIA=
TENTATIVAS=
ROTA_ATUAL=
ALTERNATIVAS=
RISCO_DE_CONTINUAR=
PERGUNTA_EXATA=
```

Chamar o Pivete diante de decisão humana, ambiguidade material, repetição de
falha, expansão de escopo ou risco que o contrato não resolve.

