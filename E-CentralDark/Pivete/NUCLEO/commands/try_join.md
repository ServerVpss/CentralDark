# COMANDO - try_join.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\macros\try_join.rs
**SHA:** ec788f1b490234d9
**Timestamp:** 2026-08-28T02:36:13.293186
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let mut to_run = COUNT;
- if to_run == 0 {

### Ouro Bruto (primeiros 5000 chars)
```
macro_rules! doc {
    ($try_join:item) => {
        /// Waits on multiple concurrent branches, returning when **all** branches
        /// complete with `Ok(_)` or on the first `Err(_)`.
        ///
        /// The `try_join!` macro must be used inside of async functions, closures, and
        /// blocks.
        ///
        /// Similar to [`join!`], the `try_join!` macro takes a list of async
        /// expressions and evaluates them concurrently on the same task. Each async
        /// expression evaluates to a future and the futures from each expression are
        /// multiplexed on the current task. The `try_join!` macro returns when **all**
        /// branches return with `Ok` or when the **first** branch returns with `Err`.
        ///
        /// [`join!`]: macro@join
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
        /// join handle to `try_join!`.
        ///
        /// [`tokio::spawn`]: crate::spawn
        ///
        /// ## Fairness
        ///
        /// By default, `try_join!`'s generated future rotates which
        /// contained future is polled first whenever it is woken.
        ///
        /// This behavior can be overridden by adding `biased;` to the beginning of the
        /// macro usage. See the examples for details. This will cause `try_join` to poll
        /// the futures in the order they appear from top to bottom.
        ///
        /// You may want this if your futures may interact in a way where known polling order is significant.
        ///
        /// But there is an important caveat to this mode. It becomes your responsibility
        /// to ensure that the polling order of your futures is fair. If for example you
        /// are joining a stream and a shutdown future, and the stream has a
        /// huge volume of messages that takes a long time to finish processing per poll, you should
        /// place the shutdown future earlier in the `try_join!` list to ensure that it is
        /// always polled, and will not be delayed due to the stream future taking a long time to return
        /// `Poll::Pending`.
        ///
        /// # Examples
        ///
        /// Basic `try_join` with two branches.
        ///
        /// ```
        /// async fn do_stuff_async() -> Result<(), &'static str> {
        ///     // async work
        /// # Ok(())
        /// }
        ///
        /// async fn more_async_work() -> Result<(), &'static str> {
        ///     // more here
        /// # Ok(())
        /// }
        ///
        /// # #[tokio::main(flavor = "current_thread")]
        /// # async fn main() {
        /// let res = tokio::try_join!(
        ///     do_stuff_async(),
        ///     more_async_work());
        ///
        /// match res {
        ///     Ok((first, second)) => {
        ///         // do something with the values
        ///     }
        ///     Err(err) => {
        ///         println!("processing failed; error = {}", err);
        ///     }
        /// }
        /// # }
        /// ```
        ///
        /// Using `try_join!` with spawned tasks.
        ///
        /// ```
        /// use tokio::task::JoinHandle;
        ///
        /// async fn do_stuff_async() -> Result<(), &'static str> {
        ///     // async work
        /// # Err("failed")
        /// }
        ///
        /// async fn more_async_work() -> Result<(), &'static str> {
        ///     // more here
        /// # Ok(())
        /// }
        ///
        /// async fn flatten<T>(handle: JoinHandle<Result<T, &'static str>>) -> Result<T, &'static str> {
        ///     match handle.await {
        ///         Ok(Ok(result)) => Ok(result),
        ///         Ok(Err(err)) => Err(err),
        ///         Err(err) => Err("handling failed"),
        ///     }
        /// }
        ///
        /// # #[tokio::main(flavor = "current_thread")]
        /// # async fn main() {
        /// let handle1 = tokio::spawn(do_stuff_async());
        /// let handle2 = tokio::spawn(more_async_work());
        /// match tokio::try_join!(flatten(handle1), flatten(handle2)) {
        ///     Ok(val) => {
        ///         // do something with the values
        ///     }
        ///     Err(err) => {
        ///         println!("Failed with {}.", err);
        ///         # assert_eq!(err, "failed");
        ///     }
        /// }
        /// # }
        /// ```
        /// Using the `biased;` mode to control polli
```