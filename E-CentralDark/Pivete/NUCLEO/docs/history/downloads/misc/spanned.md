# OUTRO - spanned.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde_spanned-1.1.1\src\spanned.rs
**SHA:** 63ef6c841a03fd30
**Timestamp:** 2026-08-28T02:35:33.947352
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let mut start: Option<usize> = None;
- start = Some(visitor.next_value()?);

### Ouro Bruto (primeiros 5000 chars)
```
use core::cmp::Ordering;
use core::hash::{Hash, Hasher};

// Currently serde itself doesn't have a spanned type, so we map our `Spanned`
// to a special value in the serde data model. Namely one with these special
// fields/struct names.
//
// In general, supported deserializers should catch this and not literally emit
// these strings but rather emit `Spanned` as they're intended.
#[cfg(feature = "serde")]
pub(crate) const NAME: &str = "$__serde_spanned_private_Spanned";
#[cfg(feature = "serde")]
pub(crate) const START_FIELD: &str = "$__serde_spanned_private_start";
#[cfg(feature = "serde")]
pub(crate) const END_FIELD: &str = "$__serde_spanned_private_end";
#[cfg(feature = "serde")]
pub(crate) const VALUE_FIELD: &str = "$__serde_spanned_private_value";
#[cfg(feature = "serde")]
pub(crate) fn is_spanned(name: &'static str) -> bool {
    name == NAME
}

/// A spanned value, indicating the range at which it is defined in the source.
#[derive(Clone, Debug)]
pub struct Spanned<T> {
    /// Byte range
    span: core::ops::Range<usize>,
    /// The spanned value.
    value: T,
}

impl<T> Spanned<T> {
    /// Create a spanned value encompassing the given byte range.
    ///
    /// # Example
    ///
    /// Transposing a `Spanned<Enum<T>>` into `Enum<Spanned<T>>`:
    ///
    /// ```
    /// use serde::de::{Deserialize, Deserializer};
    /// use serde_untagged::UntaggedEnumVisitor;
    /// use toml::Spanned;
    ///
    /// pub enum Dependency {
    ///     Simple(Spanned<String>),
    ///     Detailed(Spanned<DetailedDependency>),
    /// }
    ///
    /// impl<'de> Deserialize<'de> for Dependency {
    ///     fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    ///     where
    ///         D: Deserializer<'de>,
    ///     {
    ///         enum DependencyKind {
    ///             Simple(String),
    ///             Detailed(DetailedDependency),
    ///         }
    ///
    ///         impl<'de> Deserialize<'de> for DependencyKind {
    ///             fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    ///             where
    ///                 D: Deserializer<'de>,
    ///             {
    ///                 UntaggedEnumVisitor::new()
    ///                     .expecting(
    ///                         "a version string like \"0.9.8\" or a \
    ///                             detailed dependency like { version = \"0.9.8\" }",
    ///                     )
    ///                     .string(|value| Ok(DependencyKind::Simple(value.to_owned())))
    ///                     .map(|value| value.deserialize().map(DependencyKind::Detailed))
    ///                     .deserialize(deserializer)
    ///             }
    ///         }
    ///
    ///         let spanned: Spanned<DependencyKind> = Deserialize::deserialize(deserializer)?;
    ///         let range = spanned.span();
    ///         Ok(match spanned.into_inner() {
    ///             DependencyKind::Simple(simple) => Dependency::Simple(Spanned::new(range, simple)),
    ///             DependencyKind::Detailed(detailed) => Dependency::Detailed(Spanned::new(range, detailed)),
    ///         })
    ///     }
    /// }
    /// #
    /// # type DetailedDependency = std::collections::BTreeMap<String, String>;
    /// ```
    pub fn new(range: core::ops::Range<usize>, value: T) -> Self {
        Self { span: range, value }
    }

    /// Byte range
    pub fn span(&self) -> core::ops::Range<usize> {
        self.span.clone()
    }

    /// Consumes the spanned value and returns the contained value.
    pub fn into_inner(self) -> T {
        self.value
    }

    /// Returns a reference to the contained value.
    pub fn get_ref(&self) -> &T {
        &self.value
    }

    /// Returns a mutable reference to the contained value.
    pub fn get_mut(&mut self) -> &mut T {
        &mut self.value
    }
}

#[cfg(feature = "serde")]
impl<T> Spanned<T> {
    pub(crate) const START_FIELD: &str = START_FIELD;
    pub(crate) const END_FIELD: &str = END_FIELD;
    pub(crate) const VALUE_FIELD: &str = VALUE_FIELD;
}

impl<T: core::fmt::Display> core::fmt::Display for Spanned<T> {
    fn fmt(&self, fmt: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        self.get_ref().fmt(fmt)
    }
}

#[cfg(feature = "alloc")]
#[allow(unused_qualifications)]
impl core::borrow::Borrow<str> for Spanned<alloc::string::String> {
    fn borrow(&self) -> &str {
        self.get_ref()
    }
}

#[cfg(feature = "alloc")]
impl core::borrow::Borrow<str> for Spanned<alloc::borrow::Cow<'_, str>> {
    fn borrow(&self) -> &str {
        self.get_ref()
    }
}

impl<T> AsRef<T> for Spanned<T> {
    fn as_ref(&self) -> &T {
        self.get_ref()
    }
}

impl<T> AsMut<T> for Spanned<T> {
    fn as_mut(&mut self) -> &mut T {
        self.get_mut()
    }
}

impl<T: PartialEq> PartialEq for Spanned<T> {
    fn eq(&self, other: &Self) -> bool {
        self.value.eq(&other.value)
    }
}

impl<T: Eq> Eq for Spanned<T> {}

impl<T: Hash> Hash for Spanned<T> {
 
```