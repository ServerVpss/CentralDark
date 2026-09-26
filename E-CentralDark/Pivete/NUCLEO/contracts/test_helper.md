# CONTRATO - test_helper.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.9.0\tests\integration\test_helper.rs
**SHA:** 80e3999c282379d0
**Timestamp:** 2026-08-28T02:35:14.555193
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- let de_schema = schema_for::<T>(&settings, Contract::Deserialize);
- let ser_schema = schema_for::<T>(&settings, Contract::Serialize);
- let de_schema = schema_for_value(&settings, Contract::Deserialize, &value);
- let ser_schema = schema_for_value(&settings, Contract::Serialize, &value);
- schema_for::<T2>(&self.settings, Contract::Deserialize)
- schema_for::<T2>(&self.settings, Contract::Serialize)
- assertion(&self.de_schema, Contract::Deserialize);
- assertion(&self.ser_schema, Contract::Serialize);
- fn schema_for<T: JsonSchema>(base_settings: &SchemaSettings, contract: Contract) -> Schema {
- .with(|s| s.contract = contract)

### Ouro Bruto (primeiros 5000 chars)
```
use jsonschema::Validator;
use pretty_assertions::assert_eq;
use schemars::{
    generate::{Contract, SchemaSettings},
    JsonSchema, Schema,
};
use serde::{de::DeserializeOwned, Serialize};
use serde_json::{json, Value};
use snapbox::{data::DataFormat, IntoJson};
use std::{
    any::type_name, borrow::Borrow, cell::OnceCell, f64, marker::PhantomData, path::Path,
    sync::OnceLock,
};

pub struct TestHelper<T: JsonSchema> {
    settings: SchemaSettings,
    name: String,
    phantom: PhantomData<T>,
    de_schema: Schema,
    ser_schema: Schema,
    de_schema_validator: OnceCell<Validator>,
    ser_schema_validator: OnceCell<Validator>,
    validator: fn(&T) -> bool,
}

impl<T: JsonSchema> TestHelper<T> {
    /// Should be used via the `test!(SomeType)` macro
    pub fn new(name: String, settings: SchemaSettings) -> Self {
        let de_schema = schema_for::<T>(&settings, Contract::Deserialize);
        let ser_schema = schema_for::<T>(&settings, Contract::Serialize);
        Self {
            settings,
            name,
            phantom: PhantomData,
            de_schema,
            ser_schema,
            de_schema_validator: OnceCell::new(),
            ser_schema_validator: OnceCell::new(),
            validator: |_| true,
        }
    }

    /// Should be used via the `test!(value: SomeType)` macro
    pub fn new_for_value(name: String, settings: SchemaSettings, value: T) -> Self
    where
        T: Serialize,
    {
        let de_schema = schema_for_value(&settings, Contract::Deserialize, &value);
        let ser_schema = schema_for_value(&settings, Contract::Serialize, &value);
        Self {
            settings,
            name,
            phantom: PhantomData,
            de_schema,
            ser_schema,
            de_schema_validator: OnceCell::new(),
            ser_schema_validator: OnceCell::new(),
            validator: |_| true,
        }
    }

    pub fn with_validator(&mut self, validator: fn(&T) -> bool) -> &mut Self {
        self.validator = validator;
        self
    }

    /// Checks the generated schema against the saved schema in the snapshots directory, for manual verification of changes.
    ///
    /// Run tests with the SNAPSHOTS env var set to "overwrite" to overwrite any changed snapshots.
    pub fn assert_snapshot(&self) -> &Self {
        let common_path = format!("tests/integration/snapshots/{}.json", self.name);
        let de_path = format!("tests/integration/snapshots/{}.de.json", self.name);
        let ser_path = format!("tests/integration/snapshots/{}.ser.json", self.name);

        if self.de_schema == self.ser_schema {
            snapbox::assert_data_eq!(
                (&self.de_schema).into_json(),
                snapbox::Data::read_from(Path::new(&common_path), Some(DataFormat::Json)).raw()
            );
            _ = std::fs::remove_file(de_path);
            _ = std::fs::remove_file(ser_path);
        } else {
            snapbox::assert_data_eq!(
                (&self.de_schema).into_json(),
                snapbox::Data::read_from(Path::new(&de_path), Some(DataFormat::Json)).raw()
            );
            snapbox::assert_data_eq!(
                (&self.ser_schema).into_json(),
                snapbox::Data::read_from(Path::new(&ser_path), Some(DataFormat::Json)).raw()
            );
            _ = std::fs::remove_file(common_path);
        }

        self
    }

    /// Checks that the schema generated for this type is identical to that of another type.
    pub fn assert_identical<T2: JsonSchema>(&self) -> &Self {
        snapbox::assert_data_eq!(
            (&self.de_schema).into_json(),
            schema_for::<T2>(&self.settings, Contract::Deserialize)
                .into_json()
                .raw()
        );
        snapbox::assert_data_eq!(
            (&self.ser_schema).into_json(),
            schema_for::<T2>(&self.settings, Contract::Serialize)
                .into_json()
                .raw()
        );

        let t = type_name::<T>();
        let t2 = type_name::<T2>();
        assert_eq!(
            T::schema_name(),
            T2::schema_name(),
            "`{t}` and `{t2}` have identical schemas, so should have the same schema_name"
        );

        assert_eq!(
            T::schema_id(),
            T2::schema_id(),
            "`{t}` and `{t2}` have identical schemas, so should have the same schema_id"
        );

        assert_eq!(
            T::inline_schema(),
            T2::inline_schema(),
            "`{t}` and `{t2}` have identical schemas, so should have the same inline_schema"
        );

        self
    }

    pub fn custom(&self, assertion: impl Fn(&Schema, Contract)) {
        assertion(&self.de_schema, Contract::Deserialize);
        assertion(&self.ser_schema, Contract::Serialize);
    }

    fn de_schema_validate(&self, instance: &Value) -> bool {
        self.de_schema_validator
            .get_or_init(|| build_validator(&self.de_schema))
            .is_valid(instance)
    }


```

---

# CONTRATO - test_helper.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-1.2.2\tests\integration\test_helper.rs
**SHA:** a5e47474adef6056
**Timestamp:** 2026-08-28T02:35:18.800955
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- let de_schema = schema_for::<T>(&settings, Contract::Deserialize);
- let ser_schema = schema_for::<T>(&settings, Contract::Serialize);
- let de_schema = schema_for_value(&settings, Contract::Deserialize, &value);
- let ser_schema = schema_for_value(&settings, Contract::Serialize, &value);
- schema_for::<T2>(&self.settings, Contract::Deserialize)
- schema_for::<T2>(&self.settings, Contract::Serialize)
- assertion(&self.de_schema, Contract::Deserialize);
- assertion(&self.ser_schema, Contract::Serialize);
- fn schema_for<T: JsonSchema>(base_settings: &SchemaSettings, contract: Contract) -> Schema {
- .with(|s| s.contract = contract)

### Ouro Bruto (primeiros 5000 chars)
```
use jsonschema::Validator;
use pretty_assertions::assert_eq;
use schemars::{
    generate::{Contract, SchemaSettings},
    JsonSchema, Schema,
};
use serde::{de::DeserializeOwned, Serialize};
use serde_json::{json, Value};
use snapbox::{data::DataFormat, IntoJson};
use std::{
    any::type_name, borrow::Borrow, cell::OnceCell, f64, marker::PhantomData, path::Path,
    sync::OnceLock,
};

pub struct TestHelper<T> {
    settings: SchemaSettings,
    name: String,
    phantom: PhantomData<T>,
    de_schema: Schema,
    ser_schema: Schema,
    de_schema_validator: OnceCell<Validator>,
    ser_schema_validator: OnceCell<Validator>,
    validator: fn(&T) -> bool,
}

impl<T> TestHelper<T> {
    /// Should be used via the `test!(SomeType)` macro
    pub fn new(name: String, settings: SchemaSettings) -> Self
    where
        T: JsonSchema,
    {
        let de_schema = schema_for::<T>(&settings, Contract::Deserialize);
        let ser_schema = schema_for::<T>(&settings, Contract::Serialize);
        Self {
            settings,
            name,
            phantom: PhantomData,
            de_schema,
            ser_schema,
            de_schema_validator: OnceCell::new(),
            ser_schema_validator: OnceCell::new(),
            validator: |_| true,
        }
    }

    /// Should be used via the `test!(value: SomeType)` macro
    pub fn new_for_value(name: String, settings: SchemaSettings, value: T) -> Self
    where
        T: Serialize,
    {
        let de_schema = schema_for_value(&settings, Contract::Deserialize, &value);
        let ser_schema = schema_for_value(&settings, Contract::Serialize, &value);
        Self {
            settings,
            name,
            phantom: PhantomData,
            de_schema,
            ser_schema,
            de_schema_validator: OnceCell::new(),
            ser_schema_validator: OnceCell::new(),
            validator: |_| true,
        }
    }

    pub fn with_validator(&mut self, validator: fn(&T) -> bool) -> &mut Self {
        self.validator = validator;
        self
    }

    /// Checks the generated schema against the saved schema in the snapshots directory, for manual verification of changes.
    ///
    /// Run tests with the SNAPSHOTS env var set to "overwrite" to overwrite any changed snapshots.
    pub fn assert_snapshot(&self) -> &Self {
        let common_path = format!("tests/integration/snapshots/{}.json", self.name);
        let de_path = format!("tests/integration/snapshots/{}.de.json", self.name);
        let ser_path = format!("tests/integration/snapshots/{}.ser.json", self.name);

        if self.de_schema == self.ser_schema {
            snapbox::assert_data_eq!(
                (&self.de_schema).into_json(),
                snapbox::Data::read_from(Path::new(&common_path), Some(DataFormat::Json)).raw()
            );
            _ = std::fs::remove_file(de_path);
            _ = std::fs::remove_file(ser_path);
        } else {
            snapbox::assert_data_eq!(
                (&self.de_schema).into_json(),
                snapbox::Data::read_from(Path::new(&de_path), Some(DataFormat::Json)).raw()
            );
            snapbox::assert_data_eq!(
                (&self.ser_schema).into_json(),
                snapbox::Data::read_from(Path::new(&ser_path), Some(DataFormat::Json)).raw()
            );
            _ = std::fs::remove_file(common_path);
        }

        self
    }

    /// Checks that the schema generated for this type is identical to that of another type.
    pub fn assert_identical<T2: JsonSchema>(&self) -> &Self
    where
        T: JsonSchema,
    {
        snapbox::assert_data_eq!(
            (&self.de_schema).into_json(),
            schema_for::<T2>(&self.settings, Contract::Deserialize)
                .into_json()
                .raw()
        );
        snapbox::assert_data_eq!(
            (&self.ser_schema).into_json(),
            schema_for::<T2>(&self.settings, Contract::Serialize)
                .into_json()
                .raw()
        );

        let t = type_name::<T>();
        let t2 = type_name::<T2>();
        assert_eq!(
            T::schema_name(),
            T2::schema_name(),
            "`{t}` and `{t2}` have identical schemas, so should have the same schema_name"
        );

        assert_eq!(
            T::schema_id(),
            T2::schema_id(),
            "`{t}` and `{t2}` have identical schemas, so should have the same schema_id"
        );

        assert_eq!(
            T::inline_schema(),
            T2::inline_schema(),
            "`{t}` and `{t2}` have identical schemas, so should have the same inline_schema"
        );

        self
    }

    pub fn custom(&self, assertion: impl Fn(&Schema, Contract)) -> &Self {
        assertion(&self.de_schema, Contract::Deserialize);
        assertion(&self.ser_schema, Contract::Serialize);

        self
    }

    fn de_schema_validate(&self, instance: &Value) -> bool {
        self.de_schema_validator
            .get_or_init(|| 
```