# Texto visual separado do roteiro falado

## Gatilho

Use quando o texto exibido precisa manter status, emojis, caminhos ou metadados, mas o TTS passa a verbalizar nomes de símbolos, separadores ou partes do caminho.

## Contrato

```text
resposta visual rica
→ preparar roteiro falado determinístico
→ remover conteúdo exclusivamente visual
→ preservar a explicação humana
→ enviar ao provider
```

A resposta visual não deve ser empobrecida para consertar o áudio. O ajuste pertence ao sanitizador compartilhado pelo gateway e pelo TTS explícito.

## Causa reproduzida

O limpador genérico de código inline remove as crases, mas preserva o conteúdo interno. Quando o conteúdo é um caminho absoluto do Windows, ele expõe o caminho e seus separadores ao provider de voz.

A ordem importa:

```text
remover linha de localização e caminho em código inline
→ remover blocos e Markdown genérico
→ normalizar símbolos e espaços
→ gerar fala
```

Se o caminho for tratado somente depois do limpador genérico, a informação de que ele estava isolado visualmente já foi perdida.

## TDD mínimo validado

Antes de editar produção, criar fixtures que comprovem os dois comportamentos:

1. Uma resposta com status, `Localização` e caminho absoluto mantém o status falado, mas omite a linha visual inteira do roteiro.
2. Um caminho absoluto dentro de código inline, no meio de uma frase, não deixa letra da unidade nem separadores no roteiro; o restante da frase continua presente.

Executar primeiro e exigir falha pelo sintoma correto. Depois aplicar apenas a transformação necessária e repetir os testes.

## Gate de prova

Teste unitário verde prova somente a transformação de texto. Para declarar o áudio corrigido, ainda são obrigatórios:

```text
consumidor vivo recarregado
+ payload efetivamente entregue ao provider inspecionado
+ áudio real sem verbalização visual
+ texto visual preservado
```

Enquanto faltar essa cadeia, usar `APLICADO_NAO_CARREGADO` ou `AINDA_NAO_PROVADO`.

## Responsividade

Suítes amplas não devem bloquear a conversa. Rodar verificações demoradas em background com notificação; manter em primeiro plano apenas o teste específico que determina o próximo passo.