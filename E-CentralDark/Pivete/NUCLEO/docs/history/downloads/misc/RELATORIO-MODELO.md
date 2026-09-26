# Modelo de Relatorio do Agente Mestre

Use este modelo para registrar auditorias e handoffs de memoria.

O texto deve ser simples, direto e compreensivel para humano leigo.

## Cabecalho

```txt
Data:
Hora BRT:
Agente:
Fase:
Tipo de acao: read-only | documental | bloqueada
```

## STATUS FINAL

Resumo em uma frase:

```txt
OK / ALERTA / ERRO
```

Explique o resultado em linguagem simples.

## FASE

```txt
Fase atual:
Fase pausada:
```

## ARQUIVOS LIDOS

Liste somente arquivos realmente lidos.

```txt
- /root/README.md
- /root/CentralDark/README.md
- ...
```

## ACHADOS OK

Liste o que esta correto.

```txt
- Memoria principal encontrada.
- Pendencias lidas.
- Relatorios recentes encontrados.
```

## ALERTAS

Liste problemas que nao bloqueiam, mas precisam de atencao.

```txt
- Informacao duplicada em dois documentos.
- Relatorio recente ainda nao citado no README.
```

## BLOQUEIOS

Liste o que impede continuar.

```txt
- Arquivo obrigatorio ausente.
- Acao exige confirmacao humana literal.
- Risco de tocar em segredo ou servico sensivel.
```

## ACOES NAO EXECUTADAS

Deixe claro o que ficou fora.

```txt
- Nao toquei em Caddy.
- Nao toquei em Docker.
- Nao abri secrets.
- Nao rodei PM2.
- Nao fiz merge.
```

## PROXIMO PASSO SEGURO

Uma acao pequena e objetiva.

```txt
Continuar com auditoria read-only.
```

ou:

```txt
Pedir confirmacao humana literal antes de qualquer acao sensivel.
```

## MENSAGEM PARA A PROXIMA IA

```txt
RELOAD MEMORIA.
Leia /root/README.md, /root/CentralDark/README.md, docs/CONSCIENCIA/APRENDIZADOS.md, docs/PENDENCIAS.md e relatorios recentes antes de agir.

Fase atual:
Fase pausada:
O que foi feito:
O que nao foi tocado:
Proximo passo:
```
