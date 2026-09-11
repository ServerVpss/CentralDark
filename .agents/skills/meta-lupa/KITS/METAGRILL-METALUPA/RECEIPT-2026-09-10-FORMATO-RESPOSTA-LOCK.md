# 🧾🔒 RECEIPT · FORMATO DE RESPOSTA CANÔNICO

```text
ID=METAGRILL-METALUPA-FORMATO-RESPOSTA-LOCK-20260910
OWNER=.agents/skills/meta-lupa/SKILL.md
AUTHORITY=SEGREDO/CHEFE
TARGET=.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/FORMATO-RESPOSTA-CANONICO.md
TARGET_BLOB_SHA1=b3e31bdc271b53272ad42181b8246aa85f880868
GUARD=.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/FORMATO_CANONICAL_SHA
VALIDATOR=scripts/lupa/validar_autolupa_hash.py
CI_CONSUMER=.github/workflows/lupa-conformance.yml
FORMAT_LOCKED=true
EMOJI_REQUIRED=true
SEMANTIC_ANCHORS_REQUIRED=true
PROOF_FOOTER_ON_MUTATION=true
CHANGE_REQUIRES_SEGREDO_CHEFE=true
UNKNOWN_IS_NOT_PASS=true
```

## 🪶 Rastro

```text
56cf12f4a93c39311a8f28e03c9c0acb01125525 → cristaliza FORMATO-RESPOSTA-CANONICO.md
72cefb3088e04e4f81cd0c5d838eb2116bf0ffb4 → fixa FORMATO_CANONICAL_SHA
6e6de4741c0496675b9ed67acc57a14c13fc727b → integra cadeado ao validador já consumido pelo lupa-conformance
a528b0a5fe1bcf937f1f935e7cda8f6e3b29ba6e → liga KIT.md ao formato bloqueado
```

## ⚖️ Limite da prova

O receipt prova a cristalização no GitHub e a ligação do cadeado ao gate existente. Não declara CI verde, deploy ou runtime sem medição posterior.
