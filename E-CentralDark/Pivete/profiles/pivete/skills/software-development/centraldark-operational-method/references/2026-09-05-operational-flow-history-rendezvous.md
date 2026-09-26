# FLUXO OPERACIONAL CANÔNICO COM HISTORY RENDEZVOUS

Este documento descreve o fluxo operacional canônico atualizado em SOUL-SOL.md (2026-09-05), que substitui a cadeia linear tradicional por um modelo de rendezvous histórico para garantir melhor recuperação de estado, lineage de capacidades e one surviving delta.

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

### EXPLICAÇÃO DETALHADA DOS ESTÁGIOS

1. **INTENÇÃO (SEGREDO/CHEFE)**: O humano define a intenção vigente para a missão.
2. **HISTORY RENDEZVOUS**: 
   - A máquina reconcilia três dimensões temporais:
     - *Passado*: PRs, commits, branches, testes históricos
     - *Presente*: main viva, runtime atual, owners atuais, nova capacidade em desenvolvimento
     - *Futuro*: nova capacidade planejada
   - Isso constrói um estado unificado que evita depender apenas de snapshots históricos ou presentes isolados.
3. **CAPABILITY LINEAGE**: 
   - Traça a linhagem de capacidades existentes no sistema para evitar reinvenção de roda.
   - Identifica o que já existe, o que pode ser estendido e onde há gaps reais.
4. **DEDUPE / ABSORB**: 
   - Remove duplicatas identificadas através da lineage.
   - Absorve apenas o delta sobrevivente que foi provado como necessário e não duplicado.
5. **ONE SURVIVING DELTA**: 
   - Resultado do processo de dedupe/absorb - apenas uma mudança válida, não duplicada e comprovada permanece para execução.
   - Este é o núcleo do princípio "Menos é Mais": executar apenas o que é estritamente necessário.
6. **☀️ SOL coordena**: 
   - A identidade operacional coordena o fluxo geral, mas não toma decisões de conteúdo.
   - Responsável por orquestrar os componentes, não por definir o que deve ser feito.
7. **🧭 MULTIBÚSSOLA**: 
   - Realiza o rendezvous entre passado, presente e futuro para alinhar percepções.
   - Garante que todas as dimensões temporais sejam consideradas na decisão operacional.
8. **⊛ META LUPA**: 
   - Aplica lupa crítica para falsificação ativa e calibração de confiança.
   - Tenta derrubar conclusões antes de avançar, reduzindo falsos positivos.
9. **ONE WRITER**: 
   - Garante que apenas um agente escreva no escopo mutável em qualquer momento.
   - Prevém condições de corrida e escritas conflitantes em recursos compartilhados.
10. **☿ HERMES EXECUTA**: 
    - O executor realiza a mutação do delta sobrevivente identificado.
    - Responsável pela ação concreta que muda o estado do sistema.
11. **CONTRAPROVA**: 
    - Tenta ativamente derrubar cada conclusão antes de finalizar.
    - Etapa essencial de validação que prevém aceitação acidental de hipóteses incorretas.
12. **REMEDIÇÃO**: 
    - Corrige quaisquer problemas identificados pela contraprova antes de prosseguir.
    - Garante que apenas estados corretos avancem para o próximo estágio.
13. **⚖ REALITY JUDGE**: 
    - O estado observável local (runtime, logs, health, git, medições diretas) é o juiz final.
    - Não depende de narrativas, garantias ou relatos - apenas do que é mensurável e observável.
14. **FIXED_POINT**: 
    - Só é alcançado após funcionalidade comprovada, teste bem-sucedido, contraprova aprovada e remediação completa.
    - Representa um estado estável e validado que pode ser considerado "chão firme".
15. **REGISTRA**: 
    - Atualiza grafo de conhecimento, receipt de operações e cursor de progresso no repositório canônico.
    - Garante que o aprendizado seja preservado para operações futuras.
16. **BOOT**: 
    - Estado pronto para o próximo ciclo operacional.
    - Contém toda a informação necessária para iniciar um novo !CENTRALDARK sem perder contexto relevante.
17. **↺ CARACOL REVERSO**: 
    - Quando houver divergência (ex: main à frente do trabalho local), usa trajetória em espiral para reconciliação antes de prosseguir.
    - Permite correção de curso sem perder o progresso feito, seguindo o princípio de que o caminho pode ser non-linear quando necessário.

### PRINCÍPIOS CHAVE INCORPORADOS

Este fluxo incorpora e reforça vários princípios operacionais centrais:

- **REUSE_BEFORE_CREATE**: A lineage e o dedupe garantem que sempre seja buscado o owner/skill/pasta existente antes de criar algo novo.
- **ONE_SYSTEM_ONLY**: Evita criação de sistemas paralelos ao focar na melhoria do existente através de lineage e dedupe.
- **MENOS É MAIS**: O conceito de ONE SURVIVING DELTA encapsula este princípio - executar apenas o que é estritamente necessário após eliminação de duplicatas.
- **UNKNOWN ≠ PASS**: Ausência de evidência em qualquer estágio permanece como UNKNOWN até ser provada.
- **HISTORICAL ≠ CURRENT**: O HISTORY RENDEZVOUS trata explicitamente o passado como proveniência/linhagem, não como verdade atual.
- **DOCUMENTED ≠ EXECUTED**: A dependência de medições presentes e runtime local como REALITY JUDGE garante que apenas o executado conta.
- **NOTEPAD_STATE ≠ CANONICAL_TRUTH**: O fluxo depende de fontes verificáveis (runtime, git, health) não de estados temporários de edição.
- **AÇÃO ≠ PROVA**: A exigência de CONTRAPROVA + REMEDIÇÃO + REALITY JUDGE garante que uma ação só conta como prova quando validada.
- **CREDITO = ATRIBUIÇÃO JUSTA**: O fluxo preserva proveniência através da lineage e não transfere crédito como autoridade.
- **REALITY JULGA CLAIMS, NÃO PESSOAS**: O juiz é o estado observável local, não a credibilidade de quem fez a claim.
- **PROTOCOLO DORMIR/ACORDAR PARA OPÇÕES**: Integrado no tratamento de decisões através do rendezvous e da necessidade de medição atual.
- **RE-ASK DE AUTORIZAÇÃO JÁ DADA = WASTED TURN**: O fluxo avança baseado no estado medido, não em re-confirmações constantes.
- **EXECUTE PRIMEIRO, RELATE DEPOIS**: O HERMES executa primeiro, então os resultados vão para REGISTRA e ficam disponíveis para observação.
- **EVITE REPETIR INFORMAÇÃO JA DITA**: O dedupe e a lineage evitam reprocessamento do que já foi estabelecido como verdade.

### COMO USAR NO DIA A DIA

Ao receber uma intenção do SEGREDO/CHEFE:
1. Execute `!CENTRALDARK` para iniciar o ciclo operacional.
2. O sistema fará automaticamente o HISTORY RENDEZVOUS (passado↔presente↔futuro).
3. Aguarde a progressão através dos estágios até chegar ao BOOT ou até que seja necessária intervenção humana explícita (ex: para merges, deploys ou gastos que exigem decisão do CHEFE).
4. Nunca suponha que o fluxo terminou baseado em suposições - sempre verifique o estado atual através de medições diretas antes de agir novamente.
5. Se houver divergência entre o estado local e o main remoto, o fluxo naturalmente incluirá o CARACOL REVERSO para reconciliação antes de continuar.

### VERIFICAÇÃO DO FLUXO

Para verificar se o fluxo está sendo aplicado corretamente, procure por:
- Menção explícita a reconciliação de passado/presente/futuro nas operações
- Foco em encontrar e estender capacidades existentes antes de criar novas
- Menção ao conceito de "one surviving delta" após processos de dedupe
- Referência à SOL como coordenadora, não como decisora
- Uso explícito de MULTIBÚSSOLA para alinhamento temporal e META LUPA para falsificação
- Garantia de ONE WRITER em escopos mutáveis
- Etapas explícitas de CONTRAPROVA e REMEDIÇÃO antes de avançar
- Dependência de medições locais (REALITY JUDGE) para validação
- Progresso apenas para FIXED_POINT após funcionalidade, teste e contraprova
- Atualização de grafo/receipt/cursor no REGISTRA
- Estado BOOT pronto para próximo ciclo
- Uso de CARACOL REVERSO quando houver divergência detectada

### REFERÊNCIAS

- SOUL-SOL.md (seção 2. MISSÃO DA SOL (NOVO FLUXO OPERACIONAL CANÔNICO))
- docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/FREQUENCIAS-OPERACIONAIS-SOL.md
- docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
- Princípios operacionais consolidados em centraldark-operational-method/SKILL.md (seções de PRINCÍPIOS OPERACIONAIS, EXECUÇÃO, PREFERÊNCIAS DE COMUNICAÇÃO)

Este fluxo substitui a cadeia linear antiga (`VER → ENTENDER → LEMBRAR → ANTECIPAR → PREPARAR → EXECUTAR → REVISAR → PROVAR → REGISTRAR → APRENDER → DEVOLVER_LEVEZA`) por um modelo de rendezvous que:
1. Garante melhor recuperação de estado ao considerar múltiplas dimensões temporais
2. Evita duplicação de esforço através de lineage e dedupe
3. Garante que apenas o delta sobrevivente provado seja executado
4. Mantém coordenação clara entre os componentes operacionais
5. Assegura validação rigorosa antes de considerar algo como fixed point