# COMANDO - key.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\keyboard-types-0.7.0\src\key.rs
**SHA:** cdb26ab9bf3839cf
**Timestamp:** 2026-08-28T02:34:33.060745
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Execute => f.write_str("Execute"),

### Ouro Bruto (primeiros 5000 chars)
```

// AUTO GENERATED CODE - DO NOT EDIT
#![cfg_attr(rustfmt, rustfmt_skip)]

use std::fmt::{self, Display};
use std::str::FromStr;
use std::error::Error;

/// Key represents the meaning of a keypress.
///
/// Specification:
/// <https://w3c.github.io/uievents-key/>
#[derive(Clone, Debug, Eq, PartialEq, Hash)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
#[non_exhaustive]
pub enum Key {
    /// A key string that corresponds to the character typed by the user,
    /// taking into account the user’s current locale setting, modifier state,
    /// and any system-level keyboard mapping overrides that are in effect.
    Character(String),
    
    /// This key value is used when an implementation is unable to
    /// identify another key value, due to either hardware,
    /// platform, or software constraints.
    Unidentified,
    /// The <code class="keycap">Alt</code> (Alternative) key.<br> This key enables the alternate modifier function for interpreting concurrent or subsequent keyboard input.<br> This key value is also used for the Apple <code class="keycap">Option</code> key.
    Alt,
    /// The Alternate Graphics (<code class="keycap">AltGr</code> or <code class="keycap">AltGraph</code>) key.
    /// This key is used enable the ISO Level 3 shift modifier (the standard <code class="keycap">Shift</code> key is the level 2 modifier).
    /// See [ISO9995-1].
    AltGraph,
    /// The <code class="keycap">Caps Lock</code> (Capital) key.
    /// Toggle capital character lock function for interpreting subsequent keyboard input event.
    CapsLock,
    /// The <code class="keycap">Control</code> or <code class="keycap">Ctrl</code> key, to enable control modifier function for interpreting concurrent or subsequent keyboard input.
    Control,
    /// The Function switch <code class="keycap">Fn</code> key.<br> Activating this key simultaneously with another key changes that key’s value to an alternate character or function.
    /// This key is often handled directly in the keyboard hardware and does not usually generate key events.
    Fn,
    /// The Function-Lock (<code class="keycap">FnLock</code> or <code class="keycap">F-Lock</code>) key.
    /// Activating this key switches the mode of the keyboard to changes some keys' values to an alternate character or function.
    /// This key is often handled directly in the keyboard hardware and does not usually generate key events.
    FnLock,
    /// The <code class="keycap">Meta</code> key, to enable meta modifier function for interpreting concurrent or subsequent keyboard input.
    /// This key value is used for the <q>Windows Logo</q> key and the Apple <code class="keycap">Command</code> or <code class="keycap">⌘</code> key.
    Meta,
    /// The <code class="keycap">NumLock</code> or Number Lock key, to toggle numpad mode function for interpreting subsequent keyboard input.
    NumLock,
    /// The <code class="keycap">Scroll Lock</code> key, to toggle between scrolling and cursor movement modes.
    ScrollLock,
    /// The <code class="keycap">Shift</code> key, to enable shift modifier function for interpreting concurrent or subsequent keyboard input.
    Shift,
    /// The Symbol modifier key (used on some virtual keyboards).
    Symbol,
    /// The Symbol Lock key.
    SymbolLock,
    /// The <code class="keycap">Hyper</code> key.
    Hyper,
    /// The <code class="keycap">Super</code> key.
    Super,
    /// The <code class="keycap">Enter</code> or <code class="keycap">↵</code> key, to activate current selection or accept current input.<br> This key value is also used for the <code class="keycap">Return</code> (Macintosh numpad) key.<br> This key value is also used for the Android <code class="android">KEYCODE_DPAD_CENTER</code>.
    Enter,
    /// The Horizontal Tabulation <code class="keycap">Tab</code> key.
    Tab,
    /// The down arrow key, to navigate or traverse downward. (<code class="android">KEYCODE_DPAD_DOWN</code>)
    ArrowDown,
    /// The left arrow key, to navigate or traverse leftward. (<code class="android">KEYCODE_DPAD_LEFT</code>)
    ArrowLeft,
    /// The right arrow key, to navigate or traverse rightward. (<code class="android">KEYCODE_DPAD_RIGHT</code>)
    ArrowRight,
    /// The up arrow key, to navigate or traverse upward. (<code class="android">KEYCODE_DPAD_UP</code>)
    ArrowUp,
    /// The End key, used with keyboard entry to go to the end of content (<code class="android">KEYCODE_MOVE_END</code>).
    End,
    /// The Home key, used with keyboard entry, to go to start of content (<code class="android">KEYCODE_MOVE_HOME</code>).<br> For the mobile phone <code class="keycap">Home</code> key (which goes to the phone’s main screen), use <code class="key">"GoHome"</code>.
    Home,
    /// The Page Down key, to scroll down or display next page of content.
    PageDown,
    /// The Page Up key, to scroll up or display previous page of content.
    PageUp,
    /// The Backspace key. This key value is 
```