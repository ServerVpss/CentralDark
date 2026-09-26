# OUTRO - structure.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\docs\structure.md
**SHA:** ea203de66c571ca5
**Timestamp:** 2026-08-26T19:32:47.580133
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- ## Regra: 5 minutos

### Ouro Bruto (primeiros 5000 chars)
```
<p align="right">
  <samp>🟢 <strong>Última atualização:</strong> 2026-05-31 às 04:00 BRT</samp>
</p>

# Estrutura do Monorepo

## Onde fica cada coisa

| O que | Onde | Regra |
|-------|------|-------|
| Código de produção | `apps/` | Só código ativo que roda |
| Código compartilhado | `packages/` | Reutilizável entre apps |
| Infraestrutura | `infra/` | DB, deploy, configs |
| Documentação | `docs/` | Só docs atuais |
| Código antigo | `archive/` | Legado, não roda |

## Apps

| App | Stack | Porta | Domínio |
|-----|-------|-------|---------|
| `apps/bot` | React + Vite + Supabase | 5173 | bot.multizap.dev |
| `apps/crm` | TanStack Start + Supabase | 3000 | crm.multizap.dev |
| `apps/web` | Static | — | multizap.dev |

## Padrão de nomes

- Pastas: `kebab-case`
- Componentes: `PascalCase.tsx`
- Services: `camelCase.ts`
- Scripts: `kebab-case.sh`

## Regra: 5 minutos

Se alguém novo não entender a estrutura em 5 minutos, ela está errada.

```