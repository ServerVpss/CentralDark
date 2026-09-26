# OUTRO - tz_data.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\chrono-0.4.45\src\offset\local\tz_data.rs
**SHA:** 4eb1670e13195951
**Timestamp:** 2026-08-28T02:33:27.119113
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- /// TODO: Change this `CStr::from_bytes_until_nul` once MSRV was bumped above 1.72.0

### Ouro Bruto (primeiros 5000 chars)
```
//! Rust parser of ZoneInfoDb(`tzdata`) on Android and OpenHarmony
//!
//! Ported from: https://android.googlesource.com/platform/prebuilts/fullsdk/sources/+/refs/heads/androidx-appcompat-release/android-34/com/android/i18n/timezone/ZoneInfoDb.java
use std::{
    ffi::CStr,
    fmt::Debug,
    fs::File,
    io::{Error, ErrorKind, Read, Result, Seek, SeekFrom},
};

/// Get timezone data from the `tzdata` file of HarmonyOS NEXT.
#[cfg(target_env = "ohos")]
pub(crate) fn for_zone(tz_string: &str) -> Result<Option<Vec<u8>>> {
    let mut file = File::open("/system/etc/zoneinfo/tzdata")?;
    find_tz_data::<OHOS_ENTRY_LEN>(&mut file, tz_string.as_bytes())
}

/// Get timezone data from the `tzdata` file of Android.
#[cfg(target_os = "android")]
pub(crate) fn for_zone(tz_string: &str) -> Result<Option<Vec<u8>>> {
    let mut file = open_android_tz_data_file()?;
    find_tz_data::<ANDROID_ENTRY_LEN>(&mut file, tz_string.as_bytes())
}

/// Open the `tzdata` file of Android from the environment variables.
#[cfg(target_os = "android")]
fn open_android_tz_data_file() -> Result<File> {
    for (env_var, path) in [
        // Default root path: /apex/com.android.tzdata
        ("ANDROID_TZDATA_ROOT", "/etc/tz"),
        // Default root path: /data
        ("ANDROID_DATA", "/misc/zoneinfo/current"),
        // Default root path: /system
        ("ANDROID_ROOT", "/usr/share/zoneinfo"),
    ] {
        if let Ok(env_value) = std::env::var(env_var) {
            if let Ok(file) = File::open(format!("{}{}/tzdata", env_value, path)) {
                return Ok(file);
            }
        }
    }
    Err(Error::from(ErrorKind::NotFound))
}

/// Get timezone data from the `tzdata` file reader
#[cfg(any(test, target_env = "ohos", target_os = "android"))]
fn find_tz_data<const ENTRY_LEN: usize>(
    mut reader: impl Read + Seek,
    tz_name: &[u8],
) -> Result<Option<Vec<u8>>> {
    let header = TzDataHeader::new(&mut reader)?;
    let index = TzDataIndexes::new::<ENTRY_LEN>(&mut reader, &header)?;
    Ok(if let Some(entry) = index.find_timezone(tz_name) {
        Some(index.find_tzdata(reader, &header, entry)?)
    } else {
        None
    })
}

/// Header of the `tzdata` file.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
struct TzDataHeader {
    version: [u8; 5],
    index_offset: u32,
    data_offset: u32,
    zonetab_offset: u32,
}

impl TzDataHeader {
    /// Parse the header of the `tzdata` file.
    fn new(mut data: impl Read) -> Result<Self> {
        let version = {
            let mut magic = [0; TZDATA_VERSION_LEN];
            data.read_exact(&mut magic)?;
            if !magic.starts_with(b"tzdata") || magic[TZDATA_VERSION_LEN - 1] != 0 {
                return Err(Error::new(ErrorKind::Other, "invalid tzdata header magic"));
            }
            let mut version = [0; 5];
            version.copy_from_slice(&magic[6..11]);
            version
        };

        let mut offset = [0; 4];
        data.read_exact(&mut offset)?;
        let index_offset = u32::from_be_bytes(offset);
        data.read_exact(&mut offset)?;
        let data_offset = u32::from_be_bytes(offset);
        data.read_exact(&mut offset)?;
        let zonetab_offset = u32::from_be_bytes(offset);

        Ok(Self { version, index_offset, data_offset, zonetab_offset })
    }
}

/// Indexes of the `tzdata` file.
struct TzDataIndexes {
    indexes: Vec<TzDataIndex>,
}

impl TzDataIndexes {
    /// Create a new `TzDataIndexes` from the `tzdata` file reader.
    fn new<const ENTRY_LEN: usize>(mut reader: impl Read, header: &TzDataHeader) -> Result<Self> {
        let mut buf = vec![0; header.data_offset.saturating_sub(header.index_offset) as usize];
        reader.read_exact(&mut buf)?;
        // replace chunks with array_chunks when it's stable
        Ok(TzDataIndexes {
            indexes: buf
                .chunks(ENTRY_LEN)
                .filter_map(|chunk| {
                    from_bytes_until_nul(&chunk[..TZ_NAME_LEN]).map(|name| {
                        let name = name.to_bytes().to_vec().into_boxed_slice();
                        let offset = u32::from_be_bytes(
                            chunk[TZ_NAME_LEN..TZ_NAME_LEN + 4].try_into().unwrap(),
                        );
                        let length = u32::from_be_bytes(
                            chunk[TZ_NAME_LEN + 4..TZ_NAME_LEN + 8].try_into().unwrap(),
                        );
                        TzDataIndex { name, offset, length }
                    })
                })
                .collect(),
        })
    }

    /// Find a timezone by name.
    fn find_timezone(&self, timezone: &[u8]) -> Option<&TzDataIndex> {
        // timezones in tzdata are sorted by name.
        self.indexes.binary_search_by_key(&timezone, |x| &x.name).map(|x| &self.indexes[x]).ok()
    }

    /// Retrieve a chunk of timezone data by the index.
    fn find_tzdata(
        &self,
        mut reader: impl Read + Seek,
        header: &TzDataHeader,
        index: &TzDataIndex,
   
```