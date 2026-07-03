# Organização dos arquivos `.md` da raiz

## Objetivo

Deixar a raiz do repositório com apenas um arquivo Markdown de entrada: `README.md`.

Antes havia múltiplos arquivos competindo como porta de entrada para ChatGPT, Grok e Lovable, causando risco de leitura divergente.

## Resultado

A raiz passa a ter apenas:

- `README.md`

Os demais arquivos foram movidos para locais corretos:

| Arquivo antigo | Novo local |
|---|---|
| `CHECKPOINT-IA.md` | `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md` |
| `REGRAS_DA_EQUIPE.md` | `docs/CONSCIENCIA/01-REGRAS-DA-EQUIPE-IA.md` |
| `CHECKPOINT.md` | `docs/CONSCIENCIA/ARQUIVO-MORTO/root-md-antigos/CHECKPOINT-2026-06-07.md` |
| `START_HERE.md` | `docs/CONSCIENCIA/ARQUIVO-MORTO/root-md-antigos/START_HERE-antigo.md` |
| `LEIA-ME-IA.md` | `docs/CONSCIENCIA/ARQUIVO-MORTO/root-md-antigos/LEIA-ME-IA-absorvido.md` |
| `lovable-sync-check.md` | `docs/RELATORIOS/2026-06-04-lovable-sync-check.md` |

## Novo padrão

Toda IA deve começar pelo `README.md` e seguir a ordem:

1. `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md`
2. `docs/CONSCIENCIA/APRENDIZADOS.md`
3. `docs/PENDENCIAS.md`
4. `docs/RELATORIOS/`
5. revisões recentes da VPS, quando houver
6. `#FASE deploy`, quando envolver deploy

## Não alterado

- CRM
- Caddy
- PM2
- Docker/WuzAPI
- Banco real
- WhatsApp/sessões
- Domínios
