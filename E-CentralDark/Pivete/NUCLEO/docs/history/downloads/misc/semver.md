# OUTRO - semver.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.8.22\src\json_schema_impls\semver.rs
**SHA:** b288f1c5a1809cd0
**Timestamp:** 2026-08-28T02:35:10.317044
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: Some(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$".to_

### Ouro Bruto (primeiros 5000 chars)
```
use crate::r#gen::SchemaGenerator;
use crate::schema::*;
use crate::JsonSchema;
use semver::Version;
use std::borrow::Cow;

impl JsonSchema for Version {
    no_ref_schema!();

    fn schema_name() -> String {
        "Version".to_owned()
    }

    fn schema_id() -> Cow<'static, str> {
        Cow::Borrowed("semver::Version")
    }

    fn json_schema(_: &mut SchemaGenerator) -> Schema {
        SchemaObject {
            instance_type: Some(InstanceType::String.into()),
            string: Some(Box::new(StringValidation {
                // https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
                pattern: Some(r"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$".to_owned()),
                ..Default::default()
            })),
            ..Default::default()
        }
        .into()
    }
}

```