# OUTRO - num.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\proc-macro2-1.0.107\src\num.rs
**SHA:** 82d625cbcd255965
**Timestamp:** 2026-08-28T02:35:00.278689
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: use NonZero<char> in Rust 1.89+

### Ouro Bruto (primeiros 5000 chars)
```
// TODO: use NonZero<char> in Rust 1.89+
#[derive(Copy, Clone, Debug, PartialEq, Eq)]
pub struct NonZeroChar(char);

impl NonZeroChar {
    pub fn new(ch: char) -> Option<Self> {
        if ch == '\0' {
            None
        } else {
            Some(NonZeroChar(ch))
        }
    }

    pub fn get(self) -> char {
        self.0
    }
}

```