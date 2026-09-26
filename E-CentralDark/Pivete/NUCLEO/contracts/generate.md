# CONTRATO - generate.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.9.0\src\generate.rs
**SHA:** 8a7afd4dc6679a30
**Timestamp:** 2026-08-28T02:35:13.310780
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- /// Defaults to `Contract::Deserialize`.
- pub contract: Contract,
- contract: Contract::Deserialize,
- contract: Contract::Deserialize,
- contract: Contract::Deserialize,
- contract: Contract::Deserialize,
- self.contract = Contract::Deserialize;
- self.contract = Contract::Serialize;
- self == &Contract::Deserialize
- self == &Contract::Serialize

### Gaps
- // TODO: If we've already added a schema for T with the "opposite" contract, then check
- create_if_missing: bool,
- Entry::Vacant(v) if create_if_missing => v.insert(Value::Object(JsonMap::default())),

### Ouro Bruto (primeiros 5000 chars)
```
/*!
JSON Schema generator and settings.

This module is useful if you want more control over how the schema generated than the [`schema_for!`] macro gives you.
There are two main types in this module:
* [`SchemaSettings`], which defines what JSON Schema features should be used when generating schemas (for example, how `Option`s should be represented).
* [`SchemaGenerator`], which manages the generation of a schema document.
*/

use crate::consts::meta_schemas;
use crate::Schema;
use crate::_alloc_prelude::*;
use crate::{transform::*, JsonSchema};
use alloc::collections::{BTreeMap, BTreeSet};
use core::{any::Any, fmt::Debug};
use dyn_clone::DynClone;
use serde::Serialize;
use serde_json::{Map as JsonMap, Value};

type CowStr = alloc::borrow::Cow<'static, str>;

/// Settings to customize how Schemas are generated.
///
/// The default settings currently conform to [JSON Schema 2020-12](https://json-schema.org/specification-links#2020-12), but this is liable to change in a future version of Schemars if support for other JSON Schema versions is added.
/// If you rely on generated schemas conforming to draft 2020-12, consider using the
/// [`SchemaSettings::draft2020_12()`] method.
#[derive(Debug, Clone)]
#[non_exhaustive]
#[allow(clippy::struct_excessive_bools)]
pub struct SchemaSettings {
    /// This option is now ignored and will be removed before schemars 1.0 becomes stable.
    ///
    /// If you need the `nullable` keyword to be added to schemas for [`Option<T>`], you should use the [`AddNullable`] transform.
    #[deprecated = "This option is now ignored. If you need the `nullable` keyword to be added to schemas for `Option<T>`, you should use the `AddNullable` transform."]
    pub option_nullable: bool,
    /// This option is now ignored and will be removed before schemars 1.0 becomes stable.
    ///
    /// The null type is now always added to schema for [`Option<T>`], but may be removed if using the [`AddNullable`] transform.
    #[deprecated = "This option is now ignored."]
    pub option_add_null_type: bool,
    /// A JSON pointer to the expected location of referenceable subschemas within the resulting
    /// root schema.
    ///
    /// A single leading `#` and/or single trailing `/` are ignored.
    ///
    /// Defaults to `"/$defs"`.
    pub definitions_path: CowStr,
    /// The URI of the meta-schema describing the structure of the generated schemas.
    ///
    /// Defaults to [`meta_schemas::DRAFT2020_12`] (`https://json-schema.org/draft/2020-12/schema`).
    pub meta_schema: Option<CowStr>,
    /// A list of [`Transform`]s that get applied to generated root schemas.
    pub transforms: Vec<Box<dyn GenTransform>>,
    /// Inline all subschemas instead of using references.
    ///
    /// Some references may still be generated in schemas for recursive types.
    ///
    /// Defaults to `false`.
    pub inline_subschemas: bool,
    /// Whether the generated schemas should describe how types are serialized or *de*serialized.
    ///
    /// Defaults to `Contract::Deserialize`.
    pub contract: Contract,
    /// Whether to include an `"x-rust-type"` property in schemas, set to the name of the
    /// schema's associated rust type.
    ///
    /// This uses [`std::any::type_name()`], so shares the caveats of that function. In particular,
    /// the exact output is not guaranteed, and may change between versions of the rust compiler.
    ///
    /// When this is used with `#[derive(JsonSchema)]`, any fields with the
    /// `#[serde(with = "Type")]`/`#[schemars(with = "Type")]` attribute will use name of the type
    /// from the attribute, **not** the type of the actual field. Similarly, any fields with the
    /// `#[schemars(schema_with = "function")]` attribute will not have the `"x-rust-type"`
    /// property added (you can, of course, set the property to whatever you like in the function
    /// implementation).
    ///
    /// Defaults to `false`.
    pub include_type_name: bool,
}

impl Default for SchemaSettings {
    /// The default settings currently conform to [JSON Schema 2020-12](https://json-schema.org/specification-links#2020-12),
    /// but this is liable to change in a future version of Schemars if support for other JSON Schema versions is added.
    /// If you rely on generated schemas conforming to draft 2020-12, consider using [`SchemaSettings::draft2020_12()`] instead.
    fn default() -> SchemaSettings {
        SchemaSettings::draft2020_12()
    }
}

impl SchemaSettings {
    /// Creates `SchemaSettings` that conform to [JSON Schema Draft 7](https://json-schema.org/specification-links#draft-7).
    pub fn draft07() -> SchemaSettings {
        #[allow(deprecated)]
        SchemaSettings {
            option_nullable: false,
            option_add_null_type: true,
            definitions_path: "/definitions".into(),
            meta_schema: Some(meta_schemas::DRAFT07.into()),
            transforms: vec![
                Box::new(ReplaceUnevaluatedProperties),
            
```

---

# CONTRATO - generate.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-1.2.2\src\generate.rs
**SHA:** d1f7fd921de84555
**Timestamp:** 2026-08-28T02:35:17.635052
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- /// Defaults to `Contract::Deserialize`.
- pub contract: Contract,
- contract: Contract::Deserialize,
- contract: Contract::Deserialize,
- contract: Contract::Deserialize,
- contract: Contract::Deserialize,
- self.contract = Contract::Deserialize;
- self.contract = Contract::Serialize;
- self == &Contract::Deserialize
- self == &Contract::Serialize

### Gaps
- // TODO: If we've already added a schema for T with the "opposite" contract, then check
- create_if_missing: bool,
- Entry::Vacant(v) if create_if_missing => v.insert(Value::Object(JsonMap::new())),

### Ouro Bruto (primeiros 5000 chars)
```
/*!
JSON Schema generator and settings.

This module is useful if you want more control over how the schema generated than the [`schema_for!`] macro gives you.
There are two main types in this module:
* [`SchemaSettings`], which defines what JSON Schema features should be used when generating schemas (for example, how `Option`s should be represented).
* [`SchemaGenerator`], which manages the generation of a schema document.
*/

use crate::consts::meta_schemas;
use crate::Schema;
use crate::_alloc_prelude::*;
use crate::{transform::*, JsonSchema};
use alloc::collections::{BTreeMap, BTreeSet};
use core::{any::Any, fmt::Debug};
use dyn_clone::DynClone;
use serde::Serialize;
use serde_json::{Map as JsonMap, Value};

type CowStr = alloc::borrow::Cow<'static, str>;

/// Settings to customize how Schemas are generated.
///
/// The default settings currently conform to [JSON Schema 2020-12](https://json-schema.org/specification-links#2020-12), but this is liable to change in a future version of Schemars if support for other JSON Schema versions is added.
/// If you rely on generated schemas conforming to draft 2020-12, consider using the
/// [`SchemaSettings::draft2020_12()`] method.
#[derive(Debug, Clone)]
#[non_exhaustive]
#[allow(clippy::struct_excessive_bools)]
pub struct SchemaSettings {
    /// A JSON pointer to the expected location of referenceable subschemas within the resulting
    /// root schema.
    ///
    /// A single leading `#` and/or single trailing `/` are ignored.
    ///
    /// Defaults to `"/$defs"`.
    pub definitions_path: CowStr,
    /// The URI of the meta-schema describing the structure of the generated schemas.
    ///
    /// Defaults to [`meta_schemas::DRAFT2020_12`] (`https://json-schema.org/draft/2020-12/schema`).
    pub meta_schema: Option<CowStr>,
    /// A list of [`Transform`]s that get applied to generated root schemas.
    ///
    /// Defaults to an empty vec (no transforms).
    pub transforms: Vec<Box<dyn GenTransform>>,
    /// Inline all subschemas instead of using references.
    ///
    /// Some references may still be generated in schemas for recursive types.
    ///
    /// Defaults to `false`.
    pub inline_subschemas: bool,
    /// Whether the generated schemas should describe how types are serialized or *de*serialized.
    ///
    /// Defaults to `Contract::Deserialize`.
    pub contract: Contract,
    /// Whether to include enum variant names in their schema's `title` when using the [untagged
    /// enum representation](https://serde.rs/enum-representations.html#untagged).
    ///
    /// This setting is respected by `#[derive(JsonSchema)]` on enums, but manual implementations
    /// of `JsonSchema` may ignore this setting.
    ///
    /// Defaults to `false`.
    pub untagged_enum_variant_titles: bool,
}

impl Default for SchemaSettings {
    /// The default settings currently conform to [JSON Schema 2020-12](https://json-schema.org/specification-links#2020-12),
    /// but this is liable to change in a future version of Schemars if support for other JSON Schema versions is added.
    /// If you rely on generated schemas conforming to draft 2020-12, consider using [`SchemaSettings::draft2020_12()`] instead.
    fn default() -> SchemaSettings {
        SchemaSettings::draft2020_12()
    }
}

impl SchemaSettings {
    /// Creates `SchemaSettings` that conform to [JSON Schema Draft 7](https://json-schema.org/specification-links#draft-7).
    #[must_use]
    pub fn draft07() -> SchemaSettings {
        SchemaSettings {
            definitions_path: "/definitions".into(),
            meta_schema: Some(meta_schemas::DRAFT07.into()),
            transforms: vec![
                Box::new(ReplaceUnevaluatedProperties),
                Box::new(RemoveRefSiblings),
                Box::new(ReplacePrefixItems),
            ],
            inline_subschemas: false,
            contract: Contract::Deserialize,
            untagged_enum_variant_titles: false,
        }
    }

    /// Creates `SchemaSettings` that conform to [JSON Schema 2019-09](https://json-schema.org/specification-links#draft-2019-09-(formerly-known-as-draft-8)).
    #[must_use]
    pub fn draft2019_09() -> SchemaSettings {
        SchemaSettings {
            definitions_path: "/$defs".into(),
            meta_schema: Some(meta_schemas::DRAFT2019_09.into()),
            transforms: vec![Box::new(ReplacePrefixItems)],
            inline_subschemas: false,
            contract: Contract::Deserialize,
            untagged_enum_variant_titles: false,
        }
    }

    /// Creates `SchemaSettings` that conform to [JSON Schema 2020-12](https://json-schema.org/specification-links#2020-12).
    #[must_use]
    pub fn draft2020_12() -> SchemaSettings {
        SchemaSettings {
            definitions_path: "/$defs".into(),
            meta_schema: Some(meta_schemas::DRAFT2020_12.into()),
            transforms: Vec::new(),
            inline_subschemas: false,
            contract: Contract::Deserialize,
     
```