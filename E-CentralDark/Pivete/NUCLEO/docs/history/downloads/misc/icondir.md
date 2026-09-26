# OUTRO - icondir.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\ico-0.5.0\src\icondir.rs
**SHA:** c07f5cb08814da10
**Timestamp:** 2026-08-28T02:34:17.677960
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Also update entry's bits-per-pixel.

### Ouro Bruto (primeiros 5000 chars)
```
use crate::image::{IconImage, ImageStats};
use crate::restype::ResourceType;
use byteorder::{LittleEndian, ReadBytesExt, WriteBytesExt};
#[cfg(feature = "serde")]
use serde::{Deserialize, Serialize};
use std::io::{self, Read, Seek, SeekFrom, Write};

//===========================================================================//

// The signature that all PNG files start with.
const PNG_SIGNATURE: &[u8] = &[0x89, b'P', b'N', b'G'];

//===========================================================================//

/// A collection of images; the contents of a single ICO or CUR file.
#[derive(Clone, Debug)]
#[cfg_attr(feature = "serde", derive(Deserialize, Serialize))]
pub struct IconDir {
    restype: ResourceType,
    entries: Vec<IconDirEntry>,
}

impl IconDir {
    /// Creates a new, empty collection of icons/cursors.
    pub fn new(resource_type: ResourceType) -> IconDir {
        IconDir { restype: resource_type, entries: Vec::new() }
    }

    /// Returns the type of resource stored in this collection, either icons or
    /// cursors.
    pub fn resource_type(&self) -> ResourceType {
        self.restype
    }

    /// Returns the entries in this collection.
    pub fn entries(&self) -> &[IconDirEntry] {
        &self.entries
    }

    /// Adds an entry to the collection.  Panics if `self.resource_type() !=
    /// entry.resource_type()`.
    pub fn add_entry(&mut self, entry: IconDirEntry) {
        if self.resource_type() != entry.resource_type() {
            panic!(
                "Can't add {:?} IconDirEntry to {:?} IconDir",
                entry.resource_type(),
                self.resource_type()
            );
        }
        self.entries.push(entry);
    }

    /// Reads an ICO or CUR file into memory.
    pub fn read<R: Read + Seek>(mut reader: R) -> io::Result<IconDir> {
        let reserved = reader.read_u16::<LittleEndian>()?;
        if reserved != 0 {
            invalid_data!(
                "Invalid reserved field value in ICONDIR \
                 (was {}, but must be 0)",
                reserved
            );
        }
        let restype = reader.read_u16::<LittleEndian>()?;
        let restype = match ResourceType::from_number(restype) {
            Some(restype) => restype,
            None => invalid_data!("Invalid resource type ({})", restype),
        };
        let num_entries = reader.read_u16::<LittleEndian>()? as usize;
        let mut entries = Vec::<IconDirEntry>::with_capacity(num_entries);
        let mut spans = Vec::<(u32, u32)>::with_capacity(num_entries);
        for _ in 0..num_entries {
            let width_byte = reader.read_u8()?;
            let height_byte = reader.read_u8()?;
            let num_colors = reader.read_u8()?;
            let reserved = reader.read_u8()?;
            if reserved != 0 {
                invalid_data!(
                    "Invalid reserved field value in ICONDIRENTRY \
                     (was {}, but must be 0)",
                    reserved
                );
            }
            let color_planes = reader.read_u16::<LittleEndian>()?;
            let bits_per_pixel = reader.read_u16::<LittleEndian>()?;
            let data_size = reader.read_u32::<LittleEndian>()?;
            let data_offset = reader.read_u32::<LittleEndian>()?;
            // The ICONDIRENTRY struct uses only one byte each for width and
            // height.  In older versions of Windows, a byte of zero indicated
            // a size of exactly 256, but since Windows Vista a byte of zero is
            // used for any size >= 256, with the actual size coming from the
            // BMP or PNG data.
            //
            // We initialize the IconDirEntry's width/height fields based on
            // these bytes, treating 0 as 256.  Later on we will replace these
            // values with the actual width/height from the image data;
            // however, in the event that the image data turns out to be
            // malformed, we will use these initial guesses for the image
            // metadata, so that the user can still parse the rest of the ICO
            // file and at least see what size this image was intended to be.
            let width = if width_byte == 0 { 256 } else { width_byte as u32 };
            let height =
                if height_byte == 0 { 256 } else { height_byte as u32 };
            spans.push((data_offset, data_size));
            let entry = IconDirEntry {
                restype,
                width,
                height,
                num_colors,
                color_planes,
                bits_per_pixel,
                data: Vec::new(),
            };
            entries.push(entry);
        }
        for (index, &(data_offset, data_size)) in spans.iter().enumerate() {
            reader.seek(SeekFrom::Start(data_offset as u64))?;
            let mut data = vec![0u8; data_size as usize];
            reader.read_exact(&mut data)?;
            entries[index].data = data;
        }
        // Upda
```