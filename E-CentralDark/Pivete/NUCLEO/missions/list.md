# MISSAO - list.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\runtime\task\list.rs
**SHA:** 7b39e1941241b677
**Timestamp:** 2026-08-28T02:36:18.803120
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- pub(crate) fn close_and_shutdown_all(&self, start: usize)

### Ouro Bruto (primeiros 5000 chars)
```
//! This module has containers for storing the tasks spawned on a scheduler. The
//! `OwnedTasks` container is thread-safe but can only store tasks that
//! implement Send. The `LocalOwnedTasks` container is not thread safe, but can
//! store non-Send tasks.
//!
//! The collections can be closed to prevent adding new tasks during shutdown of
//! the scheduler with the collection.

use crate::future::Future;
use crate::loom::cell::UnsafeCell;
use crate::runtime::task::{JoinHandle, LocalNotified, Notified, Schedule, SpawnLocation, Task};
use crate::util::linked_list::LinkedList;
use crate::util::sharded_list::ShardedList;

use crate::loom::sync::atomic::{AtomicBool, Ordering};
use std::marker::PhantomData;
use std::num::NonZeroU64;

// The id from the module below is used to verify whether a given task is stored
// in this OwnedTasks, or some other task. The counter starts at one so we can
// use `None` for tasks not owned by any list.
//
// The safety checks in this file can technically be violated if the counter is
// overflown, but the checks are not supposed to ever fail unless there is a
// bug in Tokio, so we accept that certain bugs would not be caught if the two
// mixed up runtimes happen to have the same id.

cfg_has_atomic_u64! {
    use std::sync::atomic::AtomicU64;

    static NEXT_OWNED_TASKS_ID: AtomicU64 = AtomicU64::new(1);

    fn get_next_id() -> NonZeroU64 {
        loop {
            let id = NEXT_OWNED_TASKS_ID.fetch_add(1, Ordering::Relaxed);
            if let Some(id) = NonZeroU64::new(id) {
                return id;
            }
        }
    }
}

cfg_not_has_atomic_u64! {
    use std::sync::atomic::AtomicU32;

    static NEXT_OWNED_TASKS_ID: AtomicU32 = AtomicU32::new(1);

    fn get_next_id() -> NonZeroU64 {
        loop {
            let id = NEXT_OWNED_TASKS_ID.fetch_add(1, Ordering::Relaxed);
            if let Some(id) = NonZeroU64::new(u64::from(id)) {
                return id;
            }
        }
    }
}

pub(crate) struct OwnedTasks<S: 'static> {
    list: ShardedList<Task<S>>,
    pub(crate) id: NonZeroU64,
    closed: AtomicBool,
}

pub(crate) struct LocalOwnedTasks<S: 'static> {
    inner: UnsafeCell<OwnedTasksInner<S>>,
    pub(crate) id: NonZeroU64,
    _not_send_or_sync: PhantomData<*const ()>,
}

struct OwnedTasksInner<S: 'static> {
    list: LinkedList<Task<S>>,
    closed: bool,
}

impl<S: 'static> OwnedTasks<S> {
    pub(crate) fn new(num_cores: usize) -> Self {
        let shard_size = Self::gen_shared_list_size(num_cores);
        Self {
            list: ShardedList::new(shard_size),
            closed: AtomicBool::new(false),
            id: get_next_id(),
        }
    }

    /// Binds the provided task to this `OwnedTasks` instance. This fails if the
    /// `OwnedTasks` has been closed.
    pub(crate) fn bind<T>(
        &self,
        task: T,
        scheduler: S,
        id: super::Id,
        spawned_at: SpawnLocation,
    ) -> (JoinHandle<T::Output>, Option<Notified<S>>)
    where
        S: Schedule,
        T: Future + Send + 'static,
        T::Output: Send + 'static,
    {
        let (task, notified, join) = super::new_task(task, scheduler, id, spawned_at);
        let notified = unsafe { self.bind_inner(task, notified) };
        (join, notified)
    }

    /// Bind a task that isn't safe to transfer across thread boundaries.
    ///
    /// # Safety
    ///
    /// Only use this in `LocalRuntime` where the task cannot move
    pub(crate) unsafe fn bind_local<T>(
        &self,
        task: T,
        scheduler: S,
        id: super::Id,
        spawned_at: SpawnLocation,
    ) -> (JoinHandle<T::Output>, Option<Notified<S>>)
    where
        S: Schedule,
        T: Future + 'static,
        T::Output: 'static,
    {
        let (task, notified, join) = super::new_task(task, scheduler, id, spawned_at);
        let notified = unsafe { self.bind_inner(task, notified) };
        (join, notified)
    }

    /// The part of `bind` that's the same for every type of future.
    unsafe fn bind_inner(&self, task: Task<S>, notified: Notified<S>) -> Option<Notified<S>>
    where
        S: Schedule,
    {
        unsafe {
            // safety: We just created the task, so we have exclusive access
            // to the field.
            task.header().set_owner_id(self.id);
        }

        let shard = self.list.lock_shard(&task);
        // Check the closed flag in the lock for ensuring all that tasks
        // will shut down after the OwnedTasks has been closed.
        if self.closed.load(Ordering::Acquire) {
            drop(shard);
            task.shutdown();
            return None;
        }
        shard.push(task);
        Some(notified)
    }

    /// Asserts that the given task is owned by this `OwnedTasks` and convert it to
    /// a `LocalNotified`, giving the thread permission to poll this task.
    #[inline]
    pub(crate) fn assert_owner(&self, task: Notified<S>) -> LocalNotified<S> {
        debug_assert_eq!(task.header().get_own
```