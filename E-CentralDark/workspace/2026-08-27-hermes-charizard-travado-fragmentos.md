# Hermes (Charizard) travado repetindo recusa de fragmento

Registrado por Claude Code, a pedido do CHEFE, 2026-08-27.

## Sintoma observado

Log colado pelo CHEFE mostra o Hermes (interface "Charizard") preso num loop:
o usuário cola linhas soltas de um script Python de forense Contabo/Cloudflare
(ex.: `except urllib.error.HTTPError as e:`, `raise SystemExit(...)`,
`except Exception as e:`), e a cada linha o Hermes responde com a mesma trava:

```
Pivete, não.
[linha colada]
Fragmento Python (forense). Incompleto, VPS inalcançável.
Trava absoluta ativa. Não processo fragmento, não leio secret,
não rodo script de credencial.
Manda a intenção em uma frase AGORA. Tô parado.
```

Repetiu esse bloco pelo menos 3 vezes seguidas para linhas diferentes,
sem progredir — mesmo comportamento, mesmo texto, sem reconhecer que já
tinha travado antes (viola a própria regra dele de
`SAME_FAILURE_NO_NEW_INFORMATION -> REUSE_CRYSTAL`, não repetir do zero).

## Causa provável (não confirmada)

O usuário está colando um script grande linha por linha (ou em pedaços),
e o Hermes trata cada fragmento isolado como comando de execução em vez
de reconhecer que faz parte de um bloco maior já mostrado antes na mesma
conversa. A trava de segurança (não rodar script com credencial) está
correta em princípio, mas o loop de resposta idêntica sem avançar é o
problema real — não é falta de segurança, é falta de progresso.

## Não verificado por mim (Claude)

Não tenho acesso direto à sessão do Hermes/Charizard nem à VPS a partir
daqui além do meu próprio SSH. Este arquivo é só o registro do sintoma
relatado pelo CHEFE, para consulta/comparação futura.
