# CONTRATO - lib.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cc-1.4.2\src\lib.rs
**SHA:** e884b6dacee5d4e3
**Timestamp:** 2026-08-28T02:33:21.257966
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Should we allow overriding these with `Build::env`?

### Ouro Bruto (primeiros 5000 chars)
```
//! A library for [Cargo build scripts](https://doc.rust-lang.org/cargo/reference/build-scripts.html)
//! to compile a set of C/C++/assembly/CUDA files into a static archive for Cargo
//! to link into the crate being built. This crate does not compile code itself;
//! it calls out to the default compiler for the platform. This crate will
//! automatically detect situations such as cross compilation and
//! [various environment variables](#external-configuration-via-environment-variables) and will build code appropriately.
//!
//! # Example
//!
//! First, you'll want to both add a build script for your crate (`build.rs`) and
//! also add this crate to your `Cargo.toml` via:
//!
//! ```toml
//! [build-dependencies]
//! cc = "1.0"
//! ```
//!
//! Next up, you'll want to write a build script like so:
//!
//! ```rust,no_run
//! // build.rs
//! cc::Build::new()
//!     .file("foo.c")
//!     .file("bar.c")
//!     .compile("foo");
//! ```
//!
//! And that's it! Running `cargo build` should take care of the rest and your Rust
//! application will now have the C files `foo.c` and `bar.c` compiled into a file
//! named `libfoo.a`. If the C files contain
//!
//! ```c
//! void foo_function(void) { ... }
//! ```
//!
//! and
//!
//! ```c
//! int32_t bar_function(int32_t x) { ... }
//! ```
//!
//! you can call them from Rust by declaring them in
//! your Rust code like so:
//!
//! ```rust,no_run
//! extern "C" {
//!     fn foo_function();
//!     fn bar_function(x: i32) -> i32;
//! }
//!
//! pub fn call() {
//!     unsafe {
//!         foo_function();
//!         bar_function(42);
//!     }
//! }
//!
//! fn main() {
//!     call();
//! }
//! ```
//!
//! See [the Rustonomicon](https://doc.rust-lang.org/nomicon/ffi.html) for more details.
//!
//! # External configuration via environment variables
//!
//! To control the programs and flags used for building, the builder can set a
//! number of different environment variables.
//!
//! * `CFLAGS` - a series of space separated flags passed to compilers. Note that
//!   individual flags cannot currently contain spaces, so doing
//!   something like: `-L=foo\ bar` is not possible.
//! * `CC` - the actual C compiler used. Note that this supports passing a known
//!   wrapper via `sccache cc`. This compiler must understand the `-c` flag. For
//!   certain `TARGET`s, it also is assumed to know about other flags (most
//!   common is `-fPIC`).
//!   ccache, distcc, sccache, icecc, cachepot, buildcache and kache are supported,
//!   for sccache, simply set `CC` to `sccache cc`.
//!   For other custom `CC` wrapper, just set `CC_KNOWN_WRAPPER_CUSTOM`
//!   to the custom wrapper used in `CC`.
//! * `AR` - the `ar` (archiver) executable to use to build the static library.
//! * `CRATE_CC_NO_DEFAULTS` - the default compiler flags may cause conflicts in
//!   some cross compiling scenarios. Setting this variable
//!   will disable the generation of default compiler
//!   flags.
//! * `CC_ENABLE_DEBUG_OUTPUT` - if set, compiler command invocations and exit codes will
//!   be logged to stdout. This is useful for debugging build script issues, but can be
//!   overly verbose for normal use.
//! * `CC_SHELL_ESCAPED_FLAGS` - if set, `*FLAGS` will be parsed as if they were shell
//!   arguments (similar to `make` and `cmake`) rather than splitting them on each space.
//!   For example, with `CFLAGS='a "b c"'`, the compiler will be invoked with 2 arguments -
//!   `a` and `b c` - rather than 3: `a`, `"b` and `c"`.
//! * `CXX...` - see [C++ Support](#c-support).
//! * `CC_FORCE_DISABLE` - If set, `cc` will never run any [`Command`]s, and methods that
//!   would return an [`Error`]. This is intended for use by third-party build systems
//!   which want to be absolutely sure that they are in control of building all
//!   dependencies. Note that operations that return [`Tool`]s such as
//!   [`Build::get_compiler`] may produce less accurate results as in some cases `cc` runs
//!   commands in order to locate compilers. Additionally, this does nothing to prevent
//!   users from running [`Tool::to_command`] and executing the [`Command`] themselves.
//! * `RUSTC_WRAPPER` - If set, the specified command will be prefixed to the compiler
//!   command. This is useful for projects that want to use
//!   [sccache](https://github.com/mozilla/sccache),
//!   [buildcache](https://gitlab.com/bits-n-bites/buildcache),
//!   [cachepot](https://github.com/paritytech/cachepot), or
//!   [kache](https://github.com/kunobi-ninja/kache).
//!
//! Furthermore, projects using this crate may specify custom environment variables
//! to be inspected, for example via the `Build::try_flags_from_environment`
//! function. Consult the project’s own documentation or its use of the `cc` crate
//! for any additional variables it may use.
//!
//! Each of these variables can also be supplied with certain prefixes and suffixes,
//! in the following prioritized order:
//!
//!   1. `<var>_<target>` - for example, `CC_x86_64-unknown-lin
```