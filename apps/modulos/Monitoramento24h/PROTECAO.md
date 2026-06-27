# 🔒 PROTEÇÃO — Monitoramento 24h

> Esta pasta e a pasta `apps/modulos/hub` são **PROTEGIDAS**.

## A regra

Nenhuma inteligência artificial pode **alterar** arquivos aqui dentro sem o administrador
autorizar **explicitamente** com a frase exata:

> **Permito pivete**

## Como a trava funciona (3 camadas)

1. **Técnica (a que bloqueia de verdade):** hook do Claude Code em
   `.claude/settings.json` → `.claude/hooks/trava-protecao.py`. Ele **nega** qualquer
   escrita (Write/Edit) ou comando destrutivo dentro de:
   - `apps/modulos/Monitoramento24h`
   - `apps/modulos/hub`
   ...a menos que exista o sentinela `~/.claude/permito-pivete.unlock`, que só é criado
   quando o administrador diz **"Permito pivete"** (e removido ao terminar, pra re-travar).
2. **Documental:** este arquivo + o marcador `.protegido` + aviso no `CLAUDE.md`.
3. **Memória:** a regra está salva na memória do projeto e (futuramente) no Notion.

## Honestidade (sem enrolação)

Nenhuma trava local é **100%** contra um agente malicioso com acesso root — quem promete
isso está mentindo. O que esta trava garante:

- ✅ Impede **acidente** e **sobrescrita** por outra IA.
- ✅ Força qualquer IA cooperativa a **pedir permissão** antes de mexer.
- ✅ Combinada com a **aprovação humana no painel** (nada destrutivo roda sem seu clique),
  o risco prático fica baixíssimo.

Camada extra opcional (recomendada): travar arquivos críticos no nível do sistema
(`chattr +i`) e permissões restritas. Peça que eu aplico.

## Serviços que NUNCA devem ser tocados sem ordem explícita

- `/root/Multizap` (fora deste projeto — não mexer).
- `whatsapp-server` e `MultiZap-Gateway` (PM2) → devem permanecer **stopped**.
