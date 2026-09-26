# COMANDO - select.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tokio-1.53.1\src\macros\select.rs
**SHA:** a1f6cb8d20a37865
**Timestamp:** 2026-08-28T02:36:13.266780
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start=$start:expr;
- let start = $start;
- (@ { start=$start:expr; $($t:tt)* } ) => {
- $crate::select!(@{ start=$start; $($t)*; panic!("all branches are disabled and there is no else branch") })
- (@ { start=$start:expr; $($t:tt)* } else => $else:expr $(,)?) => {
- $crate::select!(@{ start=$start; $($t)*; $else })
- (@ { start=$start:expr; ( $($s:tt)* ) $($t:tt)* } $p:pat = $f:expr, if $c:expr => $h:block, $($r:tt)* ) => {
- $crate::select!(@{ start=$start; ($($s)* _) $($t)* ($($s)*) $p = $f, if $c => $h, } $($r)*)
- (@ { start=$start:expr; ( $($s:tt)* ) $($t:tt)* } $p:pat = $f:expr => $h:block, $($r:tt)* ) => {
- $crate::select!(@{ start=$start; ($($s)* _) $($t)* ($($s)*) $p = $f, if true => $h, } $($r)*)

### Padroes
- /// The `select!` macro accepts one or more branches with the following pattern:

### Ouro Bruto (primeiros 5000 chars)
```
macro_rules! doc {
    ($select:item) => {
        /// Waits on multiple concurrent branches, returning when the **first** branch
        /// completes, cancelling the remaining branches.
        ///
        /// The `select!` macro must be used inside of async functions, closures, and
        /// blocks.
        ///
        /// The `select!` macro accepts one or more branches with the following pattern:
        ///
        /// ```text
        /// <pattern> = <async expression> (, if <precondition>)? => <handler>,
        /// ```
        ///
        /// Additionally, the `select!` macro may include a single, optional `else`
        /// branch, which evaluates if none of the other branches match their patterns:
        ///
        /// ```text
        /// else => <expression>
        /// ```
        ///
        /// The macro aggregates all `<async expression>` expressions and runs them
        /// concurrently on the **current** task. Once the **first** expression
        /// completes with a value that matches its `<pattern>`, the `select!` macro
        /// returns the result of evaluating the completed branch's `<handler>`
        /// expression.
        ///
        /// Additionally, each branch may include an optional `if` precondition. If the
        /// precondition returns `false`, then the branch is disabled. The provided
        /// `<async expression>` is still evaluated but the resulting future is never
        /// polled. This capability is useful when using `select!` within a loop.
        ///
        /// The complete lifecycle of a `select!` expression is as follows:
        ///
        /// 1. Evaluate all provided `<precondition>` expressions. If the precondition
        ///    returns `false`, disable the branch for the remainder of the current call
        ///    to `select!`. Re-entering `select!` due to a loop clears the "disabled"
        ///    state.
        /// 2. Aggregate the `<async expression>`s from each branch, including the
        ///    disabled ones. If the branch is disabled, `<async expression>` is still
        ///    evaluated, but the resulting future is not polled.
        /// 3. If **all** branches are disabled: go to step 6.
        /// 4. Concurrently await on the results for all remaining `<async expression>`s.
        /// 5. Once an `<async expression>` returns a value, attempt to apply the value to the
        ///    provided `<pattern>`. If the pattern matches, evaluate the `<handler>` and return.
        ///    If the pattern **does not** match, disable the current branch for the remainder of
        ///    the current call to `select!`. Continue from step 3.
        /// 6. Evaluate the `else` expression. If no else expression is provided, panic.
        ///
        /// # Runtime characteristics
        ///
        /// By running all async expressions on the current task, the expressions are
        /// able to run **concurrently** but not in **parallel**. This means all
        /// expressions are run on the same thread and if one branch blocks the thread,
        /// all other expressions will be unable to continue. If parallelism is
        /// required, spawn each async expression using [`tokio::spawn`] and pass the
        /// join handle to `select!`.
        ///
        /// [`tokio::spawn`]: crate::spawn
        ///
        /// # Fairness
        ///
        /// By default, `select!` randomly picks a branch to check first. This provides
        /// some level of fairness when calling `select!` in a loop with branches that
        /// are always ready.
        ///
        /// This behavior can be overridden by adding `biased;` to the beginning of the
        /// macro usage. See the examples for details. This will cause `select` to poll
        /// the futures in the order they appear from top to bottom. There are a few
        /// reasons you may want this:
        ///
        /// - The random number generation of `tokio::select!` has a non-zero CPU cost
        /// - Your futures may interact in a way where known polling order is significant
        ///
        /// But there is an important caveat to this mode. It becomes your responsibility
        /// to ensure that the polling order of your futures is fair. If for example you
        /// are selecting between a stream and a shutdown future, and the stream has a
        /// huge volume of messages and zero or nearly zero time between them, you should
        /// place the shutdown future earlier in the `select!` list to ensure that it is
        /// always polled, and will not be ignored due to the stream being constantly
        /// ready.
        ///
        /// # Panics
        ///
        /// The `select!` macro panics if all branches are disabled **and** there is no
        /// provided `else` branch. A branch is disabled when the provided `if`
        /// precondition returns `false` **or** when the pattern does not match the
        /// result of `<async expression>`.
        ///
        /// # Can
```