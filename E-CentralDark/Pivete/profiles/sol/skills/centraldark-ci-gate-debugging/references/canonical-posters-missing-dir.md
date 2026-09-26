# Gate "Cartazes canônicos" — ENOENT por nome de diretório divergente

## Sinais
- `gh run view <id> --log` mostra:
  ```
  Error: ENOENT: no such file or directory, open '.../docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS/manifest.json'
  ```
- Validator: `.agents/skills/visual-design-method/scripts/validate-canonical-posters.mjs`
- Caminho esperado pelo validator: `docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS/manifest.json`

## Causa
O diretório real existe com prefixo numérico `01-CARTAZES-CANONICOS/`, mas o
script espera `CARTAZES-CANONICOS/` sem prefixo. O `manifest.json` existe em
`docs/BRAIN/08-ARTEFATOS-VISUAIS/01-CARTAZES-CANONICOS/manifest.json`.

## Diagnóstico rápido
```bash
cd /e/CentralDark/Pivete/CentralDark
ls -la docs/BRAIN/08-ARTEFATOS-VISUAIS/
# deve mostrar 01-CARTAZES-CANONICOS/ (com prefixo) e ausência de CARTAZES-CANONICOS/
ls -la docs/BRAIN/08-ARTEFATOS-VISUAIS/01-CARTAZES-CANONICOS/manifest.json
node .agents/skills/visual-design-method/scripts/validate-canonical-posters.mjs
```

Se o validator falhar com ENOENT em `CARTAZES-CANONICOS/manifest.json`, o
diretório sem prefixo está faltando.

## Fix
```bash
cd /e/CentralDark/Pivete/CentralDark
ln -s 01-CARTAZES-CANONICOS docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS
node .agents/skills/visual-design-method/scripts/validate-canonical-posters.mjs
```

Deve retornar:
```
CANONICAL_POSTERS=PASS
CANONICAL_COUNT=4
SECOND_BRAIN_CONTRACT=MIRROR
SECOND_BRAIN_RUNTIME=NOT_PROVEN
GRAPH_AUTHORITY=DERIVED_PROJECTION_REFERENCE
```

## Verificação no CI
Após o fix, reexecuta o workflow ou espera o próximo `synchronize` do PR.
O gate "Cartazes canônicos" deve vir `success`.

## Por que não renomear o diretório
Renomear `01-CARTAZES-CANONICOS/` para `CARTAZES-CANONICOS/` pode quebrar
outros referenciais que usam o nome com prefixo. O symlink mantém ambos os
nomes válidos e é reversível.

## Estado desta receita
- Confirmado: 2026-09-04 no PR #1397 (fast-uri bump)
- Validator: `.agents/skills/visual-design-method/scripts/validate-canonical-posters.mjs`
- Fix aplicado: `ln -s 01-CARTAZES-CANONICOS docs/BRAIN/08-ARTEFATOS-VISUAIS/CARTAZES-CANONICOS`
- Validado local e no CI após push
