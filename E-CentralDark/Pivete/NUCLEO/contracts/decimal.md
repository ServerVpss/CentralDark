# CONTRATO - decimal.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.9.0\src\json_schema_impls\decimal.rs
**SHA:** c3f2161ef531dd3b
**Timestamp:** 2026-08-28T02:35:13.747764
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Contract::Deserialize => (
- Contract::Serialize => ("string".into(), r"^-?[0-9]+(\.[0-9]+)?$".into()),

### Ouro Bruto (primeiros 5000 chars)
```
use crate::_alloc_prelude::*;
use crate::generate::Contract;
use crate::{JsonSchema, Schema, SchemaGenerator};
use alloc::borrow::Cow;
use serde_json::Value;

macro_rules! decimal_impl {
    ($type:ty) => {
        impl JsonSchema for $type {
            inline_schema!();

            fn schema_name() -> Cow<'static, str> {
                "Decimal".into()
            }

            fn json_schema(generator: &mut SchemaGenerator) -> Schema {
                let (ty, pattern) = match generator.contract() {
                    Contract::Deserialize => (
                        Value::Array(vec!["string".into(), "number".into()]),
                        r"^-?[0-9]+(\.[0-9]+)?([eE][0-9]+)?$".into(),
                    ),
                    Contract::Serialize => ("string".into(), r"^-?[0-9]+(\.[0-9]+)?$".into()),
                };

                let mut result = Schema::default();
                result.insert("type".to_owned(), ty);
                result.insert("pattern".to_owned(), pattern);
                result
            }
        }
    };
}

#[cfg(feature = "rust_decimal1")]
decimal_impl!(rust_decimal1::Decimal);
#[cfg(feature = "bigdecimal04")]
decimal_impl!(bigdecimal04::BigDecimal);

```

---

# CONTRATO - decimal.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-1.2.2\src\json_schema_impls\decimal.rs
**SHA:** f449bce77d3f148d
**Timestamp:** 2026-08-28T02:35:17.824434
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Contract::Deserialize => (
- Contract::Serialize => ("string".into(), r"^-?\d+(\.\d+)?$".into()),

### Ouro Bruto (primeiros 5000 chars)
```
use crate::_alloc_prelude::*;
use crate::generate::Contract;
use crate::{JsonSchema, Schema, SchemaGenerator};
use alloc::borrow::Cow;
use serde_json::Value;

macro_rules! decimal_impl {
    ($type:ty) => {
        impl JsonSchema for $type {
            inline_schema!();

            fn schema_name() -> Cow<'static, str> {
                "Decimal".into()
            }

            fn json_schema(generator: &mut SchemaGenerator) -> Schema {
                let (ty, pattern) = match generator.contract() {
                    Contract::Deserialize => (
                        Value::Array(vec!["string".into(), "number".into()]),
                        r"^-?\d+(\.\d+)?([eE]\d+)?$".into(),
                    ),
                    Contract::Serialize => ("string".into(), r"^-?\d+(\.\d+)?$".into()),
                };

                let mut result = Schema::default();
                result.insert("type".to_owned(), ty);
                result.insert("pattern".to_owned(), pattern);
                result
            }
        }
    };
}

#[cfg(feature = "rust_decimal1")]
decimal_impl!(rust_decimal1::Decimal);
#[cfg(feature = "bigdecimal04")]
decimal_impl!(bigdecimal04::BigDecimal);

```