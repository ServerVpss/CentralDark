# OUTRO - decimal.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.8.22\src\json_schema_impls\decimal.rs
**SHA:** 8b69898e2ac1a21a
**Timestamp:** 2026-08-28T02:35:10.105373
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: Some(r"^-?[0-9]+(\.[0-9]+)?$".to_owned()),

### Ouro Bruto (primeiros 5000 chars)
```
use crate::r#gen::SchemaGenerator;
use crate::schema::*;
use crate::JsonSchema;
use std::borrow::Cow;

macro_rules! decimal_impl {
    ($type:ty) => {
        impl JsonSchema for $type {
            no_ref_schema!();

            fn schema_name() -> String {
                "Decimal".to_owned()
            }

            fn schema_id() -> Cow<'static, str> {
                Cow::Borrowed("Decimal")
            }

            fn json_schema(_: &mut SchemaGenerator) -> Schema {
                SchemaObject {
                    instance_type: Some(InstanceType::String.into()),
                    string: Some(Box::new(StringValidation {
                        pattern: Some(r"^-?[0-9]+(\.[0-9]+)?$".to_owned()),
                        ..Default::default()
                    })),
                    ..Default::default()
                }
                .into()
            }
        }
    };
}

#[cfg(feature = "rust_decimal")]
decimal_impl!(rust_decimal::Decimal);
#[cfg(feature = "bigdecimal03")]
decimal_impl!(bigdecimal03::BigDecimal);
#[cfg(feature = "bigdecimal04")]
decimal_impl!(bigdecimal04::BigDecimal);

```