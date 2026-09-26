# OUTRO - chain.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cfb-0.7.3\src\internal\chain.rs
**SHA:** 17aee27163526950
**Timestamp:** 2026-08-28T02:33:22.520510
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- offset_from_start: u64,
- Ok(Chain { allocator, init, sector_ids, offset_from_start: 0 })
- self.offset_from_start = new_offset as u64;
- if self.offset_from_start == total_len {

### Gaps
- // TODO: init remainder of final sector

### Ouro Bruto (primeiros 5000 chars)
```
use crate::internal::{consts, Allocator, Sector, SectorInit};
use std::cmp;
use std::io::{self, Read, Seek, SeekFrom, Write};

//===========================================================================//

pub struct Chain<'a, F: 'a> {
    allocator: &'a mut Allocator<F>,
    init: SectorInit,
    sector_ids: Vec<u32>,
    offset_from_start: u64,
}

impl<'a, F> Chain<'a, F> {
    pub fn new(
        allocator: &'a mut Allocator<F>,
        start_sector_id: u32,
        init: SectorInit,
    ) -> io::Result<Chain<'a, F>> {
        let mut sector_ids = Vec::<u32>::new();
        let mut current_sector_id = start_sector_id;
        let first_sector_id = start_sector_id;
        while current_sector_id != consts::END_OF_CHAIN {
            sector_ids.push(current_sector_id);
            current_sector_id = allocator.next(current_sector_id)?;
            if current_sector_id == first_sector_id {
                invalid_data!(
                    "Chain contained duplicate sector id {}",
                    current_sector_id
                );
            }
        }
        Ok(Chain { allocator, init, sector_ids, offset_from_start: 0 })
    }

    pub fn start_sector_id(&self) -> u32 {
        self.sector_ids.first().copied().unwrap_or(consts::END_OF_CHAIN)
    }

    pub fn num_sectors(&self) -> usize {
        self.sector_ids.len()
    }

    pub fn len(&self) -> u64 {
        (self.allocator.sector_len() as u64) * (self.sector_ids.len() as u64)
    }
}

impl<'a, F: Seek> Chain<'a, F> {
    pub fn into_subsector(
        self,
        subsector_index: u32,
        subsector_len: usize,
        offset_within_subsector: u64,
    ) -> io::Result<Sector<'a, F>> {
        debug_assert!(offset_within_subsector <= subsector_len as u64);
        debug_assert_eq!(self.allocator.sector_len() % subsector_len, 0);
        let subsectors_per_sector =
            self.allocator.sector_len() / subsector_len;
        let sector_index_within_chain =
            subsector_index as usize / subsectors_per_sector;
        let subsector_index_within_sector =
            subsector_index % (subsectors_per_sector as u32);
        let sector_id = *self
            .sector_ids
            .get(sector_index_within_chain)
            .ok_or_else(|| {
                io::Error::new(io::ErrorKind::InvalidData, "invalid sector id")
            })?;
        self.allocator.seek_within_subsector(
            sector_id,
            subsector_index_within_sector,
            subsector_len,
            offset_within_subsector,
        )
    }
}

impl<'a, F: Write + Seek> Chain<'a, F> {
    /// Resizes the chain to the minimum number of sectors large enough to old
    /// `new_len` bytes, allocating or freeing sectors as needed.
    pub fn set_len(&mut self, new_len: u64) -> io::Result<()> {
        let sector_len = self.allocator.sector_len() as u64;
        let new_num_sectors =
            ((sector_len + new_len - 1) / sector_len) as usize;
        if new_num_sectors == 0 {
            if let Some(&start_sector) = self.sector_ids.first() {
                self.allocator.free_chain(start_sector)?;
            }
        } else if new_num_sectors <= self.sector_ids.len() {
            if new_num_sectors < self.sector_ids.len() {
                self.allocator
                    .free_chain_after(self.sector_ids[new_num_sectors - 1])?;
            }
            // TODO: init remainder of final sector
        } else {
            for _ in self.sector_ids.len()..new_num_sectors {
                let new_sector_id = if let Some(&last_sector_id) =
                    self.sector_ids.last()
                {
                    self.allocator.extend_chain(last_sector_id, self.init)?
                } else {
                    self.allocator.begin_chain(self.init)?
                };
                self.sector_ids.push(new_sector_id);
            }
        }
        Ok(())
    }

    pub fn free(self) -> io::Result<()> {
        self.allocator.free_chain(self.start_sector_id())
    }
}

impl<'a, F> Seek for Chain<'a, F> {
    fn seek(&mut self, pos: SeekFrom) -> io::Result<u64> {
        let length = self.len();
        let new_offset = match pos {
            SeekFrom::Start(delta) => delta as i64,
            SeekFrom::End(delta) => delta + length as i64,
            SeekFrom::Current(delta) => delta + self.offset_from_start as i64,
        };
        if new_offset < 0 || (new_offset as u64) > length {
            invalid_input!(
                "Cannot seek to {}, chain length is {} bytes",
                new_offset,
                length
            );
        }
        self.offset_from_start = new_offset as u64;
        Ok(self.offset_from_start)
    }
}

impl<'a, F: Read + Seek> Read for Chain<'a, F> {
    fn read(&mut self, buf: &mut [u8]) -> io::Result<usize> {
        let total_len = self.len();
        debug_assert!(self.offset_from_start <= total_len);
        let remaining_in_chain = total_len - self.offset_from_start;
        let max_l
```