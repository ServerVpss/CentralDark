# JS String Literal Regex Testing

Quando testar source code JavaScript com `assert.match(trecho, /regex/)`, o trecho é um **string literal** dentro de código JS, não texto regex puro. Caracteres como `{40}`, `{12,40}` são literais da string, não quantificadores regex.

## Regra principal

```text
SOURCE_CODE_STRING_LITERALS → USE {[0-9,]+} INSTEAD DE {40}
```

## Por que isso falha

O source tem:
```js
if (!/REMOTE_HEAD_VERIFIED=[0-9a-f]{40}/.test(stdout)) {
```

Quando lido via `readFile`/`require`, o `{40}` no source é texto literal `{40}`, não um quantificador regex. Um regex `/REMOTE_HEAD_VERIFIED=[0-9a-f]{40}/` no `assert.match` busca `{40}` no texto fonte — mas o source tem `{40}` como string literal, que o regex NÃO consegue matchar porque `{` e `}` são regex-metacaracteres que não aparecem no source da forma que o regex espera.

## Padrão correto

```js
assert.match(trecho, /REMOTE_HEAD_VERIFIED=\[0-9a-f\]\{[0-9,]+\}/);
```

O `{[0-9,]+}` no regex busca literalmente `{` seguido de dígitos/vírgulas seguido de `}` — que é exatamente o que aparece no source code.

## Checklist ao testar source code JS

- [ ] O regex busca pelos **textos literais** do source, não pela intenção semântica
- [ ] `{n}` em regex é quantificador; no source é literal `{n}`
- [ ] Use `{[0-9,]+}` ou escape duplo `\\{40\\}` para matchar source literals
- [ ] Verifique com `console.log(trecho.includes('REMOTE_HEAD_VERIFIED='))` antes de assertar regex
- [ ] O `trecho` vem de `source.slice(start, end)` — é string JavaScript, não markdown

## Exemplo de falha clássica

```
// source tem: if (!/REMOTE_HEAD_VERIFIED=[0-9a-f]{40}/.test(stdout)) {
// assert.match(trecho, /REMOTE_HEAD_VERIFIED=[0-9a-f]{40}/) → FAIL
// O {40} no regex busca quantificador, mas source tem literal {40}
```

## Exemplo de sucesso

```
// assert.match(trecho, /REMOTE_HEAD_VERIFIED=\[0-9a-f\]\{[0-9,]+\}/) → PASS
```
