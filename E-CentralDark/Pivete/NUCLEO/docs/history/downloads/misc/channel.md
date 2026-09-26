# OUTRO - channel.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\crossbeam-channel-0.5.16\src\channel.rs
**SHA:** 6beaa5e2ddc89037
**Timestamp:** 2026-08-28T02:33:32.502978
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- /// let start = Instant::now();
- /// let start = Instant::now();
- /// let start = Instant::now();
- /// let start = Instant::now();

### Ouro Bruto (primeiros 5000 chars)
```
//! The channel interface.

use std::fmt;
use std::iter::FusedIterator;
use std::mem;
use std::panic::{RefUnwindSafe, UnwindSafe};
use std::sync::Arc;
use std::time::{Duration, Instant};

use crate::context::Context;
use crate::counter;
use crate::err::{
    RecvError, RecvTimeoutError, SendError, SendTimeoutError, TryRecvError, TrySendError,
};
use crate::flavors;
use crate::select::{Operation, SelectHandle, Token};

/// Creates a channel of unbounded capacity.
///
/// This channel has a growable buffer that can hold any number of messages at a time.
///
/// # Examples
///
/// ```
/// use std::thread;
/// use crossbeam_channel::unbounded;
///
/// let (s, r) = unbounded();
///
/// // Computes the n-th Fibonacci number.
/// fn fib(n: i32) -> i32 {
///     if n <= 1 {
///         n
///     } else {
///         fib(n - 1) + fib(n - 2)
///     }
/// }
///
/// // Spawn an asynchronous computation.
/// thread::spawn(move || s.send(fib(20)).unwrap());
///
/// // Print the result of the computation.
/// println!("{}", r.recv().unwrap());
/// ```
pub fn unbounded<T>() -> (Sender<T>, Receiver<T>) {
    let (s, r) = counter::new(flavors::list::Channel::new());
    let s = Sender {
        flavor: SenderFlavor::List(s),
    };
    let r = Receiver {
        flavor: ReceiverFlavor::List(r),
    };
    (s, r)
}

/// Creates a channel of bounded capacity.
///
/// This channel has a buffer that can hold at most `cap` messages at a time.
///
/// A special case is zero-capacity channel, which cannot hold any messages. Instead, send and
/// receive operations must appear at the same time in order to pair up and pass the message over.
///
/// # Examples
///
/// A channel of capacity 1:
///
/// ```
/// use std::thread;
/// use std::time::Duration;
/// use crossbeam_channel::bounded;
///
/// let (s, r) = bounded(1);
///
/// // This call returns immediately because there is enough space in the channel.
/// s.send(1).unwrap();
///
/// thread::spawn(move || {
///     // This call blocks the current thread because the channel is full.
///     // It will be able to complete only after the first message is received.
///     s.send(2).unwrap();
/// });
///
/// thread::sleep(Duration::from_secs(1));
/// assert_eq!(r.recv(), Ok(1));
/// assert_eq!(r.recv(), Ok(2));
/// ```
///
/// A zero-capacity channel:
///
/// ```
/// use std::thread;
/// use std::time::Duration;
/// use crossbeam_channel::bounded;
///
/// let (s, r) = bounded(0);
///
/// thread::spawn(move || {
///     // This call blocks the current thread until a receive operation appears
///     // on the other side of the channel.
///     s.send(1).unwrap();
/// });
///
/// thread::sleep(Duration::from_secs(1));
/// assert_eq!(r.recv(), Ok(1));
/// ```
pub fn bounded<T>(cap: usize) -> (Sender<T>, Receiver<T>) {
    if cap == 0 {
        let (s, r) = counter::new(flavors::zero::Channel::new());
        let s = Sender {
            flavor: SenderFlavor::Zero(s),
        };
        let r = Receiver {
            flavor: ReceiverFlavor::Zero(r),
        };
        (s, r)
    } else {
        let (s, r) = counter::new(flavors::array::Channel::with_capacity(cap));
        let s = Sender {
            flavor: SenderFlavor::Array(s),
        };
        let r = Receiver {
            flavor: ReceiverFlavor::Array(r),
        };
        (s, r)
    }
}

/// Creates a receiver that delivers a message after a certain duration of time.
///
/// The channel is bounded with capacity of 1 and never gets disconnected. Exactly one message will
/// be sent into the channel after `duration` elapses. The message is the instant at which it is
/// sent.
///
/// # Examples
///
/// Using an `after` channel for timeouts:
///
/// ```
/// use std::time::Duration;
/// use crossbeam_channel::{after, select, unbounded};
///
/// let (s, r) = unbounded::<i32>();
/// let timeout = Duration::from_millis(100);
///
/// select! {
///     recv(r) -> msg => println!("received {:?}", msg),
///     recv(after(timeout)) -> _ => println!("timed out"),
/// }
/// ```
///
/// When the message gets sent:
///
/// ```
/// use std::thread;
/// use std::time::{Duration, Instant};
/// use crossbeam_channel::after;
///
/// // Converts a number of milliseconds into a `Duration`.
/// let ms = |ms| Duration::from_millis(ms);
///
/// // Returns `true` if `a` and `b` are very close `Instant`s.
/// let eq = |a, b| a + ms(60) > b && b + ms(60) > a;
///
/// let start = Instant::now();
/// let r = after(ms(100));
///
/// thread::sleep(ms(500));
///
/// // This message was sent 100 ms from the start and received 500 ms from the start.
/// assert!(eq(r.recv().unwrap(), start + ms(100)));
/// assert!(eq(Instant::now(), start + ms(500)));
/// ```
pub fn after(duration: Duration) -> Receiver<Instant> {
    match Instant::now().checked_add(duration) {
        Some(deadline) => Receiver {
            flavor: ReceiverFlavor::At(Arc::new(flavors::at::Channel::new_deadline(deadline))),
        },
        None => never(),
    }
}

/// Creates a receiver 
```

---

# OUTRO - channel.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\src\ipc\channel.rs
**SHA:** 8533436b36afb959
**Timestamp:** 2026-08-28T02:35:54.366658
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Change this to `channel` in v3
- // TODO: Change this to `plugin:channel|fetch` in v3

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2019-2024 Tauri Programme within The Commons Conservancy
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

use std::{
  collections::HashMap,
  str::FromStr,
  sync::{
    atomic::{AtomicU32, AtomicUsize, Ordering},
    Arc, Mutex,
  },
};

use serde::{Deserialize, Deserializer, Serialize, Serializer};

use crate::{
  command,
  ipc::{CommandArg, CommandItem},
  plugin::{Builder as PluginBuilder, TauriPlugin},
  Manager, Runtime, State, Webview,
};

use super::{
  format_callback::format_raw_js, CallbackFn, InvokeError, InvokeResponseBody, IpcResponse,
  Request, Response,
};

pub const IPC_PAYLOAD_PREFIX: &str = "__CHANNEL__:";
// TODO: Change this to `channel` in v3
pub const CHANNEL_PLUGIN_NAME: &str = "__TAURI_CHANNEL__";
// TODO: Change this to `plugin:channel|fetch` in v3
pub const FETCH_CHANNEL_DATA_COMMAND: &str = "plugin:__TAURI_CHANNEL__|fetch";
const CHANNEL_ID_HEADER_NAME: &str = "Tauri-Channel-Id";

/// Maximum size a JSON we should send directly without going through the fetch process
// 8192 byte JSON payload runs roughly 2x faster through eval than through fetch on WebView2 v135
const MAX_JSON_DIRECT_EXECUTE_THRESHOLD: usize = 8192;
// 1024 byte payload runs  roughly 30% faster through eval than through fetch on macOS
const MAX_RAW_DIRECT_EXECUTE_THRESHOLD: usize = 1024;

static CHANNEL_COUNTER: AtomicU32 = AtomicU32::new(0);
static CHANNEL_DATA_COUNTER: AtomicU32 = AtomicU32::new(0);

/// Maps a channel id to a pending data that must be send to the JavaScript side via the IPC.
#[derive(Default, Clone)]
pub struct ChannelDataIpcQueue(Arc<Mutex<HashMap<u32, InvokeResponseBody>>>);

/// An IPC channel.
pub struct Channel<TSend = InvokeResponseBody> {
  inner: Arc<ChannelInner>,
  phantom: std::marker::PhantomData<TSend>,
}

#[cfg(feature = "specta")]
const _: () = {
  #[derive(specta::Type)]
  #[specta(remote = super::Channel)]
  #[allow(dead_code, non_camel_case_types)]
  struct TAURI_CHANNEL<TSend>(std::marker::PhantomData<TSend>);
};

impl<TSend> Clone for Channel<TSend> {
  fn clone(&self) -> Self {
    Self {
      inner: self.inner.clone(),
      phantom: self.phantom,
    }
  }
}

type OnDropFn = Option<Box<dyn Fn() + Send + Sync + 'static>>;
type OnMessageFn = Box<dyn Fn(InvokeResponseBody) -> crate::Result<()> + Send + Sync>;

struct ChannelInner {
  id: u32,
  on_message: OnMessageFn,
  on_drop: OnDropFn,
}

impl Drop for ChannelInner {
  fn drop(&mut self) {
    if let Some(on_drop) = &self.on_drop {
      on_drop();
    }
  }
}

impl<TSend> Serialize for Channel<TSend> {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    serializer.serialize_str(&format!("{IPC_PAYLOAD_PREFIX}{}", self.inner.id))
  }
}

/// The ID of a channel that was defined on the JavaScript layer.
///
/// Useful when expecting [`Channel`] as part of a JSON object instead of a top-level command argument.
///
/// # Examples
///
/// ```rust
/// use tauri::{ipc::JavaScriptChannelId, Runtime, Webview};
///
/// #[derive(serde::Deserialize)]
/// #[serde(rename_all = "camelCase")]
/// struct Button {
///   label: String,
///   on_click: JavaScriptChannelId,
/// }
///
/// #[tauri::command]
/// fn add_button<R: Runtime>(webview: Webview<R>, button: Button) {
///   let channel = button.on_click.channel_on(webview);
///   channel.send("clicked").unwrap();
/// }
/// ```
pub struct JavaScriptChannelId(CallbackFn);

impl FromStr for JavaScriptChannelId {
  type Err = &'static str;

  fn from_str(s: &str) -> Result<Self, Self::Err> {
    s.strip_prefix(IPC_PAYLOAD_PREFIX)
      .ok_or("invalid channel string")
      .and_then(|id| id.parse().map_err(|_| "invalid channel ID"))
      .map(|id| Self(CallbackFn(id)))
  }
}

impl JavaScriptChannelId {
  /// Gets a [`Channel`] for this channel ID on the given [`Webview`].
  pub fn channel_on<R: Runtime, TSend>(&self, webview: Webview<R>) -> Channel<TSend> {
    let callback_fn = self.0;
    let callback_id = callback_fn.0;

    let counter = Arc::new(AtomicUsize::new(0));
    let counter_clone = counter.clone();
    let webview_clone = webview.clone();

    Channel::new_with_id(
      callback_id,
      Box::new(move |body| {
        let current_index = counter.fetch_add(1, Ordering::Relaxed);

        if let Some(interceptor) = &webview.manager.channel_interceptor {
          if interceptor(&webview, callback_fn, current_index, &body) {
            return Ok(());
          }
        }

        match body {
          // Don't go through the fetch process if the payload is small
          InvokeResponseBody::Json(json_string)
            if json_string.len() < MAX_JSON_DIRECT_EXECUTE_THRESHOLD =>
          {
            webview.eval(format_raw_js(
              callback_id,
              format!("{{ message: {json_string}, index: {current_index} }}"),
            ))?;
          }
          InvokeResponseBody::Raw(bytes) if bytes.len() < MAX_RAW_DIRECT_EXECUTE_THRESHOLD => {
            let bytes_as_j
```