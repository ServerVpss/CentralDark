# OUTRO - schemars_attrs.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.8.22\examples\schemars_attrs.rs
**SHA:** 41f753f95862c50f
**Timestamp:** 2026-08-28T02:35:09.768629
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- #[schemars(inner(regex(pattern = "^x$")))]

### Ouro Bruto (primeiros 5000 chars)
```
use schemars::{schema_for, JsonSchema};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, JsonSchema)]
#[schemars(rename_all = "camelCase", deny_unknown_fields)]
pub struct MyStruct {
    #[serde(rename = "thisIsOverridden")]
    #[schemars(rename = "myNumber", range(min = 1, max = 10))]
    pub my_int: i32,
    pub my_bool: bool,
    #[schemars(default)]
    pub my_nullable_enum: Option<MyEnum>,
    #[schemars(inner(regex(pattern = "^x$")))]
    pub my_vec_str: Vec<String>,
}

#[derive(Deserialize, Serialize, JsonSchema)]
#[schemars(untagged)]
pub enum MyEnum {
    StringNewType(#[schemars(phone)] String),
    StructVariant {
        #[schemars(length(min = 1, max = 100))]
        floats: Vec<f32>,
    },
}

fn main() {
    let schema = schema_for!(MyStruct);
    println!("{}", serde_json::to_string_pretty(&schema).unwrap());
}

```

---

# OUTRO - schemars_attrs.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.9.0\examples\schemars_attrs.rs
**SHA:** db85049ad7bfce78
**Timestamp:** 2026-08-28T02:35:13.251679
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- #[schemars(inner(regex(pattern = "^x$")))]

### Ouro Bruto (primeiros 5000 chars)
```
use schemars::{schema_for, JsonSchema, Schema};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, JsonSchema)]
#[schemars(rename_all = "camelCase", deny_unknown_fields, extend("x-customProperty" = "example"))]
pub struct MyStruct {
    #[serde(rename = "thisIsOverridden")]
    #[schemars(rename = "myNumber", range(min = 1, max = 10), transform = remove_format)]
    pub my_int: i32,
    pub my_bool: bool,
    #[schemars(default)]
    pub my_nullable_enum: Option<MyEnum>,
    #[schemars(inner(regex(pattern = "^x$")))]
    pub my_vec_str: Vec<String>,
}

#[derive(Deserialize, Serialize, JsonSchema)]
#[schemars(untagged)]
pub enum MyEnum {
    StringNewType(#[schemars(email)] String),
    StructVariant {
        #[schemars(length(min = 1, max = 100))]
        floats: Vec<f32>,
    },
}

fn remove_format(schema: &mut Schema) {
    schema.remove("format");
}

fn main() {
    let schema = schema_for!(MyStruct);
    println!("{}", serde_json::to_string_pretty(&schema).unwrap());
}

```