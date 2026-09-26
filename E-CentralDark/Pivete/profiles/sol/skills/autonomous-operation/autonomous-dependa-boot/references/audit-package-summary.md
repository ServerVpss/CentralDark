# Audit Package Summary — CentralDark_Fluxo_Bidirecional_Auditoria_RECUPERADO_2026-08-24

## Visão Geral

Pacote recuperado em 2026-08-24 que preserva continuidade do pacotão de auditoria/reconciliação da Casa. Não afirma ser byte-a-byte igual ao histórico (SHA-256: `1583fad27aadc477827bb0d57746b0a962439add16a17ad221a512aa187c2bfc`), mas preserva intenção, owners conhecidos, gaps identificados e incorpora auditoria local read-only atual.

## Arquivos no Pacote

| Arquivo | Descrição |
|---------|-----------|
| `LEIA-ME.md` | Intenção e contrato geral. Fluxo: RECUPERAR → ENTENDER → RECONCILIAR → LOCALIZAR OWNER → REUTILIZAR → COMPLETAR SOMENTE GAP PROVADO |
| `ARQUITETURA-INTEGRADA.md` | Arquitetura integrada: SEGREDO → PIVETE → BFF → POLICY ENGINE → HERMES ORCHESTRATOR → EXECUTION BROKER → WORKSPACE → PREVIEW/TESTES → GITHUB GATE → GATEWAY/SUPABASE/WEBUI/TELEGRAM |
| `HANDOFF.md` | Handoff reconciliação local ↔ GitHub. Próximo artefato: `infra/host-audit/windows-readonly-audit.ps1` |
| `MANIFEST.json` | Metadados do pacote. Mutation/deploy/publication não autorizados. |
| `CHECKSUMS.json` | SHA-256 de todos os arquivos do pacote |
| `PRESERVE_LIST.txt` | Material que não deve ser removido sem absorção + contraprova |
| `adapters/LOVABLE.md` | Adapter Lovable (gap conhecido preenchido) |
| `sources/LOVABLE_INVENTARIO.md` | Inventário Lovable (gap conhecido preenchido) |
| `docs/CONSCIENCIA/EXECUCAO-REVERSIVEL.md` | Execução reversível: read-only até prova |
| `docs/CONSCIENCIA/REMEDIACAO.md` | Remedição: RECUPERAR → ALINHAR → CONTRAPROVAR → REMEDIAR → FIXED_POINT |
| `docs/CONSCIENCIA/ADMINISTRAVEIS.json` | Escopos administráveis: E:\CentralDark, C:\Users\danda, C:\CentralDark, AppData, GitHub |
| `infra/host-audit/windows-readonly-audit.ps1` | Script auditoria Windows read-only (1080 linhas) |
| `visual/AUTONOMIA-ORIGINAL-vs-DRIFT-ATUAL.png` | Mapa visual da autonomia original vs drift atual |

## Contratos Principais

- `LOCAL_FIRST=true`
- `DEPLOY=false`
- `PUBLICATION=false`
- `ONE_SYSTEM_ONLY=true`
- `REUSE_BEFORE_CREATE=true`
- `SERIALIZE_MUTATION=true`
- `ONE_WRITER_PER_SCOPE=true`
- `UNKNOWN != PASS`
- Auditoria inicial = **READ_ONLY**

## Regra de Continuação

Não criar nova arquitetura para mesma intenção. Nova matéria = DELTA. Antes de mutação: medir, localizar owner, detectar duplicata/delta, provar consumidor, aplicar correção mínima, remediar.

Fonte: `CentralDark_Fluxo_Bidirecional_Auditoria_RECUPERADO_2026-08-24.zip`
