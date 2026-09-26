# Navegador e handshake

## Protocolo

```text
SEM_PERMISSAO
→ identificar e inspecionar
→ não enviar

COM_PERMISSAO_EXPLICITA
→ prender na aba autorizada
→ confirmar processo + origem + marcador
→ preservar rascunho
→ enviar exatamente a mensagem autorizada
→ verificar renderização
→ aguardar resposta completa
→ validar NONCE/ACK
→ registrar recibo
→ desconectar
```

## Identidade do handshake

```text
MISSION=SINAPSE-02
NONCE=78A2CB81DDC6BF42D42AD601693489F2
STATUS=HANDSHAKE_OBTIDO_NA_SESSAO
```

O sucesso passado prova viabilidade naquele contexto, não autorização futura.

## Abortar corretamente

Sessão desautenticada, destino não identificado ou rascunho existente sem
permissão de substituição resultam em `ABORT`, zero mensagem enviada e nenhuma
busca por credencial.

