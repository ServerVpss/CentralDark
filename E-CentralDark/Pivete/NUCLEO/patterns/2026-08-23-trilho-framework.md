# TRILHO — FRAMEWORK OPERACIONAL CANÔNICO

## Visão Geral

O TRILHO é a **peça do meio** entre calibração (FABLE LOOP) e veredito (MetaLupa). Resolve o **movimento**: o que acontece entre o passo N e N+1 quando ninguém está olhando e o contexto começa a evaporar.

**Precedência (herdada):**
```
autorização humana > segurança/escopo > estado externo comprovado
  > MetaLupa > Writer único > Judge > FABLE LOOP > TRILHO > memória
```

**Natureza dual:**
| | PARTE I — CHASSI | PARTE II — LÂMINA |
|---|---|---|
| Natureza | determinística | generativa |
| Muda? | só por decisão humana | a cada passe |
| Função | impedir a cagada | aprender a andar |
| Falha = | 🛑 FREIO | 🩸 QUEDA + reancoragem |

---

## PARTE I — CHASSI (7 Travas Determinísticas)

### T1 · ÂNCORA VIVA
**Demônio:** drift — agente trabalha em mundo que já mudou.  
**Lei:** todo movimento reimprime o chão. Chão não é lembrado — é reafirmado.  
**Mecanismo:** todo CARVE carrega `HEAD` + `missão` + `passo N`. Se `REMOTE_HEAD_SHA` mudar, `FATO_REMOTO` derivado do SHA antigo → `HIPÓTESE`.  
**Falsificador:** CARVE com HEAD copiado do anterior. → 🛑

### T2 · HIERARQUIA DE VERDADE
**Lei:**
```
ESTADO REMOTO COMPROVADO MAIS RECENTE
  > conversa
    > memória antiga
      > prints
        > suposição
```
**Mecanismo:** todo fato consolidado datado pelo SHA. Memória = endereço do que conferir.  
**Falsificador:** responde "qual o estado canônico" sem tocar no remoto. → 🛑

### T3 · WRITER ÚNICO COM LEASE FÍSICO
**Lei:** escrita é posse, não permissão.  
**Mecanismo:** lease em arquivo (`quem·PID·escopo·timestamp·TTL`). Lease vivo de outro = 🔴 PAREDE.  
**Falsificador:** caminho de escrita sem lease. → 🛑

### T4 · LÂMINA CEGA
**Lei:** similaridade ≠ identidade.  
**Mecanismo:** ferramentas semânticas = `authority: PERCEPTION_ONLY`. Produzem pares candidatos. Fusão só com prova dura (hash idêntico, conteúdo byte-a-byte, uso sobreposto comprovado).  
**Falsificador:** decisão de merge baseada só em similaridade. → 🛑

### T5 · PROVA NO MESMO BLOB + MUTANTE
**Lei:** ausência de erro ≠ sucesso.  
**Mecanismo:** auditoria no artefato exato (`git hash-object`). Mutante: quebrar o que o contrato protege. Se suíte verde sob mutação → contrato mentiu.  
**Transições proibidas:**
```
UNKNOWN → PASS
HIPÓTESE → FATO
AUSÊNCIA_DE_ERRO → SUCESSO
```
**Falsificador:** nenhum mutante escrito para cristalização. → 🛑

### T6 · PORTÃO DA FORJA
**Lei:** memória sem filtro vira ruído. Aprender é caro.  
**Pipeline:**
```
experiência → evidência → ganho de informação → contraprova → teste → cristalização
```
**4 Portões obrigatórios:**
1. ≥3 ocorrências independentes
2. Ganho de informação > 0
3. Contraprova tentada e sobrevivida
4. Datação por SHA  
**Falsificador:** cristal sem os 4 campos. → 🛑

### T7 · FREIO E ORÇAMENTO
**Lei:** cada volta reduz algo, ou acabou.  
**Mecanismo:** compressão obrigatória a cada K passos; contexto ativo mínimo métrica reportada. 🛑 FREIO quando: nenhum dos 6 reduzido, orçamento estourou, exige acesso fora do modo, HEAD mudou.  
**Falsificador:** 3 passos sem reduzir nenhum dos 6. → 🛑

**Proibido no Chassi:** expor secret, force-push, deploy sem liberação, arquitetura concorrente, v2/v3/final, substituir SOUL, sucesso sem prova, carregar repo inteiro no prompt.

---

## PARTE II — LÂMINA (Generativa)

### O CARVE (Verso-Comando)
**Formato fixo (5 linhas):**
```
💎 <ÂNCORA>   missão · HEAD · passo N · writer
🌀 <CURVA>    o que vou fazer agora — verbo na frente
🔎 <GUME>     prova que exijo ANTES de aceitar resultado
🟢/🟡/🔴/🩸/❔ <VEREDITO>   preenchido DEPOIS
➡️ <CARRY>    herança p/ próximo passo (≤40 palavras)
```
**Regra:** sem CARVE, sem movimento. Gume escrito ANTES do resultado.

### Alfabeto (12 símbolos — estados de máquina)
| Símbolo | Estado | Significado |
|---|---|---|
| 💎 | ÂNCORA | onde estou, comprovado |
| 🌀 | CURVA | movimento declarado |
| 🔎 | GUME | prova exigida antes do fato |
| 🟢 | PISO | provado — vira chão |
| 🟡 | GELO | passou com ressalva; anda devagar |
| 🔴 | PAREDE | proibido ou exige autorização |
| 🩸 | QUEDA | falhou — reancoragem |
| ❔ | FENDA | UNKNOWN declarado — vira alvo |
| ⚔️ | CONTRA | duas fontes discordam |
| 🧊 | CRISTAL | passou 4 portões → reflexo |
| ➡️ | CARRY | herança p/ próximo |
| 🛑 | FREIO | parada com relatório |

### Ciclo
```
💎 ancora → 🌀 declara → 🔎 arma gume → executa → veredito
   ↑                                                          │
   └──────────────── ➡️ carry ────────────────────────────────┘
```
Cada volta ataca a **maior lacuna restante**, não a mais confortável.

### 🩸 Queda e Reancoragem (Self-Healing)
Ao 🩸, 3 movimentos determinísticos:
1. **REFIXAR CHÃO** — relê HEAD + canônico
2. **REBAIXAR** — derivados da crença que quebrou → `HIPÓTESE`
3. **REENTRAR** — novo CARVE atacando lacuna que queda revelou

**2 quedas consecutivas no mesmo alvo = 🛑 FREIO.**

### Destilação → Cristal
```
rastro → agrupa curvas equivalentes (mesma intenção·gume·veredito)
       → ≥3 ocorrências independentes?
       → ganho de informação > 0?
       → sobreviveu contraprova?
       → 🧊 CRISTAL (regra determinística / gate / código)
```
**RACIOCÍNIO → CONTRATO → CÓDIGO/REGRA DETERMINÍSTICA → REFLEXO**

**Descristalização obrigatória:** condição mudou · exceção · contradição · teste falhou · HEAD mudou · fonte mudou · realidade divergiu.

---

## ALFABETO (12 símbolos — fechado)
| Símbolo | Estado | Significado |
|---|---|---|
| 💎 | ÂNCORA | onde estou, comprovado |
| 🌀 | CURVA | movimento declarado |
| 🔎 | GUME | prova exigida antes do fato |
| 🟢 | PISO | provado — vira chão |
| 🟡 | GELO | passou com ressalva; anda devagar |
| 🔴 | PAREDE | proibido ou exige autorização |
| 🩸 | QUEDA | falhou — reancoragem |
| ❔ | FENDA | UNKNOWN declarado — vira alvo |
| ⚔️ | CONTRA | duas fontes discordam |
| 🧊 | CRISTAL | passou 4 portões → reflexo |
| ➡️ | CARRY | herança p/ próximo |
| 🛑 | FREIO | parada com relatório |

---

## CONTRATO DE SAÍDA (Fecha missão)
```
MISSAO=
HEAD_INICIAL=            HEAD_FINAL=
WRITER=                  LEASE=
PASSOS=                  CARVES_EMITIDOS=
PISO=  GELO=  QUEDAS=  REANCORAGENS=
FENDAS_ABERTAS=          CONTRADICOES=
CRISTAIS_NOVOS=          DESCRISTALIZADOS=
GANHO_POR_VOLTA=         # qual dos 6 caiu, volta a volta
CONTEXTO_ATIVO_MINIMO=
MOTIVO_DA_PARADA=
RASTRO=                  # caminho do rastro.jsonl
```

---

## SINAIS DE APORECIMENTO DO TRILHO (🛑)
- GUME escrito DEPOIS do resultado
- 🟢 PISO longo sem 🩸 nem ❔ — sistema poupado, não testado
- 🧊 crescendo sem descristalização — parou de duvidar
- CARVE virando prosa, parou de mudar comportamento
- Emoji fora do alfabeto no rastro
- Rastro com furo: passo sem CARVE

**Qualquer um: 🛑 + Lupa no próprio TRILHO.**

---

## REGRA FINAL
```
NÃO DIMINUA A VELOCIDADE.
DIMINUA A DISTÂNCIA ENTRE CADA MOVIMENTO E A REALIDADE COMPROVÁVEL.

APRENDA → COMPRIMA → REAJA → DETECTE MUDANÇA → REABRA → SUPERE → CONSOLIDE → REPITA
```

---

# PADRAO - 2026-08-23-trilho-framework.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\ECentralDark_RECONCILIATIONOUROLOCALskills 2\references\2026-08-23-trilho-framework.md
**SHA:** 09df21014ab24c62
**Timestamp:** 2026-08-28T02:57:23.907475
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Regra:** sem CARVE, sem movimento. Gume escrito ANTES do resultado.

### Principios
- **Lei:** todo movimento reimprime o chão. Chão não é lembrado — é reafirmado.
- **Lei:**
- **Lei:** escrita é posse, não permissão.
- **Lei:** similaridade ≠ identidade.
- **Lei:** ausência de erro ≠ sucesso.
- **Lei:** memória sem filtro vira ruído. Aprender é caro.
- **Lei:** cada volta reduz algo, ou acabou.

### Ouro Bruto (primeiros 5000 chars)
```
# TRILHO — FRAMEWORK OPERACIONAL CANÔNICO

## Visão Geral

O TRILHO é a **peça do meio** entre calibração (FABLE LOOP) e veredito (MetaLupa). Resolve o **movimento**: o que acontece entre o passo N e N+1 quando ninguém está olhando e o contexto começa a evaporar.

**Precedência (herdada):**
```
autorização humana > segurança/escopo > estado externo comprovado
  > MetaLupa > Writer único > Judge > FABLE LOOP > TRILHO > memória
```

**Natureza dual:**
| | PARTE I — CHASSI | PARTE II — LÂMINA |
|---|---|---|
| Natureza | determinística | generativa |
| Muda? | só por decisão humana | a cada passe |
| Função | impedir a cagada | aprender a andar |
| Falha = | 🛑 FREIO | 🩸 QUEDA + reancoragem |

---

## PARTE I — CHASSI (7 Travas Determinísticas)

### T1 · ÂNCORA VIVA
**Demônio:** drift — agente trabalha em mundo que já mudou.  
**Lei:** todo movimento reimprime o chão. Chão não é lembrado — é reafirmado.  
**Mecanismo:** todo CARVE carrega `HEAD` + `missão` + `passo N`. Se `REMOTE_HEAD_SHA` mudar, `FATO_REMOTO` derivado do SHA antigo → `HIPÓTESE`.  
**Falsificador:** CARVE com HEAD copiado do anterior. → 🛑

### T2 · HIERARQUIA DE VERDADE
**Lei:**
```
ESTADO REMOTO COMPROVADO MAIS RECENTE
  > conversa
    > memória antiga
      > prints
        > suposição
```
**Mecanismo:** todo fato consolidado datado pelo SHA. Memória = endereço do que conferir.  
**Falsificador:** responde "qual o estado canônico" sem tocar no remoto. → 🛑

### T3 · WRITER ÚNICO COM LEASE FÍSICO
**Lei:** escrita é posse, não permissão.  
**Mecanismo:** lease em arquivo (`quem·PID·escopo·timestamp·TTL`). Lease vivo de outro = 🔴 PAREDE.  
**Falsificador:** caminho de escrita sem lease. → 🛑

### T4 · LÂMINA CEGA
**Lei:** similaridade ≠ identidade.  
**Mecanismo:** ferramentas semânticas = `authority: PERCEPTION_ONLY`. Produzem pares candidatos. Fusão só com prova dura (hash idêntico, conteúdo byte-a-byte, uso sobreposto comprovado).  
**Falsificador:** decisão de merge baseada só em similaridade. → 🛑

### T5 · PROVA NO MESMO BLOB + MUTANTE
**Lei:** ausência de erro ≠ sucesso.  
**Mecanismo:** auditoria no artefato exato (`git hash-object`). Mutante: quebrar o que o contrato protege. Se suíte verde sob mutação → contrato mentiu.  
**Transições proibidas:**
```
UNKNOWN → PASS
HIPÓTESE → FATO
AUSÊNCIA_DE_ERRO → SUCESSO
```
**Falsificador:** nenhum mutante escrito para cristalização. → 🛑

### T6 · PORTÃO DA FORJA
**Lei:** memória sem filtro vira ruído. Aprender é caro.  
**Pipeline:**
```
experiência → evidência → ganho de informação → contraprova → teste → cristalização
```
**4 Portões obrigatórios:**
1. ≥3 ocorrências independentes
2. Ganho de informação > 0
3. Contraprova tentada e sobrevivida
4. Datação por SHA  
**Falsificador:** cristal sem os 4 campos. → 🛑

### T7 · FREIO E ORÇAMENTO
**Lei:** cada volta reduz algo, ou acabou.  
**Mecanismo:** compressão obrigatória a cada K passos; contexto ativo mínimo métrica reportada. 🛑 FREIO quando: nenhum dos 6 reduzido, orçamento estourou, exige acesso fora do modo, HEAD mudou.  
**Falsificador:** 3 passos sem reduzir nenhum dos 6. → 🛑

**Proibido no Chassi:** expor secret, force-push, deploy sem liberação, arquitetura concorrente, v2/v3/final, substituir SOUL, sucesso sem prova, carregar repo inteiro no prompt.

---

## PARTE II — LÂMINA (Generativa)

### O CARVE (Verso-Comando)
**Formato fixo (5 linhas):**
```
💎 <ÂNCORA>   missão · HEAD · passo N · writer
🌀 <CURVA>    o que vou fazer agora — verbo na frente
🔎 <GUME>     prova que exijo ANTES de aceitar resultado
🟢/🟡/🔴/🩸/❔ <VEREDITO>   preenchido DEPOIS
➡️ <CARRY>    herança p/ próximo passo (≤40 palavras)
```
**Regra:** sem CARVE, sem movimento. Gume escrito ANTES do resultado.

### Alfabeto (12 símbolos — estados de máquina)
| Símbolo | Estado | Significado |
|---|---|---|
| 💎 | ÂNCORA | onde estou, comprovado |
| 🌀 | CURVA | movimento declarado |
| 🔎 | GUME | prova exigida antes do fato |
| 🟢 | PISO | provado — vira chão |
| 🟡 | GELO | passou com ressalva; anda devagar |
| 🔴 | PAREDE | proibido ou exige autorização |
| 🩸 | QUEDA | falhou — reancoragem |
| ❔ | FENDA | UNKNOWN declarado — vira alvo |
| ⚔️ | CONTRA | duas fontes discordam |
| 🧊 | CRISTAL | passou 4 portões → reflexo |
| ➡️ | CARRY | herança p/ próximo |
| 🛑 | FREIO | parada com relatório |

### Ciclo
```
💎 ancora → 🌀 declara → 🔎 arma gume → executa → veredito
   ↑                                                          │
   └──────────────── ➡️ carry ────────────────────────────────┘
```
Cada volta ataca a **maior lacuna restante**, não a mais confortável.

### 🩸 Queda e Reancoragem (Self-Healing)
Ao 🩸, 3 movimentos determinísticos:
1. **REFIXAR CHÃO** — relê HEAD + canônico
2. **REBAIXAR** — derivados da crença que quebrou → `HIPÓTESE`
3. **REENTRAR** — novo CARVE atacando lacuna que queda revelou

**2 quedas consecutivas no mesmo alvo = 🛑 FREIO.**

### Destilação → Cristal
```
rastro → agrupa curvas equivalentes (mesma intenção·gume·veredito)
       → ≥3 ocorrências independentes?
 
```