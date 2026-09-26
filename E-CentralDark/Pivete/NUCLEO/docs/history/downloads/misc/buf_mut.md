# OUTRO - buf_mut.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\bytes-1.12.1\src\buf\buf_mut.rs
**SHA:** c76d0a846cf6e2c4
**Timestamp:** 2026-08-28T02:33:10.765916
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = match mem::size_of_val(&n).checked_sub(nbytes) {
- let start = match mem::size_of_val(&n).checked_sub(nbytes) {

### Ouro Bruto (primeiros 5000 chars)
```
use crate::buf::{limit, Chain, Limit, UninitSlice};
#[cfg(feature = "std")]
use crate::buf::{writer, Writer};
use crate::{panic_advance, panic_does_not_fit, TryGetError};

use core::{mem, ptr};

use alloc::{boxed::Box, vec::Vec};

/// A trait for values that provide sequential write access to bytes.
///
/// Write bytes to a buffer
///
/// A buffer stores bytes in memory such that write operations are infallible.
/// The underlying storage may or may not be in contiguous memory. A `BufMut`
/// value is a cursor into the buffer. Writing to `BufMut` advances the cursor
/// position.
///
/// The simplest `BufMut` is a `Vec<u8>`.
///
/// ```
/// use bytes::BufMut;
///
/// let mut buf = vec![];
///
/// buf.put(&b"hello world"[..]);
///
/// assert_eq!(buf, b"hello world");
/// ```
pub unsafe trait BufMut {
    /// Returns the number of bytes that can be written from the current
    /// position until the end of the buffer is reached.
    ///
    /// This value is greater than or equal to the length of the slice returned
    /// by `chunk_mut()`.
    ///
    /// Writing to a `BufMut` may involve allocating more memory on the fly.
    /// Implementations may fail before reaching the number of bytes indicated
    /// by this method if they encounter an allocation failure.
    ///
    /// # Examples
    ///
    /// ```
    /// use bytes::BufMut;
    ///
    /// let mut dst = [0; 10];
    /// let mut buf = &mut dst[..];
    ///
    /// let original_remaining = buf.remaining_mut();
    /// buf.put(&b"hello"[..]);
    ///
    /// assert_eq!(original_remaining - 5, buf.remaining_mut());
    /// ```
    ///
    /// # Implementer notes
    ///
    /// Implementations of `remaining_mut` should ensure that the return value
    /// does not change unless a call is made to `advance_mut` or any other
    /// function that is documented to change the `BufMut`'s current position.
    ///
    /// # Note
    ///
    /// `remaining_mut` may return value smaller than actual available space.
    fn remaining_mut(&self) -> usize;

    /// Advance the internal cursor of the BufMut
    ///
    /// The next call to `chunk_mut` will return a slice starting `cnt` bytes
    /// further into the underlying buffer.
    ///
    /// # Safety
    ///
    /// The caller must ensure that the next `cnt` bytes of `chunk` are
    /// initialized.
    ///
    /// # Examples
    ///
    /// ```
    /// use bytes::BufMut;
    ///
    /// let mut buf = Vec::with_capacity(16);
    ///
    /// // Write some data
    /// buf.chunk_mut()[0..2].copy_from_slice(b"he");
    /// unsafe { buf.advance_mut(2) };
    ///
    /// // write more bytes
    /// buf.chunk_mut()[0..3].copy_from_slice(b"llo");
    ///
    /// unsafe { buf.advance_mut(3); }
    ///
    /// assert_eq!(5, buf.len());
    /// assert_eq!(buf, b"hello");
    /// ```
    ///
    /// # Panics
    ///
    /// This function **may** panic if `cnt > self.remaining_mut()`.
    ///
    /// # Implementer notes
    ///
    /// It is recommended for implementations of `advance_mut` to panic if
    /// `cnt > self.remaining_mut()`. If the implementation does not panic,
    /// the call must behave as if `cnt == self.remaining_mut()`.
    ///
    /// A call with `cnt == 0` should never panic and be a no-op.
    unsafe fn advance_mut(&mut self, cnt: usize);

    /// Returns true if there is space in `self` for more bytes.
    ///
    /// This is equivalent to `self.remaining_mut() != 0`.
    ///
    /// # Examples
    ///
    /// ```
    /// use bytes::BufMut;
    ///
    /// let mut dst = [0; 5];
    /// let mut buf = &mut dst[..];
    ///
    /// assert!(buf.has_remaining_mut());
    ///
    /// buf.put(&b"hello"[..]);
    ///
    /// assert!(!buf.has_remaining_mut());
    /// ```
    #[inline]
    fn has_remaining_mut(&self) -> bool {
        self.remaining_mut() > 0
    }

    /// Returns a mutable slice starting at the current BufMut position and of
    /// length between 0 and `BufMut::remaining_mut()`. Note that this *can* be shorter than the
    /// whole remainder of the buffer (this allows non-continuous implementation).
    ///
    /// This is a lower level function. Most operations are done with other
    /// functions.
    ///
    /// The returned byte slice may represent uninitialized memory.
    ///
    /// # Examples
    ///
    /// ```
    /// use bytes::BufMut;
    ///
    /// let mut buf = Vec::with_capacity(16);
    ///
    /// unsafe {
    ///     // MaybeUninit::as_mut_ptr
    ///     buf.chunk_mut()[0..].as_mut_ptr().write(b'h');
    ///     buf.chunk_mut()[1..].as_mut_ptr().write(b'e');
    ///
    ///     buf.advance_mut(2);
    ///
    ///     buf.chunk_mut()[0..].as_mut_ptr().write(b'l');
    ///     buf.chunk_mut()[1..].as_mut_ptr().write(b'l');
    ///     buf.chunk_mut()[2..].as_mut_ptr().write(b'o');
    ///
    ///     buf.advance_mut(3);
    /// }
    ///
    /// assert_eq!(5, buf.len());
    /// assert_eq!(buf, b"hello");
    /// ```
    ///
    /// # Implementer notes
    ///
 
```