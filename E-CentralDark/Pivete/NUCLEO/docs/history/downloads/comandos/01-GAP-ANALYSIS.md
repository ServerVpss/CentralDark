# ANÁLISE DE LACUNAS — O QUE FALTAVA

O pacote Human Mind Router original é forte como **radar externo read-only**, com proveniência, dedupe, lentes independentes, teste discriminante e proibição de tracking privado. Porém ele ainda não fecha sozinho o sistema de aprendizado vivo local descrito pelo CHEFE.

## Lacunas materiais encontradas

### G1 — Plano de operador humano
Faltava a superfície que mostra:
- ligado/desligado;
- modo atual;
- fonte atual;
- fila;
- progresso;
- o que aprendeu hoje;
- onde salvou;
- pendências;
- erros;
- kill switch.

**Correção:** `03-WINDOWS-OPERATOR-PLANE.md` + `contracts/UI-CONTRACT.yml`.

### G2 — Personal Learning Stream
O Human Mind Router original trata pessoas externas e material público/profissional. Não define uma trilha explícita para o CHEFE ensinar o sistema em sessões de estudo/trabalho.

**Correção:** `07-PERSONAL-LEARNING-STREAM.md`.

### G3 — Reconciliação com `private_life_tracking=false`
O Antídoto proíbe tracking privado, corretamente. Isso não impede aprendizado pessoal **explicitamente iniciado pelo CHEFE**.

Nova distinção:

```text
PRIVATE_LIFE_TRACKING = proibido
EXPLICIT_PERSONAL_LEARNING_SESSION = permitido
```

Sem sessão/consentimento ativo, não capturar.

### G4 — Estados de aprendizado
Faltava uma máquina de estados única entre captura e memória.

**Correção:** `04-LEARNING-STATE-MACHINE.md`.

### G5 — Métrica humana e porcentagem real
Faltava diferenciar:
- porcentagem da fila processada;
- taxa de validação;
- quantidade cristalizada;
- confiança por item.

Nunca usar “% de inteligência”.

**Correção:** `10-SESSION-METRICS.md`.

### G6 — Sincronização NUCLEO ↔ Obsidian
Faltava contrato explícito de ownership e projeção.

**Correção:** `08-MEMORY-SYNC-NUCLEO-OBSIDIAN.md`.

### G7 — Capture adapters do Windows
Faltava arquitetura para áudio/transcrição, URLs, arquivos, clipboard/seleção explícita e eventos de fonte.

**Correção:** `03-WINDOWS-OPERATOR-PLANE.md` + `contracts/PIPELINES.yml`.

### G8 — Kill switch / modo privado
Faltava comportamento operacional determinístico para “pare agora”.

**Correção:** `contracts/PRIVACY-CONTRACT.yml`.

### G9 — Retenção e minimização
Faltava política para não transformar áudio/transcrição bruta em arquivo permanente sem necessidade.

**Correção:** raw por TTL configurável; cristalizar só delta útil; modo privado não gera captura.

### G10 — Identidade de fonte divergente
Os materiais fornecidos possuem nomes divergentes em alguns pontos (ex.: Geoff/Jeff, Greg Pstrucha/Greg Christa, Allie/Ali). Isso não deve ser “corrigido por memória”.

**Correção:** `SOURCE_IDENTITY=UNRESOLVED` até proveniência primária confirmar.

### G11 — Aprendizado não pode editar o próprio juiz
Faltava declarar de forma transversal que candidato não pode enfraquecer teste, baseline, política ou judge para conseguir promoção.

**Correção:** `05-HUMAN-AUTONOMY-SHIELD.md` + `13-PROMPT-JUDGE.md`.

### G12 — Segurança de arquivos ingeridos
O radar também recebe arquivos. Faltava conectar ingestão ao FILE SECURITY GATE antes do runtime confiável.

**Correção:** `09-FILE-INGESTION-SECURITY-GATE.md`.

### G13 — Backpressure e orçamento
Faltava impedir fila infinita, captura demais e loop sem ganho.

**Correção:** orçamento por sessão, `information_gain_required`, filas bounded e estados `PAUSED_BACKPRESSURE`.

### G14 — E2E comprovável
Faltava uma matriz única provando:
fonte → captura → fila → validação → memória → painel → localização.

**Correção:** `contracts/TEST-MATRIX.yml`.

## Veredito

```text
HMR_EXTERNAL_RADAR = BOM E REUTILIZÁVEL
HUMAN_AUTONOMY_SHIELD = BOM E NECESSÁRIO
LIVING_LOCAL_LEARNING_OS = LACUNA REAL
SECOND_BRAIN_REQUIRED = NÃO
NEW_ORCHESTRATOR_REQUIRED = NÃO
INTEGRATION_LAYER_REQUIRED = SIM
OPERATOR_PLANE_REQUIRED = SIM
```
