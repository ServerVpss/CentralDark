# OUTRO - -auditoria-branch-policy-revisao.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\security\reports\-auditoria-branch-policy-revisao.md
**SHA:** 76b96c1ab07eb2d7
**Timestamp:** 2026-08-26T19:32:53.298676
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- # Diagnóstico de Bloqueio: Repository Rule Violations

### Ouro Bruto (primeiros 5000 chars)
```
# Diagnóstico de Bloqueio: Repository Rule Violations

## Causa Raiz
O repositório `clone-deck` ativou Branch Protection Rules exigindo "Changes must be made through a pull request" na `main`. Isso significa que qualquer "push direto" para `main` será bloqueado (Error GH013).

## Como Contornar de Forma Segura e Lógica
Não devo usar `git push origin main`.
Devo:
1. Criar uma nova branch local: `git checkout -b fix/docs-auto-orquestrador`.
2. Fazer push para a branch remota: `git push origin fix/docs-auto-orquestrador`.
3. Informar o usuário e deixar que a automação (ou o usuário) proceda com o PR `gh pr create` -> `gh pr merge`.

Assim obedeço à proteção sem depender de tokens vazados.

```