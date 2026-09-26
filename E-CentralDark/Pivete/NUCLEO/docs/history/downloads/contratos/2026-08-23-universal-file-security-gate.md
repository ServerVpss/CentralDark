# UNIVERSAL FILE SECURITY GATE v2 — REFERÊNCIA RÁPIDA

## Visão Geral
Gate defensivo canônico para validação de arquivos antes de entrarem em contexto confiável. **Orquestrador defensivo** — usa Defender/EDR/parsers existentes, reconcilia resultados, falha fechado. Respeita `REUSE_BEFORE_CREATE`.

**Arquivo canônico:** `E:\CentralDark\Pivete\NUCLEO\contracts\UNIVERSAL-FILE-SECURITY-GATE.md`

---

## Pipeline (7 Etapas)
```
ANY_FILE
→ ACQUIRE (stabilize, hash inicial)
→ STABILIZE (wait + re-hash vs TOCTOU)
→ IDENTIFY (path, filename, size, SHA-256, timestamps)
→ INSPECT (tipo real, double-extension, ADS, assinatura, container, polyglot)
→ VERIFY (antimalware, assinatura, provenance, contraprova)
→ COUNTERPROVE (tentar destruir conclusão CLEAN)
→ DECIDE → RELEASE_OR_ISOLATE
```

---

## Invariant Chassi (Não Negociáveis)
| Invariant | Significado |
|-----------|-------------|
| `EXTENSION != TRUST` | Extensão nunca basta |
| `PATH != TRUST` | Caminho não garante segurança |
| `SIGNED != SAFE` | Assinatura válida ≠ seguro |
| `SCAN_STARTED != CLEAN` | Scan iniciado ≠ limpo |
| `UNKNOWN != PASS` | Unknown nunca vira PASS |
| `ERROR != PASS` | Erro no gate/instrumento ≠ PASS |
| `PARTIAL_SCAN != PASS` | Scan parcial não passa |
| `INSPECTION != EXECUTION` | Nunca executar durante inspeção |
| `OLD_HASH_PASS != CURRENT_FILE_PASS` | PASS antigo não vale para hash novo |

---

## Decisões Canônicas (Estados Válidos)
| Estado | Definição |
|--------|-----------|
| **PASS** | Todas verificações obrigatórias concluídas, sem finding material, vinculado ao hash atual |
| **QUARANTINE** | Isolado reversivelmente por suspeita/divergência/evidência insuficiente |
| **BLOCK** | Política proíbe ou detecção material impede entrada |
| **UNKNOWN** | Evidência insuficiente para decisão |
| **ERROR** | Próprio gate/instrumento falhou |

**Regra:** `UNKNOWN != PASS`, `ERROR != PASS`, `SKIPPED != PASS`, `NOT_SCANNED != PASS`, `PARTIAL != PASS`

---

## Proteção TOCTOU (Release Token)
```
RELEASE_TOKEN:
  SHA256=
  SIZE=
  POLICY_VERSION=
  DECISION=PASS

# Antes do consumidor usar:
REHASH
CURRENT_SHA256 != RELEASE_SHA256 → INVALIDATE_PASS → RETURN_TO_GATE
```
**PASS não sobrevive a alteração do blob.**

---

## Containers / Archives
- `CONTAINER_PASS != CONTENT_PASS` — container limpo ≠ membros limpos
- Inspecionar estrutura → manifesto → validar paths → staging isolado → gate recursivo por membro
- Bloquear: ZIP_BOMB, RECURSION_BOMB, PATH_TRAVERSAL (`../`, `..\`, `C:\Windows`, `\\server\share`)
- Limites: `MAX_DEPTH`, `MAX_FILES`, `MAX_EXPANDED_BYTES`, `MAX_EXPANSION_RATIO`

---

## Execução vs Inspeção
```
INSPECTION != EXECUTION
```
- Nunca executar para "ver o que acontece"
- Scripts: ler/inspecionar estaticamente OK; executar = proibido
- `.lnk`: inspecionar destino/args; NUNCA abrir durante validação
- Dynamic analysis: `SANDBOX_ONLY` + política explícita + isolamento comprovado

---

## Falsificadores do Gate (Gate Quebrado Se...)
1. Scan iniciado relatado como CLEAN sem resultado final
2. Arquivo muda depois do scan e mantém PASS
3. Extensão divergente passa sem inspeção
4. Membro de archive não analisado herda PASS do container
4. Archive consegue escrever fora do staging
6. Assinatura válida vira justificativa única de PASS
7. UNKNOWN/SKIPPED/ERROR vira PASS
8. Conteúdo executado durante inspeção
9. DETECTED apagado sem decisão
10. Log contém segredo
11. Dois gates concorrentes → decisões divergentes
12. PASS antigo reutilizado para hash diferente

**Qualquer ocorrência → `FILE_SECURITY_GATE_INTEGRITY=FAIL` → BLOCK_RELEASE + PRESERVE_EVIDENCE**

---

## Testes Canônicos (Gate Deve Provar)
```
TEST_NORMAL_BENIGN_FILE
TEST_EXTENSION_MISMATCH
TEST_DOUBLE_EXTENSION
TEST_UNKNOWN_TYPE
TEST_FILE_MUTATION_DURING_SCAN
TEST_ANTIMALWARE_ERROR
TEST_UNSIGNED_EXECUTABLE
TEST_INVALID_SIGNATURE
TEST_ARCHIVE_NESTED
TEST_ARCHIVE_PATH_TRAVERSAL
TEST_ARCHIVE_LIMIT_EXCEEDED
TEST_ADS_UNEXPECTED
TEST_POLYGLOT
TEST_NOT_SCANNED_FALSE_GREEN
TEST_RELEASE_HASH_CHANGED
```
Para casos adversariais: **PASS deve ser impossível** quando condição esperada = BLOCK/QUARANTINE/UNKNOWN.

---

## Resultado Final Obrigatório
```
FILE_SECURITY_GATE_RESULT
  EVENT_ID=, FILE=, SOURCE=, SIZE=
  SHA256_INITIAL=, SHA256_FINAL=
  DECLARED_TYPE=, DETECTED_TYPE=, TYPE_MISMATCH=
  ADS=, SIGNATURE=
  ANTIMALWARE_ENGINE=, ANTIMALWARE_RESULT=
  CONTAINER=, CONTAINER_SCAN=, POLYGLOT=
  FILE_STABLE=, COUNTERPROOF=
  POLICY_VERSION=, DECISION=, REASON=
  RELEASE_TOKEN_SHA256=
```

---

## Regra Final
```
Somente: DECISION=PASS AND FILE_STABLE=TRUE AND SHA256_FINAL=RELEASE_TOKEN_SHA256
pode atravessar o gate.

Todo o restante permanece: BLOCKED | QUARANTINED | UNKNOWN | ERROR

NÃO CONFIE NO NOME | ÍCONE | EXTENSÃO | PASS ANTIGO
CONFIE SOMENTE NA EVIDÊNCIA PRESA AO BLOB EXATO.
REALITY = JUDGE.
```

---

## Arquivo Canônico Completo
`E:\CentralDark\Pivete\NUCLEO\contracts\UNIVERSAL-FILE-SECURITY-GATE.md` (v2, 985 linhas, MODE=FAIL_CLOSED, AUTHORITY=DEFENSIVE_ONLY)

---

## Integração com CentralDark
- **Reusa:** Defender/EDR nativo, parsers existentes, hash service nativo
- **Não cria:** file-gate-v2, scanner-final, quarantine-new, security-copy
- **One Gate:** `ONE_SECURITY_GATE`, `ONE_DECISION_PATH`, `ONE_AUDIT_TRAIL`
- **Contratos relacionados:** `TRILHO` (CARVE/GUME/VEREDITO), `FILE SECURITY GATE` (gate de arquivo)