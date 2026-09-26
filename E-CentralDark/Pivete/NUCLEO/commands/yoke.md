# COMANDO - yoke.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\yoke-0.8.3\src\yoke.rs
**SHA:** 0b1177813fbd1589
**Timestamp:** 2026-08-28T02:37:43.807297
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- // Safety invariant: this type can be anything, but `yokeable` may only contain references to

### Principios
- // Safety invariant: this type can be anything, but `yokeable` may only contain references to

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

use crate::cartable_ptr::{CartableOptionPointer, CartablePointerLike};
use crate::either::EitherCart;
#[cfg(feature = "alloc")]
use crate::erased::{ErasedArcCart, ErasedBoxCart, ErasedRcCart};
use crate::kinda_sorta_dangling::KindaSortaDangling;
use crate::utils;
use crate::Yokeable;
use core::marker::PhantomData;
use core::mem::ManuallyDrop;
use core::ops::Deref;
use stable_deref_trait::StableDeref;

#[cfg(feature = "alloc")]
use alloc::boxed::Box;
#[cfg(feature = "alloc")]
use alloc::rc::Rc;
#[cfg(feature = "alloc")]
use alloc::sync::Arc;

/// A Cow-like borrowed object "yoked" to its backing data.
///
/// This allows things like zero copy deserialized data to carry around
/// shared references to their backing buffer, by "erasing" their static lifetime
/// and turning it into a dynamically managed one.
///
/// `Y` (the [`Yokeable`]) is the object containing the references,
/// and will typically be of the form `Foo<'static>`. The `'static` is
/// not the actual lifetime of the data, rather it is a convenient way to mark the
/// erased lifetime and make it dynamic.
///
/// `C` is the "cart", which `Y` may contain references to. After the yoke is constructed,
/// the cart serves little purpose except to guarantee that `Y`'s references remain valid
/// for as long as the yoke remains in memory (by calling the destructor at the appropriate moment).
///
/// The primary constructor for [`Yoke`] is [`Yoke::attach_to_cart()`]. Several variants of that
/// constructor are provided to serve numerous types of call sites and `Yoke` signatures.
///
/// The key behind this type is [`Yoke::get()`], where calling [`.get()`][Yoke::get] on a type like
/// `Yoke<Cow<'static, str>, _>` will get you a short-lived `&'a Cow<'a, str>`, restricted to the
/// lifetime of the borrow used during `.get()`. This is entirely safe since the `Cow` borrows from
/// the cart type `C`, which cannot be interfered with as long as the `Yoke` is borrowed by `.get
/// ()`. `.get()` protects access by essentially reifying the erased lifetime to a safe local one
/// when necessary.
///
/// Furthermore, there are various [`.map_project()`][Yoke::map_project] methods that allow turning a `Yoke`
/// into another `Yoke` containing a different type that may contain elements of the original yoked
/// value. See the [`Yoke::map_project()`] docs for more details.
///
/// In general, `C` is a concrete type, but it is also possible for it to be a trait object.
///
/// # Example
///
/// For example, we can use this to store zero-copy deserialized data in a cache:
///
/// ```rust
/// # use yoke::Yoke;
/// # use std::rc::Rc;
/// # use std::borrow::Cow;
/// # fn load_from_cache(_filename: &str) -> Rc<[u8]> {
/// #     // dummy implementation
/// #     Rc::new([0x5, 0, 0, 0, 0, 0, 0, 0, 0x68, 0x65, 0x6c, 0x6c, 0x6f])
/// # }
///
/// fn load_object(filename: &str) -> Yoke<Cow<'static, str>, Rc<[u8]>> {
///     let rc: Rc<[u8]> = load_from_cache(filename);
///     Yoke::<Cow<'static, str>, Rc<[u8]>>::attach_to_cart(rc, |data: &[u8]| {
///         // essentially forcing a #[serde(borrow)]
///         Cow::Borrowed(bincode::deserialize(data).unwrap())
///     })
/// }
///
/// let yoke = load_object("filename.bincode");
/// assert_eq!(&**yoke.get(), "hello");
/// assert!(matches!(yoke.get(), &Cow::Borrowed(_)));
/// ```
pub struct Yoke<Y: for<'a> Yokeable<'a>, C> {
    // must be the first field for drop order
    // this will have a 'static lifetime parameter, that parameter is a lie
    yokeable: KindaSortaDangling<Y>,
    // Safety invariant: this type can be anything, but `yokeable` may only contain references to
    // StableDeref parts of this cart, and the targets of those references must be valid for the
    // lifetime of this cart (it must own or borrow them). It's ok for this cart to contain stack
    // data as long as it is not referenced by `yokeable` during construction. `attach_to_cart`,
    // the typical constructor of this type, upholds this invariant, but other constructors like
    // `replace_cart` need to uphold it.
    // The implementation guarantees that there are no live `yokeable`s that reference data
    // in a `cart` when the `cart` is dropped; this is guaranteed in the drop glue through field
    // order.
    cart: C,
}

// Manual `Debug` implementation, since the derived one would be unsound.
// See https://github.com/unicode-org/icu4x/issues/3685
impl<Y: for<'a> Yokeable<'a>, C: core::fmt::Debug> core::fmt::Debug for Yoke<Y, C>
where
    for<'a> <Y as Yokeable<'a>>::Output: core::fmt::Debug,
{
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        f.debug_struct("Yoke")
            .field("yokeable", self.get())
            .field("cart", self.backing_cart())
            .finish()
    }
}

impl<Y, C> core
```