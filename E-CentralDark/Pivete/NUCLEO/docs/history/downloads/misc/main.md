# OUTRO - main.css
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\🔒PASTA TRANCADA APELO CHEFE🔒\HERMS\SLSA • SLSA specification_files\main.css
**SHA:** 997d373d3f82c7e5
**Timestamp:** 2026-08-27T15:29:48.895056
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dl.as-table > dt { grid-column-start: 1; }
- dl.as-table > dd { grid-column-start: 2; }

### Gaps
- .col-2 { margin: 10px 0; display: grid; gap: 40px; grid-template-columns: 1fr 1fr; }
- @media screen and (max-width: 599.9px) { .col-2 { grid-template-columns: 1fr; gap: 40px; } }
- @media screen and (max-width: 599.9px) { .nogap { gap: 0; } }
- .site-content { align-items: start; display: flex; flex-direction: column; gap: 20px; }

### Ouro Bruto (primeiros 5000 chars)
```
@charset "UTF-8";
/** Reset some basic elements */
body, h1, h2, h3, h4, h5, h6, p, blockquote, pre, hr, dl, dd, ol, ul, figure { margin: 0; padding: 0; }

html { min-width: 320px; }

/** Basic styling */
body { font: 400 16px/1.7 "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; color: #2a343e; background-color: #ffffff; -webkit-text-size-adjust: 100%; -webkit-font-feature-settings: 'kern' 1; -moz-font-feature-settings: 'kern' 1; -o-font-feature-settings: 'kern' 1; font-feature-settings: 'kern' 1; font-kerning: normal; display: flex; min-height: 100vh; flex-direction: column; overflow-x: hidden; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }

/** `main` element */
main { display: block; /* Default value of `display` of `main` element is 'inline' in IE 11. */ }

/** Images */
img { max-width: 100%; vertical-align: middle; }

/** Figures */
figure > img { display: block; }

figcaption { font-size: 14.4px; }

/** Lists */
li > ul, li > ol { margin-bottom: 0; }

/** Headings */
h1, h2, h3, h4 { font-family: "Prodigy"; }

h5, h6 { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; font-weight: 400; }

h1 { font-weight: 400; }

/** Links */
a:not(.table-of-contents a, .getting_started_card a, footer a, .button-mono, .cta-link, .border-b) { color: #23907E; text-decoration: none; font-weight: 600; }
a:not(.table-of-contents a, .getting_started_card a, footer a, .button-mono, .cta-link, .border-b):hover { text-decoration: underline; }
.social-media-list a:not(.table-of-contents a, .getting_started_card a, footer a, .button-mono, .cta-link, .border-b):hover { text-decoration: none; }
.social-media-list a:not(.table-of-contents a, .getting_started_card a, footer a, .button-mono, .cta-link, .border-b):hover .username { text-decoration: underline; }

/** Blockquotes */
blockquote { color: #828282; border-left: 4px solid #e8e8e8; padding-left: 14px; font-size: 18px; letter-spacing: -1px; font-style: italic; }
blockquote > :last-child { margin-bottom: 0; }

/** Code formatting */
pre, code { font-family: "IBM Plex Mono"; margin: 28px 0; }

code { padding: 4px 6px; background: #ECF8F2; color: #102B2D; border: 1px solid #B4F3C9; border-radius: 4px; }

pre { padding: 20px; overflow-x: auto; border-radius: 10px; }
pre > code { border: 0; padding-right: 0; padding-left: 0; background: none; color: #e8e8e8; }

/** Wrapper */
/** Clearfix */
/** Icons */
.svg-icon { width: 16px; height: 16px; display: inline-block; fill: #828282; padding-right: 5px; vertical-align: text-top; }

.social-media-list li + li { padding-top: 5px; }

/** Tables */
table { margin-bottom: 28px; width: 100%; text-align: left; color: #2a343e; border-collapse: collapse; border: 1px solid #e8e8e8; }
table:not(.no-alternate) tr:nth-child(even) { background-color: #F7FAF9; }
table th, table td { padding: 9.3333333333px 14px; }
table th { background-color: #f0f0f0; border: 1px solid #dedede; border-bottom-color: #c9c9c9; }
table td { border: 1px solid #e8e8e8; vertical-align: top; }

* { -webkit-box-sizing: border-box; -moz-box-sizing: border-box; -ms-box-sizing: border-box; -o-box-sizing: border-box; box-sizing: border-box; }

/** Site header */
.logo { width: 100px; min-width: 100px; z-index: 10; position: relative; }
.logo img { transition: opacity .25s ease-in-out; }
.logo img.show-logo { opacity: 1; }
.logo .logo-green { opacity: 1; }
.logo .logo-white { position: absolute; top: 0; left: 0; }
.static.menu-open .logo .logo-white { opacity: 1; }

.desktop-github-icon { color: #ffffff !important; }

.mobile-menu-button { background: none; border: 0px; width: 22px; height: 16px; position: relative; z-index: 25; padding: 0px; outline: none; user-select: none; }
.mobile-menu-button span { display: block; background-color: white; width: 100%; height: 2px; margin-bottom: 5px; transform-origin: 4px 0px; transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1) 0s, background-color 0.25s cubic-bezier(0.77, 0.2, 0.05, 1) 0s, opacity 0.55s ease 0s; }
.mobile-menu-button.active span { opacity: 1; transform: rotate(45deg) translate(0px, 1px); background-color: white; }
.mobile-menu-button.active span:nth-child(2) { opacity: 0; transform: rotate(0deg) scale(0.2, 0.2); background-color: white; }
.mobile-menu-button.active span:last-child { transform: rotate(-45deg) translate(1px, -4px); }
@media screen and (min-width: 1280px) { .mobile-menu-button { display: none; } }

.site-title { font-size: 17px; font-weight: 700; font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; color: #2a343e; letter-spacing: 0.06em; padding: 20px 0 8px 0; margin-right: 33.6px; border-bottom: 3px solid #000; }
.site-title, .site-title:visited { 
```

---

# OUTRO - main.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cargo_metadata-0.19.2\.github\workflows\main.yml
**SHA:** 5c720ff5f2f87da8
**Timestamp:** 2026-08-28T02:33:17.005886
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: rustup update --no-self-update stable && rustup default stable
- run: cargo fmt -- --check
- run: rustup update --no-self-update stable && rustup default stable
- run: cargo clippy --all-features -- -Dwarnings
- run: rustup update --no-self-update ${{ matrix.rust }} && rustup default ${{ matrix.rust }}
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
name: CI
on: [push, pull_request]

jobs:
  rustfmt:
    name: rustfmt
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Install rust
      run: rustup update --no-self-update stable && rustup default stable
    - name: Check formatting
      run: cargo fmt -- --check

  clippy:
    name: clippy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install rust
        run: rustup update --no-self-update stable && rustup default stable
      - name: Clippy check
        run: cargo clippy --all-features -- -Dwarnings

  test:
    name: Test
    runs-on: ubuntu-latest
    strategy:
      matrix:
        include:
          - rust: stable
          - rust: beta
          - rust: nightly
          - rust: 1.78.0
    steps:
    - uses: actions/checkout@v2
    - name: Install rust
      run: rustup update --no-self-update ${{ matrix.rust }} && rustup default ${{ matrix.rust }}
    - name: Run tests
      run: |
        cargo build --verbose
        cargo build --verbose --no-default-features
        cargo test --verbose
        cargo test --verbose --no-default-features
        cargo test --verbose --all-features


```

---

# OUTRO - main.yml
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cssparser-0.36.0\.github\workflows\main.yml
**SHA:** 1cdb64fe881ec0d0
**Timestamp:** 2026-08-28T02:33:38.168882
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: cargo fmt --check && cargo clippy -- -Dwarnings
- run: cargo build ${{ matrix.features }}
- run: cargo doc ${{ matrix.features }}
- run: cargo test ${{ matrix.features }}
- run: cargo build
- run: cargo build
- run: cargo test
- run: cargo miri test --features skip_long_tests ${{ matrix.features }}
- run: exit 0
- run: exit 1

### Ouro Bruto (primeiros 5000 chars)
```
name: CI

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:
  merge_group:
    types: [checks_requested]

jobs:
  linux-ci:
    name: Linux
    runs-on: ubuntu-latest
    strategy:
      matrix:
        toolchain:
          - nightly
          - beta
          - stable
          - 1.68.0
        features:
          -
          - --features dummy_match_byte
          - --features malloc_size_of
        include:
          - toolchain: nightly
            features: --features bench
          - toolchain: nightly
            features: --features bench,dummy_match_byte
    steps:
      - uses: actions/checkout@v2

      - name: Install toolchain
        uses: actions-rs/toolchain@v1
        with:
          profile: minimal
          toolchain: ${{ matrix.toolchain }}
          override: true
          components: rustfmt, clippy, ${{ matrix.toolchain == 'nightly' && 'miri,rust-src' || '' }}

      - name: Cargo format & lint
        run: cargo fmt --check && cargo clippy -- -Dwarnings

      - name: Cargo build
        run: cargo build ${{ matrix.features }}

      - name: Cargo doc
        run: cargo doc ${{ matrix.features }}

      - name: Cargo test
        run: cargo test ${{ matrix.features }}

      - name: macros build
        run: cargo build
        working-directory: macros

      - name: Color build
        run: cargo build
        working-directory: color

      - name: Color test
        run: cargo test
        working-directory: color

      - name: Cargo miri test
        if: "matrix.toolchain == 'nightly'"
        run: cargo miri test --features skip_long_tests ${{ matrix.features }}

  build_result:
    name: Result
    runs-on: ubuntu-latest
    needs:
      - "linux-ci"

    steps:
      - name: Mark the job as successful
        run: exit 0
        if: success()
      - name: Mark the job as unsuccessful
        run: exit 1
        if: "!success()"

```

---

# OUTRO - main.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\winnow-0.7.15\examples\ndjson\main.rs
**SHA:** 597fce15ca0e0c76
**Timestamp:** 2026-08-28T02:37:38.853045
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let start = input.checkpoint();

### Ouro Bruto (primeiros 5000 chars)
```
mod parser;

use std::io::Read;

use winnow::error::ContextError;
use winnow::error::ErrMode;
use winnow::error::Needed;
use winnow::prelude::*;
use winnow::stream::Offset;

fn main() -> Result<(), lexopt::Error> {
    let args = Args::parse()?;
    let input = args.input.ok_or_else(|| lexopt::Error::MissingValue {
        option: Some("<PATH>".to_owned()),
    })?;

    let mut file = std::fs::File::open(input).map_err(to_lexopt)?;

    // Intentionally starting with a small buffer to make it easier to show `Incomplete` handling
    let buffer_size = 10;
    let min_buffer_growth = 100;
    let buffer_growth_factor = 2;
    let mut buffer = circular::Buffer::with_capacity(buffer_size);
    loop {
        let read = file.read(buffer.space()).map_err(to_lexopt)?;
        eprintln!("read {read}");
        if read == 0 {
            // Should be EOF since we always make sure there is `available_space`
            assert_ne!(buffer.available_space(), 0);
            assert_eq!(
                buffer.available_data(),
                0,
                "leftover data: {}",
                String::from_utf8_lossy(buffer.data())
            );
            break;
        }
        buffer.fill(read);

        loop {
            let mut input =
                parser::Stream::new(std::str::from_utf8(buffer.data()).map_err(to_lexopt)?);
            let start = input.checkpoint();
            match parser::ndjson::<ContextError>.parse_next(&mut input) {
                Ok(value) => {
                    println!("{value:?}");
                    println!();
                    // Tell the buffer how much we read
                    let consumed = input.offset_from(&start);
                    buffer.consume(consumed);
                }
                Err(ErrMode::Backtrack(e)) | Err(ErrMode::Cut(e)) => {
                    return Err(fmt_lexopt(e.to_string()));
                }
                Err(ErrMode::Incomplete(Needed::Size(size))) => {
                    // Without the format telling us how much space is required, we really should
                    // treat this the same as `Unknown` but are doing this to demonstrate how to
                    // handle `Size`.
                    //
                    // Even when the format has a header to tell us `Size`, we could hit incidental
                    // `Size(1)`s, so make sure we buffer more space than that to avoid reading
                    // one byte at a time
                    let head_room = size.get().max(min_buffer_growth);
                    let new_capacity = buffer.available_data() + head_room;
                    eprintln!("growing buffer to {new_capacity}");
                    buffer.grow(new_capacity);
                    if buffer.available_space() < head_room {
                        eprintln!("buffer shift");
                        buffer.shift();
                    }
                    break;
                }
                Err(ErrMode::Incomplete(Needed::Unknown)) => {
                    let new_capacity = buffer_growth_factor * buffer.capacity();
                    eprintln!("growing buffer to {new_capacity}");
                    buffer.grow(new_capacity);
                    break;
                }
            }
        }
    }

    Ok(())
}

#[derive(Default)]
struct Args {
    input: Option<std::path::PathBuf>,
}

impl Args {
    fn parse() -> Result<Self, lexopt::Error> {
        use lexopt::prelude::*;

        let mut res = Args::default();

        let mut args = lexopt::Parser::from_env();
        while let Some(arg) = args.next()? {
            match arg {
                Value(input) => {
                    res.input = Some(input.into());
                }
                _ => return Err(arg.unexpected()),
            }
        }
        Ok(res)
    }
}

fn to_lexopt(e: impl std::error::Error + Send + Sync + 'static) -> lexopt::Error {
    lexopt::Error::Custom(Box::new(e))
}

fn fmt_lexopt(e: String) -> lexopt::Error {
    lexopt::Error::Custom(e.into())
}

```