# Checklist Read-Only do Agente Mestre

Este checklist serve para auditoria de memoria. Ele nao executa correcao, nao mexe em producao e nao faz limpeza.

## Regras antes de comecar

- Trabalhar somente em modo read-only.
- Nao abrir secrets, tokens, sessoes, `.env`, chaves ou banco real.
- Nao tocar Caddy, Docker, PM2, WuzAPI, WhatsApp, CRM, Supabase ou servicos.
- Nao usar `git add .`.
- Nao usar `git reset`, `git clean`, `git prune`, `git gc` ou `rm -rf`.
- Nao fazer merge.
- Registrar achados com linguagem simples.

## Classificacao dos achados

| Status | Significado |
|---|---|
| `OK` | Existe, esta claro e combina com a memoria atual |
| `DUPLICADO` | Ha mais de uma fonte dizendo a mesma coisa ou competindo |
| `AUSENTE` | Arquivo, secao ou informacao esperada nao foi encontrada |
| `FORA DO PADRAO` | Existe, mas nao segue formato, ordem ou regra do projeto |
| `PRECISA DE HUMANO` | Envolve decisao, risco ou acao sensivel |

## 1. README raiz

Arquivo:

```txt
/root/README.md
```

Verificar:

- [ ] Existe.
- [ ] Diz que e a porta de entrada.
- [ ] Lista comandos de reload de memoria.
- [ ] Aponta para `docs/CONSCIENCIA/APRENDIZADOS.md`.
- [ ] Aponta para `docs/PENDENCIAS.md`.
- [ ] Reforca bloqueios sensiveis.
- [ ] Indica fase atual ou estado vivo quando aplicavel.

Resultado:

```txt
STATUS:
ACHADOS:
ALERTAS:
```

## 2. CentralDark/README.md

Arquivo:

```txt
/root/CentralDark/README.md
```

Verificar:

- [ ] Existe.
- [ ] Descreve estado atual do projeto operacional.
- [ ] Registra Builder Bolt publico/local quando aplicavel.
- [ ] Reforca que a raiz Git real e `/root`.
- [ ] Reforca que nao deve usar `git add .`.
- [ ] Indica documentos e pastas principais.

Resultado:

```txt
STATUS:
ACHADOS:
ALERTAS:
```

## 3. docs/CONSCIENCIA

Pasta:

```txt
/root/docs/CONSCIENCIA/
```

Verificar:

- [ ] Pasta existe.
- [ ] `APRENDIZADOS.md` existe.
- [ ] Aprendizados recentes seguem numeracao.
- [ ] Aprendizados recentes possuem categoria, data, contexto e aprendizado.
- [ ] Nao ha segredo real em texto claro.
- [ ] A fase atual esta coerente com `docs/PENDENCIAS.md`.

Resultado:

```txt
STATUS:
ACHADOS:
ALERTAS:
```

## 4. docs/PENDENCIAS.md

Arquivo:

```txt
/root/docs/PENDENCIAS.md
```

Verificar:

- [ ] Existe.
- [ ] Tem data de ultima atualizacao.
- [ ] Lista fase ativa ou proxima fase.
- [ ] Pendencias fechadas estao marcadas como fechadas.
- [ ] Pendencias abertas tem criterio de fechamento.
- [ ] Nao mistura tarefa sensivel com acao sem confirmacao.

Resultado:

```txt
STATUS:
ACHADOS:
ALERTAS:
```

## 5. docs/RELATORIOS

Pasta:

```txt
/root/docs/RELATORIOS/
```

Verificar:

- [ ] Pasta existe.
- [ ] Relatorios recentes existem.
- [ ] Relatorios recentes dizem objetivo, resultado, validacao e nao tocado.
- [ ] Relatorios de acoes sensiveis citam confirmacao humana.
- [ ] Nao ha logs brutos gigantes ou secrets.

Resultado:

```txt
STATUS:
ACHADOS:
ALERTAS:
```

## 6. CentralDark/agentes

Pasta:

```txt
/root/CentralDark/agentes/
```

Verificar:

- [ ] `README.md` existe.
- [ ] `PLANO.md` existe.
- [ ] `AGENTE-MESTRE-MEMORIA.md` existe.
- [ ] `PROMPT-CODEX.md` existe.
- [ ] `CHECKLIST-READONLY.md` existe.
- [ ] `RELATORIO-MODELO.md` existe.
- [ ] Todos reforcam read-only primeiro.
- [ ] Todos bloqueiam secrets e acoes sensiveis.

Resultado:

```txt
STATUS:
ACHADOS:
ALERTAS:
```

## Saida final da auditoria

```txt
STATUS FINAL:
FASE:
ARQUIVOS LIDOS:
ACHADOS OK:
ALERTAS:
BLOQUEIOS:
ACOES NAO EXECUTADAS:
PROXIMO PASSO SEGURO:
MENSAGEM PARA A PROXIMA IA:
```
