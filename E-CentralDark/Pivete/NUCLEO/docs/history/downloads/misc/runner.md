# OUTRO - runner.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\windows\event_loop\runner.rs
**SHA:** 03851663144985dd
**Timestamp:** 2026-08-28T02:35:52.148806
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: self.last_events_cleared.get(),
- start: self.last_events_cleared.get(),
- start: self.last_events_cleared.get(),

### Gaps
- // TODO: Consider removing log once https://github.com/rust-windowing/winit/pull/2767 gets adopted.
- // TODO: Consider removing log once https://github.com/rust-windowing/winit/pull/2767 gets adopted.
- // TODO: Consider removing log once https://github.com/rust-windowing/winit/pull/2767 gets adopted.

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

use std::{
  any::Any,
  cell::{Cell, RefCell},
  collections::{HashSet, VecDeque},
  mem, panic,
  rc::Rc,
  time::Instant,
};

use windows::Win32::{
  Foundation::HWND,
  Graphics::Gdi::{RedrawWindow, RDW_INTERNALPAINT},
};

use crate::{
  dpi::PhysicalSize,
  event::{Event, StartCause, WindowEvent},
  event_loop::ControlFlow,
  platform_impl::platform::util,
  window::WindowId,
};

pub(crate) type EventLoopRunnerShared<T> = Rc<EventLoopRunner<T>>;
pub(crate) struct EventLoopRunner<T: 'static> {
  // The event loop's win32 handles
  thread_msg_target: HWND,
  wait_thread_id: u32,

  control_flow: Cell<ControlFlow>,
  runner_state: Cell<RunnerState>,
  last_events_cleared: Cell<Instant>,

  event_handler: Cell<Option<Box<dyn FnMut(Event<'_, T>, &mut ControlFlow)>>>,
  event_buffer: RefCell<VecDeque<BufferedEvent<T>>>,

  owned_windows: Cell<HashSet<isize>>,

  panic_error: Cell<Option<PanicError>>,
}

pub type PanicError = Box<dyn Any + Send + 'static>;

/// See `move_state_to` function for details on how the state loop works.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
enum RunnerState {
  /// The event loop has just been created, and an `Init` event must be sent.
  Uninitialized,
  /// The event loop is idling.
  Idle,
  /// The event loop is handling the OS's events and sending them to the user's callback.
  /// `NewEvents` has been sent, and `MainEventsCleared` hasn't.
  HandlingMainEvents,
  /// The event loop is handling the redraw events and sending them to the user's callback.
  /// `MainEventsCleared` has been sent, and `RedrawEventsCleared` hasn't.
  HandlingRedrawEvents,
  /// The event loop has been destroyed. No other events will be emitted.
  Destroyed,
}

enum BufferedEvent<T: 'static> {
  Event(Event<'static, T>),
  ScaleFactorChanged(WindowId, f64, PhysicalSize<u32>),
}

impl<T> EventLoopRunner<T> {
  pub(crate) fn new(thread_msg_target: HWND, wait_thread_id: u32) -> EventLoopRunner<T> {
    EventLoopRunner {
      thread_msg_target,
      wait_thread_id,
      runner_state: Cell::new(RunnerState::Uninitialized),
      control_flow: Cell::new(ControlFlow::Poll),
      panic_error: Cell::new(None),
      last_events_cleared: Cell::new(Instant::now()),
      event_handler: Cell::new(None),
      event_buffer: RefCell::new(VecDeque::new()),
      owned_windows: Cell::new(HashSet::new()),
    }
  }

  pub(crate) unsafe fn set_event_handler<F>(&self, f: F)
  where
    F: FnMut(Event<'_, T>, &mut ControlFlow),
  {
    let old_event_handler = self.event_handler.replace(mem::transmute::<
      Option<Box<dyn FnMut(Event<'_, T>, &mut ControlFlow)>>,
      Option<Box<dyn FnMut(Event<'_, T>, &mut ControlFlow)>>,
    >(Some(Box::new(f))));
    assert!(old_event_handler.is_none());
  }

  pub(crate) fn reset_runner(&self) {
    let EventLoopRunner {
      thread_msg_target: _,
      wait_thread_id: _,
      runner_state,
      panic_error,
      control_flow,
      last_events_cleared: _,
      event_handler,
      event_buffer: _,
      owned_windows: _,
    } = self;
    runner_state.set(RunnerState::Uninitialized);
    panic_error.set(None);
    control_flow.set(ControlFlow::Poll);
    event_handler.set(None);
  }
}

/// State retrieval functions.
impl<T> EventLoopRunner<T> {
  pub fn thread_msg_target(&self) -> HWND {
    self.thread_msg_target
  }

  pub fn wait_thread_id(&self) -> u32 {
    self.wait_thread_id
  }

  pub fn redrawing(&self) -> bool {
    self.runner_state.get() == RunnerState::HandlingRedrawEvents
  }

  pub fn take_panic_error(&self) -> Result<(), PanicError> {
    match self.panic_error.take() {
      Some(err) => Err(err),
      None => Ok(()),
    }
  }

  pub fn control_flow(&self) -> ControlFlow {
    self.control_flow.get()
  }

  pub fn handling_events(&self) -> bool {
    self.runner_state.get() != RunnerState::Idle
  }

  pub fn should_buffer(&self) -> bool {
    let handler = self.event_handler.take();
    let should_buffer = handler.is_none();
    self.event_handler.set(handler);
    should_buffer
  }
}

/// Misc. functions
impl<T> EventLoopRunner<T> {
  pub fn catch_unwind<R>(&self, f: impl FnOnce() -> R) -> Option<R> {
    let panic_error = self.panic_error.take();
    if panic_error.is_none() {
      let result = panic::catch_unwind(panic::AssertUnwindSafe(f));

      // Check to see if the panic error was set in a re-entrant call to catch_unwind inside
      // of `f`. If it was, that error takes priority. If it wasn't, check if our call to
      // catch_unwind caught any panics and set panic_error appropriately.
      match self.panic_error.take() {
        None => match result {
          Ok(r) => Some(r),
          Err(e) => {
            self.panic_error.set(Some(e));
            None
          }
        },
        Some(e) => {
          self.panic_error.set(Some(e));
          None
        }
      
```