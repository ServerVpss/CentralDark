# Reorganização: Arsenal Council num lugar só

## Diagnóstico
Hoje tá espalhado em dois cantos:
- `docs/CONSCIENCIA/ARSENAL/` → scripts, `regras.json`, `EVOLUCAO/`, `DEBATES/`
- `docs/RELATORIOS/ARSENAL-COUNCIL/` → README + relatórios das fases 3, 4, 6

Isso obriga a caçar em dois lugares. Vou juntar tudo dentro de **`docs/CONSCIENCIA/ARSENAL/`** (fonte única) e deixar só atalhos apontando pra lá.

## Nova estrutura (fonte única)

```text
docs/CONSCIENCIA/ARSENAL/
├─ README.md                    ← índice geral (o que era do RELATORIOS/README.md)
├─ regras.json
├─ scripts/
│   ├─ arsenal-council.sh
│   └─ hermes.sh
├─ RELATORIOS/                  ← movido de docs/RELATORIOS/ARSENAL-COUNCIL/
│   ├─ fase-3-nucleo-universal-telegram.md
│   ├─ fase-4-regras-configuraveis.md
│   ├─ fase-6-hermes-autonomo.md
│   └─ (futuras fases aqui)
├─ DEBATES/                     ← já existe
└─ EVOLUCAO/                    ← já existe (saída do Hermes)
```

## O que muda em cada lugar

1. **Mover** `docs/RELATORIOS/ARSENAL-COUNCIL/*.md` → `docs/CONSCIENCIA/ARSENAL/RELATORIOS/` (via `git mv` pra preservar histórico).
2. **Apagar** a pasta `docs/RELATORIOS/ARSENAL-COUNCIL/` (fica vazia depois do move).
3. **Criar atalhos (arquivos-link `.md` de 1 linha)** apontando pra dentro da CONSCIENCIA, nos pontos onde alguém pode procurar:
   - `docs/RELATORIOS/README.md` → "Arsenal Council mudou pra [docs/CONSCIENCIA/ARSENAL/RELATORIOS/](../CONSCIENCIA/ARSENAL/RELATORIOS/)"
   - `docs/PENDENCIAS.md` (append no rodapé): link pro índice do Arsenal
   - `CLAUDE.md` seção 1 (mapa do cérebro): adicionar bullet "Arsenal Council → `docs/CONSCIENCIA/ARSENAL/README.md`"
4. **Atualizar `docs/CONSCIENCIA/ARSENAL/README.md`** (novo índice consolidado):
   - Visão geral do sistema
   - Links: Regras · Scripts · Relatórios por fase · Debates · Evolução (Hermes)
   - Tabela de fases (3 ✅ · 4 ✅ · 5 🟡 em andamento · 6 ✅)
5. **Ajustar caminhos internos** nos relatórios que mencionem paths antigos.

## Depois disso, seguimos pra Fase 5
Painel visual "Conselho Vivo" em `status.centralldark.com` — card mostrando último debate, verdict do juiz, e status dos slots do `regras.json`. Continuo crescendo o Arsenal daí em diante (fase 7+: aprendizado cruzado entre debates, memória vetorial, etc).

## Detalhes técnicos
- Uso `git mv` pros relatórios (mantém histórico).
- Atalhos são `.md` puros com 1-3 linhas de redirect (sem symlink — Git no Windows quebra).
- Nenhuma mudança em código executável (scripts, bot, cron do Hermes) — só documentação e organização de pastas.
- Notificação Telegram no final (privado admin + canal Status), como manda a regra.
