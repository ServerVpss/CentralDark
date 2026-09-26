# OUTRO - lifetimes.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\darling_core-0.23.0\src\usage\lifetimes.rs
**SHA:** 37522484e4bfc9b7
**Timestamp:** 2026-08-28T02:33:52.745725
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: replace panic with failible function
- // TODO: replace panic with failible function
- // TODO: replace panic with failible function

### Ouro Bruto (primeiros 5000 chars)
```
use std::collections::HashSet;

use syn::punctuated::Punctuated;
use syn::{Lifetime, Type};

use crate::usage::Options;

/// A set of lifetimes.
pub type LifetimeSet = HashSet<Lifetime>;

/// A set of references to lifetimes.
pub type LifetimeRefSet<'a> = HashSet<&'a Lifetime>;

/// Searcher for finding lifetimes in a syntax tree.
/// This can be used to determine which lifetimes must be emitted in generated code.
pub trait UsesLifetimes {
    /// Returns the subset of the queried lifetimes that are used by the implementing syntax element.
    ///
    /// This method only accounts for direct usage by the element; indirect usage via bounds or `where`
    /// predicates are not detected.
    fn uses_lifetimes<'a>(
        &self,
        options: &Options,
        lifetimes: &'a LifetimeSet,
    ) -> LifetimeRefSet<'a>;

    /// Find all used lifetimes, then clone them and return that set.
    fn uses_lifetimes_cloned(&self, options: &Options, lifetimes: &LifetimeSet) -> LifetimeSet {
        self.uses_lifetimes(options, lifetimes)
            .into_iter()
            .cloned()
            .collect()
    }
}

/// Searcher for finding lifetimes in an iterator.
///
/// This trait extends iterators, providing a way to turn a filtered list of fields or variants into a set
/// of lifetimes.
pub trait CollectLifetimes {
    /// Consume an iterator, accumulating all lifetimes in the elements which occur in `lifetimes`.
    fn collect_lifetimes<'a>(
        self,
        options: &Options,
        lifetimes: &'a LifetimeSet,
    ) -> LifetimeRefSet<'a>;

    /// Consume an iterator using `collect_lifetimes`, then clone all found lifetimes and return that set.
    fn collect_lifetimes_cloned(self, options: &Options, lifetimes: &LifetimeSet) -> LifetimeSet;
}

impl<'i, I, T> CollectLifetimes for T
where
    T: IntoIterator<Item = &'i I>,
    I: 'i + UsesLifetimes,
{
    fn collect_lifetimes<'a>(
        self,
        options: &Options,
        lifetimes: &'a LifetimeSet,
    ) -> LifetimeRefSet<'a> {
        self.into_iter()
            .fold(Default::default(), |mut state, value| {
                state.extend(value.uses_lifetimes(options, lifetimes));
                state
            })
    }

    fn collect_lifetimes_cloned(self, options: &Options, lifetimes: &LifetimeSet) -> LifetimeSet {
        self.collect_lifetimes(options, lifetimes)
            .into_iter()
            .cloned()
            .collect()
    }
}

impl<T: UsesLifetimes> UsesLifetimes for Vec<T> {
    fn uses_lifetimes<'a>(
        &self,
        options: &Options,
        lifetimes: &'a LifetimeSet,
    ) -> LifetimeRefSet<'a> {
        self.collect_lifetimes(options, lifetimes)
    }
}

impl<T: UsesLifetimes, U> UsesLifetimes for Punctuated<T, U> {
    fn uses_lifetimes<'a>(
        &self,
        options: &Options,
        lifetimes: &'a LifetimeSet,
    ) -> LifetimeRefSet<'a> {
        self.collect_lifetimes(options, lifetimes)
    }
}

impl<T: UsesLifetimes> UsesLifetimes for Option<T> {
    fn uses_lifetimes<'a>(
        &self,
        options: &Options,
        lifetimes: &'a LifetimeSet,
    ) -> LifetimeRefSet<'a> {
        self.as_ref()
            .map(|v| v.uses_lifetimes(options, lifetimes))
            .unwrap_or_default()
    }
}

impl UsesLifetimes for Lifetime {
    fn uses_lifetimes<'a>(&self, _: &Options, lifetimes: &'a LifetimeSet) -> LifetimeRefSet<'a> {
        lifetimes.iter().filter(|lt| *lt == self).collect()
    }
}

uses_lifetimes!(syn::AngleBracketedGenericArguments, args);
uses_lifetimes!(syn::AssocType, ty);
uses_lifetimes!(syn::BareFnArg, ty);
uses_lifetimes!(syn::BoundLifetimes, lifetimes);
uses_lifetimes!(syn::ConstParam, ty);
uses_lifetimes!(syn::Constraint, bounds);
uses_lifetimes!(syn::DataEnum, variants);
uses_lifetimes!(syn::DataStruct, fields);
uses_lifetimes!(syn::DataUnion, fields);
uses_lifetimes!(syn::Field, ty);
uses_lifetimes!(syn::FieldsNamed, named);
uses_lifetimes!(syn::LifetimeParam, lifetime, bounds);
uses_lifetimes!(syn::ParenthesizedGenericArguments, inputs, output);
uses_lifetimes!(syn::Path, segments);
uses_lifetimes!(syn::PathSegment, arguments);
uses_lifetimes!(syn::PredicateLifetime, lifetime, bounds);
uses_lifetimes!(syn::PredicateType, lifetimes, bounded_ty, bounds);
uses_lifetimes!(syn::QSelf, ty);
uses_lifetimes!(syn::TraitBound, path, lifetimes);
uses_lifetimes!(syn::TypeArray, elem);
uses_lifetimes!(syn::TypeBareFn, inputs, output);
uses_lifetimes!(syn::TypeGroup, elem);
uses_lifetimes!(syn::TypeImplTrait, bounds);
uses_lifetimes!(syn::TypeParam, bounds);
uses_lifetimes!(syn::TypeParen, elem);
uses_lifetimes!(syn::TypePtr, elem);
uses_lifetimes!(syn::TypeReference, lifetime, elem);
uses_lifetimes!(syn::TypeSlice, elem);
uses_lifetimes!(syn::TypeTuple, elems);
uses_lifetimes!(syn::TypeTraitObject, bounds);
uses_lifetimes!(syn::Variant, fields);

impl UsesLifetimes for syn::Data {
    fn uses_lifetimes<'a>(
        &self,
        options: &Options,
        lifetimes: &'a LifetimeSet,
  
```