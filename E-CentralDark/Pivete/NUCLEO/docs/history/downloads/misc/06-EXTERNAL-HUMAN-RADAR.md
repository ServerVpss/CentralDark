# EXTERNAL HUMAN RADAR

Objetivo: usar produção pública/profissional como **fontes vivas**, não como “agentes secretos”.

## Modelo

```text
HUMAN_SOURCE
→ DISCOVERY
→ SOURCE IDENTITY
→ PROVENANCE
→ TRANSCRIPT/TEXT
→ CLAIM EXTRACTION
→ LENS PACKET
→ DEDUPE/ECHO CLUSTER
→ CONFLICT
→ DISCRIMINATING TEST
→ CANDIDATE DELTA
```

## Fonte pública permitida

- website oficial;
- blog oficial/profissional;
- GitHub público;
- podcast público;
- conferência pública;
- entrevista pública;
- paper público;
- feed RSS/Atom;
- post social público.

Proibido:
- conta fechada;
- bypass de autenticação;
- doxxing;
- residência;
- família;
- telefone/email privados;
- tracking de localização privada.

## Identidade

Se nome, pessoa ou fonte divergir entre documentos:

```text
SOURCE_IDENTITY=UNRESOLVED
```

Não fundir perfis por semelhança textual.

## Atualização

Guardar:
- posição histórica;
- observação atual;
- delta;
- fonte;
- timestamp.

Sem observação nova:
`CURRENT_POSITION=UNKNOWN`.

## Radar

O radar deve priorizar mudança, não repetição:

```text
NO_CHANGE → baixo custo
NEW_SOURCE → processar
SOURCE_CHANGED → reprocessar
CONFLICT_NEW → elevar
```
