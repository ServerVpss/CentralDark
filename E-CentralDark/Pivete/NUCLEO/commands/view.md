# COMANDO - view.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\ios\view.rs
**SHA:** e4afb24d37a1c3fe
**Timestamp:** 2026-08-28T02:35:51.189714
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- config.setDelegateClass(Some(super::scene::TaoSceneDelegate::class()));

### Gaps
- #[allow(deprecated)] // TODO: define_class!
- #[allow(deprecated)] // TODO: define_class!
- #[allow(deprecated)] // TODO: define_class!

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

use std::{
  collections::HashMap,
  ffi::{c_char, CStr, CString},
};

use objc2::{
  rc::Retained,
  runtime::{AnyClass as Class, AnyObject as Object, ClassBuilder as ClassDecl, Sel},
  ClassType, MainThreadMarker,
};
use objc2_foundation::NSString;
use objc2_ui_kit::{
  UIApplication, UISceneActivationRequestOptions, UISceneConfiguration,
  UISceneSessionActivationRequest,
};

use crate::{
  dpi::PhysicalPosition,
  event::{DeviceId as RootDeviceId, Event, Force, Touch, TouchPhase, WindowEvent},
  platform::ios::{operating_system_version, MonitorHandleExtIOS},
  platform_impl::platform::{
    app_state::{self, OSCapabilities},
    event_loop::{self, EventProxy, EventWrapper},
    ffi::{
      id, nil, CGFloat, CGPoint, CGRect, UIForceTouchCapability, UIInterfaceOrientationMask,
      UIRectEdge, UITouchPhase, UITouchType, BOOL, NO, YES,
    },
    scene::{app_supports_multiple_scenes, multiple_scenes_enabled},
    window::PlatformSpecificWindowBuilderAttributes,
    DeviceId,
  },
  window::{Fullscreen, WindowAttributes, WindowId as RootWindowId},
};

macro_rules! add_property {
    (
        $decl:ident,
        $name:ident: $t:ty,
        $setter_name:ident: |$object:ident| $after_set:expr,
        $getter_name:ident,
    ) => {
        add_property!(
            $decl,
            $name: $t,
            $setter_name: true, |_, _|{}; |$object| $after_set,
            $getter_name,
        )
    };
    (
        $decl:ident,
        $name:ident: $t:ty,
        $setter_name:ident: $capability:expr, $err:expr; |$object:ident| $after_set:expr,
        $getter_name:ident,
    ) => {
        {
            const VAR_NAME: &'static str = concat!("_", stringify!($name));
            $decl.add_ivar::<$t>(&CString::new(VAR_NAME).unwrap());
            let setter = if $capability {
                #[allow(non_snake_case)]
                extern "C" fn $setter_name($object: &mut Object, _: Sel, value: $t) {
                    #[allow(deprecated)] // TODO: define_class!
                    unsafe {
                        *$object.get_mut_ivar::<$t>(VAR_NAME) = value;
                    }
                    $after_set
                }
                $setter_name
            } else {
                #[allow(non_snake_case)]
                extern "C" fn $setter_name($object: &mut Object, _: Sel, value: $t) {
                    #[allow(deprecated)] // TODO: define_class!
                    unsafe {
                        *$object.get_mut_ivar::<$t>(VAR_NAME) = value;
                    }
                    $err(&app_state::os_capabilities(), "ignoring")
                }
                $setter_name
            };
            #[allow(non_snake_case)]
            extern "C" fn $getter_name($object: &Object, _: Sel) -> $t {
                #[allow(deprecated)] // TODO: define_class!
                unsafe { *$object.get_ivar::<$t>(VAR_NAME) }
            }
            $decl.add_method(
                sel!($setter_name:),
                setter as extern "C" fn(_, _, _),
            );
            $decl.add_method(
                sel!($getter_name),
                $getter_name as extern "C" fn(_, _) -> _,
            );
        }
    };
}

// requires main thread
unsafe fn get_view_class(root_view_class: &'static Class) -> &'static Class {
  static mut CLASSES: Option<HashMap<*const Class, &'static Class>> = None;
  static mut ID: usize = 0;

  if CLASSES.is_none() {
    CLASSES = Some(HashMap::default());
  }

  let classes = CLASSES.as_mut().unwrap();

  classes.entry(root_view_class).or_insert_with(move || {
    let uiview_class = class!(UIView);
    let is_uiview: bool = msg_send![root_view_class, isSubclassOfClass: uiview_class];
    assert!(is_uiview, "`root_view_class` must inherit from `UIView`");

    extern "C" fn draw_rect(object: &Object, _: Sel, rect: CGRect) {
      unsafe {
        let window: id = msg_send![object, window];
        assert!(!window.is_null());
        app_state::handle_nonuser_events(
          std::iter::once(EventWrapper::StaticEvent(Event::RedrawRequested(
            RootWindowId(window.into()),
          )))
          .chain(std::iter::once(EventWrapper::StaticEvent(
            Event::RedrawEventsCleared,
          ))),
        );
        let superclass: &'static Class = msg_send![object, superclass];
        let () = msg_send![super(object, superclass), drawRect: rect];
      }
    }

    extern "C" fn layout_subviews(object: &Object, _: Sel) {
      unsafe {
        let superclass: &'static Class = msg_send![object, superclass];
        let () = msg_send![super(object, superclass), layoutSubviews];

        let window: id = msg_send![object, window];
        assert!(!window.is_null());
        let window_bounds: CGRect = msg_send![window, bounds];
        let screen: id = msg_send![window, screen];
        let screen
```