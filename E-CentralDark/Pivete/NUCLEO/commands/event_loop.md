# COMANDO - event_loop.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\macos\event_loop.rs
**SHA:** 53a6a0b315527a23
**Timestamp:** 2026-08-28T02:35:51.674249
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let () = msg_send![target, postEvent: dummy_event, atStart: YES];

### Contratos
- app_delegate::APP_DELEGATE_CLASS,
- pub(crate) delegate: IdRef,
- let delegate = unsafe {
- let delegate = IdRef::new(msg_send![APP_DELEGATE_CLASS.0, new]);
- let _: () = msg_send![app, setDelegate:*delegate];

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

use std::{
  any::Any,
  cell::{Cell, RefCell},
  collections::VecDeque,
  marker::PhantomData,
  mem,
  os::raw::c_void,
  panic::{catch_unwind, resume_unwind, RefUnwindSafe, UnwindSafe},
  process, ptr,
  rc::{Rc, Weak},
};

use crossbeam_channel::{self as channel, Receiver, Sender};
use objc2::{msg_send, rc::Retained};
use objc2_app_kit::{NSApp, NSApplication, NSEventModifierFlags, NSEventSubtype, NSEventType};
use objc2_foundation::{MainThreadMarker, NSAutoreleasePool, NSInteger, NSPoint, NSTimeInterval};

use crate::{
  dpi::PhysicalPosition,
  error::ExternalError,
  event::Event,
  event_loop::{ControlFlow, EventLoopClosed, EventLoopWindowTarget as RootWindowTarget},
  monitor::MonitorHandle as RootMonitorHandle,
  platform_impl::{
    platform::{
      app::APP_CLASS,
      app_delegate::APP_DELEGATE_CLASS,
      app_state::AppState,
      ffi::{id, nil, YES},
      monitor::{self, MonitorHandle},
      observer::*,
      util::{self, IdRef},
    },
    set_badge_label, set_progress_indicator,
  },
  window::{ProgressBarState, Theme},
};

use super::window::set_ns_theme;

#[derive(Default)]
pub struct PanicInfo {
  inner: Cell<Option<Box<dyn Any + Send + 'static>>>,
}

// WARNING:
// As long as this struct is used through its `impl`, it is UnwindSafe.
// (If `get_mut` is called on `inner`, unwind safety may get broken.)
impl UnwindSafe for PanicInfo {}
impl RefUnwindSafe for PanicInfo {}
impl PanicInfo {
  pub fn is_panicking(&self) -> bool {
    let inner = self.inner.take();
    let result = inner.is_some();
    self.inner.set(inner);
    result
  }
  /// Overwrites the curret state if the current state is not panicking
  pub fn set_panic(&self, p: Box<dyn Any + Send + 'static>) {
    if !self.is_panicking() {
      self.inner.set(Some(p));
    }
  }
  pub fn take(&self) -> Option<Box<dyn Any + Send + 'static>> {
    self.inner.take()
  }
}

#[derive(Clone)]
pub struct EventLoopWindowTarget<T: 'static> {
  pub sender: Sender<T>, // this is only here to be cloned elsewhere
  pub receiver: Receiver<T>,
}

impl<T> Default for EventLoopWindowTarget<T> {
  fn default() -> Self {
    let (sender, receiver) = channel::unbounded();
    EventLoopWindowTarget { sender, receiver }
  }
}

impl<T: 'static> EventLoopWindowTarget<T> {
  #[inline]
  pub fn available_monitors(&self) -> VecDeque<MonitorHandle> {
    monitor::available_monitors()
  }

  #[inline]
  pub fn monitor_from_point(&self, x: f64, y: f64) -> Option<MonitorHandle> {
    monitor::from_point(x, y)
  }

  #[inline]
  pub fn primary_monitor(&self) -> Option<RootMonitorHandle> {
    let monitor = monitor::primary_monitor();
    Some(RootMonitorHandle { inner: monitor })
  }

  #[cfg(feature = "rwh_05")]
  #[inline]
  pub fn raw_display_handle_rwh_05(&self) -> rwh_05::RawDisplayHandle {
    rwh_05::RawDisplayHandle::AppKit(rwh_05::AppKitDisplayHandle::empty())
  }

  #[cfg(feature = "rwh_06")]
  #[inline]
  pub fn raw_display_handle_rwh_06(&self) -> Result<rwh_06::RawDisplayHandle, rwh_06::HandleError> {
    Ok(rwh_06::RawDisplayHandle::AppKit(
      rwh_06::AppKitDisplayHandle::new(),
    ))
  }
  #[inline]
  pub fn cursor_position(&self) -> Result<PhysicalPosition<f64>, ExternalError> {
    util::cursor_position()
  }

  #[inline]
  pub fn set_progress_bar(&self, progress: ProgressBarState) {
    set_progress_indicator(progress);
  }

  #[inline]
  pub fn set_badge_count(&self, count: Option<i64>, _desktop_filename: Option<String>) {
    set_badge_label(count.map(|c| c.to_string()));
  }

  #[inline]
  pub fn set_badge_label(&self, label: Option<String>) {
    set_badge_label(label);
  }

  #[inline]
  pub fn set_theme(&self, theme: Option<Theme>) {
    set_ns_theme(theme)
  }
}

pub struct EventLoop<T: 'static> {
  pub(crate) delegate: IdRef,

  window_target: Rc<RootWindowTarget<T>>,
  panic_info: Rc<PanicInfo>,

  /// We make sure that the callback closure is dropped during a panic
  /// by making the event loop own it.
  ///
  /// Every other reference should be a Weak reference which is only upgraded
  /// into a strong reference in order to call the callback but then the
  /// strong reference should be dropped as soon as possible.
  _callback: Option<Rc<RefCell<dyn FnMut(Event<'_, T>, &RootWindowTarget<T>, &mut ControlFlow)>>>,
}

#[derive(Debug, Copy, Clone, PartialEq, Eq, Hash, Default)]
pub(crate) struct PlatformSpecificEventLoopAttributes {}

impl<T> EventLoop<T> {
  pub(crate) fn new(_: &PlatformSpecificEventLoopAttributes) -> Self {
    let panic_info: Rc<PanicInfo> = Default::default();
    setup_control_flow_observers(Rc::downgrade(&panic_info));

    let delegate = unsafe {
      if !util::is_main_thread() {
        panic!("On macOS, `EventLoop` must be created on the main thread!");
      }

      // This must be done before `NSApp()` (equivalent to sending
      // `sharedApp
```

---

# COMANDO - event_loop.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\windows\event_loop.rs
**SHA:** 33ecfbd4b54419a7
**Timestamp:** 2026-08-28T02:35:52.024626
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub static S_U_TASKBAR_RESTART: Lazy<u32> =

### Gaps
- // TODO: Investigate opportunities for caching
- // TODO: figure out how to handle page scrolls

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

#![allow(non_snake_case)]

mod runner;

use crossbeam_channel::{self as channel, Receiver, Sender};
use once_cell::sync::Lazy;
use parking_lot::Mutex;
use std::{
  cell::Cell,
  collections::VecDeque,
  ffi::c_void,
  marker::PhantomData,
  mem, panic,
  rc::Rc,
  sync::Arc,
  thread,
  time::{Duration, Instant},
};
use windows::{
  core::{s, BOOL, PCWSTR},
  Win32::{
    Foundation::{
      HANDLE, HINSTANCE, HWND, LPARAM, LRESULT, POINT, RECT, TRUE, WAIT_TIMEOUT, WPARAM,
    },
    Graphics::Gdi::*,
    System::{
      LibraryLoader::GetModuleHandleW,
      Ole::{IDropTarget, RevokeDragDrop},
      Threading::{GetCurrentThreadId, INFINITE},
    },
    UI::{
      Controls::{self as win32c, HOVER_DEFAULT},
      Input::{KeyboardAndMouse::*, Pointer::*, Touch::*, *},
      Shell::{
        DefSubclassProc, RemoveWindowSubclass, SHAppBarMessage, SetWindowSubclass, ABE_BOTTOM,
        ABE_LEFT, ABE_RIGHT, ABE_TOP, ABM_GETAUTOHIDEBAR, APPBARDATA,
      },
      WindowsAndMessaging::{self as win32wm, *},
    },
  },
};

use crate::{
  dpi::{PhysicalPosition, PhysicalSize, PixelUnit},
  error::ExternalError,
  event::{DeviceEvent, Event, Force, RawKeyEvent, Touch, TouchPhase, WindowEvent},
  event_loop::{ControlFlow, DeviceEventFilter, EventLoopClosed, EventLoopWindowTarget as RootELW},
  keyboard::{KeyCode, ModifiersState},
  monitor::MonitorHandle as RootMonitorHandle,
  platform_impl::platform::{
    dark_mode::try_window_theme,
    dpi::{become_dpi_aware, dpi_to_scale_factor, enable_non_client_dpi_scaling},
    keyboard::is_msg_keyboard_related,
    keyboard_layout::LAYOUT_CACHE,
    minimal_ime::is_msg_ime_related,
    monitor::{self, MonitorHandle},
    raw_input, util,
    window::set_skip_taskbar,
    window_state::{CursorFlags, WindowFlags, WindowState},
    wrap_device_id, WindowId, DEVICE_ID,
  },
  window::{Fullscreen, Theme, WindowId as RootWindowId},
};
use runner::{EventLoopRunner, EventLoopRunnerShared};

use super::{dpi::hwnd_dpi, util::get_system_metrics_for_dpi};

// This is defined in `winuser.h` as a macro that expands to `UINT_MAX`
const WHEEL_PAGESCROLL: u32 = u32::MAX;
// https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-systemparametersinfoa#:~:text=SPI_GETWHEELSCROLLLINES
const DEFAULT_SCROLL_LINES_PER_WHEEL_DELTA: isize = 3;
// https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-systemparametersinfoa#:~:text=SPI_GETWHEELSCROLLCHARS
const DEFAULT_SCROLL_CHARACTERS_PER_WHEEL_DELTA: isize = 3;

type GetPointerFrameInfoHistory = unsafe extern "system" fn(
  pointerId: u32,
  entriesCount: *mut u32,
  pointerCount: *mut u32,
  pointerInfo: *mut POINTER_INFO,
) -> BOOL;

type SkipPointerFrameMessages = unsafe extern "system" fn(pointerId: u32) -> BOOL;

type GetPointerDeviceRects = unsafe extern "system" fn(
  device: HANDLE,
  pointerDeviceRect: *mut RECT,
  displayRect: *mut RECT,
) -> BOOL;

type GetPointerTouchInfo =
  unsafe extern "system" fn(pointerId: u32, touchInfo: *mut POINTER_TOUCH_INFO) -> BOOL;

type GetPointerPenInfo =
  unsafe extern "system" fn(pointId: u32, penInfo: *mut POINTER_PEN_INFO) -> BOOL;

static GET_POINTER_FRAME_INFO_HISTORY: Lazy<Option<GetPointerFrameInfoHistory>> =
  Lazy::new(|| get_function!("user32.dll", GetPointerFrameInfoHistory));
static SKIP_POINTER_FRAME_MESSAGES: Lazy<Option<SkipPointerFrameMessages>> =
  Lazy::new(|| get_function!("user32.dll", SkipPointerFrameMessages));
static GET_POINTER_DEVICE_RECTS: Lazy<Option<GetPointerDeviceRects>> =
  Lazy::new(|| get_function!("user32.dll", GetPointerDeviceRects));
static GET_POINTER_TOUCH_INFO: Lazy<Option<GetPointerTouchInfo>> =
  Lazy::new(|| get_function!("user32.dll", GetPointerTouchInfo));
static GET_POINTER_PEN_INFO: Lazy<Option<GetPointerPenInfo>> =
  Lazy::new(|| get_function!("user32.dll", GetPointerPenInfo));

pub(crate) struct SubclassInput<T: 'static> {
  pub window_state: Arc<Mutex<WindowState>>,
  pub event_loop_runner: EventLoopRunnerShared<T>,
  pub _file_drop_handler: Option<IDropTarget>,
  pub subclass_removed: Cell<bool>,
  pub recurse_depth: Cell<u32>,
  pub event_loop_preferred_theme: Arc<Mutex<Option<Theme>>>,
}

impl<T> SubclassInput<T> {
  unsafe fn send_event(&self, event: Event<'_, T>) {
    self.event_loop_runner.send_event(event);
  }
}

struct ThreadMsgTargetSubclassInput<T: 'static> {
  event_loop_runner: EventLoopRunnerShared<T>,
  user_event_receiver: Receiver<T>,
}

impl<T> ThreadMsgTargetSubclassInput<T> {
  unsafe fn send_event(&self, event: Event<'_, T>) {
    self.event_loop_runner.send_event(event);
  }
}

/// The result of a subclass procedure (the message handling callback)
pub(crate) enum ProcResult {
  DefSubclassProc, // <- this should be the default value
  DefWindowProc,
  Value(LRESULT),
}

pub struct EventLoop<T: 'static> {
  thread_msg_sender: Sender<T>,
  window_tar
```