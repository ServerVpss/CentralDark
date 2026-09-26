# OUTRO - entry.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cfb-0.7.3\src\internal\entry.rs
**SHA:** d3aa99f0407d5a6e
**Timestamp:** 2026-08-28T02:33:22.744295
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: u32,

### Ouro Bruto (primeiros 5000 chars)
```
use crate::internal::{self, consts, DirEntry, ObjType};
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use uuid::Uuid;

// ========================================================================= //

/// Metadata about a single object (storage or stream) in a compound file.
#[derive(Clone)]
pub struct Entry {
    name: String,
    path: PathBuf,
    obj_type: ObjType,
    clsid: Uuid,
    state_bits: u32,
    creation_time: u64,
    modified_time: u64,
    stream_len: u64,
}

impl Entry {
    pub(crate) fn new(dir_entry: &DirEntry, path: PathBuf) -> Entry {
        Entry {
            name: dir_entry.name.clone(),
            path,
            obj_type: dir_entry.obj_type,
            clsid: dir_entry.clsid,
            state_bits: dir_entry.state_bits,
            creation_time: dir_entry.creation_time,
            modified_time: dir_entry.modified_time,
            stream_len: dir_entry.stream_len,
        }
    }

    /// Returns the name of the object that this entry represents.
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Returns the full path to the object that this entry represents.
    pub fn path(&self) -> &Path {
        &self.path
    }

    /// Returns whether this entry is for a stream object (i.e. a "file" within
    /// the compound file).
    pub fn is_stream(&self) -> bool {
        self.obj_type == ObjType::Stream
    }

    /// Returns whether this entry is for a storage object (i.e. a "directory"
    /// within the compound file), either the root or a nested storage.
    pub fn is_storage(&self) -> bool {
        self.obj_type == ObjType::Storage || self.obj_type == ObjType::Root
    }

    /// Returns whether this entry is specifically for the root storage object
    /// of the compound file.
    pub fn is_root(&self) -> bool {
        self.obj_type == ObjType::Root
    }

    /// Returns the size, in bytes, of the stream that this metadata is for.
    pub fn len(&self) -> u64 {
        self.stream_len
    }

    /// Returns true if the stream is empty.
    pub fn is_empty(&self) -> bool {
        self.stream_len == 0
    }

    /// Returns the CLSID (that is, the object class GUID) for this object.
    /// This will always be all zeros for stream objects.
    pub fn clsid(&self) -> &Uuid {
        &self.clsid
    }

    /// Returns the user-defined bitflags set for this object.
    pub fn state_bits(&self) -> u32 {
        self.state_bits
    }

    /// Returns the time when the object that this entry represents was
    /// created.
    pub fn created(&self) -> SystemTime {
        internal::time::system_time_from_timestamp(self.creation_time)
    }

    /// Returns the time when the object that this entry represents was last
    /// modified.
    pub fn modified(&self) -> SystemTime {
        internal::time::system_time_from_timestamp(self.modified_time)
    }
}

// ========================================================================= //

#[derive(Clone, Copy, Eq, PartialEq)]
pub enum EntriesOrder {
    Nonrecursive,
    Preorder,
}

// ========================================================================= //

/// An iterator over the entries in a storage object.
pub struct Entries<'a> {
    order: EntriesOrder,
    directory: &'a [DirEntry],
    stack: Vec<(PathBuf, u32, bool)>,
}

impl<'a> Entries<'a> {
    pub(crate) fn new(
        order: EntriesOrder,
        directory: &'a [DirEntry],
        parent_path: PathBuf,
        start: u32,
    ) -> Entries<'a> {
        let mut entries = Entries { order, directory, stack: Vec::new() };
        match order {
            EntriesOrder::Nonrecursive => {
                entries.stack_left_spine(&parent_path, start);
            }
            EntriesOrder::Preorder => {
                entries.stack.push((parent_path, start, false));
            }
        }
        entries
    }

    fn join_path(parent_path: &Path, dir_entry: &DirEntry) -> PathBuf {
        if dir_entry.obj_type == ObjType::Root {
            parent_path.to_path_buf()
        } else {
            parent_path.join(&dir_entry.name)
        }
    }

    fn stack_left_spine(&mut self, parent_path: &Path, mut current_id: u32) {
        while current_id != consts::NO_STREAM {
            let dir_entry = &self.directory[current_id as usize];
            self.stack.push((parent_path.to_path_buf(), current_id, true));
            current_id = dir_entry.left_sibling;
        }
    }
}

impl<'a> Iterator for Entries<'a> {
    type Item = Entry;

    fn next(&mut self) -> Option<Entry> {
        if let Some((parent, stream_id, visit_siblings)) = self.stack.pop() {
            let dir_entry = &self.directory[stream_id as usize];
            let path = Entries::join_path(&parent, dir_entry);
            if visit_siblings {
                self.stack_left_spine(&parent, dir_entry.right_sibling);
            }
            if self.order == EntriesOrder::Preorder
                && dir_entry.obj_type != ObjType::Stream
                && dir_entry.
```