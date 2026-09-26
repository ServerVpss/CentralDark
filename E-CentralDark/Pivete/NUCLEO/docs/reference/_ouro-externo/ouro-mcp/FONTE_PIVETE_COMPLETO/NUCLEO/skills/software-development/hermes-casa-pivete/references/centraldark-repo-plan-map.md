# CentralDark Repo — Mapa de Planos e Intenção do Pivete (read-only)

Quando o Pivete diz "cadê meu plano", "to perdido", "quero saber de tudo",
"leia o repo todo", "acha minha intenção": use ESTE mapa + a receita abaixo.
Nada de escrita — só leitura (R0). Autorização permanente R0 do Pivete cobre
investigação; não autoriza download, instalação, escrita destrutiva, VPS ou gasto.

## Receita de investigação read-only (E: drive)

`search_files` FALHA em `E:` (IO error 3 → retorna `total_count:0` FALSO).
NUNCA use search_files para o repo. Use terminal + `git grep`:

```bash
cd /e/CentralDark/Pivete/CentralDark
git grep -li "TERMO" -- '*.md' 2>/dev/null | head -20
```

Para varrer vários termos, rode em paralelo no mesmo turno (batch independente):
- `JARVIS|jarvis` → planos JARVIS
- `FABLE|FABLE_JUDGE|fable` → skills Fable/loop/judge
- `PLANO|intencao|objetivo` → planos mestres
- `OpenClaw|SOL` → ponte OpenClaw/SOL
- `loop|LOOP` → loop de auto-correção / fable-loop

Depois de achar os paths, leia com `read_file` (MSYS `/e/` funciona no read_file
mesmo quando o search_files falha — mas terminal git grep é o finder confiável).

## Mapa canônico de documentos de intenção

| Path | O que é | Estado (03/08/2026) |
|---|---|---|
| `docs/PLANO-MESTRE-RETOMADA-CASA-METALUPA-APIS-NEGOCIOS.md` | PLANO-MESTRE JARVIS do Pivete (1174 linhas) — fábrica visual autônoma, 1 Jarvis / 2 corpos / 1 autoridade | planejamento consolidado p/ revisão; NÃO executa instalação |
| `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` | Orquestração JARVIS: papéis (Pivete / SOL / Executor / Debugger / Revisor), 1 escritor por escopo | canônico na main |
| `docs/PENDENCIAS.md` | Fonte ÚNICA de pendências do projeto | ativo; #1/#3/#5/#9 em aberto |
| `docs/RELATORIOS/2026-07-28-auditoria-fable-vs-metalupa.md` | Auditoria FABLE Method vs META LUPA | Sem ganho causal do Fable; MetaLupa venceu |
| `.agents/contratos/delta-canonico/runner.py` | Contrato Delta Canônico; `FABLE_JUDGE` = 3 correções de defeito aqui | ativo |
| `apps/modulos/WebUI/personas/fabler-system.md` | Persona **Fabler**: só leitura + análise + recomendação | ativo |
| `docs/CONSCIENCIA/` | 45 docs de identidade/regras da Casa | canônico |

## FABLE / loop — 3 coisas distintas (não confundir)

1. **Fabler** (`apps/modulos/WebUI/personas/fabler-system.md`): persona interna
   "só leitura + análise + recomendação", usa `gemini_analisar` como cérebro auxiliar.
2. **fable-method** (upstream `Sahir619/fable-method` v1.4.0, plugin Claude): 4 skills —
   `fable-method`, `fable-loop`, `fable-judge`, `fable-domain`. Instalado isolado em
   `/tmp` na auditoria; NÃO fusionado no roteamento canônico.
3. **`FABLE_JUDGE`** (no código `delta-canonico/runner.py`): 3 achados de defeito que o
   julgamento Fable provou (mission_id, tipo de valor, calibrar embutia recibo). É
   correção de código, não skill ativa.

## Veredito da auditoria FABLE vs META LUPA (03/08, autorizado)

```
OPUS5_META_LUPA_GAIN_PROVEN=SIM   (score 2/2 replicado)
FABLE_CAUSAL_GAIN_PROVEN=NAO
FABLE_CAUSALITY=INDETERMINADA
FABLE_STATUS=EXPERIMENTAL_FAIL_CLOSED
FABLE_DEFAULT_ROUTING=NAO
FABLE_SILENT_FALLBACK=PROIBIDO
```

Fable NÃO entra no roteamento canônico. Só entra se superar Opus puro com ≥2 seeds
válidas por braço (A/B/C/D) e mesmo modelo/fixture/timeout. MetaLupa é a camada de
veredito que venceu a prova.

## 3 superfícies (a confusão do Pivete)

| Onde | O que é |
|---|---|
| Terminal / `localhost:8648` | Eu — processo Hermes, profile pivete |
| `localhost:18789` (OpenClaw Control) | Painel OpenClaw — outra ferramenta; SOL opera por lá |
| GitHub `ServerVpss/CentralDark` | Repo canônico dos planos (código, não chat) |

Detalhe em `hermes-pivete-local-ops` §24 (OpenClaw vs Hermes).

## Imagens do Pivete = erro de crédito, não conteúdo

Nesta sessão as 3 imagens anexadas eram `400 no remaining credits` (OpenRouter zerado)
— backend de visão cego por crédito, não por path. Ver `hermes-pivete-local-ops` §18.5
(classificação de erro de visão: 404 em URL direta + backend sem resposta = visão FORA,
crédito zerado → 400).
