# CONTRATO - window_delegate.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\macos\window_delegate.rs
**SHA:** 3be35019eb247d25
**Timestamp:** 2026-08-28T02:35:51.827509
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- let delegate: id = msg_send![WINDOW_DELEGATE_CLASS.0, alloc];
- let () = msg_send![&state.ns_window, setDelegate: this];
- // `setDelegate:` retains the previous value and then autoreleases it
- let () = msg_send![&state.ns_window, setDelegate: nil];

### Gaps
- // TODO: It's possible for delegate methods to be called asynchronously,
- #[allow(deprecated)] // TODO: Use define_class!
- #[allow(deprecated)] // TODO: Use define_class!
- // TODO: center the cursor if the window had mouse grab when it
- #[allow(deprecated)] // TODO: Use define_class!

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

use std::{
  f64,
  ffi::CStr,
  os::raw::c_void,
  sync::{Arc, Weak},
};

use objc2::{
  msg_send,
  rc::Retained,
  runtime::{AnyClass as Class, AnyObject as Object, ClassBuilder as ClassDecl, Sel},
};
use objc2_app_kit::{
  self as appkit, NSApplicationPresentationOptions, NSPasteboard, NSView, NSWindow,
};
use objc2_foundation::{ns_string, NSArray, NSAutoreleasePool, NSString, NSUInteger};
use once_cell::sync::Lazy;

use crate::{
  dpi::{LogicalPosition, LogicalSize},
  event::{Event, WindowEvent},
  keyboard::ModifiersState,
  platform_impl::platform::{
    app_state::AppState,
    event::{EventProxy, EventWrapper},
    ffi::{id, nil, BOOL, NO, YES},
    util::{self, IdRef},
    view::ViewState,
    window::{get_ns_theme, get_window_id, UnownedWindow},
  },
  window::{Fullscreen, WindowId},
};

pub struct WindowDelegateState {
  ns_window: Retained<NSWindow>, // never changes
  // We keep this ns_view because we still need its view state for some extern function
  // like didResignKey
  ns_view: Retained<NSView>, // never changes

  window: Weak<UnownedWindow>,

  // TODO: It's possible for delegate methods to be called asynchronously,
  // causing data races / `RefCell` panics.

  // This is set when WindowBuilder::with_fullscreen was set,
  // see comments of `window_did_fail_to_enter_fullscreen`
  initial_fullscreen: bool,

  // During `windowDidResize`, we use this to only send Moved if the position changed.
  previous_position: Option<(f64, f64)>,

  // Used to prevent redundant events.
  previous_scale_factor: f64,

  // Used to prevent resized events from being fired
  // when we are using our workaround in the `is_zoomed` function.
  is_checking_zoomed_in: bool,
}

impl WindowDelegateState {
  pub fn new(window: &Arc<UnownedWindow>, initial_fullscreen: bool) -> Self {
    let scale_factor = window.scale_factor();
    let mut delegate_state = WindowDelegateState {
      ns_window: window.ns_window.clone(),
      ns_view: window.ns_view.clone(),
      window: Arc::downgrade(window),
      initial_fullscreen,
      previous_position: None,
      previous_scale_factor: scale_factor,
      is_checking_zoomed_in: false,
    };
    if (scale_factor - 1.0).abs() > f64::EPSILON {
      delegate_state.emit_static_scale_factor_changed_event();
    }

    delegate_state
  }

  fn ns_view(&self) -> Retained<NSView> {
    self.ns_window.contentView().unwrap()
  }

  fn with_window<F, T>(&mut self, callback: F) -> Option<T>
  where
    F: FnOnce(&UnownedWindow) -> T,
  {
    self.window.upgrade().map(|ref window| callback(window))
  }

  pub fn emit_event(&mut self, event: WindowEvent<'static>) {
    let event = Event::WindowEvent {
      window_id: WindowId(get_window_id(&self.ns_window)),
      event,
    };
    AppState::queue_event(EventWrapper::StaticEvent(event));
  }

  pub fn emit_static_scale_factor_changed_event(&mut self) {
    let scale_factor = self.get_scale_factor();
    if (scale_factor - self.previous_scale_factor).abs() < f64::EPSILON {
      return;
    };

    self.previous_scale_factor = scale_factor;
    let wrapper = EventWrapper::EventProxy(EventProxy::DpiChangedProxy {
      ns_window: self.ns_window.clone(),
      suggested_size: self.view_size(),
      scale_factor,
    });
    AppState::queue_event(wrapper);
  }

  pub fn emit_resize_event(&mut self) {
    let rect = NSView::frame(&self.ns_view());
    let scale_factor = self.get_scale_factor();
    let logical_size = LogicalSize::new(rect.size.width as f64, rect.size.height as f64);
    let size = logical_size.to_physical(scale_factor);
    self.emit_event(WindowEvent::Resized(size));
  }

  fn emit_move_event(&mut self) {
    let rect = NSWindow::frame(&self.ns_window);
    let x = rect.origin.x as f64;
    let y = util::bottom_left_to_top_left(rect);
    let moved = self.previous_position != Some((x, y));
    if moved {
      self.previous_position = Some((x, y));
      let scale_factor = self.get_scale_factor();
      let physical_pos = LogicalPosition::<f64>::from((x, y)).to_physical(scale_factor);
      self.emit_event(WindowEvent::Moved(physical_pos));
    }
  }

  fn get_scale_factor(&self) -> f64 {
    NSWindow::backingScaleFactor(&self.ns_window) as f64
  }

  fn view_size(&self) -> LogicalSize<f64> {
    let ns_size = NSView::frame(&self.ns_view()).size;
    LogicalSize::new(ns_size.width as f64, ns_size.height as f64)
  }
}

pub fn new_delegate(window: &Arc<UnownedWindow>, initial_fullscreen: bool) -> IdRef {
  let state = WindowDelegateState::new(window, initial_fullscreen);
  unsafe {
    // This is free'd in `dealloc`
    let state_ptr = Box::into_raw(Box::new(state)) as *mut c_void;
    let delegate: id = msg_send![WINDOW_DELEGATE_CLASS.0, alloc];
    IdRef::new(msg_send![delegate, initWithTao: state_ptr])
  }
}

struct WindowDelegateClass(*const Class);
unsafe i
```