# OUTRO - local.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\task\local.rs
**SHA:** 20781947af1c4a17
**Timestamp:** 2026-08-28T02:36:20.834135
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: This should be set as a builder
- // TODO: remove this hack when thread id is cleaned up

### Ouro Bruto (primeiros 5000 chars)
```
//! Runs `!Send` futures on the current thread.
use crate::loom::cell::UnsafeCell;
use crate::loom::sync::{Arc, Mutex};
use crate::runtime;
use crate::runtime::task::{
    self, JoinHandle, LocalOwnedTasks, SpawnLocation, Task, TaskHarnessScheduleHooks,
};
use crate::runtime::{context, ThreadId, BOX_FUTURE_THRESHOLD};
use crate::sync::AtomicWaker;
use crate::util::trace::SpawnMeta;
use crate::util::RcCell;

use std::cell::Cell;
use std::collections::VecDeque;
use std::fmt;
use std::future::Future;
use std::marker::PhantomData;
use std::mem;
use std::pin::Pin;
use std::rc::Rc;
use std::task::Poll;

use pin_project_lite::pin_project;

cfg_rt! {
    /// A set of tasks which are executed on the same thread.
    ///
    /// In some cases, it is necessary to run one or more futures that do not
    /// implement [`Send`] and thus are unsafe to send between threads. In these
    /// cases, a [local task set] may be used to schedule one or more `!Send`
    /// futures to run together on the same thread.
    ///
    /// For example, the following code will not compile:
    ///
    /// ```rust,compile_fail
    /// use std::rc::Rc;
    ///
    /// #[tokio::main]
    /// async fn main() {
    ///     // `Rc` does not implement `Send`, and thus may not be sent between
    ///     // threads safely.
    ///     let nonsend_data = Rc::new("my nonsend data...");
    ///
    ///     let nonsend_data = nonsend_data.clone();
    ///     // Because the `async` block here moves `nonsend_data`, the future is `!Send`.
    ///     // Since `tokio::spawn` requires the spawned future to implement `Send`, this
    ///     // will not compile.
    ///     tokio::spawn(async move {
    ///         println!("{}", nonsend_data);
    ///         // ...
    ///     }).await.unwrap();
    /// }
    /// ```
    ///
    /// # Use with `run_until`
    ///
    /// To spawn `!Send` futures, we can use a local task set to schedule them
    /// on the thread calling [`Runtime::block_on`]. When running inside of the
    /// local task set, we can use [`task::spawn_local`], which can spawn
    /// `!Send` futures. For example:
    ///
    /// ```rust
    /// use std::rc::Rc;
    /// use tokio::task;
    ///
    /// # #[tokio::main(flavor = "current_thread")]
    /// # async fn main() {
    /// let nonsend_data = Rc::new("my nonsend data...");
    ///
    /// // Construct a local task set that can run `!Send` futures.
    /// let local = task::LocalSet::new();
    ///
    /// // Run the local task set.
    /// local.run_until(async move {
    ///     let nonsend_data = nonsend_data.clone();
    ///     // `spawn_local` ensures that the future is spawned on the local
    ///     // task set.
    ///     task::spawn_local(async move {
    ///         println!("{}", nonsend_data);
    ///         // ...
    ///     }).await.unwrap();
    /// }).await;
    /// # }
    /// ```
    /// **Note:** The `run_until` method can only be used in `#[tokio::main]`,
    /// `#[tokio::test]` or directly inside a call to [`Runtime::block_on`]. It
    /// cannot be used inside a task spawned with `tokio::spawn`.
    ///
    /// ## Awaiting a `LocalSet`
    ///
    /// Additionally, a `LocalSet` itself implements `Future`, completing when
    /// *all* tasks spawned on the `LocalSet` complete. This can be used to run
    /// several futures on a `LocalSet` and drive the whole set until they
    /// complete. For example,
    ///
    /// ```rust
    /// use tokio::{task, time};
    /// use std::rc::Rc;
    ///
    /// # #[tokio::main(flavor = "current_thread")]
    /// # async fn main() {
    /// let nonsend_data = Rc::new("world");
    /// let local = task::LocalSet::new();
    ///
    /// let nonsend_data2 = nonsend_data.clone();
    /// local.spawn_local(async move {
    ///     // ...
    ///     println!("hello {}", nonsend_data2)
    /// });
    ///
    /// local.spawn_local(async move {
    ///     time::sleep(time::Duration::from_millis(100)).await;
    ///     println!("goodbye {}", nonsend_data)
    /// });
    ///
    /// // ...
    ///
    /// local.await;
    /// # }
    /// ```
    /// **Note:** Awaiting a `LocalSet` can only be done inside
    /// `#[tokio::main]`, `#[tokio::test]` or directly inside a call to
    /// [`Runtime::block_on`]. It cannot be used inside a task spawned with
    /// `tokio::spawn`.
    ///
    /// ## Use inside `tokio::spawn`
    ///
    /// The two methods mentioned above cannot be used inside `tokio::spawn`, so
    /// to spawn `!Send` futures from inside `tokio::spawn`, we need to do
    /// something else. The solution is to create the `LocalSet` somewhere else,
    /// and communicate with it using an [`mpsc`] channel.
    ///
    /// The following example puts the `LocalSet` inside a new thread.
    /// ```
    /// # #[cfg(not(target_family = "wasm"))]
    /// # {
    /// use tokio::runtime::Builder;
    /// use tokio::sync::{mpsc, oneshot};
    /// use tokio::task::LocalSet;
    ///
    /// // This struct describes the task 
```