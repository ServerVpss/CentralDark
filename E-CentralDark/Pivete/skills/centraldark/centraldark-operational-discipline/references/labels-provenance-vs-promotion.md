# Labels: promoção, proveniência, comando e suporte

Use quando um CI/juiz parece exigir um modelo, agente ou label de origem.

## Método

1. Medir labels vivas no GitHub e labels declaradas no seed.
2. Buscar usos em `scripts/`, `.github/workflows/` e testes.
3. Classificar cada uso como `PROMOTION`, `PROVENANCE`, `COMMAND` ou `SUPPORT`.
4. Comparar `origin/main` com o HEAD do PR. Em `pull_request_target`, confirmar qual SHA é checkoutado.
5. Separar label de agente de autoridade, check obrigatório e permissão de merge.
6. Não apagar aliases sem consumidor, histórico e dependências comprovados.
7. Contraprovar com teste negativo: ausência/troca de `AGENTE-*` não deve mudar elegibilidade quando a label é só proveniência.

## Invariantes

```text
AGENTE_LABEL != AUTORIDADE
AGENTE_LABEL != JUIZ
AGENTE_LABEL != CHECK_REQUIRED
AGENTE_LABEL != MERGE_PERMISSION
BASE_RED != DELTA_RED
DOCUMENTED != EXECUTED
```

## Evidência mínima no relatório

- número de labels vivas;
- número no seed;
- diferença normalizada;
- PR labels atuais;
- arquivos/linhas que usam a label;
- consumidor e função provável;
- SHA da base e do PR;
- estado de checks no mesmo HEAD;
- aliases e labels sem consumidor provado;
- próximo cursor.

## Regra de entrega visual

Relatório pronto não é relatório entregue. Após escrever o Markdown, verificar arquivo, tamanho, leitura e hash quando necessário; depois abrir no Notepad e verificar a janela. Se a ferramenta de tela pedir elevação, registrar `BLOCKED`, sem afirmar que abriu.
