# Changelog

## v0.5.0 (2026-07-06)
- Grafo agora consome o feed VIVO (status.centralldark.com/graph-data.json) — 68 nós com status real do PM2, nós pulsam por online/offline
- Controles novos na toolbar: A+ / A− (tamanho da fonte dos rótulos) e 🏷️ labels (mostrar/ocultar nomes sempre visíveis)
- Corrige rótulos que só apareciam ao passar o mouse


## v0.4.0 (2026-07-06)
- View 3D real com 3d-force-graph bundleado (sem CDN, funciona offline)
- Nós com glow/pulso: online respira verde, offline pisca vermelho
- Labels de setor flutuando no centroide de cada grupo
- Ícone 🤖 em nós de agente (bot, mcp, hermes, etc)
- Controles: rotação automática, reset de câmera, clique para foco
- Poll a cada 5s do /api/graph (grafo.centralldark.com)
- Dependências: 3d-force-graph, three, three-spritetext

## v0.3.0 (2026-07-02)
- Notificação com botões "Atualizar agora" / "Depois" quando abre o Obsidian
- Modal de changelog mostrando o que mudou entre sua versão e a nova
- Botão de rollback pra voltar pra versão anterior se der ruim
- Verificação de integridade SHA-256 nos arquivos baixados
- Backup automático da versão atual antes de sobrescrever

## v0.2.1 (2026-07-02)
- Auto-update agora usa edge function pública (repo privado não travava mais)
- Corrigido "Falha ao checar atualização" causado por 404 do raw do GitHub

## v0.2.0 (2026-07-02)
- Auto-update via GitHub adicionado
- Aba de configurações ganhou seção de atualização
- Comando "Checar atualização agora" na paleta

## v0.1.0 (2026-06-30)
- Primeira versão do Grafo Vivo dentro do Obsidian
- Renderização do ecossistema CentralDark (bots, MCP, edge functions, módulos)
- View lateral + comando de abertura
