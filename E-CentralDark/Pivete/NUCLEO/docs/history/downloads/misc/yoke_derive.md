# OUTRO - yoke_derive.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\yoke-derive-0.8.2\examples\yoke_derive.rs
**SHA:** c9fcf17dec9f7220
**Timestamp:** 2026-08-28T02:37:43.952898
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: make this compile

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

#![allow(unused)]

use std::{borrow::Cow, marker::PhantomData};
use yoke::{Yoke, Yokeable};
use zerovec::{maps::ZeroMapKV, ule::AsULE, VarZeroVec, ZeroMap, ZeroVec};

#[derive(Yokeable)]
struct StringExample {
    x: String,
}

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualStringExample {
    x: String,
}

#[derive(Yokeable, Copy, Clone)]
struct IntExample {
    x: u32,
}

#[derive(Yokeable, Copy, Clone)]
#[yoke(prove_covariance_manually)]
struct ManualIntExample {
    x: u32,
}

#[derive(Yokeable, Copy, Clone)]
struct GenericsExample<T> {
    x: u32,
    y: T,
}

#[derive(Yokeable, Copy, Clone)]
#[yoke(prove_covariance_manually)]
struct ManualGenericsExample<T> {
    x: u32,
    y: T,
}

#[derive(Yokeable, Copy, Clone)]
struct GenericsExampleWithDefault<T, U = usize> {
    x: T,
    y: U,
}

#[derive(Yokeable, Copy, Clone)]
#[yoke(prove_covariance_manually)]
struct ManualGenericsExampleWithDefault<T, U = usize> {
    x: T,
    y: U,
}

#[derive(Yokeable)]
struct CowExample<'a> {
    x: u8,
    y: &'a str,
    z: Cow<'a, str>,
    w: Cow<'a, [u8]>,
}

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualCowExample<'a> {
    x: u8,
    y: &'a str,
    z: Cow<'a, str>,
    w: Cow<'a, [u8]>,
}

#[derive(Yokeable)]
struct ZeroVecExample<'not_a> {
    var: VarZeroVec<'not_a, str>,
    vec: ZeroVec<'not_a, u16>,
}

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualZeroVecExample<'not_a> {
    var: VarZeroVec<'not_a, str>,
    vec: ZeroVec<'not_a, u16>,
}

#[derive(Yokeable)]
struct ZeroVecExampleWithGenerics<'a, T: AsULE> {
    gen: ZeroVec<'a, T>,
    vec: ZeroVec<'a, u16>,
    bare: T,
}

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualZeroVecExampleWithGenerics<'a, T: AsULE> {
    gen: ZeroVec<'a, T>,
    vec: ZeroVec<'a, u16>,
    bare: T,
}

// Since ZeroMap has generic parameters, the Rust compiler cannot
// prove the covariance of the lifetimes. To use derive(Yokeable)
// with a type such as ZeroMap, you just add the attribute
// yoke(prove_covariance_manually)
#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualZeroMapExample<'a> {
    map: ZeroMap<'a, str, u16>,
}

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualZeroMapGenericExample<'a, T: for<'b> ZeroMapKV<'b> + ?Sized> {
    map: ZeroMap<'a, str, T>,
}

#[derive(Yokeable)]
struct MaybeSizedWrap<T, Q: ?Sized, U: ?Sized> {
    x: T,
    y: Option<T>,
    ignored: PhantomData<U>,
    q: Q,
}

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualMaybeSizedWrap<T, Q: ?Sized, U: ?Sized> {
    x: T,
    y: Option<T>,
    ignored: PhantomData<U>,
    q: Q,
}

// TODO(#4119): Make this example compile
/*
#[derive(Yokeable)]
struct MaybeSizedWrapWithLifetime<'a, T, Q: ?Sized, U: ?Sized> {
    x: T,
    y: Option<T>,
    ignored: &'a U,
    q: Q,
}
*/

trait Trait {}
impl Trait for u32 {}

#[derive(Yokeable)]
struct WithTraitBounds<T: Trait> {
    x: T,
}

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualWithTraitBounds<T: Trait> {
    x: T,
}

#[derive(Yokeable)]
struct WithTraitBoundsInWhere<T>
where
    T: Trait,
{
    x: T,
}

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualWithTraitBoundsInWhere<T>
where
    T: Trait,
{
    x: T,
}

#[derive(Yokeable)]
struct BoundFn<'a>(&'a (), for<'b> fn(&'b ()));

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualBoundFn<'a>(&'a (), for<'b> fn(&'b ()));

#[derive(Yokeable)]
struct Invariant<'a, T>(&'a mut T);

#[derive(Yokeable)]
struct InvariantStatic<'a> {
    field: Invariant<'a, &'static str>,
}

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualInvariantStatic<'a> {
    field: Invariant<'a, &'static str>,
}

#[derive(Yokeable)]
struct RawLifetime<'r#mod> {
    field: &'r#mod str,
    other: for<'r#yoke> fn(&'r#yoke ()),
}

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualRawLifetime<'r#mod> {
    field: &'r#mod str,
    other: for<'r#yoke> fn(&'r#yoke ()),
}

#[derive(Yokeable)]
struct MixedRawLifetime<'r#a> {
    field: &'r#a &'a str,
}

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualMixedRawLifetime<'r#a> {
    field: &'r#a &'a str,
}

#[derive(Yokeable)]
struct YokeLifetime<'r#_yoke>(&'r#_yoke str, for<'yoke> fn(&'yoke ()));

#[derive(Yokeable)]
#[yoke(prove_covariance_manually)]
struct ManualYokeLifetime<'r#_yoke>(&'r#_yoke str, for<'yoke> fn(&'yoke ()));

// TODO: make this compile
// #[derive(Yokeable)]
struct ConstGenerics<'a, const N: u32> {
    field: &'a str,
}

// #[derive(Yokeable)]
// #[yoke(prove_covariance_manually)]
struct ManualConstGenerics<'a, const N: u32> {
    field: &'a str,
}

#[derive(Yokeable)]
struct Variadic<'a> {
    field: fn(extern "C" fn(&'a (), u32
```