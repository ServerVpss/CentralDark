# custom-css/ — Tema Esmeralda 3D para Open WebUI

## O que é isso?

Esta pasta contém o arquivo `esmeralda.css` — a identidade visual do **Design System 3D Tátil Esmeralda** adaptada para o Open WebUI.

O tema implementa:
- 🟢 **Paleta Emerald light** como cor primária (`hsl(152, 65%, 32%)`)
- 🧱 **Sombras 3D táteis** em botões, cards e composer (multi-camada com inset highlight)
- 📐 **`border-radius: 12px`** (rounded-xl) em botões, cards e mensagens
- ✉️ **Mensagens do usuário** em fundo emerald + texto branco
- ✍️ **Mensagens do assistant** sem background (composição limpa)
- 💬 **Composer/textarea** com borda emerald sutil, shadow-3d-soft, ring no foco
- 📋 **Dropdowns e menus** com shadow-3d + rounded-xl
- 🖱️ **Scrollbar** fina na cor emerald
- ☀️ **Light mode forçado** via `html { color-scheme: light }`

O arquivo é montado como read-only no container em:
```
/app/backend/static/custom.css
```

O Open WebUI carrega automaticamente `/static/custom.css` ao iniciar, sem nenhuma configuração extra no painel admin.

---

## Como recarregar após editar o CSS

O volume é bind-mount `:ro` — basta **reiniciar o container**:

```bash
# Na VPS, dentro do diretório do projeto:
docker restart open-webui

# Ou via docker compose (se quiser recriar o container):
docker compose -f docker-compose.yml -f docker-compose.override.yml restart webui
```

A mudança aparece ao dar **F5** no navegador (sem cache: `Ctrl+Shift+R`).

---

## Como o Pivete edita uma cor rapidamente

Todas as variáveis editáveis ficam no **topo do `esmeralda.css`**, no bloco marcado:

```css
/* ╔═══════════════════════════════════════════════════════╗
   ║  VARIÁVEIS EDITÁVEIS — Pivete edita só aqui          ║
   ╚═══════════════════════════════════════════════════════╝ */

:root {
  --em-primary:       hsl(152, 65%, 32%);  /* ← muda aqui pra trocar a cor principal */
  --em-primary-glow:  hsl(152, 70%, 40%);  /* ← hover do primary */
  --em-radius:        12px;                /* ← arredondamento padrão */
  /* ... */
}
```

### Exemplos de troca rápida

| Intenção | Variável | Valor novo |
|---|---|---|
| Primary mais vivo | `--em-primary` | `hsl(160, 84%, 39%)` |
| Arredondamento menor | `--em-radius` | `8px` |
| Arredondamento maior | `--em-radius` | `16px` |
| Sombra mais sutil | `--em-shadow-3d-soft` | remover camadas `inset` |

Depois de salvar, rodar `docker restart open-webui` e F5 no browser.

---

## Arquivos nesta pasta

| Arquivo | Descrição |
|---|---|
| `esmeralda.css` | Tema Esmeralda 3D light — **este é o ativo** |
| `emerald.css` | Tema Emerald dark (versão anterior, mantido como referência) |
| `README.md` | Este arquivo |

---

## 🧠 Painel Hermes (Cadeia de Modelos)

Adiciona um botão flutuante **H** no canto inferior direito do WebUI que abre o editor da cadeia de modelos do Hermes (reordenar, ativar/desativar, mudar timeout, reverter último backup).

**API:** todas as chamadas vão pra `https://api.centralldark.com/hermes/*` (mesmo host, mesmo token de admin do gateway).

### Arquivos
- `hermes-panel.css` — visual do FAB + modal (já importado no fim do `esmeralda.css`)
- `hermes-panel.js` — lógica do painel (buscar / salvar / reverter)

### Instalação (uma vez só)
1. `docker restart CentralDark-WebUI` — o mount novo já carrega o CSS.
2. No WebUI, abra **Admin → Settings → Interface → Custom JavaScript**.
3. Cole o conteúdo INTEIRO de `hermes-panel.js` no campo e salve.
4. F5 na página. Um botão verde **H** aparece no canto inferior direito.
5. Primeiro clique pede o token da API — cole o mesmo token que o gateway usa (fica salvo no localStorage do navegador).

### Fonte da verdade
O painel edita `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/cadeia.json`. Backups automáticos (últimos 5) ficam em `cadeia.backups/`. O decisor.mjs recarrega o arquivo a cada 60s — **não precisa reiniciar PM2**.
