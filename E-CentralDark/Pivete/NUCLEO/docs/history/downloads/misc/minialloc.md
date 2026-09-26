# OUTRO - minialloc.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cfb-0.7.3\src\internal\minialloc.rs
**SHA:** 243cecc017f42334
**Timestamp:** 2026-08-28T02:33:22.924337
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = self.minifat_start_sector;

### Gaps
- // TODO: Truncate MiniFAT if last MiniFAT sector is now all free.

### Ouro Bruto (primeiros 5000 chars)
```
use crate::internal::{
    consts, Chain, DirEntry, Directory, Entries, MiniChain, ObjType, Sector,
    SectorInit, Version,
};
use byteorder::{LittleEndian, WriteBytesExt};
use fnv::FnvHashSet;
use std::io::{self, Seek, SeekFrom, Write};
use std::mem::size_of;
use std::path::Path;

//===========================================================================//

macro_rules! malformed {
    ($e:expr) => { invalid_data!("Malformed MiniFAT ({})", $e) };
    ($fmt:expr, $($arg:tt)+) => {
        invalid_data!("Malformed MiniFAT ({})", format!($fmt, $($arg)+))
    };
}

//===========================================================================//

/// A wrapper around the directory manager that additionally provides
/// mini-sector allocation via the MiniFAT.
pub struct MiniAllocator<F> {
    directory: Directory<F>,
    minifat: Vec<u32>,
    minifat_start_sector: u32,
}

impl<F> MiniAllocator<F> {
    pub fn new(
        directory: Directory<F>,
        minifat: Vec<u32>,
        minifat_start_sector: u32,
    ) -> io::Result<MiniAllocator<F>> {
        let minialloc =
            MiniAllocator { directory, minifat, minifat_start_sector };
        minialloc.validate()?;
        Ok(minialloc)
    }

    pub fn version(&self) -> Version {
        self.directory.version()
    }

    pub fn next_mini_sector(&self, sector_id: u32) -> io::Result<u32> {
        let index = sector_id as usize;
        if index >= self.minifat.len() {
            invalid_data!(
                "Found reference to mini sector {}, but MiniFAT has only {} \
                 entries",
                index,
                self.minifat.len()
            );
        }
        let next_id = self.minifat[index];
        if next_id != consts::END_OF_CHAIN
            && (next_id > consts::MAX_REGULAR_SECTOR
                || next_id as usize >= self.minifat.len())
        {
            invalid_data!("next_id ({}) is invalid", next_id);
        }
        Ok(next_id)
    }

    pub fn into_inner(self) -> F {
        self.directory.into_inner()
    }

    pub fn stream_id_for_name_chain(&self, names: &[&str]) -> Option<u32> {
        self.directory.stream_id_for_name_chain(names)
    }

    /// Returns an iterator over the entries within the root storage object.
    pub fn root_storage_entries(&self) -> Entries {
        self.directory.root_storage_entries()
    }

    /// Returns an iterator over the entries within a storage object.
    pub fn storage_entries(&self, path: &Path) -> io::Result<Entries> {
        self.directory.storage_entries(path)
    }

    /// Returns an iterator over all entries within the compound file, starting
    /// from and including the root entry.  The iterator walks the storage tree
    /// in a preorder traversal.
    pub fn walk(&self) -> Entries {
        self.directory.walk()
    }

    /// Returns an iterator over all entries under a storage subtree, including
    /// the given path itself.  The iterator walks the storage tree in a
    /// preorder traversal.
    pub fn walk_storage(&self, path: &Path) -> io::Result<Entries> {
        self.directory.walk_storage(path)
    }

    pub fn open_chain(
        &mut self,
        start_sector_id: u32,
        init: SectorInit,
    ) -> io::Result<Chain<F>> {
        self.directory.open_chain(start_sector_id, init)
    }

    pub fn open_mini_chain(
        &mut self,
        start_sector_id: u32,
    ) -> io::Result<MiniChain<F>> {
        MiniChain::new(self, start_sector_id)
    }

    pub fn root_dir_entry(&self) -> &DirEntry {
        self.directory.root_dir_entry()
    }

    pub fn dir_entry(&self, stream_id: u32) -> &DirEntry {
        self.directory.dir_entry(stream_id)
    }

    fn validate(&self) -> io::Result<()> {
        let root_entry = self.directory.root_dir_entry();
        let root_stream_mini_sectors =
            root_entry.stream_len / (consts::MINI_SECTOR_LEN as u64);
        if root_stream_mini_sectors < (self.minifat.len() as u64) {
            malformed!(
                "MiniFAT has {} entries, but root stream has only {} mini \
                 sectors",
                self.minifat.len(),
                root_stream_mini_sectors
            );
        }
        let mut pointees = FnvHashSet::default();
        for (from_mini_sector, &to_mini_sector) in
            self.minifat.iter().enumerate()
        {
            if to_mini_sector <= consts::MAX_REGULAR_SECTOR {
                if to_mini_sector as usize >= self.minifat.len() {
                    malformed!(
                        "MiniFAT has {} entries, but mini sector {} points to \
                         {}",
                        self.minifat.len(),
                        from_mini_sector,
                        to_mini_sector
                    );
                }
                if pointees.contains(&to_mini_sector) {
                    malformed!(
                        "mini sector {} pointed to twice",
                        to_mini_sector
                    
```