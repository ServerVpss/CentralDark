# COMANDO - impls.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde-1.0.229\src\core\de\impls.rs
**SHA:** 2f8e2ef9d343875b
**Timestamp:** 2026-08-28T02:35:27.403774
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- //         start: Idx,
- let start: Idx = match tri!(seq.next_element()) {
- let mut start: Option<Idx> = None;
- Field::Start => {
- start = Some(tri!(map.next_value()));
- let start = match start {
- //         start: Idx,
- let start = tri!(deserializer.deserialize_struct(
- let start: Idx = match tri!(seq.next_element()) {
- let mut start: Option<Idx> = None;

### Ouro Bruto (primeiros 5000 chars)
```
use crate::lib::*;

use crate::de::{
    Deserialize, Deserializer, EnumAccess, Error, MapAccess, SeqAccess, Unexpected, VariantAccess,
    Visitor,
};
use crate::private::{self, InPlaceSeed};

#[cfg(any(feature = "std", feature = "alloc"))]
use crate::private::size_hint;

////////////////////////////////////////////////////////////////////////////////

struct UnitVisitor;

impl<'de> Visitor<'de> for UnitVisitor {
    type Value = ();

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("unit")
    }

    fn visit_unit<E>(self) -> Result<Self::Value, E>
    where
        E: Error,
    {
        Ok(())
    }
}

impl<'de> Deserialize<'de> for () {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_unit(UnitVisitor)
    }
}

#[cfg(feature = "unstable")]
#[cfg_attr(docsrs, doc(cfg(feature = "unstable")))]
impl<'de> Deserialize<'de> for ! {
    fn deserialize<D>(_deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        Err(Error::custom("cannot deserialize `!`"))
    }
}

////////////////////////////////////////////////////////////////////////////////

struct BoolVisitor;

impl<'de> Visitor<'de> for BoolVisitor {
    type Value = bool;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        formatter.write_str("a boolean")
    }

    fn visit_bool<E>(self, v: bool) -> Result<Self::Value, E>
    where
        E: Error,
    {
        Ok(v)
    }
}

impl<'de> Deserialize<'de> for bool {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        deserializer.deserialize_bool(BoolVisitor)
    }
}

////////////////////////////////////////////////////////////////////////////////

macro_rules! impl_deserialize_num {
    ($primitive:ident, $nonzero:ident, $deserialize:ident $($method:ident!($($val:ident : $visit:ident)*);)*) => {
        impl_deserialize_num!($primitive, $deserialize $($method!($($val : $visit)*);)*);

        impl<'de> Deserialize<'de> for num::$nonzero {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: Deserializer<'de>,
            {
                struct NonZeroVisitor;

                impl<'de> Visitor<'de> for NonZeroVisitor {
                    type Value = num::$nonzero;

                    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                        formatter.write_str(concat!("a nonzero ", stringify!($primitive)))
                    }

                    $($($method!(nonzero $primitive $val : $visit);)*)*
                }

                deserializer.$deserialize(NonZeroVisitor)
            }
        }

        #[cfg(not(no_core_num_saturating))]
        impl<'de> Deserialize<'de> for Saturating<$primitive> {
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: Deserializer<'de>,
            {
                struct SaturatingVisitor;

                impl<'de> Visitor<'de> for SaturatingVisitor {
                    type Value = Saturating<$primitive>;

                    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                        formatter.write_str("integer with support for saturating semantics")
                    }

                    $($($method!(saturating $primitive $val : $visit);)*)*
                }

                deserializer.$deserialize(SaturatingVisitor)
            }
        }
    };

    ($primitive:ident, $deserialize:ident $($method:ident!($($val:ident : $visit:ident)*);)*) => {
        impl<'de> Deserialize<'de> for $primitive {
            #[inline]
            fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
            where
                D: Deserializer<'de>,
            {
                struct PrimitiveVisitor;

                impl<'de> Visitor<'de> for PrimitiveVisitor {
                    type Value = $primitive;

                    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                        formatter.write_str(stringify!($primitive))
                    }

                    $($($method!($val : $visit);)*)*
                }

                deserializer.$deserialize(PrimitiveVisitor)
            }
        }
    };
}

macro_rules! num_self {
    ($ty:ident : $visit:ident) => {
        #[inline]
        fn $visit<E>(self, v: $ty) -> Result<Self::Value, E>
        where
            E: Error,
        {
            Ok(v)
        }
    };

    (nonzero $primitive:ident $ty:ident : $visit:ident) => {
        fn $visit<E>(self, v: $ty) -> Result<Self::Value, E>
        where
            E: Error,
        {
            if let Some(nonzero) = Self::Value::new(v) {
                Ok(nonzero)
            } else {
                Err(Error::invalid_value(Unexpected::Unsi
```