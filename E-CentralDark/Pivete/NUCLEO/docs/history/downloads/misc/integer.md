# OUTRO - integer.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\typebox@1.1.38@@@1\build\type\types\integer.mjs
**SHA:** daaf787eb0ac9fc0
**Timestamp:** 2026-08-28T02:25:56.525921
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- export const IntegerPattern = '-?(?:0|[1-9][0-9]*)';

### Ouro Bruto (primeiros 5000 chars)
```
// deno-fmt-ignore-file
import { Memory } from '../../system/memory/index.mjs';
import { IsKind } from './schema.mjs';
// ------------------------------------------------------------------
// Pattern
// ------------------------------------------------------------------
export const IntegerPattern = '-?(?:0|[1-9][0-9]*)';
// ------------------------------------------------------------------
// Factory
// ------------------------------------------------------------------
/** Creates a Integer type. */
export function Integer(options) {
    return Memory.Create({ '~kind': 'Integer' }, { type: 'integer' }, options);
}
// ------------------------------------------------------------------
// Guard
// ------------------------------------------------------------------
/** Returns true if the given value is TInteger. */
export function IsInteger(value) {
    return IsKind(value, 'Integer');
}

```

---

# OUTRO - integer.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\plist-1.10.0\src\integer.rs
**SHA:** 9d93dc1a25cb3d96
**Timestamp:** 2026-08-28T02:34:57.920296
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Use IntErrorKind once stable and retry parsing on overflow only.

### Ouro Bruto (primeiros 5000 chars)
```
use std::{fmt, num::ParseIntError};

/// An integer that can be represented by either an `i64` or a `u64`.
#[derive(Clone, Copy, Eq, Hash, Ord, PartialEq, PartialOrd)]
pub struct Integer {
    value: i128,
}

impl Integer {
    /// Returns the value as an `i64` if it can be represented by that type.
    pub fn as_signed(self) -> Option<i64> {
        i64::try_from(self.value).ok()
    }

    /// Returns the value as a `u64` if it can be represented by that type.
    pub fn as_unsigned(self) -> Option<u64> {
        u64::try_from(self.value).ok()
    }

    pub(crate) fn from_str(s: &str) -> Result<Self, ParseIntError> {
        if s.starts_with("0x") {
            // NetBSD dialect adds the `0x` numeric objects,
            // which are always unsigned.
            // See the `PROP_NUMBER(3)` man page
            let s = s.trim_start_matches("0x");
            u64::from_str_radix(s, 16).map(Into::into)
        } else {
            // Match Apple's implementation in CFPropertyList.h - always try to parse as an i64 first.
            // TODO: Use IntErrorKind once stable and retry parsing on overflow only.
            Ok(match s.parse::<i64>() {
                Ok(v) => v.into(),
                Err(_) => s.parse::<u64>()?.into(),
            })
        }
    }
}

impl fmt::Debug for Integer {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        self.value.fmt(f)
    }
}

impl fmt::Display for Integer {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        self.value.fmt(f)
    }
}

impl From<i64> for Integer {
    fn from(value: i64) -> Integer {
        Integer {
            value: value.into(),
        }
    }
}

impl From<i32> for Integer {
    fn from(value: i32) -> Integer {
        Integer {
            value: value.into(),
        }
    }
}

impl From<i16> for Integer {
    fn from(value: i16) -> Integer {
        Integer {
            value: value.into(),
        }
    }
}

impl From<i8> for Integer {
    fn from(value: i8) -> Integer {
        Integer {
            value: value.into(),
        }
    }
}

impl From<u64> for Integer {
    fn from(value: u64) -> Integer {
        Integer {
            value: value.into(),
        }
    }
}

impl From<u32> for Integer {
    fn from(value: u32) -> Integer {
        Integer {
            value: value.into(),
        }
    }
}

impl From<u16> for Integer {
    fn from(value: u16) -> Integer {
        Integer {
            value: value.into(),
        }
    }
}

impl From<u8> for Integer {
    fn from(value: u8) -> Integer {
        Integer {
            value: value.into(),
        }
    }
}

#[cfg(feature = "serde")]
pub mod serde_impls {
    use serde::{
        de::{Deserialize, Deserializer, Error, Visitor},
        ser::{Serialize, Serializer},
    };
    use std::fmt;

    use crate::Integer;

    impl Serialize for Integer {
        fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
        where
            S: Serializer,
        {
            if let Some(v) = self.as_unsigned() {
                serializer.serialize_u64(v)
            } else if let Some(v) = self.as_signed() {
                serializer.serialize_i64(v)
            } else {
                unreachable!();
            }
        }
    }

    struct IntegerVisitor;

    impl Visitor<'_> for IntegerVisitor {
        type Value = Integer;

        fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
            formatter.write_str("a plist integer")
        }

        fn visit_i64<E>(self, v: i64) -> Result<Self::Value, E>
        where
            E: Error,
        {
            Ok(Integer::from(v))
        }

        fn visit_u64<E>(self, v: u64) -> Result<Self::Value, E>
        where
            E: Error,
        {
            Ok(Integer::from(v))
        }
    }

    impl<'de> Deserialize<'de> for Integer {
        fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where
            D: Deserializer<'de>,
        {
            deserializer.deserialize_any(IntegerVisitor)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::Integer;

    #[test]
    fn from_str_limits() {
        assert_eq!(Integer::from_str("-1"), Ok((-1).into()));
        assert_eq!(Integer::from_str("0"), Ok(0.into()));
        assert_eq!(Integer::from_str("1"), Ok(1.into()));
        assert_eq!(
            Integer::from_str("-9223372036854775808"),
            Ok((-9223372036854775808i64).into())
        );
        assert!(Integer::from_str("-9223372036854775809").is_err());
        assert_eq!(
            Integer::from_str("18446744073709551615"),
            Ok(18446744073709551615u64.into())
        );
        assert!(Integer::from_str("18446744073709551616").is_err());
    }
}

```