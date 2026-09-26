# Bloqueio local de Code Integrity

## Evidencia

- PowerShell: 7.6.4.
- Evento: Code Integrity 3077.
- Policy ID observado: `0283AC0F-FFF1-49AE-ADA1-8A933130CAD6`.
- O bloqueio exige nivel de assinatura Enterprise; nao e CORS, porta ou
  chave da SOL.

## Arquivos rejeitados

| Arquivo | SHA-256 | Assinatura |
| --- | --- | --- |
| `01-FONTES/SOL-DESKTOP-POC-SOURCE/apps/sol-desktop/src-tauri/target/debug/sol-desktop.exe` | `eea1db2aa6e016e22154d00ec2d3042c7691113877022d6464048a302f89840e` | NotSigned |
| `03-VOZ/Kokoro-FastAPI/.venv/Lib/site-packages/curated_tokenizers/_wordpiece.cp312-win_amd64.pyd` | `e15c86e22380ec06ca7e6a6384fef18c1c6303650160ee1350dd624c5c9eb59f` | NotSigned |

## Estado

- SOL web em `localhost:1420`: funcionando.
- Ingresso local em `127.0.0.1:8787`: funcionando.
- Omni em `127.0.0.1:8099`: funcionando.
- Hermes em `127.0.0.1:8645`: funcionando.
- Kokoro em `127.0.0.1:8880`: funcionando.
- Tauri nativo: bloqueado pelo Code Integrity.

## Contraprova Tauri de 2026-08-30

- `cargo 1.97.1` e `rustc 1.97.1` foram encontrados no toolchain local e o build foi executado.
- A UI Vite compilou com sucesso antes da etapa Rust.
- O Code Integrity 3077/3033 bloqueou o carregamento de `cssparser_macros-874ce416aeff0e4a.dll` por `rustc.exe`.
- O build terminou com `E0463: can't find crate for cssparser_macros`.
- O bloqueio continua material e foi preservado sem desativar WDAC/Defender.

## Causa raiz confirmada

- `VerifiedAndReputablePolicyState=1`: Smart App Control esta em modo enforce.
- A listagem administrativa confirmou a politica `VerifiedAndReputableDesktop` ativa.
- Os eventos 3077/3033 sao consequencia dessa politica, nao falha de CORS, porta ou contrato da SOL.
- O artefato que precisa ser aceito por uma remediacao administrada e `cssparser_macros-874ce416aeff0e4a.dll` durante o build Rust/Tauri.

## Remediacao permitida

Usar uma build Tauri assinada ou uma regra allow por hash na politica
administrada, com piloto e contraprova. Nao editar ou remover `.cip`, nao
desligar WDAC/Defender e nao usar bypass de assinatura.
