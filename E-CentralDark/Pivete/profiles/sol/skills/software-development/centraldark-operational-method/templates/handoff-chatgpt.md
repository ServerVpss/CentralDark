# Handoff ChatGPT — Formato Canônico

Formato definido pelo CHEFE para handoff de inteligência preparada pelo Hermes e entregue ao ChatGPT do CHEFE quando ele quiser.

**Consumidor final:** ChatGPT do CHEFE.
**Papel do Hermes:** preparar a inteligência. O CHEFE decide quando entregar.
**Não é automático:** o Hermes não posta o handoff para Figma/Slack/Telegram/DEPLOY. Superfícies de coordenação ≠ destino final.

## Template

Copiar e preencher com o que foi realmente medida/confirmação. Campos vazios ou UNKNOWN quando não há acesso/comprovação. Sem inventar conteúdo.

```markdown
=== HANDOFF CHATGPT ===

MEASURED_AT: <timestamp UTC da medição>
CENTRALDARK_BRANCH: <branch atual>
CENTRALDARK_HEAD: <HEAD atual>
ACTIVE_PR:
  - <número>: "<título>"
    branch: <branch>
    state: <estado>
    HEAD: <SHA>
    author: <autor>
    comment: <comentário do revisor, se houver>
    files: <n arquivos>
WRITER_SCOPE: <NONE ou nome-do-escritor-declarado>
NOTEPAD:
  - WINDOWS_FOUND: <true/false/NAO_EXISTE_NESTE_AMBIENTE>
  - TABS_FOUND: <número ou UNKNOWN>
  - UNSAVED_TABS: <detectados/UNKNOWN>
  - FILE_BACKED_TABS: <detectados/UNKNOWN>
  - OBS: <observação sobre o que foi minerado, owner do minerador, protocolo, etc.>
DEDUPED_ITEMS: <número ou VAZIO>
SENSITIVE_QUARANTINED: <número ou VAZIO>
HISTORICAL_ITEMS: <número ou NÃO_MEDIDO_NESTE_CICLO>
CURRENT_CANDIDATES: <número ou VAZIO>
FORMAT_VERIFIED: <SIM/NÃO>
CURRENT_FACTS:
  - <fato medido agora, um por linha>
OBSERVED_EVIDENCE:
  - <evidência observável, com timestamp se pontual>
SUPERSEDED_HISTORY:
  - <afirmação antiga que foi invalidada pela mudança de ambiente/estado>
OPEN_GAPS:
  - <material que não está acessível para mim agora>
CONTRADICTIONS:
  - <ausência de contradição ou lista de contradições encontradas>
IPNAMES_DELTA: <vazio ou correlação observável>
UNKNOWN:
  - <itens que não puderam ser confirmados>
NEXT_SAFE_ACTION:
  - <próximo passo seguro, sem inventar>
=== END HANDOFF ===
```

## Regras de preenchimento

- Só preencher com o que foi medida/confirmação. Se não tem acesso, não inventa.
- UNKNOWN para itens sem acesso/comprovação. Não confundir UNKNOWN com PASS.
- SUPERSEDED_HISTORY para afirmações antigas que a mudança de ambiente invalidou.
- CURRENT_FACTS só com o que foi medida AGORA, não com execuções anteriores sem revalidação.
- NEXT_SAFE_ACTION sem inventar — só ações que realmente se podem executar com o que há.
- Sem parar em plano: ou handoff completo, ou blocker real, ou decisão humana material.
- Inventário ≠ filtragem: tem material minerado não é "já filtrado". Filtra o útil vs lixo com o critério do usuário.
- Destino: ChatGPT do CHEFE. Figma/Slack são coordenação, não o consumidor final.
