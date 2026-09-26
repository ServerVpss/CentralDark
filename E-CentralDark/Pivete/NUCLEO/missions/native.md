# MISSAO - native.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\libc-0.2.189\src\unix\haiku\native.rs
**SHA:** 93993d4cd065550b
**Timestamp:** 2026-08-28T02:34:42.426763
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub const B_DEV_DATA_OVERRUN: status_t = B_DEVICE_ERROR_BASE + 24;
- pub const B_DEV_DATA_UNDERRUN: status_t = B_DEVICE_ERROR_BASE + 25;
- pub const B_DEV_FIFO_OVERRUN: status_t = B_DEVICE_ERROR_BASE + 26;
- pub const B_DEV_FIFO_UNDERRUN: status_t = B_DEVICE_ERROR_BASE + 27;

### Ouro Bruto (primeiros 5000 chars)
```
use crate::off_t;
use crate::prelude::*;

// This file follows the Haiku API for Haiku R1 beta 5. It is organized by the
// C/C++ header files in which the concepts can be found, while adhering to the
// style guide for this crate.

// Helper macro to generate u32 constants. The Haiku API uses (non-standard)
// multi-character constants (like 'UPDA' or 'MSGM') to represent 32 bit
// integer constants.

macro_rules! haiku_constant {
    ($a:tt, $b:tt, $c:tt, $d:tt) => {
        (($a as u32) << 24) + (($b as u32) << 16) + (($c as u32) << 8) + ($d as u32)
    };
}

// support/SupportDefs.h
pub type status_t = i32;
pub type bigtime_t = i64;
pub type nanotime_t = i64;
pub type type_code = u32;
pub type perform_code = u32;

// kernel/OS.h
pub type area_id = i32;
pub type port_id = i32;
pub type sem_id = i32;
pub type team_id = i32;
pub type thread_id = i32;

pub type thread_func = extern "C" fn(*mut c_void) -> status_t;

// kernel/image.h
pub type image_id = i32;

c_enum! {
    // kernel/OS.h
    pub enum thread_state {
        pub B_THREAD_RUNNING = 1,
        pub B_THREAD_READY,
        pub B_THREAD_RECEIVING,
        pub B_THREAD_ASLEEP,
        pub B_THREAD_SUSPENDED,
        pub B_THREAD_WAITING,
    }

    // kernel/image.h
    pub enum image_type {
        pub B_APP_IMAGE = 1,
        pub B_LIBRARY_IMAGE,
        pub B_ADD_ON_IMAGE,
        pub B_SYSTEM_IMAGE,
    }

    // kernel/scheduler.h

    pub enum be_task_flags {
        pub B_DEFAULT_MEDIA_PRIORITY = 0x000,
        pub B_OFFLINE_PROCESSING = 0x001,
        pub B_STATUS_RENDERING = 0x002,
        pub B_USER_INPUT_HANDLING = 0x004,
        pub B_LIVE_VIDEO_MANIPULATION = 0x008,
        pub B_VIDEO_PLAYBACK = 0x010,
        pub B_VIDEO_RECORDING = 0x020,
        pub B_LIVE_AUDIO_MANIPULATION = 0x040,
        pub B_AUDIO_PLAYBACK = 0x080,
        pub B_AUDIO_RECORDING = 0x100,
        pub B_LIVE_3D_RENDERING = 0x200,
        pub B_NUMBER_CRUNCHING = 0x400,
        pub B_MIDI_PROCESSING = 0x800,
    }

    pub enum schduler_mode {
        pub SCHEDULER_MODE_LOW_LATENCY,
        pub SCHEDULER_MODE_POWER_SAVING,
    }

    // FindDirectory.h
    pub enum path_base_directory {
        pub B_FIND_PATH_INSTALLATION_LOCATION_DIRECTORY,
        pub B_FIND_PATH_ADD_ONS_DIRECTORY,
        pub B_FIND_PATH_APPS_DIRECTORY,
        pub B_FIND_PATH_BIN_DIRECTORY,
        pub B_FIND_PATH_BOOT_DIRECTORY,
        pub B_FIND_PATH_CACHE_DIRECTORY,
        pub B_FIND_PATH_DATA_DIRECTORY,
        pub B_FIND_PATH_DEVELOP_DIRECTORY,
        pub B_FIND_PATH_DEVELOP_LIB_DIRECTORY,
        pub B_FIND_PATH_DOCUMENTATION_DIRECTORY,
        pub B_FIND_PATH_ETC_DIRECTORY,
        pub B_FIND_PATH_FONTS_DIRECTORY,
        pub B_FIND_PATH_HEADERS_DIRECTORY,
        pub B_FIND_PATH_LIB_DIRECTORY,
        pub B_FIND_PATH_LOG_DIRECTORY,
        pub B_FIND_PATH_MEDIA_NODES_DIRECTORY,
        pub B_FIND_PATH_PACKAGES_DIRECTORY,
        pub B_FIND_PATH_PREFERENCES_DIRECTORY,
        pub B_FIND_PATH_SERVERS_DIRECTORY,
        pub B_FIND_PATH_SETTINGS_DIRECTORY,
        pub B_FIND_PATH_SOUNDS_DIRECTORY,
        pub B_FIND_PATH_SPOOL_DIRECTORY,
        pub B_FIND_PATH_TRANSLATORS_DIRECTORY,
        pub B_FIND_PATH_VAR_DIRECTORY,
        pub B_FIND_PATH_IMAGE_PATH = 1000,
        pub B_FIND_PATH_PACKAGE_PATH,
    }

    pub enum directory_which {
        pub B_DESKTOP_DIRECTORY = 0,
        pub B_TRASH_DIRECTORY,
        pub B_SYSTEM_DIRECTORY = 1000,
        pub B_SYSTEM_ADDONS_DIRECTORY = 1002,
        pub B_SYSTEM_BOOT_DIRECTORY,
        pub B_SYSTEM_FONTS_DIRECTORY,
        pub B_SYSTEM_LIB_DIRECTORY,
        pub B_SYSTEM_SERVERS_DIRECTORY,
        pub B_SYSTEM_APPS_DIRECTORY,
        pub B_SYSTEM_BIN_DIRECTORY,
        pub B_SYSTEM_DOCUMENTATION_DIRECTORY = 1010,
        pub B_SYSTEM_PREFERENCES_DIRECTORY,
        pub B_SYSTEM_TRANSLATORS_DIRECTORY,
        pub B_SYSTEM_MEDIA_NODES_DIRECTORY,
        pub B_SYSTEM_SOUNDS_DIRECTORY,
        pub B_SYSTEM_DATA_DIRECTORY,
        pub B_SYSTEM_DEVELOP_DIRECTORY,
        pub B_SYSTEM_PACKAGES_DIRECTORY,
        pub B_SYSTEM_HEADERS_DIRECTORY,
        pub B_SYSTEM_ETC_DIRECTORY = 2008,
        pub B_SYSTEM_SETTINGS_DIRECTORY = 2010,
        pub B_SYSTEM_LOG_DIRECTORY = 2012,
        pub B_SYSTEM_SPOOL_DIRECTORY,
        pub B_SYSTEM_TEMP_DIRECTORY,
        pub B_SYSTEM_VAR_DIRECTORY,
        pub B_SYSTEM_CACHE_DIRECTORY = 2020,
        pub B_SYSTEM_NONPACKAGED_DIRECTORY = 2023,
        pub B_SYSTEM_NONPACKAGED_ADDONS_DIRECTORY,
        pub B_SYSTEM_NONPACKAGED_TRANSLATORS_DIRECTORY,
        pub B_SYSTEM_NONPACKAGED_MEDIA_NODES_DIRECTORY,
        pub B_SYSTEM_NONPACKAGED_BIN_DIRECTORY,
        pub B_SYSTEM_NONPACKAGED_DATA_DIRECTORY,
        pub B_SYSTEM_NONPACKAGED_FONTS_DIRECTORY,
        pub B_SYSTEM_NONPACKAGED_SOUNDS_DIRECTORY,
        pub B_SYSTEM_NONPACKAGED_DOCUMENTATION_DIRECTORY,
        pub B_SYSTEM_NONPACKAGED_LIB_DIRECTORY,
        pub B_SYSTEM_NONPACKAGED_HEADERS_DIRECTORY,
        pub B_SYSTEM_NONPACKAGED_DEVELOP_DIRECTORY,
        
```