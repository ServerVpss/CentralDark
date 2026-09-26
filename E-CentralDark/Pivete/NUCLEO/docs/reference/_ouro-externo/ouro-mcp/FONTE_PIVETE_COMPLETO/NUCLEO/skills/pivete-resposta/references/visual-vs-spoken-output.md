# Saída visual x roteiro falado

## Contrato do Pivete

A mensagem visual e o áudio representam a mesma conclusão, mas não precisam carregar os mesmos caracteres.

### Visual

- preservar `⏳` para pendente e `✅` para concluído;
- mostrar o caminho completo quando for evidência útil;
- usar o rótulo curto `Localização 👉🏻`;
- não explicar em prosa o nome dos símbolos que já estão visíveis.

### Falado

- falar somente resultado, motivo e estado relevante;
- não pronunciar nomes de emojis;
- não ler caminhos, barras, hashes, Markdown ou metadados;
- não repetir a linha de localização.

## Falha observada

Quando o auto-TTS recebe o mesmo texto bruto do Telegram, um caminho Windows pode chegar ao provider e ser pronunciado caractere por caractere. A correção de apresentação não é retirar `⏳`/`✅` do texto: é separar a projeção visual do roteiro falado ou sanitizar o payload antes da síntese.

Há uma segunda recorrência: ao reconhecer a reclamação, repetir em prosa o nome do símbolo ou separador faz o próprio áudio pronunciar o defeito outra vez. O reconhecimento deve ser curto e indireto: `entendi; esse conteúdo fica apenas visual`.

## Estados da correção

Separar sempre:

```text
CODIGO_EDITADO
TESTE_UNITARIO_VERDE
GATEWAY_RECARREGADO
PAYLOAD_DO_PROVIDER_LIMPO
AUDIO_REAL_CONFIRMADO
```

Código editado e teste verde não significam que o processo vivo carregou a mudança. Enquanto gateway, payload e áudio não forem comprovados, reportar `APLICADO_NAO_CARREGADO` ou `AINDA_NAO_PROVADO`, nunca `CORRIGIDO`.

## Sequência obrigatória antes de editar TTS

1. Ler o sanitizador e a rota de auto-TTS vigentes.
2. Montar fixture com título, `⏳`, `✅`, `Localização 👉🏻` e caminho Windows.
3. Capturar o texto exato entregue ao provider.
4. Propor a menor mudança que preserve palavras úteis e remova somente conteúdo não falável.
5. Rodar regressões de texto visual e áudio.
6. Só então alterar o runtime e declarar conclusão.

## Critérios de aceitação

- mensagem mantém símbolos e caminho completo;
- áudio não contém nomes de emojis nem leitura de barras/caminho;
- resultado e decisão continuam semanticamente iguais nos dois canais;
- prosa normal, URLs úteis e números não são removidos indevidamente;
- teste cobre resposta com e sem caminho;
- rollback e diff ficam disponíveis.
