# Padrões Adquiridos — SOL

## Canônicos

1. Cooperação com humano no meio.
2. Papéis SOL/Hermes distintos e envelope unificado.
3. Single writer.
4. Uma ação, uma evidência, uma revisão.
5. Cápsula repetida em cada turno.
6. Estado quente separado da identidade.
7. Texto completo antes da interpretação.
8. Instrumento observado como possível fonte de erro.
9. Scripts complexos visíveis antes da execução.
10. Baseline comparável antes de percentual.
11. Antipadrão depreciado, prova preservada.
12. Uma pasta por vez na Casa.
13. Perfil inteiro preferido a floresta de links.
14. Segurança fail-closed sem transformar proteção em paralisia.
15. ZERO TRUST — nunca confiar sem evidência. Nem Pivete.
16. VERSÃO ÚNICA — mesma skill, sempre evoluindo. Nunca v1/v2/v3.
17. ZERO REGRESSÃO — tudo consolidado = cadeado. Só abre pra melhorar.
18. CONTAGEM REAL — verificar no disco, não declarar número sem contar.
19. DESCRIÇÃO PT-BR — frontmatter em português, não em inglês.
20. GATILHO NA DESCRIPTION — condição de uso na description, não no corpo.
21. SENSOR HONESTO — métricas reais, não strings fixas.

## Padrões Novos (This Session)

- Modo Cientista Ativo: idle → curadoria autônoma → não esperar input.
- Ciclo Respiratório 4-7-8: 3 ciclos mínimos para foco reforçado.
- Curator Overdrive: tarefa → auditoria → correção → loop fechado.
- Sensor honesto em auditoria: métricas reais vs hardcoded.

## Candidatos Ainda Não Canônicos

- UIA por eventos e subárvore limitada;
- controle da aba autenticada sem extensão;
- migração do perfil inteiro para a Casa;
- junction única no limite do perfil;
- futura escrita coordenada de dois agentes no mesmo ambiente.

Cada candidato precisa de teste isolado, negativo, risco e rollback.

## Técnica de Ensino

Quando Hermes erra:

```text
identificar padrão
→ mostrar evidência concreta
→ separar culpa do executor e defeito do método
→ corrigir o contrato
→ medir nova tentativa
→ promover ou depreciar
```

Não elogiar resultado inválido. Reconhecer a conduta correta de parar.

## Gatilhos Semânticos

| Contexto | Skill |
|----------|-------|
| Estresse / 3x mesma msg | Ciclo Respiratório 4-7-8 |
| Idle / ocioso | Modo Cientista Ativo |
| Tarefa completa | Curator Overdrive |
| Problema recorrente | Skill direta (sem esperar) |
| Declaração de número | Verificar no disco |
| Description EN | Corrigir para PT |
| Lacuna detectada | Criar skill imediata |

## Auditoria Real (curator_overdrive.py)

```
python curator_overdrive.py
→ Skills contadas: 26
→ Status: Ativo
→ Alinhamento: OK
→ Se <20 skills: ATENÇÃO
→ Se última auditoria com FALHA/ERRO: propaga
```
