# OUTRO - options.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\webview2-com-0.38.2\src\options.rs
**SHA:** 20693d926536bf0c
**Timestamp:** 2026-08-28T02:36:39.975840
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let pattern =

### Gaps
- let missing: Vec<_> = all_declared_options
- "missing: {missing:?}\nextra: {extra:?}"

### Ouro Bruto (primeiros 5000 chars)
```
#![allow(non_snake_case)]
use std::{cell::UnsafeCell, default::Default, ffi::c_void, mem, ptr};

use windows::{
    core::{Error, IUnknown, IUnknown_Vtbl, Interface, Result, BOOL, HRESULT, PCWSTR, PWSTR},
    Win32::{
        Foundation::{E_POINTER, E_UNEXPECTED, S_OK},
        System::Com::CoTaskMemAlloc,
    },
};

use windows_implement::implement;
use windows_interface::interface;

use crate::{
    pwstr::{pwstr_from_str, string_from_pcwstr},
    Microsoft::Web::WebView2::Win32::{
        ICoreWebView2CustomSchemeRegistration, ICoreWebView2CustomSchemeRegistration_Impl,
        ICoreWebView2EnvironmentOptions, ICoreWebView2EnvironmentOptions2,
        ICoreWebView2EnvironmentOptions2_Impl, ICoreWebView2EnvironmentOptions3,
        ICoreWebView2EnvironmentOptions3_Impl, ICoreWebView2EnvironmentOptions5,
        ICoreWebView2EnvironmentOptions5_Impl, ICoreWebView2EnvironmentOptions6,
        ICoreWebView2EnvironmentOptions6_Impl, ICoreWebView2EnvironmentOptions7,
        ICoreWebView2EnvironmentOptions7_Impl, ICoreWebView2EnvironmentOptions8,
        ICoreWebView2EnvironmentOptions8_Impl, ICoreWebView2EnvironmentOptions_Impl,
        COREWEBVIEW2_CHANNEL_SEARCH_KIND, COREWEBVIEW2_CHANNEL_SEARCH_KIND_MOST_STABLE,
        COREWEBVIEW2_RELEASE_CHANNELS, COREWEBVIEW2_RELEASE_CHANNELS_BETA,
        COREWEBVIEW2_RELEASE_CHANNELS_CANARY, COREWEBVIEW2_RELEASE_CHANNELS_DEV,
        COREWEBVIEW2_RELEASE_CHANNELS_STABLE, COREWEBVIEW2_SCROLLBAR_STYLE,
        COREWEBVIEW2_SCROLLBAR_STYLE_DEFAULT, CORE_WEBVIEW_TARGET_PRODUCT_VERSION,
    },
};

#[implement(
    ICoreWebView2EnvironmentOptions,
    ICoreWebView2EnvironmentOptions2,
    ICoreWebView2EnvironmentOptions3,
    IFixedEnvironmentOptions4,
    ICoreWebView2EnvironmentOptions5,
    ICoreWebView2EnvironmentOptions6,
    ICoreWebView2EnvironmentOptions7,
    ICoreWebView2EnvironmentOptions8
)]
pub struct CoreWebView2EnvironmentOptions {
    additional_browser_arguments: UnsafeCell<String>,
    language: UnsafeCell<String>,
    target_compatible_browser_version: UnsafeCell<String>,
    allow_single_sign_on_using_os_primary_account: UnsafeCell<bool>,
    exclusive_user_data_folder_access: UnsafeCell<bool>,
    is_custom_crash_reporting_enabled: UnsafeCell<bool>,
    scheme_registrations: UnsafeCell<Vec<Option<ICoreWebView2CustomSchemeRegistration>>>,
    enable_tracking_prevention: UnsafeCell<bool>,
    are_browser_extensions_enabled: UnsafeCell<bool>,
    channel_search_kind: UnsafeCell<COREWEBVIEW2_CHANNEL_SEARCH_KIND>,
    release_channels: UnsafeCell<COREWEBVIEW2_RELEASE_CHANNELS>,
    scroll_bar_style: UnsafeCell<COREWEBVIEW2_SCROLLBAR_STYLE>,
}

impl Default for CoreWebView2EnvironmentOptions {
    fn default() -> Self {
        Self {
            additional_browser_arguments: String::new().into(),
            language: String::new().into(),
            target_compatible_browser_version: unsafe {
                CORE_WEBVIEW_TARGET_PRODUCT_VERSION.to_string()
            }
            .unwrap_or_default()
            .into(),
            allow_single_sign_on_using_os_primary_account: false.into(),
            exclusive_user_data_folder_access: false.into(),
            is_custom_crash_reporting_enabled: false.into(),
            scheme_registrations: Vec::new().into(),
            enable_tracking_prevention: true.into(),
            are_browser_extensions_enabled: false.into(),
            channel_search_kind: COREWEBVIEW2_CHANNEL_SEARCH_KIND_MOST_STABLE.into(),
            release_channels: (COREWEBVIEW2_RELEASE_CHANNELS_BETA
                | COREWEBVIEW2_RELEASE_CHANNELS_CANARY
                | COREWEBVIEW2_RELEASE_CHANNELS_DEV
                | COREWEBVIEW2_RELEASE_CHANNELS_STABLE)
                .into(),
            scroll_bar_style: COREWEBVIEW2_SCROLLBAR_STYLE_DEFAULT.into(),
        }
    }
}

impl CoreWebView2EnvironmentOptions {
    /// Equivalent to `ICoreWebView2EnvironmentOptions::AdditionalBrowserArguments` without
    /// extra memory copies or type conversions.
    ///
    /// # Safety
    ///
    /// This method reads from the same [`UnsafeCell<String>`] as the COM method, but it does not
    /// write to a mutable pointer for the result.
    pub unsafe fn additional_browser_arguments(&self) -> &str {
        (*self.additional_browser_arguments.get()).as_str()
    }

    /// Equivalent to `ICoreWebView2EnvironmentOptions::SetAdditionalBrowserArguments` without
    /// extra memory copies or type conversions.
    ///
    /// # Safety
    ///
    /// This method writes to the same [`UnsafeCell<String>`] as the COM method. It takes an
    /// immutable reference to `self` so that it can be reused in the COM method.
    pub unsafe fn set_additional_browser_arguments(&self, value: String) {
        *self.additional_browser_arguments.get() = value;
    }

    /// Equivalent to `ICoreWebView2EnvironmentOptions::Language` without extra memory copies or
    /// type conversions.
    ///
    /// # Safety
    ///
    /// This method reads from the sam
```