# Estado de validação

## Executado neste ambiente

- inspeção integral do relatório de entrada;
- verificação de sintaxe do `verify.sh` com `bash -n`;
- busca por `unsafe`, `TODO`, `FIXME`, `unwrap` e `expect`;
- isolamento de todo `unsafe` no módulo `asm_hardening.rs`;
- revisão manual de limites, AAD, ordem AEAD/replay, rotação e retry;
- teste estrutural e de integridade do arquivo ZIP.

## Bloqueado neste ambiente

O ambiente de geração não expõe `rustc`, `cargo` ou `rustfmt`. Por isso não foi
possível executar aqui `cargo fmt`, `cargo clippy`, `cargo test`, build release,
Miri, sanitizers, `cargo-audit` ou `cargo-deny`. O pacote não declara esses
passos como aprovados.

## Gate de revisão

Executar em uma máquina com Rust disponível:

```bash
./verify.sh
```

Antes de produção, acrescentar:

```bash
cargo install cargo-audit cargo-deny
./verify.sh
```

Produção permanece bloqueada até CI verde, revisão do código `unsafe`, teste de
interoperabilidade TLS com a PKI real e armazenamento distribuído linearizável
para sequência/replay/revogação.

`Cargo.lock` não foi fabricado manualmente: deve ser gerado por `cargo` e
versionado pelo primeiro CI verde.
