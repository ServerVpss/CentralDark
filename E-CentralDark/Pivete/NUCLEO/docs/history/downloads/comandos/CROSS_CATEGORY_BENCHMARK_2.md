
# Benchmark cross-category — rigor máximo

Não existe benchmark universal que permita afirmar que uma arquitetura vence
“qualquer categoria”. Este documento compara a CentralDark com **categorias
materialmente adjacentes** e registra onde cada especialidade é superior.

| Categoria | O que ela faz melhor | Onde CentralDark acrescenta |
|---|---|---|
| NIST SSDF | secure SDLC e prevenção sistemática de recorrência | transforma correção em loop de evidência/teste/gate/cristal |
| NIST Zero Trust | acesso e autorização sem confiança implícita | estende a intuição para estado/conclusão: modelo/histórico não ganham confiança implícita |
| NIST AI RMF | governar, mapear, medir e gerenciar risco de IA | tenta operacionalizar esse ciclo no fluxo dos agentes |
| OWASP Agentic AI | taxonomia de ameaças agentic | destination lock, authority scope, one writer, material!=authority, counterproof |
| OWASP SAMM | maturidade institucional de software security | convergência de intenção + execução + aprendizado adversarial |
| SLSA 1.2 | provenance/attestation e hardening do build/source | pode consumir SLSA como juiz material de supply chain |
| Google SRE | SLO, error budgets, canary e release engineering em produção | preserva intenção multiagente e anti-self-validation acima do SRE |
| GitHub Rulesets | enforcement externo de merge/status/signature/scanning | CentralDark define semântica; host deve impor as fronteiras materiais |
| IETF IPP draft | intent provenance criptográfica e bounded delegation | CentralDark acrescenta reconciliação, contraprova, remedição e aprendizagem operacional |

## Veredito

**CentralDark não é melhor em todos os subdomínios.**
SLSA é mais forte em supply-chain attestation; SRE em reliability de produção;
SAMM/SSDF em cobertura institucional; IPP em intent provenance criptográfica.

O diferencial observado da CentralDark é **integrar intenção humana, agentes,
software, histórico, evidência, falsificação, remedição e aprendizagem acumulativa
sob um único ciclo de convergência**.

Isso sustenta a classificação de **meta-control plane**, não uma alegação de
“melhor arquitetura do mundo”.
