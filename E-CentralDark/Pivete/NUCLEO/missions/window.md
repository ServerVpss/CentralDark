# MISSAO - window.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\window.rs
**SHA:** 1c3d9ea5812f08c1
**Timestamp:** 2026-08-28T02:35:50.562074
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Unsupported in gtk4
- // TODO: Unsupported in gtk4
- // TODO: Unsupported in gtk4
- // TODO: Unsupported in gtk4

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

//! The `Window` struct and associated types.
use std::fmt;

use crate::{
  dpi::{LogicalSize, PhysicalPosition, PhysicalSize, Pixel, PixelUnit, Position, Size},
  error::{ExternalError, NotSupportedError, OsError},
  event_loop::EventLoopWindowTarget,
  monitor::{MonitorHandle, VideoMode},
  platform_impl,
};

pub use crate::icon::{BadIcon, Icon};

/// Progress State
#[derive(Debug, Clone, Copy)]
pub enum ProgressState {
  None,
  Normal,
  /// **Treated as Normal in linux and macOS**
  Indeterminate,
  /// **Treated as Normal in linux**
  Paused,
  /// **Treated as Normal in linux**
  Error,
}

pub struct ProgressBarState {
  /// The progress bar state.
  pub state: Option<ProgressState>,
  /// The progress bar progress. This can be a value ranging from `0` to `100`
  pub progress: Option<u64>,
  /// The `.desktop` filename with the Unity desktop window manager, for example `myapp.desktop` **Linux Only**
  pub desktop_filename: Option<String>,
}

/// Represents a window.
///
/// # Example
///
/// ```no_run
/// use tao::{
///     event::{Event, WindowEvent},
///     event_loop::{ControlFlow, EventLoop},
///     window::Window,
/// };
///
/// let mut event_loop = EventLoop::new();
/// let window = Window::new(&event_loop).unwrap();
///
/// event_loop.run(move |event, _, control_flow| {
///     *control_flow = ControlFlow::Wait;
///
///     match event {
///         Event::WindowEvent {
///             event: WindowEvent::CloseRequested,
///             ..
///         } => *control_flow = ControlFlow::Exit,
///         _ => (),
///     }
/// });
/// ```
pub struct Window {
  pub(crate) window: platform_impl::Window,
}

impl fmt::Debug for Window {
  fn fmt(&self, fmtr: &mut fmt::Formatter<'_>) -> fmt::Result {
    fmtr.pad("Window { .. }")
  }
}

impl Drop for Window {
  fn drop(&mut self) {
    // If the window is in exclusive fullscreen, we must restore the desktop
    // video mode (generally this would be done on application exit, but
    // closing the window doesn't necessarily always mean application exit,
    // such as when there are multiple windows)
    if let Some(Fullscreen::Exclusive(_)) = self.fullscreen() {
      self.set_fullscreen(None);
    }
  }
}

/// Type alias for a color in the RGBA format.
///
/// Each value can be 0..255 inclusive.
pub type RGBA = (u8, u8, u8, u8);

/// Identifier of a window. Unique for each window.
///
/// Can be obtained with `window.id()`.
///
/// Whenever you receive an event specific to a window, this event contains a `WindowId` which you
/// can then compare to the ids of your windows.
#[derive(Debug, Copy, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub struct WindowId(pub(crate) platform_impl::WindowId);

impl WindowId {
  /// # Safety
  /// Returns a dummy `WindowId`, useful for unit testing. The only guarantee made about the return
  /// value of this function is that it will always be equal to itself and to future values returned
  /// by this function.  No other guarantees are made. This may be equal to a real `WindowId`.
  ///
  /// **Passing this into a tao function will result in undefined behavior.**
  pub unsafe fn dummy() -> Self {
    WindowId(platform_impl::WindowId::dummy())
  }
}

/// Object that allows you to build windows.
#[derive(Clone, Default)]
pub struct WindowBuilder {
  /// The attributes to use to create the window.
  pub window: WindowAttributes,

  // Platform-specific configuration.
  pub(crate) platform_specific: platform_impl::PlatformSpecificWindowBuilderAttributes,
}

impl fmt::Debug for WindowBuilder {
  fn fmt(&self, fmtr: &mut fmt::Formatter<'_>) -> fmt::Result {
    fmtr
      .debug_struct("WindowBuilder")
      .field("window", &self.window)
      .finish()
  }
}

/// Attributes to use when creating a window.
#[derive(Debug, Clone)]
pub struct WindowAttributes {
  /// The dimensions of the window. If this is `None`, some platform-specific dimensions will be
  /// used.
  ///
  /// The default is `None`.
  pub inner_size: Option<Size>,

  /// The window size constraints
  pub inner_size_constraints: WindowSizeConstraints,

  /// The desired position of the window. If this is `None`, some platform-specific position
  /// will be chosen.
  ///
  /// The default is `None`.
  ///
  /// ## Platform-specific
  ///
  /// - **macOS**: The top left corner position of the window content, the window's "inner"
  ///   position. The window title bar will be placed above it.
  ///   The window will be positioned such that it fits on screen, maintaining
  ///   set `inner_size` if any.
  ///   If you need to precisely position the top left corner of the whole window you have to
  ///   use [`Window::set_outer_position`] after creating the window.
  /// - **Windows**: The top left corner position of the window title bar, the window's "outer"
  ///   position.
  ///   There may be a 
```