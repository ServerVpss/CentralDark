# COMANDO - BOOT-LUPA-AUTO-REGISTRO-FONTE-DA-VERDADE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.hermes\desktop-attachments\BOOT-LUPA-AUTO-REGISTRO-FONTE-DA-VERDADE.md
**SHA:** 43ddb6db5825a629
**Timestamp:** 2026-08-28T02:57:50.927304
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- RESTART=0

### Decisoes
- Decisão:

### Riscos
- RESIDUAL_RISK:

### Ouro Bruto (primeiros 5000 chars)
```
# BOOT — AUTO-REGISTRO OBRIGATÓRIO DA LUPA NA FONTE DA VERDADE

## ORDEM CANÔNICA DO PIVETE

```text
TODA VEZ QUE A LUPA-BAYESIANA FOR CARREGADA OU INVOCADA,
O USO DEVE SER REGISTRADO AUTOMATICAMENTE NO REPOSITÓRIO
SERVERVPSS/CENTRALDARK, FONTE DA VERDADE.

NÃO BASTA DIZER “USEI A LUPA”.
É OBRIGATÓRIO PROVAR:
CAMINHO + REF + SHA DA SKILL + MISSÃO + AUTOLUPA + RESULTADO.

RESOLVE. VÁ ATÉ O FIM.
PERMITO PIVETE SEM AÇÃO DESTRUTIVA. 🔒🚀
```

Esta autorização cobre branch, arquivos canônicos, testes, commit, push e PR necessários para implementar o mecanismo, sem merge, deploy, restart, force-push, secrets ou alteração destrutiva.

---

# MISSÃO

Implementar na skill canônica:

```text
.agents/skills/lupa-bayesiana/
```

um mecanismo obrigatório, automático, idempotente, auditável e recuperável para registrar **cada uso real da Lupa Bayesiana** no repositório fonte da verdade.

O mecanismo precisa diferenciar:

```text
USO DA SKILL
→ sempre gera recibo de uso

APRENDIZADO NOVO COMPROVADO
→ além do recibo, evolui a mesma skill,
   adiciona teste de regressão
   e registra aprendizado canônico
```

Não transformar todo uso em regra nova.  
Não transformar todo uso em XP.  
Não criar segunda Lupa.

---

# PRINCÍPIO CENTRAL

```text
carregar a skill
→ abrir recibo BEGIN
→ executar a missão
→ aplicar AutoLupa
→ corrigir e retestar
→ fechar recibo FINAL
→ registrar no Git
→ promover somente aprendizado novo comprovado
```

Um agente não pode declarar:

```text
LUPA_USADA=SIM
```

sem prova persistida na fonte da verdade.

---

# FONTE DA VERDADE E IDENTIDADE

```text
REPOSITÓRIO:
ServerVpss/CentralDark

SKILL_CANÔNICA:
.agents/skills/lupa-bayesiana/SKILL.md

IDENTIDADE:
name: lupa-bayesiana

MARCADOR DE BOOT:
LUPA_BAYESIANA_BOOT_REQUIRED

MARCADOR DE REGISTRO:
LUPA_USE_RECEIPT_REQUIRED
```

Primeiro localizar a branch/ref atual que realmente contém a skill e o Kit Boas-Vindas. Não presumir `main`, `pivete/dev` ou a branch de PR.

Registrar:

```text
WORKSPACE_BRANCH
WORKSPACE_HEAD
SKILL_PATH
SKILL_REF
SKILL_COMMIT_SHA
SKILL_BLOB_SHA
```

Quando Git estiver disponível, cópia baixada, cache, File Library, texto de conversa ou Lovable não substituem a ref canônica. Podem ser ponte ou evidência auxiliar.

---

# REGRA DE OURO DE CONSOLIDAÇÃO

Antes de criar qualquer arquivo, procurar mecanismo equivalente já existente.

Pesquisar:

```text
uso-ledger
usage-ledger
lupa receipt
lupa usage
audit ledger
event ledger
mission ledger
candidate_ref
contract_digest
APRENDIZADOS
RELATORIOS
```

Decisão:

```text
equivalente compatível existe
→ evoluir o existente

não existe mecanismo capaz de registrar alta frequência
→ criar somente UM ledger dentro da mesma skill
```

Caminho recomendado, somente se não existir equivalente:

```text
.agents/skills/lupa-bayesiana/references/uso-ledger.jsonl
```

Esse ledger é recurso interno da mesma skill. Não é Lupa paralela, V2 ou novo método.

Não usar `docs/CONSCIENCIA/APRENDIZADOS.md` como log de todo uso. Esse arquivo recebe apenas aprendizados novos consolidados.

---

# IMPLEMENTAÇÃO NO MESMO MOTOR

Reutilizar e ampliar o motor existente:

```text
.agents/skills/lupa-bayesiana/scripts/lupa_bayesiana.py
```

Não criar segundo script se o motor existente comportar subcomandos.

Subcomandos obrigatórios:

```text
begin-use
finish-use
verify-ledger
promote-learning
```

Interface mínima esperada:

```bash
python scripts/lupa_bayesiana.py begin-use \
  --repo ServerVpss/CentralDark \
  --mission-id "<id>" \
  --skill-path ".agents/skills/lupa-bayesiana/SKILL.md" \
  --skill-ref "<ref>" \
  --skill-commit-sha "<sha>" \
  --workspace-head "<sha>" \
  --mode "<read-only|edit|audit|deploy>"

python scripts/lupa_bayesiana.py finish-use \
  --mission-id "<id>" \
  --verdict "<APROVAR|CONDICIONAR|CORRIGIR|BLOQUEAR>" \
  --autolupa "<sim|nao>" \
  --point-fixed "<sim|nao>" \
  --tests-manifest "<arquivo-ou-json>" \
  --evidence-manifest "<arquivo-ou-json>"

python scripts/lupa_bayesiana.py verify-ledger

python scripts/lupa_bayesiana.py promote-learning \
  --usage-id "<id>"
```

Adaptar a interface à arquitetura real, preservando compatibilidade com comandos existentes.

---

# RECIBO DE USO

Cada utilização possui um `usage_id` determinístico:

```text
usage_id = SHA-256(
  schema_version
  + repo
  + mission_id
  + skill_commit_sha
  + workspace_head
)
```

Usar serialização canônica, UTF-8 e ordem estável de campos.

O ledger é append-only e possui dois eventos por uso:

```text
BEGIN
FINAL
```

## Evento BEGIN

Registrar imediatamente após a skill ser lida e antes da análise de fundo:

```json
{
  "schema_version": 1,
  "event": "BEGIN",
  "usage_id": "...",
  "started_at_utc": "...",
  "repo": "ServerVpss/CentralDark",
  "mission_id": "...",
  "workspace_branch": "...",
  "workspace_head": "...",
  "skill_path": ".agents/skills/lupa-bayesiana/SKILL.md",
  "skill_ref": "...",
  "skill_commit_sha": "...",
  "skill_blob_sha": "...",
  "mode": "read-only|edit|audit|deploy",
  "authorization": "PERMI
```