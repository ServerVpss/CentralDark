# COMANDO - navigation.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\wry-0.55.1\src\wkwebview\navigation.rs
**SHA:** 1898665e051edf10
**Timestamp:** 2026-08-28T02:37:43.395795
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- use super::class::wry_navigation_delegate::WryNavigationDelegate;

### Ouro Bruto (primeiros 5000 chars)
```
use objc2::DeclaredClass;
use objc2_foundation::{NSObjectProtocol, NSString};
use objc2_web_kit::{
  WKNavigation, WKNavigationAction, WKNavigationActionPolicy, WKNavigationResponse,
  WKNavigationResponsePolicy,
};

#[cfg(target_os = "ios")]
use crate::wkwebview::ios::WKWebView::WKWebView;
#[cfg(target_os = "macos")]
use objc2_web_kit::WKWebView;

use crate::PageLoadEvent;

use super::class::wry_navigation_delegate::WryNavigationDelegate;

pub(crate) fn did_commit_navigation(
  this: &WryNavigationDelegate,
  webview: &WKWebView,
  _navigation: &WKNavigation,
) {
  unsafe {
    // Call on_load_handler
    if let Some(on_page_load) = &this.ivars().on_page_load_handler {
      on_page_load(PageLoadEvent::Started);
    }

    // Inject scripts
    let mut pending_scripts = this.ivars().pending_scripts.lock().unwrap();
    if let Some(scripts) = &*pending_scripts {
      for script in scripts {
        webview.evaluateJavaScript_completionHandler(&NSString::from_str(script), None);
      }
      *pending_scripts = None;
    }
  }
}

pub(crate) fn did_finish_navigation(
  this: &WryNavigationDelegate,
  _webview: &WKWebView,
  _navigation: &WKNavigation,
) {
  if let Some(on_page_load) = &this.ivars().on_page_load_handler {
    on_page_load(PageLoadEvent::Finished);
  }
}

// Navigation handler
pub(crate) fn navigation_policy(
  this: &WryNavigationDelegate,
  _webview: &WKWebView,
  action: &WKNavigationAction,
  handler: &block2::Block<dyn Fn(WKNavigationActionPolicy)>,
) {
  unsafe {
    // <https://developer.apple.com/documentation/webkit/wknavigationaction/shouldperformdownload>
    // Available: macOS 11.3+, iOS 14.5+
    let can_download = action.respondsToSelector(objc2::sel!(shouldPerformDownload));
    let should_download: bool = if can_download {
      action.shouldPerformDownload()
    } else {
      false
    };
    let request = action.request();
    let url = request.URL().unwrap().absoluteString().unwrap();

    if should_download {
      let has_download_handler = this.ivars().has_download_handler;
      if has_download_handler {
        (*handler).call((WKNavigationActionPolicy::Download,));
      } else {
        (*handler).call((WKNavigationActionPolicy::Cancel,));
      }
    } else {
      let function = &this.ivars().navigation_policy_function;
      match function(url.to_string()) {
        true => (*handler).call((WKNavigationActionPolicy::Allow,)),
        false => (*handler).call((WKNavigationActionPolicy::Cancel,)),
      };
    }
  }
}

// Navigation handler
pub(crate) fn navigation_policy_response(
  this: &WryNavigationDelegate,
  _webview: &WKWebView,
  response: &WKNavigationResponse,
  handler: &block2::Block<dyn Fn(WKNavigationResponsePolicy)>,
) {
  unsafe {
    let can_show_mime_type = response.canShowMIMEType();

    if !can_show_mime_type {
      let has_download_handler = this.ivars().has_download_handler;
      if has_download_handler {
        (*handler).call((WKNavigationResponsePolicy::Download,));
        return;
      }
    }

    (*handler).call((WKNavigationResponsePolicy::Allow,));
  }
}

pub(crate) fn web_content_process_did_terminate(
  this: &WryNavigationDelegate,
  _webview: &WKWebView,
) {
  if let Some(on_web_content_process_terminate) =
    &this.ivars().on_web_content_process_terminate_handler
  {
    on_web_content_process_terminate();
  }
}

```