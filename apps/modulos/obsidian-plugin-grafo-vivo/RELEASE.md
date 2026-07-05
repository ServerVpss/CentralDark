# Release do Plugin — Fluxo Automatizado

O workflow `.github/workflows/obsidian-plugin-release.yml` publica release + tag no GitHub sozinho quando o `manifest.json` ou `checksums.json` do plugin muda em `main`.

## Cortar uma nova versão

1. Bumpar `version` em `manifest.json` (ex: `0.4.0` → `0.5.0`).
2. Adicionar entrada no topo do `CHANGELOG.md` no formato:
   ```md
   ## v0.5.0 (2026-07-06)
   - descrição da mudança
   - outra mudança
   ```
3. Buildar e gerar manifestos do auto-updater:
   ```bash
   npm run build
   node gerar-release-assets.mjs
   ```
4. Commitar os 4 arquivos essenciais + qualquer código:
   ```bash
   git add manifest.json changelog.json checksums.json main.js src/
   git commit -m "release(plugin): v0.5.0 <resumo>"
   git push origin main
   ```
5. O workflow dispara sozinho, roda no runner self-hosted da VPS e publica a release `obsidian-plugin-v0.5.0` com os 3 assets (`main.js`, `manifest.json`, `styles.css`).

## Republicar manualmente

Se precisar republicar sem bumpar versão (ex: recuperar release deletada):

1. Vá em **Actions → Obsidian Plugin Release → Run workflow**.
2. Se a tag já existir, o job `detect` pula (`skip=true`). Delete a tag primeiro pelo GitHub UI:
   ```bash
   git push --delete origin obsidian-plugin-v0.5.0
   ```

## Rollback

1. GitHub → Releases → deletar a release ruim.
2. Deletar a tag: `git push --delete origin obsidian-plugin-v<versao>`.
3. O próprio plugin tem rollback embutido (settings) que restaura o backup local da versão anterior no Obsidian.

## Convenções

- **Tag:** `obsidian-plugin-v<semver>` (prefixo separa de outras tags do monorepo).
- **Assets obrigatórios:** `main.js`, `manifest.json`, `styles.css`.
- **Runner:** `self-hosted` (padrão do repo).
- **Guardas:** valida SHA-256 antes de publicar; recusa release se checksum não bate.

## Como o auto-updater consome

O plugin no Obsidian consulta a edge function `grafo.centralldark.com/api/live` (que espelha o release mais recente) e baixa os 3 assets diretamente dos releases do GitHub. Zero passo manual pra usuário final.
