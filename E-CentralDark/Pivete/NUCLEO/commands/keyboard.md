# COMANDO - keyboard.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\linux\keyboard.rs
**SHA:** a4c734af0dd2b004
**Timestamp:** 2026-08-28T02:35:51.259023
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: investigate mapping. Map Meta_[LR]?
- // TODO: more mappings (media etc)

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

use super::KeyEventExtra;
use crate::{
  event::{ElementState, KeyEvent},
  keyboard::{Key, KeyCode, KeyLocation, ModifiersState, NativeKeyCode},
};
use gtk::{
  gdk::{self, keys::constants::*, EventKey},
  glib,
};
use once_cell::sync::Lazy;
use std::{
  collections::HashSet,
  ffi::c_void,
  os::raw::{c_int, c_uint},
  ptr, slice,
  sync::Mutex,
};

pub type RawKey = gdk::keys::Key;

static KEY_STRINGS: Lazy<Mutex<HashSet<&'static str>>> = Lazy::new(|| Mutex::new(HashSet::new()));

fn insert_or_get_key_str(string: String) -> &'static str {
  let mut string_set = KEY_STRINGS.lock().unwrap();
  if let Some(contained) = string_set.get(string.as_str()) {
    return contained;
  }
  let static_str = Box::leak(string.into_boxed_str());
  string_set.insert(static_str);
  static_str
}

#[allow(clippy::just_underscores_and_digits, non_upper_case_globals)]
pub(crate) fn raw_key_to_key(gdk_key: RawKey) -> Option<Key<'static>> {
  match gdk_key {
    Escape => Some(Key::Escape),
    BackSpace => Some(Key::Backspace),
    Tab | ISO_Left_Tab => Some(Key::Tab),
    Return => Some(Key::Enter),
    Control_L | Control_R => Some(Key::Control),
    Alt_L | Alt_R => Some(Key::Alt),
    Shift_L | Shift_R => Some(Key::Shift),
    // TODO: investigate mapping. Map Meta_[LR]?
    Super_L | Super_R => Some(Key::Super),
    Caps_Lock => Some(Key::CapsLock),
    F1 => Some(Key::F1),
    F2 => Some(Key::F2),
    F3 => Some(Key::F3),
    F4 => Some(Key::F4),
    F5 => Some(Key::F5),
    F6 => Some(Key::F6),
    F7 => Some(Key::F7),
    F8 => Some(Key::F8),
    F9 => Some(Key::F9),
    F10 => Some(Key::F10),
    F11 => Some(Key::F11),
    F12 => Some(Key::F12),
    F13 => Some(Key::F13),
    F14 => Some(Key::F14),
    F15 => Some(Key::F15),
    F16 => Some(Key::F16),
    F17 => Some(Key::F17),
    F18 => Some(Key::F18),
    F19 => Some(Key::F19),
    F20 => Some(Key::F20),
    F21 => Some(Key::F21),
    F22 => Some(Key::F22),
    F23 => Some(Key::F23),
    F24 => Some(Key::F24),

    Print => Some(Key::PrintScreen),
    Scroll_Lock => Some(Key::ScrollLock),
    // Pause/Break not audio.
    Pause => Some(Key::Pause),

    Insert => Some(Key::Insert),
    Delete => Some(Key::Delete),
    Home => Some(Key::Home),
    End => Some(Key::End),
    Page_Up => Some(Key::PageUp),
    Page_Down => Some(Key::PageDown),
    Num_Lock => Some(Key::NumLock),

    Up => Some(Key::ArrowUp),
    Down => Some(Key::ArrowDown),
    Left => Some(Key::ArrowLeft),
    Right => Some(Key::ArrowRight),
    Clear => Some(Key::Clear),

    Menu => Some(Key::ContextMenu),
    WakeUp => Some(Key::WakeUp),
    Launch0 => Some(Key::LaunchApplication1),
    Launch1 => Some(Key::LaunchApplication2),
    ISO_Level3_Shift => Some(Key::AltGraph),

    KP_Begin => Some(Key::Clear),
    KP_Delete => Some(Key::Delete),
    KP_Down => Some(Key::ArrowDown),
    KP_End => Some(Key::End),
    KP_Enter => Some(Key::Enter),
    KP_F1 => Some(Key::F1),
    KP_F2 => Some(Key::F2),
    KP_F3 => Some(Key::F3),
    KP_F4 => Some(Key::F4),
    KP_Home => Some(Key::Home),
    KP_Insert => Some(Key::Insert),
    KP_Left => Some(Key::ArrowLeft),
    KP_Page_Down => Some(Key::PageDown),
    KP_Page_Up => Some(Key::PageUp),
    KP_Right => Some(Key::ArrowRight),
    // KP_Separator? What does it map to?
    KP_Tab => Some(Key::Tab),
    KP_Up => Some(Key::ArrowUp),
    // TODO: more mappings (media etc)
    _ => None,
  }
}

#[allow(clippy::just_underscores_and_digits, non_upper_case_globals)]
pub(crate) fn raw_key_to_location(raw: RawKey) -> KeyLocation {
  match raw {
    Control_L | Shift_L | Alt_L | Super_L | Meta_L => KeyLocation::Left,
    Control_R | Shift_R | Alt_R | Super_R | Meta_R => KeyLocation::Right,
    KP_0 | KP_1 | KP_2 | KP_3 | KP_4 | KP_5 | KP_6 | KP_7 | KP_8 | KP_9 | KP_Add | KP_Begin
    | KP_Decimal | KP_Delete | KP_Divide | KP_Down | KP_End | KP_Enter | KP_Equal | KP_F1
    | KP_F2 | KP_F3 | KP_F4 | KP_Home | KP_Insert | KP_Left | KP_Multiply | KP_Page_Down
    | KP_Page_Up | KP_Right | KP_Separator | KP_Space | KP_Subtract | KP_Tab | KP_Up => {
      KeyLocation::Numpad
    }
    _ => KeyLocation::Standard,
  }
}

const MODIFIER_MAP: &[(Key<'static>, ModifiersState)] = &[
  (Key::Shift, ModifiersState::SHIFT),
  (Key::Alt, ModifiersState::ALT),
  (Key::Control, ModifiersState::CONTROL),
  (Key::Super, ModifiersState::SUPER),
];

// we use the EventKey to extract the modifier mainly because
// we need to have the modifier before the second key is entered to follow
// other os' logic -- this way we can emit the new `ModifiersState` before
// we receive the next key, if needed the developer can update his local state.
pub(crate) fn get_modifiers(key: EventKey) -> ModifiersState {
  // a keycode (scancode in Windows) is a code that refers to a physical keyboard key.
  let scancode = key.hardware_keycode();
  // a keyva
```

---

# COMANDO - keyboard.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\windows\keyboard.rs
**SHA:** 086d3dddc33d003d
**Timestamp:** 2026-08-28T02:35:52.039321
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- let is_high_surrogate = (0xD800..=0xDBFF).contains(&wparam.0);
- let is_low_surrogate = (0xDC00..=0xDFFF).contains(&wparam.0);

### Ouro Bruto (primeiros 5000 chars)
```
use parking_lot::{Mutex, MutexGuard};
use std::{
  char,
  collections::{HashMap, HashSet},
  ffi::OsString,
  mem::MaybeUninit,
  os::windows::ffi::OsStringExt,
};

use windows::Win32::{
  Foundation::{HWND, LPARAM, LRESULT, WPARAM},
  UI::{
    Input::KeyboardAndMouse::{self as win32km, *},
    WindowsAndMessaging::{self as win32wm, *},
  },
};

use once_cell::sync::Lazy;
use unicode_segmentation::UnicodeSegmentation;

use crate::{
  event::{ElementState, KeyEvent},
  keyboard::{Key, KeyCode, KeyLocation, NativeKeyCode},
  platform_impl::{
    platform::{
      event_loop::ProcResult,
      keyboard_layout::{get_or_insert_str, Layout, LayoutCache, WindowsModifiers, LAYOUT_CACHE},
      KeyEventExtra,
    },
    WindowId,
  },
};

pub fn is_msg_keyboard_related(msg: u32) -> bool {
  let is_keyboard_msg = (WM_KEYFIRST..=WM_KEYLAST).contains(&msg);

  is_keyboard_msg || msg == WM_SETFOCUS || msg == WM_KILLFOCUS
}

pub type ExScancode = u16;

pub struct MessageAsKeyEvent {
  pub event: KeyEvent,
  pub is_synthetic: bool,
}

pub(crate) static KEY_EVENT_BUILDERS: Lazy<Mutex<HashMap<WindowId, KeyEventBuilder>>> =
  Lazy::new(|| Mutex::new(HashMap::new()));

/// Stores information required to make `KeyEvent`s.
///
/// A single Tao `KeyEvent` contains information which the Windows API passes to the application
/// in multiple window messages. In other words: a Tao `KeyEvent` cannot be built from a single
/// window message. Therefore, this type keeps track of certain information from previous events so
/// that a `KeyEvent` can be constructed when the last event related to a keypress is received.
///
/// `PeekMessage` is sometimes used to determine whether the next window message still belongs to the
/// current keypress. If it doesn't and the current state represents a key event waiting to be
/// dispatched, then said event is considered complete and is dispatched.
///
/// The sequence of window messages for a key press event is the following:
/// - Exactly one WM_KEYDOWN / WM_SYSKEYDOWN
/// - Zero or one WM_DEADCHAR / WM_SYSDEADCHAR
/// - Zero or more WM_CHAR / WM_SYSCHAR. These messages each come with a UTF-16 code unit which when
///   put together in the sequence they arrived in, forms the text which is the result of pressing the
///   key.
///
/// Key release messages are a bit different due to the fact that they don't contribute to
/// text input. The "sequence" only consists of one WM_KEYUP / WM_SYSKEYUP event.
#[derive(Default)]
pub struct KeyEventBuilder {
  event_info: Option<PartialKeyEventInfo>,
}
impl KeyEventBuilder {
  /// Call this function for every window message.
  /// Returns Some() if this window message completes a KeyEvent.
  /// Returns None otherwise.
  pub(crate) fn process_message(
    &mut self,
    hwnd: HWND,
    msg_kind: u32,
    wparam: WPARAM,
    lparam: LPARAM,
    result: &mut ProcResult,
  ) -> Vec<MessageAsKeyEvent> {
    match msg_kind {
      win32wm::WM_SETFOCUS => {
        // synthesize keydown events
        let kbd_state = get_async_kbd_state();
        let key_events = self.synthesize_kbd_state(ElementState::Pressed, &kbd_state);
        if !key_events.is_empty() {
          return key_events;
        }
      }
      win32wm::WM_KILLFOCUS => {
        // sythesize keyup events
        let kbd_state = get_kbd_state();
        let key_events = self.synthesize_kbd_state(ElementState::Released, &kbd_state);
        if !key_events.is_empty() {
          return key_events;
        }
      }
      win32wm::WM_KEYDOWN | win32wm::WM_SYSKEYDOWN => {
        if msg_kind == WM_SYSKEYDOWN && wparam.0 == usize::from(VK_F4.0) {
          // Don't dispatch Alt+F4 to the application.
          // This is handled in `event_loop.rs`
          return vec![];
        }

        if msg_kind == win32wm::WM_SYSKEYDOWN {
          *result = ProcResult::DefSubclassProc;
        } else {
          *result = ProcResult::Value(LRESULT(0));
        }

        let mut layouts = LAYOUT_CACHE.lock();
        let event_info =
          PartialKeyEventInfo::from_message(wparam, lparam, ElementState::Pressed, &mut layouts);

        let mut next_msg = MaybeUninit::uninit();
        let peek_retval = unsafe {
          PeekMessageW(
            next_msg.as_mut_ptr(),
            Some(hwnd),
            WM_KEYFIRST,
            WM_KEYLAST,
            PM_NOREMOVE,
          )
        };
        let has_next_key_message = peek_retval.as_bool();
        self.event_info = None;
        let mut finished_event_info = Some(event_info);
        if has_next_key_message {
          let next_msg = unsafe { next_msg.assume_init() };
          let next_msg_kind = next_msg.message;
          let next_belongs_to_this = !matches!(
            next_msg_kind,
            win32wm::WM_KEYDOWN | win32wm::WM_SYSKEYDOWN | win32wm::WM_KEYUP | win32wm::WM_SYSKEYUP
          );
          if next_belongs_to_this {
            self.event_info = finished_event_info.take();
          } else {
            let (_, layout) = layouts.ge
```