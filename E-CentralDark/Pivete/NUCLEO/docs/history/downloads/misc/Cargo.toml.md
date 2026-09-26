# OUTRO - Cargo.toml.orig
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\crossbeam-utils-0.8.22\Cargo.toml.orig
**SHA:** 1b3ac11ed95dd199
**Timestamp:** 2026-08-28T02:33:33.858085
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- # TODO: remove in the next major version.

### Ouro Bruto (primeiros 5000 chars)
```
[package]
name = "crossbeam-utils"
# When publishing a new version:
# - Update CHANGELOG.md
# - Update README.md (when increasing major or minor version)
# - Run './tools/publish.sh crossbeam-utils <version>'
version = "0.8.22"
edition = "2021"
rust-version = "1.60"
license = "MIT OR Apache-2.0"
repository = "https://github.com/crossbeam-rs/crossbeam"
homepage = "https://github.com/crossbeam-rs/crossbeam/tree/master/crossbeam-utils"
description = "Utilities for concurrent programming"
keywords = ["scoped", "thread", "atomic", "cache"]
categories = ["algorithms", "concurrency", "data-structures", "no-std"]

[features]
default = ["std"]

# Enable to use APIs that require `std`.
# This is enabled by default.
std = []

# These features are no longer used.
# TODO: remove in the next major version.
# Enable to use of unstable functionality.
# This is disabled by default and requires recent nightly compiler.
#
# NOTE: This feature is outside of the normal semver guarantees and minor or
# patch versions of crossbeam may make breaking changes to them at any time.
nightly = []

[dependencies]

# Enable the use of loom for concurrency testing.
#
# NOTE: This feature is outside of the normal semver guarantees and minor or
# patch versions of crossbeam may make breaking changes to them at any time.
[target.'cfg(crossbeam_loom)'.dependencies]
loom = { version = "0.7.1", optional = true }

[dev-dependencies]
rand = "0.8"
rustversion = "1"

[lints]
workspace = true

```

---

# OUTRO - Cargo.toml.orig
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-1.13.1\Cargo.toml.orig
**SHA:** 837906b45d826e12
**Timestamp:** 2026-08-28T02:35:04.316635
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- # To test this locally, run:

### Padroes
- pattern = []

### Ouro Bruto (primeiros 5000 chars)
```
[package]
name = "regex"
version = "1.13.1"  #:version
authors = ["The Rust Project Developers", "Andrew Gallant <jamslam@gmail.com>"]
license = "MIT OR Apache-2.0"
readme = "README.md"
repository = "https://github.com/rust-lang/regex"
documentation = "https://docs.rs/regex"
homepage = "https://github.com/rust-lang/regex"
description = """
An implementation of regular expressions for Rust. This implementation uses
finite automata and guarantees linear time matching on all inputs.
"""
categories = ["text-processing"]
autotests = false
include.workspace = true
edition = "2021"
rust-version = "1.65"

[workspace]
members = [
  "regex-automata",
  "regex-capi",
  "regex-cli",
  "regex-lite",
  "regex-syntax",
  "regex-test",
]

[workspace.package]
include = [
  "/CHANGELOG.md",
  "/Cargo.toml",
  "/LICENSE-MIT",
  "/LICENSE-APACHE",
  "/README.md",
  "/UNICODE.md",
  "bench/README.md",
  "src/**/*.rs",
  "testdata/**.toml",
  "tests/**/*.rs",
  "bench/**/*.rs",
  "benches/**/*.rs",
  "LICENSE-UNICODE",
  "!/tests/fuzz/mod.rs",
]

# Features are documented in the "Crate features" section of the crate docs:
# https://docs.rs/regex/*/#crate-features
[features]
default = ["std", "perf", "unicode", "regex-syntax/default"]

# ECOSYSTEM FEATURES

# The 'std' feature permits the regex crate to use the standard library. This
# is intended to support future use cases where the regex crate may be able
# to compile without std, and instead just rely on 'core' and 'alloc' (for
# example). Currently, this isn't supported, and removing the 'std' feature
# will prevent regex from compiling.
std = [
  "aho-corasick?/std",
  "memchr?/std",
  "regex-automata/std",
  "regex-syntax/std",
]
# This feature enables the 'log' crate to emit messages. This is usually
# only useful for folks working on the regex crate itself, but can be useful
# if you're trying hard to do some performance hacking on regex patterns
# themselves. Note that you'll need to pair this with a crate like 'env_logger'
# to actually emit the log messages somewhere.
logging = [
  "aho-corasick?/logging",
  "memchr?/logging",
  "regex-automata/logging",
]
# The 'use_std' feature is DEPRECATED. It will be removed in regex 2. Until
# then, it is an alias for the 'std' feature.
use_std = ["std"]


# PERFORMANCE FEATURES

# Enables all default performance features. Note that this specifically does
# not include perf-dfa-full, because it leads to higher compile times and
# bigger binaries, and the runtime performance improvement is not obviously
# worth it.
perf = [
  "perf-cache",
  "perf-dfa",
  "perf-onepass",
  "perf-backtrack",
  "perf-inline",
  "perf-literal",
]
# Enables use of a lazy DFA when possible.
perf-dfa = ["regex-automata/hybrid"]
# Enables use of a fully compiled DFA when possible.
perf-dfa-full = ["regex-automata/dfa-build", "regex-automata/dfa-search"]
# Enables use of the one-pass regex matcher, which speeds up capture searches
# even beyond the backtracker.
perf-onepass = ["regex-automata/dfa-onepass"]
# Enables use of a bounded backtracker, which speeds up capture searches.
perf-backtrack = ["regex-automata/nfa-backtrack"]
# Enables aggressive use of inlining.
perf-inline = ["regex-automata/perf-inline"]
# Enables literal optimizations.
perf-literal = [
  "dep:aho-corasick",
  "dep:memchr",
  "regex-automata/perf-literal",
]
# Enables fast caching. (If disabled, caching is still used, but is slower.)
# Currently, this feature has no effect. It used to remove the thread_local
# dependency and use a slower internal cache, but now the default cache has
# been improved and thread_local is no longer a dependency at all.
perf-cache = []


# UNICODE DATA FEATURES

# Enables all Unicode features. This expands if new Unicode features are added.
unicode = [
  "unicode-age",
  "unicode-bool",
  "unicode-case",
  "unicode-gencat",
  "unicode-perl",
  "unicode-script",
  "unicode-segment",
  "regex-automata/unicode",
  "regex-syntax/unicode",
]
# Enables use of the `Age` property, e.g., `\p{Age:3.0}`.
unicode-age = [
  "regex-automata/unicode-age",
  "regex-syntax/unicode-age",
]
# Enables use of a smattering of boolean properties, e.g., `\p{Emoji}`.
unicode-bool = [
  "regex-automata/unicode-bool",
  "regex-syntax/unicode-bool",
]
# Enables Unicode-aware case insensitive matching, e.g., `(?i)β`.
unicode-case = [
  "regex-automata/unicode-case",
  "regex-syntax/unicode-case",
]
# Enables Unicode general categories, e.g., `\p{Letter}` or `\pL`.
unicode-gencat = [
  "regex-automata/unicode-gencat",
  "regex-syntax/unicode-gencat",
]
# Enables Unicode-aware Perl classes corresponding to `\w`, `\s` and `\d`.
unicode-perl = [
  "regex-automata/unicode-perl",
  "regex-automata/unicode-word-boundary",
  "regex-syntax/unicode-perl",
]
# Enables Unicode scripts and script extensions, e.g., `\p{Greek}`.
unicode-script = [
  "regex-automata/unicode-script",
  "regex-syntax/unicode-script",
]
# Enables Unicode segmentation properties, e.g., `\p{gcb=Extend}`.
unicode-segment
```

---

# OUTRO - Cargo.toml.orig
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-automata-0.4.18\Cargo.toml.orig
**SHA:** 024ca34ebb2bd31f
**Timestamp:** 2026-08-28T02:35:05.334604
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- # To test this locally, run:

### Ouro Bruto (primeiros 5000 chars)
```
[package]
name = "regex-automata"
version = "0.4.18"  #:version
authors = ["The Rust Project Developers", "Andrew Gallant <jamslam@gmail.com>"]
description = "Automata construction and matching using regular expressions."
documentation = "https://docs.rs/regex-automata"
homepage = "https://github.com/rust-lang/regex/tree/master/regex-automata"
repository = "https://github.com/rust-lang/regex"
readme = "README.md"
keywords = ["regex", "dfa", "automata", "automaton", "nfa"]
license = "MIT OR Apache-2.0"
categories = ["text-processing"]
edition = "2021"
autoexamples = false
rust-version = "1.65"
include.workspace = true

[lib]
bench = false

# This crate has many many many features. See the crate docs for a description
# of each and when you might want to use them.
[features]
default = ["std", "syntax", "perf", "unicode", "meta", "nfa", "dfa", "hybrid"]
std = ["regex-syntax?/std", "memchr?/std", "aho-corasick?/std", "alloc"]
alloc = []
logging = ["dep:log", "aho-corasick?/logging", "memchr?/logging"]

syntax = ["dep:regex-syntax", "alloc"]

meta = ["syntax", "nfa-pikevm"]

nfa = ["nfa-thompson", "nfa-pikevm", "nfa-backtrack"]
nfa-thompson = ["alloc"]
nfa-pikevm = ["nfa-thompson"]
nfa-backtrack = ["nfa-thompson"]

dfa = ["dfa-build", "dfa-search", "dfa-onepass"]
dfa-build = ["nfa-thompson", "dfa-search"]
dfa-search = []
dfa-onepass = ["nfa-thompson"]

hybrid = ["alloc", "nfa-thompson"]

perf = ["perf-inline", "perf-literal"]
perf-inline = []
perf-literal = ["perf-literal-substring", "perf-literal-multisubstring"]
perf-literal-substring = ["aho-corasick?/perf-literal", "dep:memchr"]
perf-literal-multisubstring = ["dep:aho-corasick"]

# Enables all Unicode features. This expands if new Unicode features are added.
unicode = [
  "unicode-age",
  "unicode-bool",
  "unicode-case",
  "unicode-gencat",
  "unicode-perl",
  "unicode-script",
  "unicode-segment",
  "unicode-word-boundary",
  "regex-syntax?/unicode",
]
# Enables use of the `Age` property, e.g., `\p{Age:3.0}`.
unicode-age = ["regex-syntax?/unicode-age"]
# Enables use of a smattering of boolean properties, e.g., `\p{Emoji}`.
unicode-bool = ["regex-syntax?/unicode-bool"]
# Enables Unicode-aware case insensitive matching, e.g., `(?i)β`.
unicode-case = ["regex-syntax?/unicode-case"]
# Enables Unicode general categories, e.g., `\p{Letter}` or `\pL`.
unicode-gencat = ["regex-syntax?/unicode-gencat"]
# Enables Unicode-aware Perl classes corresponding to `\w`, `\s` and `\d`.
unicode-perl = ["regex-syntax?/unicode-perl"]
# Enables Unicode scripts and script extensions, e.g., `\p{Greek}`.
unicode-script = ["regex-syntax?/unicode-script"]
# Enables Unicode segmentation properties, e.g., `\p{gcb=Extend}`.
unicode-segment = ["regex-syntax?/unicode-segment"]
# Enables Unicode word boundary support. If this is enabled with unicode-perl,
# then data tables from regex-syntax are used. Otherwise, a new data table
# inside regex-automata will be included.
unicode-word-boundary = []

# These are strictly internal features that may be removed or changed in
# non-compatible ways.
internal-instrument = ["internal-instrument-pikevm"]
internal-instrument-pikevm = ["logging", "std"]

[dependencies]
aho-corasick = { version = "1.0.0", optional = true, default-features = false }
log = { version = "0.4.14", optional = true }
memchr = { version = "2.6.0", optional = true, default-features = false }
regex-syntax = { path = "../regex-syntax", version = "0.8.5", optional = true, default-features = false }

[dev-dependencies]
anyhow = "1.0.69"
bstr = { version = "1.3.0", default-features = false, features = ["std"] }
doc-comment = "0.3.3"
quickcheck = { version = "1.0.3", default-features = false }
regex-test = { path = "../regex-test", version = "0.1.0" }

[dev-dependencies.env_logger]
version = "0.9.3"
default-features = false
features = ["atty", "humantime", "termcolor"]

# We put these tests here because they are written primarily against the
# regex-automata API, and in particular use regex-automata features for
# conditional compilation. If we moved these up as tests on 'regex' proper,
# then we'd need to duplicate regex-automata's complex features on 'regex' too,
# which I really do not want to do.
[[test]]
path = "tests/lib.rs"
name = "integration"

[package.metadata.docs.rs]
# We want to document all features.
all-features = true
# Since this crate's feature setup is pretty complicated, it is worth opting
# into a nightly unstable option to show the features that need to be enabled
# for public API items. To do that, we set 'docsrs_regex', and when that's
# enabled, we enable the 'doc_cfg' feature.
#
# To test this locally, run:
#
#     RUSTDOCFLAGS="--cfg docsrs_regex" cargo +nightly doc --all-features
#
# Note that we use `docsrs_regex` instead of the more standard `docsrs` because
# other crates use that same `cfg` knob. And since we are enabling a nightly
# feature, they sometimes break. By using our "own" `cfg` knob, we are closer
# to being masters of our own destiny.
rustdoc
```

---

# OUTRO - Cargo.toml.orig
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\regex-syntax-0.8.11\Cargo.toml.orig
**SHA:** fdfdadd590cb4121
**Timestamp:** 2026-08-28T02:35:07.621291
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- # To test this locally, run:

### Ouro Bruto (primeiros 5000 chars)
```
[package]
name = "regex-syntax"
version = "0.8.11"  #:version
authors = ["The Rust Project Developers", "Andrew Gallant <jamslam@gmail.com>"]
license = "MIT OR Apache-2.0"
homepage = "https://github.com/rust-lang/regex/tree/master/regex-syntax"
repository = "https://github.com/rust-lang/regex"
documentation = "https://docs.rs/regex-syntax"
description = "A regular expression parser."
workspace = ".."
edition = "2021"
rust-version = "1.65"
include.workspace = true

# Features are documented in the "Crate features" section of the crate docs:
# https://docs.rs/regex-syntax/*/#crate-features
[features]
default = ["std", "unicode"]
std = []
arbitrary = ["dep:arbitrary"]

unicode = [
  "unicode-age",
  "unicode-bool",
  "unicode-case",
  "unicode-gencat",
  "unicode-perl",
  "unicode-script",
  "unicode-segment",
]
unicode-age = []
unicode-bool = []
unicode-case = []
unicode-gencat = []
unicode-perl = []
unicode-script = []
unicode-segment = []

[dependencies]
arbitrary = { version = "1.3.0", features = ["derive"], optional = true }

[package.metadata.docs.rs]
# We want to document all features.
all-features = true
# Since this crate's feature setup is pretty complicated, it is worth opting
# into a nightly unstable option to show the features that need to be enabled
# for public API items. To do that, we set 'docsrs_regex', and when that's
# enabled, we enable the 'doc_cfg' feature.
#
# To test this locally, run:
#
#     RUSTDOCFLAGS="--cfg docsrs_regex" cargo +nightly doc --all-features
#
# Note that we use `docsrs_regex` instead of the more standard `docsrs` because
# other crates use that same `cfg` knob. And since we are enabling a nightly
# feature, they sometimes break. By using our "own" `cfg` knob, we are closer
# to being masters of our own destiny.
rustdoc-args = ["--cfg", "docsrs_regex"]

# This squashes the (AFAIK) erroneous warning that `docsrs_regex` is not a
# valid `cfg` knob.
[lints.rust]
unexpected_cfgs = { level = "allow", check-cfg = ['cfg(docsrs_regex)'] }

```

---

# OUTRO - Cargo.toml.orig
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-2.11.5\Cargo.toml.orig
**SHA:** 4462ab255c9c9f8f
**Timestamp:** 2026-08-28T02:35:52.276946
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- # TODO: Remove in v3 - wry does not have this feature anymore
- # TODO: Remove these flags in v3 and/or enable them by default behind a mobile flag https://github.com/tauri-apps/tauri/issues/12384

### Ouro Bruto (primeiros 5000 chars)
```
[package]
name = "tauri"
version = "2.11.5"
description = "Make tiny, secure apps for all desktop platforms with Tauri"
exclude = ["/test", "/.scripts", "CHANGELOG.md", "/target"]
readme = "README.md"
links = "Tauri"
authors.workspace = true
homepage.workspace = true
repository.workspace = true
categories.workspace = true
license.workspace = true
edition.workspace = true
rust-version.workspace = true

[package.metadata.docs.rs]
no-default-features = true
features = [
  "wry",
  "unstable",
  "custom-protocol",
  "tray-icon",
  "devtools",
  "image-png",
  "protocol-asset",
  "test",
  "specta",
  "dynamic-acl",
  "isolation",
]
default-target = "x86_64-unknown-linux-gnu"
targets = [
  "x86_64-pc-windows-msvc",
  "x86_64-unknown-linux-gnu",
  "x86_64-apple-darwin",
  "x86_64-linux-android",
  "x86_64-apple-ios",
]

[package.metadata.cargo-udeps.ignore]
normal = ["reqwest"]
build = ["tauri-build"]
development = ["quickcheck_macros"]

[dependencies]
serde_json = { version = "1", features = ["raw_value"] }
serde = { version = "1", features = ["derive", "rc"] }
tokio = { version = "1", features = [
  "rt",
  "rt-multi-thread",
  "sync",
  "fs",
  "io-util",
] }
uuid = { version = "1", features = ["v4"], optional = true }
url = "2"
anyhow = "1"
thiserror = "2"
tauri-runtime = { version = "2.11.3", path = "../tauri-runtime" }
tauri-macros = { version = "2.6.3", path = "../tauri-macros" }
tauri-utils = { version = "2.9.3", features = [
  "resources",
], path = "../tauri-utils" }
tauri-runtime-wry = { version = "2.11.4", path = "../tauri-runtime-wry", default-features = false, optional = true }
getrandom = "0.3"
serde_repr = "0.1"
http = "1"
dirs = "6"
percent-encoding = "2"
raw-window-handle = { version = "0.6", features = ["std"] }
glob = "0.3"
mime = "0.3"
data-url = { version = "0.3", optional = true }
serialize-to-javascript = "0.1.2"
image = { version = "0.25", default-features = false, optional = true }
http-range = { version = "0.1", optional = true }
tracing = { version = "0.1", optional = true }
heck = "0.5"
log = "0.4.21"
dunce = "1"
specta = { version = "^2.0.0-rc.16", optional = true, default-features = false, features = [
  "function",
  "derive",
] }
# WARNING: cookie::Cookie is re-exported so bumping this is a breaking change, documented to be done as a minor bump
cookie = "0.18"

# desktop
[target.'cfg(any(target_os = "linux", target_os = "dragonfly", target_os = "freebsd", target_os = "openbsd", target_os = "netbsd", target_os = "windows", target_os = "macos"))'.dependencies]
muda = { version = "0.19", default-features = false, features = [
  "serde",
  "gtk",
] }
tray-icon = { version = "0.24", default-features = false, features = [
  "serde",
  "gtk",
], optional = true }

# linux
[target.'cfg(any(target_os = "linux", target_os = "dragonfly", target_os = "freebsd", target_os = "openbsd", target_os = "netbsd"))'.dependencies]
gtk = { version = "0.18", features = ["v3_24"] }
webkit2gtk = { version = "2", features = ["v2_40"], optional = true }

# darwin
[target.'cfg(target_vendor = "apple")'.dependencies]
objc2 = "0.6"

# macOS
[target.'cfg(target_os = "macos")'.dependencies]
embed_plist = "1.2"
plist = "1"
objc2-foundation = { version = "0.3", default-features = false, features = [
  "std",
  "NSData",
  "NSThread",
] }
objc2-app-kit = { version = "0.3", default-features = false, features = [
  "std",
  "NSApplication",
  "NSColor",
  "NSResponder",
  "NSView",
  "NSWindow",
  "NSImage",
] }
objc2-web-kit = { version = "0.3", default-features = false, features = [
  "objc2-app-kit",
  "WKWebView",
  "WKWebViewConfiguration",
  "WKUserContentController",
] }
window-vibrancy = "0.6"

# windows
[target."cfg(windows)".dependencies]
webview2-com = { version = "0.38", optional = true }
window-vibrancy = "0.6"
windows = { version = "0.61", features = [
  "Win32_Foundation",
  "Win32_UI",
  "Win32_UI_WindowsAndMessaging",
] }

# mobile
[target.'cfg(any(target_os = "android", all(target_vendor = "apple", not(target_os = "macos"))))'.dependencies]
bytes = { version = "1", features = ["serde"] }
reqwest = { version = "0.13", default-features = false, features = [
  "json",
  "stream",
] }
rustls = { version = "0.23", default-features = false, features = [
  "ring",
], optional = true }

# android
[target.'cfg(target_os = "android")'.dependencies]
jni = "0.21"

# UIKit, i.e. iOS/tvOS/watchOS/visionOS
[target.'cfg(all(target_vendor = "apple", not(target_os = "macos")))'.dependencies]
libc = "0.2"
swift-rs = "1"
objc2-ui-kit = { version = "0.3.0", default-features = false, features = [
  "UIApplication",
  "UIResponder",
  "UIView",
] }

[build-dependencies]
glob = "0.3"
heck = "0.5"
tauri-build = { path = "../tauri-build/", default-features = false, version = "2.6.3" }
tauri-utils = { path = "../tauri-utils/", version = "2.9.3", features = [
  "build-2",
] }

[dev-dependencies]
proptest = "1.6.0"
quickcheck = "1.0.3"
quickcheck_macros = "1.0.0"
serde = { version = "1", features = ["derive"] }
serde_json = "1"

```

---

# OUTRO - Cargo.toml.orig
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-runtime-wry-2.11.4\Cargo.toml.orig
**SHA:** 90e7ab4b965cdd1b
**Timestamp:** 2026-08-28T02:35:59.983411
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- # TODO: Remove in v3 - wry does not have this feature anymore

### Ouro Bruto (primeiros 5000 chars)
```
[package]
name = "tauri-runtime-wry"
version = "2.11.4"
description = "Wry bindings to the Tauri runtime"
exclude = ["CHANGELOG.md", "/target"]
readme = "README.md"
authors.workspace = true
homepage.workspace = true
repository.workspace = true
categories.workspace = true
license.workspace = true
edition.workspace = true
rust-version.workspace = true

[dependencies]
wry = { version = "0.55.0", default-features = false, features = [
  "protocol",
  "os-webview",
  "linux-body",
] }
tao = { version = "0.35.0", default-features = false, features = ["rwh_06"] }
tauri-runtime = { version = "2.11.3", path = "../tauri-runtime" }
tauri-utils = { version = "2.9.3", path = "../tauri-utils" }
raw-window-handle = "0.6"
http = "1"
url = "2"
tracing = { version = "0.1", optional = true }
log = "0.4.21"

[target."cfg(windows)".dependencies]
webview2-com = "0.38"
softbuffer = { version = "0.4", default-features = false }
once_cell = "1.20"

[target."cfg(windows)".dependencies.windows]
version = "0.61"
features = ["Win32_Foundation", "Win32_Graphics_Dwm"]

[target."cfg(any(target_os = \"linux\", target_os = \"dragonfly\", target_os = \"freebsd\", target_os = \"openbsd\", target_os = \"netbsd\"))".dependencies]
gtk = { version = "0.18", features = ["v3_24"] }
webkit2gtk = { version = "=2.0", features = ["v2_40"] }
percent-encoding = "2"

[target.'cfg(target_vendor = "apple")'.dependencies]
objc2 = "0.6"

[target.'cfg(target_os = "macos")'.dependencies]
objc2-app-kit = { version = "0.3", default-features = false, features = [
  "block2",
  "NSApplication",
  "NSResponder",
  "NSView",
  "NSWindow",
  "NSScreen",
  "NSGraphics",
] }

[target."cfg(target_os = \"android\")".dependencies]
jni = "0.21"

[features]
default = ["x11", "dbus"]
devtools = ["wry/devtools", "tauri-runtime/devtools"]
x11 = ["tao/x11", "wry/x11"]
macos-private-api = [
  "wry/fullscreen",
  "wry/transparent",
  "tauri-runtime/macos-private-api",
]
# TODO: Remove in v3 - wry does not have this feature anymore
objc-exception = []
tracing = ["dep:tracing", "wry/tracing"]
macos-proxy = ["wry/mac-proxy"]
unstable = []
common-controls-v6 = []
dbus = ["tao/dbus"]

```

---

# OUTRO - Cargo.toml.orig
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\tauri-utils-2.9.3\Cargo.toml.orig
**SHA:** 9594e70b3a95e327
**Timestamp:** 2026-08-28T02:36:00.387849
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- urlpattern = "0.3"

### Ouro Bruto (primeiros 5000 chars)
```
[package]
name = "tauri-utils"
version = "2.9.3"
description = "Utilities for Tauri"
exclude = ["CHANGELOG.md", "/target"]
readme = "README.md"
authors.workspace = true
homepage.workspace = true
repository.workspace = true
categories.workspace = true
license.workspace = true
edition.workspace = true
rust-version.workspace = true

[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"
anyhow = "1"
thiserror = "2"
phf = { version = "0.13", features = ["macros"] }
brotli = { version = "8", optional = true, default-features = false, features = [
  "std",
] }
url = { version = "2", features = ["serde"] }
html5ever = { version = "0.29", optional = true }
kuchiki = { package = "kuchikiki", version = "0.8.8-speedreader", optional = true }
dom_query = { version = "0.27", optional = true, default-features = false }
proc-macro2 = { version = "1", optional = true }
quote = { version = "1", optional = true }
# Our code requires at least 0.8.21 so don't change this to 0.8
schemars = { version = "0.8.21", features = ["url", "uuid1"], optional = true }
serde_with = "3"
aes-gcm = { version = "0.10", optional = true }
getrandom = { version = "0.3", optional = true, features = ["std"] }
serialize-to-javascript = { version = "0.1.2", optional = true }
ctor = { version = "0.8", default-features = false, features = [
  "std",
  "proc_macro",
] }
json5 = { version = "0.4", optional = true }
# Part of public api in error type
toml = { version = ">=0.9, <=1", features = ["parse"] }
json-patch = "3.0"
# Our code requires at least 0.3.1
glob = "0.3.1"
urlpattern = "0.3"
regex = "1"
walkdir = { version = "2", optional = true }
memchr = "2"
semver = "1"
infer = "0.19"
dunce = "1"
log = "0.4.21"
cargo_metadata = { version = "0.19", optional = true }
serde-untagged = "0.1"
uuid = { version = "1", features = ["serde"] }
http = "1"
plist = "1"

[target."cfg(target_os = \"macos\")".dependencies]
swift-rs = { version = "1", optional = true, features = ["build"] }

[dev-dependencies]
getrandom = { version = "0.3", features = ["std"] }
serial_test = "3"
tauri = { path = "../tauri" }
tempfile = "3.15.0"

[features]
build = [
  "proc-macro2",
  "quote",
  "cargo_metadata",
  "schema",
  "swift-rs",
  "html-manipulation",
]
# Same as `build` but uses `html-manipulation-2` to avoid the `kuchikiki` dependency.
build-2 = [
  "proc-macro2",
  "quote",
  "cargo_metadata",
  "schema",
  "swift-rs",
  "html-manipulation-2",
]
compression = ["brotli"]
schema = ["schemars"]
isolation = ["aes-gcm", "getrandom", "serialize-to-javascript"]
process-relaunch-dangerous-allow-symlink-macos = []
config-json5 = ["json5"]
config-toml = []
resources = ["walkdir"]
html-manipulation = ["dep:html5ever", "dep:kuchiki"]
html-manipulation-2 = ["dep:dom_query"]

```

---

# OUTRO - Cargo.toml.orig
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\unic-ucd-ident-0.9.0\Cargo.toml.orig
**SHA:** 9c1c7cfc028e70f5
**Timestamp:** 2026-08-28T02:36:32.531471
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern = []

### Ouro Bruto (primeiros 5000 chars)
```
[package]
name = "unic-ucd-ident"
version = "0.9.0"
edition = "2018"
authors = ["The UNIC Project Developers"]
repository = "https://github.com/open-i18n/rust-unic/"
license = "MIT/Apache-2.0"
description = "UNIC — Unicode Character Database — Identifier Properties"
keywords = ["text", "unicode", "character-property"]
categories = ["text-processing", "parsing"]

exclude = [
    "tests/lexical_class_tests",
]

[features]
default = [ "xid" ]
pattern = []
xid = []
id = []

[dependencies]
unic-char-property = { path = "../../char/property/", version = "0.9.0" }
unic-char-range = { path = "../../char/range", version = "0.9.0" }
unic-ucd-version = { path = "../version/", version = "0.9.0" }

[dev-dependencies]
unic-ucd-category = { path = "../category/", version = "0.9.0" }
regex = "0.2"
matches = "0.1"

[badges]
maintenance = { status = "actively-developed" }
is-it-maintained-issue-resolution = { repository = "open-i18n/rust-unic" }
is-it-maintained-open-issues = { repository = "open-i18n/rust-unic" }
appveyor = { repository = "open-i18n/rust-unic", branch = "master", service = "github" }
travis-ci = { repository = "open-i18n/rust-unic", branch = "master" }

```