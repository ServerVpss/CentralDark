# Monitoramento vivo — produção pública/profissional

Objetivo: manter cada lente atualizada conforme a pessoa publica, fala, lança projeto ou altera posição publicamente.

```text
PUBLIC_PROFESSIONAL_FOOTPRINT=ALLOWED
PRIVATE_LIFE_TRACKING=FORBIDDEN
PRIVATE_ACCOUNT_BYPASS=FORBIDDEN
AUTHENTICATED_SCRAPING_WITHOUT_AUTHORITY=FORBIDDEN
```

## Ordem de aquisição

1. fonte oficial da pessoa/organização;
2. GitHub público;
3. blog/documentação oficial;
4. RSS/Atom;
5. podcast/conferência oficial;
6. busca web;
7. Grok/search quando realmente disponível e medido;
8. agregador somente para descoberta — confirmar primária quando material.

## “Tempo real”

```text
WEBHOOK_OR_FEED_AVAILABLE → EVENT_DRIVEN
RSS_OR_CHANGE_FEED → FREQUENT_PULL
STATIC_SITE → PERIODIC_DISCOVERY
SEARCH_ENGINE → DISCOVERY_FALLBACK
NO_FRESH_OBSERVATION → CURRENT_POSITION=UNKNOWN
```

## Dedupe

Fingerprint lógico:

```text
canonical_url + publisher + human_router_id + published_at + external_id + content_hash_when_observed
```

Mesma entrevista republicada em três sites continua um único cluster causal.

## Mudança de posição

```text
OLD_CLAIM + NEW_PUBLICATION
→ mesmo assunto?
→ delta real?
→ POSITION_DELTA | NO_CHANGE
```

Publicação antiga nunca prova posição atual sem observação suficiente.
