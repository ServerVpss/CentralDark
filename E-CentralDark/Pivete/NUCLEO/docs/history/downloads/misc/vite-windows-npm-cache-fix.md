# Vite + npm no Windows — Cache/Config Fix Pattern

## Problema
`npm install` retorna "up to date, audited 504 packages" mas **não extrai `vite` para `node_modules/`**.
`vite build` falha com `ERR_MODULE_NOT_FOUND: Cannot find package 'vite'`.

## Sintomas
| Check | Resultado |
|-------|-----------|
| `package.json` | `"vite": "^5.4.21"` ✅ |
| `package-lock.json` | `vite: "^5.4.21"` ✅ |
| `npm install` | "up to date" ✅ |
| `node_modules/vite/` | **NÃO EXISTE** ❌ |
| `node_modules/.bin/vite` | **NÃO EXISTE** ❌ |
| Global `vite` | Instalado ✅ |

## Causa Raiz (Windows)
1. **Cache npm corrompido** — `_cacache` com lixo impedindo extração
2. **Globalconfig errada** — `npm config get globalconfig` → `C:\Users\danda\AppData\Roaming\npm\etc\npmrc` (arquivo inexistente/corrompido)
3. **Userconfig errada** — `~/.npmrc` apontando para globalconfig inexistente

## Fix Nuclear (ordem exata)

```bash
# 1. Limpar TUDO
cmd /c "rmdir /s /q E:\CentralDark\Pivete\CentralDark\node_modules 2>nul"
cmd /c "del E:\CentralDark\Pivete\CentralDark\package-lock.json 2>nul"

# 2. Limpar cache npm COMPLETAMENTE
npm cache clean --force
cmd /c "rmdir /s /q %LOCALAPPDATA%\npm-cache\_cacache 2>nul"

# 3. Remover config global problemática
npm config delete globalconfig 2>nul
cmd /c "del %USERPROFILE%\.npmrc 2>nul"

# 4. Reinstalar DO ZERO
cd /e/CentralDark/Pivete/CentralDark
npm install --legacy-peer-deps

# 5. Verificar
dir node_modules\vite

# 6. Build
vite build
```

## Prevenção
- **NÃO** usar `npm install -g` como workaround permanente
- **NÃO** alternar versões aleatoriamente
- **NÃO** apagar `node_modules`/`lockfile` repetidamente sem limpar cache
- Verificar `npm config list` antes de instalar — `globalconfig` e `userconfig` devem apontar para arquivos válidos
- Usar `--legacy-peer-deps` apenas quando necessário (peer conflicts reais)

## Lição
> `npm install` dizer "up to date" **NÃO GARANTE** que pacotes foram extraídos para `node_modules/`.
> No Windows, cache corrompido + config global errada = extração silenciosa falha.
> Sempre verificar `ls node_modules | grep ^vite` após install.