# OUTRO - archive.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\infer-0.19.0\src\matchers\archive.rs
**SHA:** 3b5d942ee4e735ad
**Timestamp:** 2026-08-28T02:34:31.043611
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const ZSTD_SKIP_START: usize = 0x184D2A50;

### Ouro Bruto (primeiros 5000 chars)
```
use core::convert::{TryFrom, TryInto};

/// Returns whether a buffer is an ePub.
pub fn is_epub(buf: &[u8]) -> bool {
    crate::book::is_epub(buf)
}

/// Returns whether a buffer is a zip archive.
pub fn is_zip(buf: &[u8]) -> bool {
    buf.len() > 3
        && buf[0] == 0x50
        && buf[1] == 0x4B
        && (((buf[2] == 0x3 && buf[3] == 0x4)
            || (buf[2] == 0x5 && buf[3] == 0x6)
            || (buf[2] == 0x7 && buf[3] == 0x8))
            || (
                // winzip
                buf.len() > 7
                    && (buf[2] == 0x30
                        && buf[3] == 0x30
                        && buf[4] == 0x50
                        && buf[5] == 0x4B
                        && buf[6] == 0x3
                        && buf[7] == 0x4)
            ))
}

/// Returns whether a buffer is a tar archive.
pub fn is_tar(buf: &[u8]) -> bool {
    buf.len() > 261
        && buf[257] == 0x75
        && buf[258] == 0x73
        && buf[259] == 0x74
        && buf[260] == 0x61
        && buf[261] == 0x72
}

pub fn is_par2(buf: &[u8]) -> bool {
    buf.len() > 8
        && buf[0] == 0x50
        && buf[1] == 0x41
        && buf[2] == 0x52
        && buf[3] == 0x32
        && buf[4] == 0x00
        && buf[5] == 0x50
        && buf[6] == 0x4B
        && buf[7] == 0x54
}

/// Returns whether a buffer is a RAR archive.
pub fn is_rar(buf: &[u8]) -> bool {
    buf.len() > 6
        && buf[0] == 0x52
        && buf[1] == 0x61
        && buf[2] == 0x72
        && buf[3] == 0x21
        && buf[4] == 0x1A
        && buf[5] == 0x7
        && (buf[6] == 0x0 || buf[6] == 0x1)
}

/// Returns whether a buffer is a gzip archive.
pub fn is_gz(buf: &[u8]) -> bool {
    buf.len() > 2 && buf[0] == 0x1F && buf[1] == 0x8B && buf[2] == 0x8
}

/// Returns whether a buffer is a bzip2 archive.
pub fn is_bz2(buf: &[u8]) -> bool {
    buf.len() > 2 && buf[0] == 0x42 && buf[1] == 0x5A && buf[2] == 0x68
}

/// Returns whether a buffer is a bzip3 archive.
pub fn is_bz3(buf: &[u8]) -> bool {
    buf.len() > 4
        && buf[0] == b'B'
        && buf[1] == b'Z'
        && buf[2] == b'3'
        && buf[3] == b'v'
        && buf[4] == b'1'
}

/// Returns whether a buffer is a 7z archive.
pub fn is_7z(buf: &[u8]) -> bool {
    buf.len() > 5
        && buf[0] == 0x37
        && buf[1] == 0x7A
        && buf[2] == 0xBC
        && buf[3] == 0xAF
        && buf[4] == 0x27
        && buf[5] == 0x1C
}

/// Returns whether a buffer is a PDF.
pub fn is_pdf(buf: &[u8]) -> bool {
    buf.len() > 3 && buf[0] == 0x25 && buf[1] == 0x50 && buf[2] == 0x44 && buf[3] == 0x46
}

/// Returns whether a buffer is a SWF.
pub fn is_swf(buf: &[u8]) -> bool {
    buf.len() > 2 && (buf[0] == 0x43 || buf[0] == 0x46) && buf[1] == 0x57 && buf[2] == 0x53
}

/// Returns whether a buffer is an RTF.
pub fn is_rtf(buf: &[u8]) -> bool {
    buf.len() > 4
        && buf[0] == 0x7B
        && buf[1] == 0x5C
        && buf[2] == 0x72
        && buf[3] == 0x74
        && buf[4] == 0x66
}

/// Returns whether a buffer is a Nintendo NES ROM.
pub fn is_nes(buf: &[u8]) -> bool {
    buf.len() > 3 && buf[0] == 0x4E && buf[1] == 0x45 && buf[2] == 0x53 && buf[3] == 0x1A
}

/// Returns whether a buffer is Google Chrome Extension
pub fn is_crx(buf: &[u8]) -> bool {
    buf.len() > 3 && buf[0] == 0x43 && buf[1] == 0x72 && buf[2] == 0x32 && buf[3] == 0x34
}

/// Returns whether a buffer is a CAB.
pub fn is_cab(buf: &[u8]) -> bool {
    buf.len() > 3
        && ((buf[0] == 0x4D && buf[1] == 0x53 && buf[2] == 0x43 && buf[3] == 0x46)
            || (buf[0] == 0x49 && buf[1] == 0x53 && buf[2] == 0x63 && buf[3] == 0x28))
}

/// Returns whether a buffer is a eot octet stream.
pub fn is_eot(buf: &[u8]) -> bool {
    buf.len() > 35
        && buf[34] == 0x4C
        && buf[35] == 0x50
        && ((buf[8] == 0x02 && buf[9] == 0x00 && buf[10] == 0x01)
            || (buf[8] == 0x01 && buf[9] == 0x00 && buf[10] == 0x00)
            || (buf[8] == 0x02 && buf[9] == 0x00 && buf[10] == 0x02))
}

/// Returns whether a buffer is postscript.
pub fn is_ps(buf: &[u8]) -> bool {
    buf.len() > 1 && buf[0] == 0x25 && buf[1] == 0x21
}

/// Returns whether a buffer is xz archive.
pub fn is_xz(buf: &[u8]) -> bool {
    buf.len() > 5
        && buf[0] == 0xFD
        && buf[1] == 0x37
        && buf[2] == 0x7A
        && buf[3] == 0x58
        && buf[4] == 0x5A
        && buf[5] == 0x00
}

/// Returns whether a buffer is a sqlite3 database.
///
/// # Example
///
/// ```rust
/// use std::fs;
/// assert!(infer::archive::is_sqlite(&fs::read("testdata/sample.db").unwrap()));
/// ```
pub fn is_sqlite(buf: &[u8]) -> bool {
    buf.len() > 3 && buf[0] == 0x53 && buf[1] == 0x51 && buf[2] == 0x4C && buf[3] == 0x69
}

/// Returns whether a buffer is a deb archive.
pub fn is_deb(buf: &[u8]) -> bool {
    buf.len() > 20
        && buf[0] == 0x21
        && buf[1] == 0x3C
        && buf[2] == 0x61
        && buf[3] == 0x72
        && buf[4] == 0x63
        && buf[5] == 0x68
        && buf[6] == 0x3E
        && buf[7] == 
```