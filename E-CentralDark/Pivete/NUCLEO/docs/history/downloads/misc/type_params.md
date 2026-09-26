# OUTRO - type_params.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\darling_core-0.23.0\src\usage\type_params.rs
**SHA:** e009419b102ad568
**Timestamp:** 2026-08-28T02:33:52.800412
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: replace panic with failible function
- // TODO: replace panic with failible function
- // TODO: replace panic with failible function

### Ouro Bruto (primeiros 5000 chars)
```
use syn::punctuated::Punctuated;
use syn::{Ident, Type};

use crate::usage::{IdentRefSet, IdentSet, Options};

/// Searcher for finding type params in a syntax tree.
/// This can be used to determine if a given type parameter needs to be bounded in a generated impl.
pub trait UsesTypeParams {
    /// Returns the subset of the queried type parameters that are used by the implementing syntax element.
    ///
    /// This method only accounts for direct usage by the element; indirect usage via bounds or `where`
    /// predicates are not detected.
    fn uses_type_params<'a>(&self, options: &Options, type_set: &'a IdentSet) -> IdentRefSet<'a>;

    /// Find all type params using `uses_type_params`, then clone the found values and return the set.
    fn uses_type_params_cloned(&self, options: &Options, type_set: &IdentSet) -> IdentSet {
        self.uses_type_params(options, type_set)
            .into_iter()
            .cloned()
            .collect()
    }
}

/// Searcher for finding type params in an iterator.
///
/// This trait extends iterators, providing a way to turn a filtered list of fields or variants into a set
/// of type parameter idents.
pub trait CollectTypeParams {
    /// Consume an iterator, accumulating all type parameters in the elements which occur in `type_set`.
    fn collect_type_params<'a>(self, options: &Options, type_set: &'a IdentSet) -> IdentRefSet<'a>;

    /// Consume an iterator using `collect_type_params`, then clone all found type params and return that set.
    fn collect_type_params_cloned(self, options: &Options, type_set: &IdentSet) -> IdentSet;
}

impl<'i, T, I> CollectTypeParams for T
where
    T: IntoIterator<Item = &'i I>,
    I: 'i + UsesTypeParams,
{
    fn collect_type_params<'a>(self, options: &Options, type_set: &'a IdentSet) -> IdentRefSet<'a> {
        self.into_iter().fold(
            IdentRefSet::with_capacity_and_hasher(type_set.len(), Default::default()),
            |state, value| union_in_place(state, value.uses_type_params(options, type_set)),
        )
    }

    fn collect_type_params_cloned(self, options: &Options, type_set: &IdentSet) -> IdentSet {
        self.collect_type_params(options, type_set)
            .into_iter()
            .cloned()
            .collect()
    }
}

/// Insert the contents of `right` into `left`.
fn union_in_place<'a>(mut left: IdentRefSet<'a>, right: IdentRefSet<'a>) -> IdentRefSet<'a> {
    left.extend(right);

    left
}

impl UsesTypeParams for () {
    fn uses_type_params<'a>(&self, _options: &Options, _type_set: &'a IdentSet) -> IdentRefSet<'a> {
        Default::default()
    }
}

impl<T: UsesTypeParams> UsesTypeParams for Option<T> {
    fn uses_type_params<'a>(&self, options: &Options, type_set: &'a IdentSet) -> IdentRefSet<'a> {
        self.as_ref()
            .map(|v| v.uses_type_params(options, type_set))
            .unwrap_or_default()
    }
}

impl<T: UsesTypeParams> UsesTypeParams for Vec<T> {
    fn uses_type_params<'a>(&self, options: &Options, type_set: &'a IdentSet) -> IdentRefSet<'a> {
        self.collect_type_params(options, type_set)
    }
}

impl<T: UsesTypeParams, U> UsesTypeParams for Punctuated<T, U> {
    fn uses_type_params<'a>(&self, options: &Options, type_set: &'a IdentSet) -> IdentRefSet<'a> {
        self.collect_type_params(options, type_set)
    }
}

uses_type_params!(syn::AngleBracketedGenericArguments, args);
uses_type_params!(syn::AssocType, ty);
uses_type_params!(syn::BareFnArg, ty);
uses_type_params!(syn::Constraint, bounds);
uses_type_params!(syn::DataEnum, variants);
uses_type_params!(syn::DataStruct, fields);
uses_type_params!(syn::DataUnion, fields);
uses_type_params!(syn::Field, ty);
uses_type_params!(syn::FieldsNamed, named);
uses_type_params!(syn::ParenthesizedGenericArguments, inputs, output);
uses_type_params!(syn::PredicateType, bounded_ty, bounds);
uses_type_params!(syn::QSelf, ty);
uses_type_params!(syn::TraitBound, path);
uses_type_params!(syn::TypeArray, elem);
uses_type_params!(syn::TypeBareFn, inputs, output);
uses_type_params!(syn::TypeGroup, elem);
uses_type_params!(syn::TypeImplTrait, bounds);
uses_type_params!(syn::TypeParen, elem);
uses_type_params!(syn::TypePtr, elem);
uses_type_params!(syn::TypeReference, elem);
uses_type_params!(syn::TypeSlice, elem);
uses_type_params!(syn::TypeTuple, elems);
uses_type_params!(syn::TypeTraitObject, bounds);
uses_type_params!(syn::Variant, fields);

impl UsesTypeParams for syn::Data {
    fn uses_type_params<'a>(&self, options: &Options, type_set: &'a IdentSet) -> IdentRefSet<'a> {
        match *self {
            syn::Data::Struct(ref v) => v.uses_type_params(options, type_set),
            syn::Data::Enum(ref v) => v.uses_type_params(options, type_set),
            syn::Data::Union(ref v) => v.uses_type_params(options, type_set),
        }
    }
}

impl UsesTypeParams for syn::Fields {
    fn uses_type_params<'a>(&self, options: &Options, type_set: &'a IdentSet) -> IdentRefSet<'a> {
        self.collect_type_params(optio
```