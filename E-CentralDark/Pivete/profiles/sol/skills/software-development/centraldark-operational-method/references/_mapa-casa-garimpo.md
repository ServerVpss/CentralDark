# _MAPA_CASA — Garimpo workspace (reconciliation prospecting)

## Estrutura da pasta

`E:\CentralDark\_MAPA_CASA\` é um workspace de prospectação de reconciliação. Subpastas:

| Pasta | Conteúdo |
|-------|----------|
| A_EVIDENCIAS/ | arquivos de prova do sistema (ReAgent, logs, receipts) |
| B_GITHUB_REMOTO/ | estado do ServerVpss/CentralDark (commits, PRs, heads) |
| C_HERMES_LOCAL/ | mapeamento do Hermes local (AppData, skills, config, SOUL) |
| D_OURO_DESCARTADO/ | material externo que NÃO é da Casa |
| E_PASTAS_USUARIO/ | C:\Users\danda, G:\ClaudeContas, G:\temp, C:\c |
| F_RECONCILIACAO_GROK/ | zips de reconciliacao grok |
| G_WEBMCP_INSPECAO/ | extensões Chrome instaladas |
| H_ZIP_INVENTARIO/ | inventário de todos os zips em Downloads |

Pasta especial: `PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE/` — onde o CHEFE dropa arquivos para garimpo.

## Fluxo de garimpo

1. Ler `00-INDICE-MESTRE.md` — snapshot estrutural
2. Ler a pasta específica que o CHEFE mencionou — índice pode estar defasado
3. Ler `B_GITHUB_REMOTO/00-ESTADO.md` — HEAD remoto, PRs, feridas
4. Cruzar com repo: `git fetch origin` + comparar branches/HEADs + verificar se os arquivos/assuntos têm rastro no GitHub
5. Reportar: o que é NOVO (jogado mas não implementado) vs o que já tem registro

## Pitfalls

- **Índice desatualizado**: o índice não reflete arquivos recentes — sempre ler pasta física também
- **grep/find timeout em dirs grandes**: graphify-out tem milhares de JSON AST — buscar por termo, não varredura total; excluir subdir problemático do escopo
- **Asumir que o que está na pasta já está no repo**: cruzar com B_GITHUB_REMOTO antes de propor anything

## Estado medido (2026-08-28)

Pasta `PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE/` contém:
- **futebol.flac** (áudio)
- **futebol.mp3** (áudio)
- **janela.jpg** (imagem)
- **janela.expandida.jpg** (imagem expandida)
- **Lei que regula o tratamento de dados no Brasil (LGPD) + Google verifica automaticamente a sua identidade.pdf** (documento)

Esses arquivos NÃO estavam no índice mestre `00-INDICE-MESTRE.md` (snapshot 2026-08-18/19). Não há registro no repo remoto sobre esses arquivos específicos — cruzamento pendente com B_GITHUB_REMOTO.
