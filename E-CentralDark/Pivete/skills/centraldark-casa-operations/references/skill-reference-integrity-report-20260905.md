# centraldark-casa-operations — Reference Integrity Report (2026-09-05)

## Verificação de integridade das referências do SKILL.md

Data da medição: 2026-09-05  
Agente que mediu: solar-pro4:free (Nous)  
Workspace: E:\CentralDark\Pivete\skills\centraldark-casa-operations

## Referências do corpo SKILL.md — status por arquivo

### References DIR (shipped, verificadas)

Estes arquivos existem no diretório `references/` da skill e são acessíveis via
`skill_view(name="centraldark-casa-operations", file_path="references/<nome>.md")`:

- `brain-vault-casa-vs-github.md` — EXISTE
- `brazos_centraldark.md` — EXISTE
- `caddy-route-mapping.md` — EXISTE
- `cadeia-free-watchdog-pattern.md` — EXISTE
- `cadeia-free-watchdog.md` — EXISTE
- `centraldark-multiwindow-orchestration.md` — EXISTE
- `ci-gate-debugging.md` — EXISTE
- `contribuinte_centraldark.md` — EXISTE
- `copilototo_centraldark.md` — EXISTE
- `cristalizacao-garimpo-chefe-20260902.md` — EXISTE
- `delta-continuo-banda-kanban.md` — EXISTE
- `empirical-git-proof.md` — EXISTE
- `empirical-merge-proof.md` — EXISTE
- `enxame-omega-multiventana.md` — EXISTE (conteúdo real, não placeholder)
- `extensions_centraldark.md` — EXISTE
- `fable-loop-fixed-point.md` — EXISTE
- `fable-loop-garimpo-crystalization-measure.md` — EXISTE
- `forensic-reporting-format.md` — EXISTE
- `fragment-stream-anti-loop.md` — EXISTE
- `garimpo-html-nao-e-stub-chrome.md` — EXISTE
- `git-merge-semantics-empirical-proof.md` — EXISTE
- `merge-base-as-reference.md` — EXISTE
- `meta-lupa-self-improvement-loop.md` — EXISTE
- `metalupa-como-organismo.md` — EXISTE
- `multi-source-readonly-test-20260902.md` — EXISTE
- `omni-router-sse-stream-patch.md` — EXISTE
- `ours-cego-bug-empirical-proof.md` — EXISTE
- `porta-de-entrada-gate-anatomy.md` — EXISTE
- `profile-reconciliation.md` — EXISTE
- `prova-de-motor.md` — EXISTE
- `resolve-conflicts-fix.md` — EXISTE
- `resource-breathing-governor.md` — EXISTE
- `script_centraldark.md` — EXISTE
- `skill-format-template.md` — EXISTE
- `system-breathing-memory-cleanup.md` — EXISTE
- `tiktak-relay.md` — EXISTE
- `voice-phone-fixed-point.md` — EXISTE
- `vps-incident-2026-08-27.md` — EXISTE
- `watchdog-script-execution-windows.md` — EXISTE
- `webui-8788-omni-router-free-tier.md` — EXISTE
- `windows-cron-cloudflared-webui-8788.md` — EXISTE

### broken_reference (não encontrada no sistema)

- `related_skills: autonomous-ai-agents` — skill_view retorna "not found" no sistema
  Hermes desta sessão (2026-09-05). O skill não está instalado/listado.

## Lição para o curador

O corpo do SKILL.md lista `autonomous-ai-agents` como `related_skills`, mas este
skill não está disponível no sistema neste momento. Se a intenção é que a skill
dependa desse skill relacionado, a referência quebrada deve ser corrigida (ou o
skill dependente deve ser instalado/listado). Se era apenas uma sugestão de
exploração, a nota de broken_reference aqui registrada serve como aviso.

Verificação efetuada:
```
skill_view(name="autonomous-ai-agents") → "Skill 'autonomous-ai-agents' not found."
available_skills list → não contém autonomous-ai-agents
```
