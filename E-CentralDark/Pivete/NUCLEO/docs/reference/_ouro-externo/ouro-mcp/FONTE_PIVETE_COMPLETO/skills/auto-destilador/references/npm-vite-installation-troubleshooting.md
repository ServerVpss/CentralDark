# NPM/VITE INSTALLATION TROUBLESHOOTING — 2026-08-23

## PROBLEMA
`vite` listado no `package.json` e `package-lock.json` mas **NÃO instalado em `node_modules/`**.

## SINTOMAS
- `package.json`: `"vite": "^5.4.21"` ✅
- `package-lock.json`: `"vite": "^5.4.21"` ✅
- `node_modules/vite/` **NÃO EXISTE** ❌
- Global `vite` instalado mas `import 'vite'` no `vite.config.ts` falha (ESM precisa local)
- `node_modules/.bin/vite` **NÃO EXISTE** ❌

## CAUSAS IDENTIFICADAS
1. **npm cache corrompido** — `_cacache` com entradas órfãs
2. **Permissões/locks Windows** — `ENOTEMPTY`, `EPERM` ao limpar `node_modules`
3. **npm install silencioso** — não reporta erro mas não instala `vite`
4. **Peer dependency conflicts** — `@vitejs/plugin-react@6.x` requer `vite@^8` mas projeto usa `vite@5`

## SOLUÇÃO NUCLEAR (FUNCIONOU)

```bash
cd /e/CentralDark/Pivete/CentralDark

# 1. Limpeza nuclear Windows
cmd /c "rmdir /s /q node_modules 2>nul && del package-lock.json 2>nul"

# 2. Cache nuclear
npm cache clean --force
rm -rf ~/.npm/_cacache 2>/dev/null

# 3. Install com flags seguras
npm install --legacy-peer-deps --ignore-scripts --prefer-offline

# 4. Verificação OBRIGATÓRIA
ls node_modules/ | grep ^vite
# Deve mostrar: vite
```

## VERIFICAÇÃO PÓS-INSTALL
```bash
# Verificar vite local
ls node_modules/vite/
ls node_modules/.bin/vite*

# Build test
npx vite build
# ou
vite build
```

## PITFALLS EVITADOS
| Tentativa | Por que falhou |
|-----------|----------------|
| `npm install` simples | Cache corrompido, não instala vite |
| `npm install vite@5.4.21 --save-dev` | Peer conflicts com plugin-react v6 |
| `npm link vite` | Global não resolve import ESM local |
| `npm install --legacy-peer-deps` sozinho | Scripts travam (esbuild, playwright) |
| Global install only | ESM import falha sem local |

## CONFIGURAÇÃO FINAL QUE FUNCIONOU
```json
{
  "devDependencies": {
    "vite": "^5.4.21",
    "@vitejs/plugin-react": "^4.7.0",
    "lovable-tagger": "^1.1.13"
  }
}
```
> **Nota**: `vite@5.4.21` + `@vitejs/plugin-react@4.7.0` = compatíveis. Evitar `plugin-react@6.x` que exige `vite@^8`.

## COMANDOS DE VERIFICAÇÃO RÁPIDA
```bash
# Status vite
ls node_modules/vite/bin/vite.js 2>/dev/null && echo "OK" || echo "FALTA"

# Build test
npx vite build --mode production 2>&1 | tail -20

# Health check completo
curl -s http://localhost:8788/health | jq .proved
```

## REGRA DE OURO
> **NUNCA rode `npm run build` sem antes verificar `ls node_modules/vite/`**.
> Se `vite` não está em `node_modules/`, o build **SEMPRE falhará** com `ERR_MODULE_NOT_FOUND`.

---

**Última validação**: 2026-08-24 | Sessão: Build Total Local CentralDark | Status: RESOLVIDO