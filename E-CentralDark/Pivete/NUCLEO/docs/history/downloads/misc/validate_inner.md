# OUTRO - validate_inner.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.8.22\tests\validate_inner.rs
**SHA:** 5940fd9bb8d3407f
**Timestamp:** 2026-08-28T02:35:11.525750
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- #[schemars(inner(contains(pattern = "substring...")))]

### Ouro Bruto (primeiros 5000 chars)
```
mod util;

use schemars::JsonSchema;
use util::*;

// In real code, this would typically be a Regex, potentially created in a `lazy_static!`.
static STARTS_WITH_HELLO: &str = r"^[Hh]ello\b";

#[allow(dead_code)]
#[derive(JsonSchema)]
pub struct Struct<'a> {
    #[schemars(inner(length(min = 5, max = 100)))]
    array_str_length: [&'a str; 2],
    #[schemars(inner(contains(pattern = "substring...")))]
    slice_str_contains: &'a [&'a str],
    #[schemars(inner(regex = "STARTS_WITH_HELLO"))]
    vec_str_regex: Vec<String>,
    #[schemars(inner(length(min = 1, max = 100)))]
    vec_str_length: Vec<&'a str>,
    #[schemars(length(min = 1, max = 3), inner(length(min = 1, max = 100)))]
    vec_str_length2: Vec<String>,
    #[schemars(inner(url))]
    vec_str_url: Vec<String>,
    #[schemars(inner(range(min = -10, max = 10)))]
    vec_i32_range: Vec<i32>,
}

#[test]
fn validate_inner() -> TestResult {
    test_default_generated_schema::<Struct>("validate_inner")
}

```