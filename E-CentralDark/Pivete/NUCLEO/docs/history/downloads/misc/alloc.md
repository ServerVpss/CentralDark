# OUTRO - alloc.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cfb-0.7.3\src\internal\alloc.rs
**SHA:** ceb23a7ebf709da4
**Timestamp:** 2026-08-28T02:33:22.515985
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let subsector_start =

### Gaps
- // TODO: Truncate FAT if last FAT sector is now all free.

### Ouro Bruto (primeiros 5000 chars)
```
use crate::internal::{consts, Chain, Sector, SectorInit, Sectors, Version};
use byteorder::{LittleEndian, WriteBytesExt};
use fnv::FnvHashSet;
use std::io::{self, Seek, Write};
use std::mem::size_of;

//===========================================================================//

macro_rules! malformed {
    ($e:expr) => { invalid_data!("Malformed FAT ({})", $e) };
    ($fmt:expr, $($arg:tt)+) => {
        invalid_data!("Malformed FAT ({})", format!($fmt, $($arg)+))
    };
}

//===========================================================================//

/// A wrapper around the sectors of a compound file, providing sector
/// allocation via the FAT and DIFAT.
pub struct Allocator<F> {
    sectors: Sectors<F>,
    difat_sector_ids: Vec<u32>,
    difat: Vec<u32>,
    fat: Vec<u32>,
}

impl<F> Allocator<F> {
    pub fn new(
        sectors: Sectors<F>,
        difat_sector_ids: Vec<u32>,
        difat: Vec<u32>,
        fat: Vec<u32>,
    ) -> io::Result<Allocator<F>> {
        let alloc = Allocator { sectors, difat_sector_ids, difat, fat };
        alloc.validate()?;
        Ok(alloc)
    }

    pub fn version(&self) -> Version {
        self.sectors.version()
    }

    pub fn sector_len(&self) -> usize {
        self.sectors.sector_len()
    }

    pub fn next(&self, sector_id: u32) -> io::Result<u32> {
        let index = sector_id as usize;
        if index >= self.fat.len() {
            invalid_data!(
                "Found reference to sector {}, but FAT has only {} entries",
                index,
                self.fat.len()
            );
        }
        let next_id = self.fat[index];
        if next_id != consts::END_OF_CHAIN
            && (next_id > consts::MAX_REGULAR_SECTOR
                || next_id as usize >= self.fat.len())
        {
            invalid_data!("next_id ({}) is invalid", next_id);
        }
        Ok(next_id)
    }

    pub fn into_inner(self) -> F {
        self.sectors.into_inner()
    }

    pub fn open_chain(
        &mut self,
        start_sector_id: u32,
        init: SectorInit,
    ) -> io::Result<Chain<F>> {
        Chain::new(self, start_sector_id, init)
    }

    fn validate(&self) -> io::Result<()> {
        if self.fat.len() > self.sectors.num_sectors() as usize {
            malformed!(
                "FAT has {} entries, but file has only {} sectors",
                self.fat.len(),
                self.sectors.num_sectors()
            );
        }
        for &difat_sector in self.difat_sector_ids.iter() {
            if difat_sector as usize >= self.fat.len() {
                malformed!(
                    "FAT has {} entries, but DIFAT lists {} as a DIFAT sector",
                    self.fat.len(),
                    difat_sector
                );
            }
            if self.fat[difat_sector as usize] != consts::DIFAT_SECTOR {
                malformed!(
                    "DIFAT sector {} is not marked as such in the FAT",
                    difat_sector
                );
            }
        }
        for &fat_sector in self.difat.iter() {
            if fat_sector as usize >= self.fat.len() {
                malformed!(
                    "FAT has {} entries, but DIFAT lists {} as a FAT sector",
                    self.fat.len(),
                    fat_sector
                );
            }
            if self.fat[fat_sector as usize] != consts::FAT_SECTOR {
                malformed!(
                    "FAT sector {} is not marked as such in the FAT",
                    fat_sector
                );
            }
        }
        let mut pointees = FnvHashSet::default();
        for (from_sector, &to_sector) in self.fat.iter().enumerate() {
            if to_sector <= consts::MAX_REGULAR_SECTOR {
                if to_sector as usize >= self.fat.len() {
                    malformed!(
                        "FAT has {} entries, but sector {} points to {}",
                        self.fat.len(),
                        from_sector,
                        to_sector
                    );
                }
                if pointees.contains(&to_sector) {
                    malformed!("sector {} pointed to twice", to_sector);
                }
                pointees.insert(to_sector);
            } else if to_sector == consts::INVALID_SECTOR {
                malformed!("0x{:08X} is not a valid FAT entry", to_sector);
            }
        }
        Ok(())
    }
}

impl<F: Seek> Allocator<F> {
    pub fn seek_within_header(
        &mut self,
        offset_within_header: u64,
    ) -> io::Result<Sector<F>> {
        self.sectors.seek_within_header(offset_within_header)
    }

    pub fn seek_to_sector(&mut self, sector_id: u32) -> io::Result<Sector<F>> {
        self.sectors.seek_to_sector(sector_id)
    }

    pub fn seek_within_sector(
        &mut self,
        sector_id: u32,
        offset_within_sector: u64,
    ) -> io::Result<Sector<F>> {
        self.sectors.seek_within_sector(sector_id, offset_within_sect
```