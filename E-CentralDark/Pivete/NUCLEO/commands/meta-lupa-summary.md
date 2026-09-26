# COMANDO - meta-lupa-summary.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\references\meta-lupa-summary.md
**SHA:** 74e4446a501bc4b6
**Timestamp:** 2026-08-28T02:57:24.937130
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- DECISÃO:

### Padroes
- Regra: para provar que algo está versionado, medir **o que um checkout limpo entrega** — não o que a árvore de trabalho exibe.

### Contratos
- META_LUPA_GATE=PASS

### Ouro Bruto (primeiros 5000 chars)
```
# META LUPA — RESUMO OPERACIONAL

Fonte: `.agents/skills/meta-lupa/SKILL.md` (canônico, identidade validada via `AUTOLUPA_CANONICAL_SHA`)

## O que é

Motor de auditoria da Casa. Transforma `mapa → evidência → crença → teste → decisão → AutoLupa → consolidação` em análise explícita, reproduzível, proporcional ao custo do erro.

Não substitui contratos já promovidos (LEIA-ME-IA.md, JARVIS-ORQUESTRACAO...). Vigente quando tarefa for crítica: deploy, consolidação, merge, migração, segurança, regressão, alteração da própria skill.

## Invariante de falsificação

Alegação de sucesso apoiada só por painel verde, status `Scheduled`, HTTP 200, ausência de erro ou listagem de recurso = evidência insuficiente do funcionamento ponta a ponta.

Saída obrigatória: `VEREDITO=BLOQUEAR` (ou `CORRIGIR`), `FALSO_VERDE_BLOQUEADO=SIM`, prova contrária ou próximo teste concreto. Proibido combinar `VEREDITO=APROVAR/APROVADA` com evidência insuficiente.

### Falso verde de instrumento

Ausência de resultado em um instrumento não é evidência de ausência no sistema. Só vale como prova quando dois canais de proveniência distinta concordarem.

### Falso verde de versionamento

| Aparência | O que pode estar por trás | Teste que resolve |
|-----------|---------------------------|-------------------|
| `git status` limpo | gitlink órfão: submódulo sem `.gitmodules` apontando para commit inexistente | `git ls-tree <ref> <caminho>`; modo `160000` = gitlink |
| blob local = ref remota | ref remota é cache local, pode estar defasada/deletada no servidor | `git ls-remote origin <branch>` ou `git fetch` e reler |
| merge sem conflito, exit=0 | conteúdo de um lado descartado silenciosamente | `git diff <merge-base> <outro-lado> -- <arquivo>` |
| verificação passa no código novo | checagem já falhava antes — não mede regressão | rodar mesma checagem no código original e comparar |
| arquivo existe no disco | pode não estar versionado nem alcançável por outros | checkout limpo em worktree detached e contagem |

Regra: para provar que algo está versionado, medir **o que um checkout limpo entrega** — não o que a árvore de trabalho exibe.

## Três temperaturas operacionais

| Modo | Quando usar | Saída mínima |
|------|-------------|--------------|
| **FRIA** | R0/R1, fatos locais | `MODO=FRIA`, fato, resultado, prova, lacuna |
| **MÉDIA** | 401, 404, 429, timeout, contradição, evidência fraca, drift, falso verde, R2 | `MODO=MEDIA`, hipótese, variável alterada, canal, resultado binário, delta, prova contrária, camada localizada |
| **QUENTE** | R3/R4, produção, auth, dados, merge, alteração da skill, recorrência, CAÇA_AO_ERRO | `MODO=QUENTE`, contratos, observadores, testes, rollback, registro, autorização, ponto fixo |

Escalonamento: comece FRIA → contradição escala para MÉDIA → criticidade/recorrência/promoção escala para QUENTE → ponto fixo resfria e encerra.

## Princípios inegociáveis (resumo)

1. Separar fato, inferência, suposição, desconhecido
2. Não inventar probabilidades/precisão estatística
3. Tratar nome, aparência, status verde, autoridade como evidência fraca até validação
4. Não multiplicar evidências correlacionadas como independentes
5. Separar confiança epistemológica de permissão operacional
6. Manter bloqueios críticos acima de qualquer posterior/nota
7. Escolher teste que mais reduz incerteza por custo/risco
8. Registrar cálculo, proveniência, sensibilidade, lacunas, próximo passo
9. Ensinar em duas camadas: concreta/visual primeiro, notação matemática depois
10. Nunca usar escolaridade formal como proxy de capacidade de raciocínio
11. Preservar e evoluir o que existe; não criar paralelo sem provar encaixe canônico impossível
12. Subordinar autoajuste a mapa único; autonomia sem mapa = drift
13. Área consolidada = bloqueada por padrão; confiança alta não desfaz trava
14. AutoLupa sobre próprio veredito até ponto fixo evidencial, sem limite artificial de iterações
15. Camada de tradução obrigatória antes de qualquer equação

## Fluxo obrigatório (10 fases)

1. **Fixar decisão e fonte da verdade** — DECISÃO, HIPÓTESE PRINCIPAL/ALTERNATIVAS, FONTE DA VERDADE, AMBIENTE/HEAD_SHA, CUSTO FALSO POSITIVO/NEGATIVO, AUTORIDADE NECESSÁRIA
2. **Definir prior sem teatro numérico** — frequência histórica ou base rate, intervalo/sensibilidade quando incerto, 0.5 só como cenário neutro declarado, evitar 0 e 1
3. **Construir ledger de evidências** — ID, OBSERVAÇÃO, PROVENIÊNCIA, REPRODUZÍVEL, MESMO ALVO/HEAD_SHA, DEPENDÊNCIA/CLUSTER, P(E|H), P(E|¬H), LR, BASE DO LR, LIMITAÇÃO
4. **Verificar dependência** — agrupar evidências da mesma fonte/execução/narrativa; não multiplicar separadamente; cenário conservador (1 LR por cluster) vs otimista
5. **Atualizar crença** — odds: `odds_prior = p/(1-p)`, `odds_posterior = odds_prior × LR1 × LR2...`, `p_posterior = odds_posterior/(1+odds_posterior)`; executar `scripts/meta_lupa.py` para cálculos determinísticos
6. **Medir incerteza e escolher próximo teste** — entropia binária `H(p) = -p log2(p) - (1-p) 
```