# COMANDO - callback.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\webview2-com-0.38.2\src\callback.rs
**SHA:** 6107192db9602738
**Timestamp:** 2026-08-28T02:36:39.916249
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- let pattern = Regex::new(r#"(ICoreWebView2[A-Za-z0-9]+Handler)"#).expect("valid regex");

### Gaps
- let missing: Vec<_> = all_declared_callbacks
- "missing: {missing:?}\nextra: {extra:?}"

### Ouro Bruto (primeiros 5000 chars)
```
use windows::{
    core::{IUnknown, Interface, Ref, BOOL, HRESULT, PCWSTR},
    Win32::System::Com::IStream,
};

use windows_implement::implement;

use crate::{pwstr::string_from_pcwstr, Microsoft::Web::WebView2::Win32::*};

pub trait ClosureArg {
    type Output: Sized;
}

pub trait InvokeArg<'a> {
    type Input: 'a;

    fn convert(input: Self::Input) -> <Self as ClosureArg>::Output
    where
        Self: ClosureArg;
}

impl ClosureArg for HRESULT {
    type Output = windows::core::Result<()>;
}

impl InvokeArg<'_> for HRESULT {
    type Input = Self;

    fn convert(input: HRESULT) -> windows::core::Result<()> {
        input.ok()
    }
}

impl ClosureArg for BOOL {
    type Output = bool;
}

impl InvokeArg<'_> for BOOL {
    type Input = Self;

    fn convert(input: BOOL) -> bool {
        input.as_bool()
    }
}

impl ClosureArg for PCWSTR {
    type Output = String;
}

impl<'a> InvokeArg<'a> for PCWSTR {
    type Input = &'a Self;

    fn convert(input: &PCWSTR) -> String {
        string_from_pcwstr(input)
    }
}

impl<I: Interface> ClosureArg for Option<I> {
    type Output = Self;
}

impl<'a, I: 'a + Interface + Clone> InvokeArg<'a> for Option<I> {
    type Input = Ref<'a, I>;

    fn convert(input: Ref<'a, I>) -> <Self as ClosureArg>::Output {
        input.cloned()
    }
}

/// Generic closure signature for [`completed_callback`].
pub type CompletedClosure<Arg1, Arg2> = Box<
    dyn FnOnce(
        <Arg1 as ClosureArg>::Output,
        <Arg2 as ClosureArg>::Output,
    ) -> ::windows::core::Result<()>,
>;

/// Generic closure signature for [`event_callback`].
pub type EventClosure<Arg1, Arg2> = Box<
    dyn FnMut(
        <Arg1 as ClosureArg>::Output,
        <Arg2 as ClosureArg>::Output,
    ) -> windows::core::Result<()>,
>;

#[event_callback]
pub struct IsDefaultDownloadDialogOpenChangedEventHandler(
    ICoreWebView2IsDefaultDownloadDialogOpenChangedEventHandler,
    Option<ICoreWebView2>,
    Option<IUnknown>,
);

#[event_callback]
pub struct IsDocumentPlayingAudioChangedEventHandler(
    ICoreWebView2IsDocumentPlayingAudioChangedEventHandler,
    Option<ICoreWebView2>,
    Option<IUnknown>,
);

#[event_callback]
pub struct IsMutedChangedEventHandler(
    ICoreWebView2IsMutedChangedEventHandler,
    Option<ICoreWebView2>,
    Option<IUnknown>,
);

#[completed_callback]
pub struct CreateCoreWebView2EnvironmentCompletedHandler(
    ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler,
    HRESULT,
    Option<ICoreWebView2Environment>,
);

#[completed_callback]
pub struct CreateCoreWebView2ControllerCompletedHandler(
    ICoreWebView2CreateCoreWebView2ControllerCompletedHandler,
    HRESULT,
    Option<ICoreWebView2Controller>,
);

#[event_callback]
pub struct NewBrowserVersionAvailableEventHandler(
    ICoreWebView2NewBrowserVersionAvailableEventHandler,
    Option<ICoreWebView2Environment>,
    Option<IUnknown>,
);

#[completed_callback]
pub struct CreateCoreWebView2CompositionControllerCompletedHandler(
    ICoreWebView2CreateCoreWebView2CompositionControllerCompletedHandler,
    HRESULT,
    Option<ICoreWebView2CompositionController>,
);

#[event_callback]
pub struct CursorChangedEventHandler(
    ICoreWebView2CursorChangedEventHandler,
    Option<ICoreWebView2CompositionController>,
    Option<IUnknown>,
);

#[event_callback]
pub struct ZoomFactorChangedEventHandler(
    ICoreWebView2ZoomFactorChangedEventHandler,
    Option<ICoreWebView2Controller>,
    Option<IUnknown>,
);

#[event_callback]
pub struct MoveFocusRequestedEventHandler(
    ICoreWebView2MoveFocusRequestedEventHandler,
    Option<ICoreWebView2Controller>,
    Option<ICoreWebView2MoveFocusRequestedEventArgs>,
);

#[event_callback]
pub struct FocusChangedEventHandler(
    ICoreWebView2FocusChangedEventHandler,
    Option<ICoreWebView2Controller>,
    Option<IUnknown>,
);

#[event_callback]
pub struct AcceleratorKeyPressedEventHandler(
    ICoreWebView2AcceleratorKeyPressedEventHandler,
    Option<ICoreWebView2Controller>,
    Option<ICoreWebView2AcceleratorKeyPressedEventArgs>,
);

#[event_callback]
pub struct ProcessInfosChangedEventHandler(
    ICoreWebView2ProcessInfosChangedEventHandler,
    Option<ICoreWebView2Environment>,
    Option<IUnknown>,
);

#[event_callback]
pub struct RasterizationScaleChangedEventHandler(
    ICoreWebView2RasterizationScaleChangedEventHandler,
    Option<ICoreWebView2Controller>,
    Option<IUnknown>,
);

#[event_callback]
pub struct NavigationStartingEventHandler(
    ICoreWebView2NavigationStartingEventHandler,
    Option<ICoreWebView2>,
    Option<ICoreWebView2NavigationStartingEventArgs>,
);

#[event_callback]
pub struct ContentLoadingEventHandler(
    ICoreWebView2ContentLoadingEventHandler,
    Option<ICoreWebView2>,
    Option<ICoreWebView2ContentLoadingEventArgs>,
);

#[event_callback]
pub struct SourceChangedEventHandler(
    ICoreWebView2SourceChangedEventHandler,
    Option<ICoreWebView2>,
    Option<ICoreWebView2SourceChangedEventArgs>,
);

#[event_callback]
pub struct DOMC
```