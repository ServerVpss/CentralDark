# 2026-10-02 — Canal limitado: registro compacto + expansão recuperável

## Técnica

Quando a superfície/canal bloqueia uma escrita grande, a CentralDark não trata isso como bloqueio da missão e não cria arquivo/owner paralelo.

Fluxo canônico:

```text
CHANNEL_LIMIT
→ COMPACT_CANONICAL_RECORD
→ EXPANDED_REMEMBRANCE
→ BACKLINK
→ SAME_OWNER
→ CONTINUE
```

## Regras

```text
CHANNEL_LIMIT_IS_NOT_MISSION_BLOCKED=true
COMPRESSION_IS_NOT_INFORMATION_LOSS=true
COMPACT_CANONICAL_RECORD_REQUIRED_ON_CHANNEL_LIMIT=true
EXPANDED_REMEMBRANCE_REQUIRED_WHEN_COMPRESSION_WOULD_DROP_MATERIAL_CONTEXT=true
EXPANSION_MUST_BACKLINK_CANONICAL_RECORD=true
SAME_OWNER_MUST_BE_EVOLVED=true
NO_V1_V2_V3_CHANNEL_FALLBACK=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
```

## Proveniência

A técnica nasceu da própria execução: uma tentativa de registrar um bloco grande foi barrada pelo canal; o caminho que funcionou foi escrever o aprendizado compacto e preservar a expansão em Lembranças. Isso já era compatível com #133: compressão sem perder expansão recuperável.

## Contraprova

- canal rejeitar payload grande não prova owner indisponível;
- compactar não autoriza apagar owner, provenance, contraprova ou NEXT_CURSOR;
- Lembrança expandida é expansão/index semântico, não segundo owner;
- se a escrita compacta também falhar, aí o blocker é outro e deve ser classificado separadamente.

## NEXT_CURSOR

Aplicar automaticamente este fallback a qualquer registro material futuro quando o canal rejeitar tamanho/formato, sem pedir ao CHEFE para repetir o conteúdo e sem criar v2/v3.
