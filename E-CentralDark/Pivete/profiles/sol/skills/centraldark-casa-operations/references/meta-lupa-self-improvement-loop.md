# REFERÊNCIA — MetaLupa Self-Improvement Loop (regenerativo)

Origem: síntese do CHEFE em 2026-08-28 (paste_2_003225.txt), conferida e validada
pelo Hermes-Casa na mesma sessão. NÃO é artefato canônico ainda — é MAPA APROVADO
de onde o "hyper-meta" deve aterrissar. Registrado aqui para o próximo ciclo não
reinventar o desenho.

## Conceito central (palavras do CHEFE, traduzidas p/ contrato)
"MetaLupa não fica só julgando os outros. A própria cadeia produz material para
melhorar a MetaLupa."

A fusão correta (não criar V2):

```
META_LUPA
   ↘
    META_IMPROVER        = melhora o executor/processo
       ↘
        HYPER_META       = melhora o mecanismo que melhora
           ↓
      MELHORIA_DA_META_LUPA
           ↓
         EXPERIMENTO A/B
           ↓
       SELF_VERIFICATION
           ↓
          CONTRAPROVA
           ↓
         REALITY JUDGE
```

- SE MELHOROU: PROMOTE → owner canônico da MetaLupa.
- SE PIOROU: REJECT → ROLLBACK → aprendizado fica registrado.
- NUNCA cria MetaLupa V2: `META_LUPA_OLD + DELTA_PROVADO = META_LUPA_ATUAL`.

## Regra que trava a arquitetura
```
QUEM TOCA NA META_LUPA DEIXA RASTRO.
RASTRO VIRA DELTA.
DELTA É TESTADO.
DELTA QUE SOBREVIVE MELHORA A META_LUPA.
META_LUPA MELHOR JULGA A PRÓXIMA PASSAGEM.
```

## "Suga quem toca nela" = OBSERVABLE_KNOWLEDGE_HARVEST
Toda passagem de modelo gera rastro observável:
```
MODEL | ENGINE | CAPABILITIES_USED | MISSAO_ID | TASK | ROUTE |
OUTPUT | EVIDENCE | ERROR | UNKNOWN | CONTRADICTION | LATENCY |
COST? | TEST_RESULT | COUNTERPROOF_RESULT
```
MetaLupa extrai delta útil → compara com histórico/outros modelos →
descobre: capacidade nova, padrão de erro, raciocínio útil, ferramenta útil,
rota melhor, teste melhor, contraprova melhor, falso positivo/negativo.
→ APRENDIZADO_CANDIDATO.

Absorve O QUE O MODELO DEIXA OBSERVÁVEL na execução/evidência/resultado.
Não precisa saber qual motor é: Claude/Codex/Hermes/Gemini/futuro = MESMA COLHEITA.

## Estado atual na Casa (medido 2026-08-28)
- `grep` no repo ServerVpss/CentralDark por META_IMPROVER|HYPER_META|knowledge_curator
  | HARVEST | auto.improve | self.improve → **0 hits**. Tá no papel, não no código.
- Peças-irmãs JÁ existem (reuse, não duplicar):
  - `meta-lupa` (auditoria transversal viva)
  - `auto-destilador` (cristaliza NUCLEO a partir de rastro)
  - `centraldark-casa-operations` (Enxame Ômega / multiventana / rendezvous)
  - `RECEIPTS` (rastro observável por missão)
- "OBSERVABLE_KNOWLEDGE_HARVEST" já é ~70% coberto por RECEIPTS + auto-destilador.
- BUraco real: HYPER_META_IMPROVER como LOOP CONCRETO
  (A/B → self-verify → contraprova → promote/rollback) NÃO existe como componente.

## Decisão pendente (HUMAN_FRONTIER leve — pergunta ao CHEFE se reabrir)
- Onde aterrissar o loop (doc em docs/CONSCIENCIA/ARQUITETURA/ ? skill? core?)
- Quem é o WRITER (ONE_WRITER_PER_SCOPE).
- Respeitar #722: NÃO criar router/segundo cérebro; só rota do mesmo produto.

## Fechamento sugerido se o CHEFE mandar cristalizar
```
FEITO: mapa do loop regenerativo aprovado + gap medido (0 artefatos no repo)
EVIDENCIA: grep repo CentralDark = 0 hits p/ peças AGI; paste_2_003225.txt existe
PENDENCIA: aterrissar HYPER_META como componente real (não V2)
PROXIMO PASSO: CHEFE decide doc vs skill vs core
BOOT: #ACORDAR → !CALIBRAR → !META_LUPA → !RECONCILIAR → !CONTRAPROVA → !FIXED_POINT
FIO: MetaLupa vira organismo; Fixed Point é da MISSÃO, não do aprendizado
```
