# DECISAO - macros.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tracing-0.1.44\src\macros.rs
**SHA:** 4c367e39d560ae16
**Timestamp:** 2026-08-28T02:36:27.670550
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: determine if this ought to be public API?`

### Ouro Bruto (primeiros 5000 chars)
```
/// Constructs a new span.
///
/// See [the top-level documentation][lib] for details on the syntax accepted by
/// this macro.
///
/// [lib]: crate#using-the-macros
///
/// # Examples
///
/// Creating a new span:
/// ```
/// # use tracing::{span, Level};
/// # fn main() {
/// let span = span!(Level::TRACE, "my span");
/// let _enter = span.enter();
/// // do work inside the span...
/// # }
/// ```
#[macro_export]
macro_rules! span {
    (target: $target:expr, parent: $parent:expr, $lvl:expr, $name:expr) => {
        $crate::span!(target: $target, parent: $parent, $lvl, $name,)
    };
    (target: $target:expr, parent: $parent:expr, $lvl:expr, $name:expr, $($fields:tt)*) => {
        {
            use $crate::__macro_support::Callsite as _;
            static __CALLSITE: $crate::__macro_support::MacroCallsite = $crate::callsite2! {
                name: $name,
                kind: $crate::metadata::Kind::SPAN,
                target: $target,
                level: $lvl,
                fields: $($fields)*
            };
            let mut interest = $crate::subscriber::Interest::never();
            if $crate::level_enabled!($lvl)
                && { interest = __CALLSITE.interest(); !interest.is_never() }
                && $crate::__macro_support::__is_enabled(__CALLSITE.metadata(), interest)
            {
                let meta = __CALLSITE.metadata();
                // span with explicit parent
                $crate::Span::child_of(
                    $parent,
                    meta,
                    &$crate::valueset_all!(meta.fields(), $($fields)*),
                )
            } else {
                let span = $crate::__macro_support::__disabled_span(__CALLSITE.metadata());
                $crate::if_log_enabled! { $lvl, {
                    span.record_all(&$crate::valueset_all!(__CALLSITE.metadata().fields(), $($fields)*));
                }};
                span
            }
        }
    };
    (target: $target:expr, $lvl:expr, $name:expr, $($fields:tt)*) => {
        {
            use $crate::__macro_support::Callsite as _;
            static __CALLSITE: $crate::callsite::DefaultCallsite = $crate::callsite2! {
                name: $name,
                kind: $crate::metadata::Kind::SPAN,
                target: $target,
                level: $lvl,
                fields: $($fields)*
            };
            let mut interest = $crate::subscriber::Interest::never();
            if $crate::level_enabled!($lvl)
                && { interest = __CALLSITE.interest(); !interest.is_never() }
                && $crate::__macro_support::__is_enabled(__CALLSITE.metadata(), interest)
            {
                let meta = __CALLSITE.metadata();
                // span with contextual parent
                $crate::Span::new(
                    meta,
                    &$crate::valueset_all!(meta.fields(), $($fields)*),
                )
            } else {
                let span = $crate::__macro_support::__disabled_span(__CALLSITE.metadata());
                $crate::if_log_enabled! { $lvl, {
                    span.record_all(&$crate::valueset_all!(__CALLSITE.metadata().fields(), $($fields)*));
                }};
                span
            }
        }
    };
    (target: $target:expr, parent: $parent:expr, $lvl:expr, $name:expr) => {
        $crate::span!(target: $target, parent: $parent, $lvl, $name,)
    };
    (parent: $parent:expr, $lvl:expr, $name:expr, $($fields:tt)*) => {
        $crate::span!(
            target: module_path!(),
            parent: $parent,
            $lvl,
            $name,
            $($fields)*
        )
    };
    (parent: $parent:expr, $lvl:expr, $name:expr) => {
        $crate::span!(
            target: module_path!(),
            parent: $parent,
            $lvl,
            $name,
        )
    };
    (target: $target:expr, $lvl:expr, $name:expr, $($fields:tt)*) => {
        $crate::span!(
            target: $target,
            $lvl,
            $name,
            $($fields)*
        )
    };
    (target: $target:expr, $lvl:expr, $name:expr) => {
        $crate::span!(target: $target, $lvl, $name,)
    };
    ($lvl:expr, $name:expr, $($fields:tt)*) => {
        $crate::span!(
            target: module_path!(),
            $lvl,
            $name,
            $($fields)*
        )
    };
    ($lvl:expr, $name:expr) => {
        $crate::span!(
            target: module_path!(),
            $lvl,
            $name,
        )
    };
}

/// Records multiple values on a span in a single call. As with recording
/// individual values, all fields must be declared when the span is created.
///
/// This macro supports two optional sigils:
/// - `%` uses the Display implementation.
/// - `?` uses the Debug implementation.
///
/// For more details, see the [top-level documentation][lib].
///
/// [lib]: tracing/#recording-fields
///
/// # Examples
///
/// ```
/// # use tracing::{field, info_span, record_all};
/// let span = info_span!("my
```