# OUTRO - command_helpers.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\cc-1.4.2\src\command_helpers.rs
**SHA:** 650c9682edc3d773
**Timestamp:** 2026-08-28T02:33:21.013657
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- format!("command `{:?}` failed to start: {e}", cmd.0),

### Ouro Bruto (primeiros 5000 chars)
```
//! Miscellaneous helpers for running commands

use std::{
    borrow::Cow,
    collections::hash_map,
    ffi::OsString,
    fmt::Display,
    fs,
    hash::Hasher,
    io::{self, Read, Write},
    path::Path,
    process::{Child, ChildStderr, Command, Output, Stdio},
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc,
    },
};

use crate::{utilities::cargo_env_var_os, Error, ErrorKind, Object};

#[derive(Clone, Debug)]
pub(crate) struct CargoOutput {
    pub(crate) metadata: bool,
    pub(crate) warnings: bool,
    pub(crate) debug: bool,
    pub(crate) output: OutputKind,
    checked_dbg_var: Arc<AtomicBool>,
}

/// Different strategies for handling compiler output (to stdout)
#[derive(Clone, Debug)]
pub(crate) enum OutputKind {
    /// Forward the output to this process' stdout ([`Stdio::inherit()`])
    Forward,
    /// Discard the output ([`Stdio::null()`])
    Discard,
    /// Capture the result ([`Stdio::piped()`])
    Capture,
}

impl CargoOutput {
    pub(crate) fn new() -> Self {
        #[allow(clippy::disallowed_methods)]
        Self {
            metadata: true,
            warnings: true,
            output: OutputKind::Forward,
            debug: match std::env::var_os("CC_ENABLE_DEBUG_OUTPUT") {
                Some(v) => v != "0" && v != "false" && !v.is_empty(),
                None => false,
            },
            checked_dbg_var: Arc::new(AtomicBool::new(false)),
        }
    }

    pub(crate) fn print_metadata(&self, s: &dyn Display) {
        if self.metadata {
            println!("{s}");
        }
    }

    pub(crate) fn print_warning(&self, arg: &dyn Display) {
        if self.warnings {
            println!("cargo:warning={arg}");
        }
    }

    pub(crate) fn print_debug(&self, arg: &dyn Display) {
        if self.metadata
            && self
                .checked_dbg_var
                .compare_exchange(false, true, Ordering::Relaxed, Ordering::Relaxed)
                .is_ok()
        {
            println!("cargo:rerun-if-env-changed=CC_ENABLE_DEBUG_OUTPUT");
        }
        if self.debug {
            println!("{arg}");
        }
    }

    fn stdio_for_warnings(&self) -> Stdio {
        if self.warnings {
            Stdio::piped()
        } else {
            Stdio::null()
        }
    }

    fn stdio_for_output(&self) -> Stdio {
        match self.output {
            OutputKind::Capture => Stdio::piped(),
            OutputKind::Forward => Stdio::inherit(),
            OutputKind::Discard => Stdio::null(),
        }
    }
}

pub(crate) struct StderrForwarder {
    inner: Option<(ChildStderr, Vec<u8>)>,
    #[cfg(feature = "parallel")]
    is_non_blocking: bool,
    #[cfg(feature = "parallel")]
    bytes_available_failed: bool,
    /// number of bytes buffered in inner
    bytes_buffered: usize,
}

const MIN_BUFFER_CAPACITY: usize = 100;

impl StderrForwarder {
    pub(crate) fn new(child: &mut Child) -> Self {
        Self {
            inner: child
                .stderr
                .take()
                .map(|stderr| (stderr, Vec::with_capacity(MIN_BUFFER_CAPACITY))),
            bytes_buffered: 0,
            #[cfg(feature = "parallel")]
            is_non_blocking: false,
            #[cfg(feature = "parallel")]
            bytes_available_failed: false,
        }
    }

    pub(crate) fn forward_available(&mut self) -> bool {
        if let Some((stderr, buffer)) = self.inner.as_mut() {
            loop {
                // For non-blocking we check to see if there is data available, so we should try to
                // read at least that much. For blocking, always read at least the minimum amount.
                #[cfg(not(feature = "parallel"))]
                let to_reserve = MIN_BUFFER_CAPACITY;
                #[cfg(feature = "parallel")]
                let to_reserve = if self.is_non_blocking && !self.bytes_available_failed {
                    match crate::parallel::stderr::bytes_available(stderr) {
                        #[cfg(windows)]
                        Ok(0) => break false,
                        #[cfg(unix)]
                        Ok(0) => {
                            // On Unix, depending on the implementation, we may sometimes get 0 in a
                            // loop (either there is data available or the pipe is broken), so
                            // continue with the non-blocking read anyway.
                            MIN_BUFFER_CAPACITY
                        }
                        #[cfg(windows)]
                        Err(_) => {
                            // On Windows, if we get an error then the pipe is broken, so flush
                            // the buffer and bail.
                            if !buffer.is_empty() {
                                write_warning(&buffer[..]);
                            }
                            self.inner = None;
                            break true;
                        }
                        #[cfg(unix)]
                 
```