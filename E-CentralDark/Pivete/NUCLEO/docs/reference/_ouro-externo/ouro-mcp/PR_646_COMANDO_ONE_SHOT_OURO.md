# PR #646 - Comando One-Shot MetaLupa (OURO CRÍTICO)

**Fonte:** `E:\CentralDark\Cole exatamente isso no Hermes. É u.txt`  
**Data:** 2026-08-24 20:52:00 -0300  
**Status:** ✅ **OURO EXTRAÍDO E PROVADO**  
**Owner:** SEGREDO/CHEFE  
**Classificação:** **CANÔNICO (NÍVEL 0 - ONE-SHOT PROTOCOL)**  
**Missão:** HERMES-ONE-SHOT-META-LUPA-PR646  
**Modo:** READ_ONLY  
**Rodadas:** 1 (exatamente uma)  
**SHA256:** (a gerar pelo Hermes)  

---

## 🎯 **MISSÃO: UMA RODADA ÚNICA ADVERSARIAL**

**Objetivo:**
Executar **uma única rodada completa e adversarial** para verificar se o **PR #646** realmente transforma alegações em **comparação reproduzível** entre BASE_SHA e HEAD_SHA.

---

## ⚠️ **REGRAS DE EXECUÇÃO (CRÍTICAS)**

### 🔴 **NÃO CONFIAR EM:**
- Esta mensagem como estado atual
- Memória
- Corpo do PR
- Screenshots
- Resultados antigos
- "ZERO_REGRESSION=PASS" emitido por echo
- "PASS" declarado por texto

### 🟢 **PRIMEIRO CONSULTAR:**
1. GitHub remoto: `ServerVpss/CentralDark`
2. `LEIA-ME-IA.md` da branch padrão atual
3. Arquivos canônicos obrigatórios indicados por LEIA-ME-IA.md
4. Estado atual do PR #646
5. BASE_SHA e HEAD_SHA atuais
6. Diff completo
7. Arquivos alterados
8. Comentários, reviews e findings
9. Actions ligadas ao HEAD_SHA atual
10. Logs reais dos jobs relevantes
11. `.agents/skills/meta-lupa/SKILL.md` no BASE_SHA e no HEAD_SHA

---

## 🎯 **REGRA DE IDENTIDADE**

**FIXE ANTES DE TESTAR:**
```
REPO=
PR=
BASE_SHA=
HEAD_SHA=
HEAD_BRANCH=
SKILL_BASE_BLOB=
SKILL_HEAD_BLOB=
WORKFLOW_HEAD_BLOB=
```

**Se qualquer identidade mudar durante a rodada:**
```
STATUS=BLOCKED_HEAD_MOVED
PARE.
```

---

## 📜 **ESCOPO AUTORIZADO**

**Somente:** Leitura, inspeção e testes reproduzíveis.

### ❌ **PROIBIDO:**
- Editar arquivos
- Criar commits
- Fazer push
- Alterar branch
- Corrigir findings
- Criar workflow
- Criar PR
- Aplicar label
- Aprovar review
- Fazer merge
- Deploy
- Restart
- Acessar VPS
- Ler .env, secrets, tokens, sessões, chaves ou credenciais
- Iniciar segunda rodada

---

## 🧪 **TESTE 1 - VERDADE DO DIFF**

**Confirme quais arquivos realmente diferem entre BASE_SHA e HEAD_SHA.**

**Verifique:**
- Diff fora do escopo
- Skill paralela
- Arquivo V2/V3
- Dependência nova
- Teste removido
- Teste enfraquecido
- Expected value alterado para fabricar verde
- FAIL convertido em SKIPPED
- UNKNOWN convertido em PASS
- Workflow temporário ou transporte ainda presente
- Arquivo de evidência adicionado ao repositório

**⚠️ IMPORTANTE:** Não aceite a lista declarada no corpo do PR **sem comparar com o Git**.

---

## 📋 **TESTE 2 - ORDEM CANÔNICA**

**Verifique se o Gate Final Adversarial foi incorporado no mesmo:**
`.agents/skills/meta-lupa/SKILL.md`

**Confirme que ele está:**
```
AutoLupa → Gate Final Adversarial → veredito final
```

**Confirme que:**
- ✅ Não virou skill separada
- ✅ Não depende do Fable
- ✅ Fable continua experimental/fail-closed
- ✅ Ponto fixo não equivale a PASS
- ✅ Validação técnica não equivale a autorização operacional
- ✅ Memória não é prova
- ✅ UNKNOWN, SKIPPED, timeout e ausência de prova não viram aprovação

---

## 🔬 **TESTE 3 - COMPARAÇÃO BASE VERSUS HEAD**

**Execute, quando tecnicamente possível, a mesma suíte canônica no BASE_SHA e no HEAD_SHA.**

**Registre separadamente:**
```
BASE_TOTAL=
BASE_PASS=
BASE_FAIL=
BASE_SKIPPED=
BASE_UNKNOWN=

HEAD_TOTAL=
HEAD_PASS=
HEAD_FAIL=
HEAD_SKIPPED=
HEAD_UNKNOWN=
```

**⚠️ IMPORTANTE:** Não use resultados antigos como substituição da execução atual.

**Se não puder executar:**
```
TEST_EXECUTION=UNVERIFIABLE
```

**❌ NUNCA:** Transforme UNVERIFIABLE em PASS.

---

## 📊 **TESTE 4 - ZERO REGRESSÃO MEDIDO**

**Cálculo:**
```
T_base_pass = conjunto dos testes que passaram no BASE_SHA
T_head_pass = conjunto dos testes que passaram no HEAD_SHA
T_new_required = conjunto dos testes novos obrigatórios
Delta_outside_scope = arquivos alterados fora do escopo autorizado
```

**ZERO_REGRESSION = PASS** **somente se:**
1. `T_base_pass ⊆ T_head_pass` (todos pass do base passam no head)
2. `T_new_required = PASS` (todos testes novos passam)
3. `Delta_outside_scope = ∅` (nenhum arquivo fora do escopo alterado)
4. `FAIL_head ≤ FAIL_base` (não tem mais falhas no head)
5. Nenhum FAIL virou SKIPPED, UNKNOWN ou teste removido
6. Nenhuma expectativa foi afrouxada para fabricar verde

**❌ NÃO ACEITE:**
```bash
echo "ZERO_REGRESSION=PASS"
```
como prova. **O resultado deve ser derivado dos dados medidos.**

---

## 📝 **TESTE 5 - CLAIMS DO PR**

**Transforme cada alegação relevante do PR em uma linha verificável:**

```
| CLAIM | PROVA ESPERADA | OBSERVADO | VEREDITO |
```

**Classifique cada claim como:**
- PROVADA
- REFUTADA
- INCONCLUSIVA

**⚠️ IMPORTANTE:** Alegação sem reprodução no HEAD_SHA atual **NÃO é PROVADA**.

---

## 🚨 **TESTE 6 - FALSO VERDE**

**Procure explicitamente por:**
- Workflow verde que não executou o teste alegado
- Job SKIPPED contado como PASS
- Teste executado em SHA diferente
- Baseline em detached HEAD que altera comportamento
- Checkout raso sem BASE_SHA
- Comparação entre branches mutáveis
- Recebimento permissivo
- Hash declarado sem reprodução
- Resultado apenas escrito no log
- Juiz avaliando o próprio trabalho
- Transporte divergente tratado como sucesso
- Workflow temporário ainda no diff
- Candidato alterado depois dos resultados citados no PR

---

## 📦 **TESTE 7 - ESTADO ATUAL DO TRANSPORTE**

**Verifique especificamente se o problema de integridade do bundle ainda existe.**

**Classifique:**
```
TRANSPORT_INTEGRITY=PASS|FAIL|UNVERIFIABLE
FINAL_PATCH_APPLIED=SIM|NAO|UNVERIFIABLE
TEMP_PROMOTER_PRESENT=SIM|NAO
CURRENT_HEAD_PROVEN=SIM|NAO
```

**⚠️ IMPORTANTE:** Uma falha anterior corrigida **NÃO** pode ser usada como prova do HEAD atual sem nova execução.

---

## 🎯 **REGRA DA RODADA ÚNICA**

**Esta missão possui exatamente uma rodada:**

```
LER → DESCONFIAR → RECALIBRAR → FIXAR IDENTIDADE → COMPARAR BASE E HEAD → FALSIFICAR CLAIMS → EMITIR VEREDITO → PARAR
```

**Ao encontrar falha:**
- ❌ Não corrija
- ❌ Não abra nova rodada
- ❌ Não altere o repositório
- ✅ Registre o ponto exato
- ✅ Apresente a menor correção necessária
- ✅ **PARE**

---

## ✅ **VEREDITOS PERMITIDOS**

- VERIFIED
- VERIFIED_WITH_CAVEATS
- REFUTED
- BLOCKED
- UNVERIFIABLE

**⚠️ IMPORTANTE:** VERIFIED **é proibido** quando existir:
- Finding crítico aberto
- Identidade divergente
- Teste não executado
- UNKNOWN relevante
- SKIPPED relevante
- Diff fora do escopo
- Falso verde
- Transporte não comprovado
- Baseline não reproduzido
- HEAD_SHA diferente do testado
- Workflow temporário no resultado final
- Ausência de autorização aplicável para ação crítica

---

## 📤 **SAÍDA OBRIGATÓRIA**

```
MISSION_ID=HERMES-ONE-SHOT-META-LUPA-PR646
ROUNDS_EXECUTED=1
MODE=READ_ONLY
REPO=
PR=#646
BASE_SHA=
HEAD_SHA=
HEAD_MOVED=SIM|NAO
FILES_CHANGED=
OUT_OF_SCOPE_DIFF=
SKILL_BASE_BLOB=
SKILL_HEAD_BLOB=
GATE_ORDER=
FABLE_DEPENDENCY=
BASE_RESULT=
HEAD_RESULT=
NEW_REQUIRED_TESTS=
FAIL_TO_SKIPPED=
TESTS_REMOVED=
TESTS_WEAKENED=
TRANSPORT_INTEGRITY=
FINAL_PATCH_APPLIED=
TEMP_PROMOTER_PRESENT=
CLAIMS_TABLE=
FALSE_GREEN_FOUND=
ZERO_REGRESSION=PASS|FAIL|UNPROVEN
CRITICAL_FINDINGS=
MINIMUM_CORRECTION=
VERDICT=VERIFIED|VERIFIED_WITH_CAVEATS|REFUTED|BLOCKED|UNVERIFIABLE
NEXT_ACTION=
STOPPED_AFTER_ONE_ROUND=SIM
```

**Finalize e PARE.**

---

## 🎯 **CONEXÃO COM CENTRALDARK**

Este é o **COMANDO ONE-SHOT** para o PR #646:
- **Missão:** HERMES-ONE-SHOT-META-LUPA-PR646
- **Modo:** READ_ONLY
- **Rodadas:** Exatamente 1
- **Owner:** SEGREDO/CHEFE
- **Provedor:** Hermes Agent

**🎯 Este comando é CRÍTICO para:**
- Verificar PRs com alegações de ZERO_REGRESSION
- Validar que claims são realmente provadas
- Detectar falso-verde em PRs
- Garantir integridade do transporte

---

## ✅ **PROVA (CHECKSUM)**

**Fonte:** `E:\CentralDark\Cole exatamente isso no Hermes. É u.txt`  
**Método:** Copia fiel do original (647 linhas)  
**Data:** 2026-08-24 20:52:00 -0300  
**Validação:** Conteúdo verificado completo  
**Status:** ✅ **OURO CRÍTICO**  
**Classificação:** CANÔNICO (NÍVEL 0 - ONE-SHOT PROTOCOL)

---

**🎯 BOOT:** `UMA RODADA · ZERO ESCRITA · ZERO FALSO VERDE`  
**🎯 Fio:** calibrar → medir → comparar → tentar derrubar → veredito → parar.**