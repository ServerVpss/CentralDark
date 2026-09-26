# COMANDO - window.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\macos\window.rs
**SHA:** d5535bc79de59563
**Timestamp:** 2026-08-28T02:35:51.815978
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- window_delegate::new_delegate,
- let delegate = new_delegate(&window, fullscreen.is_some());

### Gaps
- #[allow(deprecated)] // TODO: Use define_class!
- #[allow(deprecated)] // TODO: Use define_class!
- #[allow(deprecated)] // TODO: Use define_class!
- // TODO: Do this for real https://stackoverflow.com/a/40922095/5435443
- #[allow(deprecated)] // TODO: Use define_class!

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
#![allow(unused_unsafe)]

use std::{
  collections::VecDeque,
  convert::TryInto,
  f64,
  ffi::CStr,
  os::raw::c_void,
  sync::{
    atomic::{AtomicBool, Ordering},
    Arc, Mutex, Weak,
  },
};

use crate::{
  dpi::{
    LogicalPosition, LogicalSize, PhysicalPosition, PhysicalSize, Position, Size, Size::Logical,
  },
  error::{ExternalError, NotSupportedError, OsError as RootOsError},
  icon::Icon,
  monitor::{MonitorHandle as RootMonitorHandle, VideoMode as RootVideoMode},
  platform::macos::WindowExtMacOS,
  platform_impl::{
    platform::{
      app_state::AppState,
      ffi,
      monitor::{self, MonitorHandle, VideoMode},
      util::{self, IdRef},
      view::{self, new_view, CursorState},
      window_delegate::new_delegate,
      OsError,
    },
    set_badge_label, set_progress_indicator,
  },
  window::{
    CursorIcon, Fullscreen, ProgressBarState, ResizeDirection, Theme, UserAttentionType,
    WindowAttributes, WindowId as RootWindowId, WindowSizeConstraints,
  },
};
use core_graphics::{
  base::CGFloat,
  display::{CGDisplay, CGDisplayMode},
  geometry::CGPoint,
};
use objc2::{
  msg_send,
  rc::Retained,
  runtime::{AnyClass as Class, AnyObject as Object, Bool, ClassBuilder as ClassDecl, Sel},
};
use objc2_app_kit::{
  self as appkit, NSApp, NSApplicationPresentationOptions, NSBackingStoreType, NSColor, NSEvent,
  NSEventModifierFlags, NSEventSubtype, NSEventType, NSRequestUserAttentionType, NSScreen, NSView,
  NSWindow, NSWindowButton, NSWindowCollectionBehavior, NSWindowFullScreenButton,
  NSWindowOrderingMode, NSWindowSharingType, NSWindowStyleMask,
};
use objc2_foundation::{
  ns_string, MainThreadMarker, NSArray, NSAutoreleasePool, NSDictionary, NSInteger, NSPoint,
  NSRect, NSSize, NSString, NSTimeInterval, NSUInteger,
};
use once_cell::sync::Lazy;

use super::{
  ffi::{id, nil, NO},
  view::ViewState,
};

#[derive(Debug, Copy, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct Id(pub usize);

impl Id {
  pub unsafe fn dummy() -> Self {
    Id(0)
  }
}

// Convert the `NSWindow` associated with a window to a usize to use as a unique identifier
// for the window.
pub fn get_window_id(window_cocoa_id: &NSWindow) -> Id {
  Id(window_cocoa_id as *const NSWindow as _)
}

#[non_exhaustive]
#[derive(Clone)]
pub enum Parent {
  None,
  ChildOf(*mut c_void),
}

#[derive(Clone)]
pub struct PlatformSpecificWindowBuilderAttributes {
  pub parent: Parent,
  pub movable_by_window_background: bool,
  pub titlebar_transparent: bool,
  pub title_hidden: bool,
  pub titlebar_hidden: bool,
  pub titlebar_buttons_hidden: bool,
  pub fullsize_content_view: bool,
  pub resize_increments: Option<LogicalSize<f64>>,
  pub disallow_hidpi: bool,
  pub has_shadow: bool,
  pub traffic_light_inset: Option<Position>,
  pub automatic_tabbing: bool,
  pub tabbing_identifier: Option<String>,
}

impl Default for PlatformSpecificWindowBuilderAttributes {
  #[inline]
  fn default() -> Self {
    Self {
      parent: Parent::None,
      movable_by_window_background: false,
      titlebar_transparent: false,
      title_hidden: false,
      titlebar_hidden: false,
      titlebar_buttons_hidden: false,
      fullsize_content_view: false,
      resize_increments: None,
      disallow_hidpi: false,
      has_shadow: true,
      traffic_light_inset: None,
      automatic_tabbing: true,
      tabbing_identifier: None,
    }
  }
}

unsafe fn create_view(
  ns_window: &NSWindow,
  pl_attribs: &PlatformSpecificWindowBuilderAttributes,
) -> Option<(Retained<NSView>, Weak<Mutex<CursorState>>)> {
  let (ns_view, cursor_state) = new_view(ns_window);
  ns_view.map(|ns_view| {
    if !pl_attribs.disallow_hidpi {
      #[allow(deprecated)]
      ns_view.setWantsBestResolutionOpenGLSurface(true);
    }

    #[allow(deprecated)] // TODO: Use define_class!
    if let Some(position) = pl_attribs.traffic_light_inset {
      let state_ptr: *mut c_void = *(**ns_view).get_ivar("taoState");
      let state = &mut *(state_ptr as *mut ViewState);
      let scale_factor = NSWindow::backingScaleFactor(ns_window);
      let position = position.to_logical(scale_factor);
      state.traffic_light_inset = Some(position);
    }

    // On Mojave, views automatically become layer-backed shortly after being added to
    // a window. Changing the layer-backedness of a view breaks the association between
    // the view and its associated OpenGL context. To work around this, on Mojave we
    // explicitly make the view layer-backed up front so that AppKit doesn't do it
    // itself and break the association with its context.
    if f64::floor(appkit::NSAppKitVersionNumber) > appkit::NSAppKitVersionNumber10_12 {
      ns_view.setWantsLayer(true);
    }

    (ns_view, cursor_state)
  })
}

fn create_window(
  attrs: &WindowAttributes,
  pl_attrs: &PlatformSpecificWindowBuilderAttributes,
) -> Option<R
```