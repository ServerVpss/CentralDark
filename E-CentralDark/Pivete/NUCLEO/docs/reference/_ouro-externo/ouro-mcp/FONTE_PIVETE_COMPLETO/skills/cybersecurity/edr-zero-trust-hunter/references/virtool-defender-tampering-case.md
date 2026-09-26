# Caso Real: VirTool:Win32/DefenderTamperingRestore + Freeze ChatGPT (2026-08-22)

## Resumo do Incidente
Dois eventos simultâneos mas **não correlacionados**:
1. **Defender detectou VirTool:Win32/DefenderTamperingRestore** às 16:42 — tentou desabilitar `BlockAtFirstSeen` via HKLM — **REMOVIDO automaticamente**
2. **Chrome/ChatGPT travando** — CSP bloqueou `eval` no bundle `chatgpt.com/cdn/assets/8a8b2d66-...js` + CSS `@property` ignorado

## Separação Forense (Meta Lupa FRIA)

| Evento | Causa Provada | Correlação com Freeze |
|--------|---------------|----------------------|
| DefenderTamperingRestore | Desconhecida (ProcessName=Unknown) — vetor provável: instalador/otimizador duvidoso | **NENHUMA** — as leituras/inventários do Hermes eram read-only |
| CSP eval blocked | Bundle do ChatGPT tentou execução dinâmica | **POSSÍVEL** — precisa timestamp exato para correlacionar |

## Lição Operacional

> **Não amarre alerta de segurança a desenvolvimento ativo sem prova causal.**
> 
> O Hermes estava apenas LENDO arquivos (find/ls/cat). Isso NÃO explica alteração no registro HKLM. Hipótese anterior foi **retractada**.

## Fluxo Correto Aplicado

```
FIO A (DEFENDER)          FIO B (SKILLS/CHATGPT)
├── Detectado 16:42       ├── CSP eval blocked
├── Remediado auto        ├── @property ignored  
├── Process=UNKNOWN       ├── Não assumir vírus
├── Investigação separada ├── Caçar causa do freeze
└── Aprendizado Hermes    └── Correção local reversível
```

## Aplicação no EDR Zero Trust Hunter

1. **Fase 0 (FRIA)** - `Get-MpThreatDetection` confirmou ameaça, status REMOVIDO
2. **Fase 1 (MÉDIA)** - Correlação temporal: EventID 4688 nas proximidades? (ProcessName=Unknown = lacuna)
3. **Fase 2 (QUENTE)** - Se achar processo pai → memory dump + Volatility
4. **Cristalização** - `knowledge-compiler` → rule/gate/IOC
5. **Registro MITRE** - T1562.001 no `Y_CYBERSEC-REF/mappings/mitre-attack/`

## Anti-Padrão Evitado

❌ "O Hermes causou o alerta do Defender" — **FALSO**
✅ "Dois fios independentes; investigar cada um com sua telemetria"

## Template de Separação para Próximos Incidentes

```markdown
## INCIDENTE COMPOSTO: [Evento A] + [Evento B]

### Fio A — [Evento A]
- Fato observado:
- Telemetria bruta:
- Correlação com atividade atual: [SIM/NÃO/PROVADO]
- Status: [CONFIRMADO/EM_INVESTIGAÇÃO/DESCARTADO]

### Fio B — [Evento B]  
- Fato observado:
- Telemetria bruta:
- Correlação com atividade atual: [SIM/NÃO/PROVADO]
- Status: [CONFIRMADO/EM_INVESTIGAÇÃO/DESCARTADO]

### Decisão: SEPARAR OU FUNDIR?
- Se NÃO há prova causal → SEPARAR (dois fios)
- Se HÁ prova causal → FUNDIR (um fio com cadeia)
```