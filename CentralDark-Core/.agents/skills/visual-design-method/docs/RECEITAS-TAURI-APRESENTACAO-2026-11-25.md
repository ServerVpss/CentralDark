# Receitas comprovadas — Tauri / apresentação local — 2026-11-25

Fonte: sessão prática na Casa `SEGREDO`.
Owner de aprendizado: `visual-design-method`.
Escopo: apresentação visual local, WebView secundário, assets, UX mínima e contraprova.
Não inclui stealth/WDA, ocultação de sessão ou mecanismos para impedir o usuário de encerrar a assistência.

## R1 — WebviewWindow secundária branca no Windows

**Sintoma:** a janela nativa nasce no tamanho certo, mas o conteúdo fica branco/vazio e o `PAGE_LOAD` não chega.

**Receita comprovada:**
- quando um comando Tauri cria `WebviewWindowBuilder` no Windows, torne o comando `async`;
- mantenha a criação da janela fora de um fluxo síncrono que possa bloquear a thread do WebView;
- depois do delta, teste a navegação real da janela, não só a existência da janela.

**Contraprova mínima:** `IMAGEM -> janela nasce -> PAGE_LOAD -> conteúdo visível -> fechar -> painel principal continua vivo`.

## R2 — Página estática própria para apresentação

Quando a janela secundária precisa apenas mostrar uma imagem/alerta, não suba o React inteiro de novo.
Use uma página local dedicada, por exemplo:
- `app/public/presentation-image.html`;
- `app/public/presentation-maintenance.html`.

A janela deve apontar para o asset/página local do app. `HTTP 200` ou arquivo existente não basta: é obrigatório confirmar renderização visual.

## R3 — Resolver, validar, escalar e só então exibir o asset

Lógica reaproveitada do app antigo (`SingleOverlay.show_img`) na parte segura:
1. resolver o asset por caminhos válidos do projeto;
2. validar que o arquivo/imagem realmente carregou;
3. ajustar escala ao alvo/tela sem deformar;
4. só então exibir;
5. se falhar, registrar a causa em vez de abrir uma superfície vazia.

Regra: `ASSET_EXISTS != ASSET_RENDERED`.

## R4 — UI mínima de apresentação

Para manter a superfície limpa sem perder saída visível:
- usar apenas um `×` discreto no topo;
- remover textos grandes como `RESTAURAR · ESC`;
- bloquear `contextmenu` do WebView quando ele só expõe ações de navegador;
- bloquear `dragstart` da imagem para evitar arraste acidental;
- não remover toda forma visível de encerramento.

Arquivos comprovados nesta sessão:
- `app/public/presentation-image.html`;
- `app/public/presentation-maintenance.html`.

## R5 — Realidade visual vence suposição de DOM/acessibilidade

Uma árvore de acessibilidade pobre não prova, sozinha, que o conteúdo falhou.
Ordem de verificação:
1. captura visual da janela alvo;
2. evento de carregamento/navegação;
3. DOM/acessibilidade;
4. logs.

Regra: `WINDOW_CREATED != WEBVIEW_LOADED != VISUALLY_CORRECT`.

## R6 — Branding sem resíduo de protótipo

Para promover uma superfície já funcional:
- busca global por `Demo`, `DEMO`, `Demonstração`, `Protótipo`, `MODO PROTÓTIPO`;
- remover rótulos temporários sem alterar a lógica;
- validar build e Rust check após a troca;
- conferir o título final renderizado.

Nesta sessão, o alvo aprovado foi:
`CENTRALDARK OS - ANY DESK TELA PRETA`.

## Checklist de fechamento

- [ ] Build passa
- [ ] Rust check passa
- [ ] janela secundária abre
- [ ] conteúdo aparece visualmente
- [ ] só os controles aprovados ficam visíveis
- [ ] fechamento remove a janela secundária
- [ ] painel principal continua respondendo
- [ ] logs não mostram falha de navegação

Só declarar `FIXED_POINT` quando a contraprova inteira passar.
