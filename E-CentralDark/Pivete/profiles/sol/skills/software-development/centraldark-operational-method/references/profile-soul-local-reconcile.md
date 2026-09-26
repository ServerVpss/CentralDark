# Profile ↔ SOUL Canônica — Reconciliação LOCAL (noremoto)

Extraído da missão de reconciliação do perfil `pivete` (2026-08-24).

## Objetivo
Fazer um profile HERMES (ex: `profiles/pivete/SOUL.md`) atuar como **adaptador
subordinado** à SOUL canônica (`docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md`),
sem copiar o corpo da SOUL para dentro do perfil, e tornar o boot reconciliável
de forma permanente no disco local.

## Regra estrutural (NÃO copiar)
```
SOUL-SOL.md            ← fonte única (canônico, edição do SEGREDO/CHEFE)
      │
      ▼
CANONICAL BOOT / ALLOWLIST (LEIA-ME-IA → AGENTS → SOUL-SOL)
      │
      ▼
SOL = coordenação canônica quando presente
      │
      ▼
HERMES PROFILE = adaptação ao corpo/runtime (este arquivo)
      │
      ▼
HERMES-CASA = execução
```
```text
PROFILE_IS_ADAPTER=true
PROFILE_IS_NOT_SOUL=true
PROFILE_IS_NOT_AUTHORITY=true
PROFILE_MUST_REFERENCE_CANONICAL_SOUL=true
DO_NOT_COPY_FULL_SOUL_INTO_PROFILE=true
DO_NOT_CREATE_SECOND_SOL=true
DO_NOT_CREATE_SECOND_HERMES=true
```

## Passos (R1/R2, reversível)
1. Medir estado real: onde o runtime lê o SOUL do perfil? No Hermes isso é
   `C:\Users\<user>\AppData\Local\hermes\profiles\<name>\SOUL.md`, NÃO o
   `E:\CentralDark\Pivete\profiles\<name>\` (fonte Casa). Confirmar com
   `search_files`/`find` + mtime. Não mover arquivo que o runtime consome vivo
   (ver Lição 15 do método: DOCUMENTED_DIVERGENCE, não QUARANTINE).
2. Ler SOUL-SOL canônico LOCAL (noremoto: não `git fetch`/origin).
3. Verificar se o SOUL do perfil já é adaptador (tem `CANONICAL_SOUL=` ou
   equivalente apontando pro canônico). Se sim, pular cópia.
4. Se faltar conceito canônico no perfil → patch cirúrgico (anexar bloco de
   boot/referência), NUNCA colar o corpo do SOUL-SOL.
5. Criar harness `casa_boot.py` (ver `scripts/casa_boot.py`) no dir do perfil.
6. Referenciar o harness no próprio SOUL do perfil ("executar `uv run python
   casa_boot.py` no boot"). Isso É a ativação permanente local: o agente lê e
   roda a cada sessão do profile.

## PITFALL CRÍTICO — diff por linha literal = DRIFT FALSO
O perfil REESCREVE os invariantes com linguagem própria:
- canônico: `ONE_WRITER_PER_SCOPE=true`
- perfil:   `SINGLE_WRITER_PER_SCOPE=ENFORCED`

Se você comparar linha-a-linha, o script marca DRIFT mesmo quando o perfil está
correto. **Correção:** checar PRESENÇA DE CONCEITO (mapa de variantes aceitáveis),
não igualdade de linha. O `casa_boot.py` faz exatamente isso: cada conceito tem
uma lista de substrings aceitáveis; DRIFT só dispara se NENHUMA variante do
conceito aparece no perfil.

Na prática, o primeiro rascunho deste script usou diff literal e deu
`status=DRIFT` com 42 linhas — tudo falso-positivo. Refinado para conceito,
ficou `status=OK` após adicionar só o lema `MENOS_E_MAIS=true` que de fato
faltava. Esse é o padrão: **conceito, não linha**.

## noremoto
Quando o CHEFE diz "noremoto", reconciliar contra o clone LOCAL
(`E:\CentralDark\Pivete\CentralDark`), não contra `origin/main`. Não rodar
`git fetch`. O harness lê o arquivo local direto.

## Prova
- Antes do patch: `status=DRIFT` (faltava MENOS_E_MAIS).
- Depois do patch: `status=OK`, `governance_missing=[]`.
- `RUNTIME_CONSUMPTION` fica UNKNOWN até o hermes rodar o harness num boot real;
  validar manualmente com `uv run python casa_boot.py` é suficiente para fechar
  o delta (o mecanismo está pronto e documentado no SOUL do perfil).

## Python no PATH
Nestas máquinas `python`/`python3` podem não estar no PATH (alias da Microsoft
Store), mas `uv` está. Rodar scripts com `uv run --no-project python script.py`.
Isso é workaround de ambiente, não regra durável — só anote no comando de uso.
