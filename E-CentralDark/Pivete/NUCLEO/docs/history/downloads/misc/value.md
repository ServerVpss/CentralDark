# OUTRO - value.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\toml-0.9.12+spec-1.1.0\src\value.rs
**SHA:** fce12d46485c895b
**Timestamp:** 2026-08-28T02:36:24.429601
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- "", // TODO: this should be the variant name

### Ouro Bruto (primeiros 5000 chars)
```
//! Definition of a TOML [value][Value]

use alloc::collections::BTreeMap;
use alloc::vec;
use core::fmt;
use core::hash::Hash;
use core::mem::discriminant;
use core::ops;
#[cfg(feature = "std")]
use std::collections::HashMap;

use serde_core::de;
use serde_core::de::IntoDeserializer;
use serde_core::ser;

use crate::alloc_prelude::*;

pub use toml_datetime::{Date, Datetime, DatetimeParseError, Offset, Time};

/// Type representing a TOML array, payload of the `Value::Array` variant
pub type Array = Vec<Value>;

#[doc(no_inline)]
pub use crate::Table;

/// Representation of a TOML value.
#[derive(PartialEq, Clone, Debug)]
pub enum Value {
    /// Represents a TOML string
    String(String),
    /// Represents a TOML integer
    Integer(i64),
    /// Represents a TOML float
    Float(f64),
    /// Represents a TOML boolean
    Boolean(bool),
    /// Represents a TOML datetime
    Datetime(Datetime),
    /// Represents a TOML array
    Array(Array),
    /// Represents a TOML table
    Table(Table),
}

impl Value {
    /// Convert a `T` into `toml::Value` which is an enum that can represent
    /// any valid TOML data.
    ///
    /// This conversion can fail if `T`'s implementation of `Serialize` decides to
    /// fail, or if `T` contains a map with non-string keys.
    pub fn try_from<T>(value: T) -> Result<Self, crate::ser::Error>
    where
        T: ser::Serialize,
    {
        value.serialize(ValueSerializer)
    }

    /// Interpret a `toml::Value` as an instance of type `T`.
    ///
    /// This conversion can fail if the structure of the `Value` does not match the
    /// structure expected by `T`, for example if `T` is a struct type but the
    /// `Value` contains something other than a TOML table. It can also fail if the
    /// structure is correct but `T`'s implementation of `Deserialize` decides that
    /// something is wrong with the data, for example required struct fields are
    /// missing from the TOML map or some number is too big to fit in the expected
    /// primitive type.
    pub fn try_into<'de, T>(self) -> Result<T, crate::de::Error>
    where
        T: de::Deserialize<'de>,
    {
        de::Deserialize::deserialize(self)
    }

    /// Index into a TOML array or map. A string index can be used to access a
    /// value in a map, and a usize index can be used to access an element of an
    /// array.
    ///
    /// Returns `None` if the type of `self` does not match the type of the
    /// index, for example if the index is a string and `self` is an array or a
    /// number. Also returns `None` if the given key does not exist in the map
    /// or the given index is not within the bounds of the array.
    pub fn get<I: Index>(&self, index: I) -> Option<&Self> {
        index.index(self)
    }

    /// Mutably index into a TOML array or map. A string index can be used to
    /// access a value in a map, and a usize index can be used to access an
    /// element of an array.
    ///
    /// Returns `None` if the type of `self` does not match the type of the
    /// index, for example if the index is a string and `self` is an array or a
    /// number. Also returns `None` if the given key does not exist in the map
    /// or the given index is not within the bounds of the array.
    pub fn get_mut<I: Index>(&mut self, index: I) -> Option<&mut Self> {
        index.index_mut(self)
    }

    /// Extracts the integer value if it is an integer.
    pub fn as_integer(&self) -> Option<i64> {
        match *self {
            Self::Integer(i) => Some(i),
            _ => None,
        }
    }

    /// Tests whether this value is an integer.
    pub fn is_integer(&self) -> bool {
        self.as_integer().is_some()
    }

    /// Extracts the float value if it is a float.
    pub fn as_float(&self) -> Option<f64> {
        match *self {
            Self::Float(f) => Some(f),
            _ => None,
        }
    }

    /// Tests whether this value is a float.
    pub fn is_float(&self) -> bool {
        self.as_float().is_some()
    }

    /// Extracts the boolean value if it is a boolean.
    pub fn as_bool(&self) -> Option<bool> {
        match *self {
            Self::Boolean(b) => Some(b),
            _ => None,
        }
    }

    /// Tests whether this value is a boolean.
    pub fn is_bool(&self) -> bool {
        self.as_bool().is_some()
    }

    /// Extracts the string of this value if it is a string.
    pub fn as_str(&self) -> Option<&str> {
        match *self {
            Self::String(ref s) => Some(&**s),
            _ => None,
        }
    }

    /// Tests if this value is a string.
    pub fn is_str(&self) -> bool {
        self.as_str().is_some()
    }

    /// Extracts the datetime value if it is a datetime.
    ///
    /// Note that a parsed TOML value will only contain ISO 8601 dates. An
    /// example date is:
    ///
    /// ```notrust
    /// 1979-05-27T07:32:00Z
    /// ```
    pub fn as_datetime(&self) -> Option<&Datetime> {
        match *self {
       
```

---

# OUTRO - value.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\toml-1.1.4+spec-1.1.0\src\value.rs
**SHA:** d303e9b106211a3f
**Timestamp:** 2026-08-28T02:36:25.391099
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- "", // TODO: this should be the variant name

### Ouro Bruto (primeiros 5000 chars)
```
//! Definition of a TOML [value][Value]

use alloc::collections::BTreeMap;
use alloc::vec;
use core::fmt;
use core::hash::Hash;
use core::mem::discriminant;
use core::ops;
#[cfg(feature = "std")]
use std::collections::HashMap;

use serde_core::de;
use serde_core::de::IntoDeserializer;
use serde_core::ser;

use crate::alloc_prelude::*;

pub use toml_datetime::{Date, Datetime, DatetimeParseError, Offset, Time};

/// Type representing a TOML array, payload of the `Value::Array` variant
pub type Array = Vec<Value>;

#[doc(no_inline)]
pub use crate::Table;

/// Representation of a TOML value.
#[derive(PartialEq, Clone, Debug)]
pub enum Value {
    /// Represents a TOML string
    String(String),
    /// Represents a TOML integer
    Integer(i64),
    /// Represents a TOML float
    Float(f64),
    /// Represents a TOML boolean
    Boolean(bool),
    /// Represents a TOML datetime
    Datetime(Datetime),
    /// Represents a TOML array
    Array(Array),
    /// Represents a TOML table
    Table(Table),
}

impl Value {
    /// Convert a `T` into `toml::Value` which is an enum that can represent
    /// any valid TOML data.
    ///
    /// This conversion can fail if `T`'s implementation of `Serialize` decides to
    /// fail, or if `T` contains a map with non-string keys.
    pub fn try_from<T>(value: T) -> Result<Self, crate::ser::Error>
    where
        T: ser::Serialize,
    {
        value.serialize(ValueSerializer)
    }

    /// Interpret a `toml::Value` as an instance of type `T`.
    ///
    /// This conversion can fail if the structure of the `Value` does not match the
    /// structure expected by `T`, for example if `T` is a struct type but the
    /// `Value` contains something other than a TOML table. It can also fail if the
    /// structure is correct but `T`'s implementation of `Deserialize` decides that
    /// something is wrong with the data, for example required struct fields are
    /// missing from the TOML map or some number is too big to fit in the expected
    /// primitive type.
    pub fn try_into<'de, T>(self) -> Result<T, crate::de::Error>
    where
        T: de::Deserialize<'de>,
    {
        de::Deserialize::deserialize(self)
    }

    /// Index into a TOML array or map. A string index can be used to access a
    /// value in a map, and a usize index can be used to access an element of an
    /// array.
    ///
    /// Returns `None` if the type of `self` does not match the type of the
    /// index, for example if the index is a string and `self` is an array or a
    /// number. Also returns `None` if the given key does not exist in the map
    /// or the given index is not within the bounds of the array.
    pub fn get<I: Index>(&self, index: I) -> Option<&Self> {
        index.index(self)
    }

    /// Mutably index into a TOML array or map. A string index can be used to
    /// access a value in a map, and a usize index can be used to access an
    /// element of an array.
    ///
    /// Returns `None` if the type of `self` does not match the type of the
    /// index, for example if the index is a string and `self` is an array or a
    /// number. Also returns `None` if the given key does not exist in the map
    /// or the given index is not within the bounds of the array.
    pub fn get_mut<I: Index>(&mut self, index: I) -> Option<&mut Self> {
        index.index_mut(self)
    }

    /// Extracts the integer value if it is an integer.
    pub fn as_integer(&self) -> Option<i64> {
        match *self {
            Self::Integer(i) => Some(i),
            _ => None,
        }
    }

    /// Tests whether this value is an integer.
    pub fn is_integer(&self) -> bool {
        self.as_integer().is_some()
    }

    /// Extracts the float value if it is a float.
    pub fn as_float(&self) -> Option<f64> {
        match *self {
            Self::Float(f) => Some(f),
            _ => None,
        }
    }

    /// Tests whether this value is a float.
    pub fn is_float(&self) -> bool {
        self.as_float().is_some()
    }

    /// Extracts the boolean value if it is a boolean.
    pub fn as_bool(&self) -> Option<bool> {
        match *self {
            Self::Boolean(b) => Some(b),
            _ => None,
        }
    }

    /// Tests whether this value is a boolean.
    pub fn is_bool(&self) -> bool {
        self.as_bool().is_some()
    }

    /// Extracts the string of this value if it is a string.
    pub fn as_str(&self) -> Option<&str> {
        match *self {
            Self::String(ref s) => Some(&**s),
            _ => None,
        }
    }

    /// Tests if this value is a string.
    pub fn is_str(&self) -> bool {
        self.as_str().is_some()
    }

    /// Extracts the datetime value if it is a datetime.
    ///
    /// Note that a parsed TOML value will only contain ISO 8601 dates. An
    /// example date is:
    ///
    /// ```notrust
    /// 1979-05-27T07:32:00Z
    /// ```
    pub fn as_datetime(&self) -> Option<&Datetime> {
        match *self {
       
```