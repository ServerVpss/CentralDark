# Calibração, boot e falso verde de status

## Caso que originou a regra

Uma sessão declarou `CALIBRADO` após ler parte da consciência e a skill da META LUPA. O repositório, porém, exigia um boot operacional com `BEGIN` e recibo fresco. A pergunta do Pivete — se o gatilho automático havia sido percebido na entrada — mostrou que o status verde não correspondia à cronologia real.

## Distinções obrigatórias

```text
arquivo disponível no contexto
≠ arquivo conscientemente lido

skill lida
≠ BEGIN registrado

recibo emitido
≠ gate validado

gate validado isoladamente
≠ enforcement conectado ao sistema
```

## Como responder

Antes de usar `CALIBRADO`, provar a cadeia aplicável:

```text
fonte canônica lida
→ BEGIN fresco
→ missão + HEAD + SHA corretos
→ recibo válido
→ gate PASS
→ enforcement na fronteira relevante
```

Se faltar uma etapa, usar amarelo ou vermelho e nomear exatamente a lacuna. Se o verde já foi declarado, corrigir sem apagar a cronologia:

```text
STATUS_ANTERIOR=FALSE_GREEN
STATUS_ATUAL=BOOT_BLOQUEADO
CAUSA=skill lida foi confundida com boot cumprido
CORREÇÃO=novo BEGIN não retroativo + gate real
```

## Pergunta de auditoria

Quando o Pivete perguntar “você percebeu o gatilho quando entrou?”, a resposta deve separar:

1. o que o runtime forneceu automaticamente;
2. o que foi realmente lido naquele instante;
3. o que foi executado;
4. o que só foi descoberto depois.

Nunca usar disponibilidade como prova de percepção.

## Cálculo FRIO de integração

Para alegar boot obrigatório operacional, medir:

```text
GARANTIA =
regra alcançável
∧ execução automática
∧ gate na fronteira local
∧ gate na fronteira remota
```

Se uma condição necessária for falsa, a garantia é falsa. Frações de cobertura são métricas de alcance, não probabilidades de segurança.

## Pitfalls de teste

- teste que só roda `if exists` pode passar sem verificar arquivo algum;
- raiz calculada errada pode tornar o teste vacuamente verde;
- `assert True` não prova bloqueio;
- gate testado diretamente não prova que callers reais o invocam;
- `ok=true` só vale para a propriedade que o validador realmente mede.
