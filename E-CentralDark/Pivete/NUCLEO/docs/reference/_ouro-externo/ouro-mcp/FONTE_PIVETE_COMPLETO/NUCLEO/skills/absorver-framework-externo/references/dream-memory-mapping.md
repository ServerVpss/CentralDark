# Dream Memory × Casa — Mapeamento (06/08/2026)

Fonte: GUIA MEMORY DREAM - KARPATHY (Patreon Henri8 MAESTR[IA], vídeo dwD_IcbgSAE).
Lançado 06/05/2026 (Code with Claude 2026). Salvo em CONHECIMENTOS-UTEIS.md #4.

## O que é
Rotina agendada que revisa sessões + memória, extrai padrões, remove duplicata, resolve
contradições. Harvey: 6x mais conclusão. Wisedocs: 50% mais rápido.

## 4 Fases (aplicáveis a QUALQUER agente, Hermes incluso)
1. Orientação: ler índice de memória + sessões (24-48h)
2. Comparação: cruzar memória vs sessão real, sinalizar divergência
3. Proposta: mudanças numeradas COM citação da sessão como evidência
4. Aplicação: só baixo-risco automático (typo, índice); resto = revisão humana

## Cruzamento com a Casa (organize-memory já cobre 1–4)
| Fase Dream | Equivalente Casa |
|---|---|
| F1 Orientação | organize-memory passo 1 (ler 3 camadas) |
| F2 Comparação | organize-memory promove/rebaixa |
| F3 Proposta | evidence gate (3 travas Kulaxyz) |
| F4 Aplicação | PERMITO SEGREDO gate |

## GAPS REAIS (não cobertos hoje)
- ❌ CRON NOTURNO: job "sono" fora do fluxo (ex 03:00). Hoje só manual/"organiza memória".
- ❌ DIFF LOG: não guarda diff por rodada p/ auditoria.
- ❌ FONTE CONFIÁVEL vs NÃO: não separa logs próprios de conteúdo externo lido.

## ⚠️ Nota de segurança (== Fable Loop canônico)
"Memória automática = superfície de ataque nova." Fonte externa lida pelo agente =
vetor de CONTAMINAÇÃO DE MEMÓRIA. Instrução maliciosa vale INDEFINIDAMENTE = exato o
Fable Loop. → Revisão humana OBRIGATÓRIA p/ fonte não confiável. Log de ESCRITA c/ origem.

## Aplicação proposta (aguarda PERMITO SEGREDO)
Estender organize-memory com: (a) cron noturno deploy, (b) diff log por rodada,
(c) separação fonte confiável/não + evidência citada da sessão. Sem V2.
