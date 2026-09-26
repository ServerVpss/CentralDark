# OUTRO - ffi.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tao-0.35.3\src\platform_impl\macos\ffi.rs
**SHA:** 6e85ece908839c2c
**Timestamp:** 2026-08-28T02:35:51.702809
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Upstream these

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2014-2021 The winit contributors
// Copyright 2021-2023 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0

// TODO: Upstream these

#![allow(
  dead_code,
  non_snake_case,
  non_upper_case_globals,
  clippy::enum_variant_names
)]

use std::{ffi::c_void, ptr};

use core_foundation::{
  array::CFArrayRef, data::CFDataRef, dictionary::CFDictionaryRef, string::CFStringRef,
  uuid::CFUUIDRef,
};
use core_graphics::{
  base::CGError,
  display::{boolean_t, CGDirectDisplayID, CGDisplayConfigRef},
  geometry::{CGPoint, CGRect},
};
use objc2::{
  encode::{Encode, Encoding},
  runtime::{AnyObject, Bool},
};
use objc2_foundation::NSInteger;

#[allow(non_camel_case_types)]
pub type id = *mut AnyObject;
pub const nil: id = ptr::null_mut();

#[allow(non_camel_case_types)]
pub type BOOL = Bool;
#[allow(deprecated)]
pub const YES: Bool = Bool::YES;
#[allow(deprecated)]
pub const NO: Bool = Bool::NO;

pub const NSNotFound: NSInteger = NSInteger::MAX;

pub const kCGBaseWindowLevelKey: NSInteger = 0;
pub const kCGMinimumWindowLevelKey: NSInteger = 1;
pub const kCGDesktopWindowLevelKey: NSInteger = 2;
pub const kCGBackstopMenuLevelKey: NSInteger = 3;
pub const kCGNormalWindowLevelKey: NSInteger = 4;
pub const kCGFloatingWindowLevelKey: NSInteger = 5;
pub const kCGTornOffMenuWindowLevelKey: NSInteger = 6;
pub const kCGDockWindowLevelKey: NSInteger = 7;
pub const kCGMainMenuWindowLevelKey: NSInteger = 8;
pub const kCGStatusWindowLevelKey: NSInteger = 9;
pub const kCGModalPanelWindowLevelKey: NSInteger = 10;
pub const kCGPopUpMenuWindowLevelKey: NSInteger = 11;
pub const kCGDraggingWindowLevelKey: NSInteger = 12;
pub const kCGScreenSaverWindowLevelKey: NSInteger = 13;
pub const kCGMaximumWindowLevelKey: NSInteger = 14;
pub const kCGOverlayWindowLevelKey: NSInteger = 15;
pub const kCGHelpWindowLevelKey: NSInteger = 16;
pub const kCGUtilityWindowLevelKey: NSInteger = 17;
pub const kCGDesktopIconWindowLevelKey: NSInteger = 18;
pub const kCGCursorWindowLevelKey: NSInteger = 19;
pub const kCGNumberOfWindowLevelKeys: NSInteger = 20;

#[derive(Debug, Clone, Copy)]
#[repr(isize)]
pub enum NSWindowLevel {
  BelowNormalWindowLevel = (kCGBaseWindowLevelKey - 1) as _,
  NSNormalWindowLevel = kCGBaseWindowLevelKey as _,
  NSFloatingWindowLevel = kCGFloatingWindowLevelKey as _,
  NSTornOffMenuWindowLevel = kCGTornOffMenuWindowLevelKey as _,
  NSModalPanelWindowLevel = kCGModalPanelWindowLevelKey as _,
  NSMainMenuWindowLevel = kCGMainMenuWindowLevelKey as _,
  NSStatusWindowLevel = kCGStatusWindowLevelKey as _,
  NSPopUpMenuWindowLevel = kCGPopUpMenuWindowLevelKey as _,
  NSScreenSaverWindowLevel = kCGScreenSaverWindowLevelKey as _,
}

unsafe impl Encode for NSWindowLevel {
  const ENCODING: Encoding = isize::ENCODING;
}

pub type CGDisplayFadeInterval = f32;
pub type CGDisplayReservationInterval = f32;
pub type CGDisplayBlendFraction = f32;

pub const kCGDisplayBlendNormal: f32 = 0.0;
pub const kCGDisplayBlendSolidColor: f32 = 1.0;

pub type CGDisplayFadeReservationToken = u32;
pub const kCGDisplayFadeReservationInvalidToken: CGDisplayFadeReservationToken = 0;

pub type Boolean = u8;
pub const FALSE: Boolean = 0;
pub const TRUE: Boolean = 1;

pub const kCGErrorSuccess: i32 = 0;
pub const kCGErrorFailure: i32 = 1000;
pub const kCGErrorIllegalArgument: i32 = 1001;
pub const kCGErrorInvalidConnection: i32 = 1002;
pub const kCGErrorInvalidContext: i32 = 1003;
pub const kCGErrorCannotComplete: i32 = 1004;
pub const kCGErrorNotImplemented: i32 = 1006;
pub const kCGErrorRangeCheck: i32 = 1007;
pub const kCGErrorTypeCheck: i32 = 1008;
pub const kCGErrorInvalidOperation: i32 = 1010;
pub const kCGErrorNoneAvailable: i32 = 1011;

pub const IO1BitIndexedPixels: &str = "P";
pub const IO2BitIndexedPixels: &str = "PP";
pub const IO4BitIndexedPixels: &str = "PPPP";
pub const IO8BitIndexedPixels: &str = "PPPPPPPP";
pub const IO16BitDirectPixels: &str = "-RRRRRGGGGGBBBBB";
pub const IO32BitDirectPixels: &str = "--------RRRRRRRRGGGGGGGGBBBBBBBB";

pub const kIO30BitDirectPixels: &str = "--RRRRRRRRRRGGGGGGGGGGBBBBBBBBBB";
pub const kIO64BitDirectPixels: &str = "-16R16G16B16";

pub const kIO16BitFloatPixels: &str = "-16FR16FG16FB16";
pub const kIO32BitFloatPixels: &str = "-32FR32FG32FB32";

pub const IOYUV422Pixels: &str = "Y4U2V2";
pub const IO8BitOverlayPixels: &str = "O8";

pub type CGWindowLevel = i32;
pub type CGDisplayModeRef = *mut libc::c_void;

// `CGDisplayCreateUUIDFromDisplayID` comes from the `ColorSync` framework.
// However, that framework was only introduced "publicly" in macOS 10.13.
//
// Since we want to support older versions, we can't link to `ColorSync`
// directly. Fortunately, it has always been available as a subframework of
// `ApplicationServices`, see:
// https://developer.apple.com/library/archive/documentation/MacOSX/Conceptual/OSX_Technology_Overview/SystemFrameworks/SystemFrameworks.html#//apple_ref/doc/uid/TP40001067-CH210-BBCFFIEG
#[link(name = "ApplicationServices", kind = "frame
```