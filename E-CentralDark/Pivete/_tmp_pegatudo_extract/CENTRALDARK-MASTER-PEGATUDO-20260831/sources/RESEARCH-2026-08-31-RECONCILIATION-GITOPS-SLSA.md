# Pesquisa externa — reconciliação, CI e proveniência (31/08/2026)

Aplicado ao pacote como inspiração de engenharia, não como dependência nova:

- OpenGitOps: estado desejado declarativo, versionado/imutável, puxado automaticamente e continuamente reconciliado.
- GitHub branch protection: checks obrigatórios podem bloquear merge; branch pode exigir estar atualizada com a base; checks devem pertencer ao commit correto.
- SLSA provenance: artefato deve carregar informação verificável de onde/quando/como foi produzido.
- Argo CD: webhook/trigger acelera, mas reconciliação compara desired state com live state; prune não deve ser assumido como seguro por padrão.

CentralDark traduz isso para:

`GitHub desired state + Casa/VPS actual state + Drive mirror + receipts + exact HEAD CI + no destructive prune by default`.
