
# CENTRALDARK — atualização cross-category sem regressão

Este diretório é **extensão** do pacote anterior. Nenhum arquivo do pacote-pai
foi reescrito durante esta atualização.

## Âncoras do pai

- ZIP SHA-256: `10edaf7df173f49be10cea28571821d903bc4bf849f257ad30fc91f803e53f91`
- PROOF_ROOT: `d869c8d00b0fd94e156934965c67fd22d7dde0c07c977dc43be5b104ebcfa4d1`
- main medido na análise: `94b6780bbbdf26a64acbadd1d7be03c22d32322d`

## Regra de zero regressão deste update

`ZERO_REGRESSION` significa:

1. cada caminho existente no pacote-pai continua existindo;
2. cada arquivo antigo mantém exatamente o mesmo tamanho e SHA-256;
3. a atualização adiciona apenas novos caminhos;
4. o novo ZIP é extraído e comparado byte-a-byte;
5. um rebuild determinístico deve produzir o mesmo SHA-256 do sucessor.

Isso **não** significa “zero risco universal em qualquer sistema do mundo”.
É uma prova fechada sobre o denominador: **todos os bytes do pacote-pai**.
