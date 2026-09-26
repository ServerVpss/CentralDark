# Perfil do Usuário → CentralDark: Reconciliação e Classificação

Use quando absorver material de `C:\Users\<user>\` (ou qualquer perfil/casa do usuário) rumo à CentralDark, com intenção declarada de mover/integrar/reconciliar ouro, sem backup cego, sem duplicata, sem arrancar estado runtime vivo.

## 1. Regra de fronteira antes de qualquer escaneamento

NÃO recortar `C:\Users\<user>` inteiro.

Diretórios com ponto inicial (`.claude`, `.codex`, `.hermes`, `.overclock-app`, `.config`, `.docker`, `.cargo`, etc.) podem ser **estado vivo** de programas/agentes. O agente deve recortar para a CentralDark somente o material durável que provar pertencer à Casa. Estado que precisa continuar vivo no perfil fica no lugar e ganha owner/índice/referência na Casa.

## 2. Escaneamento — ZERO MUTAÇÃO

Abra frentes READ_ONLY suficientes e meça. Para cada item encontrado, produzir registro com:

```
PATH
OWNER_PROVAVEL
CAPABILITY
ACTIVE_RUNTIME=true|false|unknown
CENTRALDARK_RELEVANCE
PROVENANCE
HASH quando aplicável
DUPLICATE_OF
CANONICAL_OWNER
MOVE_SAFE
RESIDUAL
VERDICT
```

Não presumir nome parecido como prova de dono.

## 3. Classificação em 7 categorias

### 🟢 OURO_DURAVEL
Material que prova pertencer à história/runtime/skills/memória/orquestração/futuro da CentralDark e que pode/Deve ser reconciliado no owner canônico.
Ex: skill completa de Screenpipe, BOOT de Lupa, learning canônico, arquivo de missão com contrato operacional.

→ encontrar owner existente em `E:\CentralDark`
→ mover para owner correto
→ preservar provenance
→ recalcular hash
→ confirmar destino
→ somente depois considerar origem reconciliada

### 🟡 ESTADO_RUNTIME_VIVO
Estado de programa/agente em execução ou com consumidor ativo.
Ex: `.overclock-app/session.json` (accessToken, refreshToken, email), `.claude/credentials.json`, `.codex/.codex.zip`, `.hermes/config.yaml`.

→ NÃO arrancar do perfil enquanto estiver sendo usado
→ registrar owner, schema, relação e caminho (sem imprimir secrets)
→ integrar a CentralDark por contrato/referência existente
→ migrar fisicamente somente se houver prova de que o consumidor funciona no novo path

### 🟡 CONFIG_REFERENCIAVEL
Configuração que não é secreta e que a Casa pode querer referenciar ou versionar parcialmente.
Ex: `.hermes/skills/screenpipe-api/SKILL.md`, `.hermes/skills/screenpipe-cli/SKILL.md`, `.codex/.codex-global-state.json` (histórico de instruções).

→ absorver o delta útil, não o arquivo bruto inteiro quando o arquivo for estado de programa
→ verificar se skill já existe no repo antes de criar (REUSE_BEFORE_CREATE)

### 🟡 DUPLICATA
Material que o hash ou o conteúdo prova ser cópia do que já está na Casa ou em outro lugar reconciliado.
→ dedupe pela prova/hash
→ não criar segunda cópia
→ registrar DUPLICATE_OF

### 🟡 LEGADO_COM_DELTA
Material antigo que ainda carrega instrução/histórico útil, mas que não deve ser versionado inteiro.
Ex: `.codex/.codex-global-state.json` com prompt-history contendo instruções de deploy webhook e histórico de commits da CentralDark.

→ extrair somente o delta útil
→ incorporar no owner atual (ex: `docs/CONSCIENCIA/APRENDIZADOS/`)
→ eliminar sistema paralelo

### 🔴 LIXO_PROVADO
Material que prova não ter relação com a CentralDark.
Ex: atalhos genéricos (Google Chrome), ferramentas de terceiros não relacionadas, cache de programa, arquivos de log de programa.

→ descartar da missão, sem apagar fonte arbitrariamente

### ⚫ UNKNOWN
Material que não pôde ser classificado com proveito nesta sessão.
Ex: arquivos binários sem inspeção (`DESAFIO-OMEGA-AUTOLUPA.zip`), screenshots sem contexto, banco de dados SQLite sem leitura.

→ medir até resolver ou registrar UNKNOWN material
→ NUNCA declarar PASS com UNKNOWN

## 4. Regra de credencial — NÃO NEGOCIÁVEL

Arquivos que contêm `accessToken`, `refreshToken`, `email`, `API key`, `secret`, `credential`, `chave`, `token` **não podem ser impressos em log, receipt, diff ou commit**.

Antes da escrita:
```
sanitizar
→ validar schema
→ validar UTF-8
→ calcular record_hash
→ varrer secrets
→ append atômico
```

Se detectar dado sensível:
```
não escrever o dado
→ substituir por [REDACTED]
→ registrar sensitive_data_blocked=true
→ continuar com recibo sanitizado
```

Exemplo concreto: `.overclock-app/session.json` contém `accessToken`, `refreshToken`, `email`. O registro deve conter somente:
```
PATH=.overclock-app/session.json
OWNER_PROVAVEL=Overclock/Enxame Ômega
CAPABILITY=state runtime
ACTIVE_RUNTIME=true
CENTRALDARK_RELEVANCE=CONTRACTO_REFERENCIAVEL
PROVENANCE=c:\Users\danda\.overclock-app
HASH=<sha256>
DUPLICATE_OF=none
CANONICAL_OWNER=Overclock/Enxame Ômega
MOVE_SAFE=false
RESIDUAL=schema somente, sem imprimir token
VERDICT=ESTADO_RUNTIME_VIVO
```

## 5. Padrão worktree para absorção ONE_WRITER

Quando houver delta útil concentrado e a intenção for commitar no repo:

1. `git fetch origin main`
2. `git pull --ff-only origin main` (ou fast-forward)
3. Criar worktree dedicado a partir de `origin/main`:
   ```
   git worktree add -f <caminho-worktree> origin/main
   ```
4. Entrar no worktree e criar branch de missão:
   ```
   cd <worktree>
   git checkout -b absorcao-<escopo>
   ```
5. Copiar/mover somente o delta útil que prova pertencer ao repo
6. Commit, push, PR — um writer por escopo, sem force-push, sem push de main suja

Nunca commitar cache, banco vivo, segredo, perfil bruto ou estado runtime.

## 6. Cláusula de loop (reconciliação contínua)

Enquanto houver:
```
OURO_NAO_RECONCILIADO > 0
OU UNKNOWN_MATERIAL > 0
OU MATERIAL_CONTRADICTIONS > 0
```

executar:
```
#ACORDAR
→ medir somente o que mudou
→ !RECONCILIAR
→ menor delta
→ !CONTRAPROVA
→ !REMEDIÇÃO
→ receipt
→ NEXT_CURSOR
```

NÃO perguntar novamente pela intenção.
NÃO girar em vazio.
NÃO parar porque criou PR ou commitou.

FIXED_POINT somente quando:
```
C_USER_PROFILE_SCANNED=true
CENTRALDARK_OURO_RECONCILED=true
DURABLE_DUPLICATION=0
UNKNOWN_MATERIAL=0
MATERIAL_CONTRADICTIONS=0
MAIN_RECONCILED=true
CHECKS_PROVED=true
SQUASH_MERGE_PROVED=true
COUNTERPROOF_SURVIVES=true
```

## 7. Armadilhas conhecidas desta sessão

| Armadilha | Correção |
|-----------|----------|
| Recortar `C:\Users\danda` inteiro | NÃO. Recortar somente material durável que prova pertencer à CentralDark. Estado runtime vive no perfil. |
| Imprimir `.overclock-app/session.json` | PROIBIDO. Contém accessToken/refreshToken/email. Registrar schema somente. |
| Tratar `.overclock-app` como dono novo | Não. `.overclock-app` é HISTÓRICO/OPERACIONAL de primeira classe, mas já tem owner existente (Overclock/Enxame Ômega). Amarra ao owner existente, não cria segundo orquestrador. |
| Duplicar skill que já existe no repo | REUSE_BEFORE_CREATE. Verificar `find .agents/skills -name "*screenpipe*"` antes de criar `.agents/skills/screenpipe-api/`. |
| Versionar `.codex/.codex.zip` | Descartar. É cache de programa, não ouro. |
| Declarar UNKNOWN como PASS depois de sessão longa | NÃO. UNKNOWN permanece UNKNOWN até medição nova. |
| Criar V2/V3/segundo cérebro para o que o owner existente absorve | ONE_OWNER_PER_CAPABILITY. Extender owner, não criar sistema paralelo. |

## 8. Quando NÃO usar este padrão

- Backup cego de desktop/OneDrive/Downloads sem intenção de absorção → não é missão, é cópia. Perguntar destino antes.
- Material que só interessa ao perfil do usuário e não à CentralDark → deixar no lugar, registrar referência se útil.
- Estado runtime sendo consumido ativamente → não mover fisicamente sem prova de migração.
- Credencial, secret, token, chave → NUNCA imprimir, NUNCA versionar, NUNCA mover sem autorização explícita e destino seguro.
