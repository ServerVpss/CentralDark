# OUTRO - cartable_ptr.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\yoke-0.8.3\src\cartable_ptr.rs
**SHA:** bc06dfb088430fb0
**Timestamp:** 2026-08-28T02:37:43.659685
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = DROP_INVOCATIONS.with(Cell::get);
- let start = DROP_INVOCATIONS.with(Cell::get);
- let start = DROP_INVOCATIONS.with(Cell::get);

### Ouro Bruto (primeiros 5000 chars)
```
// This file is part of ICU4X. For terms of use, please see the file
// called LICENSE at the top level of the ICU4X source tree
// (online at: https://github.com/unicode-org/icu4x/blob/main/LICENSE ).

//! Types for optional pointers with niche optimization.
//!
//! The main type is [`CartableOptionPointer`], which is like `Option<Rc>` but
//! with a niche so that the resulting `Yoke` has a niche. The following four
//! types can be stored in the `CartableOptionPointer`:
//!
//! 1. `&T`
//! 2. `Box<T>`
//! 3. `Rc<T>`
//! 4. `Arc<T>`
//!
//! These four types implement the sealed unsafe trait [`CartablePointerLike`].
//! In addition, all except `Box<T>` impl [`CloneableCartablePointerLike`],
//! which allows [`CartableOptionPointer`] to implement `Clone`.

use crate::CloneableCart;
#[cfg(feature = "alloc")]
use alloc::boxed::Box;
#[cfg(feature = "alloc")]
use alloc::rc::Rc;
#[cfg(feature = "alloc")]
use alloc::sync::Arc;
#[cfg(test)]
use core::cell::Cell;
use core::marker::PhantomData;
use core::ptr::NonNull;
use stable_deref_trait::StableDeref;

// Safety note: this method MUST return the same value for the same T, even if i.e. the method gets
// instantiated in different crates. This can be untrue in surprising ways! For example, just
// returning a const-ref-to-const would not guarantee that.
// The current implementation always returns the same address for any T, see
// [the reference](https://doc.rust-lang.org/reference/items/static-items.html#statics--generics):
// there is exactly one `SENTINEL` item for any T.
#[inline]
fn sentinel_for<T>() -> NonNull<T> {
    static SENTINEL: &u8 = &0x1a; // SUB

    // Safety: SENTINEL is indeed not a null pointer, even after the casts.
    unsafe { NonNull::new_unchecked(SENTINEL as *const u8 as *mut T) }
}

#[cfg(test)]
thread_local! {
    static DROP_INVOCATIONS: Cell<usize> = const { Cell::new(0) };
}

mod private {
    pub trait Sealed {}
}

use private::Sealed;

/// An object fully representable by a non-null pointer.
///
/// # Safety
///
/// Implementer safety:
///
/// 1. `into_raw` transfers ownership of the values referenced by [`StableDeref`] to the caller,
///    if there is ownership to transfer
/// 2. `drop_raw` returns ownership back to the impl, if there is ownership to transfer
///
/// Note: if `into_raw` returns the sentinel pointer, memory leaks may occur, but this will not
/// lead to undefined behaviour.
///
/// Note: the pointer `NonNull<Self::Raw>` may or may not be aligned and it should never
/// be dereferenced. Rust allows unaligned pointers; see [`std::ptr::read_unaligned`].
pub unsafe trait CartablePointerLike: StableDeref + Sealed {
    /// The raw type used for [`Self::into_raw`] and [`Self::drop_raw`].
    #[doc(hidden)]
    type Raw;

    /// Converts this pointer-like into a pointer.
    #[doc(hidden)]
    fn into_raw(self) -> NonNull<Self::Raw>;

    /// Drops any memory associated with this pointer-like.
    ///
    /// # Safety
    ///
    /// Caller safety:
    ///
    /// 1. The pointer MUST have been returned by this impl's `into_raw`.
    /// 2. The pointer MUST NOT be dangling.
    #[doc(hidden)]
    unsafe fn drop_raw(pointer: NonNull<Self::Raw>);
}

/// An object that implements [`CartablePointerLike`] that also
/// supports cloning without changing the address of referenced data.
///
/// # Safety
///
/// Implementer safety:
///
/// 1. `addref_raw` must create a new owner such that an additional call to
///    `drop_raw` does not create a dangling pointer
/// 2. `addref_raw` must not change the address of any referenced data.
pub unsafe trait CloneableCartablePointerLike: CartablePointerLike {
    /// Clones this pointer-like.
    ///
    /// # Safety
    ///
    /// Caller safety:
    ///
    /// 1. The pointer MUST have been returned by this impl's `into_raw`.
    /// 2. The pointer MUST NOT be dangling.
    #[doc(hidden)]
    unsafe fn addref_raw(pointer: NonNull<Self::Raw>);
}

impl<'a, T> Sealed for &'a T {}

// Safety:
// 1. There is no ownership to transfer
// 2. There is no ownership to transfer
unsafe impl<'a, T> CartablePointerLike for &'a T {
    type Raw = T;

    #[inline]
    fn into_raw(self) -> NonNull<T> {
        self.into()
    }
    #[inline]
    unsafe fn drop_raw(_pointer: NonNull<T>) {
        // No-op: references are borrowed from elsewhere
    }
}

// Safety:
// 1. There is no ownership
// 2. The impl is a no-op so no addresses are changed.
unsafe impl<'a, T> CloneableCartablePointerLike for &'a T {
    #[inline]
    unsafe fn addref_raw(_pointer: NonNull<T>) {
        // No-op: references are borrowed from elsewhere
    }
}

#[cfg(feature = "alloc")]
impl<T> Sealed for Box<T> {}

#[cfg(feature = "alloc")]
// Safety:
// 1. `Box::into_raw` says: "After calling this function, the caller is responsible for the
//    memory previously managed by the Box."
// 2. `Box::from_raw` says: "After calling this function, the raw pointer is owned by the
//    resulting Box."
unsafe impl<T> CartablePointerLike for
```