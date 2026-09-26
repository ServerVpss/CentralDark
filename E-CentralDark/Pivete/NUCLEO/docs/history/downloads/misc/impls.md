# OUTRO - impls.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde_with-3.21.0\src\de\impls.rs
**SHA:** 25a405638a60f64d
**Timestamp:** 2026-08-28T02:35:34.434929
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: start.into_inner(),
- start: start.into_inner(),

### Ouro Bruto (primeiros 5000 chars)
```
pub(crate) use self::macros::*;
use crate::{formats::*, prelude::*};
#[cfg(feature = "hashbrown_0_14")]
use hashbrown_0_14::{HashMap as HashbrownMap014, HashSet as HashbrownSet014};
#[cfg(feature = "hashbrown_0_15")]
use hashbrown_0_15::{HashMap as HashbrownMap015, HashSet as HashbrownSet015};
#[cfg(feature = "hashbrown_0_16")]
use hashbrown_0_16::{HashMap as HashbrownMap016, HashSet as HashbrownSet016};
#[cfg(feature = "hashbrown_0_17")]
use hashbrown_0_17::{HashMap as HashbrownMap017, HashSet as HashbrownSet017};
#[cfg(feature = "indexmap_1")]
use indexmap_1::{IndexMap, IndexSet};
#[cfg(feature = "indexmap_2")]
use indexmap_2::{IndexMap as IndexMap2, IndexSet as IndexSet2};
#[cfg(feature = "smallvec_1")]
use smallvec_1::SmallVec;

///////////////////////////////////////////////////////////////////////////////
// Helper macro used internally

#[cfg(feature = "alloc")]
type BoxedSlice<T> = Box<[T]>;

pub(crate) mod macros {
    // The unused_imports lint has false-positives around macros
    // https://github.com/rust-lang/rust/issues/78894
    #![allow(unused_imports)]

    macro_rules! foreach_map {
        ($m:ident) => {
            #[cfg(feature = "alloc")]
            $m!(BTreeMap<K: Ord, V>, (|_size| BTreeMap::new()));
            #[cfg(feature = "std")]
            $m!(
                HashMap<K: Eq + Hash, V, S: BuildHasher + Default>,
                (|size| HashMap::with_capacity_and_hasher(crate::utils::size_hint_cautious::<(K,V)>(Some(size)), Default::default()))
            );
            #[cfg(feature = "hashbrown_0_14")]
            $m!(
                HashbrownMap014<K: Eq + Hash, V, S: BuildHasher + Default>,
                (|size| HashbrownMap014::with_capacity_and_hasher(crate::utils::size_hint_cautious::<(K,V)>(Some(size)), Default::default()))
            );
            #[cfg(feature = "hashbrown_0_15")]
            $m!(
                HashbrownMap015<K: Eq + Hash, V, S: BuildHasher + Default>,
                (|size| HashbrownMap015::with_capacity_and_hasher(crate::utils::size_hint_cautious::<(K,V)>(Some(size)), Default::default()))
            );
            #[cfg(feature = "hashbrown_0_16")]
            $m!(
                HashbrownMap016<K: Eq + Hash, V, S: BuildHasher + Default>,
                (|size| HashbrownMap016::with_capacity_and_hasher(crate::utils::size_hint_cautious::<(K,V)>(Some(size)), Default::default()))
            );
            #[cfg(feature = "hashbrown_0_17")]
            $m!(
                HashbrownMap017<K: Eq + Hash, V, S: BuildHasher + Default>,
                (|size| HashbrownMap017::with_capacity_and_hasher(crate::utils::size_hint_cautious::<(K,V)>(Some(size)), Default::default()))
            );
            #[cfg(feature = "indexmap_1")]
            $m!(
                IndexMap<K: Eq + Hash, V, S: BuildHasher + Default>,
                (|size| IndexMap::with_capacity_and_hasher(crate::utils::size_hint_cautious::<(K,V)>(Some(size)), Default::default()))
            );
            #[cfg(feature = "indexmap_2")]
            $m!(
                IndexMap2<K: Eq + Hash, V, S: BuildHasher + Default>,
                (|size| IndexMap2::with_capacity_and_hasher(crate::utils::size_hint_cautious::<(K,V)>(Some(size)), Default::default()))
            );
        };
    }

    macro_rules! foreach_set {
        ($m:ident) => {
            #[cfg(feature = "alloc")]
            $m!(BTreeSet<T: Ord>, (|_| BTreeSet::new()), insert);
            #[cfg(feature = "std")]
            $m!(
                HashSet<T: Eq + Hash, S: BuildHasher + Default>,
                (|size| HashSet::with_capacity_and_hasher(crate::utils::size_hint_cautious::<T>(Some(size)), S::default())),
                insert
            );
            #[cfg(feature = "hashbrown_0_14")]
            $m!(
                HashbrownSet014<T: Eq + Hash, S: BuildHasher + Default>,
                (|size| HashbrownSet014::with_capacity_and_hasher(crate::utils::size_hint_cautious::<T>(Some(size)), S::default())),
                insert
            );
            #[cfg(feature = "hashbrown_0_15")]
            $m!(
                HashbrownSet015<T: Eq + Hash, S: BuildHasher + Default>,
                (|size| HashbrownSet015::with_capacity_and_hasher(crate::utils::size_hint_cautious::<T>(Some(size)), S::default())),
                insert
            );
            #[cfg(feature = "hashbrown_0_16")]
            $m!(
                HashbrownSet016<T: Eq + Hash, S: BuildHasher + Default>,
                (|size| HashbrownSet016::with_capacity_and_hasher(crate::utils::size_hint_cautious::<T>(Some(size)), S::default())),
                insert
            );
            #[cfg(feature = "hashbrown_0_17")]
            $m!(
                HashbrownSet017<T: Eq + Hash, S: BuildHasher + Default>,
                (|size| HashbrownSet017::with_capacity_and_hasher(crate::utils::size_hint_cautious::<T>(Some(size)), S::default())),
                insert
            );
            #[cfg(feature = "indexmap_1")]
   
```

---

# OUTRO - impls.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\serde_with-3.21.0\src\ser\impls.rs
**SHA:** 7670e7c73b10aaf4
**Timestamp:** 2026-08-28T02:35:34.621582
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: SerializeAsWrap::<Idx, IdxAs>::new(&value.start),
- start: SerializeAsWrap::<Idx, IdxAs>::new(&value.start),

### Ouro Bruto (primeiros 5000 chars)
```
pub(crate) use self::macros::*;
use crate::{formats::Strictness, prelude::*};
#[cfg(feature = "hashbrown_0_14")]
use hashbrown_0_14::{HashMap as HashbrownMap014, HashSet as HashbrownSet014};
#[cfg(feature = "hashbrown_0_15")]
use hashbrown_0_15::{HashMap as HashbrownMap015, HashSet as HashbrownSet015};
#[cfg(feature = "hashbrown_0_16")]
use hashbrown_0_16::{HashMap as HashbrownMap016, HashSet as HashbrownSet016};
#[cfg(feature = "hashbrown_0_17")]
use hashbrown_0_17::{HashMap as HashbrownMap017, HashSet as HashbrownSet017};
#[cfg(feature = "indexmap_1")]
use indexmap_1::{IndexMap, IndexSet};
#[cfg(feature = "indexmap_2")]
use indexmap_2::{IndexMap as IndexMap2, IndexSet as IndexSet2};
#[cfg(feature = "smallvec_1")]
use smallvec_1::SmallVec;

///////////////////////////////////////////////////////////////////////////////
// Helper macro used internally

#[cfg(feature = "alloc")]
type BoxedSlice<T> = Box<[T]>;
type Slice<T> = [T];
type Ref<'a, T> = &'a T;
type RefMut<'a, T> = &'a mut T;

pub(crate) mod macros {
    // The unused_imports lint has false-positives around macros
    // https://github.com/rust-lang/rust/issues/78894
    #![allow(unused_imports)]

    macro_rules! foreach_map {
    ($m:ident) => {
        #[cfg(feature = "alloc")]
        $m!(BTreeMap<K, V>);
        #[cfg(feature = "std")]
        $m!(HashMap<K, V, H: Sized>);
        #[cfg(feature = "hashbrown_0_14")]
        $m!(HashbrownMap014<K, V, H: Sized>);
        #[cfg(feature = "hashbrown_0_15")]
        $m!(HashbrownMap015<K, V, H: Sized>);
        #[cfg(feature = "hashbrown_0_16")]
        $m!(HashbrownMap016<K, V, H: Sized>);
        #[cfg(feature = "hashbrown_0_17")]
        $m!(HashbrownMap017<K, V, H: Sized>);
        #[cfg(feature = "indexmap_1")]
        $m!(IndexMap<K, V, H: Sized>);
        #[cfg(feature = "indexmap_2")]
        $m!(IndexMap2<K, V, H: Sized>);
    };
}

    macro_rules! foreach_set {
    ($m:ident, $T:tt) => {
        #[cfg(feature = "alloc")]
        $m!(BTreeSet<$T>);
        #[cfg(feature = "std")]
        $m!(HashSet<$T, H: Sized>);
        #[cfg(feature = "hashbrown_0_14")]
        $m!(HashbrownSet014<$T, H: Sized>);
        #[cfg(feature = "hashbrown_0_15")]
        $m!(HashbrownSet015<$T, H: Sized>);
        #[cfg(feature = "hashbrown_0_16")]
        $m!(HashbrownSet016<$T, H: Sized>);
        #[cfg(feature = "hashbrown_0_17")]
        $m!(HashbrownSet017<$T, H: Sized>);
        #[cfg(feature = "indexmap_1")]
        $m!(IndexSet<$T, H: Sized>);
        #[cfg(feature = "indexmap_2")]
        $m!(IndexSet2<$T, H: Sized>);
    };
    ($m:ident) => {
        foreach_set!($m, T);
    };
}

    macro_rules! foreach_seq {
        ($m:ident, $T:tt) => {
            foreach_set!($m, $T);

            $m!(Slice<$T>);

            #[cfg(feature = "alloc")]
            $m!(BinaryHeap<$T>);
            #[cfg(feature = "alloc")]
            $m!(BoxedSlice<$T>);
            #[cfg(feature = "alloc")]
            $m!(LinkedList<$T>);
            #[cfg(feature = "alloc")]
            $m!(Vec<$T>);
            #[cfg(feature = "alloc")]
            $m!(VecDeque<$T>);
        };
        ($m:
            ident) => {
            foreach_seq!($m, T);
        };
    }

    // Make the macros available to the rest of the crate
    pub(crate) use foreach_map;
    pub(crate) use foreach_seq;
    pub(crate) use foreach_set;
}

///////////////////////////////////////////////////////////////////////////////
// region: Simple Wrapper types (e.g., Box, Option)

#[allow(unused_macros)]
macro_rules! pinned_wrapper {
    ($wrapper:ident $($lifetime:lifetime)?) => {
        impl<$($lifetime,)? T, U> SerializeAs<Pin<$wrapper<$($lifetime,)? T>>> for Pin<$wrapper<$($lifetime,)? U>>
        where
            U: SerializeAs<T>,
        {
            fn serialize_as<S>(source: &Pin<$wrapper<$($lifetime,)? T>>, serializer: S) -> Result<S::Ok, S::Error>
            where
                S: Serializer,
            {
                SerializeAsWrap::<T, U>::new(source).serialize(serializer)
            }
        }
    };
}

impl<'a, T, U> SerializeAs<&'a T> for &'a U
where
    U: SerializeAs<T>,
    T: ?Sized,
    U: ?Sized,
{
    fn serialize_as<S>(source: &&'a T, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        SerializeAsWrap::<T, U>::new(source).serialize(serializer)
    }
}

impl<'a, T, U> SerializeAs<&'a mut T> for &'a mut U
where
    U: SerializeAs<T>,
    T: ?Sized,
    U: ?Sized,
{
    fn serialize_as<S>(source: &&'a mut T, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        SerializeAsWrap::<T, U>::new(source).serialize(serializer)
    }
}

pinned_wrapper!(Ref 'a);
pinned_wrapper!(RefMut 'a);

#[cfg(feature = "alloc")]
impl<T, U> SerializeAs<Box<T>> for Box<U>
where
    U: SerializeAs<T>,
{
    fn serialize_as<S>(source: &Box<T>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        SerializeAsWrap::<T, U>::new(source).serialize(
```

---

# OUTRO - impls.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\src\combinator\impls.rs
**SHA:** b4e37d3a85043368
**Timestamp:** 2026-08-28T02:37:39.268240
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = i.checkpoint();
- let start = i.checkpoint();
- let start = input.checkpoint();
- let start = input.current_token_start();
- let start = input.current_token_start();
- let start = i.checkpoint();
- let start = i.checkpoint();
- let token_start = i.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
//! Opaque implementations of [`Parser`]

use crate::combinator::trace;
use crate::combinator::trace_result;
use crate::combinator::DisplayDebug;
#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
use crate::error::FromRecoverableError;
use crate::error::{AddContext, FromExternalError, ParserError};
#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
use crate::stream::Recover;
use crate::stream::StreamIsPartial;
use crate::stream::{Location, Stream};
use crate::*;
use core::borrow::Borrow;
use core::ops::Range;

/// [`Parser`] implementation for [`Parser::by_ref`]
pub struct ByRef<'p, P, I, O, E> {
    pub(crate) p: &'p mut P,
    pub(crate) i: core::marker::PhantomData<I>,
    pub(crate) o: core::marker::PhantomData<O>,
    pub(crate) e: core::marker::PhantomData<E>,
}

impl<I, O, E, P> Parser<I, O, E> for ByRef<'_, P, I, O, E>
where
    P: Parser<I, O, E>,
{
    #[inline(always)]
    fn parse_next(&mut self, i: &mut I) -> Result<O, E> {
        self.p.parse_next(i)
    }
}

/// [`Parser`] implementation for [`Parser::map`]
pub struct Map<F, G, I, O, O2, E>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> O2,
{
    pub(crate) parser: F,
    pub(crate) map: G,
    pub(crate) i: core::marker::PhantomData<I>,
    pub(crate) o: core::marker::PhantomData<O>,
    pub(crate) o2: core::marker::PhantomData<O2>,
    pub(crate) e: core::marker::PhantomData<E>,
}

impl<F, G, I, O, O2, E> Parser<I, O2, E> for Map<F, G, I, O, O2, E>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> O2,
{
    #[inline]
    fn parse_next(&mut self, i: &mut I) -> Result<O2, E> {
        match self.parser.parse_next(i) {
            Err(e) => Err(e),
            Ok(o) => Ok((self.map)(o)),
        }
    }
}

/// [`Parser`] implementation for [`Parser::try_map`]
pub struct TryMap<F, G, I, O, O2, E, E2>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> Result<O2, E2>,
    I: Stream,
    E: FromExternalError<I, E2>,
    E: ParserError<I>,
{
    pub(crate) parser: F,
    pub(crate) map: G,
    pub(crate) i: core::marker::PhantomData<I>,
    pub(crate) o: core::marker::PhantomData<O>,
    pub(crate) o2: core::marker::PhantomData<O2>,
    pub(crate) e: core::marker::PhantomData<E>,
    pub(crate) e2: core::marker::PhantomData<E2>,
}

impl<F, G, I, O, O2, E, E2> Parser<I, O2, E> for TryMap<F, G, I, O, O2, E, E2>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> Result<O2, E2>,
    I: Stream,
    E: FromExternalError<I, E2>,
    E: ParserError<I>,
{
    #[inline]
    fn parse_next(&mut self, input: &mut I) -> Result<O2, E> {
        let start = input.checkpoint();
        let o = self.parser.parse_next(input)?;
        let res = (self.map)(o).map_err(|err| {
            input.reset(&start);
            E::from_external_error(input, err)
        });
        trace_result("verify", &res);
        res
    }
}

/// [`Parser`] implementation for [`Parser::verify_map`]
pub struct VerifyMap<F, G, I, O, O2, E>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> Option<O2>,
    I: Stream,
    E: ParserError<I>,
{
    pub(crate) parser: F,
    pub(crate) map: G,
    pub(crate) i: core::marker::PhantomData<I>,
    pub(crate) o: core::marker::PhantomData<O>,
    pub(crate) o2: core::marker::PhantomData<O2>,
    pub(crate) e: core::marker::PhantomData<E>,
}

impl<F, G, I, O, O2, E> Parser<I, O2, E> for VerifyMap<F, G, I, O, O2, E>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> Option<O2>,
    I: Stream,
    E: ParserError<I>,
{
    #[inline]
    fn parse_next(&mut self, input: &mut I) -> Result<O2, E> {
        let start = input.checkpoint();
        let o = self.parser.parse_next(input)?;
        let res = (self.map)(o).ok_or_else(|| {
            input.reset(&start);
            ParserError::from_input(input)
        });
        trace_result("verify", &res);
        res
    }
}

/// [`Parser`] implementation for [`Parser::and_then`]
pub struct AndThen<F, G, I, O, O2, E>
where
    F: Parser<I, O, E>,
    G: Parser<O, O2, E>,
    O: StreamIsPartial,
    I: Stream,
{
    pub(crate) outer: F,
    pub(crate) inner: G,
    pub(crate) i: core::marker::PhantomData<I>,
    pub(crate) o: core::marker::PhantomData<O>,
    pub(crate) o2: core::marker::PhantomData<O2>,
    pub(crate) e: core::marker::PhantomData<E>,
}

impl<F, G, I, O, O2, E> Parser<I, O2, E> for AndThen<F, G, I, O, O2, E>
where
    F: Parser<I, O, E>,
    G: Parser<O, O2, E>,
    O: StreamIsPartial,
    I: Stream,
{
    #[inline(always)]
    fn parse_next(&mut self, i: &mut I) -> Result<O2, E> {
        let start = i.checkpoint();
        let mut o = self.outer.parse_next(i)?;
        let _ = o.complete();
        let o2 = self.inner.parse_next(&mut o).map_err(|err| {
            i.reset(&start);
            err
        })?;
        Ok(o2)
    }
}

/// [`Parser`] implementation for [`Parser::parse_to`]
pub struct ParseTo<P, I, O, O2, E>
where
    P: Parser<I, O, E>,
    I: Stream,
    O: crate::stream::ParseSlice<O2>,
    E: ParserError<I>,
{
    pub(crate) p: P,
    pub(crate) i: core::ma
```

---

# OUTRO - impls.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\src\combinator\impls.rs
**SHA:** 1da2de638f2dcef0
**Timestamp:** 2026-08-28T02:37:40.981843
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub(crate) start: Option<I::Checkpoint>,
- let start = self.start.take()?;
- let start = input.checkpoint();
- let start = input.checkpoint();
- let start = i.checkpoint();
- let start = i.checkpoint();
- let start = input.checkpoint();
- let start = input.current_token_start();
- let start = input.current_token_start();
- let start = i.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
//! Opaque implementations of [`Parser`]

use crate::combinator::trace;
use crate::combinator::trace_result;
use crate::combinator::DisplayDebug;
#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
use crate::error::FromRecoverableError;
use crate::error::ParseError;
use crate::error::{AddContext, FromExternalError, ParserError};
#[cfg(feature = "unstable-recover")]
#[cfg(feature = "std")]
use crate::stream::Recover;
use crate::stream::StreamIsPartial;
use crate::stream::{Location, Stream};
use crate::{Parser, Result};
use core::borrow::Borrow;
use core::ops::Range;

/// Iterator implementation for [`Parser::parse_iter`]
pub struct ParseIter<'p, P, I, O, E>
where
    I: Stream,
{
    pub(crate) parser: &'p mut P,
    pub(crate) input: Option<I>,
    pub(crate) start: Option<I::Checkpoint>,
    pub(crate) marker: core::marker::PhantomData<(O, E)>,
}

impl<'p, I, O, E, P> Iterator for ParseIter<'p, P, I, O, E>
where
    P: Parser<I, O, E>,
    I: Stream,
    // Force users to deal with `Incomplete` when `StreamIsPartial<true>`
    I: StreamIsPartial,
    E: ParserError<I>,
    <E as ParserError<I>>::Inner: ParserError<I>,
{
    type Item = Result<O, ParseError<I, <E as ParserError<I>>::Inner>>;

    fn next(&mut self) -> Option<Self::Item> {
        let input = self.input.as_mut()?;
        let len = input.eof_offset();
        if len == 0 {
            self.input = None;
            return None;
        }

        let mut output = self.parser.parse_next(input);
        // infinite loop check: the parser must always consume
        if output.is_ok() && input.eof_offset() == len {
            let err = <E as ParserError<I>>::assert(
                input,
                "`Parser::parse_iter` parsers must always consume",
            );
            output = Err(err);
        }

        match output {
            Ok(output) => Some(Ok(output)),
            Err(err) => {
                let err = err.into_inner().unwrap_or_else(|_err| {
                    panic!("complete parsers should not report `ErrMode::Incomplete(_)`")
                });
                let input = self.input.take()?;
                let start = self.start.take()?;
                Some(Err(ParseError::new(input, start, err)))
            }
        }
    }
}

/// [`Parser`] implementation for [`Parser::by_ref`]
pub struct ByRef<'p, P, I, O, E> {
    pub(crate) p: &'p mut P,
    pub(crate) marker: core::marker::PhantomData<(I, O, E)>,
}

impl<I, O, E, P> Parser<I, O, E> for ByRef<'_, P, I, O, E>
where
    P: Parser<I, O, E>,
{
    #[inline(always)]
    fn parse_next(&mut self, i: &mut I) -> Result<O, E> {
        self.p.parse_next(i)
    }
}

/// [`Parser`] implementation for [`Parser::map`]
pub struct Map<F, G, I, O, O2, E>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> O2,
{
    pub(crate) parser: F,
    pub(crate) map: G,
    pub(crate) marker: core::marker::PhantomData<(I, O, E, O2)>,
}

impl<F, G, I, O, O2, E> Parser<I, O2, E> for Map<F, G, I, O, O2, E>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> O2,
{
    #[inline]
    fn parse_next(&mut self, i: &mut I) -> Result<O2, E> {
        match self.parser.parse_next(i) {
            Err(e) => Err(e),
            Ok(o) => Ok((self.map)(o)),
        }
    }
}

/// [`Parser`] implementation for [`Parser::try_map`]
pub struct TryMap<F, G, I, O, O2, E, E2>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> Result<O2, E2>,
    I: Stream,
    E: FromExternalError<I, E2>,
    E: ParserError<I>,
{
    pub(crate) parser: F,
    pub(crate) map: G,
    pub(crate) marker: core::marker::PhantomData<(I, O, O2, E, E2)>,
}

impl<F, G, I, O, O2, E, E2> Parser<I, O2, E> for TryMap<F, G, I, O, O2, E, E2>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> Result<O2, E2>,
    I: Stream,
    E: FromExternalError<I, E2>,
    E: ParserError<I>,
{
    #[inline]
    fn parse_next(&mut self, input: &mut I) -> Result<O2, E> {
        let start = input.checkpoint();
        let o = self.parser.parse_next(input)?;
        let res = (self.map)(o).map_err(|err| {
            input.reset(&start);
            E::from_external_error(input, err)
        });
        trace_result("verify", &res);
        res
    }
}

/// [`Parser`] implementation for [`Parser::verify_map`]
pub struct VerifyMap<F, G, I, O, O2, E>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> Option<O2>,
    I: Stream,
    E: ParserError<I>,
{
    pub(crate) parser: F,
    pub(crate) map: G,
    pub(crate) marker: core::marker::PhantomData<(I, O, E, O2)>,
}

impl<F, G, I, O, O2, E> Parser<I, O2, E> for VerifyMap<F, G, I, O, O2, E>
where
    F: Parser<I, O, E>,
    G: FnMut(O) -> Option<O2>,
    I: Stream,
    E: ParserError<I>,
{
    #[inline]
    fn parse_next(&mut self, input: &mut I) -> Result<O2, E> {
        let start = input.checkpoint();
        let o = self.parser.parse_next(input)?;
        let res = (self.map)(o).ok_or_else(|| {
            input.reset(&start);
            ParserError::from_input(input)
        });
        trace_result("ver
```