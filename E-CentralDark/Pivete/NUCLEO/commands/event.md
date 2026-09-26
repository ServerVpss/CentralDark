# COMANDO - event.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\event.rs
**SHA:** 21b4b8cd41b28cef
**Timestamp:** 2026-08-28T02:35:50.445197
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: Instant,
- start: Instant,

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

//! The `Event` enum and assorted supporting types.
//!
//! These are sent to the closure given to [`EventLoop::run(...)`][event_loop_run], where they get
//! processed and used to modify the program state. For more details, see the root-level documentation.
//!
//! Some of these events represent different "parts" of a traditional event-handling loop. You could
//! approximate the basic ordering loop of [`EventLoop::run(...)`][event_loop_run] like this:
//!
//! ```rust,ignore
//! let mut control_flow = ControlFlow::Poll;
//! let mut start_cause = StartCause::Init;
//!
//! while control_flow != ControlFlow::Exit {
//!     event_handler(NewEvents(start_cause), ..., &mut control_flow);
//!
//!     for e in (window events, user events, device events) {
//!         event_handler(e, ..., &mut control_flow);
//!     }
//!     event_handler(MainEventsCleared, ..., &mut control_flow);
//!
//!     for w in (redraw windows) {
//!         event_handler(RedrawRequested(w), ..., &mut control_flow);
//!     }
//!     event_handler(RedrawEventsCleared, ..., &mut control_flow);
//!
//!     start_cause = wait_if_necessary(control_flow);
//! }
//!
//! event_handler(LoopDestroyed, ..., &mut control_flow);
//! ```
//!
//! This leaves out timing details like `ControlFlow::WaitUntil` but hopefully
//! describes what happens in what order.
//!
//! [event_loop_run]: crate::event_loop::EventLoop::run
use std::{path::PathBuf, time::Instant};

use crate::{
  dpi::{PhysicalPosition, PhysicalSize},
  keyboard::{self, ModifiersState},
  platform_impl,
  window::{Theme, WindowId},
};

/// Describes a generic event.
///
/// See the module-level docs for more information on the event loop manages each event.
#[non_exhaustive]
#[derive(Debug, PartialEq)]
pub enum Event<'a, T: 'static> {
  /// Emitted when new events arrive from the OS to be processed.
  ///
  /// This event type is useful as a place to put code that should be done before you start
  /// processing events, such as updating frame timing information for benchmarking or checking
  /// the [`StartCause`][crate::event::StartCause] to see if a timer set by
  /// [`ControlFlow::WaitUntil`](crate::event_loop::ControlFlow::WaitUntil) has elapsed.
  NewEvents(StartCause),

  /// Emitted when the OS sends an event to a tao window.
  #[non_exhaustive]
  WindowEvent {
    window_id: WindowId,
    event: WindowEvent<'a>,
  },

  /// Emitted when the OS sends an event to a device.
  #[non_exhaustive]
  DeviceEvent {
    device_id: DeviceId,
    event: DeviceEvent,
  },

  /// Emitted when an event is sent from [`EventLoopProxy::send_event`](crate::event_loop::EventLoopProxy::send_event)
  UserEvent(T),

  /// Emitted when the application has been suspended.
  ///
  /// ## Platform-specific
  ///
  /// - **Android**: This is triggered by `onPause` method of the Activity.
  /// - **iOS**: This is triggered by `applicationWillResignActive` method of the UIApplicationDelegate.
  /// - **Linux / macOS / Windows**: Unsupported.
  Suspended,

  /// Emitted when the application has been resumed.
  ///
  /// ## Platform-specific
  ///
  /// - **Android**: This is triggered by `onResume` method of the Activity. The first onResume() is ignored to match the iOS implementation, since that is called on activity creation.
  /// - **iOS**: This is triggered by `applicationWillEnterForeground` method of the UIApplicationDelegate.
  /// - **Linux / macOS / Windows**: Unsupported.
  Resumed,

  /// Emitted when all of the event loop's input events have been processed and redraw processing
  /// is about to begin.
  ///
  /// This event is useful as a place to put your code that should be run after all
  /// state-changing events have been handled and you want to do stuff (updating state, performing
  /// calculations, etc) that happens as the "main body" of your event loop. If your program only draws
  /// graphics when something changes, it's usually better to do it in response to
  /// [`Event::RedrawRequested`](crate::event::Event::RedrawRequested), which gets emitted
  /// immediately after this event. Programs that draw graphics continuously, like most games,
  /// can render here unconditionally for simplicity.
  MainEventsCleared,

  /// Emitted after `MainEventsCleared` when a window should be redrawn.
  ///
  /// This gets triggered in two scenarios:
  /// - The OS has performed an operation that's invalidated the window's contents (such as
  ///   resizing the window).
  /// - The application has explicitly requested a redraw via
  ///   [`Window::request_redraw`](crate::window::Window::request_redraw).
  ///
  /// During each iteration of the event loop, Tao will aggregate duplicate redraw requests
  /// into a single event, to help avoid duplicating rendering work.
  ///
  /// Mainly of interest to applications with mostly-static graphics that 
```

---

# COMANDO - event.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\windows\event.rs
**SHA:** 5e658dbc39645a31
**Timestamp:** 2026-08-28T02:35:51.974865
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- //win32wm::VK_EXECUTE => Some(VirtualKeyCode::Execute),

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

use std::{
  char,
  os::raw::c_int,
  ptr,
  sync::atomic::{AtomicBool, AtomicPtr, Ordering},
};

use crate::event::{ModifiersState, ScanCode, VirtualKeyCode};

use windows::Win32::{
  Foundation::{HWND, LPARAM, WPARAM},
  UI::{
    Input::KeyboardAndMouse::*,
    TextServices::HKL,
    WindowsAndMessaging::{self as win32wm, *},
  },
};

fn key_pressed(vkey: c_int) -> bool {
  unsafe { (GetKeyState(vkey) & (1 << 15)) == (1 << 15) }
}

pub fn get_key_mods() -> ModifiersState {
  let filter_out_altgr = layout_uses_altgr() && key_pressed(VK_RMENU);

  let mut mods = ModifiersState::empty();
  mods.set(ModifiersState::SHIFT, key_pressed(VK_SHIFT));
  mods.set(
    ModifiersState::CTRL,
    key_pressed(VK_CONTROL) && !filter_out_altgr,
  );
  mods.set(
    ModifiersState::ALT,
    key_pressed(VK_MENU) && !filter_out_altgr,
  );
  mods.set(
    ModifiersState::LOGO,
    key_pressed(VK_LWIN) || key_pressed(VK_RWIN),
  );
  mods
}

bitflags! {
    #[derive(Default)]
    pub struct ModifiersStateSide: u32 {
        const LSHIFT = 0b010 << 0;
        const RSHIFT = 0b001 << 0;

        const LCTRL = 0b010 << 3;
        const RCTRL = 0b001 << 3;

        const LALT = 0b010 << 6;
        const RALT = 0b001 << 6;

        const LLOGO = 0b010 << 9;
        const RLOGO = 0b001 << 9;
    }
}

impl ModifiersStateSide {
  pub fn filter_out_altgr(&self) -> ModifiersStateSide {
    match layout_uses_altgr() && self.contains(Self::RALT) {
      false => *self,
      true => *self & !(Self::LCTRL | Self::RCTRL | Self::LALT | Self::RALT),
    }
  }
}

impl From<ModifiersStateSide> for ModifiersState {
  fn from(side: ModifiersStateSide) -> Self {
    let mut state = ModifiersState::default();
    state.set(
      Self::SHIFT,
      side.intersects(ModifiersStateSide::LSHIFT | ModifiersStateSide::RSHIFT),
    );
    state.set(
      Self::CTRL,
      side.intersects(ModifiersStateSide::LCTRL | ModifiersStateSide::RCTRL),
    );
    state.set(
      Self::ALT,
      side.intersects(ModifiersStateSide::LALT | ModifiersStateSide::RALT),
    );
    state.set(
      Self::LOGO,
      side.intersects(ModifiersStateSide::LLOGO | ModifiersStateSide::RLOGO),
    );
    state
  }
}

pub fn get_pressed_keys() -> impl Iterator<Item = c_int> {
  let mut keyboard_state = vec![0u8; 256];
  unsafe { GetKeyboardState(keyboard_state.as_mut_ptr()) };
  keyboard_state
    .into_iter()
    .enumerate()
    .filter(|(_, p)| (*p & (1 << 7)) != 0) // whether or not a key is pressed is communicated via the high-order bit
    .map(|(i, _)| i as c_int)
}

unsafe fn get_char(keyboard_state: &[u8; 256], v_key: u32, hkl: HKL) -> Option<char> {
  let mut unicode_bytes = [0u16; 5];
  let len = ToUnicodeEx(
    v_key,
    0,
    keyboard_state.as_ptr(),
    unicode_bytes.as_mut_ptr(),
    unicode_bytes.len() as _,
    0,
    hkl,
  );
  if len >= 1 {
    char::decode_utf16(unicode_bytes.iter().cloned())
      .next()
      .and_then(|c| c.ok())
  } else {
    None
  }
}

/// Figures out if the keyboard layout has an AltGr key instead of an Alt key.
///
/// Unfortunately, the Windows API doesn't give a way for us to conveniently figure that out. So,
/// we use a technique blatantly stolen from [the Firefox source code][source]: iterate over every
/// possible virtual key and compare the `char` output when AltGr is pressed vs when it isn't. If
/// pressing AltGr outputs characters that are different from the standard characters, the layout
/// uses AltGr. Otherwise, it doesn't.
///
/// [source]: https://github.com/mozilla/gecko-dev/blob/265e6721798a455604328ed5262f430cfcc37c2f/widget/windows/KeyboardLayout.cpp#L4356-L4416
fn layout_uses_altgr() -> bool {
  unsafe {
    static ACTIVE_LAYOUT: AtomicPtr<HKL__> = AtomicPtr::new(ptr::null_mut());
    static USES_ALTGR: AtomicBool = AtomicBool::new(false);

    let hkl = GetKeyboardLayout(0);
    let old_hkl = ACTIVE_LAYOUT.swap(hkl, Ordering::SeqCst);

    if hkl == old_hkl {
      return USES_ALTGR.load(Ordering::SeqCst);
    }

    let mut keyboard_state_altgr = [0u8; 256];
    // AltGr is an alias for Ctrl+Alt for... some reason. Whatever it is, those are the keypresses
    // we have to emulate to do an AltGr test.
    keyboard_state_altgr[VK_MENU as usize] = 0x80;
    keyboard_state_altgr[VK_CONTROL as usize] = 0x80;

    let keyboard_state_empty = [0u8; 256];

    for v_key in 0..=255 {
      let key_noaltgr = get_char(&keyboard_state_empty, v_key, hkl);
      let key_altgr = get_char(&keyboard_state_altgr, v_key, hkl);
      if let (Some(noaltgr), Some(altgr)) = (key_noaltgr, key_altgr) {
        if noaltgr != altgr {
          USES_ALTGR.store(true, Ordering::SeqCst);
          return true;
        }
      }
    }

    USES_ALTGR.store(false, Ordering::SeqCst);
    false
  }
}

pub fn vkey_to_tao_vkey(vkey: u32) -> Option<VirtualKeyCode> {
  // VK_* codes ar
```