# OUTRO - keyboard_layout.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\windows\keyboard_layout.rs
**SHA:** cbdb07a28d4460f2
**Timestamp:** 2026-08-28T02:35:52.085244
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- win32km::VK_EXECUTE => Key::Execute,

### Ouro Bruto (primeiros 5000 chars)
```
use once_cell::sync::Lazy;
use parking_lot::Mutex;
use std::{
  collections::{hash_map::Entry, HashMap, HashSet},
  ffi::OsString,
  os::windows::ffi::OsStringExt,
};

use windows::Win32::{
  System::SystemServices::{LANG_JAPANESE, LANG_KOREAN},
  UI::Input::KeyboardAndMouse::{self as win32km, *},
};

use super::keyboard::ExScancode;
use crate::{
  keyboard::{Key, KeyCode, ModifiersState, NativeKeyCode},
  platform_impl::platform::util,
};

pub(crate) static LAYOUT_CACHE: Lazy<Mutex<LayoutCache>> =
  Lazy::new(|| Mutex::new(LayoutCache::default()));

fn key_pressed(vkey: VIRTUAL_KEY) -> bool {
  unsafe { (GetKeyState(u32::from(vkey.0) as i32) & (1 << 15)) == (1 << 15) }
}

const NUMPAD_VKEYS: [VIRTUAL_KEY; 16] = [
  VK_NUMPAD0,
  VK_NUMPAD1,
  VK_NUMPAD2,
  VK_NUMPAD3,
  VK_NUMPAD4,
  VK_NUMPAD5,
  VK_NUMPAD6,
  VK_NUMPAD7,
  VK_NUMPAD8,
  VK_NUMPAD9,
  VK_MULTIPLY,
  VK_ADD,
  VK_SEPARATOR,
  VK_SUBTRACT,
  VK_DECIMAL,
  VK_DIVIDE,
];

static NUMPAD_KEYCODES: Lazy<HashSet<KeyCode>> = Lazy::new(|| {
  let mut keycodes = HashSet::new();
  keycodes.insert(KeyCode::Numpad0);
  keycodes.insert(KeyCode::Numpad1);
  keycodes.insert(KeyCode::Numpad2);
  keycodes.insert(KeyCode::Numpad3);
  keycodes.insert(KeyCode::Numpad4);
  keycodes.insert(KeyCode::Numpad5);
  keycodes.insert(KeyCode::Numpad6);
  keycodes.insert(KeyCode::Numpad7);
  keycodes.insert(KeyCode::Numpad8);
  keycodes.insert(KeyCode::Numpad9);
  keycodes.insert(KeyCode::NumpadMultiply);
  keycodes.insert(KeyCode::NumpadAdd);
  keycodes.insert(KeyCode::NumpadComma);
  keycodes.insert(KeyCode::NumpadSubtract);
  keycodes.insert(KeyCode::NumpadDecimal);
  keycodes.insert(KeyCode::NumpadDivide);
  keycodes
});

bitflags! {
    #[derive(Clone, Copy, Eq, PartialEq, Hash)]
    pub struct WindowsModifiers : u8 {
        const SHIFT = 1 << 0;
        const CONTROL = 1 << 1;
        const ALT = 1 << 2;
        const CAPS_LOCK = 1 << 3;
        const FLAGS_END = 1 << 4;
    }
}

impl WindowsModifiers {
  pub fn active_modifiers(key_state: &[u8; 256]) -> WindowsModifiers {
    let shift = key_state[usize::from(VK_SHIFT.0)] & 0x80 != 0;
    let lshift = key_state[usize::from(VK_LSHIFT.0)] & 0x80 != 0;
    let rshift = key_state[usize::from(VK_RSHIFT.0)] & 0x80 != 0;

    let control = key_state[usize::from(VK_CONTROL.0)] & 0x80 != 0;
    let lcontrol = key_state[usize::from(VK_LCONTROL.0)] & 0x80 != 0;
    let rcontrol = key_state[usize::from(VK_RCONTROL.0)] & 0x80 != 0;

    let alt = key_state[usize::from(VK_MENU.0)] & 0x80 != 0;
    let lalt = key_state[usize::from(VK_LMENU.0)] & 0x80 != 0;
    let ralt = key_state[usize::from(VK_RMENU.0)] & 0x80 != 0;

    let caps = key_state[usize::from(VK_CAPITAL.0)] & 0x01 != 0;

    let mut result = WindowsModifiers::empty();
    if shift || lshift || rshift {
      result.insert(WindowsModifiers::SHIFT);
    }
    if control || lcontrol || rcontrol {
      result.insert(WindowsModifiers::CONTROL);
    }
    if alt || lalt || ralt {
      result.insert(WindowsModifiers::ALT);
    }
    if caps {
      result.insert(WindowsModifiers::CAPS_LOCK);
    }

    result
  }

  pub fn apply_to_kbd_state(self, key_state: &mut [u8; 256]) {
    if self.intersects(Self::SHIFT) {
      key_state[usize::from(VK_SHIFT.0)] |= 0x80;
    } else {
      key_state[usize::from(VK_SHIFT.0)] &= !0x80;
      key_state[usize::from(VK_LSHIFT.0)] &= !0x80;
      key_state[usize::from(VK_RSHIFT.0)] &= !0x80;
    }
    if self.intersects(Self::CONTROL) {
      key_state[usize::from(VK_CONTROL.0)] |= 0x80;
    } else {
      key_state[usize::from(VK_CONTROL.0)] &= !0x80;
      key_state[usize::from(VK_LCONTROL.0)] &= !0x80;
      key_state[usize::from(VK_RCONTROL.0)] &= !0x80;
    }
    if self.intersects(Self::ALT) {
      key_state[usize::from(VK_MENU.0)] |= 0x80;
    } else {
      key_state[usize::from(VK_MENU.0)] &= !0x80;
      key_state[usize::from(VK_LMENU.0)] &= !0x80;
      key_state[usize::from(VK_RMENU.0)] &= !0x80;
    }
    if self.intersects(Self::CAPS_LOCK) {
      key_state[usize::from(VK_CAPITAL.0)] |= 0x01;
    } else {
      key_state[usize::from(VK_CAPITAL.0)] &= !0x01;
    }
  }

  /// Removes the control modifier if the alt modifier is not present.
  /// This is useful because on Windows: (Control + Alt) == AltGr
  /// but we don't want to interfere with the AltGr state.
  pub fn remove_only_ctrl(mut self) -> WindowsModifiers {
    if !self.contains(WindowsModifiers::ALT) {
      self.remove(WindowsModifiers::CONTROL);
    }
    self
  }
}

pub(crate) struct Layout {
  pub hkl: isize,

  /// Maps numpad keys from Windows virtual key to a `Key`.
  ///
  /// This is useful because some numpad keys generate different charcaters based on the locale.
  /// For example `VK_DECIMAL` is sometimes "." and sometimes ",". Note: numpad-specific virtual
  /// keys are only produced by Windows when the NumLock is active.
  ///
  /// Making this field separate from the `keys` field saves having to add NumLock as a modifier
  /// to `WindowsModif
```