# OUTRO - slicevec.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tinyvec-1.12.0\src\slicevec.rs
**SHA:** 95d8b1e6a3c424ac
**Timestamp:** 2026-08-28T02:36:10.323838
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = match range.start_bound() {
- target_start: start,
- tail_start: usize,
- let mut rest = JoinOnDrop { items: self.data, done_end: 0, tail_start: 0 };
- target_start: usize,

### Contratos
- // Loop start invariant: idx = rest.done_end + rest.tail_start

### Principios
- // Loop start invariant: idx = rest.done_end + rest.tail_start

### Ouro Bruto (primeiros 5000 chars)
```
#![allow(unused_variables)]
#![allow(missing_docs)]

use super::*;

/// A slice-backed vector-like data structure.
///
/// This is a very similar concept to `ArrayVec`, but instead
/// of the backing memory being an owned array, the backing
/// memory is a unique-borrowed slice. You can thus create
/// one of these structures "around" some slice that you're
/// working with to make it easier to manipulate.
///
/// * Has a fixed capacity (the initial slice size).
/// * Has a variable length.
pub struct SliceVec<'s, T> {
  data: &'s mut [T],
  len: usize,
}

impl<'s, T> Default for SliceVec<'s, T> {
  #[inline(always)]
  fn default() -> Self {
    Self { data: &mut [], len: 0 }
  }
}

impl<'s, T> Deref for SliceVec<'s, T> {
  type Target = [T];
  #[inline(always)]
  fn deref(&self) -> &Self::Target {
    &self.data[..self.len]
  }
}

impl<'s, T> DerefMut for SliceVec<'s, T> {
  #[inline(always)]
  fn deref_mut(&mut self) -> &mut Self::Target {
    &mut self.data[..self.len]
  }
}

impl<'s, T, I> Index<I> for SliceVec<'s, T>
where
  I: SliceIndex<[T]>,
{
  type Output = <I as SliceIndex<[T]>>::Output;
  #[inline(always)]
  fn index(&self, index: I) -> &Self::Output {
    &self.deref()[index]
  }
}

impl<'s, T, I> IndexMut<I> for SliceVec<'s, T>
where
  I: SliceIndex<[T]>,
{
  #[inline(always)]
  fn index_mut(&mut self, index: I) -> &mut Self::Output {
    &mut self.deref_mut()[index]
  }
}

impl<'s, T> SliceVec<'s, T> {
  #[inline]
  pub fn append(&mut self, other: &mut Self)
  where
    T: Default,
  {
    for item in other.drain(..) {
      self.push(item)
    }
  }

  /// A `*mut` pointer to the backing slice.
  ///
  /// ## Safety
  ///
  /// This pointer has provenance over the _entire_ backing slice.
  #[inline(always)]
  #[must_use]
  pub fn as_mut_ptr(&mut self) -> *mut T {
    self.data.as_mut_ptr()
  }

  /// Performs a `deref_mut`, into unique slice form.
  #[inline(always)]
  #[must_use]
  pub fn as_mut_slice(&mut self) -> &mut [T] {
    self.deref_mut()
  }

  /// A `*const` pointer to the backing slice.
  ///
  /// ## Safety
  ///
  /// This pointer has provenance over the _entire_ backing slice.
  #[inline(always)]
  #[must_use]
  pub fn as_ptr(&self) -> *const T {
    self.data.as_ptr()
  }

  /// Performs a `deref`, into shared slice form.
  #[inline(always)]
  #[must_use]
  pub fn as_slice(&self) -> &[T] {
    self.deref()
  }

  /// The capacity of the `SliceVec`.
  ///
  /// This the length of the initial backing slice.
  #[inline(always)]
  #[must_use]
  pub fn capacity(&self) -> usize {
    self.data.len()
  }

  /// Truncates the `SliceVec` down to length 0.
  #[inline(always)]
  pub fn clear(&mut self)
  where
    T: Default,
  {
    self.truncate(0)
  }

  /// Creates a draining iterator that removes the specified range in the vector
  /// and yields the removed items.
  ///
  /// ## Panics
  /// * If the start is greater than the end
  /// * If the end is past the edge of the vec.
  ///
  /// ## Example
  /// ```rust
  /// # use tinyvec::*;
  /// let mut arr = [6, 7, 8];
  /// let mut sv = SliceVec::from(&mut arr);
  /// let drained_values: ArrayVec<[i32; 4]> = sv.drain(1..).collect();
  /// assert_eq!(sv.as_slice(), &[6][..]);
  /// assert_eq!(drained_values.as_slice(), &[7, 8][..]);
  ///
  /// sv.drain(..);
  /// assert_eq!(sv.as_slice(), &[] as &[i32]);
  /// ```
  #[inline]
  pub fn drain<'p, R: RangeBounds<usize>>(
    &'p mut self, range: R,
  ) -> SliceVecDrain<'p, 's, T>
  where
    T: Default,
  {
    use core::ops::Bound;
    let start = match range.start_bound() {
      Bound::Included(x) => *x,
      Bound::Excluded(x) => x.saturating_add(1),
      Bound::Unbounded => 0,
    };
    let end = match range.end_bound() {
      Bound::Included(x) => x.saturating_add(1),
      Bound::Excluded(x) => *x,
      Bound::Unbounded => self.len,
    };
    assert!(
      start <= end,
      "SliceVec::drain> Illegal range, {} to {}",
      start,
      end
    );
    assert!(
      end <= self.len,
      "SliceVec::drain> Range ends at {} but length is only {}!",
      end,
      self.len
    );
    SliceVecDrain {
      parent: self,
      target_start: start,
      target_index: start,
      target_end: end,
    }
  }

  #[inline]
  pub fn extend_from_slice(&mut self, sli: &[T])
  where
    T: Clone,
  {
    if sli.is_empty() {
      return;
    }

    let new_len = self.len + sli.len();
    if new_len > self.capacity() {
      panic!(
        "SliceVec::extend_from_slice> total length {} exceeds capacity {}",
        new_len,
        self.capacity()
      )
    }

    let target = &mut self.data[self.len..new_len];
    target.clone_from_slice(sli);
    self.set_len(new_len);
  }

  /// Fill the vector until its capacity has been reached.
  ///
  /// Successively fills unused space in the spare slice of the vector with
  /// elements from the iterator. It then returns the remaining iterator
  /// without exhausting it. This also allows appending the head of an
  /// infinite iterator
```