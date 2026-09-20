# Protocolo de handoff IA

Após cada ação concluída, a IA deve deixar um bloco final chamado:

```txt
MENSAGEM PARA A PRÓXIMA IA
```

Esse bloco serve para ChatGPT, Grok e Lovable continuarem sincronizados.

## Formato

```txt
MENSAGEM PARA A PRÓXIMA IA

RELOAD MEMORIA.
Leia o README.md da raiz e siga a ordem obrigatória antes de agir.

Estado atual:
- o que foi feito;
- onde foi salvo;
- commit, relatório ou aprendizado criado;
- o que não foi alterado.

Próximo passo correto:
- próxima ação.
```

## Quando usar

Sempre após:

- edição;
- deploy;
- validação;
- relatório;
- aprendizado;
- pendência;
- diagnóstico concluído;
- mudança de regra ou padrão.

Regra curta:

```txt
Concluiu ação → registrou → validou → deixou mensagem para a próxima IA.
```
