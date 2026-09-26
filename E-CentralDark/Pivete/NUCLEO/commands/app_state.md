# COMANDO - app_state.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\ios\app_state.rs
**SHA:** a5924e36d51a3201
**Timestamp:** 2026-08-28T02:35:51.148511
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: Instant,
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();
- let start = Instant::now();

### Contratos
- // instead of on AppDelegate::didFinishLaunching

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

#![deny(unused_results)]

use std::{
  cell::{RefCell, RefMut},
  collections::HashSet,
  mem,
  os::raw::c_void,
  ptr,
  time::Instant,
};

use objc2::{rc::Retained, runtime::AnyObject, MainThreadMarker, Message};
use objc2_ui_kit::{UIApplication, UIScene, UISceneConnectionOptions, UIWindowScene};

use crate::{
  dpi::LogicalSize,
  event::{Event, StartCause, WindowEvent},
  event_loop::ControlFlow,
  platform_impl::platform::{
    event_loop::{EventHandler, EventProxy, EventWrapper},
    ffi::{
      id, kCFRunLoopCommonModes, CFAbsoluteTimeGetCurrent, CFRelease, CFRunLoopAddTimer,
      CFRunLoopGetMain, CFRunLoopRef, CFRunLoopTimerCreate, CFRunLoopTimerInvalidate,
      CFRunLoopTimerRef, CFRunLoopTimerSetNextFireDate, CGRect, CGSize, NSInteger,
      NSOperatingSystemVersion, NSUInteger,
    },
    scene::multiple_scenes_enabled,
  },
  window::WindowId as RootWindowId,
};

macro_rules! bug {
    ($($msg:tt)*) => {
        panic!("tao iOS bug, file an issue: {}", format!($($msg)*))
    };
}

macro_rules! bug_assert {
    ($test:expr, $($msg:tt)*) => {
        assert!($test, "tao iOS bug, file an issue: {}", format!($($msg)*))
    };
}

enum UserCallbackTransitionResult<'a> {
  Success {
    event_handler: Box<dyn EventHandler>,
    active_control_flow: ControlFlow,
    processing_redraws: bool,
  },
  ReentrancyPrevented {
    queued_events: &'a mut Vec<EventWrapper>,
  },
}

// this is the state machine for the app lifecycle
#[derive(Debug)]
#[must_use = "dropping `AppStateImpl` without inspecting it is probably a bug"]
enum AppStateImpl {
  NotLaunched {
    queued_windows: Vec<id>,
    queued_events: Vec<EventWrapper>,
    queued_gpu_redraws: HashSet<id>,
  },
  Launching {
    queued_windows: Vec<id>,
    queued_events: Vec<EventWrapper>,
    queued_event_handler: Box<dyn EventHandler>,
    queued_gpu_redraws: HashSet<id>,
  },
  ProcessingEvents {
    event_handler: Box<dyn EventHandler>,
    queued_gpu_redraws: HashSet<id>,
    active_control_flow: ControlFlow,
  },
  // special state to deal with reentrancy and prevent mutable aliasing.
  InUserCallback {
    queued_events: Vec<EventWrapper>,
    queued_gpu_redraws: HashSet<id>,
  },
  ProcessingRedraws {
    event_handler: Box<dyn EventHandler>,
    active_control_flow: ControlFlow,
  },
  Waiting {
    waiting_event_handler: Box<dyn EventHandler>,
    start: Instant,
  },
  PollFinished {
    waiting_event_handler: Box<dyn EventHandler>,
  },
  Terminated,
}

struct AppState {
  // This should never be `None`, except for briefly during a state transition.
  app_state: Option<AppStateImpl>,
  control_flow: ControlFlow,
  waker: EventLoopWaker,
  // Stores the UIWindow instances that do not have a scene assigned yet
  // Window::new might create a window before a scene is ready for it,
  // requesting a new scene to be activated and deferring the setWindowScene call to the scene delegate
  windows_for_next_scenes: Vec<id>,
  did_first_scene_connect: bool,
}

impl Drop for AppState {
  fn drop(&mut self) {
    match self.state_mut() {
      &mut AppStateImpl::NotLaunched {
        ref mut queued_windows,
        ..
      }
      | &mut AppStateImpl::Launching {
        ref mut queued_windows,
        ..
      } => {
        for &mut window in queued_windows {
          unsafe {
            let () = msg_send![window, release];
          }
        }
      }
      _ => {}
    }
  }
}

impl AppState {
  // requires main thread
  unsafe fn get_mut() -> RefMut<'static, AppState> {
    // basically everything in UIKit requires the main thread, so it's pointless to use the
    // std::sync APIs.
    // must be mut because plain `static` requires `Sync`
    static mut APP_STATE: RefCell<Option<AppState>> = RefCell::new(None);

    if cfg!(debug_assertions) {
      assert_main_thread!(
        "bug in tao: `AppState::get_mut()` can only be called on the main thread"
      );
    }
    let mut guard = APP_STATE.borrow_mut();
    if guard.is_none() {
      #[inline(never)]
      #[cold]
      unsafe fn init_guard(guard: &mut RefMut<'static, Option<AppState>>) {
        let waker = EventLoopWaker::new(CFRunLoopGetMain());
        **guard = Some(AppState {
          app_state: Some(AppStateImpl::NotLaunched {
            queued_windows: Vec::new(),
            queued_events: Vec::new(),
            queued_gpu_redraws: HashSet::new(),
          }),
          control_flow: ControlFlow::default(),
          waker,
          windows_for_next_scenes: Vec::new(),
          did_first_scene_connect: false,
        });
      }
      init_guard(&mut guard)
    }
    RefMut::map(guard, |state| state.as_mut().unwrap())
  }

  fn state(&self) -> &AppStateImpl {
    match &self.app_state {
      Some(ref state) => state,
      None => bug!("`AppState` previously failed a state transition"),
    }
  }

  fn state_mut(&mu
```

---

# COMANDO - app_state.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\macos\app_state.rs
**SHA:** 493be209ef786af3
**Timestamp:** 2026-08-28T02:35:51.498930
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = HANDLER.get_start_time().unwrap();

### Contratos
- pub fn launched(app_delegate: &Object) {
- fn apply_activation_policy(app_delegate: &Object) {

### Gaps
- // TODO: Proper ordering of the windows
- // TODO: Also filter on the type/"level" of the window, and maybe other things?

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

use std::{
  cell::{RefCell, RefMut},
  collections::VecDeque,
  fmt::{self, Debug},
  hint::unreachable_unchecked,
  mem,
  rc::{Rc, Weak},
  sync::{
    atomic::{AtomicBool, Ordering},
    Mutex, MutexGuard,
  },
  time::Instant,
};

use objc2::{msg_send, rc::Retained, runtime::AnyObject as Object};
use objc2_app_kit::{NSApp, NSApplication, NSApplicationActivationPolicy, NSWindow};
use objc2_foundation::{MainThreadMarker, NSAutoreleasePool, NSSize};
use once_cell::sync::Lazy;

use crate::{
  dpi::LogicalSize,
  event::{Event, StartCause, WindowEvent},
  event_loop::{ControlFlow, EventLoopWindowTarget as RootWindowTarget},
  platform::macos::ActivationPolicy,
  platform_impl::{
    get_aux_state_mut,
    platform::{
      event::{EventProxy, EventWrapper},
      event_loop::{post_dummy_event, PanicInfo},
      ffi::{id, nil},
      observer::{CFRunLoopGetMain, CFRunLoopWakeUp, EventLoopWaker},
      util::{self, Never},
      window::get_window_id,
    },
  },
  window::WindowId,
};

use super::set_dock_visibility;

static HANDLER: Lazy<Handler> = Lazy::new(|| Default::default());

impl<'a, Never> Event<'a, Never> {
  fn userify<T: 'static>(self) -> Event<'a, T> {
    self
      .map_nonuser_event()
      // `Never` can't be constructed, so the `UserEvent` variant can't
      // be present here.
      .unwrap_or_else(|_| unsafe { unreachable_unchecked() })
  }
}

pub trait EventHandler: Debug {
  // Not sure probably it should accept Event<'static, Never>
  fn handle_nonuser_event(&mut self, event: Event<'_, Never>, control_flow: &mut ControlFlow);
  fn handle_user_events(&mut self, control_flow: &mut ControlFlow);
}

struct EventLoopHandler<T: 'static> {
  callback: Weak<RefCell<dyn FnMut(Event<'_, T>, &RootWindowTarget<T>, &mut ControlFlow)>>,
  window_target: Rc<RootWindowTarget<T>>,
}

impl<T> EventLoopHandler<T> {
  fn with_callback<F>(&mut self, f: F)
  where
    F: FnOnce(
      &mut EventLoopHandler<T>,
      RefMut<'_, dyn FnMut(Event<'_, T>, &RootWindowTarget<T>, &mut ControlFlow)>,
    ),
  {
    if let Some(callback) = self.callback.upgrade() {
      let callback = callback.borrow_mut();
      (f)(self, callback);
    } else {
      panic!(
        "Tried to dispatch an event, but the event loop that \
                owned the event handler callback seems to be destroyed"
      );
    }
  }
}

impl<T> Debug for EventLoopHandler<T> {
  fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
    formatter
      .debug_struct("EventLoopHandler")
      .field("window_target", &self.window_target)
      .finish()
  }
}

impl<T> EventHandler for EventLoopHandler<T> {
  fn handle_nonuser_event(&mut self, event: Event<'_, Never>, control_flow: &mut ControlFlow) {
    self.with_callback(|this, mut callback| {
      if let ControlFlow::ExitWithCode(code) = *control_flow {
        let dummy = &mut ControlFlow::ExitWithCode(code);
        (callback)(event.userify(), &this.window_target, dummy);
      } else {
        (callback)(event.userify(), &this.window_target, control_flow);
      }
    });
  }

  fn handle_user_events(&mut self, control_flow: &mut ControlFlow) {
    self.with_callback(|this, mut callback| {
      for event in this.window_target.p.receiver.try_iter() {
        if let ControlFlow::ExitWithCode(code) = *control_flow {
          let dummy = &mut ControlFlow::ExitWithCode(code);
          (callback)(Event::UserEvent(event), &this.window_target, dummy);
        } else {
          (callback)(Event::UserEvent(event), &this.window_target, control_flow);
        }
      }
    });
  }
}

#[derive(Default)]
struct Handler {
  ready: AtomicBool,
  in_callback: AtomicBool,
  control_flow: Mutex<ControlFlow>,
  control_flow_prev: Mutex<ControlFlow>,
  start_time: Mutex<Option<Instant>>,
  callback: Mutex<Option<Box<dyn EventHandler>>>,
  pending_events: Mutex<VecDeque<EventWrapper>>,
  pending_redraw: Mutex<Vec<WindowId>>,
  waker: Mutex<EventLoopWaker>,
}

unsafe impl Send for Handler {}
unsafe impl Sync for Handler {}

impl Handler {
  fn events(&self) -> MutexGuard<'_, VecDeque<EventWrapper>> {
    self.pending_events.lock().unwrap()
  }

  fn redraw<'a>(&'a self) -> MutexGuard<'a, Vec<WindowId>> {
    self.pending_redraw.lock().unwrap()
  }

  fn waker(&self) -> MutexGuard<'_, EventLoopWaker> {
    self.waker.lock().unwrap()
  }

  fn is_ready(&self) -> bool {
    self.ready.load(Ordering::Acquire)
  }

  fn set_ready(&self) {
    self.ready.store(true, Ordering::Release);
  }

  fn should_exit(&self) -> bool {
    matches!(
      *self.control_flow.lock().unwrap(),
      ControlFlow::ExitWithCode(_)
    )
  }

  fn get_control_flow_and_update_prev(&self) -> ControlFlow {
    let control_flow = self.control_flow.lock().unwrap();
    *self.control_flow_prev.lock().unwrap() = *control_flow;
    *control_flow
  }

  fn get_old_and_n
```