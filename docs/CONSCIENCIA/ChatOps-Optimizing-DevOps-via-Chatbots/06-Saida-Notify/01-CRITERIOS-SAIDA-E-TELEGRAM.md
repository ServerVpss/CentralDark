# 05 — Critérios de saída + Telegram (output de saída)

> Espelha o que o orquestrador **prometeu**: não sai no achismo.

---

## Critérios de saída do LAB (EXIT_OK lab)

Todos devem ser true:

1. `docker`/`compose` lab healthy (se lab já autorizado e no ar)  
2. Orch state machine em `EXIT_OK` (não `RUNNING` eternamente)  
3. Pelo menos **1 missão** de referência com PASS do critic  
4. Cada agente da matriz mínima respondeu com **evidência**  
5. Zero secrets no report (scan BOOT #4)  
6. `max_rounds` não estourou sem PASS (senão EXIT_BLOCKED)  
7. Artefato em path fixo: `/lab/out/<mission_id>/report.md`  

## Critérios de saída PROD (só com AUTH)

1. Feature flag documentada  
2. Health do caminho novo OK  
3. Caminho legado intacto  
4. Rollback testado (flag off)  
5. Trace de 1 request real  

## O que NÃO conta como pronto

- “Parece bom”  
- Demo visual sem health  
- Loop que ainda limpa/destrói estado  
- Agente único fazendo tudo  

## Notificação Telegram

### Quando

- **Uma** mensagem no EXIT_OK lab  
- **Uma** no EXIT_OK prod (se houver)  
- Opcional: EXIT_BLOCKED se operador pediu alertas de bloqueio  

### O que vai na mensagem (sem secrets)

```
[ChatOps BOOT#6]
status: EXIT_OK | EXIT_BLOCKED
mission: <id>
trace: <trace_id>
evidence: <path ou resumo>
next: <próximo passo humano>
```

### O que NÃO vai

- Tokens, cookies, .env  
- Dump inteiro de logs com PII  
- Pedido de force-push  

### Como envia (quando autorizado)

- Usar **canal de notify já aprovado** pelo operador  
- Não criar bot novo em prod sem ordem  
- Respeitar Card Hermes / central de notify se for o padrão vigente  

## Formato de conclusão obrigatório (toda resposta humana e report)

```
Feito: ...
Evidência: ...
Pendência: ...
Próximo passo: ...
Qual BOOT usar: ...
Fio da missão: [texto integral]
```
