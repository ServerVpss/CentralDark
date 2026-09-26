# OUTRO - schema.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.8.22\src\schema.rs
**SHA:** 1e368bf8110defae
**Timestamp:** 2026-08-28T02:35:09.974346
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pub pattern: Option<String>,

### Ouro Bruto (primeiros 5000 chars)
```
/*!
JSON Schema types.
*/

#[cfg(feature = "impl_json_schema")]
use crate as schemars;
#[cfg(feature = "impl_json_schema")]
use crate::JsonSchema;
use crate::{Map, Set};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::ops::Deref;

/// A JSON Schema.
#[allow(clippy::large_enum_variant)]
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
#[cfg_attr(feature = "impl_json_schema", derive(JsonSchema))]
#[serde(untagged)]
pub enum Schema {
    /// A trivial boolean JSON Schema.
    ///
    /// The schema `true` matches everything (always passes validation), whereas the schema `false`
    /// matches nothing (always fails validation).
    Bool(bool),
    /// A JSON Schema object.
    Object(SchemaObject),
}

impl Schema {
    /// Creates a new `$ref` schema.
    ///
    /// The given reference string should be a URI reference. This will usually be a JSON Pointer
    /// in [URI Fragment representation](https://tools.ietf.org/html/rfc6901#section-6).
    pub fn new_ref(reference: String) -> Self {
        SchemaObject::new_ref(reference).into()
    }

    /// Returns `true` if `self` is a `$ref` schema.
    ///
    /// If `self` is a [`SchemaObject`] with `Some` [`reference`](struct.SchemaObject.html#structfield.reference) set, this returns `true`.
    /// Otherwise, returns `false`.
    pub fn is_ref(&self) -> bool {
        match self {
            Schema::Object(o) => o.is_ref(),
            _ => false,
        }
    }

    /// Converts the given schema (if it is a boolean schema) into an equivalent schema object.
    ///
    /// If the given schema is already a schema object, this has no effect.
    ///
    /// # Example
    /// ```
    /// use schemars::schema::{Schema, SchemaObject};
    ///
    /// let bool_schema = Schema::Bool(true);
    ///
    /// assert_eq!(bool_schema.into_object(), SchemaObject::default());
    /// ```
    pub fn into_object(self) -> SchemaObject {
        match self {
            Schema::Object(o) => o,
            Schema::Bool(true) => SchemaObject::default(),
            Schema::Bool(false) => SchemaObject {
                subschemas: Some(Box::new(SubschemaValidation {
                    not: Some(Schema::Object(Default::default()).into()),
                    ..Default::default()
                })),
                ..Default::default()
            },
        }
    }
}

impl From<SchemaObject> for Schema {
    fn from(o: SchemaObject) -> Self {
        Schema::Object(o)
    }
}

impl From<bool> for Schema {
    fn from(b: bool) -> Self {
        Schema::Bool(b)
    }
}

/// The root object of a JSON Schema document.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Default)]
#[cfg_attr(feature = "impl_json_schema", derive(JsonSchema))]
#[serde(rename_all = "camelCase", default)]
pub struct RootSchema {
    /// The `$schema` keyword.
    ///
    /// See [JSON Schema 8.1.1. The "$schema" Keyword](https://tools.ietf.org/html/draft-handrews-json-schema-02#section-8.1.1).
    #[serde(rename = "$schema", skip_serializing_if = "Option::is_none")]
    pub meta_schema: Option<String>,
    /// The root schema itself.
    #[serde(flatten)]
    pub schema: SchemaObject,
    /// The `definitions` keyword.
    ///
    /// In JSON Schema draft 2019-09 this was replaced by $defs, but in Schemars this is still
    /// serialized as `definitions` for backward-compatibility.
    ///
    /// See [JSON Schema 8.2.5. Schema Re-Use With "$defs"](https://tools.ietf.org/html/draft-handrews-json-schema-02#section-8.2.5),
    /// and [JSON Schema (draft 07) 9. Schema Re-Use With "definitions"](https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-9).
    #[serde(alias = "$defs", skip_serializing_if = "Map::is_empty")]
    pub definitions: Map<String, Schema>,
}

/// A JSON Schema object.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Default)]
#[cfg_attr(feature = "impl_json_schema", derive(JsonSchema))]
#[serde(rename_all = "camelCase", default)]
pub struct SchemaObject {
    /// Properties which annotate the [`SchemaObject`] which typically have no effect when an object is being validated against the schema.
    #[serde(flatten, deserialize_with = "skip_if_default")]
    pub metadata: Option<Box<Metadata>>,
    /// The `type` keyword.
    ///
    /// See [JSON Schema Validation 6.1.1. "type"](https://tools.ietf.org/html/draft-handrews-json-schema-validation-02#section-6.1.1)
    /// and [JSON Schema 4.2.1. Instance Data Model](https://tools.ietf.org/html/draft-handrews-json-schema-02#section-4.2.1).
    #[serde(rename = "type", skip_serializing_if = "Option::is_none")]
    pub instance_type: Option<SingleOrVec<InstanceType>>,
    /// The `format` keyword.
    ///
    /// See [JSON Schema Validation 7. A Vocabulary for Semantic Content With "format"](https://tools.ietf.org/html/draft-handrews-json-schema-validation-02#section-7).
    #[serde(skip_serializing_if = "Option::is_none")]
    pub format: Option<String>,
    /// The `enum` k
```

---

# OUTRO - schema.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.9.0\src\schema.rs
**SHA:** eec2e82ae832c51b
**Timestamp:** 2026-08-28T02:35:13.340992
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const ORDERED_KEYWORDS_START: [&str; 7] = [

### Ouro Bruto (primeiros 5000 chars)
```
/*!
JSON Schema types.
*/

use crate::_alloc_prelude::*;
use ref_cast::{ref_cast_custom, RefCastCustom};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

/// A JSON Schema.
///
/// This wraps a JSON [`Value`] that must be either an [object](Value::Object) or a
/// [bool](Value::Bool).
///
/// A custom JSON schema can be created using the [`json_schema!`](crate::json_schema) macro:
/// ```
/// use schemars::{Schema, json_schema};
///
/// let my_schema: Schema = json_schema!({
///     "type": ["object", "null"]
/// });
/// ```
///
/// Because a `Schema` is a thin wrapper around a `Value`, you can also use
/// [`TryFrom::try_from`]/[`TryInto::try_into`] to create a `Schema` from an existing `Value`.
/// This operation is fallible, because only [objects](Value::Object) and [bools](Value::Bool) can
/// be converted in this way.
///
/// ```
/// use schemars::{Schema, json_schema};
/// use serde_json::json;
///
/// let json_object = json!({"type": ["object", "null"]});
/// let object_schema: Schema = json_object.try_into().unwrap();
///
/// let json_bool = json!(true);
/// let bool_schema: Schema = json_bool.try_into().unwrap();
///
/// let json_string = json!("This is neither an object nor a bool!");
/// assert!(Schema::try_from(json_string).is_err());
///
/// // You can also convert a `&Value`/`&mut Value` to a `&Schema`/`&mut Schema` the same way:
///
/// let json_object = json!({"type": ["object", "null"]});
/// let object_schema_ref: &Schema = (&json_object).try_into().unwrap();
///
/// let mut json_object = json!({"type": ["object", "null"]});
/// let object_schema_mut: &mut Schema = (&mut json_object).try_into().unwrap();
/// ```
///
/// Similarly, you can use [`From`]/[`Into`] to (infallibly) create a `Schema` from an existing
/// [`Map<String, Value>`] or [`bool`].
///
/// ```
/// use schemars::{Schema, json_schema};
/// use serde_json::{Map, json};
///
/// let mut map = Map::new();
/// map.insert("type".to_owned(), json!(["object", "null"]));
/// let object_schema: Schema = map.into();
///
/// let bool_schema: Schema = true.into();
/// ```
#[derive(Debug, Clone, PartialEq, RefCastCustom)]
#[repr(transparent)]
pub struct Schema(Value);

impl<'de> Deserialize<'de> for Schema {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let value = Value::deserialize(deserializer)?;
        Schema::validate(&value)?;
        Ok(Schema(value))
    }
}

impl Serialize for Schema {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        ser::OrderedKeywordWrapper(&self.0).serialize(serializer)
    }
}

impl PartialEq<bool> for Schema {
    fn eq(&self, other: &bool) -> bool {
        self.as_bool() == Some(*other)
    }
}

impl PartialEq<Map<String, Value>> for Schema {
    fn eq(&self, other: &Map<String, Value>) -> bool {
        self.as_object() == Some(other)
    }
}

impl PartialEq<Value> for Schema {
    fn eq(&self, other: &Value) -> bool {
        self.as_value() == other
    }
}

impl PartialEq<Schema> for bool {
    fn eq(&self, other: &Schema) -> bool {
        other == self
    }
}

impl PartialEq<Schema> for Map<String, Value> {
    fn eq(&self, other: &Schema) -> bool {
        other == self
    }
}

impl PartialEq<Schema> for Value {
    fn eq(&self, other: &Schema) -> bool {
        other == self
    }
}

impl Schema {
    /// Creates a new schema object with a single string property `"$ref"`.
    ///
    /// The given reference string should be a URI reference. This will usually be a JSON Pointer
    /// in [URI Fragment representation](https://tools.ietf.org/html/rfc6901#section-6).
    pub fn new_ref(reference: String) -> Self {
        let mut map = Map::new();
        map.insert("$ref".to_owned(), Value::String(reference));
        Self(Value::Object(map))
    }

    /// Borrows the `Schema`'s underlying JSON value.
    pub fn as_value(&self) -> &Value {
        &self.0
    }

    /// If the `Schema`'s underlying JSON value is a bool, returns the bool value.
    pub fn as_bool(&self) -> Option<bool> {
        self.0.as_bool()
    }

    /// If the `Schema`'s underlying JSON value is an object, borrows the object as a `Map` of
    /// properties.
    pub fn as_object(&self) -> Option<&Map<String, Value>> {
        self.0.as_object()
    }

    /// If the `Schema`'s underlying JSON value is an object, mutably borrows the object as a `Map`
    /// of properties.
    pub fn as_object_mut(&mut self) -> Option<&mut Map<String, Value>> {
        self.0.as_object_mut()
    }

    pub(crate) fn try_to_object(self) -> Result<Map<String, Value>, bool> {
        match self.0 {
            Value::Object(m) => Ok(m),
            Value::Bool(b) => Err(b),
            _ => unreachable!(),
        }
    }

    pub(crate) fn try_as_object_mut(&mut self) -> Result<&mut Map<String, Value>, bool> {
        match &mut self.0 {
            Value::Object(m) => Ok(
```

---

# OUTRO - schema.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-1.2.2\src\schema.rs
**SHA:** de2eba15f96a7d71
**Timestamp:** 2026-08-28T02:35:17.651602
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const ORDERED_KEYWORDS_START: [&str; 7] = [

### Ouro Bruto (primeiros 5000 chars)
```
/*!
JSON Schema types.
*/

use crate::_alloc_prelude::*;
use ref_cast::{ref_cast_custom, RefCastCustom};
use serde::{Deserialize, Serialize};
use serde_json::{Map, Value};

/// A JSON Schema.
///
/// This wraps a JSON [`Value`] that must be either an [object](Value::Object) or a
/// [bool](Value::Bool).
///
/// A custom JSON schema can be created using the [`json_schema!`](crate::json_schema) macro:
/// ```
/// use schemars::{Schema, json_schema};
///
/// let my_schema: Schema = json_schema!({
///     "type": ["object", "null"]
/// });
/// ```
///
/// Because a `Schema` is a thin wrapper around a `Value`, you can also use
/// [`TryFrom::try_from`]/[`TryInto::try_into`] to create a `Schema` from an existing `Value`.
/// This operation is fallible, because only [objects](Value::Object) and [bools](Value::Bool) can
/// be converted in this way.
///
/// ```
/// use schemars::{Schema, json_schema};
/// use serde_json::json;
///
/// let json_object = json!({"type": ["object", "null"]});
/// let object_schema: Schema = json_object.try_into().unwrap();
///
/// let json_bool = json!(true);
/// let bool_schema: Schema = json_bool.try_into().unwrap();
///
/// let json_string = json!("This is neither an object nor a bool!");
/// assert!(Schema::try_from(json_string).is_err());
///
/// // You can also convert a `&Value`/`&mut Value` to a `&Schema`/`&mut Schema` the same way:
///
/// let json_object = json!({"type": ["object", "null"]});
/// let object_schema_ref: &Schema = (&json_object).try_into().unwrap();
///
/// let mut json_object = json!({"type": ["object", "null"]});
/// let object_schema_mut: &mut Schema = (&mut json_object).try_into().unwrap();
/// ```
///
/// Similarly, you can use [`From`]/[`Into`] to (infallibly) create a `Schema` from an existing
/// [`Map<String, Value>`] or [`bool`].
///
/// ```
/// use schemars::{Schema, json_schema};
/// use serde_json::{Map, json};
///
/// let mut map = Map::new();
/// map.insert("type".to_owned(), json!(["object", "null"]));
/// let object_schema: Schema = map.into();
///
/// let bool_schema: Schema = true.into();
/// ```
#[derive(Debug, Clone, PartialEq, RefCastCustom)]
#[repr(transparent)]
pub struct Schema(Value);

impl<'de> Deserialize<'de> for Schema {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let value = Value::deserialize(deserializer)?;
        Schema::validate(&value)?;
        Ok(Schema(value))
    }
}

impl Serialize for Schema {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        ser::OrderedKeywordWrapper::from(&self.0).serialize(serializer)
    }
}

impl PartialEq<bool> for Schema {
    fn eq(&self, other: &bool) -> bool {
        self.as_bool() == Some(*other)
    }
}

impl PartialEq<Map<String, Value>> for Schema {
    fn eq(&self, other: &Map<String, Value>) -> bool {
        self.as_object() == Some(other)
    }
}

impl PartialEq<Value> for Schema {
    fn eq(&self, other: &Value) -> bool {
        self.as_value() == other
    }
}

impl PartialEq<Schema> for bool {
    fn eq(&self, other: &Schema) -> bool {
        other == self
    }
}

impl PartialEq<Schema> for Map<String, Value> {
    fn eq(&self, other: &Schema) -> bool {
        other == self
    }
}

impl PartialEq<Schema> for Value {
    fn eq(&self, other: &Schema) -> bool {
        other == self
    }
}

impl Schema {
    /// Creates a new schema object with a single string property `"$ref"`.
    ///
    /// The given reference string should be a URI reference. This will usually be a JSON Pointer
    /// in [URI Fragment representation](https://tools.ietf.org/html/rfc6901#section-6).
    #[must_use]
    pub fn new_ref(reference: String) -> Self {
        let mut map = Map::new();
        map.insert("$ref".to_owned(), Value::String(reference));
        Self(Value::Object(map))
    }

    /// Borrows the `Schema`'s underlying JSON value.
    #[must_use]
    pub fn as_value(&self) -> &Value {
        &self.0
    }

    /// If the `Schema`'s underlying JSON value is a bool, returns the bool value.
    #[must_use]
    pub fn as_bool(&self) -> Option<bool> {
        self.0.as_bool()
    }

    /// If the `Schema`'s underlying JSON value is an object, borrows the object as a `Map` of
    /// properties.
    #[must_use]
    pub fn as_object(&self) -> Option<&Map<String, Value>> {
        self.0.as_object()
    }

    /// If the `Schema`'s underlying JSON value is an object, mutably borrows the object as a `Map`
    /// of properties.
    #[must_use]
    pub fn as_object_mut(&mut self) -> Option<&mut Map<String, Value>> {
        self.0.as_object_mut()
    }

    pub(crate) fn try_to_object(self) -> Result<Map<String, Value>, bool> {
        match self.0 {
            Value::Object(m) => Ok(m),
            Value::Bool(b) => Err(b),
            _ => unreachable!(),
        }
    }

    pub(crate) fn try_as_object_mut(&mut self) -> Result<&mut Map<S
```