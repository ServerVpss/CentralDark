# COMANDO - join.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\macros\join.rs
**SHA:** 85d9d743e986ffad
**Timestamp:** 2026-08-28T02:36:13.179177
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let mut to_run = COUNT;
- if to_run == 0 {

### Ouro Bruto (primeiros 5000 chars)
```
macro_rules! doc {
    ($join:item) => {
        /// Waits on multiple concurrent branches, returning when **all** branches
        /// complete.
        ///
        /// The `join!` macro must be used inside of async functions, closures, and
        /// blocks.
        ///
        /// The `join!` macro takes a list of async expressions and evaluates them
        /// concurrently on the same task. Each async expression evaluates to a future
        /// and the futures from each expression are multiplexed on the current task.
        ///
        /// When working with async expressions returning `Result`, `join!` will wait
        /// for **all** branches complete regardless if any complete with `Err`. Use
        /// [`try_join!`] to return early when `Err` is encountered.
        ///
        /// [`try_join!`]: crate::try_join
        ///
        /// # Notes
        ///
        /// The supplied futures are stored inline and do not require allocating a
        /// `Vec`.
        ///
        /// ## Runtime characteristics
        ///
        /// By running all async expressions on the current task, the expressions are
        /// able to run **concurrently** but not in **parallel**. This means all
        /// expressions are run on the same thread and if one branch blocks the thread,
        /// all other expressions will be unable to continue. If parallelism is
        /// required, spawn each async expression using [`tokio::spawn`] and pass the
        /// join handle to `join!`.
        ///
        /// [`tokio::spawn`]: crate::spawn
        ///
        /// ## Fairness
        ///
        /// By default, `join!`'s generated future rotates which contained
        /// future is polled first whenever it is woken.
        ///
        /// This behavior can be overridden by adding `biased;` to the beginning of the
        /// macro usage. See the examples for details. This will cause `join` to poll
        /// the futures in the order they appear from top to bottom.
        ///
        /// You may want this if your futures may interact in a way where known polling order is significant.
        ///
        /// But there is an important caveat to this mode. It becomes your responsibility
        /// to ensure that the polling order of your futures is fair. If for example you
        /// are joining a stream and a shutdown future, and the stream has a
        /// huge volume of messages that takes a long time to finish processing per poll, you should
        /// place the shutdown future earlier in the `join!` list to ensure that it is
        /// always polled, and will not be delayed due to the stream future taking a long time to return
        /// `Poll::Pending`.
        ///
        /// # Examples
        ///
        /// Basic join with two branches
        ///
        /// ```
        /// async fn do_stuff_async() {
        ///     // async work
        /// }
        ///
        /// async fn more_async_work() {
        ///     // more here
        /// }
        ///
        /// # #[tokio::main(flavor = "current_thread")]
        /// # async fn main() {
        /// let (first, second) = tokio::join!(
        ///     do_stuff_async(),
        ///     more_async_work());
        ///
        /// // do something with the values
        /// # }
        /// ```
        ///
        /// Using the `biased;` mode to control polling order.
        ///
        /// ```
        /// # #[cfg(not(target_family = "wasm"))]
        /// # {
        /// async fn do_stuff_async() {
        ///     // async work
        /// }
        ///
        /// async fn more_async_work() {
        ///     // more here
        /// }
        ///
        /// # #[tokio::main(flavor = "current_thread")]
        /// # async fn main() {
        /// let (first, second) = tokio::join!(
        ///     biased;
        ///     do_stuff_async(),
        ///     more_async_work()
        /// );
        ///
        /// // do something with the values
        /// # }
        /// # }
        /// ```

        #[macro_export]
        #[cfg_attr(docsrs, doc(cfg(feature = "macros")))]
        $join
    };
}

#[cfg(doc)]
doc! {macro_rules! join {
    ($(biased;)? $($future:expr),*) => { unimplemented!() }
}}

#[cfg(not(doc))]
doc! {macro_rules! join {
    (@ {
        // Type of rotator that controls which inner future to start with
        // when polling our output future.
        rotator_select=$rotator_select:ty;

        // One `_` for each branch in the `join!` macro. This is not used once
        // normalization is complete.
        ( $($count:tt)* )

        // The expression `0+1+1+ ... +1` equal to the number of branches.
        ( $($total:tt)* )

        // Normalized join! branches
        $( ( $($skip:tt)* ) $e:expr, )*

    }) => {{
        // Safety: nothing must be moved out of `futures`. This is to satisfy
        // the requirement of `Pin::new_unchecked` called below.
        //
        // We can't use the `pin!` macro for this because `futures` is a
```