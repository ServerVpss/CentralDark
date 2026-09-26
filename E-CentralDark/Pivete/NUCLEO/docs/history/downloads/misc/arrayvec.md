# OUTRO - arrayvec.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tinyvec-1.12.0\src\arrayvec.rs
**SHA:** 94436b7733ec14fc
**Timestamp:** 2026-08-28T02:36:10.305103
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- tail_start: usize,
- tail_start: 0,
- tail_start: usize,
- tail_start: 0,
- let start = match range.start_bound() {
- removal_start: start,
- removal_start: usize,

### Contratos
- // Loop start invariant: idx = rest.done_end + rest.tail_start
- // Loop start invariant: idx = rest.done_end + rest.tail_start

### Principios
- // Loop start invariant: idx = rest.done_end + rest.tail_start
- // Loop start invariant: idx = rest.done_end + rest.tail_start

### Ouro Bruto (primeiros 5000 chars)
```
use super::*;
use core::convert::{TryFrom, TryInto};

#[cfg(feature = "serde")]
use core::marker::PhantomData;
#[cfg(feature = "serde")]
use serde_core::de::{
  Deserialize, Deserializer, Error as DeserializeError, SeqAccess, Visitor,
};
#[cfg(feature = "serde")]
use serde_core::ser::{Serialize, SerializeSeq, Serializer};

/// Helper to make an `ArrayVec`.
///
/// You specify the backing array type, and optionally give all the elements you
/// want to initially place into the array.
///
/// ```rust
/// use tinyvec::*;
///
/// // The backing array type can be specified in the macro call
/// let empty_av = array_vec!([u8; 16]);
/// let some_ints = array_vec!([i32; 4] => 1, 2, 3);
///
/// // Or left to inference
/// let empty_av: ArrayVec<[u8; 10]> = array_vec!();
/// let some_ints: ArrayVec<[u8; 10]> = array_vec!(5, 6, 7, 8);
/// ```
#[macro_export]
macro_rules! array_vec {
  ($array_type:ty => $($elem:expr),* $(,)?) => {
    {
      let mut av: $crate::ArrayVec<$array_type> = Default::default();
      $( av.push($elem); )*
      av
    }
  };
  ($array_type:ty) => {
    $crate::ArrayVec::<$array_type>::default()
  };
  ($($elem:expr),*) => {
    $crate::array_vec!(_ => $($elem),*)
  };
  ($elem:expr; $n:expr) => {
    $crate::ArrayVec::from([$elem; $n])
  };
  () => {
    $crate::array_vec!(_)
  };
}

/// An array-backed, vector-like data structure.
///
/// * `ArrayVec` has a fixed capacity, equal to the minimum of the array size
///   and `u16::MAX`. Note that not all capacities are necessarily supported by
///   default. See comments in [`Array`].
/// * `ArrayVec` has a variable length, as you add and remove elements. Attempts
///   to fill the vec beyond its capacity will cause a panic.
/// * All of the vec's array slots are always initialized in terms of Rust's
///   memory model. When you remove an element from a location, the old value at
///   that location is replaced with the type's default value.
///
/// The overall API of this type is intended to, as much as possible, emulate
/// the API of the [`Vec`](https://doc.rust-lang.org/alloc/vec/struct.Vec.html)
/// type.
///
/// ## Construction
///
/// You can use the `array_vec!` macro similarly to how you might use the `vec!`
/// macro. Specify the array type, then optionally give all the initial values
/// you want to have.
/// ```rust
/// # use tinyvec::*;
/// let some_ints = array_vec!([i32; 4] => 1, 2, 3);
/// assert_eq!(some_ints.len(), 3);
/// ```
///
/// The [`default`](ArrayVec::new) for an `ArrayVec` is to have a default
/// array with length 0. The [`new`](ArrayVec::new) method is the same as
/// calling `default`
/// ```rust
/// # use tinyvec::*;
/// let some_ints = ArrayVec::<[i32; 7]>::default();
/// assert_eq!(some_ints.len(), 0);
///
/// let more_ints = ArrayVec::<[i32; 7]>::new();
/// assert_eq!(some_ints, more_ints);
/// ```
///
/// If you have an array and want the _whole thing_ to count as being "in" the
/// new `ArrayVec` you can use one of the `from` implementations. If you want
/// _part of_ the array then you can use
/// [`from_array_len`](ArrayVec::from_array_len):
/// ```rust
/// # use tinyvec::*;
/// let some_ints = ArrayVec::from([5, 6, 7, 8]);
/// assert_eq!(some_ints.len(), 4);
///
/// let more_ints = ArrayVec::from_array_len([5, 6, 7, 8], 2);
/// assert_eq!(more_ints.len(), 2);
///
/// let no_ints: ArrayVec<[u8; 5]> = ArrayVec::from_array_empty([1, 2, 3, 4, 5]);
/// assert_eq!(no_ints.len(), 0);
/// ```
#[repr(C)]
pub struct ArrayVec<A> {
  len: u16,
  pub(crate) data: A,
}

impl<A> Clone for ArrayVec<A>
where
  A: Array + Clone,
  A::Item: Clone,
{
  #[inline]
  fn clone(&self) -> Self {
    Self { data: self.data.clone(), len: self.len }
  }

  #[inline]
  fn clone_from(&mut self, o: &Self) {
    let iter = self
      .data
      .as_slice_mut()
      .iter_mut()
      .zip(o.data.as_slice())
      .take(self.len.max(o.len) as usize);
    for (dst, src) in iter {
      dst.clone_from(src)
    }
    if let Some(to_drop) =
      self.data.as_slice_mut().get_mut((o.len as usize)..(self.len as usize))
    {
      to_drop.iter_mut().for_each(|x| drop(core::mem::take(x)));
    }
    self.len = o.len;
  }
}

impl<A> Copy for ArrayVec<A>
where
  A: Array + Copy,
  A::Item: Copy,
{
}

impl<A: Array> Default for ArrayVec<A> {
  #[inline]
  fn default() -> Self {
    Self { len: 0, data: A::default() }
  }
}

impl<A: Array> Deref for ArrayVec<A> {
  type Target = [A::Item];
  #[inline(always)]
  fn deref(&self) -> &Self::Target {
    &self.data.as_slice()[..self.len as usize]
  }
}

impl<A: Array> DerefMut for ArrayVec<A> {
  #[inline(always)]
  fn deref_mut(&mut self) -> &mut Self::Target {
    &mut self.data.as_slice_mut()[..self.len as usize]
  }
}

impl<A: Array, I: SliceIndex<[A::Item]>> Index<I> for ArrayVec<A> {
  type Output = <I as SliceIndex<[A::Item]>>::Output;
  #[inline(always)]
  fn index(&self, index: I) -> &Self::Output {
    &self.deref()[index]
  }
}

impl<A: Array, I: SliceIndex<[A::Item]>> IndexMut<I> for ArrayV
```