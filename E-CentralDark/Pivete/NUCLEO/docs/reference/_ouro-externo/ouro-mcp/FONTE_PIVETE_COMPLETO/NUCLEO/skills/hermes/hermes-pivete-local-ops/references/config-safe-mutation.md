# Mutação segura de `config.yaml`

Use para qualquer ajuste local no `config.yaml` do profile ativo.

## Contrato

```text
localizar profile real
→ backup byte a byte
→ hash prévio
→ alteração mínima
→ diff integral
→ parser/`config get`
→ prova do consumidor
→ preservar rollback
```

## Procedimento

1. Obtenha o caminho com `hermes --profile <nome> config path`; não presuma `~/.hermes`.
2. Copie o arquivo para um backup timestampado no mesmo diretório e calcule SHA-256.
3. Prefira `hermes --profile <nome> config set <chave> <valor>` para chaves simples, mas trate sua saída como **candidato**, não como prova final.
4. Compare o arquivo inteiro com o backup. Algumas versões serializam novamente o YAML e podem remover comentários, reordenar blocos ou normalizar formatação não relacionada.
5. Se o diff tocar qualquer trecho fora da chave autorizada, restaure o backup antes de tentar outra técnica.
6. Quando o guardião recusar `patch` em configuração sensível, use uma edição determinística com âncora única: recuse duplicata, substitua ou acrescente somente o bloco autorizado e preserve todo o restante.
7. Valide o YAML pelo consumidor (`hermes --profile <nome> config get <chave>`) e rode o status do subsistema afetado.
8. Só declare concluído quando o diff final contiver exclusivamente a mudança autorizada e o estado resolvido confirmar o novo valor.

## Rollback

Restaure o backup e confirme que o hash voltou ao valor prévio. Não apague o backup durante a mesma missão.

## Pitfalls

- `config set` com exit code 0 prova que o comando gravou; não prova que o diff foi mínimo.
- Comentários removidos não mudam o YAML resolvido, mas constituem perda de artefato e devem ser restaurados.
- Não usar edição textual sem âncora única; duplicar uma chave YAML pode mudar qual valor vence.
- Restart só entra quando a documentação do consumidor disser que a configuração é carregada no boot.