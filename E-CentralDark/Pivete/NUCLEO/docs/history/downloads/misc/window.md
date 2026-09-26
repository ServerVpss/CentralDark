# OUTRO - window.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\ios\window.rs
**SHA:** 6f5e70b1515a836e
**Timestamp:** 2026-08-28T02:35:51.217053
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: track fullscreen instead of relying on brittle float comparisons
- // TODO: transparency, visible

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

use std::{
  collections::VecDeque,
  ops::{Deref, DerefMut},
};

use objc2::{
  rc::Retained,
  runtime::{AnyClass, AnyObject},
  MainThreadMarker,
};
use objc2_ui_kit::{
  UIApplication, UISceneActivationState, UISceneSessionActivationRequest, UIWindow,
};

use crate::{
  dpi::{self, LogicalPosition, LogicalSize, PhysicalPosition, PhysicalSize, Position, Size},
  error::{ExternalError, NotSupportedError, OsError as RootOsError},
  event::{Event, WindowEvent},
  icon::Icon,
  monitor::MonitorHandle as RootMonitorHandle,
  platform::ios::{operating_system_version, MonitorHandleExtIOS, ScreenEdge, ValidOrientations},
  platform_impl::platform::{
    app_state,
    event_loop::{self, EventProxy, EventWrapper},
    ffi::{
      id, CGFloat, CGPoint, CGRect, CGSize, UIEdgeInsets, UIInterfaceOrientationMask, UIRectEdge,
      UIScreenOverscanCompensation, NO, YES,
    },
    monitor, set_badge_count, view, EventLoopWindowTarget, MonitorHandle,
  },
  window::{
    CursorIcon, Fullscreen, ResizeDirection, Theme, UserAttentionType, WindowAttributes,
    WindowId as RootWindowId, WindowSizeConstraints,
  },
};

pub struct Inner {
  pub window: id,
  pub view_controller: id,
  pub view: id,
  gl_or_metal_backed: bool,
}

impl Drop for Inner {
  fn drop(&mut self) {
    unsafe {
      let window = self.window();
      if let Some(scene) = window.windowScene() {
        // our windows are tied to scenes - so when this is the last window of the scene,
        // request the scene to be destroyed
        if scene.windows().count() == 1 {
          let mtm = MainThreadMarker::new().unwrap();
          let application = UIApplication::sharedApplication(mtm);
          application.requestSceneSessionDestruction_options_errorHandler(
            &scene.session(),
            None,
            None,
          );
        }
      }
      let () = msg_send![self.view, release];
      let () = msg_send![self.view_controller, release];
      let () = msg_send![self.window, release];

      app_state::handle_nonuser_event(EventWrapper::StaticEvent(Event::WindowEvent {
        window_id: RootWindowId(self.window.into()),
        event: WindowEvent::Focused(false),
      }));
    }
  }
}

impl Inner {
  pub fn set_title(&self, _title: &str) {
    debug!("`Window::set_title` is ignored on iOS")
  }

  pub fn title(&self) -> String {
    String::new()
  }
  pub fn set_visible(&self, visible: bool) {
    match visible {
      true => unsafe {
        let () = msg_send![self.window, setHidden: NO];
      },
      false => unsafe {
        let () = msg_send![self.window, setHidden: YES];
      },
    }
  }

  pub fn set_focus(&self) {
    unsafe {
      let window = self.window();
      // only call makeKeyAndVisible() when Info.plist was not set up to support scenes
      let Some(scene) = window.windowScene() else {
        window.makeKeyAndVisible();
        return;
      };
      let mtm = MainThreadMarker::new().unwrap();
      let application = UIApplication::sharedApplication(mtm);

      let error_handler = block2::RcBlock::new(move |error| {
        log::error!("error activating scene: {error:?}");
      });

      // when we support multiple scenes, request the activation of this window's scene
      if application.supportsMultipleScenes() {
        if operating_system_version().0 >= 17 {
          application.activateSceneSessionForRequest_errorHandler(
            &UISceneSessionActivationRequest::request(),
            Some(&error_handler),
          );
        } else {
          #[allow(deprecated)]
          application.requestSceneSessionActivation_userActivity_options_errorHandler(
            Some(&scene.session()),
            None,
            None,
            Some(&error_handler),
          );
        }
      } else {
        window.makeKeyAndVisible();
      }
    }
  }

  pub fn set_focusable(&self, _focusable: bool) {
    warn!("set_focusable not yet implemented on iOS");
  }

  pub fn is_focused(&self) -> bool {
    unsafe {
      self
        .window()
        .windowScene()
        .map(|scene| scene.activationState() == UISceneActivationState::ForegroundActive)
        .unwrap_or_default()
    }
  }

  pub fn is_always_on_top(&self) -> bool {
    log::warn!("`Window::is_always_on_top` is ignored on iOS");
    false
  }

  pub fn request_redraw(&self) {
    unsafe {
      if self.gl_or_metal_backed {
        // `setNeedsDisplay` does nothing on UIViews which are directly backed by CAEAGLLayer or CAMetalLayer.
        // Ordinarily the OS sets up a bunch of UIKit state before calling drawRect: on a UIView, but when using
        // raw or gl/metal for drawing this work is completely avoided.
        //
        // The docs for `setNeedsDisplay` don't mention `CAMetalLayer`; however, this has been confirmed via
        // testing.
        //
        // https:/
```