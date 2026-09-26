# COMANDO - encoder.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\base64-0.22.1\src\write\encoder.rs
**SHA:** c889c853249220fe
**Timestamp:** 2026-08-28T02:32:52.280026
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- /// let delegate = enc.finish().unwrap();
- delegate: Option<W>,
- pub fn new(delegate: W, engine: &'e E) -> EncoderWriter<'e, E, W> {
- delegate: Some(delegate),

### Ouro Bruto (primeiros 5000 chars)
```
use crate::engine::Engine;
use std::{
    cmp, fmt, io,
    io::{ErrorKind, Result},
};

pub(crate) const BUF_SIZE: usize = 1024;
/// The most bytes whose encoding will fit in `BUF_SIZE`
const MAX_INPUT_LEN: usize = BUF_SIZE / 4 * 3;
// 3 bytes of input = 4 bytes of base64, always (because we don't allow line wrapping)
const MIN_ENCODE_CHUNK_SIZE: usize = 3;

/// A `Write` implementation that base64 encodes data before delegating to the wrapped writer.
///
/// Because base64 has special handling for the end of the input data (padding, etc), there's a
/// `finish()` method on this type that encodes any leftover input bytes and adds padding if
/// appropriate. It's called automatically when deallocated (see the `Drop` implementation), but
/// any error that occurs when invoking the underlying writer will be suppressed. If you want to
/// handle such errors, call `finish()` yourself.
///
/// # Examples
///
/// ```
/// use std::io::Write;
/// use base64::engine::general_purpose;
///
/// // use a vec as the simplest possible `Write` -- in real code this is probably a file, etc.
/// let mut enc = base64::write::EncoderWriter::new(Vec::new(), &general_purpose::STANDARD);
///
/// // handle errors as you normally would
/// enc.write_all(b"asdf").unwrap();
///
/// // could leave this out to be called by Drop, if you don't care
/// // about handling errors or getting the delegate writer back
/// let delegate = enc.finish().unwrap();
///
/// // base64 was written to the writer
/// assert_eq!(b"YXNkZg==", &delegate[..]);
///
/// ```
///
/// # Panics
///
/// Calling `write()` (or related methods) or `finish()` after `finish()` has completed without
/// error is invalid and will panic.
///
/// # Errors
///
/// Base64 encoding itself does not generate errors, but errors from the wrapped writer will be
/// returned as per the contract of `Write`.
///
/// # Performance
///
/// It has some minor performance loss compared to encoding slices (a couple percent).
/// It does not do any heap allocation.
///
/// # Limitations
///
/// Owing to the specification of the `write` and `flush` methods on the `Write` trait and their
/// implications for a buffering implementation, these methods may not behave as expected. In
/// particular, calling `write_all` on this interface may fail with `io::ErrorKind::WriteZero`.
/// See the documentation of the `Write` trait implementation for further details.
pub struct EncoderWriter<'e, E: Engine, W: io::Write> {
    engine: &'e E,
    /// Where encoded data is written to. It's an Option as it's None immediately before Drop is
    /// called so that finish() can return the underlying writer. None implies that finish() has
    /// been called successfully.
    delegate: Option<W>,
    /// Holds a partial chunk, if any, after the last `write()`, so that we may then fill the chunk
    /// with the next `write()`, encode it, then proceed with the rest of the input normally.
    extra_input: [u8; MIN_ENCODE_CHUNK_SIZE],
    /// How much of `extra` is occupied, in `[0, MIN_ENCODE_CHUNK_SIZE]`.
    extra_input_occupied_len: usize,
    /// Buffer to encode into. May hold leftover encoded bytes from a previous write call that the underlying writer
    /// did not write last time.
    output: [u8; BUF_SIZE],
    /// How much of `output` is occupied with encoded data that couldn't be written last time
    output_occupied_len: usize,
    /// panic safety: don't write again in destructor if writer panicked while we were writing to it
    panicked: bool,
}

impl<'e, E: Engine, W: io::Write> fmt::Debug for EncoderWriter<'e, E, W> {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(
            f,
            "extra_input: {:?} extra_input_occupied_len:{:?} output[..5]: {:?} output_occupied_len: {:?}",
            self.extra_input,
            self.extra_input_occupied_len,
            &self.output[0..5],
            self.output_occupied_len
        )
    }
}

impl<'e, E: Engine, W: io::Write> EncoderWriter<'e, E, W> {
    /// Create a new encoder that will write to the provided delegate writer.
    pub fn new(delegate: W, engine: &'e E) -> EncoderWriter<'e, E, W> {
        EncoderWriter {
            engine,
            delegate: Some(delegate),
            extra_input: [0u8; MIN_ENCODE_CHUNK_SIZE],
            extra_input_occupied_len: 0,
            output: [0u8; BUF_SIZE],
            output_occupied_len: 0,
            panicked: false,
        }
    }

    /// Encode all remaining buffered data and write it, including any trailing incomplete input
    /// triples and associated padding.
    ///
    /// Once this succeeds, no further writes or calls to this method are allowed.
    ///
    /// This may write to the delegate writer multiple times if the delegate writer does not accept
    /// all input provided to its `write` each invocation.
    ///
    /// If you don't care about error handling, it is not necessary to call this function, as the
    /// equivalent finalization is done b
```