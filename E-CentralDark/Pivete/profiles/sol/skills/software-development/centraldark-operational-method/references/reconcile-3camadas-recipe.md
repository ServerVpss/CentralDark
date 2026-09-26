# RECIPE — Reconcile-Before-Write em 3 Camadas

Padrão validado 2026-08-24 para absorver acervo externo no CentralDark sem
duplicar e sem tocar canônico sem prova. Complementa a lição 42b do SKILL.md.

## Ordem obrigatória (CHEFE confirmou: REMOTO PRIMEIRO)

```
1. medir canônico remoto (ref local, sem fetch se já fast-forward)
2. mapear remoto (git ls-tree) -> índice de nomes
3. cruzar acervo externo x remoto -> marcar JA_EXISTE / VERIFICAR_GAP
4. só então abrir ZIP/conteúdo -> hash interno -> contraprova
5. escrever no repo SÓ com GAP_PROVADO + Writer único + worktree isolado
```

## Camada 1 — Perfil ↔ SOUL-SOL (identidade)

Harness: `casa_boot.py` (em `profiles/pivete/` ou `skills/.../scripts/`).
Lê SOUL-SOL LOCAL, mede sha256/mtime, checa **presença de CONCEITO** (não
linha literal). Imprime `OK|DRIFT|UNKNOWN`. Nunca edita/copia o canônico.

PITFALL: comparar linha-a-linha marca DRIFT falso (perfil usa
`SINGLE_WRITER_PER_SCOPE=ENFORCED`, canônico usa `ONE_WRITER_PER_SCOPE=true`).
Checar CONCEITO, não linha.

## Camada 2 — Acervo ↔ origin/main (estrutura)

```bash
# remoto via índice git (sem rede se ref local presente)
git -C E:/CentralDark/Pivete/CentralDark ls-tree -r --name-only origin/main

# ou working-tree local
git -C E:/CentralDark/Pivete/CentralDark ls-files
```

PITFALL DE PERFORMANCE: `os.walk` no clone estoura 180s (`.cache.zip` 1.5gb,
node_modules, BACKUPS). Usar `git ls-files` / `git ls-tree` -> O(1) barato.

Normalizar nome (`re.sub(r'[^a-z0-9]','', nome.lower())`) e cruzar contra o
índice remoto. Marcar `JA_EXISTE_REMOTO` vs `VERIFICAR_GAP`.

Evidência real: 3967 paths remotos × 56 itens PASTA_TRANCADA = **0 duplicados**.

## Camada 3 — ZIP ↔ repo (conteúdo, Fase 2 pendente)

Ainda não executado. Plano: abrir ZIP, hash de cada arquivo interno, cruzar
contra índice remoto+local por sha. Só escreve quem tem `GAP_PROVADO` +
`DONO_CANONICO` definido.

## Pasta TRANCADA — pitfall de path

O nome real tem cadeado e NÃO é o que aparece em screenshot/transcrição:
- ERRADO (transcrição): `PASTA TRANCADA APELO CHEFE PERMITO MINERACAO`
- CERTO (disco):   `🔒PASTA TRANCADA APELO CHEFE🔒` (em `OneDrive/Área de Trabalho`)

Sempre `find`/`ls` antes de hardcodedar path. Caracteres emoji no nome de
pasta quebram glob ingênuo; usar lista explícita de `os.listdir`.

## Scripts (R1 read-only, prova real)

- `casa_boot.py` -> `status=OK` após patch MENOS_E_MAIS
- `mapear_remoto.py` -> REMOTE_MAP.json + cruza INVENTARIO.json
- `absorver_pasta_trancada.py` -> INVENTARIO.json (56 itens, sha256 de cada,
  0 extraídos, 0 escritos no repo)

Canônico (repo): `.agents/skills/centraldark-operational-method/scripts/`
(commit `56be97e7d` no branch `docs/cristalizar-reconcile-3camadas`).
