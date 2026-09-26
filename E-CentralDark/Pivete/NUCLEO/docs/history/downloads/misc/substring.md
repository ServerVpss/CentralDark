# OUTRO - substring.toml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-1.13.1\testdata\substring.toml
**SHA:** 48122d9f3477ed81
**Timestamp:** 2026-08-28T02:35:04.978698
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- bounds = { start = 2, end = 5 }
- bounds = { start = 0, end = 3 }
- bounds = { start = 2, end = 5 }
- bounds = { start = 0, end = 3 }

### Ouro Bruto (primeiros 5000 chars)
```
# These tests check that regex engines perform as expected when the search is
# instructed to only search a substring of a haystack instead of the entire
# haystack. This tends to exercise interesting edge cases that are otherwise
# difficult to provoke. (But not necessarily impossible. Regex search iterators
# for example, make use of the "search just a substring" APIs by changing the
# starting position of a search to the end position of the previous match.)

[[test]]
name = "unicode-word-start"
regex = '\b[0-9]+\b'
haystack = "β123"
bounds = { start = 2, end = 5 }
matches = []

[[test]]
name = "unicode-word-end"
regex = '\b[0-9]+\b'
haystack = "123β"
bounds = { start = 0, end = 3 }
matches = []

[[test]]
name = "ascii-word-start"
regex = '\b[0-9]+\b'
haystack = "β123"
bounds = { start = 2, end = 5 }
matches = [[2, 5]]
unicode = false

[[test]]
name = "ascii-word-end"
regex = '\b[0-9]+\b'
haystack = "123β"
bounds = { start = 0, end = 3 }
matches = [[0, 3]]
unicode = false

```