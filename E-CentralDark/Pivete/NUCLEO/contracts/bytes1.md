# CONTRATO - bytes1.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.9.0\src\json_schema_impls\bytes1.rs
**SHA:** a6c7df17cc0ab36d
**Timestamp:** 2026-08-28T02:35:13.718699
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- Contract::Deserialize => Value::Array(vec!["array".into(), "string".into()]),
- Contract::Serialize => "array".into(),

### Ouro Bruto (primeiros 5000 chars)
```
use crate::_alloc_prelude::*;
use crate::generate::Contract;
use crate::{JsonSchema, Schema};
use alloc::borrow::Cow;
use serde_json::Value;

impl JsonSchema for bytes1::Bytes {
    fn schema_name() -> Cow<'static, str> {
        "Bytes".into()
    }

    fn schema_id() -> Cow<'static, str> {
        "bytes::Bytes".into()
    }

    fn json_schema(generator: &mut crate::SchemaGenerator) -> crate::Schema {
        let ty = match generator.contract() {
            Contract::Deserialize => Value::Array(vec!["array".into(), "string".into()]),
            Contract::Serialize => "array".into(),
        };

        let mut result = Schema::default();
        result.insert("type".to_owned(), ty);
        result.insert("items".to_owned(), generator.subschema_for::<u8>().into());
        result
    }
}

forward_impl!(bytes1::BytesMut => bytes1::Bytes);

```