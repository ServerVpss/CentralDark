# COMANDO - capture_screenshot_by_window.rs
**Origem:** E:\CentralDark\_MAPA_CASA\Nova pasta\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-screen\src\capture_screenshot_by_window.rs
**SHA:** e75dc7006e807f2c
**Timestamp:** 2026-08-23T14:16:59.690027
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- use screenpipe_core::window_pattern::{self, WindowPattern};
- ignore_patterns: WindowPattern::parse_list(ignore_list),
- include_patterns: WindowPattern::parse_list(include_list),
- if window_pattern::matches_any(&self.ignore_patterns, &app_name_lower, &title_lower) {
- window_pattern::passes_includes(&self.include_patterns, &app_name_lower, &title_lower)
- let pattern = blocked
- /// a pattern: deciding it needs the browser-native detector, which may run

### Contratos
- /// Why incognito is resolved here rather than at the focused-window gate: the

### Ouro Bruto (primeiros 5000 chars)
```
use image::DynamicImage;
use once_cell::sync::Lazy;
use screenpipe_core::window_pattern::{self, WindowPattern};
use std::collections::HashSet;
use std::error::Error;
use std::fmt;
use tracing::debug;

// On macOS, we have both sck-rs (for 12.3+) and xcap (fallback for older versions)
#[cfg(target_os = "macos")]
use sck_rs::{Window as SckWindow, XCapError as SckXCapError};

#[cfg(target_os = "macos")]
use xcap::{Window as XcapWindow, XCapError as XcapXCapError};

// Non-macOS only uses xcap
#[cfg(not(target_os = "macos"))]
use xcap::{Window, XCapError};

use crate::browser_utils::create_url_detector;
use crate::monitor::SafeMonitor;

#[cfg(target_os = "macos")]
use crate::monitor::macos_version::use_sck_rs;

#[cfg(target_os = "macos")]
use std::collections::HashMap;

const BROWSER_NAMES: [&str; 9] = [
    "chrome", "firefox", "safari", "edge", "brave", "arc", "chromium", "vivaldi", "opera",
];

#[derive(Debug)]
enum CaptureError {
    NoWindows,
    #[cfg(not(target_os = "macos"))]
    XCapError(XCapError),
    #[cfg(target_os = "macos")]
    CaptureBackendError(String),
}

impl fmt::Display for CaptureError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            CaptureError::NoWindows => write!(f, "No windows found"),
            #[cfg(not(target_os = "macos"))]
            CaptureError::XCapError(e) => write!(f, "XCap error: {}", e),
            #[cfg(target_os = "macos")]
            CaptureError::CaptureBackendError(e) => write!(f, "Capture error: {}", e),
        }
    }
}

impl Error for CaptureError {}

#[cfg(not(target_os = "macos"))]
impl From<XCapError> for CaptureError {
    fn from(error: XCapError) -> Self {
        debug!("XCap error occurred: {}", error);
        CaptureError::XCapError(error)
    }
}

#[cfg(target_os = "macos")]
impl From<SckXCapError> for CaptureError {
    fn from(error: SckXCapError) -> Self {
        debug!("sck-rs error occurred: {}", error);
        CaptureError::CaptureBackendError(error.to_string())
    }
}

#[cfg(target_os = "macos")]
impl From<XcapXCapError> for CaptureError {
    fn from(error: XcapXCapError) -> Self {
        debug!("xcap error occurred: {}", error);
        CaptureError::CaptureBackendError(error.to_string())
    }
}

// Platform specific skip lists
#[cfg(target_os = "macos")]
static SKIP_APPS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    HashSet::from([
        "Window Server",
        "SystemUIServer",
        "ControlCenter",
        "Dock",
        "NotificationCenter",
        "loginwindow",
        "WindowManager",
        "Contexts",
        "Screenshot",
        // Apps with overlay windows that frequently fail capture
        "TheBoringNotch",
        "Grammarly Desktop",
        // Screenpipe's own UI should never be captured
        "screenpipe",
        "screenpipe - Development",
        "screenpipe beta",
    ])
});

#[cfg(target_os = "windows")]
static SKIP_APPS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    HashSet::from([
        "Windows Shell Experience Host",
        "Microsoft Text Input Application",
        "Windows Explorer",
        "Program Manager",
        "Microsoft Store",
        "Search",
        "TaskBar",
        // Screenpipe's own UI should never be captured
        "screenpipe",
        "screenpipe - Development",
        "screenpipe beta",
    ])
});

#[cfg(target_os = "linux")]
static SKIP_APPS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    HashSet::from([
        "Gnome-shell",
        "Plasma",
        "Xfdesktop",
        "Polybar",
        "i3bar",
        "Plank",
        "Dock",
        "Cinnamon",
        "cinnamon",
        "Muffin",
        "Budgie-panel",
        // Screenpipe's own UI should never be captured
        "screenpipe",
        "screenpipe - Development",
        "screenpipe beta",
        "screenpipe-app",
    ])
});

#[cfg(target_os = "macos")]
static SKIP_TITLES: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    HashSet::from([
        "Item-0",
        "App Icon Window",
        "Dock",
        "NowPlaying",
        "FocusModes",
        "Shortcuts",
        "AudioVideoModule",
        "Clock",
        "WiFi",
        "Battery",
        "BentoBox",
        "Menu Bar",
        "Notification Center",
        "Control Center",
        "Spotlight",
        "Mission Control",
        "Desktop",
        "Screen Sharing",
        "Touch Bar",
        "Status Bar",
        "Menu Extra",
        "System Settings",
        // Additional system UI elements from ScreenCaptureKit
        "StatusIndicator",
        "Cursor",
        "Menubar",
        "tracking",
    ])
});

#[cfg(target_os = "windows")]
static SKIP_TITLES: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    HashSet::from([
        "Program Manager",
        "Windows Input Experience",
        "Microsoft Text Input Application",
        "Task View",
        "Start",
        "System Tray",
        "Notification Area",
        "Action Center",
        "Task Bar",
        "Desktop",
    ]
```

---

# COMANDO - capture_screenshot_by_window.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_screenpipe-main.zip\screenpipe-main\crates\screenpipe-screen\src\capture_screenshot_by_window.rs
**SHA:** e75dc7006e807f2c4802ce53bdbf62e5370691789732239a0da94cdaf08302b0
**Timestamp:** 2026-08-23T23:43:55.606187
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- use screenpipe_core::window_pattern::{self, WindowPattern};
- ignore_patterns: WindowPattern::parse_list(ignore_list),
- include_patterns: WindowPattern::parse_list(include_list),
- if window_pattern::matches_any(&self.ignore_patterns, &app_name_lower, &title_lower) {
- window_pattern::passes_includes(&self.include_patterns, &app_name_lower, &title_lower)
- let pattern = blocked
- /// a pattern: deciding it needs the browser-native detector, which may run

### Contratos
- /// Why incognito is resolved here rather than at the focused-window gate: the

### Ouro Bruto (primeiros 5000 chars)
```
use image::DynamicImage;
use once_cell::sync::Lazy;
use screenpipe_core::window_pattern::{self, WindowPattern};
use std::collections::HashSet;
use std::error::Error;
use std::fmt;
use tracing::debug;

// On macOS, we have both sck-rs (for 12.3+) and xcap (fallback for older versions)
#[cfg(target_os = "macos")]
use sck_rs::{Window as SckWindow, XCapError as SckXCapError};

#[cfg(target_os = "macos")]
use xcap::{Window as XcapWindow, XCapError as XcapXCapError};

// Non-macOS only uses xcap
#[cfg(not(target_os = "macos"))]
use xcap::{Window, XCapError};

use crate::browser_utils::create_url_detector;
use crate::monitor::SafeMonitor;

#[cfg(target_os = "macos")]
use crate::monitor::macos_version::use_sck_rs;

#[cfg(target_os = "macos")]
use std::collections::HashMap;

const BROWSER_NAMES: [&str; 9] = [
    "chrome", "firefox", "safari", "edge", "brave", "arc", "chromium", "vivaldi", "opera",
];

#[derive(Debug)]
enum CaptureError {
    NoWindows,
    #[cfg(not(target_os = "macos"))]
    XCapError(XCapError),
    #[cfg(target_os = "macos")]
    CaptureBackendError(String),
}

impl fmt::Display for CaptureError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            CaptureError::NoWindows => write!(f, "No windows found"),
            #[cfg(not(target_os = "macos"))]
            CaptureError::XCapError(e) => write!(f, "XCap error: {}", e),
            #[cfg(target_os = "macos")]
            CaptureError::CaptureBackendError(e) => write!(f, "Capture error: {}", e),
        }
    }
}

impl Error for CaptureError {}

#[cfg(not(target_os = "macos"))]
impl From<XCapError> for CaptureError {
    fn from(error: XCapError) -> Self {
        debug!("XCap error occurred: {}", error);
        CaptureError::XCapError(error)
    }
}

#[cfg(target_os = "macos")]
impl From<SckXCapError> for CaptureError {
    fn from(error: SckXCapError) -> Self {
        debug!("sck-rs error occurred: {}", error);
        CaptureError::CaptureBackendError(error.to_string())
    }
}

#[cfg(target_os = "macos")]
impl From<XcapXCapError> for CaptureError {
    fn from(error: XcapXCapError) -> Self {
        debug!("xcap error occurred: {}", error);
        CaptureError::CaptureBackendError(error.to_string())
    }
}

// Platform specific skip lists
#[cfg(target_os = "macos")]
static SKIP_APPS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    HashSet::from([
        "Window Server",
        "SystemUIServer",
        "ControlCenter",
        "Dock",
        "NotificationCenter",
        "loginwindow",
        "WindowManager",
        "Contexts",
        "Screenshot",
        // Apps with overlay windows that frequently fail capture
        "TheBoringNotch",
        "Grammarly Desktop",
        // Screenpipe's own UI should never be captured
        "screenpipe",
        "screenpipe - Development",
        "screenpipe beta",
    ])
});

#[cfg(target_os = "windows")]
static SKIP_APPS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    HashSet::from([
        "Windows Shell Experience Host",
        "Microsoft Text Input Application",
        "Windows Explorer",
        "Program Manager",
        "Microsoft Store",
        "Search",
        "TaskBar",
        // Screenpipe's own UI should never be captured
        "screenpipe",
        "screenpipe - Development",
        "screenpipe beta",
    ])
});

#[cfg(target_os = "linux")]
static SKIP_APPS: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    HashSet::from([
        "Gnome-shell",
        "Plasma",
        "Xfdesktop",
        "Polybar",
        "i3bar",
        "Plank",
        "Dock",
        "Cinnamon",
        "cinnamon",
        "Muffin",
        "Budgie-panel",
        // Screenpipe's own UI should never be captured
        "screenpipe",
        "screenpipe - Development",
        "screenpipe beta",
        "screenpipe-app",
    ])
});

#[cfg(target_os = "macos")]
static SKIP_TITLES: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    HashSet::from([
        "Item-0",
        "App Icon Window",
        "Dock",
        "NowPlaying",
        "FocusModes",
        "Shortcuts",
        "AudioVideoModule",
        "Clock",
        "WiFi",
        "Battery",
        "BentoBox",
        "Menu Bar",
        "Notification Center",
        "Control Center",
        "Spotlight",
        "Mission Control",
        "Desktop",
        "Screen Sharing",
        "Touch Bar",
        "Status Bar",
        "Menu Extra",
        "System Settings",
        // Additional system UI elements from ScreenCaptureKit
        "StatusIndicator",
        "Cursor",
        "Menubar",
        "tracking",
    ])
});

#[cfg(target_os = "windows")]
static SKIP_TITLES: Lazy<HashSet<&'static str>> = Lazy::new(|| {
    HashSet::from([
        "Program Manager",
        "Windows Input Experience",
        "Microsoft Text Input Application",
        "Task View",
        "Start",
        "System Tray",
        "Notification Area",
        "Action Center",
        "Task Bar",
        "Desktop",
    ]
```