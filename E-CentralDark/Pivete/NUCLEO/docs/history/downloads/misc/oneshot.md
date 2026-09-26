# OUTRO - oneshot.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\sync\oneshot.rs
**SHA:** 0068b57b942098cf
**Timestamp:** 2026-08-28T02:36:20.068986
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Consume waker?
- // TODO: This could be `Release`, followed by an `Acquire` fence *if*

### Ouro Bruto (primeiros 5000 chars)
```
#![cfg_attr(not(feature = "sync"), allow(dead_code, unreachable_pub))]

//! A one-shot channel is used for sending a single message between
//! asynchronous tasks. The [`channel`] function is used to create a
//! [`Sender`] and [`Receiver`] handle pair that form the channel.
//!
//! The `Sender` handle is used by the producer to send the value.
//! The `Receiver` handle is used by the consumer to receive the value.
//!
//! Each handle can be used on separate tasks.
//!
//! Since the `send` method is not async, it can be used anywhere. This includes
//! sending between two runtimes, and using it from non-async code.
//!
//! If the [`Receiver`] is closed before receiving a message which has already
//! been sent, the message will remain in the channel until the receiver is
//! dropped, at which point the message will be dropped immediately.
//!
//! # Examples
//!
//! ```
//! use tokio::sync::oneshot;
//!
//! # #[tokio::main(flavor = "current_thread")]
//! # async fn main() {
//! let (tx, rx) = oneshot::channel();
//!
//! tokio::spawn(async move {
//!     if let Err(_) = tx.send(3) {
//!         println!("the receiver dropped");
//!     }
//! });
//!
//! match rx.await {
//!     Ok(v) => println!("got = {:?}", v),
//!     Err(_) => println!("the sender dropped"),
//! }
//! # }
//! ```
//!
//! If the sender is dropped without sending, the receiver will fail with
//! [`error::RecvError`]:
//!
//! ```
//! use tokio::sync::oneshot;
//!
//! # #[tokio::main(flavor = "current_thread")]
//! # async fn main() {
//! let (tx, rx) = oneshot::channel::<u32>();
//!
//! tokio::spawn(async move {
//!     drop(tx);
//! });
//!
//! match rx.await {
//!     Ok(_) => panic!("This doesn't happen"),
//!     Err(_) => println!("the sender dropped"),
//! }
//! # }
//! ```
//!
//! To use a `oneshot` channel in a `tokio::select!` loop, add `&mut` in front of
//! the channel.
//!
//! ```
//! use tokio::sync::oneshot;
//! use tokio::time::{interval, sleep, Duration};
//!
//! # #[tokio::main(flavor = "current_thread")]
//! # async fn _doc() {}
//! # #[tokio::main(flavor = "current_thread", start_paused = true)]
//! # async fn main() {
//! let (send, mut recv) = oneshot::channel();
//! let mut interval = interval(Duration::from_millis(100));
//!
//! # let handle =
//! tokio::spawn(async move {
//!     sleep(Duration::from_secs(1)).await;
//!     send.send("shut down").unwrap();
//! });
//!
//! loop {
//!     tokio::select! {
//!         _ = interval.tick() => println!("Another 100ms"),
//!         msg = &mut recv => {
//!             println!("Got message: {}", msg.unwrap());
//!             break;
//!         }
//!     }
//! }
//! # handle.await.unwrap();
//! # }
//! ```
//!
//! To use a `Sender` from a destructor, put it in an [`Option`] and call
//! [`Option::take`].
//!
//! ```
//! use tokio::sync::oneshot;
//!
//! struct SendOnDrop {
//!     sender: Option<oneshot::Sender<&'static str>>,
//! }
//! impl Drop for SendOnDrop {
//!     fn drop(&mut self) {
//!         if let Some(sender) = self.sender.take() {
//!             // Using `let _ =` to ignore send errors.
//!             let _ = sender.send("I got dropped!");
//!         }
//!     }
//! }
//!
//! # #[tokio::main(flavor = "current_thread")]
//! # async fn _doc() {}
//! # #[tokio::main(flavor = "current_thread")]
//! # async fn main() {
//! let (send, recv) = oneshot::channel();
//!
//! let send_on_drop = SendOnDrop { sender: Some(send) };
//! drop(send_on_drop);
//!
//! assert_eq!(recv.await, Ok("I got dropped!"));
//! # }
//! ```

use crate::loom::cell::UnsafeCell;
use crate::loom::sync::atomic::AtomicUsize;
use crate::loom::sync::Arc;
#[cfg(all(tokio_unstable, feature = "tracing"))]
use crate::util::trace;

use std::fmt;
use std::future::Future;
use std::mem::MaybeUninit;
use std::pin::Pin;
use std::sync::atomic::Ordering::{self, AcqRel, Acquire};
use std::task::Poll::{Pending, Ready};
use std::task::{ready, Context, Poll, Waker};

/// Sends a value to the associated [`Receiver`].
///
/// A pair of both a [`Sender`] and a [`Receiver`]  are created by the
/// [`channel`](fn@channel) function.
///
/// # Examples
///
/// ```
/// use tokio::sync::oneshot;
///
/// # #[tokio::main(flavor = "current_thread")]
/// # async fn main() {
/// let (tx, rx) = oneshot::channel();
///
/// tokio::spawn(async move {
///     if let Err(_) = tx.send(3) {
///         println!("the receiver dropped");
///     }
/// });
///
/// match rx.await {
///     Ok(v) => println!("got = {:?}", v),
///     Err(_) => println!("the sender dropped"),
/// }
/// # }
/// ```
///
/// If the sender is dropped without sending, the receiver will fail with
/// [`error::RecvError`]:
///
/// ```
/// use tokio::sync::oneshot;
///
/// # #[tokio::main(flavor = "current_thread")]
/// # async fn main() {
/// let (tx, rx) = oneshot::channel::<u32>();
///
/// tokio::spawn(async move {
///     drop(tx);
/// });
///
/// match rx.await {
///     Ok(_) => panic!("This doesn't happen"),
///     Err(_) => println!("the sender dropped")
```