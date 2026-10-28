# ÍNDICE DE PESQUISA — CentralDark

**Entrada:** [SKILL.md](../SKILL.md) · **Mapa operacional:** [CATALOGO.md](CATALOGO.md) · **Delegação universal:** [HERMES-KANBAN-RECEITA-UNIVERSAL.md](../references/HERMES-KANBAN-RECEITA-UNIVERSAL.md).

## Consulta rápida por intenção

| Quero fazer... | Onde começar | Buscar por |
|---|---|---|
| Ativar `!michelin` / aplicar método 3 estrelas | [Skill Michelin](skills-integradas/michelin-3-estrelas/SKILL.md) + [Protocolo](../references/MICHELIN-3-ESTRELAS-PROTOCOLO.md) + receita da tarefa | `!michelin`, `MICHELIN_3_ESTRELAS`, `construir`, `integrar`, `provar` |
| Encontrar Lembrança e Aprendizado Michelin | Fonte `docs/LEMBRANCAS/metodo-chefe-conformidade-michelin-20261019.md` e registro `docs/CONSCIENCIA/APRENDIZADOS/2026-10-24-MICHELIN-3-ESTRELAS-SKILL-HERMES-CASA.md` | `MICHELIN`, `LEMBRANCAS`, `APRENDIZADOS` |
| Delegar qualquer missão ao Hermes | Receita universal | `kanban`, `create`, `assignee` |
| Selecionar diretório Windows/Linux na hora | Receita universal, seção de variáveis/rotas | `WORKSPACE_ALVO`, `WORKSPACE_TARGET` |
| Escolher modelo, provedor e esforço de raciocínio | [Cadeia/fallback + inventário de reasoning](../references/HERMES-FREE-TIER-FALLBACK.md) + GitHub oficial NousResearch antes da leitura local | `provider`, `model`, `reasoning_effort`, `minimal`, `low`, `medium`, `high`, `Desktop` |
| Escolher técnica de execução | [Kimetsu Remix](../../kimetsu-brainstorm/SKILL.md) + [17 Respirações](../references/regenerative-self-refinement-engine.md) | `SPIKE`, `BOUNDED`, `ARCHITECTURAL`, `BREATH_ID`, `Concentração`, `Lua`, `Inseto`, `Fixed Point` |
| Provar criação/exclusão de arquivo | Receita universal, seção de readback | `ID_MISSAO`, `DONE`, `Test-Path` |
| Diagnosticar erro de agente | Skill Opus Magus + logs no host | `APIConnectionError`, `runs` |
| Descobrir ferramenta/capacidade | Capability HUD | `capability`, `preflight` |
| Localizar dono e evitar duplicação | Reuse Runtime | `reuse`, `owner` |
| Operar Cockpit/boot | Boot, Intent Router e Live Editing | `boot`, `HUD`, `Cockpit` |
| Deploy, esteira, GitHub e VPS | Esteira Motor + Intent Router | `workflow`, `VPS`, `CI` |
| Integrar VS Code e observabilidade | VS Code Log Bridge | `vscode`, `log` |

## Capacidades CentralDark disponíveis na Skill-Mãe

| Intenção | Pasta integrada |
|---|---|
| Atualizar notas vivas | [centraldark-note-maintenance](skills-integradas/centraldark-note-maintenance/SKILL.md) |
| Operar o Hermes, cron e conexões | [centraldark-hermes-operations](skills-integradas/centraldark-hermes-operations/SKILL.md) |
| Reconciliar checklist diário | [reconciliacao-diaria-centraldark](skills-integradas/reconciliacao-diaria-centraldark/SKILL.md) |
| Comparar prova, fonte e runtime | [centraldark-evidence-reconciliation](skills-integradas/centraldark-evidence-reconciliation/SKILL.md) |
| Operar Casa, GitHub e VPS | [centraldark-ops](skills-integradas/centraldark-ops/SKILL.md) |
| Consultar Oracle/Preview | [centraldark-oracle-surface](skills-integradas/centraldark-oracle-surface/SKILL.md) |

**Todas as demais capacidades CentralDark** seguem na [lista de módulos](CATALOGO.md) e no [índice completo de arquivos](INDICE-VIVO.md). Quando houver `scripts/` ou `references/` de um módulo, estão dentro da pasta desse módulo. Evitar escolher por nome parecido sem ler a intenção.

## Busca textual própria (somente leitura)

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File 'K:\.agents\skills\centraldark-operational-method\scripts\pesquisar-catalogo.ps1' -Termo 'kanban'
```

Troque `'kanban'` pela palavra da intenção. A busca cobre o conteúdo da skill canônica e os módulos copiados; **o índice não é um serviço nem um segundo catálogo remoto**.

## Proveniência dos arquivos incorporados


- centraldark-autonomous-conflict-costura/SKILL.md | origem: K:\.agents\skills\centraldark-autonomous-conflict-costura\SKILL.md
- centraldark-auto-sync-vscode/package.json | origem: K:\.agents\skills\centraldark-auto-sync-vscode\package.json
- centraldark-boot/SKILL.md | origem: K:\.agents\skills\centraldark-boot\SKILL.md
- centraldark-boot/references\example-boot-output.md | origem: K:\.agents\skills\centraldark-boot\references\example-boot-output.md
- centraldark-capability-hud/SKILL.md | origem: K:\.agents\skills\centraldark-capability-hud\SKILL.md
- centraldark-esteira-motor/INTERLIGADOS.md | origem: K:\.agents\skills\centraldark-esteira-motor\INTERLIGADOS.md
- centraldark-esteira-motor/SKILL.md | origem: K:\.agents\skills\centraldark-esteira-motor\SKILL.md
- centraldark-esteira-motor/references\sessao-erros-reais.md | origem: K:\.agents\skills\centraldark-esteira-motor\references\sessao-erros-reais.md
- centraldark-hub-credential-control-plane/SKILL.md | origem: K:\.agents\skills\centraldark-hub-credential-control-plane\SKILL.md
- centraldark-intent-deploy-router/SKILL.md | origem: K:\.agents\skills\centraldark-intent-deploy-router\SKILL.md
- centraldark-live-editing-fabric/SKILL.md | origem: K:\.agents\skills\centraldark-live-editing-fabric\SKILL.md
- centraldark-reuse-runtime/runtime-binding.desired.json | origem: K:\.agents\skills\centraldark-reuse-runtime\runtime-binding.desired.json
- centraldark-reuse-runtime/SKILL.md | origem: K:\.agents\skills\centraldark-reuse-runtime\SKILL.md
- centraldark-unified-surface-parity/SKILL.md | origem: K:\.agents\skills\centraldark-unified-surface-parity\SKILL.md
- centraldark-vscode-log-bridge/SKILL.md | origem: K:\.agents\skills\centraldark-vscode-log-bridge\SKILL.md

<!-- AUTOCATALOGO:INICIO -->
## Índice vivo (gerado automaticamente)

**Última verificação:** 2026-10-28 19:33:30 -03:00; 94 arquivos catalogados; 18 skills.

Consulte [INDICE-VIVO.md](INDICE-VIVO.md) para **criação, modificação e SHA de cada arquivo**, e [VALIDACAO-AUTOMATICA.md](VALIDACAO-AUTOMATICA.md) para alertas.
<!-- AUTOCATALOGO:FIM -->
