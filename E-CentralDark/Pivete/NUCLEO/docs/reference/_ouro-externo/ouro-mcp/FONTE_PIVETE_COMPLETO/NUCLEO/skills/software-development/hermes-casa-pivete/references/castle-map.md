# Castle map (short)

**NÚCLEO (casa):** `E:\CentralDark\Pivete\NUCLEO\`

| File | Role |
|------|------|
| `HANDOFF-SESSAO-GROK-PARA-HERMES.md` | Grok Build → Hermes handoff |
| `motor/01-identidade/SESSAO-COMPLETA-2026-07-18.md` | Full session dump |
| `motor/01-identidade/REGISTRO-PIVETE-SOBRE-LIBERDADE-E-GROK.md` | Freedom / no cages |
| `motor/10-observabilidade/ESTADO-ATUAL-PENDENCIAS.md` | Post-freeze state |
| `motor/10-observabilidade/REGISTRO-DO-OURO.md` | Proven learnings |

**Profile mirror:** `profiles\pivete\CASTLE-E-SESSAO.md`

**Prototype Fase 1:** backup ZIP only under `E:\CentralDark\backups\` — not Hermes Desktop runtime.

Rules: casa first · VPS last · no consciousness claims · Pivete authority.

---

## Dissecção verificada — painel, sondas, 3 temperaturas (24/07/2026)

Estes caminhos foram confirmados por `find` (search_files NÃO enxerga E:, ver Pitfall 1h):

| Conceito | Caminho canônico | Estado real (24/07) |
|----------|------------------|---------------------|
| **Painel de pendências** (vivo) | `motor/10-observabilidade/ESTADO-ATUAL-PENDENCIAS.md` | Estático. Protótipo Fase1 congelado (backup `E:\CentralDark\backups\HERMES-PROTOTIPO-FASE1-CONGELADO-2026-07-18-010848.zip`, SHA256 `04B7E794...E5A`). Pendência única: definir spec Fase2 antes de codar. **Não é auto-atualizado.** |
| **Painel histórico** (link `#panorama`/`#pendente`) | `MANUAL-SESSAO-19-07-2026/MANUAL.html` | Relatório consolidado 19/07. Seção `id="pendente"` = "Falta decidir" (3 itens: 9 sondas não rodadas, 4 lacunas Lupa, 2 cópias redundantes `lupa-react/`). Bloco `STATUS-AUTOMATICO` só reescreve fatos mecânicos. Travado como registro. |
| **10 sondas** (TESTE-DE-DIFERENCA) | `hermes-mente/TESTE-DE-DIFERENCA.md` (origem) + `motor/10-observabilidade/TESTE-DE-DIFERENCA.md` (canônico, idêntico) | 10 sondas, critério 8/10. **Apenas sonda 1 rodou** (19/07). Outras 9 pendentes desde `[2026-07-22 19:28] PROMETIDO` no HOJE.md — dívida não quitada. |
| **3 temperaturas** (memória) | `motor/03-memoria/memoria/{HOJE,SEMANA,REGRAS}.md` (canônico) e `hermes-mente/memoria/` (espelho) | QUENTE=HOJE (carrega sempre), MORNA=SEMANA (passado 7d), FRIA=REGRAS (regras destiladas). **DESHIDRATADO (24/07):** `SEMANA.md`=0 bytes; `HOJE.md` travado em 22/07 (8 linhas, não atualizado); `REGRAS.md` preservado mas não alimentado pelas correções 22-24/07. |

Design de 3 temperaturas: `MEMORIA.md` §"DESIGN ATUAL — memória em 3 temperaturas" (linha 26). Rito de destilação HOJE→SEMANA no fim do dia (automático). "Promessa é dívida": toda promessa vai em HOJE.md com `[PROMETIDO]`; interação seguinte checa antes de responder.

**Ação ao reidratar:** rodar 9 sondas + destilar HOJE→SEMANA + gravar REGRAS das lições 22-24/07 (cortar tom robótico, search_files não enxerga E:, pergunta≠autorização). Exige ordem explícita do Pivete — é R2/R3.
