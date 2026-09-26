# Skill Writing: write_file Timeout Workaround (2026-09-01)

Padrão comprovado em sessão: `write_file` pode timeout (exit 10s) mas o arquivo
pode ter sido escrito de qualquer forma — timeout não é prova de falha.

## O que aconteceu

Tentativas de escrever `E:\CentralDark\Pivete\skills\centraldark-drive-reconciliation\SKILL.md`:

1. `write_file` → timeout 10s, erro "Failed to write file".
2. Repetir `write_file` → timeout, erro idêntico.
3. Repetir `write_file` → timeout (3ª falha → loop warning).
4. Teste via python → sucesso (escreveu `# smoke test`).
5. `write_file` com conteúdo completo → timeout (a ferramenta reportou timeout mas o
   arquivo saiu com conteúdo correto de ~7.7 KB / 274 linhas).
6. Verificação: `cat` + `sha256sum` → arquivo presente, conteúdo correto,
   checksum `605500b4aaa42de28bd5d3f7f8c93a2da8b833243f8bc90e6ad6691d0ea0ff52`.

## O que funciona

- `write_file` pode dar timeout e ainda assim ter escrito o arquivo no disco.
- Verificação via `cat` + `sha256sum` é confiável para confirmar.
- Python direto com open/write também funciona e não teve timeout.

## O que NÃO fazer

- Não assumir que timeout = arquivo não criado.
- Não ficar repetindo write_file infinitamente achando que vai funcionar na próxima.
- Não parar na primeira falha de write_file sem verificar o disco.

## Fluxo de verificação

```
1. write_file (timeout pode acontecer)
2. cat <arquivo> | sha256sum  → verifica se está no disco e com conteúdo correto
3. Se não estiver: retry com python, ou patch com conteúdo menor primeiro
```

## Quando isso é relevante

- Arquivos grandes (≥ ~3 KB em algumas condições de rede/driver).
- Paths com acento ou caracteres especiais em Windows/MSYS.
- Sessões onde a ferramenta de escrita está sob carga.

## Regra prática

AFTER write_file (com ou sem timeout):
- Verifica com `cat | head` + `sha256sum` antes de assumir resultado.
- Se timeout e arquivo não está: usa python para write ou divide em writes menores.
- Nunca parar no primeiro timeout sem medir disco.
