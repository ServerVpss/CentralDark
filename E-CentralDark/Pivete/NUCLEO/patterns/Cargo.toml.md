# PADRAO - Cargo.toml.orig
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-1.0.4\Cargo.toml.orig
**SHA:** fac1b8127c23c242
**Timestamp:** 2026-08-28T02:37:39.531358
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- todo = "warn"

### Ouro Bruto (primeiros 5000 chars)
```
[workspace]
resolver = "2"
members = ["fuzz"]

[workspace.package]
repository = "https://github.com/winnow-rs/winnow"
license = "MIT"
edition = "2021"
rust-version = "1.65.0"  # MSRV
include = [
  "build.rs",
  "src/**/*",
  "Cargo.toml",
  "Cargo.lock",
  "LICENSE*",
  "README.md",
  "examples/**/*"
]

[workspace.lints.rust]
rust_2018_idioms = { level = "warn", priority = -1 }
unnameable_types = "warn"
unreachable_pub = "warn"
unsafe_op_in_unsafe_fn = "warn"
unused_lifetimes = "warn"
unused_macro_rules = "warn"

[workspace.lints.clippy]
bool_assert_comparison = "allow"
branches_sharing_code = "allow"
byte_char_slices = "allow"  # want explicit arrays
checked_conversions = "warn"
collapsible_else_if = "allow"
create_dir = "warn"
dbg_macro = "warn"
debug_assert_with_mut_call = "warn"
doc_markdown = "warn"
empty_enums = "warn"
enum_glob_use = "warn"
expl_impl_clone_on_copy = "warn"
explicit_deref_methods = "warn"
explicit_into_iter_loop = "warn"
fallible_impl_from = "warn"
filter_map_next = "warn"
flat_map_option = "warn"
float_cmp_const = "warn"
fn_params_excessive_bools = "warn"
from_iter_instead_of_collect = "warn"
if_same_then_else = "allow"
implicit_clone = "warn"
imprecise_flops = "warn"
inconsistent_struct_constructor = "warn"
inefficient_to_string = "warn"
infinite_loop = "warn"
invalid_upcast_comparisons = "warn"
large_digit_groups = "warn"
large_stack_arrays = "warn"
large_types_passed_by_value = "warn"
let_and_return = "allow"  # sometimes good to name what you are returning
linkedlist = "warn"
lossy_float_literal = "warn"
macro_use_imports = "warn"
mem_forget = "warn"
mutex_integer = "warn"
needless_continue = "allow"
needless_for_each = "warn"
negative_feature_names = "warn"
path_buf_push_overwrite = "warn"
ptr_as_ptr = "warn"
rc_mutex = "warn"
redundant_feature_names = "warn"
ref_option_ref = "warn"
rest_pat_in_fully_bound_structs = "warn"
result_large_err = "allow"
same_functions_in_if_condition = "warn"
# self_named_module_files = "warn"  # false-positives
semicolon_if_nothing_returned = "warn"
str_to_string = "warn"
string_add = "warn"
string_add_assign = "warn"
string_lit_as_bytes = "warn"
todo = "warn"
trait_duplication_in_bounds = "warn"
uninlined_format_args = "warn"
verbose_file_reads = "warn"
wildcard_imports = "warn"
zero_sized_map_values = "warn"

[profile.dev]
panic = "abort"

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
# debug = "line-tables-only"  # requires Cargo 1.71

[package]
name = "winnow"
version = "1.0.4"
description = "A byte-oriented, zero-copy, parser combinators library"
categories = ["parsing"]
keywords = ["parser", "parser-combinators", "parsing", "streaming", "bit"]
autoexamples = false
repository.workspace = true
license.workspace = true
edition.workspace = true
rust-version.workspace = true
include.workspace = true

[package.metadata.docs.rs]
features = ["unstable-doc"]
rustdoc-args = ["--generate-link-to-definition"]

[package.metadata.release]
pre-release-replacements = [
  {file="CHANGELOG.md", search="Unreleased", replace="{{version}}", min=1},
  {file="CHANGELOG.md", search="\\.\\.\\.HEAD", replace="...{{tag_name}}", exactly=1},
  {file="CHANGELOG.md", search="ReleaseDate", replace="{{date}}", min=1},
  {file="CHANGELOG.md", search="<!-- next-header -->", replace="<!-- next-header -->\n## [Unreleased] - ReleaseDate\n", exactly=1},
  {file="CHANGELOG.md", search="<!-- next-url -->", replace="<!-- next-url -->\n[Unreleased]: https://github.com/winnow-rs/winnow/compare/{{tag_name}}...HEAD", exactly=1},
  {file="src/lib.rs", search="blob/v.+\\..+\\..+/CHANGELOG.md", replace="blob/v{{version}}/CHANGELOG.md", exactly=1},
]

[features]
default = ["std", "ascii", "binary"]
alloc = []
parser = []
ascii = ["parser"]
binary = ["parser"]
std = ["alloc", "memchr?/std"]
simd = ["dep:memchr"]
debug = ["std", "dep:anstream", "dep:anstyle", "dep:is_terminal_polyfill", "dep:terminal_size"]
unstable-recover = ["parser"]

unstable-doc = ["alloc", "std", "ascii", "binary", "simd", "unstable-recover"]

[dependencies]
anstream = { version = "0.6.15", optional = true }
anstyle = { version = "1.0.8", optional = true }
is_terminal_polyfill = { version = "1.48.1", optional = true }
memchr = { version = "2.7", optional = true, default-features = false }
terminal_size = { version = "0.4.3", optional = true }

[dev-dependencies]
proptest = "1.6.0"
criterion = "0.5.1"
lexopt = "0.3.1"
term-transcript = "0.2.0"
snapbox = { version = "0.6.21", features = ["examples"] }
circular = "0.3.0"
rustc-hash = "2.1.1"
automod = "1.0.15"
annotate-snippets = "0.11.4"
anyhow = "1.0.100"

[profile.bench]
debug = true
lto = true
codegen-units = 1

[[example]]
name = "arithmetic"
test = true
required-features = ["alloc", "ascii"]

[[example]]
name = "c_expression"
required-features = ["std", "ascii"]

[[example]]
name = "css"
test = true
required-features = ["alloc", "parser"]

[[example]]
name = "custom_error"
test = true
required-features = ["alloc", "parser"]

[[example]]
name = "http"

```