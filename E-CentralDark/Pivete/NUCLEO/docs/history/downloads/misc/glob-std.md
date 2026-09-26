# OUTRO - glob-std.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\glob-0.3.4\tests\glob-std.rs
**SHA:** 21241c6e2ac8385f
**Timestamp:** 2026-08-28T02:34:12.003506
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- fn glob_vec(pattern: &str) -> Vec<PathBuf> {
- fn glob_with_vec(pattern: &str, options: glob::MatchOptions) -> Vec<PathBuf> {

### Ouro Bruto (primeiros 5000 chars)
```
// Copyright 2013-2014 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// ignore-windows TempDir may cause IoError on windows: #10462

#![cfg_attr(test, deny(warnings))]

use glob::{glob, glob_with};
use std::env;
use std::fs;
use std::path::PathBuf;

#[test]
fn main() {
    fn mk_file(path: &str, directory: bool) {
        if directory {
            fs::create_dir(path).unwrap();
        } else {
            fs::File::create(path).unwrap();
        }
    }

    fn mk_symlink_file(original: &str, link: &str) {
        #[cfg(unix)]
        {
            use std::os::unix::fs::symlink;
            symlink(original, link).unwrap();
        }
        #[cfg(windows)]
        {
            use std::os::windows::fs::symlink_file;
            symlink_file(original, link).unwrap();
        }
    }

    fn mk_symlink_dir(original: &str, link: &str) {
        #[cfg(unix)]
        {
            use std::os::unix::fs::symlink;
            symlink(original, link).unwrap();
        }
        #[cfg(windows)]
        {
            use std::os::windows::fs::symlink_dir;
            symlink_dir(original, link).unwrap();
        }
    }

    fn glob_vec(pattern: &str) -> Vec<PathBuf> {
        glob(pattern).unwrap().map(|r| r.unwrap()).collect()
    }

    fn glob_with_vec(pattern: &str, options: glob::MatchOptions) -> Vec<PathBuf> {
        glob_with(pattern, options)
            .unwrap()
            .map(|r| r.unwrap())
            .collect()
    }

    let root = tempfile::tempdir();
    let root = root.expect("Should have created a temp directory");
    assert!(env::set_current_dir(root.path()).is_ok());

    mk_file("aaa", true);
    mk_file("aaa/apple", true);
    mk_file("aaa/orange", true);
    mk_file("aaa/tomato", true);
    mk_file("aaa/tomato/tomato.txt", false);
    mk_file("aaa/tomato/tomoto.txt", false);
    mk_file("bbb", true);
    mk_file("bbb/specials", true);
    mk_file("bbb/specials/!", false);
    // a valid symlink
    mk_symlink_file("aaa/apple", "aaa/green_apple");
    // a broken symlink
    mk_symlink_file("aaa/setsuna", "aaa/kazusa");

    // windows does not allow `*` or `?` characters to exist in filenames
    if env::consts::FAMILY != "windows" {
        mk_file("bbb/specials/*", false);
        mk_file("bbb/specials/?", false);
    }

    mk_file("bbb/specials/[", false);
    mk_file("bbb/specials/]", false);
    mk_file("ccc", true);
    mk_file("xyz", true);
    mk_file("xyz/x", false);
    mk_file("xyz/y", false);
    mk_file("xyz/z", false);

    mk_file("r", true);
    mk_file("r/current_dir.md", false);
    mk_file("r/one", true);
    mk_file("r/one/a.md", false);
    mk_file("r/one/another", true);
    mk_file("r/one/another/a.md", false);
    mk_file("r/one/another/deep", true);
    mk_file("r/one/another/deep/spelunking.md", false);
    mk_file("r/another", true);
    mk_file("r/another/a.md", false);
    mk_file("r/two", true);
    mk_file("r/two/b.md", false);
    mk_file("r/three", true);
    mk_file("r/three/c.md", false);

    mk_file("dirsym", true);
    mk_symlink_dir(root.path().join("r").to_str().unwrap(), "dirsym/link");

    assert_eq!(
        glob_vec("dirsym/**/*.md"),
        vec!(
            PathBuf::from("dirsym/link/another/a.md"),
            PathBuf::from("dirsym/link/current_dir.md"),
            PathBuf::from("dirsym/link/one/a.md"),
            PathBuf::from("dirsym/link/one/another/a.md"),
            PathBuf::from("dirsym/link/one/another/deep/spelunking.md"),
            PathBuf::from("dirsym/link/three/c.md"),
            PathBuf::from("dirsym/link/two/b.md")
        )
    );

    // all recursive entities
    assert_eq!(
        glob_vec("r/**"),
        vec!(
            PathBuf::from("r/another"),
            PathBuf::from("r/one"),
            PathBuf::from("r/one/another"),
            PathBuf::from("r/one/another/deep"),
            PathBuf::from("r/three"),
            PathBuf::from("r/two")
        )
    );

    // std-canonicalized windows verbatim disk paths should work
    if env::consts::FAMILY == "windows" {
        let r_verbatim = PathBuf::from("r").canonicalize().unwrap();
        assert_eq!(
            glob_vec(&format!("{}\\**", r_verbatim.display().to_string()))
                .into_iter()
                .map(|p| p.strip_prefix(&r_verbatim).unwrap().to_owned())
                .collect::<Vec<_>>(),
            vec!(
                PathBuf::from("another"),
                PathBuf::from("one"),
                PathBuf::from("one\\another"),
                PathBuf::from("one\\another\\deep"),
                PathBuf::from("three"),
          
```