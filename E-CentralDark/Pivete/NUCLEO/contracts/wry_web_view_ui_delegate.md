# CONTRATO - wry_web_view_ui_delegate.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\wry-0.55.1\src\wkwebview\class\wry_web_view_ui_delegate.rs
**SHA:** f9bab65e7ff27978
**Timestamp:** 2026-08-28T02:37:43.504785
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- delegate: Retained<WryNSWindowDelegate>,
- let delegate = mtm
- let delegate = WryNSWindowDelegate::new(
- let delegate = mtm

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2020-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

#[cfg(target_os = "macos")]
use std::{cell::RefCell, ptr::null_mut, rc::Rc};

use block2::Block;
#[cfg(target_os = "macos")]
use objc2::DefinedClass;
use objc2::{define_class, msg_send, rc::Retained, runtime::NSObject, MainThreadOnly};
#[cfg(target_os = "macos")]
use objc2_app_kit::{NSModalResponse, NSModalResponseOK, NSOpenPanel, NSWindowDelegate};
use objc2_foundation::{MainThreadMarker, NSObjectProtocol};
#[cfg(target_os = "macos")]
use objc2_foundation::{NSArray, NSURL};

#[cfg(target_os = "macos")]
use objc2_web_kit::WKOpenPanelParameters;
use objc2_web_kit::{
  WKFrameInfo, WKMediaCaptureType, WKPermissionDecision, WKSecurityOrigin, WKUIDelegate,
};

use crate::{NewWindowFeatures, NewWindowResponse, WryWebView};

#[cfg(target_os = "macos")]
struct NewWindow {
  #[allow(dead_code)]
  ns_window: Retained<objc2_app_kit::NSWindow>,
  #[allow(dead_code)]
  webview: Retained<objc2_web_kit::WKWebView>,
  #[allow(dead_code)]
  delegate: Retained<WryNSWindowDelegate>,
}

// SAFETY: we are not using the new window at all, just dropping it on another thread
#[cfg(target_os = "macos")]
unsafe impl Send for NewWindow {}

#[cfg(target_os = "macos")]
impl Drop for NewWindow {
  fn drop(&mut self) {
    unsafe {
      self.webview.removeFromSuperview();
    }
  }
}

#[cfg(target_os = "macos")]
struct WryNSWindowDelegateIvars {
  on_close: Box<dyn Fn()>,
}

#[cfg(target_os = "macos")]
define_class!(
  #[unsafe(super(NSObject))]
  #[thread_kind = MainThreadOnly]
  #[ivars = WryNSWindowDelegateIvars]
  struct WryNSWindowDelegate;

  unsafe impl NSObjectProtocol for WryNSWindowDelegate {}

  unsafe impl NSWindowDelegate for WryNSWindowDelegate {
    #[unsafe(method(windowWillClose:))]
    unsafe fn will_close(&self, _notification: &objc2_foundation::NSNotification) {
      let on_close = &self.ivars().on_close;
      on_close();
    }
  }
);

#[cfg(target_os = "macos")]
impl WryNSWindowDelegate {
  pub fn new(mtm: MainThreadMarker, on_close: Box<dyn Fn()>) -> Retained<Self> {
    let delegate = mtm
      .alloc::<WryNSWindowDelegate>()
      .set_ivars(WryNSWindowDelegateIvars { on_close });
    unsafe { msg_send![super(delegate), init] }
  }
}

pub struct WryWebViewUIDelegateIvars {
  #[cfg(target_os = "macos")]
  new_window_req_handler: Option<Box<dyn Fn(String, NewWindowFeatures) -> NewWindowResponse>>,
  #[cfg(target_os = "macos")]
  new_windows: Rc<RefCell<Vec<NewWindow>>>,
}

define_class!(
  #[unsafe(super(NSObject))]
  #[thread_kind = MainThreadOnly]
  #[ivars = WryWebViewUIDelegateIvars]
  pub struct WryWebViewUIDelegate;

  unsafe impl NSObjectProtocol for WryWebViewUIDelegate {}

  unsafe impl WKUIDelegate for WryWebViewUIDelegate {
    #[cfg(target_os = "macos")]
    #[unsafe(method(webView:runOpenPanelWithParameters:initiatedByFrame:completionHandler:))]
    fn run_file_upload_panel(
      &self,
      _webview: &WryWebView,
      open_panel_params: &WKOpenPanelParameters,
      _frame: &WKFrameInfo,
      handler: &block2::Block<dyn Fn(*const NSArray<NSURL>)>,
    ) {
      unsafe {
        if let Some(mtm) = MainThreadMarker::new() {
          let open_panel = NSOpenPanel::openPanel(mtm);
          open_panel.setCanChooseFiles(true);
          let allow_multi = open_panel_params.allowsMultipleSelection();
          open_panel.setAllowsMultipleSelection(allow_multi);
          let allow_dir = open_panel_params.allowsDirectories();
          open_panel.setCanChooseDirectories(allow_dir);
          let ok: NSModalResponse = open_panel.runModal();
          if ok == NSModalResponseOK {
            let url = open_panel.URLs();
            (*handler).call((Retained::as_ptr(&url),));
          } else {
            (*handler).call((null_mut(),));
          }
        }
      }
    }

    #[unsafe(method(webView:requestMediaCapturePermissionForOrigin:initiatedByFrame:type:decisionHandler:))]
    fn request_media_capture_permission(
      &self,
      _webview: &WryWebView,
      _origin: &WKSecurityOrigin,
      _frame: &WKFrameInfo,
      _capture_type: WKMediaCaptureType,
      decision_handler: &Block<dyn Fn(WKPermissionDecision)>,
    ) {
      //https://developer.apple.com/documentation/webkit/wkpermissiondecision?language=objc
      (*decision_handler).call((WKPermissionDecision::Grant,));
    }

    #[cfg(target_os = "macos")]
    #[unsafe(method_id(webView:createWebViewWithConfiguration:forNavigationAction:windowFeatures:))]
    unsafe fn create_web_view_for_navigation_action(
      &self,
      webview: &WryWebView,
      configuration: &objc2_web_kit::WKWebViewConfiguration,
      action: &objc2_web_kit::WKNavigationAction,
      window_features: &objc2_web_kit::WKWindowFeatures,
    ) -> Option<Retained<objc2_web_kit::WKWebView>> {
      if let Some(new_window_req_handler) = &self.ivars().new_window_req_handler {
        let request = action.request();
        let u
```