# COUNTERPROOF

## Pergunta adversarial
O pacote prova que a CentralDark está operacionalmente em FIXED_POINT?

**Não.**

## O que o pacote prova
- A imagem existe e foi preservada no pacote.
- Markdown e Mermaid representam a mesma família lógica.
- O rastro documenta origem e operação aplicada.
- Os hashes permitem verificar identidade de bytes.
- O verificador local confirma integridade dos arquivos listados.

## O que o pacote NÃO prova
- estado vivo atual do GitHub;
- estado de PRs, labels, CI, runners ou `main`;
- runtime Hermes/VPS/Casa;
- correção semântica de cada texto renderizado dentro da imagem;
- FIXED_POINT global.

## Invariantes
`HASH_MATCH = BYTE_IDENTITY, não prova semântica.`  
`VISUAL_CLAIM != RUNTIME_PROOF.`  
`UNKNOWN != PASS.`
