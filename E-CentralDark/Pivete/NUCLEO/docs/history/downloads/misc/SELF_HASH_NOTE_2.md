
# Por que o SHA final do ZIP não pode morar dentro do próprio ZIP

Inserir dentro do arquivo um texto contendo o SHA-256 final desse mesmo arquivo
altera os bytes do ZIP e, portanto, muda o SHA novamente.

Logo, um `ZIP_SELF_SHA` literal dentro do próprio ZIP cria circularidade.

Este pacote resolve corretamente com:
- manifestos internos de todos os conteúdos;
- parent SHA/root;
- successor proof root;
- verificação byte-a-byte;
- SHA-256 final emitido fora do arquivo, no recibo da entrega/chat.

O QR interno aponta para o successor proof root, não para um impossível self-hash fixo.
