# DECISAO - tinyvec.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tinyvec-1.12.0\src\tinyvec.rs
**SHA:** dbf5894f12f031b5
**Timestamp:** 2026-08-28T02:36:10.353898
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = match range.start_bound() {
- removal_start: start,
- removal_start: usize,

### Ouro Bruto (primeiros 5000 chars)
```
use super::*;

use alloc::vec::{self, Vec};
use core::convert::TryFrom;
use tinyvec_macros::impl_mirrored;

#[cfg(feature = "rustc_1_57")]
use alloc::collections::TryReserveError;

#[cfg(feature = "serde")]
use core::marker::PhantomData;
#[cfg(feature = "serde")]
use serde_core::de::{Deserialize, Deserializer, SeqAccess, Visitor};
#[cfg(feature = "serde")]
use serde_core::ser::{Serialize, SerializeSeq, Serializer};

/// Helper to make a `TinyVec`.
///
/// You specify the backing array type, and optionally give all the elements you
/// want to initially place into the array.
///
/// ```rust
/// use tinyvec::*;
///
/// // The backing array type can be specified in the macro call
/// let empty_tv = tiny_vec!([u8; 16]);
/// let some_ints = tiny_vec!([i32; 4] => 1, 2, 3);
/// let many_ints = tiny_vec!([i32; 4] => 1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
///
/// // Or left to inference
/// let empty_tv: TinyVec<[u8; 16]> = tiny_vec!();
/// let some_ints: TinyVec<[i32; 4]> = tiny_vec!(1, 2, 3);
/// let many_ints: TinyVec<[i32; 4]> = tiny_vec!(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
/// ```
#[macro_export]
#[cfg_attr(docsrs, doc(cfg(feature = "alloc")))]
macro_rules! tiny_vec {
  ($array_type:ty => $($elem:expr),* $(,)?) => {
    {
      // https://github.com/rust-lang/lang-team/issues/28
      const INVOKED_ELEM_COUNT: usize = 0 $( + { let _ = stringify!($elem); 1 })*;
      // If we have more `$elem` than the `CAPACITY` we will simply go directly
      // to constructing on the heap.
      match $crate::TinyVec::constructor_for_capacity(INVOKED_ELEM_COUNT) {
        $crate::TinyVecConstructor::Inline(f) => {
          f($crate::array_vec!($array_type => $($elem),*))
        }
        $crate::TinyVecConstructor::Heap(f) => {
          f(vec!($($elem),*))
        }
      }
    }
  };
  ($array_type:ty) => {
    $crate::TinyVec::<$array_type>::default()
  };
  ($($elem:expr),*) => {
    $crate::tiny_vec!(_ => $($elem),*)
  };
  ($elem:expr; $n:expr) => {
    $crate::TinyVec::from([$elem; $n])
  };
  () => {
    $crate::tiny_vec!(_)
  };
}

#[doc(hidden)] // Internal implementation details of `tiny_vec!`
pub enum TinyVecConstructor<A: Array> {
  Inline(fn(ArrayVec<A>) -> TinyVec<A>),
  Heap(fn(Vec<A::Item>) -> TinyVec<A>),
}

/// A vector that starts inline, but can automatically move to the heap.
///
/// * Requires the `alloc` feature
///
/// A `TinyVec` is either an Inline([`ArrayVec`](crate::ArrayVec::<A>)) or
/// Heap([`Vec`](https://doc.rust-lang.org/alloc/vec/struct.Vec.html)). The
/// interface for the type as a whole is a bunch of methods that just match on
/// the enum variant and then call the same method on the inner vec.
///
/// ## Construction
///
/// Because it's an enum, you can construct a `TinyVec` simply by making an
/// `ArrayVec` or `Vec` and then putting it into the enum.
///
/// There is also a macro
///
/// ```rust
/// # use tinyvec::*;
/// let empty_tv = tiny_vec!([u8; 16]);
/// let some_ints = tiny_vec!([i32; 4] => 1, 2, 3);
/// ```
#[cfg_attr(docsrs, doc(cfg(feature = "alloc")))]
pub enum TinyVec<A: Array> {
  #[allow(missing_docs)]
  Inline(ArrayVec<A>),
  #[allow(missing_docs)]
  Heap(Vec<A::Item>),
}

impl<A> Clone for TinyVec<A>
where
  A: Array + Clone,
  A::Item: Clone,
{
  #[inline]
  fn clone(&self) -> Self {
    match self {
      TinyVec::Heap(v) => TinyVec::Heap(v.clone()),
      TinyVec::Inline(v) => TinyVec::Inline(v.clone()),
    }
  }

  #[inline]
  fn clone_from(&mut self, o: &Self) {
    if o.len() > self.len() {
      self.reserve(o.len() - self.len());
    } else {
      self.truncate(o.len());
    }
    let (start, end) = o.split_at(self.len());
    for (dst, src) in self.iter_mut().zip(start) {
      dst.clone_from(src);
    }
    self.extend_from_slice(end);
  }
}

impl<A: Array> Default for TinyVec<A> {
  #[inline]
  fn default() -> Self {
    TinyVec::Inline(ArrayVec::default())
  }
}

impl<A: Array> Deref for TinyVec<A> {
  type Target = [A::Item];

  impl_mirrored! {
    type Mirror = TinyVec;
    #[inline(always)]
    #[must_use]
    fn deref(self: &Self) -> &Self::Target;
  }
}

impl<A: Array> DerefMut for TinyVec<A> {
  impl_mirrored! {
    type Mirror = TinyVec;
    #[inline(always)]
    #[must_use]
    fn deref_mut(self: &mut Self) -> &mut Self::Target;
  }
}

impl<A: Array, I: SliceIndex<[A::Item]>> Index<I> for TinyVec<A> {
  type Output = <I as SliceIndex<[A::Item]>>::Output;
  #[inline(always)]
  fn index(&self, index: I) -> &Self::Output {
    &self.deref()[index]
  }
}

impl<A: Array, I: SliceIndex<[A::Item]>> IndexMut<I> for TinyVec<A> {
  #[inline(always)]
  fn index_mut(&mut self, index: I) -> &mut Self::Output {
    &mut self.deref_mut()[index]
  }
}

#[cfg(feature = "std")]
#[cfg_attr(docs_rs, doc(cfg(feature = "std")))]
impl<A: Array<Item = u8>> std::io::Write for TinyVec<A> {
  #[inline(always)]
  fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
    self.extend_from_slice(buf);
    Ok(buf.len())
  }

  #[inline(always)]
  fn flush(&mut self) -> std::io::
```