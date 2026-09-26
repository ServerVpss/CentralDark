# OUTRO - sector.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cfb-0.7.3\src\internal\sector.rs
**SHA:** 1637d12777c8f23a
**Timestamp:** 2026-08-28T02:33:22.976287
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub fn subsector(self, start: usize, len: usize) -> Sector<'a, F> {

### Ouro Bruto (primeiros 5000 chars)
```
use crate::internal::{consts, DirEntry, Version};
use byteorder::{LittleEndian, WriteBytesExt};
use std::cmp;
use std::io::{self, Read, Seek, SeekFrom, Write};

// ========================================================================= //

/// A wrapper around the underlying file of a CompoundFile struct, providing
/// access to individual sectors of the file.
pub struct Sectors<F> {
    inner: F,
    version: Version,
    num_sectors: u32,
}

impl<F> Sectors<F> {
    pub fn new(version: Version, inner_len: u64, inner: F) -> Sectors<F> {
        let sector_len = version.sector_len() as u64;
        debug_assert!(inner_len >= sector_len);
        let num_sectors =
            ((inner_len + sector_len - 1) / sector_len) as u32 - 1;
        Sectors { inner, version, num_sectors }
    }

    pub fn version(&self) -> Version {
        self.version
    }

    pub fn sector_len(&self) -> usize {
        self.version.sector_len()
    }

    pub fn num_sectors(&self) -> u32 {
        self.num_sectors
    }

    pub fn into_inner(self) -> F {
        self.inner
    }
}

impl<F: Seek> Sectors<F> {
    pub fn seek_within_header(
        &mut self,
        offset_within_header: u64,
    ) -> io::Result<Sector<F>> {
        debug_assert!(offset_within_header < consts::HEADER_LEN as u64);
        self.inner.seek(SeekFrom::Start(offset_within_header))?;
        Ok(Sector {
            inner: &mut self.inner,
            sector_len: consts::HEADER_LEN,
            offset_within_sector: offset_within_header as usize,
        })
    }

    pub fn seek_to_sector(&mut self, sector_id: u32) -> io::Result<Sector<F>> {
        self.seek_within_sector(sector_id, 0)
    }

    pub fn seek_within_sector(
        &mut self,
        sector_id: u32,
        offset_within_sector: u64,
    ) -> io::Result<Sector<F>> {
        debug_assert!(offset_within_sector <= self.sector_len() as u64);
        if sector_id >= self.num_sectors {
            invalid_data!(
                "Tried to seek to sector {}, but sector count is only {}",
                sector_id,
                self.num_sectors
            );
        }
        let sector_len = self.sector_len();
        self.inner.seek(SeekFrom::Start(
            (sector_id + 1) as u64 * sector_len as u64 + offset_within_sector,
        ))?;
        Ok(Sector {
            inner: &mut self.inner,
            sector_len,
            offset_within_sector: offset_within_sector as usize,
        })
    }
}

impl<F: Write + Seek> Sectors<F> {
    /// Creates or resets the specified sector using the given initializer.
    pub fn init_sector(
        &mut self,
        sector_id: u32,
        init: SectorInit,
    ) -> io::Result<()> {
        match sector_id.cmp(&self.num_sectors) {
            cmp::Ordering::Greater => invalid_data!(
                "Tried to initialize sector {}, but sector count is only {}",
                sector_id,
                self.num_sectors
            ),
            cmp::Ordering::Less => {}
            cmp::Ordering::Equal => self.num_sectors += 1,
        }
        let mut sector = self.seek_to_sector(sector_id)?;
        init.initialize(&mut sector)?;
        Ok(())
    }

    /// Flushes all changes to the underlying file.
    pub fn flush(&mut self) -> io::Result<()> {
        self.inner.flush()
    }
}

// ========================================================================= //

/// A wrapper around a single sector or mini sector within a CFB file, allowing
/// read and write access only within that sector.
pub struct Sector<'a, F: 'a> {
    inner: &'a mut F,
    sector_len: usize,
    offset_within_sector: usize,
}

impl<'a, F> Sector<'a, F> {
    /// Returns the total length of this sector.
    pub fn len(&self) -> usize {
        self.sector_len
    }

    fn remaining(&self) -> usize {
        debug_assert!(self.offset_within_sector <= self.len());
        self.len() - self.offset_within_sector
    }

    pub fn subsector(self, start: usize, len: usize) -> Sector<'a, F> {
        debug_assert!(self.offset_within_sector <= self.len());
        debug_assert!(start <= self.offset_within_sector);
        debug_assert!(start + len >= self.offset_within_sector);
        debug_assert!(start + len <= self.len());
        Sector {
            inner: self.inner,
            sector_len: len,
            offset_within_sector: self.offset_within_sector - start,
        }
    }
}

impl<'a, F: Read> Read for Sector<'a, F> {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        let max_len = cmp::min(buf.len(), self.remaining());
        if max_len == 0 {
            return Ok(0);
        }
        let bytes_read = self.inner.read(&mut buf[0..max_len])?;
        self.offset_within_sector += bytes_read;
        debug_assert!(self.offset_within_sector <= self.len());
        Ok(bytes_read)
    }
}

impl<'a, F: Write> Write for Sector<'a, F> {
    fn write(&mut self, buf: &[u8]) -> io::Result<usize> {
        let max_len = cmp::min(buf.len(), self.remain
```