# NPM OMIT=DEV FIX PATTERN — Session 2026-08-24

## PROBLEMA
Build falha com `ERR_MODULE_NOT_FOUND` para `vite`, `@esbuild/win32-x64`, `@rollup/rollup-win32-x64-msvc` apesar de estarem no `package.json` e `package-lock.json`.

## CAUSA RAIZ
`npm config get omit` retorna `dev` (default do npm 12+). npm **intencionalmente não instala** `devDependencies` e `optionalDependencies`.

## DIAGNÓSTICO RÁPIDO
```bash
npm ls vite --depth=0              # vazio
npm config get omit --location=user --location=global --location=project  # dev/dev/dev
cat package.json | grep -A 20 '"devDependencies"'  # vite, esbuild, rollup em devDependencies
```

## CORREÇÃO MÍNIMA (sempre funciona)

### Override imediato (sem mutar config)
```bash
npm install --include=dev --legacy-peer-deps
```

### Fix persistente (após provado)
```bash
npm config set omit=dev --location=user  # instala dev, omite optional
# OU
npm config set omit="" --location=user   # instala tudo
```

## REALITY JUDGE (4 pós-condições obrigatórias)
```bash
npm ls <dep> --depth=0 && npx <dep> --version && npm run build
```

## CONTRA-PROVA
```bash
rm -rf node_modules && npm install --include=dev --legacy-peer-deps && npm run build
```

## SKILLS CRIADAS PARA ESTE PADRÃO
- `heal-vite-npm-dependency` — `OMIT_DEV_CAUSES_VITE_ABSENCE`
- `heal-esbuild-optional-deps` — `OPTIONAL_DEPS_OMITTED_ESBUILD`
- `heal-rollup-optional-deps` — `OPTIONAL_DEPS_OMITTED_ROLLUP`

## REGRA DEFINITIVA
```bash
# SEMPRE:
npm install --include=dev --legacy-peer-deps && npm run build

# NUNCA:
npm install --legacy-peer-deps  # FALHA com omit=dev default npm 12+
```

## LIÇÃO
> O `omit=dev` É DEFAULT DO NPM 12+ E NÃO DÁ PRA REMOVER COMPLETAMENTE.
> SEMPRE USE `--include=dev` PARA INSTALAR DEVDEPENDENCIES.