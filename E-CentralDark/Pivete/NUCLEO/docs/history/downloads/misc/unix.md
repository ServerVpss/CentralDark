# OUTRO - unix.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\chrono-0.4.45\src\offset\local\unix.rs
**SHA:** b9900a80a669f32b
**Timestamp:** 2026-08-28T02:33:27.122119
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: see if we can improve caching in the case where the fallback is a valid timezone

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2012-2014 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

use std::{cell::RefCell, collections::hash_map, env, fs, hash::Hasher, time::SystemTime};

use super::tz_info::TimeZone;
use super::{FixedOffset, NaiveDateTime};
use crate::MappedLocalTime;

pub(super) fn offset_from_utc_datetime(utc: &NaiveDateTime) -> MappedLocalTime<FixedOffset> {
    offset(utc, false)
}

pub(super) fn offset_from_local_datetime(local: &NaiveDateTime) -> MappedLocalTime<FixedOffset> {
    offset(local, true)
}

fn offset(d: &NaiveDateTime, local: bool) -> MappedLocalTime<FixedOffset> {
    TZ_INFO.with(|maybe_cache| {
        maybe_cache.borrow_mut().get_or_insert_with(Cache::default).offset(*d, local)
    })
}

// we have to store the `Cache` in an option as it can't
// be initialized in a static context.
thread_local! {
    static TZ_INFO: RefCell<Option<Cache>> = Default::default();
}

enum Source {
    LocalTime { mtime: SystemTime },
    Environment { hash: u64 },
}

impl Source {
    fn new(env_tz: Option<&str>) -> Source {
        match env_tz {
            Some(tz) => {
                let mut hasher = hash_map::DefaultHasher::new();
                hasher.write(tz.as_bytes());
                let hash = hasher.finish();
                Source::Environment { hash }
            }
            None => match fs::symlink_metadata("/etc/localtime") {
                Ok(data) => Source::LocalTime {
                    // we have to pick a sensible default when the mtime fails
                    // by picking SystemTime::now() we raise the probability of
                    // the cache being invalidated if/when the mtime starts working
                    mtime: data.modified().unwrap_or_else(|_| SystemTime::now()),
                },
                Err(_) => {
                    // as above, now() should be a better default than some constant
                    // TODO: see if we can improve caching in the case where the fallback is a valid timezone
                    Source::LocalTime { mtime: SystemTime::now() }
                }
            },
        }
    }
}

struct Cache {
    zone: TimeZone,
    source: Source,
    last_checked: SystemTime,
}

#[cfg(target_os = "aix")]
const TZDB_LOCATION: &str = "/usr/share/lib/zoneinfo";

#[cfg(not(any(target_os = "android", target_os = "aix", target_env = "ohos")))]
const TZDB_LOCATION: &str = "/usr/share/zoneinfo";

fn fallback_timezone() -> Option<TimeZone> {
    let tz_name = iana_time_zone::get_timezone().ok()?;
    #[cfg(not(any(target_os = "android", target_env = "ohos")))]
    let bytes = fs::read(format!("{TZDB_LOCATION}/{tz_name}")).ok()?;
    #[cfg(any(target_os = "android", target_env = "ohos"))]
    let bytes = crate::offset::local::tz_data::for_zone(&tz_name).ok()??;
    TimeZone::from_tz_data(&bytes).ok()
}

impl Default for Cache {
    fn default() -> Cache {
        // default to UTC if no local timezone can be found
        let env_tz = env::var("TZ").ok();
        let env_ref = env_tz.as_deref();
        Cache {
            last_checked: SystemTime::now(),
            source: Source::new(env_ref),
            zone: current_zone(env_ref),
        }
    }
}

fn current_zone(var: Option<&str>) -> TimeZone {
    TimeZone::local(var).ok().or_else(fallback_timezone).unwrap_or_else(TimeZone::utc)
}

impl Cache {
    fn offset(&mut self, d: NaiveDateTime, local: bool) -> MappedLocalTime<FixedOffset> {
        let now = SystemTime::now();

        match now.duration_since(self.last_checked) {
            // If the cache has been around for less than a second then we reuse it
            // unconditionally. This is a reasonable tradeoff because the timezone
            // generally won't be changing _that_ often, but if the time zone does
            // change, it will reflect sufficiently quickly from an application
            // user's perspective.
            Ok(d) if d.as_secs() < 1 => (),
            Ok(_) | Err(_) => {
                let env_tz = env::var("TZ").ok();
                let env_ref = env_tz.as_deref();
                let new_source = Source::new(env_ref);

                let out_of_date = match (&self.source, &new_source) {
                    // change from env to file or file to env, must recreate the zone
                    (Source::Environment { .. }, Source::LocalTime { .. })
                    | (Source::LocalTime { .. }, Source::Environment { .. }) => true,
                    // stay as file, but mtime has changed
                    (Source::LocalTime { mtime: old_mtime }, Source::LocalTime { mtime })
                        if old
```

---

# OUTRO - unix.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\raw-window-handle-0.6.2\src\unix.rs
**SHA:** b72fd364423737cb
**Timestamp:** 2026-08-28T02:35:03.039191
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Use `std::os::fd::RawFd`?

### Ouro Bruto (primeiros 5000 chars)
```
use core::ffi::{c_int, c_ulong, c_void};
use core::num::NonZeroU32;
use core::ptr::NonNull;

/// Raw display handle for Xlib.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct XlibDisplayHandle {
    /// A pointer to an Xlib `Display`.
    ///
    /// It is strongly recommended to set this value, however it may be set to
    /// `None` to request the default display when using EGL.
    pub display: Option<NonNull<c_void>>,

    /// An X11 screen to use with this display handle.
    ///
    /// Note, that X11 could have multiple screens, however
    /// graphics APIs could work only with one screen at the time,
    /// given that multiple screens usually reside on different GPUs.
    pub screen: c_int,
}

impl XlibDisplayHandle {
    /// Create a new handle to a display.
    ///
    ///
    /// # Example
    ///
    /// ```
    /// # use core::ffi::c_void;
    /// # use core::ptr::NonNull;
    /// # use raw_window_handle::XlibDisplayHandle;
    /// #
    /// let display: NonNull<c_void>;
    /// let screen;
    /// # display = NonNull::from(&()).cast();
    /// # screen = 0;
    /// let handle = XlibDisplayHandle::new(Some(display), screen);
    /// ```
    pub fn new(display: Option<NonNull<c_void>>, screen: c_int) -> Self {
        Self { display, screen }
    }
}

/// Raw window handle for Xlib.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct XlibWindowHandle {
    /// An Xlib `Window`.
    pub window: c_ulong,
    /// An Xlib visual ID, or 0 if unknown.
    pub visual_id: c_ulong,
}

impl XlibWindowHandle {
    /// Create a new handle to a window.
    ///
    ///
    /// # Example
    ///
    /// ```
    /// # use core::ffi::c_ulong;
    /// # use raw_window_handle::XlibWindowHandle;
    /// #
    /// let window: c_ulong;
    /// # window = 0;
    /// let mut handle = XlibWindowHandle::new(window);
    /// // Optionally set the visual ID.
    /// handle.visual_id = 0;
    /// ```
    pub fn new(window: c_ulong) -> Self {
        Self {
            window,
            visual_id: 0,
        }
    }
}

/// Raw display handle for Xcb.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct XcbDisplayHandle {
    /// A pointer to an X server `xcb_connection_t`.
    ///
    /// It is strongly recommended to set this value, however it may be set to
    /// `None` to request the default display when using EGL.
    pub connection: Option<NonNull<c_void>>,

    /// An X11 screen to use with this display handle.
    ///
    /// Note, that X11 could have multiple screens, however
    /// graphics APIs could work only with one screen at the time,
    /// given that multiple screens usually reside on different GPUs.
    pub screen: c_int,
}

impl XcbDisplayHandle {
    /// Create a new handle to a connection and screen.
    ///
    ///
    /// # Example
    ///
    /// ```
    /// # use core::ffi::c_void;
    /// # use core::ptr::NonNull;
    /// # use raw_window_handle::XcbDisplayHandle;
    /// #
    /// let connection: NonNull<c_void>;
    /// let screen;
    /// # connection = NonNull::from(&()).cast();
    /// # screen = 0;
    /// let handle = XcbDisplayHandle::new(Some(connection), screen);
    /// ```
    pub fn new(connection: Option<NonNull<c_void>>, screen: c_int) -> Self {
        Self { connection, screen }
    }
}

/// Raw window handle for Xcb.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct XcbWindowHandle {
    /// An X11 `xcb_window_t`.
    pub window: NonZeroU32, // Based on xproto.h
    /// An X11 `xcb_visualid_t`.
    pub visual_id: Option<NonZeroU32>,
}

impl XcbWindowHandle {
    /// Create a new handle to a window.
    ///
    ///
    /// # Example
    ///
    /// ```
    /// # use core::num::NonZeroU32;
    /// # use raw_window_handle::XcbWindowHandle;
    /// #
    /// let window: NonZeroU32;
    /// # window = NonZeroU32::new(1).unwrap();
    /// let mut handle = XcbWindowHandle::new(window);
    /// // Optionally set the visual ID.
    /// handle.visual_id = None;
    /// ```
    pub fn new(window: NonZeroU32) -> Self {
        Self {
            window,
            visual_id: None,
        }
    }
}

/// Raw display handle for Wayland.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct WaylandDisplayHandle {
    /// A pointer to a `wl_display`.
    pub display: NonNull<c_void>,
}

impl WaylandDisplayHandle {
    /// Create a new display handle.
    ///
    ///
    /// # Example
    ///
    /// ```
    /// # use core::ffi::c_void;
    /// # use core::ptr::NonNull;
    /// # use raw_window_handle::WaylandDisplayHandle;
    /// #
    /// let display: NonNull<c_void>;
    /// # display = NonNull::from(&()).cast();
    /// let handle = WaylandDisplayHandle::new(display);
    /// ```
    pub fn new(display: NonNull<c_void>) -> Self {
        Self { display }
    }
}

/// Raw window handle for Wayland.
#[non_exhaustive]
#[derive(Debug, Clone, Copy, Par
```