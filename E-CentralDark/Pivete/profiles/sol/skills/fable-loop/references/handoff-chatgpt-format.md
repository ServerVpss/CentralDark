# Handoff ChatGPT Format — Canonical Template

> Template exato para o Front 10 do FABLE LOOP. Use este formato ao produzir o handoff final para o CHEFE entregar ao ChatGPT.

---

## Formato Obrigatório

```
=== HANDOFF CHATGPT ===

MEASURED_AT=2026-09-01T03:58:00-03:00
CENTRALDARK_BRANCH=feat/fixed-point-fabric-proof-20260831
CENTRALDARK_HEAD=da89bbd30bad751417ccb70aa13c17112fa7ce3b
ACTIVE_PR=#1381
WRITER_SCOPE=scripts/health_check.sh

NOTEPAD:
  WINDOWS_FOUND=147
  TABS_FOUND=271
  UNSAVED_TABS=3
  FILE_BACKED_TABS=12
  DEDUPED_ITEMS=19
  SENSITIVE_QUARANTINED=3
  HISTORICAL_ITEMS=21
  CURRENT_CANDIDATES=8
  FORMAT_VERIFIED=true

CURRENT_FACTS:
- Notepad LocalState.zip: 121.679 bytes, 120 arquivos .bin extraídos
- 42 tabs com texto legível (4.641 linhas), 72 snapshots delta
- 3 itens sensíveis quarentenados: credencial, token, email
- Tab 50b0a5d9: 104KB — MCP CentralDark, codex_apps.list_projects, builder
- Tab 18eb71e4: 17KB — "VOC ECONSGUE MONNTA UM PACOTAO" (10 jul)
- Tab a6d1b691: 21KB — "Thought for 9s... Boa, Pivete. Lovable ↔ GitHub"
- Tab e15088c5: 18KB — "RESULTADO FRIO: profile separado Pivete/Hermes"
- Tab d3aec70f: 9KB — "Na outra conta do ChatGPT... Projeto: Central"
- Tab 4c2305e7: prompt "Atue como Arquiteto de Sistemas da CentralDark"
- Tab b4c8c72e: prompt "#ACORDA ou !CALIBRAR... Consulte GitHub remoto"
- Tab f8646533: comando ngrok config add-auth-token
- Tab fb975bc0: comando curl para lista de modelos online
- Caminhos detectados: C:\CentralDark\, C:\Users\danda\OneDrive\, \\wsl.localhost\docker-desktop\

SUPERSEDED_HISTORY:
- Sessão Charizard 2026-08-31: deploy VPS, chattr +i, Caddy routes (já revertido/aplicado)
- Sessão Charizard 2026-08-28: builder estático, elite 8080→8082, domínios mortos
- PEM-drift investigation: branch pivete/work/pem-drift-rootcause, 3 scripts criados
- Session-intelligence-harvester: owner existe, suporta WindowState/TabState

OPEN_GAPS:
- GitHub current state: não medido nesta sessão (branch, HEAD, PRs, writers)
- Google Drive: não investigado
- Hermes runtime: não medido (processos, ports, config)
- Providers/models: não medido
- Local site: não medido (PID, port, URL, HTTP, UI smoke)
- Garimpo: não mapeado
- Fixed Point: não atingido (handoff incompleto)

CONTRADICTIONS:
- Notepad tabs mostram "Lovable ↔ GitHub funciona em tempo real" mas GitHub state não medido
- PEM-drift scripts criados mas não testados em runtime real
- PR #1381 owner vivo mas CI status UNKNOWN (sem workflow runs associados ao HEAD)

IPNAMES_DELTA:
- Não aplicável nesta sessão (não usado)

NEXT_SAFE_ACTION:
1. Medir GitHub ServerVpss/CentralDark atual (branch, HEAD, PRs, writers)
2. Reconciliar CURRENT_CANDIDATES do Notepad contra estado vivo
3. Produzir patch mínimo no PR #1381 (writer único)
4. Meta Lupa contraprova → Reality Judge
5. Se PASS → HANDOFF fechado; se FAIL → BLOCKER real

=== END HANDOFF ===
```

---

## Regras de Validação do Handoff

| Regra | Descrição |
|-------|-----------|
| **MEASURED_AT** | ISO 8601 com timezone |
| **CENTRALDARK_HEAD** | SHA completo (40 chars) |
| **CURRENT_FACTS** | Só fatos medidos e reconciliados contra estado atual |
| **SUPERSEDED_HISTORY** | Fatos antigos úteis, explicitamente marcados como superados |
| **OPEN_GAPS** | Só UNKNOWN material — não hipóteses |
| **CONTRADICTIONS** | Histórico vs realidade atual, com evidência |
| **NEXT_SAFE_ACTION** | Menor delta material seguinte, acionável |
| **NO HISTORICAL PROMOTION** | HISTORICAL != CURRENT — nunca promover sem prova |

---

## Como usar

1. Preencha todos os campos obrigatórios
2. Se um campo não tem dados, escreva `NÃO MEDIDO` ou `N/A` — não invente
3. Cada fato em `CURRENT_FACTS` deve ter rastreabilidade (SHA, path, log line)
4. `SENSITIVE_QUARANTINED` conta itens, NÃO exibe valores
5. Entregue como bloco copiável (markdown code block) ou arquivo `.md`