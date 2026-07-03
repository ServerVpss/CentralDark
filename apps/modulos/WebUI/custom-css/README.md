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
