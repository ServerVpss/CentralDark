# Vault BRAIN — numeração 10×10 (2026-09-03)

## Regra

Número + nome. Teto 10 irmãos/nível. Sem gaveta vazia. Camada extra só se o item não encaixar na categoria existente.

```
endereço 03/02/02 = Documentação / Biblioteca / catálogo
```

Lookup medido (catalog.json): path direto ~0.00013s vs rglob docs/ ~0.76s. Ganho = coordenada compartilhada (Obsidian + Hermes), não mágica 5800× em tudo.

## CASA vs GitHub

Vault = `docs/BRAIN` **dentro** do clone `E:\CentralDark\Pivete\CentralDark`.
Obsidian lê o disco. GitHub só vê após commit+push.
Delta 2026-09-03 ficou working tree (pr1393), **não** em origin/main.
Medir separado: `git status -- docs/BRAIN` + `git ls-remote origin refs/heads/main`.

Drive `catalog.json observed_at=2026-08-22` = INDEXED_REFERENCE histórico. Não é sync vivo.

## Árvore aplicada (mínimo)

- `01-CONCEITOS/01-ARTEFATOS` … `07-OURO` (sem 08 vazio; `09-IDEIAS-VISUAIS.md` ficou arquivo)
- `03-DOCUMENTACAO/01-AGENTS-LIBRARY/{01-INDICES,02-AGENTES,03-LINKER}` — Linker saiu dos 10 agentes
- `03-DOCUMENTACAO/02-BIBLIOTECA` + `03-GUIAS`
- `00-MAPA-SISTEMA/{01-HUB,02-GRAFOS,03-MOCS}` — overflow de 20 arquivos
- `07-APRENDIZADOS-MEMORIAS/{01-OURO,02-SESSOES}`
- `09-RASCUNHO/` — canvas Sem título
- Duplicata `00 - Mapa do Sistema/` **não fundida** (GRAFO-VIVO SHA diferente; um era binário)

## Wikilink

Obsidian resolve por **stem** do arquivo. Rename de pasta não quebra `[[BRAIN]]`.
`[[BIBLIOTECA]]` precisa de `BIBLIOTECA.md` (nota-pasta), não só `README.md`.

## Não fazer

- Não preencher 10 com pasta vazia
- Não tratar JSON SWARM 2026-06-29 como estado atual
- Não ligar nota 0 byte
- Não procurar HTML ouro em Downloads de 40 bytes
