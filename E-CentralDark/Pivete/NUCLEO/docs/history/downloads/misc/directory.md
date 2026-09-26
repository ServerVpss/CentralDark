# OUTRO - directory.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cfb-0.7.3\src\internal\directory.rs
**SHA:** 332d05b54e3a6ebe
**Timestamp:** 2026-08-28T02:33:22.726706
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = self.root_dir_entry().child;
- let start = {

### Gaps
- // TODO: rebalance tree
- // TODO: recolor nodes
- // TODO: Truncate directory chain if last directory sector is now all

### Ouro Bruto (primeiros 5000 chars)
```
use crate::internal::{
    self, consts, Allocator, Chain, DirEntry, Entries, EntriesOrder, ObjType,
    Sector, SectorInit, Version,
};
use byteorder::{LittleEndian, WriteBytesExt};
use fnv::FnvHashSet;
use std::cmp::Ordering;
use std::io::{self, Seek, SeekFrom, Write};
use std::path::Path;

//===========================================================================//

macro_rules! malformed {
    ($e:expr) => { invalid_data!("Malformed directory ({})", $e) };
    ($fmt:expr, $($arg:tt)+) => {
        invalid_data!("Malformed directory ({})", format!($fmt, $($arg)+))
    };
}

//===========================================================================//

/// A wrapper around the sector allocator that additionally provides management
/// of the CFB directory chain.
pub struct Directory<F> {
    allocator: Allocator<F>,
    dir_entries: Vec<DirEntry>,
    dir_start_sector: u32,
}

impl<F> Directory<F> {
    pub fn new(
        allocator: Allocator<F>,
        dir_entries: Vec<DirEntry>,
        dir_start_sector: u32,
    ) -> io::Result<Directory<F>> {
        let directory = Directory { allocator, dir_entries, dir_start_sector };
        directory.validate()?;
        Ok(directory)
    }

    pub fn version(&self) -> Version {
        self.allocator.version()
    }

    pub fn sector_len(&self) -> usize {
        self.allocator.sector_len()
    }

    pub fn into_inner(self) -> F {
        self.allocator.into_inner()
    }

    pub fn stream_id_for_name_chain(&self, names: &[&str]) -> Option<u32> {
        let mut stream_id = consts::ROOT_STREAM_ID;
        for name in names.iter() {
            stream_id = self.dir_entry(stream_id).child;
            loop {
                if stream_id == consts::NO_STREAM {
                    return None;
                }
                let dir_entry = self.dir_entry(stream_id);
                match internal::path::compare_names(name, &dir_entry.name) {
                    Ordering::Equal => break,
                    Ordering::Less => stream_id = dir_entry.left_sibling,
                    Ordering::Greater => stream_id = dir_entry.right_sibling,
                }
            }
        }
        Some(stream_id)
    }

    /// Returns an iterator over the entries within the root storage object.
    pub fn root_storage_entries(&self) -> Entries {
        let start = self.root_dir_entry().child;
        Entries::new(
            EntriesOrder::Nonrecursive,
            &self.dir_entries,
            internal::path::path_from_name_chain(&[]),
            start,
        )
    }

    /// Returns an iterator over the entries within a storage object.
    pub fn storage_entries(&self, path: &Path) -> io::Result<Entries> {
        let names = internal::path::name_chain_from_path(path)?;
        let path = internal::path::path_from_name_chain(&names);
        let stream_id = match self.stream_id_for_name_chain(&names) {
            Some(stream_id) => stream_id,
            None => not_found!("No such storage: {:?}", path),
        };
        let start = {
            let dir_entry = self.dir_entry(stream_id);
            if dir_entry.obj_type == ObjType::Stream {
                invalid_input!("Not a storage: {:?}", path);
            }
            debug_assert!(
                dir_entry.obj_type == ObjType::Storage
                    || dir_entry.obj_type == ObjType::Root
            );
            dir_entry.child
        };
        Ok(Entries::new(
            EntriesOrder::Nonrecursive,
            &self.dir_entries,
            path,
            start,
        ))
    }

    /// Returns an iterator over all entries within the compound file, starting
    /// from and including the root entry.  The iterator walks the storage tree
    /// in a preorder traversal.
    pub fn walk(&self) -> Entries {
        Entries::new(
            EntriesOrder::Preorder,
            &self.dir_entries,
            internal::path::path_from_name_chain(&[]),
            consts::ROOT_STREAM_ID,
        )
    }

    /// Returns an iterator over all entries under a storage subtree, including
    /// the given path itself.  The iterator walks the storage tree in a
    /// preorder traversal.
    pub fn walk_storage(&self, path: &Path) -> io::Result<Entries> {
        let mut names = internal::path::name_chain_from_path(path)?;
        let stream_id = match self.stream_id_for_name_chain(&names) {
            Some(stream_id) => stream_id,
            None => {
                not_found!(
                    "No such object: {:?}",
                    internal::path::path_from_name_chain(&names)
                );
            }
        };
        names.pop();
        let parent_path = internal::path::path_from_name_chain(&names);
        Ok(Entries::new(
            EntriesOrder::Preorder,
            &self.dir_entries,
            parent_path,
            stream_id,
        ))
    }

    pub fn open_chain(
        &mut self,
        start_sector_id: u32,
        init: SectorInit,
    ) -> io::Resu
```