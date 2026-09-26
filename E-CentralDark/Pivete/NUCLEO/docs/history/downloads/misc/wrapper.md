# OUTRO - wrapper.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\digest-0.10.7\src\core_api\wrapper.rs
**SHA:** 033777bed7d140b1
**Timestamp:** 2026-08-28T02:34:01.882005
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: replace with an inherent associated type on stabilization:

### Ouro Bruto (primeiros 5000 chars)
```
use super::{
    AlgorithmName, Buffer, BufferKindUser, ExtendableOutputCore, FixedOutputCore, OutputSizeUser,
    Reset, UpdateCore, XofReaderCoreWrapper,
};
use crate::{
    ExtendableOutput, ExtendableOutputReset, FixedOutput, FixedOutputReset, HashMarker, Update,
};
use block_buffer::BlockBuffer;
use core::fmt;
use crypto_common::{
    typenum::{IsLess, Le, NonZero, U256},
    BlockSizeUser, InvalidLength, Key, KeyInit, KeySizeUser, Output,
};

#[cfg(feature = "mac")]
use crate::MacMarker;
#[cfg(feature = "oid")]
use const_oid::{AssociatedOid, ObjectIdentifier};

/// Wrapper around [`BufferKindUser`].
///
/// It handles data buffering and implements the slice-based traits.
#[derive(Clone, Default)]
pub struct CoreWrapper<T>
where
    T: BufferKindUser,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
    core: T,
    buffer: BlockBuffer<T::BlockSize, T::BufferKind>,
}

impl<T> HashMarker for CoreWrapper<T>
where
    T: BufferKindUser + HashMarker,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
}

#[cfg(feature = "mac")]
#[cfg_attr(docsrs, doc(cfg(feature = "mac")))]
impl<T> MacMarker for CoreWrapper<T>
where
    T: BufferKindUser + MacMarker,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
}

// this blanket impl is needed for HMAC
impl<T> BlockSizeUser for CoreWrapper<T>
where
    T: BufferKindUser + HashMarker,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
    type BlockSize = T::BlockSize;
}

impl<T> CoreWrapper<T>
where
    T: BufferKindUser,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
    /// Create new wrapper from `core`.
    #[inline]
    pub fn from_core(core: T) -> Self {
        let buffer = Default::default();
        Self { core, buffer }
    }

    /// Decompose wrapper into inner parts.
    #[inline]
    pub fn decompose(self) -> (T, Buffer<T>) {
        let Self { core, buffer } = self;
        (core, buffer)
    }
}

impl<T> KeySizeUser for CoreWrapper<T>
where
    T: BufferKindUser + KeySizeUser,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
    type KeySize = T::KeySize;
}

impl<T> KeyInit for CoreWrapper<T>
where
    T: BufferKindUser + KeyInit,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
    #[inline]
    fn new(key: &Key<Self>) -> Self {
        Self {
            core: T::new(key),
            buffer: Default::default(),
        }
    }

    #[inline]
    fn new_from_slice(key: &[u8]) -> Result<Self, InvalidLength> {
        Ok(Self {
            core: T::new_from_slice(key)?,
            buffer: Default::default(),
        })
    }
}

impl<T> fmt::Debug for CoreWrapper<T>
where
    T: BufferKindUser + AlgorithmName,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
    #[inline]
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> Result<(), fmt::Error> {
        T::write_alg_name(f)?;
        f.write_str(" { .. }")
    }
}

impl<T> Reset for CoreWrapper<T>
where
    T: BufferKindUser + Reset,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
    #[inline]
    fn reset(&mut self) {
        self.core.reset();
        self.buffer.reset();
    }
}

impl<T> Update for CoreWrapper<T>
where
    T: BufferKindUser + UpdateCore,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
    #[inline]
    fn update(&mut self, input: &[u8]) {
        let Self { core, buffer } = self;
        buffer.digest_blocks(input, |blocks| core.update_blocks(blocks));
    }
}

impl<T> OutputSizeUser for CoreWrapper<T>
where
    T: BufferKindUser + OutputSizeUser,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
    type OutputSize = T::OutputSize;
}

impl<T> FixedOutput for CoreWrapper<T>
where
    T: FixedOutputCore,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
    #[inline]
    fn finalize_into(mut self, out: &mut Output<Self>) {
        let Self { core, buffer } = &mut self;
        core.finalize_fixed_core(buffer, out);
    }
}

impl<T> FixedOutputReset for CoreWrapper<T>
where
    T: FixedOutputCore + Reset,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
{
    #[inline]
    fn finalize_into_reset(&mut self, out: &mut Output<Self>) {
        let Self { core, buffer } = self;
        core.finalize_fixed_core(buffer, out);
        core.reset();
        buffer.reset();
    }
}

impl<T> ExtendableOutput for CoreWrapper<T>
where
    T: ExtendableOutputCore,
    T::BlockSize: IsLess<U256>,
    Le<T::BlockSize, U256>: NonZero,
    <T::ReaderCore as BlockSizeUser>::BlockSize: IsLess<U256>,
    Le<<T::ReaderCore as BlockSizeUser>::BlockSize, U256>: NonZero,
{
    type Reader = XofReaderCoreWrapper<T::ReaderCore>;

    #[inline]
    fn finalize_xof(self) -> Self::Reader {
        let (mut core, mut buffer) = self.decompose();
        let core = core.finalize_xof_core(&mut buffer);
        let buffer = Default::default();
```

---

# OUTRO - wrapper.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-macros-2.6.3\src\command\wrapper.rs
**SHA:** 1ff1fbc6f18e0eee
**Timestamp:** 2026-08-28T02:35:56.658344
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: remove this check once our MSRV is high enough

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::{env::var, sync::OnceLock};

use heck::{ToLowerCamelCase, ToSnakeCase};
use proc_macro::TokenStream;
use proc_macro2::{Ident, Span, TokenStream as TokenStream2};
use quote::{format_ident, quote, quote_spanned};
use syn::{
  ext::IdentExt,
  parse::{Parse, ParseStream},
  parse_macro_input,
  punctuated::Punctuated,
  spanned::Spanned,
  Expr, ExprLit, FnArg, ItemFn, Lit, Meta, Pat, Token, Visibility,
};
use tauri_utils::acl::REMOVE_UNUSED_COMMANDS_ENV_VAR;

#[allow(clippy::large_enum_variant)]
enum WrapperAttributeKind {
  Meta(Meta),
  Async,
}

impl Parse for WrapperAttributeKind {
  fn parse(input: ParseStream) -> syn::Result<Self> {
    match input.parse::<Meta>() {
      Ok(m) => Ok(Self::Meta(m)),
      Err(e) => match input.parse::<Token![async]>() {
        Ok(_) => Ok(Self::Async),
        Err(_) => Err(e),
      },
    }
  }
}

struct WrapperAttributes {
  root: TokenStream2,
  execution_context: ExecutionContext,
  argument_case: ArgumentCase,
  rename: RenamePolicy,
}

impl Parse for WrapperAttributes {
  fn parse(input: ParseStream) -> syn::Result<Self> {
    let mut wrapper_attributes = WrapperAttributes {
      root: quote!(::tauri),
      execution_context: ExecutionContext::Blocking,
      argument_case: ArgumentCase::Camel,
      rename: RenamePolicy::Keep,
    };

    let attrs = Punctuated::<WrapperAttributeKind, Token![,]>::parse_terminated(input)?;
    for attr in attrs {
      match attr {
        WrapperAttributeKind::Meta(Meta::List(_)) => {
          return Err(syn::Error::new(input.span(), "unexpected list input"));
        }
        WrapperAttributeKind::Meta(Meta::NameValue(v)) => {
          if v.path.is_ident("rename_all") {
            if let Expr::Lit(ExprLit {
              lit: Lit::Str(s),
              attrs: _,
            }) = v.value
            {
              wrapper_attributes.argument_case = match s.value().as_str() {
                "snake_case" => ArgumentCase::Snake,
                "camelCase" => ArgumentCase::Camel,
                _ => {
                  return Err(syn::Error::new(
                    s.span(),
                    "expected \"camelCase\" or \"snake_case\"",
                  ))
                }
              };
            }
          } else if v.path.is_ident("rename") {
            if let Expr::Lit(ExprLit {
              lit: Lit::Str(s), ..
            }) = v.value
            {
              let lit = s.value();
              wrapper_attributes.rename = RenamePolicy::Rename(quote!(#lit));
            } else {
              return Err(syn::Error::new(
                v.span(),
                "expected string literal for rename",
              ));
            }
          } else if v.path.is_ident("root") {
            if let Expr::Lit(ExprLit {
              lit: Lit::Str(s),
              attrs: _,
            }) = v.value
            {
              let lit = s.value();

              wrapper_attributes.root = if lit == "crate" {
                quote!($crate)
              } else {
                let ident = Ident::new(&lit, Span::call_site());
                quote!(#ident)
              };
            }
          }
        }
        WrapperAttributeKind::Meta(Meta::Path(_)) => {
          return Err(syn::Error::new(
            input.span(),
            "unexpected input, expected one of `rename_all`, `rename`, `root`, `async`",
          ));
        }
        WrapperAttributeKind::Async => {
          wrapper_attributes.execution_context = ExecutionContext::Async;
        }
      }
    }

    Ok(wrapper_attributes)
  }
}

/// The execution context of the command.
enum ExecutionContext {
  Async,
  Blocking,
}

/// The case of each argument name.
#[derive(Copy, Clone)]
enum ArgumentCase {
  Snake,
  Camel,
}

/// The rename policy for the command.
enum RenamePolicy {
  Keep,
  Rename(TokenStream2),
}

/// The bindings we attach to `tauri::Invoke`.
struct Invoke {
  message: Ident,
  resolver: Ident,
  acl: Ident,
}

/// Create a new [`Wrapper`] from the function and the generated code parsed from the function.
pub fn wrapper(attributes: TokenStream, item: TokenStream) -> TokenStream {
  let mut attrs = parse_macro_input!(attributes as WrapperAttributes);
  let function = parse_macro_input!(item as ItemFn);
  let wrapper = super::format_command_wrapper(&function.sig.ident);
  let visibility = &function.vis;

  if function.sig.asyncness.is_some() {
    attrs.execution_context = ExecutionContext::Async;
  }

  // macros used with `pub use my_macro;` need to be exported with `#[macro_export]`.
  let maybe_macro_export = match &function.vis {
    Visibility::Public(_) | Visibility::Restricted(_) => {
      quote!(#[macro_export])
    }
    _ => TokenStream2::default(),
  };

  let invoke = Invoke {
    message: format_ident!("__tauri_message__"),
    resolver: format_ident!("__tauri_res
```