# OUTRO - buffered_reader.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\quick-xml-0.41.0\src\reader\buffered_reader.rs
**SHA:** ba5f68ebc6a2b7d1
**Timestamp:** 2026-08-28T02:35:01.377979
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = buf.len();
- let start = buf.len();
- let start = buf.len();
- let start = buf.len();
- /// [`BytesStart::to_end()`] method.
- /// let start = BytesStart::new("outer");
- /// [`BytesStart::to_end()`]: crate::events::BytesStart::to_end
- /// let start = BytesStart::new("html");
- let start = buf.len();

### Ouro Bruto (primeiros 5000 chars)
```
//! This is an implementation of [`Reader`] for reading from a [`BufRead`] as
//! underlying byte stream.

use std::fs::File;
use std::io::{self, BufRead, BufReader};
use std::path::Path;

use crate::encoding;
use crate::errors::{Error, Result};
use crate::events::{BytesText, Event};
use crate::name::QName;
use crate::parser::Parser;
use crate::reader::{BangType, ReadRefResult, ReadTextResult, Reader, Span, XmlSource};
use crate::utils::is_whitespace;

macro_rules! impl_buffered_source {
    ($($lf:lifetime, $reader:tt, $async:ident, $await:ident)?) => {
        #[cfg(not(feature = "encoding"))]
        #[inline]
        $($async)? fn remove_utf8_bom(&mut self) -> io::Result<()> {
            loop {
                break match self $(.$reader)? .fill_buf() $(.$await)? {
                    Ok(n) => {
                        if n.starts_with(encoding::UTF8_BOM) {
                            self $(.$reader)? .consume(encoding::UTF8_BOM.len());
                        }
                        Ok(())
                    },
                    Err(ref e) if e.kind() == io::ErrorKind::Interrupted => continue,
                    Err(e) => Err(e),
                };
            }
        }

        #[cfg(feature = "encoding")]
        #[inline]
        $($async)? fn detect_encoding(&mut self) -> io::Result<Option<encoding::DetectedEncoding>> {
            loop {
                break match self $(.$reader)? .fill_buf() $(.$await)? {
                    Ok(n) => if let Some(detected) = encoding::detect_encoding(n) {
                        self $(.$reader)? .consume(detected.bom_len());
                        Ok(Some(detected))
                    } else {
                        Ok(None)
                    },
                    Err(ref e) if e.kind() == io::ErrorKind::Interrupted => continue,
                    Err(e) => Err(e),
                };
            }
        }

        #[inline]
        $($async)? fn read_text $(<$lf>)? (
            &mut self,
            buf: &'b mut Vec<u8>,
            position: &mut u64,
        ) -> ReadTextResult<'b, &'b mut Vec<u8>> {
            let mut read = 0;
            let start = buf.len();
            loop {
                let available = match self $(.$reader)? .fill_buf() $(.$await)? {
                    Ok(n) if n.is_empty() => break,
                    Ok(n) => n,
                    Err(ref e) if e.kind() == io::ErrorKind::Interrupted => continue,
                    Err(e) => {
                        *position += read;
                        return ReadTextResult::Err(e);
                    }
                };

                // Search for start of markup or an entity or character reference
                match memchr::memchr2(b'<', b'&', available) {
                    // Special handling is needed only on the first iteration.
                    // On next iterations we already read something and should emit Text event
                    Some(0) if read == 0 && available[0] == b'<' => return ReadTextResult::Markup(buf),
                    // Do not consume `&` because it may be lone and we would be need to
                    // return it as part of Text event
                    Some(0) if read == 0 => return ReadTextResult::Ref(buf),
                    Some(i) if available[i] == b'<' => {
                        buf.extend_from_slice(&available[..i]);

                        self $(.$reader)? .consume(i);
                        read += i as u64;

                        *position += read;
                        return ReadTextResult::UpToMarkup(&buf[start..]);
                    }
                    Some(i) => {
                        buf.extend_from_slice(&available[..i]);

                        self $(.$reader)? .consume(i);
                        read += i as u64;

                        *position += read;
                        return ReadTextResult::UpToRef(&buf[start..]);
                    }
                    None => {
                        buf.extend_from_slice(available);

                        let used = available.len();
                        self $(.$reader)? .consume(used);
                        read += used as u64;
                    }
                }
            }

            *position += read;
            ReadTextResult::UpToEof(&buf[start..])
        }

        #[inline]
        $($async)? fn read_ref $(<$lf>)? (
            &mut self,
            buf: &'b mut Vec<u8>,
            position: &mut u64,
        ) -> ReadRefResult<'b> {
            let mut read = 0;
            let start = buf.len();
            loop {
                let available = match self $(.$reader)? .fill_buf() $(.$await)? {
                    Ok(n) if n.is_empty() => break,
                    Ok(n) => n,
                    Err(ref e) if e.kind() == io::ErrorKind::Interrupted => continue,
                    Err(e) => {
                        *position += read;
                        return ReadRefResult::Err(e);
           
```