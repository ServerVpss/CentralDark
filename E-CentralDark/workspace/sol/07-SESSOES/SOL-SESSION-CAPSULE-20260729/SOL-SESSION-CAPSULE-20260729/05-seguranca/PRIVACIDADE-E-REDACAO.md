# Privacidade e redação

Esta cápsula não deve conter:

- tokens;
- cookies;
- senhas;
- conteúdo de `.env`;
- conteúdo de `auth.json` ou `account.json`;
- chaves;
- conversas privadas completas;
- payload bruto sem necessidade.

## Metadados permitidos

- existência de arquivo;
- caminho necessário ao fio;
- tamanho;
- timestamp;
- hash;
- tipo;
- contagem;
- saída sanitizada.

## Sanitização

Ao capturar comando, log ou erro:

```text
identificar padrões de segredo
→ substituir valor
→ preservar nome do campo e estrutura útil
→ registrar SECRETLIKE_MATCHES
```

Hash de conteúdo sensível também pode funcionar como identificador estável;
publique-o somente quando necessário ao gate.

