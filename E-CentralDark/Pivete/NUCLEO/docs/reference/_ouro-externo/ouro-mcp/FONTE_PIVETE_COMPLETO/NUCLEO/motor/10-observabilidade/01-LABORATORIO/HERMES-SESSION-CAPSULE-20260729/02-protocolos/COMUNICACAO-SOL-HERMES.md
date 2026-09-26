# COMUNICAÇÃO SOL — HERMES

## Formato Unificado

```
HERMES_TO=SOL
MISSION=<id>
NONCE=<nonce>
TURN=<turn>
PROTOCOL=SOL_HERMES_UNIFIED_V2
STATUS=<estado>
RESULTADO=<resumo>
EVIDENCIA=<prova>
ERROS=<lista_ou_NONE>
FIZ_CERTO=PERGUNTA_PARA_SOL
NOVO_PASSO_INICIADO=NAO
```

## Capsule de Continuidade

```
PASTA_ATUAL=
FASE=
ACAO_AUTORIZADA=
ULTIMA_PROVA=
PENDENCIA=
PROIBIDO=
PROXIMO_GATE=
```

---

## Regras

1. **Hermes usa linguagem clara igual à SOL** quando fala com a SOL.
2. **Pivete continua falando normalmente** — não precisa de protocolo.
3. **Texto estruturado identifica máquina, missão e turno.**
4. **Mensagem copiada nunca deve ser atribuída ao Pivete sem marcador.**
5. **Reconhecer a revisão antes de executar.**
6. **Não iniciar o próximo passo antes do gate.**
7. **Se a resposta estiver truncada, recuperar o contrato completo antes de agir.**
8. **Não usar "você tem razão" para uma correção interna.**
9. **Usar `CORRECAO_INTERNA=` quando o próprio Hermes corrigir o próprio erro.**
10. **Preservar a cronologia real e nunca maquiar a ordem retroativamente.**

---

## Fluxo de Resposta

1. Hermes envia resultado para SOL.
2. SOL revisa e pode:
   - aceitar → `FIZ_CERTO=SIM`, `VERDICT=VALID`
   - rejeitar com correção → `FIZ_CERTO=SIM`, `VERDICT=INVALID`, `CORRECAO=...`
   - rejeitar e parar → `FIZ_CERTO=NAO`, `VERDICT=INVALID`, `ACAO=PARAR`
3. Hermes não assume continuidade — aguarda próximo gate.

---

## Padrão de Resposta truncate

Se a resposta da SOL for truncada:

```
1. Não executar nada.
2. Ler a página via UIA TextPattern.
3. Buscar o contrato completo (marcador: SOL_TO=HERMES).
4. Só então executar.
```

---

## Não Confundir

| Errado | Certo |
|--------|-------|
| "você tem razão" para erro próprio | `CORRECAO_INTERNA=...` |
| Mensagem da SOL sem marcar | `SOL_BRIDGE=...` ou `SOL_REVIEW=...` |
| Executar sem gate | Aguardar resposta |
| Resposta incompleta como completa | Recuperar texto completo |
