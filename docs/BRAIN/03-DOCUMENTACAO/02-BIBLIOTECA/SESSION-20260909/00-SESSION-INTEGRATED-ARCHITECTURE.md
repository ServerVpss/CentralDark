# CENTRALDARK — Reconciliação Integral da Sessão

## Intenção
Absorver o delta sobrevivente desta sessão no corpo já existente da CentralDark, usando o PR-mãe #1454 e sem criar cérebro, app, router, branch ou arquitetura paralelos.

## Cadeia consolidada

```text
👑 SEGREDO/CHEFE
→ ☀️ SOL (chat/voz/superfície humana principal)
→ delegação
→ agentes/bots especializados
→ computer/workstation quando necessário
→ owners existentes / Biblioteca
→ Horn somente quando a matéria exigir lógica/prova
→ Cognitive Council
→ Perception Orchestra
→ ONE_WRITER
→ execução/Hermes
→ Receipt
→ ⚖️ Realidade
→ LAST_GOOD_STATE / NEXT_CURSOR
```

## Superfície estilo Grok, do jeito da CentralDark
A experiência alvo é uma superfície principal única em que o CHEFE fala por voz ou texto com SOL. SOL delega a agentes especializados, acompanha estados e recebe os resultados. Chats laterais deixam de ser postos de trabalho do CHEFE e viram trabalhadores/serviços da Casa.

Reuso obrigatório:
- CentralDark Desktop / Electron já existente;
- chat existente com streaming e persistência;
- HermesMascote existente;
- CentralDark Voice e backend de áudio existentes;
- Hermes/CentralDark runtime existente;
- Remote MCP / Computer Use quando aplicável;
- owners de Biblioteca, Horn, Council, Perception e Writer já ligados ao #1454.

## Computer/workstation do agente

```text
SOL
→ agente recebe missão
→ workstation isolada (browser/terminal/files/apps)
→ agente executa
→ HUMAN_FRONTIER real?
   ├─ sim: chama CHEFE somente para fronteira necessária
   └─ não: continua
→ contraprova
→ receipt
→ SOL devolve resultado
```

A estação do agente pode ser VM, VPS com desktop ou outra superfície autorizada. A Casa enxerga capability/state/receipt, não precisa transformar a workstation em novo governo.

## Resilience Vertex reconciliado

```text
SIGNAL
→ STATE CAPACITOR
→ DETERMINISTIC POLICY
   ├─ RESUME_FROM_CURSOR
   ├─ FALLBACK
   └─ HOLD
→ RECEIPT
→ REALITY
```

Lei forte: `HUMAN_SUSPEND > AUTO_HEAL`.
Recuperar provider, processo ou conectividade não revoga suspensão humana.

## Historical Harvester
Chats/Works/Projects/histórico são matéria, não autoridade:

```text
HISTÓRICO
→ detectar CentralDark/IA/agentes/arquitetura
→ extrair KNOWLEDGE_DELTA
→ comparar com repo/main/owners vivos
→ ALREADY_CRYSTALLIZED | SUPERSEDED | CANDIDATE | REVALIDATE
→ owner existente
```

`CHAT_HISTORY != CURRENT_STATE`
`SESSION_MEMORY != SOURCE_OF_TRUTH`

## Invariantes
- ONE_SYSTEM_ONLY
- REUSE_BEFORE_CREATE
- ONE_OWNER_PER_CAPABILITY
- ONE_WRITER_PER_SCOPE
- PARALLELIZE_PERCEPTION
- SERIALIZE_MUTATION
- UNKNOWN != PASS
- ACTION != PROOF
- DOCUMENTED != EXECUTED
- MODEL_SWITCH != RESET
- BOT != KNOWLEDGE_DATABASE
