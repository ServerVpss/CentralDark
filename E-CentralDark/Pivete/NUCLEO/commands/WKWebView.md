# COMANDO - WKWebView.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\wry-0.55.1\src\wkwebview\ios\WKWebView.rs
**SHA:** 4ff8588c4d8773c2
**Timestamp:** 2026-08-28T02:37:43.541443
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- #[unsafe(method(setNavigationDelegate:))]
- navigation_delegate: Option<&ProtocolObject<dyn WKNavigationDelegate>>,
- #[unsafe(method(setUIDelegate:))]
- pub unsafe fn setUIDelegate(&self, ui_delegate: Option<&ProtocolObject<dyn WKUIDelegate>>);

### Ouro Bruto (primeiros 5000 chars)
```
//! This file has been imported from `objc2-web-kit` and modified to match iOS.
#![allow(warnings)]
#![allow(clippy::all)]

use std::{ffi::c_double, ptr::NonNull};

use objc2::{
  encode::{Encode, Encoding, RefEncode},
  extern_class, extern_methods,
  rc::{Allocated, Retained},
  runtime::{AnyObject, ProtocolObject},
  MainThreadOnly,
};
use objc2_core_foundation::*;
use objc2_foundation::*;
use objc2_ui_kit::*;
use objc2_web_kit::*;

use crate::*;

// NS_ENUM
#[repr(transparent)]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct WKMediaPlaybackState(pub NSInteger);
impl WKMediaPlaybackState {
  #[doc(alias = "WKMediaPlaybackStateNone")]
  pub const None: Self = Self(0);
  #[doc(alias = "WKMediaPlaybackStatePlaying")]
  pub const Playing: Self = Self(1);
  #[doc(alias = "WKMediaPlaybackStatePaused")]
  pub const Paused: Self = Self(2);
  #[doc(alias = "WKMediaPlaybackStateSuspended")]
  pub const Suspended: Self = Self(3);
}

unsafe impl Encode for WKMediaPlaybackState {
  const ENCODING: Encoding = NSInteger::ENCODING;
}

unsafe impl RefEncode for WKMediaPlaybackState {
  const ENCODING_REF: Encoding = Encoding::Pointer(&Self::ENCODING);
}

// NS_ENUM
#[repr(transparent)]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct WKMediaCaptureState(pub NSInteger);
impl WKMediaCaptureState {
  #[doc(alias = "WKMediaCaptureStateNone")]
  pub const None: Self = Self(0);
  #[doc(alias = "WKMediaCaptureStateActive")]
  pub const Active: Self = Self(1);
  #[doc(alias = "WKMediaCaptureStateMuted")]
  pub const Muted: Self = Self(2);
}

unsafe impl Encode for WKMediaCaptureState {
  const ENCODING: Encoding = NSInteger::ENCODING;
}

unsafe impl RefEncode for WKMediaCaptureState {
  const ENCODING_REF: Encoding = Encoding::Pointer(&Self::ENCODING);
}

// NS_ENUM
#[repr(transparent)]
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash, PartialOrd, Ord)]
pub struct WKFullscreenState(pub NSInteger);
impl WKFullscreenState {
  #[doc(alias = "WKFullscreenStateNotInFullscreen")]
  pub const NotInFullscreen: Self = Self(0);
  #[doc(alias = "WKFullscreenStateEnteringFullscreen")]
  pub const EnteringFullscreen: Self = Self(1);
  #[doc(alias = "WKFullscreenStateInFullscreen")]
  pub const InFullscreen: Self = Self(2);
  #[doc(alias = "WKFullscreenStateExitingFullscreen")]
  pub const ExitingFullscreen: Self = Self(3);
}

unsafe impl Encode for WKFullscreenState {
  const ENCODING: Encoding = NSInteger::ENCODING;
}

unsafe impl RefEncode for WKFullscreenState {
  const ENCODING_REF: Encoding = Encoding::Pointer(&Self::ENCODING);
}

extern_class!(
  #[unsafe(super(UIView, UIResponder, NSObject))]
  #[thread_kind = MainThreadOnly]
  #[derive(Debug, PartialEq, Eq, Hash)]
  pub struct WKWebView;
);

#[cfg(target_os = "macos")]
unsafe impl NSAccessibility for WKWebView {}

#[cfg(target_os = "macos")]
unsafe impl NSAccessibilityElementProtocol for WKWebView {}

#[cfg(target_os = "macos")]
unsafe impl NSAnimatablePropertyContainer for WKWebView {}

#[cfg(target_os = "macos")]
unsafe impl NSAppearanceCustomization for WKWebView {}

unsafe impl NSCoding for WKWebView {}

#[cfg(target_os = "macos")]
unsafe impl NSDraggingDestination for WKWebView {}

unsafe impl NSObjectProtocol for WKWebView {}

#[cfg(target_os = "macos")]
unsafe impl NSUserInterfaceItemIdentification for WKWebView {}

impl WKWebView {
  extern_methods!(
    // #[cfg(feature = "WKWebViewConfiguration")]
    #[unsafe(method(configuration))]
    pub unsafe fn configuration(&self) -> Retained<WKWebViewConfiguration>;

    // #[cfg(feature = "WKNavigationDelegate")]
    #[unsafe(method(navigationDelegate))]
    pub unsafe fn navigationDelegate(
      &self,
    ) -> Option<Retained<ProtocolObject<dyn WKNavigationDelegate>>>;

    // #[cfg(feature = "WKNavigationDelegate")]
    #[unsafe(method(setNavigationDelegate:))]
    pub unsafe fn setNavigationDelegate(
      &self,
      navigation_delegate: Option<&ProtocolObject<dyn WKNavigationDelegate>>,
    );

    // #[cfg(feature = "WKUIDelegate")]
    #[unsafe(method(UIDelegate))]
    pub unsafe fn UIDelegate(&self) -> Option<Retained<ProtocolObject<dyn WKUIDelegate>>>;

    // #[cfg(feature = "WKUIDelegate")]
    #[unsafe(method(setUIDelegate:))]
    pub unsafe fn setUIDelegate(&self, ui_delegate: Option<&ProtocolObject<dyn WKUIDelegate>>);

    #[cfg(target_os = "macos")]
    // #[cfg(feature = "WKBackForwardList")]
    #[unsafe(method(backForwardList))]
    pub unsafe fn backForwardList(&self) -> Retained<WKBackForwardList>;

    // #[cfg(feature = "WKWebViewConfiguration")]
    #[unsafe(method(initWithFrame:configuration:))]
    pub unsafe fn initWithFrame_configuration(
      this: Allocated<Self>,
      frame: CGRect,
      configuration: &WKWebViewConfiguration,
    ) -> Retained<Self>;

    #[unsafe(method(initWithCoder:))]
    pub unsafe fn initWithCoder(this: Allocated<Self>, coder: &NSCoder) -> Option<Retained<Self>>;

    // #[cfg(feature = "WKNavigation")]
    #[u
```