# HISTORY RENDEZVOUS + CAPABILITY LINEAGE FLUXO OPERACIONAL

Este documento descreve o fluxo operacional canônico atualizado em SOUL-SOL.md (2026-09-05), substituindo a cadeia linear anterior por um modelo de rendezvous e lineage para garantir one surviving delta e evitar duplicação.

## FLUXO COMPLETO

```text
INTENÇÃO (SEGREDO/CHEFE)
→ HISTORY RENDEZVOUS
  ┌─────────────────────┼─────────────────────┐
  ▼                     ▼                     ▼
PASSADO                PRESENTE              FUTURO
PRs / commits /         main viva /            novo delta /
branches / testes      runtime / owners       nova capacidade
  │                     │                     │
  └─────────────────────┼─────────────────────┘
                        ▼
            CAPABILITY LINEAGE
                        │
                        ▼
               DEDUPE / ABSORB
                        │
                        ▼
             ONE SURVIVING DELTA
                        │
                        ▼
                  ☀️ SOL coordena
                        │
                        ▼
                 🧭 MULTIBÚSSOLA
                        │
                        ▼
                    ⊛ META LUPA
                        │
                        ▼
                  ONE WRITER
                        │
                        ▼
                 ☿ HERMES EXECUTA
                        │
                        ▼
                  CONTRAPROVA
                        │
                        ▼
                    REMEDIÇÃO
                        │
                        ▼
                   ⚖ REALITY JUDGE
                        │
                        ▼
                    FIXED_POINT
                        │
                        ▼
                     REGISTRA
                        │
                        ▼
              GRAFO / RECEIPT / CURSOR
                        │
                        ▼
                      BOOT
↺ CARACOL REVERSO quando houver divergência
```

### EXPLICAÇÃO DOS ESTÁGIOS

1. **INTENÇÃO (SEGREDO/CHEFE)**: O humano define a intenção vigente.
2. **HISTORY RENDEZVOUS**: A máquina reconcilia passado (PRs/commits/branches/testes), presente (main viva/runtime/owners/nova capacidade) e futuro (nova capacidade) para construir um estado unificado.
3. **CAPABILITY LINEAGE**: Traça a linhagem de capacidades existentes para evitar reinvenção.
4. **DEDUPE / ABSORB**: Remove duplicatas e absorve apenas o delta sobrevivente provado.
5. **ONE SURVIVING DELTA**: Resultado do processo de dedupe/absorb — apenas uma mudança válida permanece para ser executada.
6. **☀️ SOL coordena**: A identidade operacional coordena o fluxo, mas não decide.
7. **🧭 MULTIBÚSSOLA**: Realiza o rendezvous entre passado, presente e futuro.
8. **⊛ META LUPA**: Aplica lupa crítica para falsificação e calibração.
9. **ONE WRITER**: Garante que apenas um agente escreva no escopo mutável.
10. **☿ HERMES EXECUTA**: O executor realiza a mutação do delta sobrevivente.
11. **CONTRAPROVA**: Tenta ativamente derrubar a conclusão antes de finalizar.
12. **REMEDIÇÃO**: Corrige quaisquer problemas encontrados pela contraprova.
13. **⚖ REALITY JUDGE**: O estado observável local (runtime, logs, health, git) é o juiz final.
14. **FIXED_POINT**: Só é alcançado após funcionalidade, teste, contraprova e remediação no mesmo HEAD.
15. **REGISTRA**: Atualiza grafo, receipt e cursor no repositório canônico.
16. **BOOT**: Estado pronto para o próximo ciclo operacional.
17. **↺ CARACOL REVERSO**: Quando houver divergência (ex: main à frente), usa trajetória em espiral para reconciliação antes de prosseguir.

### PRINCÍPIOS CHAVE

- **REUSE_BEFORE_CREATE**: Sempre procura owner/skill/pasta existente antes de criar.
- **ONE_SYSTEM_ONLY**: Não cria sistemas paralelos ou duplicação de owners.
- **MENOS É MAIS**: Prefere o caminho com menor movimento que resolve o problema.
- **UNKNOWN ≠ PASS**: Ausência de evidência permanece UNKNOWN.
- **HISTORICAL ≠ CURRENT**: Histórico é proveniência, não verdade atual.
- **DOCUMENTED ≠ EXECUTED**: Documentação não prova execução.
- **NOTEPAD_STATE ≠ CANONICAL_TRUTH**: Estado do Notepad não é fonte de verdade.
- **AÇÃO ≠ PROVA**: Uma ação executada não é prova de resultado sem medição.
- **CREDITO = ATRIBUIÇÃO JUSTA**: Crédito fica com quem contribuiu, não com quem decide.
- **REALITY JULGA CLAIMS, NÃO PESSOAS**: O juiz avalia claims técnicos, não credibilidade humana.
- **PROTOCOLO DORMIR/ACORDAR PARA OPÇÕES**: Para decisões, use `> /CENTRALDARK DORMIR` e `ACORDAR !CENTRALDARK` em vez de perguntar diretamente.
- **RE-ASK DE AUTORIZAÇÃO JÁ DADA = WASTED TURN**: Não reconfirma autorização já dada.
- **EXECUTE PRIMEIRO, RELATE DEPOIS**: Execute a ação primeiro e apenas então relate o resultado.
- **EVITE REPETIR INFORMAÇÃO JA DITA**: Não peça novamente informações que o usuário já forneceu, salvo mudança real.

### COMO USAR NO DIA A DIA

Ao receber uma intenção do SEGREDO/CHEFE:
1. Execute `!CENTRALDARK` para iniciar o ciclo.
2. O sistema fará automaticamente HISTORY RENDEZVOUS.
3. Aguarde a saída do fluxo (BOOT) ou siga as instruções de um agente se houver necessidade de intervenção humana explícita (ex: merge, deploy, gasto).
4. Nunca suponha que o fluxo terminou — sempre verifique o estado atual via medição antes de agir novamente.
5. Se houver divergência entre main e seu trabalho, o fluxo incluirá CARACOL REVERSO para reconciliação antes de continuar.

### REFERÊNCIAS

- SOUL-SOL.md (seção 2. MISSÃO DA SOL (NOVO FLUXO OPERACIONAL CANÔNICO))
- docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/FREQUENCIAS-OPERACIONAIS-SOL.md
- docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
- Princípios operacionais consolidados em centraldark-operational-method/SKILL.md (seções de PRINCÍPIOS OPERACIONAIS, EXECUÇÃO, PREFERÊNCIAS DE COMUNICAÇÃO)

Este fluxo substitui a cadeia linear antiga (`VER → ENTENDER → ... → DEVOLVER_LEVEZA`) por um modelo de rendezvous que garante recuperação de estado real, lineage de capacidades, one surviving delta e coordenação clara entre SOL, MULTIBÚSSOLA, META LUPA, HERMES e o juiz da realidade.