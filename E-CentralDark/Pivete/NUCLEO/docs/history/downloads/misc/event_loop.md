# OUTRO - event_loop.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\linux\event_loop.rs
**SHA:** 2143e1ddd7020697
**Timestamp:** 2026-08-28T02:35:51.252704
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let run = run_device_thread.clone();
- EventState::NewStart => match control_flow {
- start: Instant::now(),
- let start = Instant::now();

### Gaps
- // todo: implement repeat?

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

use std::{
  cell::RefCell,
  collections::{HashSet, VecDeque},
  error::Error,
  process,
  rc::Rc,
  sync::atomic::{AtomicBool, Ordering},
  time::Instant,
};

use cairo::{RectangleInt, Region};
use crossbeam_channel::SendError;
use gdk::{Cursor, CursorType, EventKey, EventMask, ScrollDirection, WindowEdge, WindowState};
use gio::Cancellable;
use glib::{source::Priority, MainContext};
use gtk::{
  cairo, gdk, gio,
  glib::{self},
  prelude::*,
  Settings,
};

#[cfg(feature = "x11")]
use crate::platform_impl::platform::device;
use crate::{
  dpi::{LogicalPosition, LogicalSize, PhysicalPosition},
  error::ExternalError,
  event::{
    ElementState, Event, MouseButton, MouseScrollDelta, StartCause, TouchPhase, WindowEvent,
  },
  event_loop::{ControlFlow, EventLoopClosed, EventLoopWindowTarget as RootELW},
  keyboard::ModifiersState,
  monitor::MonitorHandle as RootMonitorHandle,
  platform_impl::platform::DEVICE_ID,
  window::{
    CursorIcon, Fullscreen, ProgressBarState, ResizeDirection, Theme, WindowId as RootWindowId,
  },
};

use super::{
  keyboard,
  monitor::{self, MonitorHandle},
  taskbar, util,
  window::{WindowId, WindowRequest},
};

use taskbar::TaskbarIndicator;

#[derive(Clone)]
pub struct EventLoopWindowTarget<T> {
  /// Gdk display
  pub(crate) display: gdk::Display,
  /// Gtk application
  pub(crate) app: gtk::Application,
  /// Window Ids of the application
  pub(crate) windows: Rc<RefCell<HashSet<WindowId>>>,
  /// Window requests sender
  pub(crate) window_requests_tx: glib::Sender<(WindowId, WindowRequest)>,
  /// Draw event sender
  pub(crate) draw_tx: crossbeam_channel::Sender<WindowId>,
  _marker: std::marker::PhantomData<T>,
}

impl<T> EventLoopWindowTarget<T> {
  #[inline]
  pub fn monitor_from_point(&self, x: f64, y: f64) -> Option<MonitorHandle> {
    monitor::from_point(&self.display, x, y)
  }
  #[inline]
  pub fn available_monitors(&self) -> VecDeque<MonitorHandle> {
    let mut handles = VecDeque::new();
    let display = &self.display;
    let numbers = display.n_monitors();

    for i in 0..numbers {
      let monitor = MonitorHandle::new(display, i);
      handles.push_back(monitor);
    }

    handles
  }

  #[inline]
  pub fn primary_monitor(&self) -> Option<RootMonitorHandle> {
    let monitor = self.display.primary_monitor();
    monitor.map(|monitor| RootMonitorHandle {
      inner: MonitorHandle { monitor },
    })
  }

  #[cfg(feature = "rwh_05")]
  pub fn raw_display_handle_rwh_05(&self) -> rwh_05::RawDisplayHandle {
    if self.is_wayland() {
      let mut display_handle = rwh_05::WaylandDisplayHandle::empty();
      display_handle.display = unsafe {
        gdk_wayland_sys::gdk_wayland_display_get_wl_display(self.display.as_ptr() as *mut _)
      };
      rwh_05::RawDisplayHandle::Wayland(display_handle)
    } else {
      let mut display_handle = rwh_05::XlibDisplayHandle::empty();
      unsafe {
        if let Ok(xlib) = x11_dl::xlib::Xlib::open() {
          let display = (xlib.XOpenDisplay)(std::ptr::null());
          display_handle.display = display as _;
          display_handle.screen = (xlib.XDefaultScreen)(display) as _;
        }
      }

      rwh_05::RawDisplayHandle::Xlib(display_handle)
    }
  }

  #[cfg(feature = "rwh_06")]
  pub fn raw_display_handle_rwh_06(&self) -> Result<rwh_06::RawDisplayHandle, rwh_06::HandleError> {
    if self.is_wayland() {
      let display = unsafe {
        gdk_wayland_sys::gdk_wayland_display_get_wl_display(self.display.as_ptr() as *mut _)
      };
      let display = unsafe { std::ptr::NonNull::new_unchecked(display) };
      let display_handle = rwh_06::WaylandDisplayHandle::new(display);
      Ok(rwh_06::RawDisplayHandle::Wayland(display_handle))
    } else {
      #[cfg(feature = "x11")]
      unsafe {
        if let Ok(xlib) = x11_dl::xlib::Xlib::open() {
          let display = (xlib.XOpenDisplay)(std::ptr::null());
          let screen = (xlib.XDefaultScreen)(display) as _;
          let display = std::ptr::NonNull::new_unchecked(display as _);
          let display_handle = rwh_06::XlibDisplayHandle::new(Some(display), screen);
          Ok(rwh_06::RawDisplayHandle::Xlib(display_handle))
        } else {
          Err(rwh_06::HandleError::Unavailable)
        }
      }
      #[cfg(not(feature = "x11"))]
      Err(rwh_06::HandleError::Unavailable)
    }
  }

  pub fn is_wayland(&self) -> bool {
    self.display.backend().is_wayland()
  }

  #[cfg(feature = "x11")]
  pub fn is_x11(&self) -> bool {
    self.display.backend().is_x11()
  }

  #[inline]
  pub fn cursor_position(&self) -> Result<PhysicalPosition<f64>, ExternalError> {
    util::cursor_position(self.is_wayland())
  }

  #[inline]
  pub fn set_progress_bar(&self, progress: ProgressBarState) {
    if let Err(e) = self
      .window_requests_tx
      .send((WindowId::dummy(), WindowRequest::Progress
```