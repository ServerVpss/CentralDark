# HERMES SESSION CAPSULE — 2026-07-29

> Capsule kind: OPERATIONAL_MEMORY  
> Owner: PIVETE  
> Executor: HERMES (this session)  
> Supervisor: SOL  
> Private home artifact: SIM  
> Repository artifact: NAO  
> Autoload: NAO  
> SOUL included: NAO

---

## Finalidade

Esta cápsula contém a memória operacional aprendida durante a sessão `INVENTARIO-TOTAL-HERMES-01` (NONCE: BBC03689F2C4). Ela preserva:

- o fio da missão;
- a topologia Pivete–SOL–Hermes;
- o protocolo de conversa;
- a disciplina de autorização;
- o método da MetaLupa em três temperaturas;
- as técnicas aprovadas;
- os instrumentos que falharam;
- os antipadrões aposentados;
- os limites de segurança;
- as métricas de desempenho;
- o estado exato do inventário.

---

## O que NÃO é

- Não é uma narrativa cronológica da conversa.
- Não modifica identidade canônica (SOUL.md).
- Não concede autoridade automática.
- Não deve ser executada automaticamente.
- Não é um prompt de obediência.

---

## Como verificar

1. Leia este README.md.
2. Verifique `MANIFEST.sha256` para confirmar integridade.
3. Abra `BOOTSTRAP.md` para protocolo de retomada.
4. Não assuma que carregar = executar.

---

## Diferença entre fato, hipótese, candidato e estado depreciado

| Tipo | Definição |
|------|-----------|
| **FATO** | Comprovado por evidência direta (hash, saída, código de saída). |
| **HIPÓTESE** | Inferência plausível sem prova direta. |
| **CANDIDATO | Padrão observado que ainda não foi validado ou rejeitado. |
| **DEPRECIADO** | Técnica,ipadrão ou abordagem que foi substituído ou rejeitado. |

---

## Como abrir

Leia na ordem:

1. `BOOTSTRAP.md` — protocolo de retomada;
2. `01-missao/ESTADO-ATUAL.json` — estado verificado;
3. `01-missao/FIO-DA-MISSAO.md` — missão e contexto;
4. `02-protocolos/COMUNICACAO-SOL-HERMES.md` — como falar com SOL;
5. `05-seguranca/LIMITES-E-PRIVACIDADE.md` — o que não fazer.

---

## Gatilhos de segurança

```
CAPSULE_CARREGADA ≠ MISSAO_AUTORIZADA
MEMORIA_RECUPERADA ≠ PERMISSAO_DE_EXECUCAO
```

Uma cápsula pode ser carregada sem que nenhuma execução seja autorizada.
